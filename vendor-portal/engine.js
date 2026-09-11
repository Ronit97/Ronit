/* engine.js — scoring, landed cost, and the two insight generators.
 *
 * Every number on screen comes from here. Nothing is hand-written into the UI.
 */

import {
  CATEGORIES, CATEGORY_BY_ID, KNOCKOUTS, BRIEF, BRIEF_STATUS,
  HOTEL_CRITERIA, guestRatingScore, band
} from './rubric.js';

/* ---------------------------------------------------------------- helpers */

const num = v => (typeof v === 'number' && !Number.isNaN(v)) ? v : null;
export const round1 = v => v === null ? null : Math.round(v * 10) / 10;
export const inr = v => v === null || v === undefined ? '—'
  : '₹' + Math.round(v).toLocaleString('en-IN');
export const usd = v => v === null || v === undefined ? '—'
  : '$' + Math.round(v).toLocaleString('en-US');
export const pct = v => v === null || v === undefined ? '—' : Math.round(v * 100) + '%';

/* Weighted mean that excludes anything unscored and renormalises the rest.
 * This is the whole reason a pending answer does not read as a zero. */
function weightedMean(items) {
  let w = 0, sum = 0, pending = 0;
  for (const it of items) {
    const s = num(it.score);
    if (s === null) { pending++; continue; }
    w += it.weight; sum += s * it.weight;
  }
  return { value: w > 0 ? sum / w : null, weightScored: w, pending };
}

/* -------------------------------------------------------- brief compliance */

export function briefResult(assessment) {
  const marks = assessment.brief || {};
  let met = 0, partial = 0, missing = 0, conflict = 0, scored = 0;
  let expValue = 0, expCount = 0;

  for (const req of BRIEF) {
    const st = marks[req.n];
    if (st === 'met') met++; else if (st === 'partial') partial++;
    else if (st === 'missing') missing++; else if (st === 'conflict') conflict++;
    if (st) scored++;
    if (req.experience) {
      expCount++;
      expValue += st ? BRIEF_STATUS[st].value : 0;
    }
  }
  const total = BRIEF.length;
  return {
    met, partial, missing, conflict, total, scored,
    compliance: scored ? (met + partial * 0.5) / total : null,
    experienceCoverage: expCount ? expValue / expCount : null
  };
}

/* ------------------------------------------------------------ hotel scores */

export function hotelResult(assessment) {
  const hotels = (assessment.hotels || []).map(h => {
    const crit = HOTEL_CRITERIA.map(c => ({
      id: c.id,
      weight: c.weight,
      score: c.calc ? guestRatingScore(num(h.ota), num(h.tripadvisor)) : num(h[c.id])
    }));
    const { value } = weightedMean(crit);
    return { ...h, criteria: crit, score: value };
  });
  const nights = hotels.reduce((a, h) => a + (num(h.nights) || 0), 0);
  let weighted = null;
  if (nights > 0) {
    const scored = hotels.filter(h => h.score !== null);
    const n = scored.reduce((a, h) => a + (num(h.nights) || 0), 0);
    if (n > 0) weighted = scored.reduce((a, h) => a + h.score * (num(h.nights) || 0), 0) / n;
  }
  return { hotels, nights, score: weighted };
}

/* ------------------------------------------------------------ landed cost */

/* Like-for-like per person. Anything the DMC left out gets a placeholder, so a
 * quote is never cheap simply because it is incomplete. */
export function landedCost(assessment, shared) {
  const c = assessment.cost || {};
  const rate = num(shared?.usdInr) ?? 95;
  const ph = shared?.placeholders || {};

  const lines = [];
  const push = (id, label, value, note, kind) =>
    lines.push({ id, label, value: num(value), note: note || '', kind });

  push('package',   'Package / land price as quoted', c.package, c.packageNote, 'quoted');
  push('hotels',    'Hotels as quoted',               c.hotels,  c.hotelsNote,  'quoted');

  /* Placeholders: the DMC's own figure if given, else our estimate, and it is
   * labelled as ours so nobody mistakes it for a quoted price. */
  const placeholderLines = [
    ['flights',    'Internal flights',                    'flights'],
    ['visa',       'Visa / e-visa',                       'visa'],
    ['surcharge',  'Peak-season / festival surcharge',    'surcharge'],
    ['fastpass',   'Fast pass, buggy and paid extras',    'fastpass'],
    ['gala',       'Compulsory gala dinner',              'gala'],
    ['drinks',     'Drinks / water with meals',           'drinks'],
    ['remittance', 'Bank remittance fees',                'remittance']
  ];
  let unpriced = 0, estimated = 0;
  for (const [id, label, phKey] of placeholderLines) {
    const own = num(c[id]);
    if (own !== null) { push(id, label, own, c[id + 'Note'], 'quoted'); continue; }
    const est = num(ph[phKey]);
    if (est !== null) { push(id, label, est, 'Our placeholder — they did not quote it', 'placeholder'); estimated++; }
    else { push(id, label, null, 'Not quoted, and we have no estimate — this is an open surcharge', 'unpriced'); unpriced++; }
  }

  const taxable = (num(c.package) || 0) + (num(c.hotels) || 0);
  const taxRate = num(c.taxRate) ?? 0;
  push('tax', 'Tax on invoice', taxRate * taxable,
    taxRate ? Math.round(taxRate * 1000) / 10 + '% on the quoted price' : 'Quote states taxes are included', 'derived');

  const quoted = taxable || null;
  const usdTotal = lines.reduce((a, l) => a + (l.value || 0), 0) || null;
  const fx = num(c.fxMarkup) ?? 0;
  const inrPp = usdTotal === null ? null : usdTotal * rate * (1 + fx);

  return {
    lines, quoted, usdTotal, inrPp,
    inrGroup: inrPp === null ? null : inrPp * (num(shared?.pax) || 14),
    unpriced, estimated, fxMarkup: fx, taxRate, rate,
    dueAtConfirmation: num(c.dueAtConfirmation)
  };
}

/* ----------------------------------------------------------- full scoring */

/* Scores one assessment. `peers` are the other assessments, needed because
 * Price & value is relative once two DMCs have a landed cost. */
export function score(assessment, shared, peers = []) {
  const brief = briefResult(assessment);
  const hotels = hotelResult(assessment);
  const cost = landedCost(assessment, shared);

  const derived = {
    briefCompliance: brief.compliance === null ? null : brief.compliance * 10,
    experienceCoverage: brief.experienceCoverage === null ? null : brief.experienceCoverage * 10
  };

  /* Relative price: lowest like-for-like landed cost scores 10, the rest score
   * 10 x lowest / own. Needs two or more landed costs to mean anything. */
  const allCosts = [assessment, ...peers]
    .map(a => a === assessment ? cost.inrPp : landedCost(a, shared).inrPp)
    .filter(v => v !== null);
  const lowest = allCosts.length ? Math.min(...allCosts) : null;
  const relativePrice = (allCosts.length >= 2 && cost.inrPp)
    ? Math.max(0, Math.min(10, 10 * lowest / cost.inrPp)) : null;

  const marks = assessment.scores || {};
  const categories = CATEGORIES.map(cat => {
    const subs = cat.subs.map(sub => {
      const key = cat.id + '.' + sub.id;
      const m = marks[key] || {};
      let s = num(m.score);

      if (sub.derived) s = derived[sub.derived];
      if (cat.id === 'hotels' && hotels.score !== null) {
        /* Hotels come from the per-hotel table, nights-weighted. */
        const perCrit = hotels.hotels.filter(h => h.score !== null);
        const n = perCrit.reduce((a, h) => a + (num(h.nights) || 0), 0);
        const c = HOTEL_CRITERIA.find(x => x.id === sub.id);
        if (c && n > 0) {
          let acc = 0, accW = 0;
          for (const h of perCrit) {
            const cs = h.criteria.find(x => x.id === sub.id);
            if (cs && cs.score !== null) { acc += cs.score * (num(h.nights) || 0); accW += (num(h.nights) || 0); }
          }
          s = accW > 0 ? acc / accW : null;
        }
      }
      return {
        ...sub, key, score: s,
        status: m.status || (s === null ? 'pending' : 'quoted'),
        evidence: m.evidence || '', source: m.source || '',
        overridden: !!m.overridden
      };
    });
    const { value, pending } = weightedMean(subs);

    /* Two categories do not aggregate from their own sub-weights.
     * Hotels is scored per hotel and combined by nights, because a bad hotel
     * for three nights matters more than a bad hotel for one.
     * Price is scored relative to the cheapest like-for-like landed cost —
     * and because that landed cost already carries a placeholder for every
     * line the DMC left out, completeness is priced in rather than counted twice. */
    let final = value, basis = 'sub-criteria';
    if (cat.perHotel && hotels.score !== null) { final = hotels.score; basis = 'per hotel, weighted by nights'; }
    if (cat.relative && relativePrice !== null) { final = relativePrice; basis = 'relative to the cheapest landed cost'; }

    return {
      ...cat, subs, score: final, provisional: value, basis, pending,
      band: band(final),
      contribution: final === null ? 0 : final * cat.weight
    };
  });

  const catItems = categories.map(c => ({ weight: c.weight, score: c.score }));
  const { value: overall } = weightedMean(catItems);

  /* Knock-outs. A tied sub-criterion that is pending leaves the knock-out
   * pending; a low verified score fails it. */
  const byKey = {};
  categories.forEach(c => c.subs.forEach(s => { byKey[s.key] = s; }));
  const knockouts = KNOCKOUTS.map(k => {
    const explicit = (assessment.knockouts || {})[k.id] || {};
    if (explicit.status) return { ...k, ...explicit };
    const withNote = d => ({ ...d, note: explicit.note || d.note });

    if (k.rule === 'credibility>=5') {
      const cred = categories.find(c => c.id === 'credibility');
      if (cred.score === null) return withNote({ ...k, status: 'PENDING', note: 'Credibility not yet scored.' });
      if (cred.pending > 0) return withNote({ ...k, status: 'PENDING', note: 'Scores ' + round1(cred.score) + ' with ' + cred.pending + ' sub-criteria still pending.' });
      return cred.score >= 5
        ? withNote({ ...k, status: 'PASS', note: 'Credibility ' + round1(cred.score) + '.' })
        : withNote({ ...k, status: 'FAIL', note: 'Credibility ' + round1(cred.score) + ' after verification.' });
    }
    const tied = k.ties.map(t => byKey[t]).filter(Boolean);
    if (!tied.length) return withNote({ ...k, status: 'PENDING', note: 'Nothing scored against this yet.' });
    if (tied.some(t => t.score === null)) return withNote({ ...k, status: 'PENDING', note: 'Not answered in the quote.' });
    const worst = Math.min(...tied.map(t => t.score));
    if (worst >= 7 && tied.every(t => t.status === 'verified')) return withNote({ ...k, status: 'PASS', note: 'Met, and verified in writing.' });
    if (worst <= 2 && tied.every(t => t.status === 'verified')) return withNote({ ...k, status: 'FAIL', note: 'Verified and not met.' });
    return withNote({ ...k, status: 'PENDING', note: 'Partially answered — we need it in writing.' });
  });

  const failed = knockouts.filter(k => k.status === 'FAIL');
  const open = knockouts.filter(k => k.status === 'PENDING');
  const koStatus = failed.length ? 'DISQUALIFIED' : open.length ? 'CONDITIONAL' : 'CLEARED';

  const pendingTotal = categories.reduce((a, c) => a + c.pending, 0);

  return {
    assessment, overall, band: band(overall), categories, knockouts,
    koStatus, koFailed: failed, koOpen: open,
    pendingTotal, brief, hotelSet: hotels, cost,
    relativePrice, lowestPeerCost: lowest, rank: null
  };
}

export function scoreAll(assessments, shared) {
  const results = assessments.map(a => score(a, shared, assessments.filter(x => x !== a)));
  /* Rank on overall score, disqualified last. */
  const order = [...results].sort((a, b) => {
    const ad = a.koStatus === 'DISQUALIFIED', bd = b.koStatus === 'DISQUALIFIED';
    if (ad !== bd) return ad ? 1 : -1;
    return (b.overall ?? -1) - (a.overall ?? -1);
  });
  order.forEach((r, i) => { r.rank = i + 1; });
  return results;
}

/* -------------------------------------------------- questions to ask */

/* The headline feature: every question is ranked by how much of the overall
 * score it actually unlocks, so you ask the ones that decide the deal first.
 * Unlock = the movement in the overall score if that sub-criterion came back
 * at 9 instead of where it sits now. */
export function questions(result, shared) {
  const dest = shared?.destination || 'the destination';
  const out = [];

  const overallNow = result.overall;
  const catW = new Map(result.categories.map(c => [c.id, c.weight]));

  const unlockFor = (cat, sub) => {
    /* Recompute this category with the sub at 9, then the overall. */
    const subs = cat.subs.map(s => s.key === sub.key ? { ...s, score: 9 } : s);
    const { value: newCat } = weightedMean(subs);
    if (newCat === null) return 0;
    const items = result.categories.map(c => ({
      weight: c.weight,
      score: c.id === cat.id ? newCat : c.score
    }));
    const { value: newOverall } = weightedMean(items);
    if (newOverall === null || overallNow === null) return 0;
    return Math.max(0, newOverall - overallNow);
  };

  for (const cat of result.categories) {
    for (const sub of cat.subs) {
      if (sub.selfResearch) continue;
      if (sub.derived) continue;                       /* asked via the brief instead */
      const pending = sub.score === null;
      const weak = sub.score !== null && sub.score <= 4;
      if (!pending && !weak) continue;

      const ko = KNOCKOUTS.find(k => k.ties.includes(sub.key));
      const severity = ko ? 'knockout' : (sub.severity || (pending ? 'high' : sub.score <= 2 ? 'high' : 'medium'));

      out.push({
        id: sub.key,
        category: cat.name, categoryId: cat.id,
        criterion: sub.label,
        severity,
        kind: pending ? 'missing' : 'weak',
        score: sub.score,
        says: sub.evidence || (pending ? 'The quote does not address this.' : ''),
        matters: sub.signal,
        ask: (sub.ask || '').replace(/\{destination\}/g, dest),
        unlock: unlockFor(cat, sub)
      });
    }
  }

  /* Brief items that are missing or contradictory are their own questions. */
  const marks = result.assessment.brief || {};
  for (const req of BRIEF) {
    const st = marks[req.n];
    if (st !== 'missing' && st !== 'conflict') continue;
    out.push({
      id: 'brief.' + req.n,
      category: 'Brief · ' + req.area, categoryId: 'brief',
      criterion: req.text,
      severity: st === 'conflict' ? 'high' : 'medium',
      kind: st,
      score: null,
      says: (result.assessment.briefNotes || {})[req.n] || (st === 'conflict' ? 'The quote contradicts itself on this.' : 'Not in the quote.'),
      matters: 'We asked every DMC for this in the same brief.',
      ask: st === 'conflict'
        ? 'Your quote says two different things about "' + req.text + '". Which is correct?'
        : 'Our brief asked for "' + req.text + '". Please confirm it, or tell us why it is not possible.',
      unlock: 0
    });
  }

  const rank = { knockout: 0, high: 1, medium: 2, low: 3 };
  out.sort((a, b) => (rank[a.severity] - rank[b.severity]) || (b.unlock - a.unlock));
  out.forEach((q, i) => { q.n = i + 1; });
  return out;
}

/* ------------------------------------------------ negotiation pointers */

/* Each pointer is a lever with the arithmetic behind it and a line you can
 * actually send. Nothing here is generic advice — if the numbers do not
 * support a lever, the lever is not generated. */
export function negotiation(result, allResults, shared) {
  const p = [];
  const pax = num(shared?.pax) || 14;
  const cost = result.cost;
  const name = result.assessment.vendor.name;

  const compliant = allResults.filter(r => r.koStatus !== 'DISQUALIFIED' && r.cost.inrPp !== null);
  const cheapest = compliant.length
    ? compliant.reduce((a, b) => (a.cost.inrPp <= b.cost.inrPp ? a : b)) : null;

  /* 1 — price gap against the cheapest like-for-like quote */
  if (cheapest && cost.inrPp && cheapest !== result) {
    const gap = cost.inrPp - cheapest.cost.inrPp;
    const gapPct = gap / cheapest.cost.inrPp;
    if (gap > 0) {
      p.push({
        id: 'price-gap', strength: gapPct > 0.08 ? 'strong' : 'useful',
        lever: 'You are above the cheapest like-for-like quote',
        evidence: [
          'Landed cost ' + inr(cost.inrPp) + ' per person against ' + cheapest.assessment.vendor.name + ' at ' + inr(cheapest.cost.inrPp),
          'A gap of ' + inr(gap) + ' per person — ' + inr(gap * pax) + ' across ' + pax + ' travellers',
          'Both figures include our placeholders for what each of you left out, so this is like-for-like'
        ],
        say: 'We have a comparable quote landing at ' + inr(cheapest.cost.inrPp) + ' per person all in, against your ' + inr(cost.inrPp) + '. We would rather work with you — can you close the ' + inr(gap) + ' gap, or add value that covers it?'
      });
    }
  }

  /* 2 — unpriced lines are surcharges waiting to happen */
  if (cost.unpriced > 0) {
    const names = cost.lines.filter(l => l.kind !== 'quoted' && l.kind !== 'derived' && (l.value === null || l.note.startsWith('Our placeholder')))
      .map(l => l.label.toLowerCase());
    p.push({
      id: 'unpriced', strength: cost.unpriced >= 4 ? 'strong' : 'useful',
      lever: cost.unpriced + ' cost line' + (cost.unpriced === 1 ? '' : 's') + ' still unpriced',
      evidence: [
        'Unpriced: ' + names.join(', '),
        'Their quoted price is ' + usd(cost.quoted) + ' per person; our like-for-like landed cost is ' + usd(cost.usdTotal),
        'Every "if applicable" line is a surcharge we would find out about after we have sold the trip'
      ],
      say: 'Before we compare properly, please price every line you have marked excluded or "if applicable" for our exact dates — or give us one all-in figure with a written cap. We cannot sell a trip with open-ended surcharges in it.'
    });
  }

  /* 3 — money due at confirmation */
  if (cost.dueAtConfirmation !== null && cost.dueAtConfirmation > 0.4) {
    p.push({
      id: 'front-loaded', strength: cost.dueAtConfirmation > 0.55 ? 'strong' : 'useful',
      lever: pct(cost.dueAtConfirmation) + ' of the money falls due at confirmation',
      evidence: [
        pct(cost.dueAtConfirmation) + ' of ' + inr(cost.inrPp) + ' per person is ' + inr(cost.inrPp * cost.dueAtConfirmation) + ' — ' + inr(cost.inrPp * cost.dueAtConfirmation * pax) + ' for the group',
        'Trade norm for a group this size is 25-30% at confirmation with the balance 30 days out'
      ],
      say: 'Your terms put ' + pct(cost.dueAtConfirmation) + ' with you at confirmation. We work to 25-30% at confirmation and the balance 30 days before arrival. Can hotel payments be staged rather than settled in full up front?'
    });
  } else if (cost.dueAtConfirmation === null) {
    p.push({
      id: 'no-terms', strength: 'useful',
      lever: 'No payment terms on the table at all',
      evidence: ['Deposit percentage and balance date are both unstated', 'Until they are, there is nothing to negotiate and no customer terms we can publish'],
      say: 'Please send your payment schedule — deposit percentage and balance date — and your cancellation schedule. We cannot write our own customer terms without both.'
    });
  }

  /* 4 — premium money for non-premium delivery */
  const weakHeavy = result.categories
    .filter(c => c.block === 'proposal' && c.score !== null && c.score < 6 && c.weight >= 0.08)
    .sort((a, b) => (b.weight * (6 - b.score)) - (a.weight * (6 - a.score)));
  if (weakHeavy.length) {
    p.push({
      id: 'quality-gap', strength: 'strong',
      lever: 'Paying a premium price for categories that are not premium',
      evidence: weakHeavy.slice(0, 3).map(c =>
        c.name + ' scores ' + round1(c.score) + '/10 at ' + pct(c.weight) + ' of our decision — ' + c.tenLooksLike.toLowerCase()),
      say: 'We are being asked for 5-star money, but ' + weakHeavy.slice(0, 2).map(c => c.name.toLowerCase()).join(' and ') + ' in your quote ' + (weakHeavy.length > 1 ? 'do' : 'does') + ' not read 5-star to us. Either bring those up to what we briefed, or reflect it in the price.'
    });
  }

  /* 5 — hotel arbitrage: their implied room-night rate vs what we can book */
  const nights = result.hotelSet.nights;
  const hotelUsd = num(result.assessment.cost?.hotels);
  if (hotelUsd && nights) {
    const perRoomNight = hotelUsd * 2 / nights;
    const online = num(shared?.onlineRoomNight);
    const ev = ['Their hotel line is ' + usd(hotelUsd) + ' per person twin share over ' + nights + ' nights — ' + usd(perRoomNight) + ' per room per night'];
    if (online) {
      const delta = (perRoomNight - online) * nights * (pax / 2);
      ev.push('We can book the same room category online at about ' + usd(online) + ' per room-night');
      if (delta > 0) ev.push('Across ' + (pax / 2) + ' rooms and ' + nights + ' nights that is ' + usd(delta) + ' of margin sitting in the hotel line');
    }
    p.push({
      id: 'hotel-arbitrage', strength: online ? 'strong' : 'useful',
      lever: 'The hotel line is the easiest thing to test',
      evidence: ev,
      say: 'Your hotel line works out to ' + usd(perRoomNight) + ' per room per night. We can see these rooms online for our dates. Either match the online rate, or take hotels out and quote us land services only — we are happy either way.'
    });
  }

  /* 6 — validity and FX */
  const validity = result.categories.find(c => c.id === 'contract')?.subs.find(s => s.id === 'validity');
  if (validity && validity.score !== null && validity.score <= 3) {
    p.push({
      id: 'validity', strength: 'useful',
      lever: 'The price expires before we can sell the trip',
      evidence: [
        validity.evidence || 'Validity is effectively nil',
        'We need 30 days to take a group of ' + pax + ' from proposal to deposit'
      ],
      say: 'A price that expires the same day is not a price we can work with. Give us 30 days validity for this group, and tell us what deposit holds the named hotels and the rate.'
    });
  }

  /* 7 — what a rival includes that this one does not */
  for (const other of allResults) {
    if (other === result) continue;
    const better = result.categories
      .map(c => ({ c, o: other.categories.find(x => x.id === c.id) }))
      .filter(({ c, o }) => c.score !== null && o?.score !== null && o.score - c.score >= 2.5)
      .sort((a, b) => (b.o.score - b.c.score) - (a.o.score - a.c.score));
    if (better.length) {
      p.push({
        id: 'rival-' + other.assessment.id, strength: 'useful',
        lever: 'A rival quote already includes what is thin here',
        evidence: better.slice(0, 3).map(({ c, o }) =>
          c.name + ': ' + round1(c.score) + '/10 here against ' + round1(o.score) + '/10 from ' + other.assessment.vendor.name),
        say: 'Another DMC on the same brief has covered ' + better.slice(0, 2).map(x => x.c.name.toLowerCase()).join(' and ') + ' properly at a comparable price. Match that and you are the obvious choice.'
      });
    }
  }

  /* 8 — group-size sensitivity, always worth having before you sell seats */
  p.push({
    id: 'group-size', strength: 'useful',
    lever: 'We do not know what happens if fewer people sign up',
    evidence: [
      'Priced for ' + pax + ' travellers only',
      'If we sell ' + (pax - 4) + ' seats instead, the per-person cost moves and we carry it'
    ],
    say: 'Please send per-person pricing at ' + (pax - 4) + ' and ' + (pax - 2) + ' travellers as well, so we know our floor before we start selling seats.'
  });

  /* 9 — competitive tension, stated plainly */
  if (allResults.length > 1) {
    p.push({
      id: 'tension', strength: 'useful',
      lever: 'They are not the only quote on this brief',
      evidence: [
        allResults.length + ' DMCs quoted the same brief',
        (compliant.length || 0) + ' are still in contention on landed cost',
        'Current ranking puts ' + name + ' at number ' + result.rank
      ],
      say: 'We briefed several DMCs identically and we are comparing on one scoresheet. You are close — the gap is ' + (weakHeavy[0] ? weakHeavy[0].name.toLowerCase() : 'the detail') + ' and the commercial terms.'
    });
  }

  const strengthRank = { strong: 0, useful: 1 };
  p.sort((a, b) => strengthRank[a.strength] - strengthRank[b.strength]);
  p.forEach((x, i) => { x.n = i + 1; });
  return p;
}

/* -------------------------------------------------------------- verdict */

export function verdict(result) {
  if (result.assessment.verdict) return result.assessment.verdict;
  const r = result;
  if (r.overall === null) return 'Nothing scored yet. Upload a quote to score it.';
  const strong = r.categories.filter(c => c.score !== null && c.score >= 7).map(c => c.name.toLowerCase());
  const weak = r.categories.filter(c => c.score !== null && c.score < 4).map(c => c.name.toLowerCase());
  const bits = [];
  if (strong.length) bits.push('Strong on ' + strong.slice(0, 2).join(' and '));
  if (weak.length) bits.push((bits.length ? 'weak on ' : 'Weak on ') + weak.slice(0, 3).join(', '));
  if (r.koOpen.length) bits.push(r.koOpen.length + ' knock-out' + (r.koOpen.length === 1 ? '' : 's') + ' still open');
  if (r.pendingTotal) bits.push(r.pendingTotal + ' sub-criteria pending');
  return bits.join('. ') + '.';
}
