'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { EmployeeAssignment } from '@pulsefeedback/shared';
import { employeeFetch } from '@/lib/api';

export default function EmployeeHomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<EmployeeAssignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pf_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await employeeFetch<EmployeeAssignment[]>('/api/me/assignments');
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-muted">
        Checking session…
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-5 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">Employees</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink">My sessions</h1>
        <p className="mt-2 text-ink-muted">Open assignments for 1:1 discussions and surveys.</p>
      </header>

      {error ? (
        <p className="mt-6 rounded-xl border border-line bg-warn-soft px-4 py-3 text-sm">{error}</p>
      ) : null}

      <section className="mt-8 space-y-3">
        {loading ? (
          <p className="text-sm text-ink-muted">Loading…</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-line bg-bg-elevated p-6">
            <p className="text-sm text-ink-muted">No open sessions yet.</p>
          </div>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-line bg-bg-elevated p-5"
            >
              <p className="text-xs uppercase tracking-[0.12em] text-ink-muted">
                {item.type === 'survey' ? 'Survey' : '1:1 Discussion'}
              </p>
              <h2 className="mt-1 font-serif text-2xl text-ink">{item.title}</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {item.topicsCount} topics
                {item.completedByMe ? ' · Submitted' : ' · Open'}
              </p>
              {item.completedByMe ? (
                <p className="mt-3 text-sm text-accent">Thanks — your response is in.</p>
              ) : (
                <Link
                  href={item.joinPath}
                  className="mt-4 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white"
                >
                  Start
                </Link>
              )}
            </article>
          ))
        )}
      </section>

      <button
        type="button"
        className="mt-6 self-start text-sm text-accent underline"
        onClick={() => {
          localStorage.removeItem('pf_token');
          localStorage.removeItem('pf_refresh');
          router.push('/login');
        }}
      >
        Sign out
      </button>

      <footer className="mt-auto pt-10 text-center text-xs text-ink-muted">
        Resona AI · Listen · Learn · Act
      </footer>
    </div>
  );
}
