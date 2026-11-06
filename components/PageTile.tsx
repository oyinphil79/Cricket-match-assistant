import { Check } from "lucide-react";

export type TileView = {
  label: string; // "p. 3"
  preview: string; // a few words of the page, shown as faint lines
  reading: boolean; // pulses while the read step runs
  chunks: number; // one stripe per chunk
  heat: number | null; // 0–1, how close its best chunk is to the question
  ranks: number[]; // #1–#4: its chunks that were sent to the model
  used: boolean; // the model said it relied on this page
};

export default function PageTile({ t }: { t: TileView }) {
  // Heatmap: more green the closer the page's best chunk is to the question.
  const bg = t.heat === null ? "white" : `rgb(16 185 129 / ${0.06 + t.heat * 0.5})`;
  return (
    <div
      style={{ backgroundColor: bg }}
      className={`relative flex aspect-[3/4] flex-col gap-1.5 overflow-hidden rounded-md border p-2 shadow-sm transition-colors duration-700 ${t.used ? "border-emerald-500" : "border-black/8"} ${t.reading ? "animate-pulse" : ""}`}
    >
      <span className="font-mono text-[10px] text-neutral-500">{t.label}</span>
      <p className="line-clamp-6 text-[6px] leading-[9px] text-neutral-300 select-none">{t.preview}</p>

      {t.ranks.length > 0 && (
        <div className="absolute top-1.5 right-1.5 flex gap-0.5">
          {t.ranks.map((r) => (
            <span key={r} className="rounded-full bg-ink px-1.5 py-px font-mono text-[9px] text-white">#{r}</span>
          ))}
        </div>
      )}
      {t.used && (
        <span className="absolute right-1.5 bottom-4 grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      )}
      {t.chunks > 0 && (
        <div className="mt-auto flex gap-0.5">
          {Array.from({ length: t.chunks }, (_, i) => <span key={i} className="h-1 flex-1 rounded-full bg-neutral-400/50" />)}
        </div>
      )}
    </div>
  );
}
