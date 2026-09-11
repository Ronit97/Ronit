/* voice.js — the house voice, as rules a machine can check.
 *
 * The brand book is blunt about tone, and most of it is mechanically
 * checkable: no emoji, no exclamation marks, no brochure adjectives, sentence
 * case, a lowercase handwritten line under twelve words, numbers instead of
 * adjectives. So we check it, on every draft, and show what failed.
 */

/* Words the brand book says appear nowhere. */
const BANNED_WORDS = [
  'premium', 'luxury', 'luxurious', 'bespoke', 'curated', 'handpicked', 'hand-picked',
  'seamless', 'seamlessly', 'elevated', 'elevate', 'immersive', 'immersion'
];

/* How the brand refuses to describe its own travellers. */
const BANNED_PEOPLE = [
  'senior citizen', 'senior citizens', 'the elderly', 'elderly travellers', 'elderly travelers',
  'the client', 'our clients', 'the guest', 'our guests', 'valued traveller', 'valued travelers', 'valued travellers'
];

/* Travel-brochure language. */
const BANNED_BROCHURE = [
  'hidden gem', 'hidden gems', 'breathtaking', 'journey of a lifetime', 'trip of a lifetime',
  'must-see', 'must see', 'bucket list', 'off the beaten track', 'off the beaten path',
  'stunning vista', 'vistas', 'paradise', 'nestled'
];

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F2FF}\u{2600}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;

export const words = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;

/* The body, as one string, for counting and checking. */
export function bodyText(body) {
  return (body || []).map(b =>
    b.type === 'bullets' ? (b.items || []).join(' ') : (b.text || '')
  ).join(' ').trim();
}

export const bodyWordCount = body => words(bodyText(body));

/* Links belong to the trend record, never to the writing. Anything that looks
 * like a URL or a markdown link is taken out of the prose. */
export function stripLinks(s) {
  return String(s || '')
    .replace(/\[([^\]]+)\]\((?:[^)]*)\)/g, '$1')
    .replace(/\bhttps?:\/\/\S+/gi, '')
    .replace(/\bwww\.\S+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function findAny(haystack, list) {
  const low = ' ' + haystack.toLowerCase().replace(/[^a-z\s-]/g, ' ').replace(/\s+/g, ' ') + ' ';
  return list.filter(w => low.includes(' ' + w + ' ') || low.includes(' ' + w + 's '));
}

/* Runs the house rules over a draft. Every check is pass or fail with the
 * offending text named, so a failure is fixable rather than just red. */
export function houseCheck(post) {
  const head = String(post.headline || '');
  const sub = String(post.subline || '');
  const body = bodyText(post.body);
  const all = [head, sub, body].join(' \n ');
  const count = bodyWordCount(post.body);

  const checks = [];
  const add = (id, label, pass, detail) => checks.push({ id, label, pass, detail: detail || '' });

  add('length', 'Under 200 words', count < 200, count + ' words in the summary');

  add('emoji', 'No emoji', !EMOJI.test(all),
    EMOJI.test(all) ? 'Found ' + (all.match(EMOJI) || [''])[0] : '');

  const bangs = (all.match(/!/g) || []).length;
  add('bang', 'No exclamation marks', bangs === 0, bangs ? bangs + ' found' : '');

  add('not-question', 'Headline is not a question', !head.trim().endsWith('?'), '');

  add('full-stop', 'Headline ends with a full stop', /[.]\s*$/.test(head.trim()), '');

  /* Title Case shows up as a run of capitalised words. Three in a row is the
   * giveaway; proper nouns rarely stack that deep in a headline. */
  const titleCase = /(?:\b[A-Z][a-z]+\b[ ]){2}\b[A-Z][a-z]+\b/.test(head.replace(/^\S+\s/, ''));
  add('sentence-case', 'Headline is sentence case', !titleCase, titleCase ? 'Reads as Title Case' : '');

  const bw = [...findAny(all, BANNED_WORDS)];
  add('banned', 'No premium / curated / seamless', bw.length === 0, bw.join(', '));

  const bp = findAny(all, BANNED_PEOPLE);
  add('people', 'Calls them parents, not clients', bp.length === 0, bp.join(', '));

  const bb = findAny(all, BANNED_BROCHURE);
  add('brochure', 'No brochure language', bb.length === 0, bb.join(', '));

  const subWords = words(sub);
  add('subline', 'Handwritten line is lowercase, under 12 words',
    !!sub && subWords > 0 && subWords < 12 && sub === sub.toLowerCase(),
    !sub ? 'Missing' : subWords >= 12 ? subWords + ' words' : sub !== sub.toLowerCase() ? 'Has capitals' : '');

  add('numbers', 'Uses a real number', /\d/.test(body), '');

  add('wavy', 'One phrase marked for the wavy underline',
    !!post.wavy && head.includes(post.wavy), post.wavy && !head.includes(post.wavy) ? 'Phrase is not in the headline' : '');

  return { checks, passed: checks.filter(c => c.pass).length, total: checks.length, count };
}

/* --------------------------------------------------------------- the brief */

const VOICE = `You are writing the journal for The Trip Keeper — two people in Jodhpur, Cheshta and Ronit, who take parents and grandparents on twelve-seat trips that a founder personally hosts. The average traveller is 62. Often it is a first trip abroad. Some use a stick. Most worry about the food.

The reader is usually the adult child, aged 30 to 50, researching on a phone late at night because a parent mentioned wanting to travel. They are buying the absence of worry.

HOW WE SOUND
Warm, blunt, unfussy, a bit funny. First person plural — "we", and "your parents" more often than "you". We name the uncomfortable thing out loud before we sell anything, because a brand that only says nice things has told you nothing. "Group tours are rubbish. So we built the opposite."

HEADLINES
- Sentence case. Never Title Case.
- End with a full stop. It gives the flat, declarative beat the voice depends on.
- Never a question. Never an exclamation mark.
- Two sentences is the ideal shape: problem, then answer.
- Never a pun on a travel word.

THE HANDWRITTEN LINE
One lowercase line under the headline, under twelve words, doing the editorialising. This is where the humour lives and nowhere else. Dry, not zany — a raised eyebrow, not a punchline. It must say something the headline does not. Never restate the headline.

THE WRITING
- Be specific, not aspirational. Every adjective should be replaceable with a fact. Not "comfortable accommodation suited to older travellers" but "ground-floor rooms, lifts over stairs, late starts every day".
- Use numbers. Real ones, from the facts you are given.
- Write short. If a sentence has two ideas, make it two sentences.
- Money in rupees as Rs with Indian digit grouping, for example Rs 1,05,000.
- Name the worry out loud: knees, food, medication, "will someone look after them".
- Mention Jodhpur where it genuinely fits. Never force it.

NEVER
- Never the words premium, luxury, bespoke, curated, handpicked, seamless, elevated, immersive.
- Never "senior citizens" or "the elderly". They are travellers, parents, or people with names.
- Never brochure language: no hidden gems, no breathtaking anything, no journeys of a lifetime, no bucket lists.
- Never an emoji. Not one, anywhere.
- Never an exclamation mark.
- Never a URL, a link or a source name in your prose. Sources are attached separately, by us.
- Never invent a fact, a statistic or a quote. Use only the facts given below.`;

export function buildPrompt(trend, opts = {}) {
  const { angleHint = '', take = 1, tighten = null } = opts;

  if (tighten) {
    return `${VOICE}

You wrote this draft and the summary came to ${tighten.count} words. It must be UNDER 200.

Cut it to about 170 words. Take out whole sentences rather than trimming words from every sentence — the voice depends on short, complete sentences. Keep the numbers, keep the headline, keep the handwritten line.

Current draft as JSON:
${JSON.stringify({ headline: tighten.headline, wavy: tighten.wavy, subline: tighten.subline, body: tighten.body }, null, 2)}

Return the same JSON shape, nothing else.`;
  }

  return `${VOICE}

WHAT TO WRITE ABOUT
${trend.title}

The facts. Use these and nothing else — do not add statistics of your own:
${trend.facts.map(f => '- ' + f).join('\n')}

Why this matters to us, in our own words — use it as the angle, do not quote it:
${trend.angle}

${angleHint ? 'The editor has asked for this specifically: ' + angleHint + '\n' : ''}${take > 1 ? 'This is take ' + take + '. Find a genuinely different opening and a different structure from an obvious first draft — a different fact to lead on, or bullets where prose would be expected.\n' : ''}
LENGTH
The summary must be UNDER 200 words. Aim for 150 to 185. Count as you write.

SHAPE
Two to four short paragraphs, or a short paragraph plus a tight bulleted list where the facts are genuinely a list. Not every post needs bullets. Open on the most concrete thing in the facts, not on a scene-setting generality.

RETURN THIS JSON, AND NOTHING ELSE
{
  "headline": "sentence case, ends with a full stop, no question, no exclamation mark",
  "wavy": "the exact phrase from inside the headline that gets the wavy underline — the emotional word, not the descriptive one",
  "subline": "the lowercase handwritten line, under twelve words, saying something the headline does not",
  "body": [
    { "type": "p", "text": "a paragraph" },
    { "type": "bullets", "items": ["a point", "another point"] }
  ]
}

"wavy" must be a substring of "headline", copied exactly.`;
}

export { BANNED_WORDS, BANNED_PEOPLE, BANNED_BROCHURE };
