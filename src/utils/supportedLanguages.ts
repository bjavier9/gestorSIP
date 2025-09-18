export const supportedLanguages = {
  ar: 'Arabic',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  nl: 'Dutch',
  en: 'English',
  'en-GB': 'English (UK)',
  fr: 'French',
  de: 'German',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  pl: 'Polish',
  'pt-BR': 'Portuguese (Brazil)',
  'pt-PT': 'Portuguese (Portugal)',
  ru: 'Russian',
  es: 'Spanish',
  'es-419': 'Spanish (Latin America)',
  th: 'Thai',
};

// Create a type for the language codes for type safety
export type LanguageCode = keyof typeof supportedLanguages;

export const isValidLanguageCode = (code: string): code is LanguageCode => {
  return code in supportedLanguages;
};
