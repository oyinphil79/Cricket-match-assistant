import { ChevronRight } from "lucide-react";
import type { Chunk, Scored } from "@/lib/types";

type Props = { ranked: Scored[]; chunks: Chunk[]; top: number[]; used: number[] };

// Every chunk, best match first. Collapsed by default so it doesn't crowd the page.
export default function ChunkList({ ranked, chunks, top, used }: Props) {
  if (!ranked.length) return null;
  const byId = new Map(chunks.map((c) => [c.id, c]));
  return (
    <details className="card group px-5 py-3">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-neutral-600">
        <ChevronRight className="size-3.5 transition group-open:rotate-90" strokeWidth={1.75} />
        All {ranked.length} chunks ranked by cosine similarity
      </summary>
      <ol className="mt-3 divide-y divide-black/5">
        {ranked.map((r, i) => {
          const c = byId.get(r.id);
          if (!c) return null;
          return (
            <li key={r.id} className="flex items-start gap-3 py-2 text-xs">
              <span className="hidden w-6 shrink-0 pt-0.5 text-right font-mono text-neutral-400 sm:block">{i + 1}</span>
              <span className="w-14 shrink-0 space-y-1 pt-0.5 sm:w-24">
                <span className="block font-mono text-neutral-700">{r.score.toFixed(3)}</span>
                <span className="block h-1 rounded-full bg-neutral-100">
                  <span className="block h-1 rounded-full bg-emerald-400" style={{ width: `${Math.max(0, r.score) * 100}%` }} />
                </span>
              </span>
              <span className="w-10 shrink-0 pt-0.5 font-mono text-neutral-500">p. {c.page}</span>
              <p className="line-clamp-2 flex-1 text-neutral-600">{c.text}</p>
              {top.includes(r.id) && (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${used.includes(r.id) ? "bg-emerald-500 text-white" : "bg-neutral-100 text-neutral-600"}`}>
                  {used.includes(r.id) ? "used" : "sent"}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </details>
  );
}
