// Example seed data shown when external services (Sanity, Turso) are not configured.
// This lets reviewers see realistic content in every section.

export const seedSpecialists = [
  {
    id: 'seed-1',
    name: 'Dr. Sarah Mitchell',
    country: 'United States',
    city: 'Boston',
    type: 'both',
    specialty: 'Pediatric Ophthalmology & Strabismus Surgery',
    website: null,
    phone: null,
    verified: true,
    ratingAvg: 4.8,
    ratingCount: 12,
  },
  {
    id: 'seed-2',
    name: 'Prof. David Goldberg',
    country: 'Israel',
    city: 'Tel Aviv',
    type: 'child',
    specialty: 'Pediatric Strabismus & Neuro-ophthalmology',
    website: null,
    phone: null,
    verified: true,
    ratingAvg: 4.9,
    ratingCount: 8,
  },
  {
    id: 'seed-3',
    name: 'Dr. Elena Rodriguez',
    country: 'Spain',
    city: 'Madrid',
    type: 'adult',
    specialty: 'Adult Strabismus Surgery',
    website: null,
    phone: null,
    verified: false,
    ratingAvg: 4.5,
    ratingCount: 5,
  },
  {
    id: 'seed-4',
    name: 'Dr. James Chen',
    country: 'United Kingdom',
    city: 'London',
    type: 'both',
    specialty: 'Paediatric Ophthalmology',
    website: null,
    phone: null,
    verified: true,
    ratingAvg: 4.7,
    ratingCount: 15,
  },
  {
    id: 'seed-5',
    name: 'Dr. Anika Sharma',
    country: 'India',
    city: 'Mumbai',
    type: 'child',
    specialty: 'Pediatric Ophthalmology & Squint Surgery',
    website: null,
    phone: null,
    verified: false,
    ratingAvg: 4.6,
    ratingCount: 3,
  },
  {
    id: 'seed-6',
    name: 'Dr. Hans Weber',
    country: 'Germany',
    city: 'Berlin',
    type: 'both',
    specialty: 'Strabismologie und Neuroophthalmologie',
    website: null,
    phone: null,
    verified: true,
    ratingAvg: 4.4,
    ratingCount: 7,
  },
];

export const seedStories = [
  {
    id: 'seed-story-1',
    title: 'From Shy Kid to Commercial Pilot',
    profession: 'Commercial Airline Pilot',
    content: `I was diagnosed with Duane Syndrome Type 1 in my left eye when I was 3 years old. Growing up, I was always worried it would limit my career options — especially my dream of becoming a pilot.

When I was 16, I researched aviation medical requirements obsessively. I found out that most aviation authorities evaluate functional vision, not just eye movement range. I could see 20/20, had good depth perception, and passed the visual field tests.

After getting my medical certificate (which required a special issuance review), I completed flight training and am now a first officer at a regional airline. I fly every day and my Duane Syndrome has never been an issue in the cockpit.

To anyone with DS who dreams of flying: get your eyes evaluated by an aviation medical examiner early. The process takes longer but it's absolutely possible.`,
    createdAt: '2024-11-15',
  },
  {
    id: 'seed-story-2',
    title: 'My Daughter\'s Journey: From Diagnosis to Confidence',
    profession: 'Parent',
    content: `When our daughter Maya was 18 months old, we noticed she always turned her head to the left. Our pediatrician referred us to a pediatric ophthalmologist who diagnosed her with Duane Syndrome Type 1 in the right eye.

I remember crying in the car afterward — not because it was serious, but because I'd never heard of it and the unknown was terrifying. I wish I'd had a resource like this site back then.

Maya is now 11. She had strabismus surgery at age 5 to correct a significant head turn, and the results were great. She plays soccer, does gymnastics, reads voraciously, and just started learning guitar. Her confidence is through the roof.

The biggest thing I've learned: Duane Syndrome is something Maya HAS, not something she IS. We've taught her to explain it casually and she handles questions with incredible grace. Her eye doctor says he barely notices her DS anymore.

To the parents reading this in tears after a fresh diagnosis: I promise, it gets easier. Your child will be just fine.`,
    createdAt: '2024-09-20',
  },
  {
    id: 'seed-story-3',
    title: 'Eye Surgeon with an Eye Condition',
    profession: 'Ophthalmologist',
    content: `Here's a bit of irony: I'm an ophthalmologist with Duane Syndrome Type 3. Both eyes affected, though the left is more limited.

I went through medical school, residency, and a fellowship in oculoplastic surgery — all with DS. Operating through a microscope requires adaptation, but I found my natural head position and it works perfectly.

What drove me into ophthalmology? Honestly, curiosity about my own condition. When I was a kid, no doctor could explain DS in a way I could understand. I wanted to be the doctor who could.

Now I specialize in helping patients with complex strabismus conditions. Having DS myself gives me a unique perspective that my patients appreciate. When I tell them I have the same condition, their relief is visible.`,
    createdAt: '2025-01-05',
  },
];

export const seedMentorPosts = [
  {
    id: 'seed-mentor-1',
    role: 'mentor',
    bio: 'Adult with Type 1 DS in the left eye. Had surgery at age 7. Happy to chat with parents of newly diagnosed kids about what to expect, school tips, and when surgery might help. Based in the US (EST timezone).',
    contactMethod: 'Email me through the site',
    anonymous: false,
    locale: 'en',
    active: true,
    createdAt: '2025-01-10',
  },
  {
    id: 'seed-mentor-2',
    role: 'mentee',
    bio: 'Parent of a 4-year-old recently diagnosed with Type 1. Looking for other parents who can share their experience — especially about the surgery decision. We\'re in Israel.',
    contactMethod: 'Email me through the site',
    anonymous: false,
    locale: 'en',
    active: true,
    createdAt: '2025-01-20',
  },
  {
    id: 'seed-mentor-3',
    role: 'mentor',
    bio: 'Teen (17) with bilateral Type 3 DS. Been dealing with this my whole life and I\'m happy to talk to other teens who feel alone or different. It gets SO much better, I promise.',
    contactMethod: 'DM on Instagram',
    anonymous: true,
    locale: 'en',
    active: true,
    createdAt: '2025-02-01',
  },
];

export const seedLegalEntries = [
  {
    id: 'seed-legal-1',
    country: 'United States',
    topic: 'Driving with Duane Syndrome',
    content: `In the US, driving requirements are set by each state. Most states require:\n\n- Visual acuity of 20/40 or better in at least one eye\n- A minimum horizontal visual field (varies by state, typically 110-140 degrees)\n\nMost people with Duane Syndrome meet these requirements easily since DS affects eye MOVEMENT, not visual acuity or visual field. If your visual acuity is 20/40 or better, you should be able to obtain a standard driver's license.\n\nSome states may require a vision specialist to sign off. Contact your state's DMV for specific requirements.`,
    sourcesJson: JSON.stringify([
      { title: 'AMA Guide to Visual Standards for Driving', url: 'https://www.aao.org/clinical-statement/vision-requirements-for-driving' },
    ]),
    createdAt: '2025-01-10',
  },
  {
    id: 'seed-legal-2',
    country: 'United States',
    topic: 'School Accommodations (IEP/504 Plan)',
    content: `Under the Individuals with Disabilities Education Act (IDEA) and Section 504 of the Rehabilitation Act, children with Duane Syndrome may qualify for accommodations if the condition affects their ability to learn.\n\nCommon accommodations include:\n- Preferential seating (positioned so the board is in their functional gaze range)\n- Permission to maintain their natural head turn without correction\n- Extra time for reading-intensive tasks (if applicable)\n- Modified seating for standardized tests\n\nNote: Not all children with DS need or qualify for accommodations. Many function perfectly in standard classroom settings with only a seating adjustment.`,
    sourcesJson: JSON.stringify([
      { title: 'Section 504 of the Rehabilitation Act', url: 'https://www2.ed.gov/about/offices/list/ocr/504faq.html' },
    ]),
    createdAt: '2025-01-15',
  },
  {
    id: 'seed-legal-3',
    country: 'Israel',
    topic: 'Military Service with Duane Syndrome',
    content: `In Israel, Duane Syndrome is evaluated as part of the IDF medical profile (פרופיל רפואי). The condition is classified under ophthalmological conditions.\n\nMost people with DS receive a medical profile of 72 or 64, depending on severity. This means they serve in the military but may be excluded from certain combat roles that require full binocular vision.\n\nThe classification depends on:\n- Degree of limitation\n- Whether both eyes are affected\n- Presence or absence of amblyopia\n- Visual acuity\n\nAppeal process: If you disagree with your profile classification, you can request a re-evaluation at the military medical board (ועדה רפואית).`,
    sourcesJson: JSON.stringify([
      { title: 'IDF Medical Profile Guidelines', url: 'https://www.mitgaisim.idf.il' },
    ]),
    createdAt: '2025-02-01',
  },
];

export const seedResearchPapers = [
  {
    id: 'seed-research-1',
    pubmedId: '38445621',
    title: 'Long-term Outcomes of Bilateral Lateral Rectus Recession in Duane Syndrome Type 1: A 15-Year Follow-up Study',
    abstract: 'Purpose: To evaluate the long-term surgical outcomes of bilateral lateral rectus recession in patients with Duane syndrome type 1. Methods: Retrospective review of 45 patients who underwent bilateral lateral rectus recession between 2008 and 2023. Results: Mean follow-up was 8.3 years. 82% of patients maintained satisfactory alignment in primary position. Head turn improved in 91% of cases. Globe retraction was reduced but not eliminated. Three patients required reoperation.',
    authors: 'Mitchell S, Goldberg D, Chen J, Rodriguez E',
    journal: 'Journal of Pediatric Ophthalmology & Strabismus',
    publishedDate: '2024-08-15',
    aiSummarySimple: 'Doctors looked at 45 people who had eye surgery for Duane Syndrome Type 1. After many years, most people (82%) still had their eyes looking straight ahead, and 91% didn\'t need to turn their head as much. The surgery helped a lot, but a few people needed a second surgery later.',
    aiSummaryAdult: 'This 15-year study followed 45 patients who had a specific surgery (bilateral lateral rectus recession) for Duane Syndrome Type 1. The good news: 82% maintained good eye alignment long-term, and head turn improved in 91% of patients. Globe retraction was reduced but not fully eliminated. Only 3 patients needed additional surgery. This suggests the surgery has durable results.',
    aiSummaryProfessional: 'Retrospective cohort study (n=45) evaluating long-term outcomes of bilateral LR recession for DRS type 1. Mean follow-up 8.3 years. Primary outcome: 82% maintained alignment within 10 PD in primary position. Secondary outcomes: head turn improved in 91%, globe retraction reduced (mean 2.1mm decrease). Reoperation rate 6.7% (3/45). Findings support bilateral LR recession as a durable intervention with low reoperation rates.',
    isOpenAccess: true,
    oaPdfUrl: null,
    conclusions: 'Bilateral lateral rectus recession remains an effective and durable surgical approach for Duane syndrome type 1. Long-term alignment was maintained in the majority of patients, with significant improvement in compensatory head posture. While globe retraction was reduced, it was not fully eliminated, and patients should be counseled accordingly. The low reoperation rate supports the reliability of this technique.',
    source: 'europepmc',
    doi: '10.3928/01913913-20240801-01',
    citationCount: 23,
  },
  {
    id: 'seed-research-2',
    pubmedId: '39112045',
    title: 'CHN1 Mutations in Familial Duane Retraction Syndrome: Expanding the Genotype-Phenotype Spectrum',
    abstract: 'We identified four novel CHN1 variants in three unrelated families with autosomal dominant Duane retraction syndrome. Functional analysis revealed that all variants result in gain-of-function of alpha2-chimaerin, consistent with the established pathogenic mechanism. Phenotypic variability was observed even within families carrying the same mutation, suggesting additional genetic or environmental modifiers.',
    authors: 'Park JH, Kim SY, Lee HJ, Tanaka M',
    journal: 'Human Molecular Genetics',
    publishedDate: '2025-01-22',
    aiSummarySimple: 'Scientists found new genetic changes (mutations) that can cause Duane Syndrome to run in families. They found these changes in a gene called CHN1 in three different families. Interestingly, even people in the same family with the same gene change can have different levels of Duane Syndrome, from very mild to more noticeable.',
    aiSummaryAdult: 'Researchers discovered four new genetic mutations in the CHN1 gene that cause familial (inherited) Duane Syndrome. What\'s interesting is that even within the same family carrying the same mutation, the severity of Duane Syndrome varied widely — some family members had mild cases while others were more significantly affected. This suggests other genes or environmental factors play a role in how severe the condition becomes.',
    aiSummaryProfessional: 'Four novel CHN1 variants identified in 3 unrelated autosomal dominant DRS pedigrees. All variants demonstrated gain-of-function activity of alpha2-chimaerin in functional assays, consistent with the established pathomechanism of aberrant guidance signaling. Notable intrafamilial phenotypic variability observed, ranging from subclinical to bilateral DRS with upshoot. Findings expand the CHN1 mutation spectrum and underscore the role of genetic/environmental modifiers.',
    isOpenAccess: false,
    oaPdfUrl: null,
    conclusions: null,
    source: 'pubmed',
    doi: '10.1093/hmg/ddae015',
    citationCount: 7,
  },
];

export const seedBlogPosts = [
  {
    _id: 'seed-blog-1',
    title: 'What I Wish I Knew the Day My Child Was Diagnosed',
    slug: { current: 'what-i-wish-i-knew-diagnosis' },
    excerpt: 'A parent\'s honest reflection on the diagnosis day and everything they\'ve learned since — including why the tears were unnecessary.',
    publishedAt: '2025-01-15T10:00:00Z',
    readingTime: 6,
    tags: ['parenting', 'diagnosis', 'personal story'],
    author: { name: 'Rachel M.' },
  },
  {
    _id: 'seed-blog-2',
    title: 'Duane Syndrome and Sports: A Complete Guide',
    slug: { current: 'duane-syndrome-sports-guide' },
    excerpt: 'Can you play sports with Duane Syndrome? Absolutely. Here\'s a comprehensive guide covering every sport from soccer to archery.',
    publishedAt: '2025-02-01T14:30:00Z',
    readingTime: 8,
    tags: ['sports', 'life hacks', 'guide'],
    author: { name: 'Community Team' },
  },
  {
    _id: 'seed-blog-3',
    title: 'Understanding Eye Surgery for Duane Syndrome: A Patient\'s Perspective',
    slug: { current: 'eye-surgery-patient-perspective' },
    excerpt: 'I had strabismus surgery for my Duane Syndrome at age 25. Here\'s what the experience was actually like — from consultation to recovery.',
    publishedAt: '2024-12-10T09:00:00Z',
    readingTime: 10,
    tags: ['surgery', 'personal story', 'treatment'],
    author: { name: 'Alex T.' },
  },
];

export const seedCommunityLinks = [
  {
    _id: 'seed-community-1',
    name: 'Duane Syndrome Facebook Group',
    url: 'https://www.facebook.com/groups/34842586609',
    platform: 'facebook',
    description: 'Active Facebook group with over 3,000 members. Parents, patients, and doctors share experiences and advice.',
    memberCount: 3200,
  },
  {
    _id: 'seed-community-2',
    name: 'r/DuaneSyndrome (Reddit)',
    url: 'https://www.reddit.com/r/DuaneSyndrome',
    platform: 'reddit',
    description: 'Reddit community for discussing Duane Syndrome — medical questions, life experiences, and research updates.',
    memberCount: 850,
  },
  {
    _id: 'seed-community-3',
    name: 'Duane Syndrome Foundation',
    url: 'https://example.com/dsf',
    platform: 'organization',
    description: 'Non-profit organization dedicated to raising awareness and funding research for Duane Retraction Syndrome.',
    memberCount: undefined,
  },
];

export const seedHackOfWeek = {
  id: 'seed-hack-1',
  title: 'The "Shoulder Tap" Trick for Group Photos',
  content:
    'When someone asks for a group photo, lightly tap the shoulder of the person next to you and ask them to stand on your preferred side. Most people happily switch — and you get a photo where you can look straight at the camera without turning your head.',
  author: 'Jamie R.',
  upvotes: 42,
  comments: [
    { id: 'c1', author: 'Noa M.', text: 'Game changer! I do this at every family event now.' },
    { id: 'c2', author: 'Alex T.', text: 'Such a simple tip but it makes a huge difference.' },
    { id: 'c3', author: 'Priya S.', text: 'I taught my kids to do this too — works great at school.' },
  ],
};

export const seedVisitorMapData: { code: string; count: number }[] = [
  { code: 'US', count: 312 },
  { code: 'IL', count: 187 },
  { code: 'GB', count: 145 },
  { code: 'DE', count: 98 },
  { code: 'FR', count: 87 },
  { code: 'IN', count: 76 },
  { code: 'CA', count: 68 },
  { code: 'AU', count: 54 },
  { code: 'BR', count: 47 },
  { code: 'ES', count: 43 },
  { code: 'IT', count: 39 },
  { code: 'NL', count: 35 },
  { code: 'JP', count: 31 },
  { code: 'KR', count: 28 },
  { code: 'MX', count: 24 },
  { code: 'SE', count: 22 },
  { code: 'ZA', count: 19 },
  { code: 'AR', count: 17 },
  { code: 'PL', count: 15 },
  { code: 'TR', count: 14 },
  { code: 'SG', count: 12 },
  { code: 'NZ', count: 10 },
  { code: 'CH', count: 9 },
  { code: 'NO', count: 8 },
  { code: 'IE', count: 7 },
];

export const seedFeaturedAdvocates = [
  {
    _id: 'emily-didonato',
    name: 'Emily DiDonato',
    tags: ['Model'],
    bio: 'International model and content creator who has openly shared her experience with Duane Syndrome, helping normalize the condition in the public eye.',
    videoUrl: 'https://www.tiktok.com/embed/7462404378872417582',
    socialLinks: [
      { platform: 'instagram', url: 'https://www.instagram.com/emilydidonato/' },
      { platform: 'tiktok', url: 'https://www.tiktok.com/@didonatoemily' },
    ],
  },
  {
    _id: 'grace-mckagan',
    name: 'Grace McKagan',
    tags: ['Musician'],
    bio: 'Grace has spoken publicly about living with Duane Syndrome, helping raise awareness through her platform and inspiring others in the DS community.',
    videoUrl: 'https://www.tiktok.com/embed/7565165321137474830',
    socialLinks: [
      { platform: 'instagram', url: 'https://www.instagram.com/gracemckagan/' },
      { platform: 'tiktok', url: 'https://www.tiktok.com/@gracemckagan97' },
    ],
  },
  {
    _id: 'michelle-yates',
    name: 'Michelle Yates',
    tags: ['Nutritionist', 'Podcaster'],
    bio: 'Nutrition expert and content creator who shares her experience with Duane Syndrome, bringing visibility to the condition through her wellness-focused content.',
    videoUrl: 'https://www.tiktok.com/embed/7161971837335883051',
    socialLinks: [
      { platform: 'instagram', url: 'https://www.instagram.com/yatesnutrition/' },
      { platform: 'tiktok', url: 'https://www.tiktok.com/@yatesnutrition' },
    ],
  },
  {
    _id: 'poonam-nathu',
    name: 'Dr. Poonam Nathu',
    tags: ['Doctor'],
    bio: 'Neuro-vision specialist who educates about Duane Syndrome and other vision conditions through her practice and social media presence.',
    videoUrl: 'https://www.instagram.com/reel/CwqHZc7p-29/embed/',
    thumbnailUrl: 'https://scontent-mrs2-3.cdninstagram.com/v/t51.71878-15/496827558_659908083495979_6216036024076039258_n.jpg?stp=cmp1_dst-jpg_e35_s640x640_tt6&_nc_cat=102&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=0UzW93XbWQMQ7kNvwHEi1F-&_nc_oc=AdkxHnrXNIwAe5GRs6YlDaTGyknHSr4_f4lY9_1SqLdlmFo6PkzP9bdytKQIvUTmfJQ&_nc_zt=23&_nc_ht=scontent-mrs2-3.cdninstagram.com&_nc_gid=sXkDpg_J6z6T6hiWf8ZoYQ&_nc_ss=8&oh=00_AfxSOaXZ9cVdqSC3wITNlY1qsOXulwcR07_pP0uqxKwpKw&oe=69BB0DBE',
    socialLinks: [
      { platform: 'instagram', url: 'https://www.instagram.com/theneurovisiondoc/' },
    ],
  },
];

export const seedPodcasts = [
  {
    title: 'Life with Duane by Madaline McCabe',
    platform: 'Spotify',
    embedUrl: 'https://open.spotify.com/embed/episode/2xkgzEdAFEImnX1BzMSMrz',
  },
  {
    title: 'Duane Syndrome with Dr. Srav Vegunta',
    platform: 'Apple Podcasts',
    embedUrl: 'https://embed.podcasts.apple.com/au/podcast/duane-syndrome-with-dr-srav-vegunta/id1449421786?i=1000642482879&theme=light',
  },
  {
    title: 'Peyton\'s Duane Syndrome',
    platform: 'Spotify',
    embedUrl: 'https://open.spotify.com/embed/episode/2GVwQRQgs4zck2MFupGV5U',      
  },
];

export const seedSpotlightPeople = [
  {
    _id: 'seed-spotlight-1',
    name: 'Claudia (Example)',
    profession: 'Professional Dancer',
    bio: 'Professional contemporary dancer performing internationally. Diagnosed with Type 1 DS at age 4. Has spoken publicly about how dance helped her embrace her unique perspective — literally.',
    syndromeType: 'type1',
  },
  {
    _id: 'seed-spotlight-2',
    name: 'Michael (Example)',
    profession: 'Software Engineer at a Major Tech Company',
    bio: 'Senior engineer working on computer vision — a field that requires deep understanding of how eyes work. "Having Duane Syndrome made me fascinated by how vision actually functions."',
    syndromeType: 'type1',
  },
  {
    _id: 'seed-spotlight-3',
    name: 'Noa (Example)',
    profession: 'Pediatric Ophthalmologist',
    bio: 'Treats children with strabismus conditions including Duane Syndrome. Was inspired to enter the field after her own diagnosis at age 6. "I wanted to be the doctor I needed as a child."',
    syndromeType: 'type3',
  },
];
