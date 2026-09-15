'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { SessionJoinInfo } from '@pulsefeedback/shared';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function SurveyJoinPage() {
  const { id } = useParams<{ id: string }>();
  const [info, setInfo] = useState<SessionJoinInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/public/sessions/${id}/join`);
        if (!res.ok) throw new Error(`Join failed (${res.status})`);
        const data = (await res.json()) as SessionJoinInfo;
        if (!cancelled) {
          if (data.type !== 'survey') throw new Error('This link is for surveys only');
          setInfo(data);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
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
      <ol className="mt-6 space-y-2 text-sm text-ink-muted">
        {info.topics.map((t) => (
          <li key={t.id}>
            {t.order}. {t.title}
          </li>
        ))}
      </ol>
    </main>
  );
}
