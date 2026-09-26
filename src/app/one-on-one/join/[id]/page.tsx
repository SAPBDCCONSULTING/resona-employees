'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type {
  ConversationChatTurnResult,
  SessionConversation,
  SessionJoinInfo,
  SessionResponse,
} from '@pulsefeedback/shared';
import { employeeFetch, getToken } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function OneOnOneJoinPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [info, setInfo] = useState<SessionJoinInfo | null>(null);
  const [conversation, setConversation] = useState<SessionConversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false);
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

        if (getToken()) {
          try {
            const existing = await employeeFetch<SessionResponse | null>(
              `/api/sessions/${id}/responses/mine`,
            );
            if (!cancelled && existing) {
              setDone(true);
              return;
            }
            const convo = await employeeFetch<SessionConversation | null>(
              `/api/sessions/${id}/conversations/mine`,
            );
            if (!cancelled && convo) {
              setConversation(convo);
              if (convo.status === 'completed') setDone(true);
            }
          } catch {
            // ignore — user may need to sign in again on start
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length, busy]);

  async function ensureAuth() {
    if (!getToken()) {
      router.push('/login');
      return false;
    }
    return true;
  }

  async function startConversation() {
    if (!(await ensureAuth()) || !info) return;
    setStarting(true);
    setError(null);
    try {
      const convo = await employeeFetch<SessionConversation>(
        `/api/sessions/${id}/conversations/start`,
        { method: 'POST', body: '{}' },
      );
      setConversation(convo);
      if (convo.status === 'completed') setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start conversation');
    } finally {
      setStarting(false);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || busy || !conversation || done) return;
    if (!(await ensureAuth())) return;

    setInput('');
    setBusy(true);
    setError(null);

    // Optimistic user bubble
    setConversation((prev) =>
      prev
        ? {
            ...prev,
            messages: [
              ...prev.messages,
              {
                role: 'user',
                content: text,
                topicId: null,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        : prev,
    );

    try {
      const result = await employeeFetch<ConversationChatTurnResult>(
        `/api/sessions/${id}/conversations/chat`,
        {
          method: 'POST',
          body: JSON.stringify({ message: text }),
        },
      );
      setConversation(result.conversation);
      if (result.agendaComplete || result.conversation.status === 'completed') {
        setDone(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chat failed');
      // Drop optimistic message on failure by reloading mine
      try {
        const convo = await employeeFetch<SessionConversation | null>(
          `/api/sessions/${id}/conversations/mine`,
        );
        if (convo) setConversation(convo);
      } catch {
        // ignore
      }
    } finally {
      setBusy(false);
    }
  }

  const topics = info?.topics ?? [];
  const topicIndex = conversation?.currentTopicIndex ?? 0;
  const currentTopic = topics[topicIndex] ?? null;

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
          <p className="text-sm text-ink">Conversation complete. Thank you for sharing.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-accent underline">
            Back to my sessions
          </Link>
        </section>
      ) : !info.acceptingResponses ? (
        <section className="mt-8 rounded-2xl border border-line bg-bg-elevated p-5">
          <p className="text-sm text-ink">This session is not open for responses yet.</p>
          {info.startAt ? (
            <p className="mt-2 text-sm text-ink-muted">
              Opens {new Date(info.startAt).toLocaleString()}
            </p>
          ) : null}
          <Link href="/" className="mt-4 inline-block text-sm text-accent underline">
            Back to my sessions
          </Link>
        </section>
      ) : !conversation ? (
        <button
          type="button"
          onClick={() => void startConversation()}
          disabled={starting}
          className="mt-8 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {starting ? 'Starting…' : 'Start AI conversation'}
        </button>
      ) : (
        <section className="mt-6 flex min-h-[520px] flex-1 flex-col rounded-2xl border border-line bg-bg-elevated">
          {currentTopic ? (
            <div className="border-b border-line px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                Topic {topicIndex + 1} of {topics.length}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">{currentTopic.title}</p>
            </div>
          ) : null}

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {conversation.messages.map((m, i) => (
              <div
                key={`${m.role}-${i}-${m.createdAt}`}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-accent text-white'
                      : 'border border-line bg-bg text-ink'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy ? <p className="text-xs text-ink-muted">Facilitator is typing…</p> : null}
            <div ref={bottomRef} />
          </div>

          <form
            className="flex gap-2 border-t border-line p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
          >
            <input
              className="min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 py-2.5 text-ink outline-none focus:border-accent"
              placeholder="Reply to the facilitator…"
              value={input}
              disabled={busy}
              onChange={(e) => setInput(e.target.value)}
              maxLength={4000}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              Send
            </button>
          </form>
          {error ? <p className="px-4 pb-3 text-sm text-red-700">{error}</p> : null}
        </section>
      )}
    </main>
  );
}
