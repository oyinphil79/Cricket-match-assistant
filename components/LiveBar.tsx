"use client";
import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import ModelSwitch from "./ModelSwitch";
import type { ModelId } from "@/lib/models";

type Props = {
  apiKey: string; onKey: (k: string) => void; keyError: string;
  model: ModelId; onModel: (m: ModelId) => void; busy: boolean;
};

export default function LiveBar({ apiKey, onKey, keyError, model, onModel, busy }: Props) {
  const [show, setShow] = useState(false);
  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium shadow-sm">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
          </span>
          <h1 className="text-sm font-semibold tracking-tight">HR policy assistant</h1>
        </div>
        <ModelSwitch value={model} onChange={onModel} disabled={busy} />
      </div>

      <div className="card flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <label className="flex min-w-60 flex-1 items-center gap-2 rounded-full border border-black/10 px-3 focus-within:border-black/30">
          <KeyRound className="size-3.5 shrink-0 text-neutral-400" strokeWidth={1.75} />
          <input
            type={show ? "text" : "password"} value={apiKey} onChange={(e) => onKey(e.target.value.trim())}
            placeholder="OpenAI API key (sk-…)" autoComplete="off" spellCheck={false} aria-label="OpenAI API key"
            className="min-w-0 flex-1 bg-transparent py-1.5 font-mono text-xs outline-none placeholder:font-sans placeholder:text-neutral-400"
          />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide key" : "Show key"} className="text-neutral-400 hover:text-neutral-700">
            {show ? <EyeOff className="size-3.5" strokeWidth={1.75} /> : <Eye className="size-3.5" strokeWidth={1.75} />}
          </button>
        </label>
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-900">
          Get a key
        </a>
        <p className="w-full text-xs text-neutral-400">Runs for real on your key. It stays in this browser tab and is never saved.</p>
        {keyError && <p className="w-full text-xs font-medium text-rose-600">{keyError}</p>}
      </div>
    </header>
  );
}
