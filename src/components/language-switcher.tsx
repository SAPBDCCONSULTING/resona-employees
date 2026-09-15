'use client';

import { LOCALES, type Locale } from '@/lib/i18n';

type Props = {
  locale: Locale;
  onChange: (locale: Locale) => void;
  label: string;
};

export function LanguageSwitcher({ locale, onChange, label }: Props) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <span className="text-xs text-ink-muted">{label}</span>
      <div className="inline-flex rounded-xl border border-line bg-bg-elevated p-0.5">
        {LOCALES.map((opt) => {
          const active = opt.id === locale;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              aria-pressed={active}
              className={`min-h-9 min-w-11 rounded-[0.65rem] px-2.5 text-xs font-medium transition-colors ${
                active
                  ? 'bg-accent text-white'
                  : 'text-ink-muted hover:bg-info-soft hover:text-ink'
              }`}
            >
              {opt.native}
            </button>
          );
        })}
      </div>
    </div>
  );
}
