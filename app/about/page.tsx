import { headers } from 'next/headers';
import { AboutBrochure } from '@/components/about/about-brochure';

export default async function AboutPage() {
  const hdrs = await headers();
  const countryCode = hdrs.get('x-vercel-ip-country') ?? (process.env.NODE_ENV === 'development' ? 'MD' : undefined);

  return (
    <>
      <AboutBrochure countryCode={countryCode} />

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalCondition',
            name: 'Duane Syndrome',
            alternateName: ['Duane Retraction Syndrome', 'DRS', 'Stilling-Turk-Duane Syndrome'],
            description:
              'A rare congenital eye movement disorder caused by abnormal development of the sixth cranial nerve, resulting in limited eye movement, globe retraction, and characteristic upshoot/downshoot movements.',
            medicalSpecialty: 'Ophthalmology',
            epidemiology: 'Affects approximately 1 in 1,000 people, 1-5% of strabismus cases',
            signOrSymptom: [
              { '@type': 'MedicalSignOrSymptom', name: 'Limited eye abduction' },
              { '@type': 'MedicalSignOrSymptom', name: 'Globe retraction' },
              { '@type': 'MedicalSignOrSymptom', name: 'Palpebral fissure narrowing' },
              { '@type': 'MedicalSignOrSymptom', name: 'Compensatory head turn' },
            ],
          }),
        }}
      />

      {/* BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://duane-syndrome.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'About Duane Syndrome',
                item: 'https://duane-syndrome.com/about',
              },
            ],
          }),
        }}
      />
    </>
  );
}
