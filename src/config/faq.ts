import type { TranslationKey } from '../i18n/translations'

export type Faq = { questionKey: TranslationKey; answerKey: TranslationKey }

// Mirrors the FAQPage entries in index.html (kept in English for search engines).
export const faqs: Faq[] = [
  { questionKey: 'faq.q1', answerKey: 'faq.a1' },
  { questionKey: 'faq.q2', answerKey: 'faq.a2' },
  { questionKey: 'faq.q3', answerKey: 'faq.a3' },
  { questionKey: 'faq.q4', answerKey: 'faq.a4' },
  { questionKey: 'faq.q5', answerKey: 'faq.a5' },
]
