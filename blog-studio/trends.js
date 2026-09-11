/* trends.js — the trend queue.
 *
 * Every entry here was researched and cross-checked before it went in, and
 * every URL was returned by a real search. This matters: the studio renders
 * SOURCE LINKS FROM THIS FILE ONLY. Claude writes the prose and never supplies
 * a URL, so a link on a published post cannot be invented.
 *
 * `facts` is the raw material Claude writes from — specific, dated, checkable.
 * `angle` is why it matters to a company that takes parents and grandparents
 * on small group trips out of Jodhpur.
 *
 * Researched 11 Sep 2026.
 */

export const TRENDS = [
  {
    id: 'tcs-2pc',
    category: 'Money',
    title: 'India cut the tax on overseas tour packages from 20% to 2%',
    date: '2026-09-11',
    freshness: 'Live now — applies to anything booked from 1 April 2026',
    facts: [
      'Union Budget 2026-27 reduced Tax Collected at Source on overseas tour packages to a flat 2%, effective 1 April 2026.',
      'The old structure was 5% on packages up to Rs 10 lakh and 20% above Rs 10 lakh.',
      'The new 2% has no threshold — it applies from the first rupee.',
      'On a Rs 10 lakh package the upfront TCS falls from Rs 2 lakh to Rs 20,000.',
      'TCS is not a cost — it is credited against income tax — but it is cash out of the door at booking, so the cut is a cash-flow change, not a discount.'
    ],
    angle: 'The person paying is usually the adult child, and the 20% was the single ugliest line on a family booking. This is the best news our buyers have had in three years, and most of them have not heard it.',
    sources: [
      { label: 'BookMyForex — TCS on foreign travel, new Budget 2026 rates', url: 'https://www.bookmyforex.com/blog/new-tcs-on-foreign-travel-what-you-need-to-know/' },
      { label: 'Poonawalla Fincorp — how the TCS cut affects international travel', url: 'https://poonawallafincorp.com/blogs/financial-insights/budget-2026-tcs-cut-impact-on-international-travel-indians' },
      { label: 'Careers360 — TCS cut to 2% on overseas tours under LRS', url: 'https://news.careers360.com/union-education-budget-2026-tcs-cut-to-2-pc-overseas-tours-education-medical-purposes-under-lrs-fm-nirmala-sitharaman' }
    ]
  },
  {
    id: 'tourist-taxes-2026',
    category: 'Costs',
    title: 'The places everyone wants to see are now charging you to turn up',
    date: '2026-09-08',
    freshness: 'Rolling through 2026 — Edinburgh started 24 July',
    facts: [
      'Edinburgh added a 5% accommodation tax to hotel bills from 24 July 2026.',
      'Venice charges day visitors EUR 5 booked in advance or EUR 10 last minute, on 60 designated days between April and July 2026.',
      'Kyoto raised its hotel tax steeply: a room at JPY 50,000-99,000 a night goes from JPY 1,000 to JPY 4,000, and JPY 20,000-49,999 rooms from JPY 500 to JPY 1,000.',
      'Barcelona now runs up to EUR 15 per person per night; Amsterdam charges 12.5% room tax.',
      'Officials are open about the strategy: fewer visitors paying more, to cover the cost of the crowds.'
    ],
    angle: 'These land on the final bill, not the brochure price, and they are exactly the sort of surprise that makes a family feel cheated. We can just tell people the number in advance.',
    sources: [
      { label: 'Yahoo Travel — 8 famous destinations introducing new tourist fees in 2026', url: 'https://travel.yahoo.com/news/articles/8-famous-destinations-introducing-tourist-131900103.html' },
      { label: 'World of Wanderlust — every new tourist tax and fee in 2026', url: 'https://www.worldofwanderlust.com/every-new-tourist-tax-and-fee-hitting-travelers-in-2026/' },
      { label: 'The Traveler — how Kyoto, London and others are charging visitors', url: 'https://www.thetraveler.org/new-tourist-taxes-2026-overtourism-fees/' }
    ]
  },
  {
    id: 'night-train-milan',
    category: 'Slow travel',
    title: 'A new sleeper train now runs Brussels to Milan overnight',
    date: '2026-09-09',
    freshness: 'Launched 9 September 2026',
    facts: [
      'European Sleeper began an overnight service linking Brussels, Cologne, Zurich and Milan on 9 September 2026.',
      'It is the operator\'s third international route and its first to reach Switzerland and Italy.',
      'Night trains remove an airport, a security queue and a 4 am alarm from the day.',
      'Europe\'s night-train network has been expanding for several years on the back of exactly this demand.'
    ],
    angle: 'A berth beats a budget flight for anyone with a knee that objects to stairs and a queue. This is the shape of travel we already build: fewer moves, longer stays, no dawn departures.',
    sources: [
      { label: 'European Sleeper — routes and booking', url: 'https://www.europeansleeper.eu/' },
      { label: 'MyLife Global — travel news briefs, September 2026', url: 'https://www.mylifegb.com/news/travel-news-briefs-september-2026' }
    ]
  },
  {
    id: 'india-outbound-40m',
    category: 'Trend',
    title: 'Forty million trips: India is about to become everyone\'s best customer',
    date: '2026-09-11',
    freshness: 'Full-year 2026 projection',
    facts: [
      'India\'s outbound travel is projected at 40-44 million trips in 2026, up from 37-39 million in 2025.',
      'Indian citizens made an estimated 31.7 million trips abroad in FY 2024-25, past the pre-pandemic record.',
      'Annual overseas holiday spending has more than quadrupled to about USD 17 billion a year.',
      'The UAE is the top destination at roughly 8.6 million visitors, then Saudi Arabia at 3.4 million and Thailand at 2.2 million.',
      '43.5% of Indian outbound trips are for leisure.'
    ],
    angle: 'Forty million trips means forty million chances to be treated as a number. The interesting question is not where Indians are going, it is who is looking after them when they get there.',
    sources: [
      { label: 'BW Hotelier — outbound travel set to hit 40 million in 2026', url: 'https://www.bwhotelier.com/article/indian-hotels-eye-global-expansion-as-outbound-travel-set-to-hit-40-million-in-2026-605320' },
      { label: 'Open Magazine — 2026 forecast: where Indians dare', url: 'https://openthemagazine.com/india/2026-forecast-travel-where-indians-dare' },
      { label: 'Future Market Insights — India outbound tourism market', url: 'https://www.futuremarketinsights.com/reports/india-outbound-tourism-market' }
    ]
  },
  {
    id: 'passport-power-2026',
    category: 'Visas',
    title: 'The Indian passport just climbed ten places',
    date: '2026-09-11',
    freshness: 'Henley Passport Index, February 2026 update',
    facts: [
      'India ranks 75th on the Henley Passport Index 2026, up ten places from 85th in 2025.',
      'Around 25 countries take an Indian passport with no visa at all; counting visa-on-arrival and electronic travel authorisation the total is about 56.',
      'Malaysia gives 30 days visa-free for tourism, currently valid to December 2026. Kazakhstan gives 14 days.',
      'Kenya added Indians to its visa-free list in mid-2025 with 90 days on just a passport. Rwanda has visa-free access, and Gambia was added in early 2026 with 28 days.',
      'Thailand extended its visa-free stay to 60 days in 2025; Sri Lanka moved to a streamlined e-visa.'
    ],
    angle: 'For a first-time traveller in their sixties, the visa queue is the scariest part of the whole trip. Ten places up the index means several genuinely good destinations where that queue no longer exists.',
    sources: [
      { label: 'Gulf News — complete list of visa-free destinations for Indian passport holders in 2026', url: 'https://gulfnews.com/world/asia/india/visa-free-travel-for-indian-passport-holders-in-2026-complete-list-of-55-destinations-1.500407454' },
      { label: 'Gulf News — two new visa-free destinations open in 2026', url: 'https://gulfnews.com/amp/story/business%2Ftourism%2Fvisa-free-travel-2026-two-new-destinations-open-for-indian-passport-holders-1.500415215' },
      { label: 'Henley & Partners — the Passport Index', url: 'https://www.henleyglobal.com/passport-index' }
    ]
  },
  {
    id: 'vietnam-2026',
    category: 'Destination',
    title: 'Vietnam had 13.9 million visitors before August and is not slowing down',
    date: '2026-09-11',
    freshness: 'Decree took effect 15 September 2026',
    facts: [
      'Vietnam received nearly 13.92 million visitors in the first seven months of 2026, up 13.8% year on year.',
      'Decree 286/2026/ND-CP took effect on 15 September 2026, adding electronic data sharing between agencies. The 30-day visa-free entries and 90-day e-visa validity are unchanged by it.',
      'E-visas are now accepted at 83 airports, land borders and seaports.',
      'The government is piloting preferential visas for long-stay, higher-spending visitors, against a stated target of 50 million arrivals.',
      'Indian passport holders still need an e-visa; it is not one of the visa-exempt nationalities.'
    ],
    angle: 'Vietnam is the trip we are asked for most, and it is getting busier by 14% a year. Busier means the difference between a good operator and a cheap one starts to show.',
    sources: [
      { label: 'Vietnam Visa News — official policy updates 2026', url: 'https://www.vietnamvisanews.com/' },
      { label: 'MakeYourAsia — Vietnam entry regulations 2026', url: 'https://makeyourasia.com/news/vietnam-entry-regulations.html' },
      { label: 'Vietnam National Authority of Tourism', url: 'https://vietnamtourism.gov.vn/en' }
    ]
  },
  {
    id: 'confidence-hack',
    category: 'Travel hacks',
    title: 'The viral airport hack that was just a paid fast-track pass',
    date: '2026-09-06',
    freshness: '4.1 million views and counting',
    facts: [
      'A clip posted by @NoFilterSkin on X claims confidence alone gets you through a busy international airport faster, with advice like "stay in motion through the chaos" and "look lost". It has passed 4.1 million views.',
      'Commenters and travel writers pointed out the traveller was almost certainly using a paid or authorised expedited screening service.',
      'Fact-checks of 2026\'s viral hacks found the Tuesday-booking rule does not hold: fares move on demand, route competition and how full the plane is.',
      'One that is real — TSA stopped requiring shoes off at screening in July 2025, though officers can still ask.',
      'One that is real and free — unzip a travel pillow, take the cushion out, and pack rolled t-shirts inside it.'
    ],
    angle: 'Half of what goes viral is someone with a fast-track pass pretending it is a personality trait. Worth saying out loud, because our travellers will have seen the video.',
    sources: [
      { label: 'Yahoo Travel — commenters question the viral airport hack', url: 'https://travel.yahoo.com/advice/travel-tips/articles/person-deceiving-viral-airport-hack-191021030.html' },
      { label: 'Frommer\'s — viral air travel hacks: the good, the bad and the ugly', url: 'https://www.frommers.com/tips/airfare/viral-air-travel-hacks-the-good-the-bad-and-the-ugly/' },
      { label: 'Kiwi.com — viral travel hacks fact-checked for 2026', url: 'https://www.kiwi.com/stories/viral-travel-hacks-fact-checked-what-actually-works-in-2026/' }
    ]
  },
  {
    id: 'multigen-boom',
    category: 'Trend',
    title: 'Three generations, one booking: group trips of six or more jumped 67%',
    date: '2026-09-11',
    freshness: 'Year-on-year, 2026',
    facts: [
      'Journeyscape and its sister brand report a 67% year-on-year increase in group trips of six or more people.',
      'Families are choosing trips with guides, local experts and hands-on learning over plain sightseeing.',
      'The stated reasons are practical as well as sentimental: shared memories, but also shared costs and shared caregiving.',
      'National parks, wildlife and cities with a lot of history are the most booked categories.'
    ],
    angle: 'A trip that works for a nine-year-old and a seventy-nine-year-old is a pacing problem, not a destination problem. That is the whole job.',
    sources: [
      { label: 'Journeyscape — multigenerational holiday trends 2026', url: 'https://www.journeyscape.com/inspiration/multigenerational-holiday-trends-2026-journeyscape-north-america-holidays/' },
      { label: 'Road Scholar — multigenerational family travel survey', url: 'https://www.roadscholar.org/blog/multigenerational-family-travel-trends/' }
    ]
  },
  {
    id: 'slow-travel-60s',
    category: 'Slow travel',
    title: 'Travellers over sixty are taking three trips a year and refusing to rush',
    date: '2026-09-11',
    freshness: '2026 surveys',
    facts: [
      'In the 2026 Arch RoamRight travel survey, more than 63% of respondents were aged 61 or older.',
      'More than half of them reported taking two to three leisure trips a year.',
      'The clear preference is slower itineraries — fewer places, longer stays — instead of four cities in five days.',
      'The reason given is plain: the constant moving is what wears people out, not the travelling itself.',
      'AARP publishes an annual read on travel intentions for the over-fifties.'
    ],
    angle: 'This is the sentence our whole company is built on, now showing up in other people\'s survey data. Six a.m. departures and four cities in five days were never a holiday.',
    sources: [
      { label: 'Arch RoamRight — senior travel trends 2026', url: 'https://www.roamright.com/senior-travel-trends-2026/' },
      { label: 'AARP — 2026 travel trends for adults age 50 and older', url: 'https://www.aarp.org/pri/topics/social-leisure/travel/2026-travel-trends/' }
    ]
  },
  {
    id: 'trendification',
    category: 'Trend',
    title: 'A destination goes viral in February and is booked out by April',
    date: '2026-09-11',
    freshness: '2026 platform data',
    facts: [
      'Social media now influences about 25% of travellers, and nearly half of Gen Z name it as a key factor in choosing where to go.',
      'The lag between trending and booked has effectively closed: a place that goes viral on TikTok in February shows measurable bookings by April.',
      'Short-form video rewards a specific kind of place — walkable, visually distinctive, good food, backdrops that need no editing.',
      'Bali, Lisbon and Tokyo dominate; Laos, the Philippines beyond Boracay, and rural Cambodia are the ones creators are pushing next.',
      'Tokyo\'s viral content has its own sub-genres, from late-night ramen finds to vending-machine tours.'
    ],
    angle: 'A place that photographs well and a place that works for a seventy-year-old are not the same list. Somebody should say so before the crowds arrive.',
    sources: [
      { label: 'Travel And Tour World — the trendification of travel', url: 'https://www.travelandtourworld.com/news/article/trendification-of-travel-why-social-media-is-shaping-where-we-go-in-2026/' },
      { label: 'Time Out — the top trending travel destinations for 2026', url: 'https://www.timeout.com/news/the-top-trending-travel-destinations-for-2026-with-an-asian-capital-taking-the-top-spot-111325' },
      { label: 'Viryze — travel TikTok trends 2026', url: 'https://viryze.com/blog/tiktok-travel-trends-2026' }
    ]
  }
];

export const RESEARCHED_ON = '11 September 2026';
