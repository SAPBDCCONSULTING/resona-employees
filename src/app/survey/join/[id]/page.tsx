'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { SessionJoinInfo, SessionResponse } from '@pulsefeedback/shared';
import { employeeFetch, getToken } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function SurveyJoinPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [info, setInfo] = useState<SessionJoinInfo | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [mine, setMine] = useState<SessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/public/sessions/${id}/join`);
        if (!res.ok) throw new Error(`Join failed (${res.status})`);
        const data = (await res.json()) as SessionJoinInfo;
        if (cancelled) return;
        if (data.type !== 'survey') throw new Error('This link is for surveys only');
        setInfo(data);
        setAnswers(Object.fromEntries(data.topics.map((t) => [t.id, ''])));

        if (getToken()) {
          try {
            const existing = await employeeFetch<SessionResponse | null>(
              `/api/sessions/${id}/responses/mine`,
            );
            if (!cancelled && existing) {
              setMine(existing);
              setDone(true);
            }
          } catch {
            // not signed in / no prior response
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!info) return;
    if (!getToken()) {
      router.push('/login');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        answers: info.topics.map((t) => ({
          topicId: t.id,
          text: (answers[t.id] ?? '').trim() || '(no answer)',
        })),
      };
      await employeeFetch(`/api/sessions/${id}/responses`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !info) {
    return (
      <main className="mx-auto max-w-lg px-5 py-12">
        <p className="rounded-xl bg-warn-soft px-4 py-3 text-sm">{error}</p>
      </main>
    );
  }

  if (!info) return <main className="mx-auto max-w-lg px-5 py-12 text-sm">Loading…</main>;

  return (
    <main className="mx-auto max-w-lg px-5 py-10">
      <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">Survey</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">{info.title}</h1>

      {done || mine ? (
        <section className="mt-8 rounded-2xl border border-line bg-bg-elevated p-6">
          <p className="text-sm text-ink">Response submitted. Thank you.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-accent underline">
            Back to my sessions
          </Link>
        </section>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {info.topics.map((t) => (
            <label key={t.id} className="block text-sm text-ink-muted">
              {t.order}. {t.title}
              <textarea
                className="mt-2 w-full rounded-xl border border-line bg-bg-elevated px-3 py-2.5 text-ink outline-none focus:border-accent"
                rows={3}
                value={answers[t.id] ?? ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [t.id]: e.target.value }))}
                required
              />
            </label>
          ))}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit responses'}
          </button>
          {!getToken() ? (
            <p className="text-xs text-ink-muted">
              You will be asked to{' '}
              <Link href="/login" className="text-accent underline">
                sign in
              </Link>{' '}
              as <code>employee@acme.local</code>.
            </p>
          ) : null}
        </form>
      )}
    </main>
  );
}
