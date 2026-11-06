import type { Page } from "@/lib/types";

const CONTEXT = 35; // words of page text shown either side of the highlight

// The source page "lifted out" of the wall, tilted, with the used chunk(s) highlighted.
export default function LiftedPage({ page, highlights }: { page: Page; highlights: string[] }) {
  // Find each chunk inside the page text and merge overlapping ranges
  // (neighbouring chunks share 30 words, so they often overlap).
  const ranges = highlights
    .map((h) => { const s = page.text.indexOf(h); return s < 0 ? null : [s, s + h.length] as const; })
    .filter((r): r is readonly [number, number] => r !== null)
    .sort((a, b) => a[0] - b[0])
    .reduce<[number, number][]>((acc, [s, e]) => {
      const last = acc.at(-1);
      if (last && s <= last[1]) last[1] = Math.max(last[1], e);
      else acc.push([s, e]);
      return acc;
    }, []);

  // Show a window around the highlight, not the whole page.
  const from = ranges.length ? wordsBack(page.text, ranges[0][0], CONTEXT) : 0;
  const to = ranges.length ? wordsForward(page.text, ranges.at(-1)![1], CONTEXT) : Math.min(page.text.length, 900);
  const parts: { text: string; mark: boolean }[] = [];
  let at = from;
  for (const [s, e] of ranges) {
    if (s > at) parts.push({ text: page.text.slice(at, s), mark: false });
    parts.push({ text: page.text.slice(Math.max(s, at), e), mark: true });
    at = e;
  }
  if (at < to) parts.push({ text: page.text.slice(at, to), mark: false });

  return (
    <div className="w-full max-w-72 shrink-0 -rotate-2 rounded-lg border border-black/5 bg-white p-4 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.25)]">
      <p className="mb-2 flex justify-between font-mono text-[10px] text-neutral-400">
        <span className="truncate">{page.doc}</span><span>p. {page.page}</span>
      </p>
      <p className="text-[10px] leading-relaxed text-neutral-400">
        {from > 0 && "… "}
        {parts.map((p, i) => p.mark
          ? <mark key={i} className="rounded-sm bg-emerald-100 text-neutral-800">{p.text}</mark>
          : <span key={i}>{p.text}</span>)}
        {to < page.text.length && " …"}
      </p>
    </div>
  );
}

function wordsBack(text: string, i: number, n: number) {
  for (let k = 0; k < n && i > 0; k++) i = text.lastIndexOf(" ", i - 2) + 1;
  return Math.max(0, i);
}
function wordsForward(text: string, i: number, n: number) {
  for (let k = 0; k < n && i < text.length; k++) { const j = text.indexOf(" ", i + 1); i = j < 0 ? text.length : j; }
  return i;
}
