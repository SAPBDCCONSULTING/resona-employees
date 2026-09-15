'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setTokens } from '@/lib/auth';
import { useLocale } from '@/lib/use-locale';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function EmployeeLoginPage() {
  const router = useRouter();
  const { messages, LanguageControl } = useLocale();
  const [email, setEmail] = useState('employee@acme.local');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        throw new Error(messages.invalidCredentials);
      }
      const data = (await res.json()) as {
        accessToken: string;
        refreshToken?: string;
      };
      setTokens(data.accessToken, data.refreshToken);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.loginFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="employee-shell flex min-h-dvh items-center justify-center px-5 py-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-end">{LanguageControl}</div>
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-line bg-bg-elevated p-6 shadow-[var(--card-shadow)] sm:p-8"
        >
          <p className="font-serif text-3xl tracking-tight text-ink sm:text-[2.15rem]">
            {messages.loginTitle}
          </p>
          <p className="mt-1 text-sm text-ink-muted">{messages.loginSubtitle}</p>

          <label className="mt-6 block text-sm text-ink-muted">
            {messages.email}
            <input
              className="mt-1 min-h-11 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-base text-ink outline-none focus:border-accent sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              inputMode="email"
              required
            />
          </label>

          <label className="mt-4 block text-sm text-ink-muted">
            {messages.password}
            <input
              className="mt-1 min-h-11 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-base text-ink outline-none focus:border-accent sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

          <button type="submit" disabled={loading} className="btn btn-primary mt-6 w-full disabled:opacity-60">
            {loading ? messages.signingIn : messages.signIn}
          </button>
        </form>
      </div>
    </div>
  );
}
