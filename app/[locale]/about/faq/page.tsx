import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: 'What causes Duane Syndrome?',
    answer: 'Duane Syndrome is caused by abnormal development of the sixth cranial nerve (abducens nerve) during the first trimester of pregnancy. The brain compensates by sending branches of the third cranial nerve (oculomotor nerve) to the lateral rectus muscle, resulting in the characteristic restricted movement and globe retraction. The exact cause of the nerve misdevelopment is unknown in most cases.',
  },
  {
    question: 'Is Duane Syndrome hereditary?',
    answer: 'Most cases (about 90%) are sporadic, meaning they occur without a family history. However, about 10% of cases appear to run in families, often with an autosomal dominant inheritance pattern with variable expression. Several genes have been associated with Duane Syndrome, including CHN1 and MAFB.',
  },
  {
    question: 'Can Duane Syndrome be cured?',
    answer: 'There is currently no cure for Duane Syndrome in the sense of restoring normal nerve pathways. However, surgery can improve eye alignment in primary gaze, reduce head turn, and minimize upshoot/downshoot. Many people with Duane Syndrome function very well without any treatment.',
  },
  {
    question: 'Does Duane Syndrome get worse over time?',
    answer: 'Duane Syndrome is typically stable and does not worsen over time. The nerve abnormality is present from birth and the movement pattern generally remains consistent throughout life. Some patients develop better compensatory strategies as they grow.',
  },
  {
    question: 'Can people with Duane Syndrome drive?',
    answer: 'Yes! Most people with Duane Syndrome can drive. Since the condition typically affects only one eye\'s movement, peripheral vision is usually adequate. Most countries require meeting visual acuity and visual field requirements, which most people with Duane Syndrome can meet. Check your local requirements.',
  },
  {
    question: 'Does Duane Syndrome affect vision?',
    answer: 'Duane Syndrome primarily affects eye movement, not visual acuity. Most people have normal or near-normal vision. However, some may develop amblyopia (lazy eye) if there is significant misalignment in childhood. Regular eye exams in childhood are important to catch and treat any amblyopia early.',
  },
  {
    question: 'Can Duane Syndrome be detected before birth?',
    answer: 'Currently, Duane Syndrome cannot be reliably detected through prenatal testing or ultrasound. It is typically diagnosed after birth when abnormal eye movements are noticed, often by parents, pediatricians, or eye doctors.',
  },
  {
    question: 'What is globe retraction?',
    answer: 'Globe retraction is the hallmark feature of Duane Syndrome. When the affected eye attempts to look toward the nose (adduction), the eyeball physically pulls back into the eye socket. This happens because both the medial and lateral rectus muscles contract simultaneously (co-contraction). It causes the eyelid opening to narrow visibly.',
  },
  {
    question: 'Should my child have surgery?',
    answer: 'Surgery is not always necessary. It is typically considered when there is a significant compensatory head turn, misalignment in the primary gaze position, double vision in a functional range, or significant cosmetic concerns affecting quality of life. An experienced strabismus surgeon can help evaluate whether surgery would be beneficial for your child\'s specific situation.',
  },
  {
    question: 'What sports are safe for people with Duane Syndrome?',
    answer: 'Most sports are perfectly fine! People with Duane Syndrome participate in all types of sports, including team sports, martial arts, swimming, and more. For activities requiring good depth perception (like ball sports), some people find they naturally adapt their head position. Contact sports carry no additional risk related to Duane Syndrome.',
  },
];

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900 sm:text-4xl">
        Frequently Asked Questions
      </h1>
      <p className="mt-4 text-warm-600">
        Common questions about Duane Syndrome from patients, parents, and friends.
      </p>

      <div className="mt-8 space-y-6">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group rounded-xl border border-warm-200 bg-card"
          >
            <summary className="cursor-pointer list-none p-5 text-lg font-semibold text-warm-800 hover:text-primary-700">
              <span className="flex items-center justify-between">
                {faq.question}
                <svg
                  className="h-5 w-5 shrink-0 text-warm-400 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </summary>
            <div className="border-t border-warm-100 px-5 pb-5 pt-3">
              <p className="text-warm-600 leading-relaxed">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>

      <p className="mt-8 text-sm text-warm-400 italic">
        This information is for educational purposes only and should not replace professional medical advice.
      </p>

      {/* FAQPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </div>
  );
}
