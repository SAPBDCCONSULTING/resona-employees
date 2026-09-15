export type Locale = 'en' | 'hi';

export const LOCALES: { id: Locale; label: string; native: string }[] = [
  { id: 'en', label: 'English', native: 'EN' },
  { id: 'hi', label: 'Hindi', native: 'HI' },
];

const LOCALE_KEY = 'pf_locale';

export type Messages = {
  brandTag: string;
  loginTitle: string;
  loginSubtitle: string;
  email: string;
  password: string;
  signIn: string;
  signingIn: string;
  invalidCredentials: string;
  loginFailed: string;
  mySessions: string;
  mySessionsHint: string;
  open: string;
  completed: string;
  emptyOpen: string;
  emptyOpenHint: string;
  emptyCompleted: string;
  emptyCompletedHint: string;
  checkingSession: string;
  signOut: string;
  footer: string;
  language: string;
};

const en: Messages = {
  brandTag: 'Employees',
  loginTitle: 'Resona AI',
  loginSubtitle: 'Employee sign in',
  email: 'Email',
  password: 'Password',
  signIn: 'Sign in',
  signingIn: 'Signing in…',
  invalidCredentials: 'Invalid email or password',
  loginFailed: 'Login failed',
  mySessions: 'My sessions',
  mySessionsHint: 'Open assignments for 1:1 discussions and surveys appear here.',
  open: 'Open',
  completed: 'Completed',
  emptyOpen: 'No open sessions yet',
  emptyOpenHint: 'When HR assigns you a discussion or survey, it will show up in this list.',
  emptyCompleted: 'Nothing completed yet',
  emptyCompletedHint: 'Finished sessions will move here so you can revisit them later.',
  checkingSession: 'Checking session…',
  signOut: 'Sign out',
  footer: 'Resona AI · Listen · Learn · Act',
  language: 'Language',
};

/** Stub copy — full Hindi strings land with next-intl (F6.2). */
const hi: Messages = {
  ...en,
  brandTag: 'कर्मचारी',
  loginSubtitle: 'कर्मचारी साइन इन',
  email: 'ईमेल',
  password: 'पासवर्ड',
  signIn: 'साइन इन',
  signingIn: 'साइन इन हो रहा है…',
  invalidCredentials: 'गलत ईमेल या पासवर्ड',
  loginFailed: 'लॉगिन असफल',
  mySessions: 'मेरे सत्र',
  mySessionsHint: '1:1 चर्चा और सर्वे के खुले असाइनमेंट यहाँ दिखेंगे।',
  open: 'खुले',
  completed: 'पूर्ण',
  emptyOpen: 'अभी कोई खुला सत्र नहीं',
  emptyOpenHint: 'जब HR आपको असाइन करेगा, वह यहाँ दिखेगा।',
  emptyCompleted: 'अभी कुछ पूर्ण नहीं',
  emptyCompletedHint: 'पूरे हुए सत्र बाद में यहाँ दिखेंगे।',
  checkingSession: 'सत्र जाँच हो रही है…',
  signOut: 'साइन आउट',
  language: 'भाषा',
};

const catalogs: Record<Locale, Messages> = { en, hi };

export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const raw = localStorage.getItem(LOCALE_KEY);
  return raw === 'hi' ? 'hi' : 'en';
}

export function setStoredLocale(locale: Locale) {
  localStorage.setItem(LOCALE_KEY, locale);
}

export function t(locale: Locale): Messages {
  return catalogs[locale] ?? en;
}
