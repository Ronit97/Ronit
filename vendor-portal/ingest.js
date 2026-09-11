/* ingest.js — getting a quote out of whatever the DMC sent, and turning it
 * into scores.
 *
 * Two stages, deliberately separate:
 *   1. readQuote()  — bytes to plain text. PDF, Excel, Word, email, pasted text.
 *   2. assess()     — text to a scored assessment. Claude reads it against the
 *                     rubric; if Claude is not available the rules pass does
 *                     what it honestly can and leaves the rest pending.
 */

import { CATEGORIES, BRIEF, KNOCKOUTS } from './rubric.js';

/* ------------------------------------------------------------ 1. reading */

const CDN = {
  pdf:   'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  pdfw:  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  xlsx:  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  jszip: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
};

const loaded = {};
function loadScript(url) {
  if (loaded[url]) return loaded[url];
  loaded[url] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('could not load ' + url));
    document.head.appendChild(s);
  });
  return loaded[url];
}

const clean = t => String(t || '')
  .replace(/\r/g, '\n')
  .replace(/[ \t]+\n/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

async function readPdf(file) {
  await loadScript(CDN.pdf);
  const lib = window.pdfjsLib;
  if (!lib) throw new Error('pdf reader unavailable');
  lib.GlobalWorkerOptions.workerSrc = CDN.pdfw;
  const doc = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    /* Group runs onto lines by vertical position so tables survive as rows. */
    const rows = new Map();
    for (const item of content.items) {
      if (!item.str || !item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 3);
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y).push({ x: item.transform[4], s: item.str });
    }
    const lines = [...rows.entries()].sort((a, b) => b[0] - a[0])
      .map(([, runs]) => runs.sort((a, b) => a.x - b.x).map(r => r.s).join(' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    pages.push(lines.join('\n'));
  }
  return pages.join('\n\n');
}

async function readXlsx(file) {
  await loadScript(CDN.xlsx);
  const XLSX = window.XLSX;
  if (!XLSX) throw new Error('spreadsheet reader unavailable');
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  return wb.SheetNames.map(n =>
    '### Sheet: ' + n + '\n' + XLSX.utils.sheet_to_csv(wb.Sheets[n], { blankrows: false })
  ).join('\n\n');
}

/* Word files come out of JSZip rather than a converter — we only need the
 * words, and word/document.xml has all of them. */
async function readDocx(file) {
  await loadScript(CDN.jszip);
  const JSZip = window.JSZip;
  if (!JSZip) throw new Error('word reader unavailable');
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const parts = [];
  for (const path of ['word/document.xml', 'word/header1.xml', 'word/footer1.xml']) {
    const entry = zip.file(path);
    if (!entry) continue;
    const xml = await entry.async('string');
    parts.push(xml
      .replace(/<w:tab[^>]*\/>/g, '\t')
      .replace(/<\/w:p>/g, '\n')
      .replace(/<w:br[^>]*\/>/g, '\n')
      .replace(/<\/w:tr>/g, '\n')
      .replace(/<\/w:tc>/g, ' | ')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (m, d) => String.fromCharCode(+d)));
  }
  return parts.join('\n');
}

export async function readQuote(file) {
  const name = (file.name || '').toLowerCase();
  const ext = name.slice(name.lastIndexOf('.') + 1);
  try {
    if (ext === 'pdf')  return { text: clean(await readPdf(file)),  kind: 'PDF' };
    if (ext === 'xlsx' || ext === 'xls' || ext === 'xlsm')
                        return { text: clean(await readXlsx(file)), kind: 'Spreadsheet' };
    if (ext === 'docx') return { text: clean(await readDocx(file)), kind: 'Word' };
    if (ext === 'csv' || ext === 'txt' || ext === 'md' || ext === 'eml' || ext === 'msg' || !ext)
                        return { text: clean(await file.text()),    kind: ext === 'eml' || ext === 'msg' ? 'Email' : 'Text' };
    return { text: clean(await file.text()), kind: 'Text' };
  } catch (err) {
    const e = new Error(
      ext === 'pdf'  ? 'Could not read that PDF. Open it, select all, and paste the text in instead.' :
      ext === 'docx' ? 'Could not read that Word file. Open it, select all, and paste the text in instead.' :
      ext === 'doc'  ? 'Old .doc files cannot be read in a browser. Save it as .docx or paste the text in.' :
      'Could not read that file. Paste the text in instead.');
    e.cause = err;
    throw e;
  }
}

/* --------------------------------------------------- 2. Claude extraction */

function rubricForPrompt() {
  return CATEGORIES.map(cat =>
    '## ' + cat.name + ' (' + cat.id + ')\nA 10 looks like: ' + cat.tenLooksLike + '\n' +
    cat.subs.filter(s => !s.derived).map(s =>
      '- ' + cat.id + '.' + s.id + ' — ' + s.label + (s.selfResearch ? ' [we research this ourselves: return null]' : '') +
      '\n  Look for: ' + s.signal).join('\n')
  ).join('\n\n');
}

const SYSTEM = `You are reading a destination management company's quote for The Trip Keeper, which runs small founder-hosted trips for Indian travellers averaging 62 years old, many on a first trip abroad, some with mobility limits and all needing Indian vegetarian food.

You score the quote against a fixed rubric. Follow these rules exactly.

1. Score 0-10 ONLY from what the document actually says. Never reward a promise you cannot see.
2. If the document is silent on a sub-criterion, return score: null and status: "pending". Do NOT score a silence as 0 — a silence is an unanswered question, and scoring it as zero would be unfair to the vendor and misleading to us. Score 0 only when the document explicitly excludes or refuses something.
3. Every score needs an "evidence" line: what the document says, in your own words, short and specific. Quote their phrasing where it matters. Never write "not applicable" or "see above".
4. status is "quoted" for anything read off this document. Use "verified" only where the document itself is proof of the thing (its own turnaround time, its own factual errors).
5. Be blunt. This scoresheet exists to stop us buying something thin. An inclusions list promising a guide while the day plan says "no guide" is a contradiction worth calling out, not an average of the two.
6. Mark the brief matrix honestly: "met" only if they quoted what was asked; "partial" if they quoted a weaker version; "missing" if absent; "conflict" if the document says two different things.
7. Currency: return prices as numbers in USD per person. If the quote is in another currency, convert at the rate given in the input and say so in the note.

Return JSON only, matching the shape you are given. No prose outside the JSON.`;

export function buildPrompt(text, shared) {
  const briefList = BRIEF.map(b => b.n + '. [' + b.area + '] ' + b.text).join('\n');
  return `# The brief we sent every DMC
${shared.brief}
Travellers: ${shared.pax} adults. Destination: ${shared.destination}.
Reference rate: 1 USD = ${shared.usdInr} INR.

Numbered requirements:
${briefList}

# The rubric
${rubricForPrompt()}

# Knock-outs
${KNOCKOUTS.map(k => k.id + ' — ' + k.label).join('\n')}
For each, return "PASS" only if the document gives it in writing, "FAIL" if the document rules it out, otherwise "PENDING".

# The document
The vendor sent this. It may be an email, a PDF, a spreadsheet export or a Word file, and it may be messy.

<<<DOCUMENT
${text.slice(0, 120000)}
DOCUMENT>>>

# Return this JSON shape
{
  "vendor": { "name": "", "entity": "", "basedIn": "", "contact": "", "email": "", "phone": "", "ref": "", "received": "" },
  "cost": {
    "package": 0, "packageNote": "what this figure covers",
    "hotels": null, "hotelsNote": "",
    "visa": null, "flights": null, "surcharge": null, "fastpass": null, "gala": null, "drinks": null, "remittance": null,
    "taxRate": 0, "fxMarkup": 0,
    "dueAtConfirmation": null, "termsNote": ""
  },
  "hotels": [ { "city": "", "dates": "", "nights": 0, "name": "", "room": "", "named": false,
                "class_brand": 0, "location_fit": 0, "room_category": 0, "senior_fit": 0, "confirmation": 0,
                "note": "" } ],
  "brief": { "1": "met|partial|missing|conflict" },
  "briefNotes": { "1": "only where it needs explaining" },
  "scores": { "food.indian_veg": { "score": 0, "status": "quoted", "evidence": "", "source": "Quote" } },
  "knockouts": { "K1": { "status": "PENDING", "note": "" } },
  "verdict": "two sentences — what is good, what blocks it"
}

Notes on the shape:
- "cost": per person in USD. Leave a line null if the quote does not price it; we add our own placeholder. "taxRate" as a decimal (0.05 for 5%), 0 if the quote says taxes are included. "dueAtConfirmation" as a decimal share of the total, null if unstated.
- "hotels": one entry per property. Score class_brand, location_fit, room_category, senior_fit and confirmation 0-10. Do NOT score guest ratings — we look those up ourselves. "confirmation": 10 named and held, 7 named not held, 3 "or similar", 0 not named. Nights must add up to the itinerary.
- "scores": include every sub-criterion in the rubric except those marked [we research this ourselves] and except experiences.coverage and responsiveness.completeness, which we calculate from the brief matrix.
- "brief": all ${BRIEF.length} requirements, keyed by number.`;
}

const EMPTY = { scores: {}, hotels: [], brief: {}, briefNotes: {}, cost: {}, knockouts: {} };

/* Anything Claude returns is checked before it reaches the scoring engine —
 * a stray string where a score should be would otherwise poison every average. */
function sanitise(raw, shared) {
  const a = { ...EMPTY, ...(raw || {}) };
  const clampScore = v => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(0, Math.min(10, n)) : null;
  };
  const numOrNull = v => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const validKeys = new Set();
  CATEGORIES.forEach(c => c.subs.forEach(s => { if (!s.derived) validKeys.add(c.id + '.' + s.id); }));

  const scores = {};
  for (const [k, v] of Object.entries(a.scores || {})) {
    if (!validKeys.has(k)) continue;
    const o = (v && typeof v === 'object') ? v : { score: v };
    const s = clampScore(o.score);
    scores[k] = {
      score: s,
      status: s === null ? 'pending' : (['quoted', 'verified', 'provisional'].includes(o.status) ? o.status : 'quoted'),
      evidence: String(o.evidence || '').slice(0, 600),
      source: String(o.source || 'Quote').slice(0, 120)
    };
  }

  const hotels = (Array.isArray(a.hotels) ? a.hotels : []).slice(0, 12).map(h => ({
    city: String(h.city || '').slice(0, 60),
    dates: String(h.dates || '').slice(0, 40),
    nights: numOrNull(h.nights) || 0,
    name: String(h.name || '').slice(0, 160),
    room: String(h.room || 'Not stated').slice(0, 120),
    named: !!h.named,
    ota: numOrNull(h.ota), tripadvisor: numOrNull(h.tripadvisor),
    class_brand: clampScore(h.class_brand), location_fit: clampScore(h.location_fit),
    room_category: clampScore(h.room_category), senior_fit: clampScore(h.senior_fit),
    confirmation: clampScore(h.confirmation),
    note: String(h.note || '').slice(0, 600)
  })).filter(h => h.name);

  const allowed = ['met', 'partial', 'missing', 'conflict'];
  const brief = {}, briefNotes = {};
  for (const req of BRIEF) {
    const v = (a.brief || {})[req.n] ?? (a.brief || {})[String(req.n)];
    if (allowed.includes(v)) brief[req.n] = v;
    const n = (a.briefNotes || {})[req.n] ?? (a.briefNotes || {})[String(req.n)];
    if (n) briefNotes[req.n] = String(n).slice(0, 400);
  }

  const c = a.cost || {};
  const cost = { taxRate: numOrNull(c.taxRate) ?? 0, fxMarkup: numOrNull(c.fxMarkup) ?? 0 };
  for (const k of ['package', 'hotels', 'visa', 'flights', 'surcharge', 'fastpass', 'gala', 'drinks', 'remittance']) {
    cost[k] = numOrNull(c[k]);
    if (c[k + 'Note']) cost[k + 'Note'] = String(c[k + 'Note']).slice(0, 300);
  }
  cost.dueAtConfirmation = (() => {
    const v = numOrNull(c.dueAtConfirmation);
    if (v === null) return null;
    return v > 1 ? Math.min(1, v / 100) : Math.max(0, v);   /* accepts 60 or 0.6 */
  })();
  if (c.termsNote) cost.termsNote = String(c.termsNote).slice(0, 400);

  const knockouts = {};
  for (const k of KNOCKOUTS) {
    const v = (a.knockouts || {})[k.id];
    if (!v) continue;
    const st = ['PASS', 'FAIL', 'PENDING'].includes(v.status) ? v.status : undefined;
    knockouts[k.id] = { ...(st ? { status: st } : {}), note: String(v.note || '').slice(0, 400) };
  }

  const v = a.vendor || {};
  return {
    id: 'a' + Date.now().toString(36),
    createdAt: new Date().toISOString(),
    vendor: {
      name: String(v.name || 'Unnamed vendor').slice(0, 120),
      entity: String(v.entity || '').slice(0, 160),
      basedIn: String(v.basedIn || '').slice(0, 120),
      contact: String(v.contact || '').slice(0, 120),
      email: String(v.email || '').slice(0, 160),
      phone: String(v.phone || '').slice(0, 60),
      ref: String(v.ref || '-').slice(0, 60),
      received: String(v.received || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })).slice(0, 60)
    },
    verdict: String(a.verdict || '').slice(0, 800),
    scores, hotels, brief, briefNotes, cost, knockouts,
    source: 'claude'
  };
}

/* --------------------------------------------------------- rules fallback */

/* Used only when Claude is not available to this viewer. It reads the signals
 * that can be read literally and leaves everything else pending — which is the
 * honest outcome, not a fabricated score. */
const RULES = [
  ['food.indian_veg', [
    [/pure\s*veg|100%\s*veg|jain/i, 8, 'The quote uses the words "pure vegetarian" or offers Jain meals.'],
    [/indian\s+(restaurant|meal|food|cuisine|lunch|dinner)/i, 6, 'Indian food mentioned, but not confirmed as pure vegetarian.'],
    [/vegetarian/i, 5, 'Vegetarian mentioned, but not confirmed as Indian at every meal.']
  ], 2, 'The quote is silent on cuisine.'],
  ['food.meal_coverage', [
    [/\b(full\s*board|B\/L\/D|breakfast,?\s*lunch\s*(and|&)\s*dinner|all\s*meals)\b/i, 9, 'Breakfast, lunch and dinner included.'],
    [/half\s*board|breakfast\s*(and|&)\s*dinner/i, 5, 'Half board only — lunches are on us.'],
    [/breakfast/i, 3, 'Breakfast only.']
  ], null, ''],
  ['food.drinks_water', [
    [/water\s*(bottle|is\s*included|included)|mineral water/i, 5, 'Some drinking water included.'],
    [/(drinks|beverages).{0,30}(not included|excluded)/i, 3, 'Drinks explicitly excluded.']
  ], null, ''],
  ['flights.included', [
    [/(air\s*fare|airfare|flight).{0,40}(not included|excluded|extra)/i, 0, 'Airfares explicitly excluded.'],
    [/\b[A-Z]{2}\s?\d{2,4}\b.{0,40}(dep|arr|\d{2}:\d{2})/, 8, 'Flight numbers and timings appear in the quote.'],
    [/(flight|sector).{0,30}(included)/i, 6, 'Flights described as included, without detail.']
  ], null, ''],
  ['flights.disclosure', [
    [/\b[A-Z]{2}\s?\d{2,4}\b.{0,60}\d{2}:\d{2}/, 8, 'Airline, flight number and timings given.'],
    [/\b\d{2}\s?kg\b/i, 4, 'Baggage allowance mentioned but not full flight detail.']
  ], 0, 'No airline, flight number, timing or baggage detail.'],
  ['transport.private', [
    [/\b(private|exclusive)\b.{0,40}(coach|vehicle|transfer|transport|bus)/i, 8, 'Transport described as private to the group.'],
    [/\b(sharing|seat[-\s]?in[-\s]?coach|SIC|shared)\b/i, 2, 'Transport is on a sharing basis.']
  ], null, ''],
  ['transport.size_luggage', [
    [/\b(\d{2})\s*[-\s]?(seater|seat)\b/i, 6, 'A seat count is given, but no luggage capacity.']
  ], null, ''],
  ['transport.disclosure', [
    [/\b(hyundai|toyota|ford|mercedes|isuzu|thaco|universe|county|solati|transit|coaster)\b/i, 7, 'A vehicle make or model is named.'],
    [/(photo|picture|image).{0,40}(vehicle|coach|bus)/i, 6, 'Vehicle photographs offered.']
  ], 2, 'No make, model, year or photographs.'],
  ['guides.coverage', [
    [/(english[-\s]speaking\s*(guide|escort)).{0,60}(throughout|every day|daily|all days)/i, 9, 'An English-speaking guide is promised throughout.'],
    [/no\s*guide/i, 3, 'Some days are explicitly without a guide.'],
    [/english[-\s]speaking\s*(guide|escort)|guide/i, 6, 'A guide is mentioned but not confirmed day by day.']
  ], null, ''],
  ['contract.cancellation', [
    [/cancellation.{0,120}(\d+\s*%|\d+\s*days)/is, 8, 'A cancellation schedule with percentages or notice periods is given.'],
    [/cancellation|refund/i, 4, 'Cancellation is mentioned but no schedule given.']
  ], 1, 'No cancellation or refund schedule.'],
  ['contract.validity', [
    [/valid.{0,30}(\d+)\s*(day|days|week)/i, 8, 'A validity in days is stated.'],
    [/valid.{0,30}(\d+)\s*(hour|hrs|hours)/i, 1, 'The price is valid for hours only.'],
    [/rates? (are )?subject to (change|availability)/i, 3, 'Rates are "subject to change" with no validity date.']
  ], 3, 'No validity date stated.'],
  ['contract.substitution', [
    [/or\s*similar|\/\s*similar|similar\s*category/i, 3, 'Hotels are hedged with "or similar".'],
    [/confirmed|blocked|held/i, 7, 'Some services described as confirmed or held.']
  ], null, ''],
  ['contract.surcharge', [
    [/(peak|festive|christmas|new year|surcharge|gala).{0,60}(if applicable|extra|not included|additional)/i, 2, 'Open-ended peak or gala surcharges.'],
    [/no\s*surcharge/i, 8, 'No surcharges stated.']
  ], null, ''],
  ['payment.due_at_confirmation', [
    [/(\d{1,3})\s*%.{0,40}(confirmation|booking|advance|deposit)/i, null, 'Deposit percentage stated in the quote.'],
    [/100\s*%.{0,30}(advance|confirmation|booking)/i, 1, 'Full payment demanded up front.']
  ], null, ''],
  ['payment.balance_timing', [
    [/balance.{0,40}(\d{1,3})\s*days/i, null, 'Balance timing stated in days.']
  ], null, ''],
  ['payment.fx', [
    [/\b(INR|rupee)\b.{0,60}(bank|invoice|payment)/i, 8, 'Billed in INR.'],
    [/\b(USD|dollar)\b/i, 5, 'Billed in USD, so the FX risk sits with us.']
  ], null, ''],
  ['support.contact_247', [
    [/24\s*[x\/*]\s*7|24\s*hours?.{0,20}(support|assistance|helpline)/i, 3, '24/7 support claimed, but check whether a named person and local number are given.'],
    [/whatsapp.{0,30}(\+?\d[\d\s-]{7,})/i, 7, 'A WhatsApp number is given.']
  ], null, ''],
  ['price.transparency', [
    [/(cost\s*break\s*up|breakdown|itemis|per\s*person\s*cost.{0,40}(hotel|transport|guide))/i, 7, 'Some cost breakdown given.'],
    [/(cannot|can't|unable).{0,40}(break\s*up|breakdown)|sell\s*(as\s*a\s*)?package/i, 1, 'They refuse to break the price down.']
  ], null, ''],
  ['experiences.private_shared', [
    [/\b(sharing|seat[-\s]?in[-\s]?coach|SIC|shared basis)\b/i, 3, 'Some activities are on a sharing basis.'],
    [/\b(private|exclusive)\b/i, 7, 'Activities described as private.']
  ], null, '']
];

function rulesAssess(text, shared) {
  const scores = {};
  for (const [key, patterns, fallback, fallbackEv] of RULES) {
    let hit = null;
    for (const [re, val, ev] of patterns) {
      const m = text.match(re);
      if (!m) continue;
      let score = val;
      if (score === null) {
        /* percentage or day-count rules read their own number out of the match */
        const n = Number(m[1]);
        if (!Number.isFinite(n)) continue;
        if (key === 'payment.due_at_confirmation') score = n <= 30 ? 9 : n <= 40 ? 6 : n <= 55 ? 4 : 2;
        else if (key === 'payment.balance_timing') score = n >= 30 ? 9 : n >= 15 ? 7 : 4;
        else continue;
      }
      hit = { score, status: 'quoted', evidence: ev + ' (matched: "' + m[0].trim().slice(0, 90) + '")', source: 'Quote, read by rule' };
      break;
    }
    if (!hit && fallback !== null && fallback !== undefined) {
      hit = { score: fallback, status: 'quoted', evidence: fallbackEv, source: 'Quote, read by rule' };
    }
    if (hit) scores[key] = hit;
  }

  const money = [...text.matchAll(/(?:USD|US\$|\$)\s?([\d,]+(?:\.\d+)?)/gi)]
    .map(m => Number(m[1].replace(/,/g, ''))).filter(n => n > 100 && n < 20000);
  const pkg = money.length ? Math.max(...money.filter(n => n < 5000)) || null : null;

  const nameGuess = (text.match(/^(?:from|company|regards,?)\s*[:\-]?\s*(.{3,60})$/im) || [])[1];

  return {
    id: 'a' + Date.now().toString(36),
    createdAt: new Date().toISOString(),
    vendor: {
      name: (nameGuess || 'Unnamed vendor').trim().slice(0, 120),
      entity: '', basedIn: '',
      contact: '', email: (text.match(/[\w.+-]+@[\w-]+\.[\w.]+/) || [''])[0],
      phone: (text.match(/\+\d[\d\s()-]{7,17}/) || [''])[0].trim(),
      ref: (text.match(/\b(?:ref|quote|quotation)\s*(?:no\.?|#|:)?\s*([A-Za-z]{0,4}\d[A-Za-z0-9-]{1,10})\b/i) || ['', '-'])[1],
      received: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    },
    verdict: '',
    scores, hotels: [], brief: {}, briefNotes: {},
    cost: { package: pkg, packageNote: pkg ? 'Largest per-person figure found in the document — check it.' : '', taxRate: 0, fxMarkup: 0, dueAtConfirmation: null },
    knockouts: {},
    source: 'rules'
  };
}

/* ------------------------------------------------------------- 2. assess */

/* `sampler` is the sample capability, or null. On null we fall back to rules
 * and say so, rather than pretending to a precision we do not have. */
export async function assess(text, shared, sampler, onProgress) {
  if (!text || text.trim().length < 40) throw new Error('That does not look like a quote — there is almost no text in it.');

  if (!sampler) {
    onProgress?.('Reading the quote with the built-in rules.');
    return { assessment: rulesAssess(text, shared), mode: 'rules' };
  }

  onProgress?.('Claude is reading the quote against all 12 categories.');
  let raw;
  try {
    raw = await sampler.json(
      [{ role: 'user', content: SYSTEM + '\n\n' + buildPrompt(text, shared) }],
      { modelTier: 'complex', onText: () => onProgress?.('Scoring against the rubric.') }
    );
  } catch (err) {
    if (err && err.code === 'not_granted') {
      onProgress?.('Claude was not available, so the rules pass read it instead.');
      return { assessment: rulesAssess(text, shared), mode: 'rules' };
    }
    throw new Error(err?.message || 'Claude could not read that quote. Try again, or paste less of it.');
  }

  const assessment = sanitise(raw, shared);
  if (!Object.keys(assessment.scores).length) {
    return { assessment: { ...rulesAssess(text, shared), vendor: assessment.vendor }, mode: 'rules' };
  }
  return { assessment, mode: 'claude' };
}

export { rulesAssess, sanitise };
