/* studio.js — the journal studio.
 *
 * Refresh takes the freshest trend off the queue, has Claude write it in the
 * house voice, checks the draft against the brand book's own rules, and shows
 * it as it will look on the site.
 *
 * The one hard rule in here: source links come from the trend record, never
 * from the writing. Claude is told not to produce URLs and any it produces
 * anyway are stripped before the post is rendered.
 */

import { TRENDS, RESEARCHED_ON } from './trends.js';
import { buildPrompt, houseCheck, bodyWordCount, bodyText, stripLinks, words } from './voice.js';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* The opening state. Written by hand in the house voice so the studio shows
 * what it produces before anyone clicks anything — and marked as an example,
 * because it is one. */
const EXAMPLE = {
  trendId: 'tcs-2pc',
  example: true,
  take: 0,
  headline: 'India just cut the tax on your parents’ trip from 20% to 2%.',
  wavy: '20% to 2%',
  subline: 'nobody sent a press release to the people it helps',
  body: [
    { type: 'p', text: 'From 1 April 2026, the tax collected at source on an overseas tour package is a flat 2%. It used to be 5% up to Rs 10 lakh and 20% above it.' },
    { type: 'p', text: 'On a Rs 10 lakh booking for the family, that is Rs 20,000 leaving your account at booking instead of Rs 2 lakh.' },
    { type: 'bullets', items: [
      'It applies from the first rupee. There is no threshold to stay under any more.',
      'TCS was never a cost. It is credited against your income tax.',
      'But it left the bank at booking and came back a year later, and that is the part families actually felt.'
    ] },
    { type: 'p', text: 'We are mentioning it because the 20% was the ugliest line on a family booking, and most of the people it was hurting still do not know it has gone.' }
  ]
};

const state = {
  trends: TRENDS.slice(),
  post: EXAMPLE,
  tab: 'studio',
  used: {},          /* trendId -> true */
  library: [],
  takeOf: {},        /* trendId -> how many takes so far */
  db: null,
  sampler: null,
  busy: false
};

/* ------------------------------------------------------------- storage */

async function connectDb() {
  try { state.db = await window.claude?.use?.('db') ?? null; } catch { state.db = null; }
  if (!state.db) return;
  try {
    /* A scheduled job can add fresh trends to the pool collection; they merge
     * in front of the ones that shipped with the page. */
    const pool = await state.db.collection('pool').get();
    const extra = [];
    for (const d of (pool?.docs || [])) {
      if (!d?.exists) continue;
      const t = d.data();
      if (t && t.id && t.title && Array.isArray(t.sources)) extra.push(t);
    }
    if (extra.length) {
      const seen = new Set(extra.map(t => t.id));
      state.trends = [...extra, ...TRENDS.filter(t => !seen.has(t.id))];
    }

    const posts = await state.db.collection('posts').get();
    state.library = [];
    for (const d of (posts?.docs || [])) {
      if (!d?.exists) continue;
      const p = d.data();
      if (p && p.headline) state.library.push({ ...p, id: p.id || d.id });
    }
    state.library.sort((a, b) => String(b.savedAt || '').localeCompare(String(a.savedAt || '')));

    const st = await state.db.doc('state/studio').get();
    const s = st?.exists ? st.data() : null;
    if (s?.used) state.used = s.used;
    if (s?.takeOf) state.takeOf = s.takeOf;
    render();
  } catch { /* the studio works without storage, it just forgets */ }
}

let saveTimer;
function persistState() {
  if (!state.db) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try { await state.db.doc('state/studio').set({ used: state.used, takeOf: state.takeOf }); }
    catch { /* nothing to tell the user — it is bookkeeping */ }
  }, 500);
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3000);
}

async function copy(text, label) {
  try { await navigator.clipboard.writeText(text); toast(label); }
  catch { toast('Could not copy — select the text and copy it manually.'); }
}

/* --------------------------------------------------------------- render */

const trendById = id => state.trends.find(t => t.id === id);

/* Only ever renders http(s) links that came out of the trend record. */
function sourceLinks(trend) {
  return (trend?.sources || []).filter(s => /^https:\/\//i.test(s.url || ''));
}

function renderPost() {
  const p = state.post;
  const trend = trendById(p.trendId);
  const srcs = sourceLinks(trend);

  /* The wavy underline goes on one phrase, and only if that phrase is really
   * in the headline — otherwise the headline renders plain rather than wrong. */
  let head = esc(p.headline);
  if (p.wavy && p.headline.includes(p.wavy)) {
    const i = p.headline.indexOf(p.wavy);
    head = esc(p.headline.slice(0, i))
      + '<span class="wavy">' + esc(p.wavy) + '</span>'
      + esc(p.headline.slice(i + p.wavy.length));
  }

  const body = (p.body || []).map(b => b.type === 'bullets'
    ? '<ul>' + (b.items || []).map(i => `<li><span>${esc(stripLinks(i))}</span></li>`).join('') + '</ul>'
    : `<p>${esc(stripLinks(b.text))}</p>`).join('');

  $('#stage').innerHTML = `
    <div class="stage-label">
      <h2>How it will look on the site</h2>
      <span class="hand">public register — wobbly edges, hard shadow, the wavy underline</span>
      ${p.example ? '<span class="placeholder-flag" style="margin-left:auto">example post, written by hand</span>' : ''}
    </div>
    <article class="post">
      <h1 class="post-head">${head}</h1>
      <p class="post-sub">${esc(p.subline)}</p>
      <div class="post-body">${body}</div>
      <hr class="post-rule">
      <div class="post-sources">
        <span class="lab">read it at the source</span>
        ${srcs.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(s.label)}</span></a>`).join('')}
      </div>
      <p class="post-foot">${trend ? esc(trend.category) + ' · ' : ''}The Trip Keeper journal${trend?.date ? ' · ' + esc(trend.date) : ''}</p>
    </article>`;
}

function renderRail() {
  const p = state.post;
  const trend = trendById(p.trendId);
  const check = houseCheck(p);
  const count = check.count;
  const over = count >= 200;
  const failed = check.checks.filter(c => !c.pass);

  $('#rail').innerHTML = `
    <div class="card2 ${over ? '' : 'card2-y'}" style="margin-bottom:14px">
      <h3>${count} words</h3>
      <p class="hand" style="${over ? '' : 'color:var(--tk-ink)'}">${over ? 'over the limit — tighten it' : 'the limit is 200'}</p>
      <progress class="meter ${over ? 'over' : ''}" style="margin-top:9px" max="200" value="${Math.min(count, 200)}"></progress>
    </div>

    <div class="card2" style="margin-bottom:14px">
      <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
        <h3>House rules</h3>
        <span class="pill ${failed.length ? 'pill-bad' : 'pill-good'}" style="margin-left:auto">${check.passed} of ${check.total}</span>
      </div>
      <p class="hand" style="margin:2px 0 10px">the brand book, checked automatically</p>
      <ul class="rules">
        ${check.checks.map(c => `<li class="${c.pass ? 'ok' : 'no'}">
          <span class="g">${c.pass ? '✓' : '—'}</span>
          <span>${esc(c.label)}${c.detail && !c.pass ? `<small>${esc(c.detail)}</small>` : ''}</span>
        </li>`).join('')}
      </ul>
    </div>

    <div class="card2" style="margin-bottom:14px">
      <h3>Sources attached</h3>
      <p class="hand" style="margin:2px 0 10px">these come from the record, not the writing</p>
      ${sourceLinks(trend).map(s => `<div style="font-size:.86rem;margin-bottom:7px">
        <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>
        <div style="color:var(--ink-soft);font-size:.78rem;word-break:break-all">${esc(s.url)}</div></div>`).join('')
        || '<p style="font-size:.86rem;color:var(--ink-soft)">No trend attached to this draft.</p>'}
    </div>

    <div class="card2">
      <h3>Take it away</h3>
      <p class="hand" style="margin:2px 0 10px">paste straight into the journal</p>
      <div style="display:grid;gap:8px">
        <button class="btn btn-sm" id="copy-md">Copy as Markdown</button>
        <button class="btn btn-sm" id="copy-html">Copy as HTML</button>
        <button class="btn btn-sm" id="copy-plain">Copy as plain text</button>
        <button class="btn btn-sm btn-yellow" id="save-post"${p.example ? ' disabled' : ''}>${p.example ? 'Refresh first, then save' : 'Save to the library'}</button>
      </div>
    </div>`;
}

function renderQueue() {
  const rows = state.trends.map(t => {
    const used = !!state.used[t.id];
    const active = state.post.trendId === t.id;
    return `<article class="qitem ${active ? 'active' : used ? 'used' : ''}">
      <div class="qitem-top">
        <h3>${esc(t.title)}</h3>
        <span class="chip">${esc(t.category)}</span>
        ${active ? '<span class="pill pill-blue">on the stage</span>'
          : used ? '<span class="pill">written</span>' : '<span class="pill pill-y">unwritten</span>'}
      </div>
      <p class="hand" style="${active ? 'color:var(--tk-ink)' : ''}">${esc(t.freshness)}</p>
      <ul class="qfacts">${t.facts.slice(0, 3).map(f => `<li><span>${esc(f)}</span></li>`).join('')}</ul>
      <p style="font-size:.89rem"><b>Our angle:</b> ${esc(t.angle)}</p>
      <div class="qsrc">${sourceLinks(t).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`).join('')}</div>
      <div><button class="btn btn-sm btn-primary" data-write="${esc(t.id)}">Write this one</button></div>
    </article>`;
  }).join('');

  $('#pane-queue').innerHTML = `
    <div class="card2" style="margin-bottom:18px">
      <h2>${state.trends.length} trends in the queue</h2>
      <p class="hand">researched ${esc(RESEARCHED_ON)} — every link below was checked</p>
      <p style="margin-top:9px;font-size:.94rem">Refresh takes the freshest unwritten trend. Pick one here to jump the queue. A published page cannot search the web itself, so this queue is topped up from outside — the dates tell you how fresh it is.</p>
    </div>
    <div class="queue">${rows}</div>`;
}

function renderLibrary() {
  if (!state.library.length) {
    $('#pane-library').innerHTML = `<div class="empty">
      <h2>Nothing saved yet</h2>
      <p class="hand">write one, then hit save</p>
      <p style="margin-top:10px">Saved posts keep their word count, their house-rules result and their source links.</p>
    </div>`;
    return;
  }
  $('#pane-library').innerHTML = `
    <div class="card2" style="margin-bottom:18px">
      <h2>${state.library.length} saved post${state.library.length === 1 ? '' : 's'}</h2>
      <p class="hand">the ones you kept</p>
    </div>
    <div class="queue">${state.library.map(p => {
      const c = houseCheck(p);
      return `<article class="qitem">
        <div class="qitem-top">
          <h3>${esc(p.headline)}</h3>
          <span class="chip">${bodyWordCount(p.body)} words</span>
          <span class="pill ${c.passed === c.total ? 'pill-good' : 'pill-bad'}">${c.passed}/${c.total}</span>
        </div>
        <p class="hand">${esc(p.subline)}</p>
        <p style="font-size:.89rem">${esc(bodyText(p.body).slice(0, 180))}${bodyText(p.body).length > 180 ? '…' : ''}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-sm" data-open="${esc(p.id)}">Open on the stage</button>
          <button class="btn btn-sm btn-quiet" data-del="${esc(p.id)}">Delete</button>
        </div>
      </article>`;
    }).join('')}</div>`;
}

function render() {
  renderPost();
  renderRail();
  if (state.tab === 'queue') renderQueue();
  if (state.tab === 'library') renderLibrary();
  $('#tab-queue .count').textContent = state.trends.filter(t => !state.used[t.id]).length;
  $('#tab-library .count').textContent = state.library.length;
  $$('.tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === state.tab)));
  $$('.pane').forEach(p => p.classList.toggle('on', p.id === 'pane-' + state.tab));

  const trend = trendById(state.post.trendId);
  $('#now-on').innerHTML = trend
    ? `<span class="chip">${esc(trend.category)}</span> <span style="font-size:.88rem">${esc(trend.title)}</span>`
    : '';
}

/* -------------------------------------------------------------- writing */

function setStatus(msg, working) {
  const el = $('#status');
  el.hidden = !msg;
  el.className = 'status' + (working ? ' working' : '');
  el.innerHTML = msg ? `<span class="dot"></span><span>${esc(msg)}</span>` : '';
}

function nextTrend() {
  const unwritten = state.trends.filter(t => !state.used[t.id]);
  const pick = (unwritten.length ? unwritten : state.trends)
    .slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  return pick[0] || state.trends[0];
}

function sane(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const body = (Array.isArray(raw.body) ? raw.body : []).map(b => {
    if (b && b.type === 'bullets' && Array.isArray(b.items)) {
      const items = b.items.map(i => stripLinks(String(i || ''))).filter(Boolean).slice(0, 6);
      return items.length ? { type: 'bullets', items } : null;
    }
    const text = stripLinks(String(b?.text || ''));
    return text ? { type: 'p', text } : null;
  }).filter(Boolean);
  if (!body.length) return null;
  const headline = stripLinks(String(raw.headline || '')).slice(0, 200);
  if (!headline) return null;
  return {
    headline,
    wavy: String(raw.wavy || '').slice(0, 120),
    subline: stripLinks(String(raw.subline || '')).slice(0, 160),
    body
  };
}

async function write(trend, opts = {}) {
  if (state.busy) return;
  if (!state.sampler) {
    toast('Claude is not available on this page, so it cannot write a new post. The example and the queue still work.');
    return;
  }
  state.busy = true;
  $$('[data-write], #refresh, #another').forEach(b => { b.disabled = true; });

  const take = (state.takeOf[trend.id] || 0) + 1;
  setStatus('Writing about ' + trend.title.toLowerCase().slice(0, 60) + '. Claude thinks for a bit before it writes.', true);

  try {
    let raw = await state.sampler.json(buildPrompt(trend, { ...opts, take }), {
      modelTier: 'default',
      cache: false,
      onText: () => setStatus('Drafting.', true)
    });
    let post = sane(raw);
    if (!post) throw new Error('The draft came back in a shape we could not use. Try again.');

    /* Under 200 words is a hard constraint, so if the draft runs over we ask
     * once for a tighter version. Once — never in a loop. */
    let count = bodyWordCount(post.body);
    if (count >= 200) {
      setStatus(count + ' words — asking for a tighter cut.', true);
      try {
        const t = await state.sampler.json(
          buildPrompt(trend, { tighten: { ...post, count } }),
          { modelTier: 'default', cache: false });
        const tightened = sane(t);
        if (tightened && bodyWordCount(tightened.body) < count) post = tightened;
      } catch { /* keep the first draft and flag it */ }
      count = bodyWordCount(post.body);
    }

    state.post = { ...post, trendId: trend.id, take, example: false, writtenAt: new Date().toISOString() };
    state.used[trend.id] = true;
    state.takeOf[trend.id] = take;
    persistState();
    setStatus('', false);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast(count >= 200
      ? 'Written, but it is still ' + count + ' words. Tighten it or ask for another take.'
      : 'Written. ' + count + ' words, and the house rules are on the right.');
  } catch (err) {
    const code = err && err.code;
    setStatus(
      code === 'not_granted' ? 'Claude was not allowed to run, so nothing was written.'
      : code === 'rate_limited' ? 'Too many requests at once. Wait a minute and try again.'
      : code === 'resource_exhausted' ? 'That used up the quota for now. Try again later.'
      : code === 'invalid_json' ? 'The draft came back unreadable. Try again.'
      : (err?.message || 'Could not write that one.'), false);
  } finally {
    state.busy = false;
    $$('[data-write], #refresh, #another').forEach(b => { b.disabled = false; });
    render();
  }
}

/* ------------------------------------------------------------- exports */

function asMarkdown(p) {
  const trend = trendById(p.trendId);
  const lines = ['# ' + p.headline, '', '*' + p.subline + '*', ''];
  for (const b of p.body) {
    if (b.type === 'bullets') { b.items.forEach(i => lines.push('- ' + i)); lines.push(''); }
    else { lines.push(b.text, ''); }
  }
  lines.push('**Read it at the source**', '');
  sourceLinks(trend).forEach(s => lines.push('- [' + s.label + '](' + s.url + ')'));
  return lines.join('\n').trim() + '\n';
}

function asHtml(p) {
  const trend = trendById(p.trendId);
  const body = p.body.map(b => b.type === 'bullets'
    ? '<ul>\n' + b.items.map(i => '  <li>' + esc(i) + '</li>').join('\n') + '\n</ul>'
    : '<p>' + esc(b.text) + '</p>').join('\n');
  let head = esc(p.headline);
  if (p.wavy && p.headline.includes(p.wavy)) {
    const i = p.headline.indexOf(p.wavy);
    head = esc(p.headline.slice(0, i)) + '<span class="tk-wavy">' + esc(p.wavy) + '</span>' + esc(p.headline.slice(i + p.wavy.length));
  }
  return `<article class="tk-post">
  <h1 class="tk-head">${head}</h1>
  <p class="tk-sub">${esc(p.subline)}</p>
${body}
  <hr class="tk-rule">
  <p class="tk-srclabel">read it at the source</p>
  <ul class="tk-sources">
${sourceLinks(trend).map(s => `    <li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a></li>`).join('\n')}
  </ul>
</article>
`;
}

function asPlain(p) {
  const trend = trendById(p.trendId);
  const out = [p.headline, p.subline, ''];
  for (const b of p.body) {
    if (b.type === 'bullets') { b.items.forEach(i => out.push('- ' + i)); out.push(''); }
    else { out.push(b.text, ''); }
  }
  out.push('Read it at the source:');
  sourceLinks(trend).forEach(s => out.push(s.label + ' - ' + s.url));
  return out.join('\n').trim() + '\n';
}

/* -------------------------------------------------------------- events */

document.addEventListener('click', async e => {
  const t = e.target;

  const tab = t.closest('.tab');
  if (tab) { state.tab = tab.dataset.tab; render(); return; }

  if (t.closest('#refresh')) { write(nextTrend(), { angleHint: $('#hint').value.trim() }); return; }
  if (t.closest('#another')) {
    const trend = trendById(state.post.trendId) || nextTrend();
    write(trend, { angleHint: $('#hint').value.trim() });
    return;
  }

  const w = t.closest('[data-write]');
  if (w) {
    const trend = trendById(w.dataset.write);
    if (trend) { state.tab = 'studio'; render(); write(trend, { angleHint: $('#hint').value.trim() }); }
    return;
  }

  if (t.closest('#copy-md'))    { copy(asMarkdown(state.post), 'Markdown copied.'); return; }
  if (t.closest('#copy-html'))  { copy(asHtml(state.post), 'HTML copied.'); return; }
  if (t.closest('#copy-plain')) { copy(asPlain(state.post), 'Plain text copied.'); return; }

  if (t.closest('#save-post')) {
    const p = state.post;
    if (p.example) { toast('That is the example. Refresh to write a real one first.'); return; }
    const id = 'p' + Date.now().toString(36);
    const doc = { ...p, id, savedAt: new Date().toISOString() };
    state.library.unshift(doc);
    render();
    if (state.db) {
      try { await state.db.doc('posts/' + id).set(doc); toast('Saved to the library.'); }
      catch { toast('Saved on screen, but storage would not take it.'); }
    } else toast('Saved for this visit only — storage is not available here.');
    return;
  }

  const open = t.closest('[data-open]');
  if (open) {
    const p = state.library.find(x => x.id === open.dataset.open);
    if (p) { state.post = p; state.tab = 'studio'; render(); window.scrollTo(0, 0); }
    return;
  }

  const del = t.closest('[data-del]');
  if (del) {
    const id = del.dataset.del;
    state.library = state.library.filter(x => x.id !== id);
    render();
    if (state.db) { try { await state.db.doc('posts/' + id).delete(); } catch { /* gone from the list either way */ } }
    toast('Deleted.');
    return;
  }
});

/* Refresh on the keyboard, because this is a tool you sit in front of. */
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'r' && e.shiftKey) {
    e.preventDefault(); write(nextTrend(), { angleHint: $('#hint').value.trim() });
  }
});

/* ---------------------------------------------------------------- boot */

render();

(async () => {
  try { state.sampler = await window.claude?.use?.('sample') ?? null; } catch { state.sampler = null; }
  $('#claude-note').textContent = state.sampler
    ? 'Refresh writes a new post from the top of the queue, in the house voice, and checks it against the brand book.'
    : 'Claude is not available on this page, so Refresh cannot write. The example post, the trend queue and the copy buttons all still work.';
  $('#refresh').disabled = !state.sampler;
  $('#another').disabled = !state.sampler;
})();
connectDb();
