'use client';

import { useEffect, useState } from 'react';
import { getStoredLocale, setStoredLocale, t, type Locale } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/language-switcher';

export function useLocale() {
  const [locale, setLocale] = useState<Locale>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocale(getStoredLocale());
    setReady(true);
  }, []);

  function changeLocale(next: Locale) {
    setStoredLocale(next);
    setLocale(next);
  }

  return {
    locale,
    ready,
    messages: t(locale),
    changeLocale,
    LanguageControl: (
      <LanguageSwitcher
        locale={locale}
        onChange={changeLocale}
        label={t(locale).language}
      />
    ),
  };
}
