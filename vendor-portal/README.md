# Vendor Assessment Portal

Scores a DMC quote out of 10 and tells you what to ask and where to push.

Upload what the vendor sent — email text, PDF, Excel or Word — and the portal
scores it across 12 weighted categories, works out a like-for-like landed cost,
generates the questions to ask ranked by how much score each one unlocks, and
derives negotiation pointers with the arithmetic behind them.

## Where it came from

`TTK_DMC_Evaluation_Vietnam.xlsx`, ported and trimmed. The engine reproduces
the workbook's figures exactly — Vaayutrip 5.1109, Indovietnam 5.8676, and
every category, landed cost and compliance percentage in between.

Dropped on purpose: the Transport, Food and Hotel & Flight vendor templates.
Folded in rather than dropped: the Hotels sheet is now the Hotels category's
drill-down, and Brief vs Quote is the brief matrix that feeds two sub-scores.

## Files

| File | What it holds |
|---|---|
| `rubric.js` | 12 categories, their sub-criteria and weights, the 5 knock-outs, the 28-line brief, hotel scoring |
| `engine.js` | Weighted scoring, landed cost, question generation, negotiation pointers |
| `ingest.js` | PDF / Excel / Word / email reading, Claude extraction, and a deterministic rules fallback |
| `seed.js` | The two scored Vietnam quotes, as worked examples |
| `app.js` | The portal itself |
| `styles.css` | Brand book tokens, admin register |
| `index.html` | Page shell |

## How the scoring works

- A category score is the weighted mean of its sub-criteria. **A sub-criterion
  with no answer is excluded and the rest renormalised** — a silent quote is
  never scored as a zero, because "they did not say" is a question, not a
  failure.
- **Hotels** is scored per property, then combined weighted by nights: three
  poor nights matter more than one.
- **Price & value** is scored relative to the cheapest like-for-like landed
  cost once two quotes exist. Because the landed cost already carries a
  placeholder for every line a vendor left unpriced, incompleteness is priced
  in rather than counted twice.
- **Knock-outs** clear only on evidence in writing, never on a good score
  alone. Any FAIL disqualifies regardless of the total.
- **Question ranking** recomputes the overall score with that sub-criterion at
  9 and sorts by the difference, so the questions that actually decide the deal
  come first.

## Reading a quote

With the `sample` capability granted, Claude reads the document against the
rubric and returns a score, a status and an evidence line for every
sub-criterion, plus the hotel list, cost lines and brief matrix. Everything it
returns is range-checked and key-filtered before it reaches the engine.

Without it, a deterministic rules pass reads the signals that can be read
literally and leaves the rest pending — labelled as such, rather than
fabricating precision.

Every score is editable. Claude drafts, you confirm; an edited score is marked
as yours and re-weighted immediately.

## Design

The Trip Keeper brand book, admin register (p45): same palette and three fonts,
but no rotation and no wobbly radii. Straight edges, 5–8px radii, 2px borders,
tight data density. Caveat for annotations, offset shadows on buttons, dashed
dividers, native `<progress>` for bars.
