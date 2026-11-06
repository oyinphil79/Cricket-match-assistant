"use client";
import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

export type Keys = { openai: string; serpapi: string };
type Props = { keys: Keys; serpOnServer: boolean; onChange: (keys: Keys) => void };

function KeyField({ label, hint, value, onChange, href }: {
  label: string; hint: string; value: string; onChange: (v: string) => void; href: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-neutral-700">{label}</span>
        <a href={href} target="_blank" rel="noreferrer" className="text-neutral-400 underline-offset-2 hover:text-neutral-700 hover:underline">Get a key</a>
      </span>
      <span className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 focus-within:border-black/30">
        <input
          type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)}
          autoComplete="off" spellCheck={false} placeholder={hint}
          className="min-w-0 flex-1 bg-transparent py-2 font-mono text-xs outline-none placeholder:font-sans placeholder:text-neutral-400"
        />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide key" : "Show key"} className="text-neutral-400 hover:text-neutral-700">
          {show ? <EyeOff className="size-3.5" strokeWidth={1.75} /> : <Eye className="size-3.5" strokeWidth={1.75} />}
        </button>
      </span>
    </label>
  );
}

export default function KeyBar({ keys, serpOnServer, onChange }: Props) {
  const ready = Boolean(keys.openai && (keys.serpapi || serpOnServer));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Keys>(keys);
  useEffect(() => setDraft(keys), [keys]); // keys load from sessionStorage after mount

  if (ready && !editing) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <KeyRound className="size-3.5" strokeWidth={1.75} />
        {keys.serpapi ? "OpenAI and SerpApi keys kept in this tab only" : "OpenAI key kept in this tab only · SerpApi key from the server"}
        <button onClick={() => { setDraft(keys); setEditing(true); }} className="underline underline-offset-2 hover:text-neutral-800">Change</button>
        <button onClick={() => onChange({ openai: "", serpapi: "" })} className="underline underline-offset-2 hover:text-neutral-800">Forget</button>
      </div>
    );
  }

  const canSave = Boolean(draft.openai.trim() && (draft.serpapi.trim() || serpOnServer));
  const save = () => {
    if (!canSave) return;
    onChange({ openai: draft.openai.trim(), serpapi: draft.serpapi.trim() });
    setEditing(false);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }} className="card space-y-4 p-5">
      <div className="flex items-start gap-2">
        <KeyRound className="mt-0.5 size-4 shrink-0 text-neutral-400" strokeWidth={1.75} />
        <p className="text-xs leading-relaxed text-neutral-500">
          Your keys stay in this browser tab only and are sent with each question. They are never saved or logged.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <KeyField label="OpenAI API key" hint="sk-…" href="https://platform.openai.com/api-keys"
          value={draft.openai} onChange={(openai) => setDraft({ ...draft, openai })} />
        <KeyField label={serpOnServer ? "SerpApi key (optional)" : "SerpApi key"}
          hint={serpOnServer ? "Uses the server's key if empty" : "For live match data"} href="https://serpapi.com/manage-api-key"
          value={draft.serpapi} onChange={(serpapi) => setDraft({ ...draft, serpapi })} />
      </div>
      <div className="flex justify-end gap-2">
        {editing && (
          <button type="button" onClick={() => setEditing(false)} className="pill text-neutral-500 hover:text-neutral-900">Cancel</button>
        )}
        <button type="submit" disabled={!canSave} className="pill bg-ink text-white hover:bg-neutral-700 disabled:opacity-40">Save keys</button>
      </div>
    </form>
  );
}
