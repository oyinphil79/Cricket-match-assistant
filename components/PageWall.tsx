import PageTile, { type TileView } from "./PageTile";
import StepStrip from "./StepStrip";
import type { Chunk, Page, Scored, Steps } from "@/lib/types";

type Props = {
  pages: Page[]; pending: string[]; reading: boolean; steps: Steps;
  chunks: Chunk[]; ranked: Scored[]; top: number[]; used: number[];
};

// The handbook as a wall of page tiles. Every step of the run shows up on them.
export default function PageWall({ pages, pending, reading, steps, chunks, ranked, top, used }: Props) {
  const pageOf = new Map(chunks.map((c) => [c.id, c.pageId]));

  // Best score per page, stretched to 0–1 so the heatmap shows contrast.
  const best = new Map<number, number>();
  for (const r of ranked) {
    const p = pageOf.get(r.id);
    if (p !== undefined && !best.has(p)) best.set(p, r.score); // ranked is best-first
  }
  const scores = [...best.values()];
  const lo = Math.min(...scores), hi = Math.max(...scores);
  const usedPages = new Set(used.map((id) => pageOf.get(id)));

  const tiles: TileView[] = pages.length
    ? pages.map((p) => ({
        label: pages.some((q) => q.doc !== p.doc) ? `${p.doc.slice(0, 10)} p.${p.page}` : `p. ${p.page}`,
        preview: p.text.split(" ").slice(0, 60).join(" "),
        reading,
        chunks: chunks.filter((c) => c.pageId === p.id).length,
        heat: best.has(p.id) ? (hi > lo ? (best.get(p.id)! - lo) / (hi - lo) : 1) : null,
        ranks: top.flatMap((id, i) => (pageOf.get(id) === p.id ? [i + 1] : [])),
        used: usedPages.has(p.id),
      }))
    // Uploaded PDFs we haven't read yet: one blank sheet per file.
    : pending.map((name) => ({ label: name.slice(0, 14), preview: "", reading, chunks: 0, heat: null, ranks: [], used: false }));

  return (
    <section className="card overflow-hidden">
      <StepStrip steps={steps} />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-3 bg-neutral-50/60 p-4">
        {tiles.map((t, i) => <PageTile key={i} t={t} />)}
      </div>
    </section>
  );
}
