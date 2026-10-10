export const site = {
  name: 'Inside Black Boxes',
  tagline: 'How the Supreme Court is shaping the law, and the lives under it.',
  description:
    'Inside Black Boxes follows the Supreme Court for lawyers, academics, and policymakers thinking about the future of law — how a decision moves doctrine, institutions, and ordinary life.',
  email: 'hello@insideblackboxes.com',
};

import argumentCatalog from './arguments-catalog.json';

export const featuredArguments = argumentCatalog;

export const episodes = [
  {
    slug: 'urias-orellana',
    title: 'Substantial Evidence and Asylum: Urias-Orellana v. Bondi',
    subtitle: 'Draft walkthrough · Substantial-evidence review of a BIA persecution finding',
    type: 'Opinion drop',
    status: 'Draft',
    featured: false,
    date: '2026-03-04',
    runtime: '12 min',
    episodeNumber: 'TEST-001',
    docket: '24-777',
    vote: '9–0',
    summary:
      'Unanimous Court holds that courts of appeals must apply substantial-evidence review when the BIA decides whether undisputed facts constitute persecution under the INA — resolving a circuit split in the government\'s favor.',
    tags: ['Asylum', 'Standard of Review', 'INA § 1252', 'Administrative Law'],
    href: '/episodes/urias-orellana.html',
    audioUrl: null,
    spotifyUrl: null,
    appleUrl: null,
  },
];

export const trackedCases = [
  {
    name: 'Department of Homeland Security v. D.V.D.',
    docket: '26-426',
    stage: 'upcoming',
    status: 'Argument set',
    topic: 'Third-country removal',
    question:
      'Whether the district court had jurisdiction, whether it could grant classwide relief and set the guidance aside under 8 U.S.C. § 1252(f)(1), and whether the government’s third-country-removal guidance is unlawful.',
    argument: 'December 9, 2026',
    docketUrl: 'https://www.supremecourt.gov/docket/docketfiles/html/public/26-426.html',
    description:
      'The Court will hear whether the government can remove someone to a country that is not their own, and whether a district court can stop that guidance. A stay of the lower-court order is already in place. Justices Sotomayor, Kagan, and Jackson would have denied the stay.',
  },
  {
    name: 'Trump v. Barbara',
    docket: '25-365',
    stage: 'decided',
    status: 'Decided',
    topic: 'Birthright citizenship',
    holding:
      'Children born in the United States to parents unlawfully or temporarily present are citizens at birth under the Fourteenth Amendment’s Citizenship Clause.',
    disposition: 'Affirmed, 6–3',
    decided: 'June 30, 2026',
    argued: 'April 1, 2026',
    opinionUrl: 'https://www.supremecourt.gov/opinions/25pdf/25-365_new_5if6.pdf',
    description:
      'An executive order would have denied citizenship to children born here when their parents were unlawfully or temporarily present. The Court held that the Citizenship Clause still covers those children.',
  },
  {
    name: 'Mullin v. Doe / Trump v. Miot',
    docket: '25-1083 / 25-1084',
    stage: 'decided',
    status: 'Decided',
    topic: 'Temporary protected status',
    holding:
      'The TPS statute bars judicial review of non-constitutional challenges to a designation, extension, or termination. The orders pausing the Haiti and Syria terminations are reversed.',
    disposition: 'Reversed and remanded',
    decided: 'June 25, 2026',
    argued: 'April 29, 2026',
    opinionUrl: 'https://www.supremecourt.gov/opinions/25pdf/25-1083_f204.pdf',
    description:
      'The Secretary moved to end temporary protected status for Haiti and Syria. The Court held that most challenges to that choice cannot be reviewed, and it lifted the interim orders that had kept the terminations on hold.',
  },
  {
    name: 'Blanche v. Lau',
    docket: '25-429',
    stage: 'decided',
    status: 'Decided',
    topic: 'Returning lawful permanent residents',
    holding:
      'Border officers need not have clear and convincing evidence at reentry before treating a returning lawful permanent resident as an applicant for admission.',
    disposition: 'Vacated and remanded, 6–3',
    decided: 'June 23, 2026',
    argued: 'April 22, 2026',
    opinionUrl: 'https://www.supremecourt.gov/opinions/25pdf/25-429_h3ci.pdf',
    description:
      'The government can develop the proof later, in removal proceedings. The Court left open whether Lau’s offense was a crime involving moral turpitude.',
  },
];

export const host = {
  name: 'Marty Robles-Avila',
  title: 'Host & Creator',
  bio: [
    'Marty Robles-Avila is an immigration and administrative law attorney who practices at the intersection of federal courts, agency action, and emerging technology.',
    'He created Inside Black Boxes to open the institutional black boxes that shape American law — Supreme Court decision-making, immigration enforcement, administrative procedure, and the rapid adoption of generative AI in legal and enterprise settings.',
    'The show is for lawyers, academics, and policymakers thinking about where the law is going — how a Supreme Court decision moves doctrine, institutions, and the people living with the result.',
  ],
  focus: [
    'Supreme Court oral arguments and published opinions',
    'Immigration and nationality law',
    'Administrative law and judicial review of agency action',
    'Generative AI, enterprise adoption, and legal-technology governance',
  ],
};
