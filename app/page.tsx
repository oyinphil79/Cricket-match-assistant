"use client";
import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import KeyBar from "@/components/KeyBar";
import MessageBox from "@/components/MessageBox";
import ModelSwitch from "@/components/ModelSwitch";
import Thread from "@/components/Thread";
import { DEFAULT_MODEL, type ModelId } from "@/lib/presets";
import { readEvents } from "@/lib/stream";
import type { AssistantMessage, ChatMessage, HistoryTurn, StreamEvent } from "@/lib/types";

const KEY = "openai-key";
const uid = () => Math.random().toString(36).slice(2);

function apply(m: AssistantMessage, e: StreamEvent): AssistantMessage {
  switch (e.type) {
    case "status": return { ...m, steps: [...m.steps, e.text] };
    case "tool_start": return { ...m, calls: [...m.calls, { id: e.id, name: e.name, args: e.args }] };
    case "tool_end": return { ...m, calls: m.calls.map((c) => (c.id === e.id ? { ...c, ms: e.ms, result: e.result, error: e.error } : c)) };
    case "answer": return { ...m, answer: e.text };
    case "error": return { ...m, state: "error", error: e.message };
    case "done": return { ...m, state: "done" };
  }
}

export default function Page() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { try { setApiKey(sessionStorage.getItem(KEY) ?? ""); } catch { /* storage blocked */ } }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages]);

  const saveKey = (k: string) => {
    setApiKey(k);
    try { if (k) sessionStorage.setItem(KEY, k); else sessionStorage.removeItem(KEY); } catch { /* storage blocked */ }
  };

  const update = (id: string, fn: (m: AssistantMessage) => AssistantMessage) =>
    setMessages((all) => all.map((m) => (m.id === id && m.role === "assistant" ? fn(m) : m)));

  async function send(text: string) {
    if (busy || !apiKey) return;
    const history: HistoryTurn[] = messages.flatMap((m): HistoryTurn[] =>
      m.role === "user" ? [{ role: "user", content: m.text }] : m.answer ? [{ role: "assistant", content: m.answer }] : []);
    const id = uid();
    setMessages((all) => [...all, { id: uid(), role: "user", text }, { id, role: "assistant", state: "running", steps: [], calls: [] }]);
    setBusy(true);
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      const res = await fetch("/api/research", {
        method: "POST", signal: ctrl.signal,
        headers: { "Content-Type": "application/json", "openai-key": apiKey },
        body: JSON.stringify({ question: text, model, history }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? `Request failed (${res.status})`);
      await readEvents(res, (e) => update(id, (m) => apply(m, e)));
      update(id, (m) => (m.state === "running" ? { ...m, state: m.answer ? "done" : "error", error: m.answer ? undefined : "The stream ended early." } : m));
    } catch (err) {
      update(id, (m) => ctrl.signal.aborted
        ? { ...m, state: "stopped" }
        : { ...m, state: "error", error: err instanceof Error ? err.message : "Request failed." });
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }

  const newChat = () => { abort.current?.abort(); setMessages([]); };

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4">
      <header className="flex items-center justify-between gap-3 py-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="size-2 rounded-full bg-emerald-400" /> Cricket match assistant
        </div>
        <div className="flex items-center gap-2">
          <ModelSwitch value={model} onChange={setModel} disabled={busy} />
          <button onClick={newChat} className="pill border border-black/5 bg-white text-neutral-700 shadow-sm hover:border-black/15">
            <Plus className="size-3.5" strokeWidth={1.75} /> New chat
          </button>
        </div>
      </header>
      <KeyBar apiKey={apiKey} onChange={saveKey} />
      <section className="flex-1 pb-4">
        {messages.length === 0 ? <EmptyState onPick={send} disabled={!apiKey} /> : <Thread messages={messages} />}
        <div ref={bottom} />
      </section>
      <footer className="sticky bottom-0 bg-gradient-to-t from-page via-page to-transparent pb-5 pt-6">
        <MessageBox busy={busy} disabled={!apiKey} onSend={send} onStop={() => abort.current?.abort()} />
        <p className="mt-2 text-center text-[11px] text-neutral-400">Scores come from live search results and may be delayed. No betting advice.</p>
      </footer>
    </main>
  );
}
