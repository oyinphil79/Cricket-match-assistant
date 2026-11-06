// Cut each page into overlapping word windows, by hand.
import { CHUNK_WORDS, OVERLAP_WORDS } from "./limits";
import type { Chunk, Page } from "./types";

export function chunkPages(pages: Page[]): Chunk[] {
  const chunks: Chunk[] = [];
  for (const p of pages) {
    const words = p.text.split(/\s+/).filter(Boolean);
    // Each window starts OVERLAP_WORDS before the last one ended, so a sentence cut
    // at a boundary still appears whole in one of the two chunks.
    for (let start = 0; start < words.length; start = start + CHUNK_WORDS - OVERLAP_WORDS) {
      const end = Math.min(start + CHUNK_WORDS, words.length);
      chunks.push({ id: chunks.length, pageId: p.id, doc: p.doc, page: p.page, text: words.slice(start, end).join(" ") });
      if (end === words.length) break; // don't emit a tiny tail that is all overlap
    }
  }
  return chunks;
}
