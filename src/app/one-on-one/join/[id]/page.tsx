'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { SessionJoinInfo } from '@pulsefeedback/shared';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function OneOnOneJoinPage() {
  const { id } = useParams<{ id: string }>();
  const [info, setInfo] = useState<SessionJoinInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

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
        if (!cancelled) {
          if (data.type !== 'one_on_one') {
            throw new Error('This link is for 1:1 sessions only');
          }
          setInfo(data);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load session');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
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

      {!started ? (
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="mt-8 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white"
        >
          Start conversation
        </button>
      ) : (
        <section className="mt-8 space-y-3 rounded-2xl border border-line bg-bg-elevated p-5">
          <p className="text-sm font-medium text-ink">Discussion outline</p>
          <ol className="space-y-2 text-sm text-ink-muted">
            {info.topics.map((t) => (
              <li key={t.id}>
                {t.order}. {t.title}
              </li>
            ))}
          </ol>
          <p className="pt-2 text-xs text-ink-muted">
            Live AI chat (/one-on-one/chat/:id) comes next — outline is ready.
          </p>
        </section>
      )}
    </main>
  );
}
