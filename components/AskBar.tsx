"use client";
import { useRef } from "react";
import { ArrowUp, FileText, Loader2, Search, Upload } from "lucide-react";
import { SAMPLES } from "@/lib/samples";

type Props = {
  question: string; onQuestion: (q: string) => void; onAsk: () => void; busy: boolean;
  activeSample: string | null; onPreset: (id: string) => void;
  sourceLabel: string; onUpload: (files: File[]) => void;
};

export default function AskBar({ question, onQuestion, onAsk, busy, activeSample, onPreset, sourceLabel, onUpload }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((s) => (
          <button
            key={s.id} onClick={() => onPreset(s.id)} disabled={busy}
            className={`pill border bg-white/80 text-neutral-600 shadow-sm transition hover:text-neutral-900 ${activeSample === s.id ? "border-black/25" : "border-black/5"}`}
          >
            <span className={`size-1.5 rounded-full ${s.dot}`} /> {s.title}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onAsk(); }} className="card flex items-center gap-2 rounded-full! py-1.5 pr-1.5 pl-4">
        <Search className="size-4 shrink-0 text-neutral-400" strokeWidth={1.75} />
        <input
          value={question} onChange={(e) => onQuestion(e.target.value)} maxLength={500}
          placeholder="Ask about leave, travel or benefits…" aria-label="Your question"
          className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-neutral-400"
        />
        <button type="submit" disabled={busy || !question.trim()} className="pill bg-ink text-white hover:bg-neutral-700 disabled:opacity-40">
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowUp className="size-3.5" strokeWidth={2} />} Ask
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 px-1 text-xs text-neutral-500">
        <FileText className="size-3.5" strokeWidth={1.75} />
        <span>Searching <span className="font-medium text-neutral-800">{sourceLabel}</span></span>
        <span className="text-neutral-300">·</span>
        <button onClick={() => fileInput.current?.click()} disabled={busy} className="flex items-center gap-1 underline-offset-2 hover:text-neutral-900 hover:underline">
          <Upload className="size-3" strokeWidth={1.75} /> Upload your PDFs
        </button>
        <span className="text-neutral-400">up to 3 files, 4 MB, 40 pages</span>
        <input
          ref={fileInput} type="file" accept="application/pdf,.pdf" multiple hidden
          onChange={(e) => { onUpload(Array.from(e.target.files ?? [])); e.target.value = ""; }}
        />
      </div>
    </section>
  );
}
