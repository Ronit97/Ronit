/* app.js — the portal. */

import { CATEGORIES, BLOCKS, BRIEF, BRIEF_STATUS, HOTEL_CRITERIA, KNOCKOUTS, guestRatingScore } from './rubric.js';
import { scoreAll, questions, negotiation, verdict, round1, inr, usd, pct } from './engine.js';
import { SEED_ASSESSMENTS, AWAITING, SHARED } from './seed.js';
import { readQuote, assess } from './ingest.js';

/* --------------------------------------------------------------- state */

const state = {
  shared: { ...SHARED },
  assessments: SEED_ASSESSMENTS.map(a => JSON.parse(JSON.stringify(a))),
  awaiting: AWAITING,
  results: [],
  currentId: SEED_ASSESSMENTS[1].id,     /* opens on the leader */
  tab: 'scores',
  open: new Set(),
  qStatus: {},
  db: null,
  sampler: null
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const signed = v => v === null || v === undefined ? '—' : (v > 0 ? '+' : '') + pct(v);
const fmt = v => v === null || v === undefined ? '—' : (Math.round(v * 10) / 10).toFixed(1);
const toneClass = t => t === 'good' ? 't-good' : t === 'warn' ? 't-warn' : t === 'bad' ? 't-bad' : '';
const pillClass = t => t === 'good' ? 'pill-good' : t === 'warn' ? 'pill-warn' : t === 'bad' ? 'pill-bad' : 'pill-none';

function recompute() {
  state.results = scoreAll(state.assessments, state.shared);
}
const current = () => state.results.find(r => r.assessment.id === state.currentId) || state.results[0];

/* ------------------------------------------------------------ storage */

async function connectDb() {
  try { state.db = await window.claude?.use?.('db') ?? null; } catch { state.db = null; }
  if (!state.db) return;
  try {
    const snap = await state.db.collection('assessments').get();
    const docs = (snap?.docs || snap || []).map(d => (typeof d.data === 'function' ? d.data() : d)).filter(Boolean);
    for (const doc of docs) {
      if (!doc || !doc.id) continue;
      const i = state.assessments.findIndex(a => a.id === doc.id);
      if (i >= 0) state.assessments[i] = doc; else state.assessments.push(doc);
    }
    const prefs = await state.db.doc('prefs/portal').get();
    const p = typeof prefs?.data === 'function' ? prefs.data() : prefs;
    if (p?.qStatus) state.qStatus = p.qStatus;
    if (p?.shared) state.shared = { ...state.shared, ...p.shared };
    if (docs.length || p) { recompute(); render(); }
  } catch { /* a page that cannot reach storage still works, it just forgets */ }
}

let saveTimer;
function persist(assessment) {
  if (!state.db) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      if (assessment) await state.db.doc('assessments/' + assessment.id).set(assessment);
      await state.db.doc('prefs/portal').set({ qStatus: state.qStatus, shared: state.shared });
    } catch { toast('Could not save that — your change is on screen but not stored.'); }
  }, 400);
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}

async function copy(text, label) {
  try { await navigator.clipboard.writeText(text); toast(label || 'Copied.'); }
  catch { toast('Could not copy — select the text and copy it manually.'); }
}

/* --------------------------------------------------------------- rail */

function renderRail() {
  const s = state.shared;
  $('#brief-box').innerHTML = `
    <dt>Brief</dt><dd>${esc(s.destination)} · ${esc(s.pax)} adults</dd>
    <dt>Sent</dt><dd>${esc(s.briefDate || '—')}</dd>
    <dt>Rate used</dt><dd>1 USD = ${esc(s.usdInr)} INR</dd>`;

  const ranked = [...state.results].sort((a, b) => a.rank - b.rank);
  $('#vlist').innerHTML = ranked.map(r => `
    <button class="vrow" role="tab" aria-current="${r.assessment.id === state.currentId}" data-id="${esc(r.assessment.id)}">
      <span class="vrank">${r.rank}</span>
      <span class="vname">${esc(r.assessment.vendor.name)}
        <span class="vmeta">${r.koStatus === 'DISQUALIFIED' ? 'disqualified' : r.koOpen.length + ' knock-outs open'}</span>
      </span>
      <span class="vscore">${fmt(r.overall)}</span>
    </button>`).join('');

  $('#awaiting-list').innerHTML = state.awaiting.map(a => `
    <button class="vrow awaiting" data-awaiting="${esc(a.id)}">
      <span class="vrank">·</span>
      <span class="vname">${esc(a.vendor.name)}<span class="vmeta">${esc(a.vendor.received === '-' ? 'no quote' : 'not scored')}</span></span>
      <span class="vscore">—</span>
    </button>`).join('');
}

/* ------------------------------------------------------------ topbar */

function renderTop(r) {
  const v = r.assessment.vendor;
  const meta = [v.entity, v.basedIn, v.ref && v.ref !== '-' ? 'ref ' + v.ref : '', v.received ? 'received ' + v.received : '']
    .filter(Boolean).map(esc).join(' · ');
  $('#topbar').innerHTML = `
    <div class="topbar-id">
      <h1>${esc(v.name)}</h1>
      <div class="topbar-meta">${meta}${v.contact ? ' · ' + esc(v.contact) : ''}${v.email ? ' · ' + esc(v.email) : ''}</div>
    </div>
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <span class="pill ${r.koStatus === 'DISQUALIFIED' ? 'pill-bad' : r.koStatus === 'CLEARED' ? 'pill-good' : 'pill-warn'}">${esc(r.koStatus)}</span>
      <div class="bigscore">
        <span class="n">${fmt(r.overall)}</span><span class="d">/10 · rank ${r.rank}</span>
      </div>
    </div>`;

  const qs = questions(r, state.shared);
  const ng = negotiation(r, state.results, state.shared);
  $('#tab-scores .count').textContent = '';
  $('#tab-questions .count').textContent = qs.length;
  $('#tab-negotiation .count').textContent = ng.length;
  $('#tab-compare .count').textContent = state.results.length;
  return { qs, ng };
}

/* ------------------------------------------------------- scores pane */

function subRow(r, cat, sub) {
  const editable = !sub.derived && !(cat.perHotel);
  const t = sub.score === null ? 'none' : sub.score >= 7 ? 'good' : sub.score >= 5 ? 'warn' : 'bad';
  return `<tr class="${sub.overridden ? 'sub-edited' : ''}">
    <td><b>${esc(sub.label)}</b>${sub.selfResearch ? ' <span class="chip">we research this</span>' : ''}
        ${sub.derived ? ' <span class="chip">from the brief</span>' : ''}</td>
    <td class="n">${sub.weight}</td>
    <td class="n">${editable
      ? `<input class="score-in ${sub.score === null ? 'pending' : ''}" type="number" min="0" max="10" step="0.5"
           value="${sub.score === null ? '' : Math.round(sub.score * 10) / 10}" placeholder="—"
           data-edit="${esc(sub.key)}" aria-label="Score for ${esc(sub.label)}">`
      : `<span class="big">${fmt(sub.score)}</span>`}</td>
    <td><span class="pill ${pillClass(t)}">${sub.score === null ? 'Pending' : sub.status === 'verified' ? 'Verified' : sub.status === 'provisional' ? 'Provisional' : 'From quote'}</span></td>
    <td class="ev">${esc(sub.evidence) || '<i>Nothing in the quote.</i>'}
      ${sub.source && sub.source !== 'Quote' ? `<br><span class="chip">${esc(sub.source)}</span>` : ''}
      ${editable ? `<br><input class="note-in" type="text" value="${esc(sub.evidence)}" placeholder="Your note, once you have asked"
           data-note="${esc(sub.key)}" aria-label="Evidence for ${esc(sub.label)}">` : ''}</td>
  </tr>`;
}

function hotelTable(r) {
  const hs = r.hotelSet.hotels;
  if (!hs.length) return '<p class="card-why">No hotels read out of this quote yet.</p>';
  return `<div class="tw" style="margin-bottom:12px"><table class="data">
    <thead><tr><th>Hotel</th><th class="n">Nights</th>
      ${HOTEL_CRITERIA.map(c => `<th class="n" title="${esc(c.guide)}">${esc(c.label)}<br><span style="font-weight:500;text-transform:none;letter-spacing:0">${Math.round(c.weight * 100)}%</span></th>`).join('')}
      <th class="n">Score</th></tr></thead>
    <tbody>${hs.map(h => `<tr>
      <td><b>${esc(h.name)}</b><br><span class="ev">${esc(h.city)}${h.dates ? ' · ' + esc(h.dates) : ''} · ${esc(h.room || 'Room not stated')}${h.named ? '' : ' · <b>“or similar”</b>'}</span>
        ${h.note ? `<br><span class="ev">${esc(h.note)}</span>` : ''}</td>
      <td class="n">${h.nights}</td>
      ${h.criteria.map(c => `<td class="n">${fmt(c.score)}</td>`).join('')}
      <td class="n big">${fmt(h.score)}</td></tr>`).join('')}
      <tr class="total"><td>Weighted by nights</td><td class="n">${r.hotelSet.nights}</td>
        ${HOTEL_CRITERIA.map(() => '<td></td>').join('')}<td class="n big">${fmt(r.hotelSet.score)}</td></tr>
    </tbody></table></div>
    <p class="card-why">Guest rating is calculated from the review scores we look up, not from the quote: 6.0 or lower scores 0, 9.5 and above scores 10. A hotel with no rating has that criterion excluded rather than guessed. Nights weighting means three bad nights count more than one.</p>`;
}

function cardBody(r, cat) {
  const editable = !cat.perHotel;
  return `<div class="card-body">
    <p class="card-why" style="margin:12px 0"><b>A 10 looks like:</b> ${esc(cat.tenLooksLike)}</p>
    ${cat.perHotel ? hotelTable(r) : ''}
    ${cat.relative && r.relativePrice !== null ? `<div class="note-strip" style="margin-bottom:12px">
      This category is scored <b>against the other quotes</b>, not against its own sub-criteria: the cheapest like-for-like landed cost scores 10 and everyone else scores 10 × cheapest ÷ their own. Completeness is already inside that figure, because every line they left unpriced carries our placeholder. The sub-scores below are what fed the provisional ${fmt(cat.provisional)} before the comparison.
    </div>` : ''}
    <div class="tw"><table class="data">
      <thead><tr><th>Sub-criterion</th><th class="n">Weight</th><th class="n">Score</th><th>Status</th><th>Evidence${editable ? ' · and your note' : ''}</th></tr></thead>
      <tbody>${cat.subs.map(s => subRow(r, cat, s)).join('')}</tbody>
    </table></div>
    ${editable ? '<p class="card-why" style="margin-top:10px">Change a score and it is marked as yours and re-weighted straight away. Clear the box to put it back to pending — a blank is excluded from the average, not counted as a zero.</p>' : ''}
  </div>`;
}

function renderScores(r) {
  const html = BLOCKS.map(b => {
    const cats = r.categories.filter(c => c.block === b.id);
    const blockScore = (() => {
      let w = 0, s = 0;
      cats.forEach(c => { if (c.score !== null) { w += c.weight; s += c.score * c.weight; } });
      return w ? s / w : null;
    })();
    return `<div class="sec">
      <div class="blockhead">
        <h2>${esc(b.name)}</h2>
        <span class="hand">${esc(b.note)}</span>
        <span class="w" style="margin-left:auto">${pct(b.weight)} of the decision · ${fmt(blockScore)}/10</span>
      </div>
      <div class="cards">${cats.map(c => {
        const isOpen = state.open.has(c.id);
        const worst = [...c.subs].filter(s => s.score !== null).sort((a, b2) => a.score - b2.score)[0];
        return `<article class="card ${toneClass(c.band.tone)} ${isOpen ? 'open' : ''}">
          <button class="card-btn" data-cat="${esc(c.id)}" aria-expanded="${isOpen}">
            <div class="card-top">
              <div>
                <div class="card-name">${esc(c.name)}</div>
                <div class="card-sub">${esc(c.sub)}</div>
              </div>
              <div class="card-score">${fmt(c.score)}<span class="of">/10</span></div>
            </div>
            <progress class="bar" max="10" value="${c.score ?? 0}"></progress>
            <div class="card-foot">
              <span class="pill ${pillClass(c.band.tone)}">${esc(c.band.label)}</span>
              <span class="chip">${pct(c.weight)} weight</span>
              ${c.pending ? `<span class="pill pill-warn">${c.pending} pending</span>` : ''}
              <span class="open-mark" style="margin-left:auto">${isOpen ? '×' : '+'}</span>
            </div>
            ${!isOpen && worst ? `<p class="card-why"><b>Weakest:</b> ${esc(worst.label)} at ${fmt(worst.score)}${worst.evidence ? ' — ' + esc(worst.evidence.slice(0, 120)) + (worst.evidence.length > 120 ? '…' : '') : ''}</p>` : ''}
          </button>
          ${isOpen ? cardBody(r, c) : ''}
        </article>`;
      }).join('')}</div>
    </div>`;
  }).join('');

  const ko = `<div class="sec">
    <div class="blockhead"><h2>Knock-outs</h2><span class="hand">any one of these fails and the score stops mattering</span></div>
    <div class="tw"><table class="data">
      <thead><tr><th style="width:1%">#</th><th>Must be true before we sign</th><th style="width:1%">Status</th><th>Where it stands</th></tr></thead>
      <tbody>${r.knockouts.map(k => `<tr>
        <td class="big">${esc(k.id)}</td>
        <td>${esc(k.label)}</td>
        <td><span class="pill ${k.status === 'PASS' ? 'pill-good' : k.status === 'FAIL' ? 'pill-bad' : 'pill-warn'}">${esc(k.status)}</span></td>
        <td class="ev">${esc(k.note)}</td></tr>`).join('')}</tbody>
    </table></div>
  </div>`;

  const b = r.brief;
  const briefSec = `<div class="sec">
    <div class="blockhead"><h2>Against our brief</h2><span class="hand">the same ${BRIEF.length} lines, asked of every DMC</span>
      <span class="w" style="margin-left:auto">${pct(b.compliance)} compliance</span></div>
    <div class="kpis" style="margin-bottom:12px">
      ${[['Met', b.met, 'good'], ['Partial', b.partial, 'warn'], ['Missing', b.missing, 'bad'], ['Contradictory', b.conflict, 'bad']]
        .map(([l, n, t]) => `<div class="kpi"><dt>${l}</dt><dd>${n}<span class="sub">of ${b.total}</span></dd></div>`).join('')}
    </div>
    <div class="tw"><table class="data">
      <thead><tr><th style="width:1%">#</th><th>What we asked for</th><th style="width:1%">Status</th><th>Note</th></tr></thead>
      <tbody>${BRIEF.map(req => {
        const st = (r.assessment.brief || {})[req.n];
        const info = st ? BRIEF_STATUS[st] : null;
        return `<tr>
          <td class="n">${req.n}</td>
          <td>${esc(req.text)}<br><span class="chip">${esc(req.area)}</span>${req.experience ? ' <span class="chip">one of the 10 experiences</span>' : ''}</td>
          <td><select class="note-in" style="min-width:120px;font-size:16px" data-brief="${req.n}" aria-label="Status for requirement ${req.n}">
            <option value=""${!st ? ' selected' : ''}>Not marked</option>
            ${Object.entries(BRIEF_STATUS).map(([k, v]) => `<option value="${k}"${st === k ? ' selected' : ''}>${v.label}</option>`).join('')}
          </select></td>
          <td class="ev">${esc((r.assessment.briefNotes || {})[req.n] || '')}</td></tr>`;
      }).join('')}</tbody>
    </table></div>
    <p class="card-why" style="margin-top:10px">Compliance is (met + half of partial) ÷ ${BRIEF.length}. It feeds <b>Completeness vs brief</b> under Responsiveness; the ten experience lines feed <b>Coverage</b> under Experiences. Change a status here and both scores move.</p>
  </div>`;

  $('#pane-scores').innerHTML = html + ko + briefSec;
}

/* ---------------------------------------------------- questions pane */

const SEV = {
  knockout: { label: 'Knock-out', cls: 'pill-bad',  head: 'Knock-outs', sub: 'until these are answered in writing, the score is academic' },
  high:     { label: 'High',      cls: 'pill-warn', head: 'High',       sub: 'these move the price or the risk' },
  medium:   { label: 'Medium',    cls: 'pill-none', head: 'Medium',     sub: 'worth having before we sign' },
  low:      { label: 'Low',       cls: 'pill-none', head: 'Low',        sub: 'tidy-ups' }
};

function renderQuestions(r, qs) {
  const vid = r.assessment.id;
  const maxUnlock = Math.max(0.01, ...qs.map(q => q.unlock));
  const openCount = qs.filter(q => (state.qStatus[vid + '|' + q.id] || 'open') === 'open').length;

  const groups = ['knockout', 'high', 'medium', 'low'].map(sev => {
    const list = qs.filter(q => q.severity === sev);
    if (!list.length) return '';
    return `<div class="sec">
      <div class="blockhead"><h2>${SEV[sev].head}</h2><span class="hand">${SEV[sev].sub}</span>
        <span class="w" style="margin-left:auto">${list.length}</span></div>
      <div class="qlist">${list.map(q => {
        const key = vid + '|' + q.id;
        const st = state.qStatus[key] || 'open';
        return `<article class="q ${sev === 'knockout' ? 'ko' : ''} ${st !== 'open' ? 'done' : ''}">
          <div class="q-top">
            <span class="q-n">${q.n}</span>
            <div class="q-title">
              <h4>${esc(q.criterion)}</h4>
              <span class="q-cat">${esc(q.category)}</span>
            </div>
            <span class="pill ${SEV[sev].cls}">${SEV[sev].label}</span>
            ${q.kind === 'missing' ? '<span class="pill pill-none">Not in the quote</span>'
              : q.kind === 'conflict' ? '<span class="pill pill-none">Quote contradicts itself</span>'
              : `<span class="pill pill-none">Scores ${fmt(q.score)}</span>`}
            ${q.unlock > 0.01 ? `<span class="unlock" title="How much the overall score moves if this comes back well">
              <progress class="bar thin blue" max="${maxUnlock}" value="${q.unlock}"></progress>
              +${(Math.round(q.unlock * 100) / 100).toFixed(2)}</span>` : ''}
          </div>
          <div class="q-facts">
            <div><b>What the quote says:</b> ${esc(q.says)}</div>
            <div><b>Why it matters:</b> ${esc(q.matters)}</div>
          </div>
          <div class="q-ask">${esc(q.ask)}</div>
          <div class="q-actions">
            <button class="btn btn-sm" data-copy-q="${esc(q.id)}">Copy this question</button>
            <button class="btn btn-sm ${st === 'asked' ? 'btn-yellow' : 'btn-quiet'}" data-qstatus="${esc(q.id)}|asked">Asked</button>
            <button class="btn btn-sm ${st === 'answered' ? 'btn-yellow' : 'btn-quiet'}" data-qstatus="${esc(q.id)}|answered">Answered</button>
          </div>
        </article>`;
      }).join('')}</div>
    </div>`;
  }).join('');

  $('#pane-questions').innerHTML = `
    <div class="panel sec" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
      <div style="flex:1 1 340px">
        <h2>${qs.length} questions, ordered by what they unlock</h2>
        <p class="hand">ask the top of this list first — the rest can wait for the call</p>
        <p style="margin-top:8px;font-size:.94rem">${openCount} still open. The number beside each question is how much the overall score moves if it comes back well — so you can see which answers actually decide this, and which are tidy-ups.</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" id="copy-all-q">Copy all as an email</button>
        <button class="btn" id="copy-ko-q">Copy the knock-outs only</button>
      </div>
    </div>${groups}`;
}

function questionEmail(r, qs, onlyKo) {
  const list = onlyKo ? qs.filter(q => q.severity === 'knockout') : qs;
  const v = r.assessment.vendor;
  const lines = [
    `Dear ${v.contact ? v.contact.split(',')[0] : 'Sir or Madam'},`, '',
    `Thank you for your quote${v.ref && v.ref !== '-' ? ' (' + v.ref + ')' : ''} for our ${state.shared.pax}-traveller group to ${state.shared.destination}.`,
    `Before we can put it in front of our travellers we need the following. They are in the order that matters to us.`, ''
  ];
  let n = 1;
  for (const sev of ['knockout', 'high', 'medium', 'low']) {
    const g = list.filter(q => q.severity === sev);
    if (!g.length) continue;
    lines.push(sev === 'knockout' ? 'These decide whether we can work together at all:'
      : sev === 'high' ? 'These affect the price and the risk:' : 'And these, when you have a moment:');
    for (const q of g) lines.push(`${n++}. ${q.ask}`);
    lines.push('');
  }
  lines.push('Our travellers average 62 and many are travelling abroad for the first time, so we are strict about food, pace and having a named person on the ground.', '',
    'Thank you,', 'The Trip Keeper');
  return lines.join('\n');
}

/* -------------------------------------------------- negotiation pane */

function costTable(r) {
  const c = r.cost;
  return `<div class="tw"><table class="data">
    <thead><tr><th>Cost line, per person</th><th class="n">USD</th><th>Where it comes from</th></tr></thead>
    <tbody>
      ${c.lines.map(l => `<tr>
        <td>${esc(l.label)}</td>
        <td class="n">${l.value === null ? '<span class="pill pill-bad">unpriced</span>' : usd(l.value)}</td>
        <td class="ev">${esc(l.note)}${l.kind === 'placeholder' ? ' <span class="chip">our figure</span>' : ''}</td></tr>`).join('')}
      <tr class="total"><td>Like-for-like landed cost</td><td class="n big">${usd(c.usdTotal)}</td>
        <td class="ev">Their quoted price is ${usd(c.quoted)}. The difference is what they left out.</td></tr>
      <tr class="total"><td>Per person in rupees</td><td class="n big">${inr(c.inrPp)}</td>
        <td class="ev">At ${state.shared.usdInr} plus their own ${pct(c.fxMarkup)} FX spread.</td></tr>
      <tr class="total"><td>For the group of ${state.shared.pax}</td><td class="n big">${inr(c.inrGroup)}</td>
        <td class="ev">${c.unpriced ? '<b>' + c.unpriced + ' lines still unpriced</b> — this figure can only go up.' : 'Every line priced.'}</td></tr>
    </tbody></table></div>`;
}

function renderNegotiation(r, ng) {
  const c = r.cost;
  const cheapest = state.results.filter(x => x.cost.inrPp !== null)
    .reduce((a, b) => !a || b.cost.inrPp < a.cost.inrPp ? b : a, null);
  const gap = cheapest && c.inrPp ? c.inrPp - cheapest.cost.inrPp : null;

  $('#pane-negotiation').innerHTML = `
    <div class="sec">
      <div class="blockhead"><h2>What the money actually is</h2><span class="hand">their price, plus everything they left out</span></div>
      <div class="kpis" style="margin-bottom:14px">
        <div class="kpi"><dt>Landed, per person</dt><dd>${inr(c.inrPp)}<span class="sub">quoted ${usd(c.quoted)}</span></dd></div>
        <div class="kpi"><dt>For the group</dt><dd>${inr(c.inrGroup)}<span class="sub">${state.shared.pax} travellers</span></dd></div>
        <div class="kpi"><dt>vs cheapest quote</dt><dd>${gap === null ? '—' : gap === 0 ? 'lowest' : (gap > 0 ? '+' : '') + inr(gap)}<span class="sub">${gap === 0 ? 'nobody is cheaper' : cheapest ? 'against ' + cheapest.assessment.vendor.name : ''}</span></dd></div>
        <div class="kpi"><dt>vs our own DIY</dt><dd>${c.inrPp && state.shared.diyBenchmarkInr ? signed(c.inrPp / state.shared.diyBenchmarkInr - 1) : '—'}<span class="sub">${inr(state.shared.diyBenchmarkInr)} doing it ourselves</span></dd></div>
        <div class="kpi"><dt>Unpriced lines</dt><dd>${c.unpriced}<span class="sub">${c.estimated} more we estimated</span></dd></div>
        <div class="kpi"><dt>Due at confirmation</dt><dd>${c.dueAtConfirmation === null ? 'not said' : pct(c.dueAtConfirmation)}<span class="sub">${c.dueAtConfirmation === null ? 'we asked, twice' : inr(c.inrPp * c.dueAtConfirmation * state.shared.pax) + ' up front'}</span></dd></div>
      </div>
      ${costTable(r)}
    </div>
    <div class="sec">
      <div class="blockhead"><h2>${ng.length} things to push on</h2><span class="hand">each one has the arithmetic behind it</span></div>
      <div class="qlist">${ng.map(p => `
        <article class="lever ${p.strength === 'strong' ? 'strong' : ''}">
          <div class="lever-top">
            <span class="lever-n">${p.n}</span>
            <h3 style="flex:1 1 260px">${esc(p.lever)}</h3>
            <span class="pill ${p.strength === 'strong' ? 'pill-blue' : 'pill-none'}">${p.strength === 'strong' ? 'Strong hand' : 'Worth raising'}</span>
          </div>
          <ul class="ev-list">${p.evidence.map(e => `<li><span>${esc(e)}</span></li>`).join('')}</ul>
          <div class="say">
            <span class="say-label">say something like</span>
            <p>${esc(p.say)}</p>
          </div>
          <div class="q-actions"><button class="btn btn-sm" data-copy-say="${esc(p.id)}">Copy this line</button></div>
        </article>`).join('')}</div>
    </div>`;
}

/* ------------------------------------------------------- compare pane */

function renderCompare() {
  const rs = [...state.results].sort((a, b) => a.rank - b.rank);
  if (rs.length < 2) {
    $('#pane-compare').innerHTML = `<div class="empty"><h2>Nothing to compare yet</h2>
      <p class="hand">one quote is a price, two is a negotiation</p>
      <p style="margin-top:10px">Score a second quote and this becomes a side-by-side.</p></div>`;
    return;
  }
  const best = (vals, higher = true) => {
    const nums = vals.filter(v => v !== null);
    if (!nums.length) return null;
    if (new Set(nums).size === 1 && nums.length === vals.length) return null;   /* a tie recommends nothing */
    return higher ? Math.max(...nums) : Math.min(...nums);
  };
  const row = (label, vals, fmtFn, higher = true, cls = '') => {
    const b = best(vals, higher);
    return `<tr class="${cls}"><td><b>${esc(label)}</b></td>${vals.map(v =>
      `<td class="n ${v !== null && v === b ? 'big' : ''}" style="${v !== null && v === b ? 'background:var(--tk-yellow)' : ''}">${fmtFn(v)}</td>`).join('')}</tr>`;
  };

  $('#pane-compare').innerHTML = `
    <div class="sec">
      <div class="blockhead"><h2>Side by side</h2><span class="hand">same brief, same scoresheet, no favourites</span></div>
      <div class="tw"><table class="data">
        <thead><tr><th>Category</th>${rs.map(r => `<th class="n">${esc(r.assessment.vendor.name)}<br>
          <span style="font-weight:500;text-transform:none;letter-spacing:0">rank ${r.rank}</span></th>`).join('')}</tr></thead>
        <tbody>
          ${row('Overall score', rs.map(r => r.overall), fmt, true, 'total')}
          ${BLOCKS.map(b => `<tr><td colspan="${rs.length + 1}" style="background:var(--paper-tint)"><b>${esc(b.name)}</b> · ${pct(b.weight)}</td></tr>` +
            CATEGORIES.filter(c => c.block === b.id).map(c =>
              row(c.name + ' (' + pct(c.weight) + ')', rs.map(r => r.categories.find(x => x.id === c.id).score), fmt)).join('')).join('')}
          <tr><td colspan="${rs.length + 1}" style="background:var(--paper-tint)"><b>Money</b></td></tr>
          ${row('Landed cost per person', rs.map(r => r.cost.inrPp), inr, false)}
          ${row('For the group', rs.map(r => r.cost.inrGroup), inr, false)}
          ${row('Unpriced lines', rs.map(r => r.cost.unpriced), v => v === null ? '—' : v, false)}
          ${row('Due at confirmation', rs.map(r => r.cost.dueAtConfirmation), v => v === null ? 'not said' : pct(v), false)}
          <tr><td colspan="${rs.length + 1}" style="background:var(--paper-tint)"><b>Risk</b></td></tr>
          ${row('Brief compliance', rs.map(r => r.brief.compliance), pct)}
          ${row('Sub-criteria pending', rs.map(r => r.pendingTotal), v => v === null ? '—' : v, false)}
          <tr><td><b>Knock-outs</b></td>${rs.map(r => `<td class="n"><span class="pill ${r.koStatus === 'DISQUALIFIED' ? 'pill-bad' : r.koStatus === 'CLEARED' ? 'pill-good' : 'pill-warn'}">${r.koStatus}</span><br><span class="ev">${r.koOpen.length} open</span></td>`).join('')}</tr>
          <tr><td><b>Where it stands</b></td>${rs.map(r => `<td class="ev" style="min-width:220px">${esc(verdict(r))}</td>`).join('')}</tr>
        </tbody>
      </table></div>
      <p class="card-why" style="margin-top:10px">Yellow marks the better figure on each row. Landed cost is like-for-like: every DMC carries our placeholder for anything they left out, so a thin quote does not look cheap.</p>
    </div>
    ${state.awaiting.length ? `<div class="sec">
      <div class="blockhead"><h2>Not scored</h2><span class="hand">still owed us a quote we can read</span></div>
      <div class="cards">${state.awaiting.map(a => `<article class="card"><div class="card-btn" style="cursor:default">
        <div class="card-top"><div><div class="card-name">${esc(a.vendor.name)}</div>
        <div class="card-sub">${esc(a.vendor.basedIn || 'unknown')}</div></div></div>
        <p class="card-why">${esc(a.note)}</p></div></article>`).join('')}</div>
    </div>` : ''}`;
}

/* ---------------------------------------------------------- rendering */

function render() {
  const r = current();
  renderRail();
  if (!r) return;
  const { qs, ng } = renderTop(r);
  state._qs = qs; state._ng = ng;

  $('#verdict').innerHTML = `
    <div style="flex:1 1 380px">
      <h2>${r.koStatus === 'DISQUALIFIED' ? 'Disqualified' : r.koOpen.length ? r.koOpen.length + ' knock-out' + (r.koOpen.length === 1 ? '' : 's') + ' still open' : 'All knock-outs cleared'}</h2>
      <p class="hand" style="color:var(--tk-ink)">${r.pendingTotal ? r.pendingTotal + ' sub-criteria still waiting on an answer' : 'nothing left pending'}</p>
      <p style="margin-top:9px">${esc(verdict(r))}</p>
    </div>
    <div style="flex:0 1 300px">
      ${qs[0] ? `<div class="note-strip" style="border-left-color:var(--danger)">
        <b>Ask first:</b> ${esc(qs[0].ask.slice(0, 190))}${qs[0].ask.length > 190 ? '…' : ''}
        <br><button class="btn btn-sm btn-primary" style="margin-top:9px" data-goto="questions">See all ${qs.length} questions</button>
      </div>` : ''}
    </div>`;

  if (state.tab === 'scores') renderScores(r);
  if (state.tab === 'questions') renderQuestions(r, qs);
  if (state.tab === 'negotiation') renderNegotiation(r, ng);
  if (state.tab === 'compare') renderCompare();

  $$('.tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === state.tab)));
  $$('.pane').forEach(p => p.classList.toggle('on', p.id === 'pane-' + state.tab));
}

/* ------------------------------------------------------------- events */

document.addEventListener('click', e => {
  const t = e.target;

  const vrow = t.closest('.vrow[data-id]');
  if (vrow) { state.currentId = vrow.dataset.id; state.open.clear(); render(); window.scrollTo(0, 0); return; }

  const await_ = t.closest('[data-awaiting]');
  if (await_) {
    const a = state.awaiting.find(x => x.id === await_.dataset.awaiting);
    openSheet(a?.vendor.name || '');
    return;
  }

  const tab = t.closest('.tab');
  if (tab) { state.tab = tab.dataset.tab; render(); return; }

  const goto = t.closest('[data-goto]');
  if (goto) { state.tab = goto.dataset.goto; render(); return; }

  const card = t.closest('[data-cat]');
  if (card) {
    const id = card.dataset.cat;
    state.open.has(id) ? state.open.delete(id) : state.open.add(id);
    render();
    return;
  }

  const cq = t.closest('[data-copy-q]');
  if (cq) { const q = state._qs.find(x => x.id === cq.dataset.copyQ); if (q) copy(q.ask, 'Question copied.'); return; }

  const cs = t.closest('[data-copy-say]');
  if (cs) { const p = state._ng.find(x => x.id === cs.dataset.copySay); if (p) copy(p.say, 'Line copied.'); return; }

  if (t.closest('#copy-all-q')) { copy(questionEmail(current(), state._qs, false), 'Email copied — paste it into your reply.'); return; }
  if (t.closest('#copy-ko-q'))  { copy(questionEmail(current(), state._qs, true), 'Knock-out questions copied.'); return; }

  const qs = t.closest('[data-qstatus]');
  if (qs) {
    const [id, want] = qs.dataset.qstatus.split('|');
    const key = current().assessment.id + '|' + id;
    state.qStatus[key] = state.qStatus[key] === want ? 'open' : want;
    persist(null); render(); return;
  }

  if (t.closest('#new-quote')) { openSheet(''); return; }
  if (t.closest('#sheet-close') || t === $('#sheet')) { $('#sheet').classList.remove('on'); return; }
});

/* Score and note edits. */
document.addEventListener('change', e => {
  const t = e.target;
  const a = current().assessment;

  if (t.dataset.edit) {
    const raw = t.value.trim();
    const v = raw === '' ? null : Math.max(0, Math.min(10, Number(raw)));
    a.scores = a.scores || {};
    const prev = a.scores[t.dataset.edit] || {};
    a.scores[t.dataset.edit] = { ...prev, score: Number.isFinite(v) ? v : null, status: v === null ? 'pending' : 'verified', overridden: true, source: prev.source || 'Your call' };
    recompute(); persist(a); render(); toast('Re-scored.');
    return;
  }
  if (t.dataset.note) {
    a.scores = a.scores || {};
    const prev = a.scores[t.dataset.note] || { score: null, status: 'pending' };
    a.scores[t.dataset.note] = { ...prev, evidence: t.value, overridden: true };
    recompute(); persist(a);
    return;
  }
  if (t.dataset.brief) {
    a.brief = a.brief || {};
    if (t.value) a.brief[t.dataset.brief] = t.value; else delete a.brief[t.dataset.brief];
    recompute(); persist(a); render(); toast('Brief updated — the scores it feeds have moved.');
    return;
  }
});

/* ------------------------------------------------------------- upload */

let pending = { text: '', name: '' };

function openSheet(prefill) {
  $('#sheet').classList.add('on');
  $('#v-name').value = prefill || '';
  $('#q-text').value = '';
  pending = { text: '', name: '' };
  setStatus('', false);
  $('#do-score').disabled = false;
}

function setStatus(msg, working) {
  const el = $('#sheet-status');
  el.hidden = !msg;
  el.className = 'status-line' + (working ? ' working' : '');
  el.innerHTML = msg ? `<span class="dot"></span><span>${esc(msg)}</span>` : '';
}

async function handleFile(file) {
  if (!file) return;
  setStatus('Reading ' + file.name, true);
  try {
    const { text, kind } = await readQuote(file);
    pending = { text, name: file.name };
    $('#q-text').value = text;
    setStatus(kind + ' read — ' + text.length.toLocaleString('en-IN') + ' characters. Check it looks right, then score it.', false);
  } catch (err) {
    setStatus(err.message, false);
  }
}

$('#file-in').addEventListener('change', e => handleFile(e.target.files[0]));
const drop = $('#drop');
['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => handleFile(e.dataTransfer?.files?.[0]));

$('#do-score').addEventListener('click', async () => {
  const text = $('#q-text').value.trim();
  if (text.length < 40) { setStatus('Paste the quote in, or drop the file above.', false); return; }
  $('#do-score').disabled = true;
  setStatus('Starting.', true);
  try {
    const { assessment, mode } = await assess(text, state.shared, state.sampler, m => setStatus(m, true));
    const nameOverride = $('#v-name').value.trim();
    if (nameOverride) assessment.vendor.name = nameOverride;

    /* Replace an awaiting stub of the same name rather than duplicating it. */
    const stub = state.awaiting.findIndex(a =>
      a.vendor.name.toLowerCase() === assessment.vendor.name.toLowerCase());
    if (stub >= 0) state.awaiting.splice(stub, 1);

    state.assessments.push(assessment);
    state.currentId = assessment.id;
    state.tab = 'scores';
    state.open.clear();
    recompute(); persist(assessment);
    $('#sheet').classList.remove('on');
    render(); window.scrollTo(0, 0);
    toast(mode === 'claude'
      ? 'Scored. Every line says where it came from — check the ones that matter.'
      : 'Scored by the built-in rules. Claude was not available, so a lot is left pending — fill those in yourself.');
  } catch (err) {
    setStatus(err.message || 'Could not score that.', false);
    $('#do-score').disabled = false;
  }
});

/* --------------------------------------------------------------- boot */

recompute();
render();

/* Capabilities arrive after first paint, and may never arrive. The page is
 * fully usable either way. */
(async () => {
  try {
    state.sampler = await window.claude?.use?.('sample') ?? null;
  } catch { state.sampler = null; }
  $('#reader-note').textContent = state.sampler
    ? 'Claude reads the quote against all 12 categories and tells you where every score came from.'
    : 'Claude is not available on this page, so the built-in rules will read what they can and leave the rest pending for you.';
})();
connectDb();
