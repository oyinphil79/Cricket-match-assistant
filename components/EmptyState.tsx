"use client";
import { ChartLine, ListOrdered, Trophy } from "lucide-react";
import { PRESETS, TOOL_INFO } from "@/lib/presets";

const ICONS = { list: ListOrdered, score: Trophy, chart: ChartLine };

export default function EmptyState({ onPick, disabled }: { onPick: (q: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-10 py-16 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Ask about a live match</h1>
        <p className="mx-auto max-w-md text-sm text-neutral-500">
          Answers come from live search results. Every tool call is shown, so you can see where each number came from.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map((p) => (
          <button key={p.label} disabled={disabled} title={disabled ? "Add your API keys first" : undefined} onClick={() => onPick(p.question)} className="pill disabled:opacity-50 border border-black/5 bg-white text-neutral-700 shadow-sm hover:border-black/15">
            <span className={`size-1.5 rounded-full ${p.dot}`} />
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        {TOOL_INFO.map((t) => {
          const Icon = ICONS[t.icon];
          return (
            <div key={t.name} className="card p-4 text-left">
              <Icon className="mb-3 size-4 text-neutral-500" strokeWidth={1.75} />
              <div className="font-mono text-xs text-neutral-900">{t.name}</div>
              <div className="mt-1 text-xs leading-relaxed text-neutral-500">{t.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
