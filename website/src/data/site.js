export const site = {
  name: 'Inside Black Boxes',
  tagline: 'Supreme Court decisions, explained for practitioners.',
  description:
    'Inside Black Boxes is a podcast for immigration lawyers, administrative law practitioners, academics, and policymakers who need clear, timely analysis of Supreme Court decisions — without the noise.',
  email: 'hello@insideblackboxes.com',
};

export const episodes = [
  {
    slug: 'urias-orellana',
    title: 'Substantial Evidence and Asylum: Urias-Orellana v. Bondi',
    subtitle: 'Workflow dry run · Standard of review for BIA persecution determinations',
    type: 'Opinion drop',
    status: 'Draft',
    featured: true,
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
    name: 'Trump v. Barbara',
    docket: '25-365',
    status: 'Pending — decision expected',
    priority: 'P1',
    topic: 'Birthright Citizenship',
    question:
      'Whether Executive Order No. 14,160 complies with the Citizenship Clause of the Fourteenth Amendment and 8 U.S.C. § 1401(a).',
    argued: 'April 1, 2026',
    scotusblog: 'https://www.scotusblog.com/cases/trump-v-barbara/',
    description:
      'Challenge to the executive order barring citizenship for children born in the U.S. when parents entered illegally or hold temporary lawful status. Every lower court to review the order has blocked it as unconstitutional.',
  },
  {
    name: 'Mullin v. Doe / Trump v. Miot',
    docket: '25-1083 / 25-1084',
    status: 'Pending — decision expected',
    priority: 'P2',
    topic: 'Temporary Protected Status',
    question:
      'Whether DHS may terminate TPS designations for Haiti and Syria, and whether those decisions are subject to judicial review under the APA.',
    argued: 'April 29, 2026',
    scotusblog: 'https://www.scotusblog.com/cases/noem-v-doe-3/',
    description:
      'Consolidated challenges to termination of TPS for roughly 300,000 Haitian nationals and approximately 3,800 Syrian nationals — testing the future of a program every prior administration has used for 36 years.',
  },
  {
    name: 'Blanche v. Lau',
    docket: '25-429',
    status: 'Pending — decision expected',
    priority: 'P3',
    topic: 'Returning Lawful Permanent Residents',
    question:
      'Whether DHS must possess clear and convincing evidence of a § 1182(a)(2) offense at the time of an LPR\'s last reentry to treat them as an applicant for admission.',
    argued: 'April 22, 2026',
    scotusblog: 'https://www.scotusblog.com/cases/bondi-v-lau/',
    description:
      'The sleeper case immigration lawyers are watching: when must the government have proof of a disqualifying offense — at the border, or can it develop evidence later in removal proceedings?',
  },
];

export const host = {
  name: 'Marty Robles-Avila',
  title: 'Host & Creator',
  bio: [
    'Marty Robles-Avila is an immigration and administrative law attorney who practices at the intersection of federal courts, agency action, and emerging technology.',
    'He created Inside Black Boxes to open the institutional black boxes that shape American law — Supreme Court decision-making, immigration enforcement, administrative procedure, and the rapid adoption of generative AI in legal and enterprise settings.',
    'The podcast is built for practitioners who need to know what a decision means Monday morning, academics tracking doctrinal shifts, and policymakers evaluating the downstream effects of court rulings and AI governance.',
  ],
  focus: [
    'Supreme Court oral arguments and published opinions',
    'Immigration and nationality law',
    'Administrative law and judicial review of agency action',
    'Generative AI, enterprise adoption, and legal-technology governance',
  ],
};
