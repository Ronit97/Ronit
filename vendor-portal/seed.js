/* seed.js — the Vietnam shortlist, carried over from the workbook.
 *
 * These two are worked examples: every score below was reasoned from a real
 * quote and its evidence line says where it came from. They are here so the
 * portal opens on something real and so a new quote has something to be
 * compared against.
 */

export const SHARED = {
  destination: 'Vietnam',
  brief: 'Vietnam · 14 adults (7 couples) · Jodhpur group via Ahmedabad · brief sent 31 Aug 2026',
  briefDate: '31 Aug 2026',
  pax: 14,
  usdInr: 95,
  diyBenchmarkInr: 100500,
  onlineRoomNight: null,
  placeholders: {
    flights: 131.578947368421,   /* our own estimate, Rs 12,500 pp */
    visa: null, surcharge: null, fastpass: null, gala: null, drinks: null, remittance: null
  },
  note: 'The brief to DMCs said 17 Dec 2026. The working plan says 29 Nov - 8 Dec. Christmas-week pricing does not apply to late November — get every DMC to requote the real dates before signing.'
};

const S = (score, evidence, source, status) => ({ score, evidence, source: source || 'Quote', status: status || (score === null ? 'pending' : 'quoted') });

/* ------------------------------------------------------------- Vaayutrip */

export const VAAYUTRIP = {
  id: 'vaayutrip',
  vendor: {
    name: 'Vaayutrip',
    entity: 'Vaayutrip Pvt Ltd',
    basedIn: 'New Delhi',
    contact: 'Sameer',
    email: 'vietnam1@vaayutrip.com',
    phone: '+91 97171 96814',
    ref: 'SV090',
    received: '1 Sep 2026'
  },
  verdict: 'Competitive price, thin spec, young company with no Vietnam licence shown. Keep only if the licence, the meals and the named contact come back in writing.',
  cost: {
    package: 555, packageNote: 'Transfers, tours, entrances, B/L/D, tips, coach water.',
    hotels: 490,  hotelsNote: 'Twin share, 8 nights. They are open about us booking online if cheaper.',
    visa: 30,     visaNote: 'Excluded from the quote; they state USD 30.',
    taxRate: 0.05, fxMarkup: 0.015,
    dueAtConfirmation: 0.601674641148325,
    termsNote: '25% of land plus 100% of hotels at confirmation; balance 10 days before arrival.'
  },
  hotels: [
    { city: 'Phu Quoc', dates: '17-20 Dec', nights: 3, name: 'The Shells Resort & Spa Phu Quoc', room: 'Luxury Villa Garden', named: false,
      ota: 7.8, tripadvisor: 4, class_brand: 6, location_fit: 5, room_category: 8, senior_fit: 5, confirmation: 3,
      note: 'Marketed as 5-star but some OTAs list it 4-star. Booking.com 7.8/10 from 677 reviews, Tripadvisor 4/5. Recent reviews mention ageing and maintenance. West coast near Ong Lang — about 17 km from VinWonders and a long drive to the island-tour pier.' },
    { city: 'Da Nang', dates: '20-22 Dec', nights: 2, name: 'DLG Hotel Danang', room: 'Deluxe Double Ocean View', named: false,
      ota: 9.0, tripadvisor: null, class_brand: 7, location_fit: 8, room_category: 7, senior_fit: 8, confirmation: 3,
      note: 'Local brand marketed 5-star, Expedia lists 4.5. Expedia 9.0/10 from 270 reviews. Beachfront on My Khe, high-rise with lifts. Management replies mention vegetarian and Indian-friendly options. Entry-level category, double bed.' },
    { city: 'Hoi An', dates: '22-23 Dec', nights: 1, name: 'Wyndham Hoi An Royal Beachfront Resort & Villas', room: 'Studio Ocean View Double/Twin', named: false,
      ota: null, tripadvisor: 4, class_brand: 8, location_fit: 7, room_category: 7, senior_fit: 7, confirmation: 3,
      note: 'Wyndham-branded 5-star on the beach, 4-5 km from the Ancient Town with a scheduled free shuttle. Large resort, buggy service. Tripadvisor 4/5 from 982 reviews.' },
    { city: 'Hanoi', dates: '23-25 Dec', nights: 2, name: 'Dolce by Wyndham Hanoi Golden Lake', room: 'Golden Classic', named: false,
      ota: 8.8, tripadvisor: null, class_brand: 9, location_fit: 6, room_category: 5, senior_fit: 8, confirmation: 3,
      note: 'Quoted as "Dole", and listed under Da Nang. 5-star, 342 rooms, Ba Dinh. Expedia 8.8/10. A bit far from the Old Quarter. "Golden Classic" matches no category name on its own listings. Covers 24 Dec — ask about a compulsory Christmas Eve gala.' }
  ],
  brief: {
    1:'met', 2:'met', 3:'missing', 4:'partial', 5:'met', 6:'missing', 7:'met',
    8:'met', 9:'conflict', 10:'partial', 11:'partial', 12:'met', 13:'partial', 14:'met', 15:'conflict', 16:'met', 17:'missing',
    18:'missing', 19:'met', 20:'partial', 21:'conflict', 22:'partial', 23:'missing', 24:'missing',
    25:'partial', 26:'missing', 27:'partial', 28:'missing'
  },
  briefNotes: {
    3:'International airfares excluded, no options offered.',
    6:'Not mentioned anywhere; "local lunch" on two days.',
    9:'Itinerary says "fast access with buggy", the notes say buggy and VIP pass cost extra.',
    15:'Half-day by car with no guide. Organised group visits to Train Street have been banned since Mar 2025.',
    17:'Not in the itinerary at all.',
    21:'Inclusions list an English guide; Days 1, 2, 4 and 7 say "no guide".',
    28:'Two lines only: land USD 555, hotels USD 490.'
  },
  scores: {
    'experiences.private_shared': S(6, 'Transfers and most tours private, but the Three-Island tour is on a sharing speedboat.'),
    'experiences.pace':           S(6, 'One major activity a day. The Ha Long day runs about 12 hours door to door — 2.5 hrs each way plus a 6-hour cruise.'),
    'experiences.feasibility':    S(3, 'Day 1 says "Hanoi airport" when the group lands in Phu Quoc. The Hanoi hotel is filed under Da Nang. Train Street is sold as a group visit despite the Mar 2025 ban. No Dragon Bridge show timing.', 'Quote; nationthailand.com; vietcetera.com', 'verified'),
    'experiences.product_quality':S(8, 'Ambassador day cruise, Sun World Ba Na combo, VinWonders and Safari with fast access.'),

    'food.indian_veg':     S(2, 'The quote is silent on cuisine.'),
    'food.restaurants':    S(1, 'No restaurants named, no menus.'),
    'food.meal_coverage':  S(9, 'Breakfast, lunch and dinner throughout except Day 1 breakfast and Day 9 dinner.'),
    'food.excursion_risk': S(3, '"Local lunch" on the island tour and the Ha Long cruise.'),
    'food.drinks_water':   S(4, 'Excluded with meals. Two bottles per person per day on the coach.'),

    'transport.private':      S(8, 'All transport private to the group.'),
    'transport.size_luggage': S(6, '29-seater for transfers, 24-seater for tours. Luggage capacity not stated.'),
    'transport.comfort':      S(4, 'Standard AC coaches. No class, model or year given.'),
    'transport.disclosure':   S(2, 'Seat count only. No make, model, year or photographs.'),

    'guides.coverage': S(3, 'Inclusions list an English guide, but Days 1, 2, 4, 7 and the transport line all say "no guide".'),
    'guides.clarity':  S(2, 'Contradictory within a single document.'),

    'flights.included':   S(0, 'All airfares excluded.'),
    'flights.disclosure': S(0, 'No airline, flight numbers, timings or baggage.'),
    'flights.transfers':  S(9, 'Private transfers at both ends of each sector.'),

    'price.headline':     S(8, 'USD 1,045 pp land plus hotels — roughly level with our own DIY estimate using Airbnbs.', 'Landed cost', 'provisional'),
    'price.completeness': S(4, 'Unpriced: internal flights, e-visa, peak surcharge, buggy and VIP pass, Indian taxes, drinks.', 'Landed cost'),
    'price.transparency': S(3, 'Two lines only. Credit for telling us we can book the hotels online if cheaper.'),

    'credibility.entity':     S(4, 'Vaayutrip Private Limited, CIN U79110DL2024PTC427906, incorporated 6 Mar 2024, paid-up Rs 1 lakh. Directors Sandeep Kumar and Monika Galhotra.', 'thecompanycheck.com (MCA data)', 'verified'),
    'credibility.licence':    S(null, 'India-registered B2B wholesaler across six regions. Lists an HCMC office at Diamond Plaza but shows no Vietnamese licence.', 'vaayutrip.com; quote'),
    'credibility.reviews':    S(3, 'Facebook "not yet rated" with one review. One review on DMCFinder.', 'facebook.com; dmcfinder.com', 'verified'),
    'credibility.web':        S(3, 'The homepage as indexed still carries template text — "Students Enrolled", "Student-Teacher Ratio", a "John Smith" testimonial.', 'vaayutrip.com', 'verified'),
    'credibility.references': S(null, 'None offered. Ask for three agencies that ran Vietnam groups with them in 2025-26.', '-'),

    'support.contact_247':    S(3, 'Claims 24/7 assistance. No named person and no Vietnam number.'),
    'support.local_presence': S(5, 'An HCMC address only. Nothing in Phu Quoc, Da Nang or Hanoi.'),
    'support.medical':        S(null, 'Not addressed anywhere in the quote.'),

    'payment.due_at_confirmation': S(3, 'About 60% of the package falls due at booking — 25% of land plus 100% of hotels.', 'Landed cost'),
    'payment.balance_timing':      S(8, 'Balance 10 days before arrival.'),
    'payment.fx':                  S(5, 'Billed in USD with the rate fixed on the final-payment day, so the FX risk sits with us.'),

    'contract.cancellation': S(1, 'No cancellation or refund schedule provided.'),
    'contract.substitution': S(3, 'All four hotels "or similar", nothing booked.'),
    'contract.surcharge':    S(2, '"Peak season surcharges if any" — open-ended over Christmas week.'),
    'contract.validity':     S(3, 'No validity date stated at all.'),

    'responsiveness.speed':       S(9, 'Contact request about 1.5 hrs after the brief, quote the next day, follow-up 4 Sep, call agreed 7 Sep.', 'Gmail SV090', 'verified'),
    'responsiveness.accuracy':    S(4, 'Location errors, "Dole" for Dolce, contradictory guide and buggy notes, a child policy for an all-adult group.', 'Quote', 'verified'),
    'responsiveness.flexibility': S(7, 'Offers to customise, and open about the hotels being bookable online.')
  },
  knockouts: {
    K1: { note: 'Indian entity verified. Vietnam licence or named partner not shown.' },
    K2: { note: 'Claimed generically. No name, no number.' },
    K3: { note: 'Not offered in the quote.' },
    K5: { note: 'All four hotels "or similar".' }
  }
};

/* ----------------------------------------------------------- Indovietnam */

export const INDOVIETNAM = {
  id: 'indovietnam',
  vendor: {
    name: 'Indovietnam',
    entity: 'Indovietnam Global Pvt Ltd',
    basedIn: 'Noida, with an HCMC office',
    contact: 'Ajeet Kumar, Sr Manager Operations',
    email: 'mice@indovietnamtravel.com',
    phone: '+91 96507 04197',
    ref: 'AP3644',
    received: '31 Aug 2026, answers 1 Sep'
  },
  verdict: 'Best-fit itinerary and Indian meals at every lunch and dinner, on the lowest landed cost. Blocked by a 6-8 hour validity, no payment or cancellation terms, and nothing shown before confirmation.',
  cost: {
    package: 959, packageNote: 'Twin share: hotels plus land, taxes and driver and guide tips included.',
    hotels: 0,    hotelsNote: 'Included in the package — no separate hotel line.',
    visa: 35,     visaNote: 'Excluded from the quote; they state USD 35.',
    remittance: 2.85714285714286, remittanceNote: 'USD 20 per invoice, assuming two invoices split across the group.',
    taxRate: 0, fxMarkup: 0.0105263157894737,
    dueAtConfirmation: null,
    termsNote: 'Asked directly on 31 Aug. Never answered.'
  },
  hotels: [
    { city: 'Phu Quoc', dates: '17-20 Dec', nights: 3, name: 'The Shells Resort & Spa Phu Quoc', room: 'Not stated', named: false,
      ota: 7.8, tripadvisor: 4, class_brand: 6, location_fit: 5, room_category: 5, senior_fit: 5, confirmation: 3,
      note: 'Same hotel as Vaayutrip quoted, but no room category given at all.' },
    { city: 'Da Nang', dates: '20-22 Dec', nights: 2, name: 'DLG Hotel Danang', room: 'Not stated', named: false,
      ota: 9.0, tripadvisor: null, class_brand: 7, location_fit: 8, room_category: 5, senior_fit: 8, confirmation: 3,
      note: 'Same hotel as Vaayutrip quoted. Room category not stated.' },
    { city: 'Hoi An', dates: '22-23 Dec', nights: 1, name: 'Hotel Royal Hoi An', room: 'Not stated', named: false,
      ota: 8.9, tripadvisor: 4, class_brand: 7, location_fit: 10, room_category: 5, senior_fit: 7, confirmation: 3,
      note: '5-star on the Thu Bon River, about 10 minutes on foot to the Ancient Town — the best location in either quote, ideal for the lantern evening. Booking.com 8.9, Tripadvisor 4/5 from 2,799 reviews. Formerly MGallery, now operating independently.' },
    { city: 'Hanoi', dates: '23-25 Dec', nights: 2, name: 'The Legend Hanoi Hotel', room: 'Not stated', named: false,
      ota: null, tripadvisor: null, class_brand: 6, location_fit: 9, room_category: 5, senior_fit: 6, confirmation: 3,
      note: 'Newer independent boutique 5-star in Hoan Kiem, about 15 minutes on foot to Train Street. Tripadvisor reviews are very positive but no numeric score captured, so the guest-rating criterion is excluded rather than guessed.' }
  ],
  brief: {
    1:'met', 2:'met', 3:'missing', 4:'partial', 5:'met', 6:'met', 7:'met',
    8:'met', 9:'partial', 10:'met', 11:'met', 12:'met', 13:'met', 14:'met', 15:'partial', 16:'met', 17:'met',
    18:'missing', 19:'met', 20:'missing', 21:'partial', 22:'partial', 23:'missing', 24:'missing',
    25:'partial', 26:'missing', 27:'missing', 28:'missing'
  },
  briefNotes: {
    3:'"Any airfare" excluded.',
    9:'VinWonders, Safari and Grand World included, but fast pass and buggy not mentioned and Grand World activities are pay-direct.',
    15:'Inside the Hanoi city tour, and they note that guides are not allowed on Train Street — aware of the rule, but still a group visit.',
    20:'Vehicle shared only after confirmation.',
    21:'Guide implied — guide tips are included — but not listed day by day.',
    27:'"Subject to availability and after confirmation only."',
    28:'"We can\'t give any breakup as we sell package."'
  },
  scores: {
    'experiences.private_shared': S(5, 'Not stated for any activity.'),
    'experiences.pace':           S(6, 'Day 7 is heavy: flight, lunch, check-in, then a half-day city tour including Train Street. Day 9 has a shopping drop before the flight.'),
    'experiences.feasibility':    S(8, 'Right airport, check-in times listed, Dragon show placed on the Sunday arrival evening, and they flag that guides are not allowed on Train Street.', 'Quote', 'verified'),
    'experiences.product_quality':S(7, 'Carnival Premium 5-star day cruise, Ba Na with an Indian lunch, VinWonders plus Safari plus Grand World. Fast pass not included.'),

    'food.indian_veg':     S(8, 'An Indian restaurant for every lunch and dinner, including on Ba Na Hills and the cruise. The word "vegetarian" is never actually used.', 'Quote + follow-up 1 Sep'),
    'food.restaurants':    S(3, 'Examples only — Benaras, Saffron, Indian Masala. Menus "after confirmation only".', 'Follow-up 1 Sep'),
    'food.meal_coverage':  S(9, 'All meals except arrival-day breakfast and last-day lunch.', 'Follow-up 1 Sep'),
    'food.excursion_risk': S(9, 'Indian lunch even on the island day and the cruise.'),
    'food.drinks_water':   S(4, 'Not mentioned.'),

    'transport.private':      S(5, 'Not stated.'),
    'transport.size_luggage': S(null, 'Not stated, and not answered when asked.', '-'),
    'transport.comfort':      S(3, 'Not addressed.'),
    'transport.disclosure':   S(1, 'Refused before confirmation, despite a direct request for pictures.', 'Follow-up 1 Sep'),

    'guides.coverage': S(6, 'Guide implied — guide tips are included, and they note a guide is not allowed on Train Street. Their site promises English guides plus a Hindi helpline.', 'Quote; indovietnamtravel.com'),
    'guides.clarity':  S(5, 'Not listed day by day, but nothing contradictory either.'),

    'flights.included':   S(0, '"Any airfare" excluded.'),
    'flights.disclosure': S(0, 'None given.'),
    'flights.transfers':  S(9, 'Departure and arrival transfers on both flight days.'),

    'price.headline':     S(8, 'USD 959 pp twin share with Indian meals, taxes and tips included.', 'Landed cost', 'provisional'),
    'price.completeness': S(5, 'Unpriced: internal flights, e-visa, peak surcharges, fast pass. Taxes are inside the price.', 'Landed cost'),
    'price.transparency': S(1, '"We can\'t give any breakup as we sell package."', 'Follow-up 1 Sep'),

    'credibility.entity':     S(4, 'Two Indian entities: Indovietnam Services Pvt Ltd (Aug 2022, paid-up Rs 1 lakh, FY25 revenue Rs 29.4 lakh) and Indovietnam Global Pvt Ltd (15 Dec 2025, paid-up Rs 15 lakh) — the one in the email signature. Claims 15 years of founders\' experience.', 'tracxn.com (MCA data)', 'verified'),
    'credibility.licence':    S(null, 'The site describes "rep offices in Vietnam" and the signature gives an HCMC address at Vincom Center. A representative office generally cannot trade in Vietnam — we need the licensed Vietnamese company that runs the ground services.', 'indovietnamtravel.com; quote signature'),
    'credibility.reviews':    S(4, 'Tripadvisor listing exists. OTOAI membership and a 2025 industry award, both self-reported. B2B portal claims thousands of registered agents, also self-reported.', 'tripadvisor.in; indovietnamtravel.com', 'verified'),
    'credibility.web':        S(7, 'A working B2B portal with live pricing, and Vietnam-only focus.', 'indovietnamtravel.com', 'verified'),
    'credibility.references': S(null, 'None offered. Ask for three agencies that ran Vietnam groups with them.', '-'),

    'support.contact_247':    S(4, 'Ajeet Kumar named with a phone number, but he is in India. The site promises a Vietnam Hindi helpline and gives no number. Partner desk hours are 10-6 Mon-Fri, 10-2 Sat.', 'Quote; auto-reply'),
    'support.local_presence': S(6, 'HCMC office, and the site claims desks at major arrival airports.', 'indovietnamtravel.com'),
    'support.medical':        S(null, 'Not addressed.', '-'),

    'payment.due_at_confirmation': S(2, 'Asked directly on 31 Aug. Not answered.', 'Follow-up 1 Sep'),
    'payment.balance_timing':      S(2, 'Not answered.', 'Follow-up 1 Sep'),
    'payment.fx':                  S(8, 'Billed in INR to an Indian bank at XE plus Rs 1, with a USD 20 remittance fee per invoice.'),

    'contract.cancellation': S(1, 'Asked directly. Not answered.', 'Follow-up 1 Sep'),
    'contract.substitution': S(3, 'All four hotels "/Similar", nothing held.'),
    'contract.surcharge':    S(2, '"Any peak surcharges if applicable" excluded.'),
    'contract.validity':     S(1, 'Valid 6-8 hours. Unusable for a group we still have to sell.'),

    'responsiveness.speed':       S(10, 'Auto-reply in 5 minutes, full quote about 1.5 hrs after the brief, follow-up answers the next morning.', 'Gmail AP3644', 'verified'),
    'responsiveness.accuracy':    S(8, 'Correct routing and timings. Dragon show and Train Street rules both handled.', 'Quote', 'verified'),
    'responsiveness.flexibility': S(3, 'Refused a breakup. Vehicle and menus only after confirmation. 6-8 hour validity.', 'Follow-up 1 Sep')
  },
  knockouts: {
    K1: { note: 'Indian entities verified. Vietnam presence described only as a "rep office".' },
    K2: { note: 'India contact named. Vietnam helpline promised, never given.' },
    K3: { note: 'Nearly there — an Indian restaurant at every meal, in writing. We still need "pure vegetarian" confirmed.' },
    K5: { note: 'All four "/Similar", nothing held.' }
  }
};

/* --------------------------------------------------------- not yet scored */

export const AWAITING = [
  {
    id: 'saffron', awaiting: true,
    vendor: { name: 'Saffron Travel', basedIn: 'Ho Chi Minh City', ref: '-', received: '4 Sep 2026' },
    note: 'Proposal arrived as a Word attachment. Their email says the price includes international and domestic flights, Indian veg full board, English guides and visa assistance, with 35-seater coaches as standard. Upload the file to score it.',
    scores: {}, hotels: [], brief: {}, cost: {}
  },
  {
    id: 'eaglecrest', awaiting: true,
    vendor: { name: 'Eagle Crest', basedIn: '-', ref: '-', received: '-' },
    note: 'No quote. Requires B2B registration and an agency code before they will price anything.',
    scores: {}, hotels: [], brief: {}, cost: {}
  }
];

export const SEED_ASSESSMENTS = [VAAYUTRIP, INDOVIETNAM];
