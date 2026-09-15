'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { SessionJoinInfo, SessionResponse } from '@pulsefeedback/shared';
import { employeeFetch, getToken } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function OneOnOneJoinPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [info, setInfo] = useState<SessionJoinInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/public/sessions/${id}/join`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Join failed (${res.status})`);
        }
        const data = (await res.json()) as SessionJoinInfo;
        if (cancelled) return;
        if (data.type !== 'one_on_one') {
          throw new Error('This link is for 1:1 sessions only');
        }
        setInfo(data);
        setAnswers(Object.fromEntries(data.topics.map((t) => [t.id, ''])));

        if (getToken()) {
          try {
            const existing = await employeeFetch<SessionResponse | null>(
              `/api/sessions/${id}/responses/mine`,
            );
            if (!cancelled && existing) {
              setDone(true);
              setStarted(true);
            }
          } catch {
            // ignore
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load session');
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
      await employeeFetch(`/api/sessions/${id}/responses`, {
        method: 'POST',
        body: JSON.stringify({
          answers: info.topics.map((t) => ({
            topicId: t.id,
            text: (answers[t.id] ?? '').trim() || '(no answer)',
          })),
        }),
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
        <p className="rounded-xl border border-line bg-warn-soft px-4 py-3 text-sm">{error}</p>
      </main>
    );
  }

  if (!info) {
    return (
      <main className="mx-auto max-w-lg px-5 py-12 text-sm text-ink-muted">Loading session…</main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-5 py-10">
      <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">1:1 Discussion</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink">{info.title}</h1>
      <p className="mt-2 text-ink-muted">
        Status: {info.status.replace('_', ' ')} · {info.topics.length} topics
      </p>

      {done ? (
        <section className="mt-8 rounded-2xl border border-line bg-bg-elevated p-5">
          <p className="text-sm text-ink">Notes submitted. Thank you.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-accent underline">
            Back to my sessions
          </Link>
        </section>
      ) : !started ? (
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="mt-8 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white"
        >
          Start conversation
        </button>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-line bg-bg-elevated p-5">
          <p className="text-sm font-medium text-ink">Share a short note per topic</p>
          {info.topics.map((t) => (
            <label key={t.id} className="block text-sm text-ink-muted">
              {t.order}. {t.title}
              <textarea
                className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-ink outline-none focus:border-accent"
                rows={2}
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
            {submitting ? 'Submitting…' : 'Submit notes'}
          </button>
        </form>
      )}
    </main>
  );
}
