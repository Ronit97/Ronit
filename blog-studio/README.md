# Journal Studio

Writes a short journal post for thetripkeeper.com from a real, current travel
trend — in the house voice, under 200 words, with source links that cannot
have been invented.

## The constraint worth knowing

**A published artifact page cannot search the web.** The `sample` capability
cannot browse, and the page's network is limited to a CDN allowlist, so there
is no route to a search API from inside the page.

So the work is split:

- **Research happens outside the page.** Trends are searched, cross-checked and
  written into `trends.js` with their real source URLs, facts and a house
  angle. A scheduled job can add more into the `pool` collection in the
  artifact's database, and the studio merges those in front of the ones that
  shipped.
- **Writing happens in the page.** Refresh takes the freshest unwritten trend
  and has Claude write it from those facts alone.

## Links can't be hallucinated

The prompt forbids URLs in the prose, `stripLinks()` removes any that appear
anyway, and the rendered post takes its links *only* from the trend record's
`sources` array, filtered to `https://`. Claude writes the words. It never
supplies a link.

## The house-rules check

The brand book's voice section is mostly mechanical, so it is enforced rather
than hoped for. Every draft is checked on twelve rules and the result sits
beside the post:

under 200 words · no emoji · no exclamation marks · headline is not a question ·
headline ends with a full stop · headline is sentence case · no
premium/curated/seamless · calls them parents, not clients · no brochure
language · handwritten line is lowercase and under twelve words · uses a real
number · one phrase marked for the wavy underline

A draft that runs over 200 words gets one automatic tightening pass. One —
never a loop.

## Two registers, on purpose

The studio chrome is the **admin register** (brand book p45): straight edges,
2px borders, no rotation, tight density. The post preview is the **public
register** (p24–27): 3px ink borders, the wobbly radii, a hard offset shadow,
a slight tilt and the wavy underline — because that is how it will look on the
site, and a preview should show the real thing. The brand book says not to
blend them, so they are kept distinct and labelled.

## Files

| File | What it holds |
|---|---|
| `trends.js` | The trend queue: facts, angle and checked source URLs |
| `voice.js` | The house voice as a prompt, and the twelve rules as code |
| `studio.js` | The studio |
| `studio.css` | Both registers |
| `index.html` | Page shell |

## A note on tone

The brief asked for a fun, enthusiastic voice. The brand book bans exclamation
marks, brochure adjectives and emoji, and puts the humour in the lowercase
handwritten line instead. The brand book wins — it is the house voice, and it
is warm and funny in its own register. The "steer it" field nudges an
individual post without forking the voice.
