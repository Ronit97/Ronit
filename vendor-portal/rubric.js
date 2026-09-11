/* The Trip Keeper — Vendor Assessment Portal
 * rubric.js — the scoring model.
 *
 * Ported from TTK_DMC_Evaluation_Vietnam.xlsx and deliberately trimmed:
 * the three vendor-facing templates (Transport, Food, Hotel & Flight) are gone,
 * the Hotels sheet is folded into the Hotels category, and Brief vs Quote is
 * folded into the brief matrix that drives two sub-scores automatically.
 *
 * Weights: category weights sum to 1.00. Sub-criterion weights are out of 100
 * within their category. A sub-criterion with score === null is PENDING: it is
 * excluded and the remaining weights are renormalised, so a silent quote is
 * never quietly scored as a zero.
 */

export const BLOCKS = [
  { id: 'proposal', name: 'The proposal',  weight: 0.55, note: 'what they are actually selling us' },
  { id: 'company',  name: 'The company',   weight: 0.45, note: 'whether they can be trusted to deliver it' }
];

export const SCORE_BANDS = [
  { min: 9,   label: 'Excellent',            tone: 'good' },
  { min: 7,   label: 'Good, minor gaps',     tone: 'good' },
  { min: 5,   label: 'Acceptable with fixes', tone: 'warn' },
  { min: 3,   label: 'Weak or unanswered',   tone: 'bad'  },
  { min: 0,   label: 'Missing or unacceptable', tone: 'bad' }
];

export function band(score) {
  if (score === null || score === undefined || Number.isNaN(score)) return { label: 'Not scored', tone: 'none' };
  return SCORE_BANDS.find(b => score >= b.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

/* ---------------------------------------------------------------------------
 * Categories
 * `signal` tells the extraction what to look for in a quote.
 * `ask` is the question generated when the sub-criterion is weak or pending.
 * ------------------------------------------------------------------------- */

export const CATEGORIES = [
  {
    id: 'hotels', block: 'proposal', weight: 0.15, name: 'Hotels',
    sub: 'where your parents actually sleep',
    tenLooksLike: 'Named 5-star hotels, guest scores 9+, close to the day\'s plans, lifts, exact room category.',
    /* Scored per hotel on the Hotels sheet criteria, then combined weighted by
     * nights. When no per-hotel detail exists these act as flat sub-criteria. */
    perHotel: true,
    subs: [
      { id: 'class_brand',   label: 'Class & brand',        weight: 20, signal: 'Official star rating and whether it is an international brand, a well-run local 5-star, or an ageing property.', ask: 'What is the official star rating of each hotel, and is it currently operating under that brand?' },
      { id: 'guest_rating',  label: 'Guest rating',         weight: 30, signal: 'Guest review scores from Booking.com / Expedia / Tripadvisor. Calculated, not taken from the quote.', ask: 'Nothing to ask the DMC — look these up yourself and enter them.', selfResearch: true },
      { id: 'location_fit',  label: 'Location fit',         weight: 20, signal: 'Distance from the places that day\'s plan actually goes to.', ask: 'How far is each hotel from that day\'s sightseeing, in minutes by road?' },
      { id: 'room_category', label: 'Room category named',  weight: 10, signal: 'The exact room category name, not just "deluxe" or nothing at all.', ask: 'Please confirm the exact room category at each hotel, as it appears on the hotel\'s own rate sheet.' },
      { id: 'senior_fit',    label: 'Senior fit',           weight: 10, signal: 'Lifts, short walks, step-free bathrooms, low noise, veg breakfast.', ask: 'Do all rooms have lift access, and are any of them up steps? What is the walk from lobby to room?' },
      { id: 'confirmation',  label: 'Named, not "or similar"', weight: 10, signal: 'Whether hotels are confirmed by name and held, or hedged with "or similar".', ask: 'Please confirm all hotels by name with no "or similar", and tell us what deposit holds the rooms. Substitution only with our written approval and to an equal or higher category.', severity: 'high' }
    ]
  },
  {
    id: 'experiences', block: 'proposal', weight: 0.12, name: 'Experiences & itinerary',
    sub: 'the days themselves',
    tenLooksLike: 'Every requested experience as specified, private where asked, legal under current rules, senior-friendly pacing.',
    subs: [
      { id: 'coverage',       label: 'Coverage of what we asked for', weight: 35, signal: 'Calculated from the brief matrix — do not score from the quote text.', ask: 'Please add the experiences missing from your itinerary, or tell us why they are not possible on our dates.', derived: 'experienceCoverage' },
      { id: 'private_shared', label: 'Private vs shared, as briefed', weight: 15, signal: 'Whether tours, boats and transfers are exclusive to our group or sold as a seat-in-coach / sharing basis.', ask: 'Is every activity and transfer private to our group? Name anything that is on a sharing basis, and quote the private alternative.' },
      { id: 'pace',           label: 'Pace & senior suitability',    weight: 15, signal: 'Departure times, hours on the road, how many major activities a day, any day over about 10 hours door to door.', ask: 'Please send door-to-door timings for the longest day. Our travellers average 62 — we need one major activity a day and late starts.' },
      { id: 'feasibility',    label: 'Accuracy & feasibility',       weight: 20, signal: 'Wrong airports or cities, activities that current local rules do not allow, shows that only run on certain nights, seasonal closures.', ask: 'Please send a corrected day-wise itinerary — we found factual errors in this one.' },
      { id: 'product_quality',label: 'Quality of the products chosen',weight: 15, signal: 'Which specific cruise, park, ticket class or operator is being used, and whether it is the good one.', ask: 'Which operator and ticket class are you using for each paid experience?' }
    ]
  },
  {
    id: 'food', block: 'proposal', weight: 0.10, name: 'Food',
    sub: 'our travellers\' number one anxiety',
    tenLooksLike: 'Indian veg guaranteed in writing, named restaurants with menus, Jain possible, water with meals.',
    subs: [
      { id: 'indian_veg',      label: 'Indian vegetarian commitment', weight: 35, signal: 'An explicit written commitment to Indian vegetarian food at every included meal. "Indian restaurant" is not the same as "pure vegetarian kitchen".', ask: 'Please confirm in writing that every included lunch and dinner is Indian and pure vegetarian, and that Jain / no onion-garlic is possible on request.', severity: 'knockout' },
      { id: 'restaurants',     label: 'Restaurants and menus disclosed', weight: 25, signal: 'Named restaurants with addresses and sample menus, versus "to be advised" or "after confirmation".', ask: 'Please name the restaurant for each included meal, with a sample menu for each. We do not need final allocations — we need to see what our parents will be eating.' },
      { id: 'meal_coverage',   label: 'Meal coverage',               weight: 20, signal: 'Which of breakfast, lunch and dinner are included on which days, and which meals are left out.', ask: 'Which meals are not included, on which days? We asked for breakfast, lunch and dinner throughout.' },
      { id: 'excursion_risk',  label: 'Veg risk on excursion meals', weight: 10, signal: 'What happens to lunch on boat days, park days and long drives — "local lunch" is a red flag.', ask: 'What exactly is served for lunch on the boat and theme-park days? "Local lunch" will not work for this group.' },
      { id: 'drinks_water',    label: 'Drinks and water with meals', weight: 10, signal: 'Whether drinking water and tea are included with meals or billed separately.', ask: 'Is drinking water included with every meal and on the coach? How much per person per day?' }
    ]
  },
  {
    id: 'transport', block: 'proposal', weight: 0.08, name: 'Internal transport',
    sub: 'eight hours a day in this vehicle',
    tenLooksLike: 'Private recent-model premium coach with photos, room to spread out, luggage fits.',
    subs: [
      { id: 'private',      label: 'Private, not shared',        weight: 20, signal: 'Whether the vehicle is exclusive to our group.', ask: 'Is the coach exclusive to our group on every transfer and every sightseeing day?' },
      { id: 'size_luggage', label: 'Size and luggage fit',       weight: 30, signal: 'Seat count against our group size, and stated luggage capacity in large suitcases.', ask: 'How many seats, and how many 23 kg suitcases fit in the hold with the group on board?' },
      { id: 'comfort',      label: 'Comfort and class',          weight: 25, signal: 'Vehicle class, reclining seats, air conditioning, step height for boarding.', ask: 'What class of coach is it, does it have reclining seats, and what is the step height for boarding?' },
      { id: 'disclosure',   label: 'Make, model, year, photos',  weight: 25, signal: 'Named make and model, year of manufacture, interior and exterior photographs.', ask: 'Please send the make, model, year and interior and exterior photographs of the actual coach class you would use. We do not need the exact registration — we need to see the class.' }
    ]
  },
  {
    id: 'guides', block: 'proposal', weight: 0.05, name: 'Guides',
    sub: 'somebody has to answer the questions',
    tenLooksLike: 'Named English-speaking guide every day, consistent throughout.',
    subs: [
      { id: 'coverage', label: 'Guide coverage vs brief', weight: 60, signal: 'Which days have a guide and which do not. Watch for an inclusions list that promises a guide while the day-wise plan says "no guide".', ask: 'Please confirm an English-speaking guide on every day, arrival and departure days included, and name the language standard.' },
      { id: 'clarity',  label: 'Clarity and consistency', weight: 40, signal: 'Whether the quote contradicts itself about guides.', ask: 'Your quote lists a guide in the inclusions but says "no guide" on some days. Which is correct?' }
    ]
  },
  {
    id: 'flights', block: 'proposal', weight: 0.05, name: 'Internal flights',
    sub: 'the biggest line they left out',
    tenLooksLike: 'Both sectors on a full-service airline, 23 kg bags, sensible timings.',
    subs: [
      { id: 'included',  label: 'Included as requested',            weight: 50, signal: 'Whether internal sectors are priced in or excluded.', ask: 'Please quote every internal sector with the fare per person. It is the largest cost line missing from your quote.', severity: 'high' },
      { id: 'disclosure',label: 'Airline, timings, baggage shown',  weight: 30, signal: 'Airline, flight numbers, departure and arrival times, checked baggage allowance.', ask: 'Please give airline, flight number, timings and checked baggage allowance for each internal sector. We need 23 kg per person.' },
      { id: 'transfers', label: 'Airport transfers on flight days', weight: 20, signal: 'Whether transfers at both ends of each internal flight are included.', ask: 'Are airport transfers included at both ends of every internal flight?' }
    ]
  },
  {
    id: 'price', block: 'company', weight: 0.15, name: 'Price & value',
    sub: 'one price, everything in it',
    tenLooksLike: 'Lowest like-for-like landed cost among compliant DMCs.',
    relative: true,
    subs: [
      { id: 'headline',     label: 'Headline competitiveness', weight: 50, signal: 'The quoted per-person price and what it covers.', ask: 'Please confirm the price is per person on twin share, and what it includes.' },
      { id: 'completeness', label: 'Completeness of price',    weight: 30, signal: 'How many real cost lines are left unpriced — surcharges, visas, flights, gala dinners, fast passes.', ask: 'Please price every line you have marked "if applicable" or excluded, for our exact dates. An unpriced surcharge is a surcharge.', severity: 'high' },
      { id: 'transparency', label: 'Transparency of breakup',  weight: 20, signal: 'Whether the price is broken into components or presented as one package figure.', ask: 'Please break the cost into hotels, transport, guides, entrances and meals. Even a split between hotels and land services would help.' }
    ]
  },
  {
    id: 'credibility', block: 'company', weight: 0.10, name: 'Credibility',
    sub: 'who are we actually sending money to',
    tenLooksLike: 'Licensed in the destination, 5+ years, independent reviews, references that check out.',
    subs: [
      { id: 'entity',     label: 'Legal entity and track record',      weight: 25, signal: 'Registered company name, registration number, incorporation date, paid-up capital, filed revenue.', ask: 'Given how recently the company was incorporated and the paid-up capital on record, what insurance or bond covers our travellers\' money if the company fails, and which entity carries the liability on our contract?' },
      { id: 'licence',    label: 'Operating licence in the destination', weight: 30, signal: 'A licence to operate tours in the destination country — either their own, or a named licensed local ground handler. A representative office generally cannot trade.', ask: 'Which company holds the international travel licence for our ground services in {destination} — you, or a local partner? Please share the licence number and the partner\'s registered name.', severity: 'knockout' },
      { id: 'reviews',    label: 'Independent reviews',               weight: 20, signal: 'Reviews on platforms the vendor does not control, and how many. Self-reported awards do not count.', ask: 'Nothing to ask — look them up yourself on Tripadvisor, Google and the trade directories.', selfResearch: true },
      { id: 'web',        label: 'Website and professionalism',       weight: 10, signal: 'Whether the website is a real working site or a template with placeholder text still in it.', ask: 'Nothing to ask — check the website yourself.', selfResearch: true },
      { id: 'references', label: 'Trade references',                  weight: 15, signal: 'Named agencies that have run comparable groups with them recently, contactable.', ask: 'Please share three agencies that ran groups with you in {destination} in the last two seasons, with a contact at each. This is the only way we can verify a B2B operator.', severity: 'high' }
    ]
  },
  {
    id: 'support', block: 'company', weight: 0.05, name: 'On-ground support',
    sub: 'who picks up at 2 am',
    tenLooksLike: 'Named 24/7 contact, staff in each city, written medical protocol.',
    subs: [
      { id: 'contact_247',    label: 'Named 24/7 contact in the destination', weight: 50, signal: 'A named person with a local number or WhatsApp — not a generic "24/7 assistance" claim.', ask: 'Who is our named 24/7 contact in {destination}? Please give the name and WhatsApp number of the actual person, not a company line.', severity: 'knockout' },
      { id: 'local_presence', label: 'Presence in each city',                weight: 30, signal: 'Whether they have staff in each city on the itinerary or only one office.', ask: 'Who is physically present in each city we are visiting? Names and numbers.' },
      { id: 'medical',        label: 'Emergency and medical protocol',       weight: 20, signal: 'A written protocol for a medical emergency — nearest hospital per city, who accompanies, who pays.', ask: 'What is your written medical-emergency protocol in each city? Nearest hospital, who accompanies our traveller, and who settles the bill.' }
    ]
  },
  {
    id: 'payment', block: 'company', weight: 0.05, name: 'Payment terms',
    sub: 'how much of our money, how early',
    tenLooksLike: '30% or less at confirmation, balance 30 days out, home currency or locked FX.',
    subs: [
      { id: 'due_at_confirmation', label: 'Money due at confirmation', weight: 50, signal: 'The percentage or amount payable at booking. Watch for 100% of hotels being due up front.', ask: 'What percentage is due at confirmation, and can hotel payments be staged rather than paid in full up front?' },
      { id: 'balance_timing',      label: 'Balance timing',            weight: 30, signal: 'How many days before travel the balance falls due.', ask: 'When is the balance due, in days before arrival?' },
      { id: 'fx',                  label: 'Currency and FX exposure',  weight: 20, signal: 'Billing currency, which rate is used, when it is fixed, and any remittance fees.', ask: 'Which entity and bank receive payment, in what currency, and can the exchange rate be locked on the deposit date rather than the final-payment date?' }
    ]
  },
  {
    id: 'contract', block: 'company', weight: 0.05, name: 'Cancellation & contract',
    sub: 'the part nobody reads until it matters',
    tenLooksLike: 'Written refund schedule, named hotels, no open-ended surcharges, 30-day validity or better.',
    subs: [
      { id: 'cancellation', label: 'Cancellation / refund schedule', weight: 30, signal: 'A written schedule of what is refundable at what notice.', ask: 'Please share your cancellation and refund schedule. We cannot write our own customer terms without it.', severity: 'high' },
      { id: 'substitution', label: 'Substitution risk',             weight: 25, signal: 'Whether hotels and services are held, or hedged with "or similar" and "subject to availability".', ask: 'What is held, and what is merely quoted? Substitution only with our written approval and to an equal or higher category.' },
      { id: 'surcharge',    label: 'Surcharge exposure',            weight: 25, signal: 'Open-ended peak-season, festival or fuel surcharges, and compulsory gala dinners.', ask: 'Please confirm every peak-season or festival surcharge for our exact dates now, including any compulsory gala dinner at any hotel, with the cost per person.', severity: 'high' },
      { id: 'validity',     label: 'Price validity',                weight: 20, signal: 'How long the quoted price stands. Hours is not a validity.', ask: 'Can you give us 30 days validity on this price for this group? We have to sell the trip before we can confirm it.', severity: 'high' }
    ]
  },
  {
    id: 'responsiveness', block: 'company', weight: 0.05, name: 'Responsiveness & quote quality',
    sub: 'how they behave before they have our money',
    tenLooksLike: 'Fast, accurate, complete answer to every item in the brief.',
    subs: [
      { id: 'speed',        label: 'Speed',                weight: 25, signal: 'Turnaround from brief to quote, and from question to answer.', ask: 'Nothing to ask — measure it from your own inbox.', selfResearch: true },
      { id: 'accuracy',     label: 'Accuracy',             weight: 25, signal: 'Factual errors: wrong cities, wrong names, contradictions, policies for the wrong kind of group.', ask: 'Please send a corrected quote — we found factual errors in this one.' },
      { id: 'completeness', label: 'Completeness vs brief',weight: 30, signal: 'Calculated from the brief matrix — do not score from the quote text.', ask: 'Please answer the items in our brief that your quote does not address.', derived: 'briefCompliance' },
      { id: 'flexibility',  label: 'Flexibility',          weight: 20, signal: 'Willingness to customise, to show things before confirmation, to hold a price.', ask: 'Are you able to adjust the itinerary and show us vehicle and restaurant detail before we confirm?' }
    ]
  }
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

/* ---------------------------------------------------------------------------
 * Knock-outs. A FAIL disqualifies regardless of score.
 * ------------------------------------------------------------------------- */

export const KNOCKOUTS = [
  { id: 'K1', label: 'Verifiable legal entity + operating licence in the destination (own, or a named licensed ground handler)', ties: ['credibility.licence'] },
  { id: 'K2', label: 'Named 24/7 on-ground emergency contact in the destination',                                               ties: ['support.contact_247'] },
  { id: 'K3', label: 'Written guarantee of Indian vegetarian meals at every included meal',                                     ties: ['food.indian_veg'] },
  { id: 'K4', label: 'Credibility score of 5 or better after verification',                                                     ties: ['credibility'], rule: 'credibility>=5' },
  { id: 'K5', label: 'Hotels confirmed by name before deposit — no "or similar" at booking',                                    ties: ['hotels.confirmation'] }
];

/* ---------------------------------------------------------------------------
 * The brief. 28 requirements, every DMC scored against the same list.
 * Status: met | partial | missing | conflict.
 * `experience: true` marks the 10 requested experiences, which drive
 * experiences.coverage separately from overall brief compliance.
 * ------------------------------------------------------------------------- */

export const BRIEF = [
  { n: 1,  area: 'Trip basics', text: 'Travel dates as briefed, 10 days / 8 nights' },
  { n: 2,  area: 'Trip basics', text: '14 adults (7 couples), 7 double/twin rooms' },
  { n: 3,  area: 'Trip basics', text: 'Group flies from Ahmedabad — plan accordingly; international flight options' },
  { n: 4,  area: 'Trip basics', text: '5-star accommodation throughout' },
  { n: 5,  area: 'Trip basics', text: 'Breakfast, lunch and dinner included' },
  { n: 6,  area: 'Trip basics', text: 'Meals Indian and vegetarian throughout' },
  { n: 7,  area: 'Trip basics', text: 'Night split: Phu Quoc 3, Da Nang 2, Hoi An 1, Hanoi 2, Ha Long day cruise' },
  { n: 8,  area: 'Experience',  text: 'Kiss of the Sea & Symphony of the Sea', experience: true },
  { n: 9,  area: 'Experience',  text: 'VinWonders & Vinpearl Safari including fast pass and buggy', experience: true },
  { n: 10, area: 'Experience',  text: 'Three-Island tour with snorkelling', experience: true },
  { n: 11, area: 'Experience',  text: 'My An Beach & Dragon Bridge', experience: true },
  { n: 12, area: 'Experience',  text: 'Ba Na Hills, cable car, Golden Bridge & French Village', experience: true },
  { n: 13, area: 'Experience',  text: 'Hoi An Ancient Town guided walk and boat ride', experience: true },
  { n: 14, area: 'Experience',  text: 'Lantern experience / evening in Hoi An', experience: true },
  { n: 15, area: 'Experience',  text: 'Hanoi Train Street', experience: true },
  { n: 16, area: 'Experience',  text: 'Ha Long Bay full-day cruise', experience: true },
  { n: 17, area: 'Experience',  text: 'Old Quarter shopping / free time in Hanoi', experience: true },
  { n: 18, area: 'Services',    text: 'Internal flights on both sectors' },
  { n: 19, area: 'Services',    text: 'All airport, hotel, pier and intercity transfers' },
  { n: 20, area: 'Services',    text: 'Transport exclusive to the group' },
  { n: 21, area: 'Services',    text: 'English-speaking guides throughout' },
  { n: 22, area: 'Services',    text: 'All entrance fees and experiences listed' },
  { n: 23, area: 'Services',    text: 'E-visa assistance' },
  { n: 24, area: 'Services',    text: 'Travel / health insurance if they can provide it' },
  { n: 25, area: 'Deliverable', text: 'Hotel options in each destination' },
  { n: 26, area: 'Deliverable', text: 'Flight details' },
  { n: 27, area: 'Deliverable', text: 'Vehicle / transport details' },
  { n: 28, area: 'Deliverable', text: 'Detailed cost breakup' }
];

export const BRIEF_STATUS = {
  met:      { label: 'Met',      value: 1,   tone: 'good' },
  partial:  { label: 'Partial',  value: 0.5, tone: 'warn' },
  missing:  { label: 'Missing',  value: 0,   tone: 'bad'  },
  conflict: { label: 'Conflict', value: 0,   tone: 'bad'  }
};

/* ---------------------------------------------------------------------------
 * Hotel scoring — the Hotels sheet, kept because it is how you actually judge
 * a hotel set, dropped as a separate screen.
 * ------------------------------------------------------------------------- */

export const HOTEL_CRITERIA = [
  { id: 'class_brand',   label: 'Class & brand',   weight: 0.2, guide: '10 = international luxury brand, current 5-star · 7 = well-run local 5-star · 5 = ageing 5-star or solid 4-star · 3 = 3-4 star' },
  { id: 'guest_rating',  label: 'Guest rating',    weight: 0.3, guide: 'Calculated from OTA and Tripadvisor scores. 6.0 or lower = 0, 9.5+ = 10 — we are buying premium.', calc: true },
  { id: 'location_fit',  label: 'Location fit',    weight: 0.2, guide: '10 = walkable to that city\'s main plans · 7 = 15 min or less · 5 = 20-40 min · 3 = long daily transfers' },
  { id: 'room_category', label: 'Room category',   weight: 0.1, guide: '10 = premium/club named · 7 = named entry category with view · 5 = unclear or not stated · 3 = smallest rooms' },
  { id: 'senior_fit',    label: 'Senior fit',      weight: 0.1, guide: 'Lifts, short walks, step-free bathrooms, low noise, Indian/veg breakfast.' },
  { id: 'confirmation',  label: 'Confirmation',    weight: 0.1, guide: '10 = named and held · 7 = named, not held · 3 = "or similar" · 0 = not named' }
];

/* Guest rating: average the OTA /10 and Tripadvisor /5 doubled, then map
 * 6.0 and below to 0, 9.5 and above to 10. Returns null with no ratings —
 * which excludes the criterion rather than scoring the hotel down for it. */
export function guestRatingScore(ota, tripadvisor) {
  const vals = [];
  if (typeof ota === 'number' && !Number.isNaN(ota)) vals.push(ota);
  if (typeof tripadvisor === 'number' && !Number.isNaN(tripadvisor)) vals.push(tripadvisor * 2);
  if (!vals.length) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  if (avg <= 6) return 0;
  if (avg >= 9.5) return 10;
  return ((avg - 6) / 3.5) * 10;
}

/* ---------------------------------------------------------------------------
 * Landed cost. Like-for-like: every DMC gets a placeholder for anything they
 * left out, plus their own FX and tax treatment, so the comparison is real.
 * ------------------------------------------------------------------------- */

export const COST_LINES = [
  { id: 'package',     label: 'Package / land price as quoted',      quoted: true },
  { id: 'hotels',      label: 'Hotels as quoted (if priced separately)', quoted: true },
  { id: 'flights',     label: 'Internal flights',                    placeholder: true },
  { id: 'visa',        label: 'Visa / e-visa',                       placeholder: true },
  { id: 'surcharge',   label: 'Peak-season / festival surcharge',    placeholder: true },
  { id: 'fastpass',    label: 'Fast pass, buggy and paid extras',    placeholder: true },
  { id: 'gala',        label: 'Compulsory gala dinner',              placeholder: true },
  { id: 'drinks',      label: 'Drinks / water with meals',           placeholder: true },
  { id: 'remittance',  label: 'Bank remittance fees',                placeholder: true },
  { id: 'tax',         label: 'Tax on invoice',                      derived: true }
];
