"use client";
import { useState } from "react";
import { KeyRound } from "lucide-react";

type Props = { apiKey: string; onChange: (key: string) => void };

export default function KeyBar({ apiKey, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);

  if (apiKey && !editing) {
    return (
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <KeyRound className="size-3.5" strokeWidth={1.75} />
        OpenAI key kept in this tab only
        <button onClick={() => setEditing(true)} className="underline underline-offset-2 hover:text-neutral-800">Change</button>
        <button onClick={() => onChange("")} className="underline underline-offset-2 hover:text-neutral-800">Forget</button>
      </div>
    );
  }

  const save = () => { if (draft.trim()) { onChange(draft.trim()); setDraft(""); setEditing(false); } };
  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }} className="card flex items-center gap-2 p-1.5 pl-4">
      <KeyRound className="size-4 shrink-0 text-neutral-400" strokeWidth={1.75} />
      <input
        type="password" value={draft} onChange={(e) => setDraft(e.target.value)} autoComplete="off" spellCheck={false}
        placeholder="Paste your OpenAI API key (kept in this tab, never stored)"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
      />
      <button type="submit" className="pill bg-ink text-white hover:bg-neutral-700 disabled:opacity-40" disabled={!draft.trim()}>Use key</button>
    </form>
  );
}
