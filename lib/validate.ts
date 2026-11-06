// Check what the browser sent before doing any work with it.
import { DIMENSIONS, MAX_CHUNKS, MAX_PAGES, MAX_QUESTION } from "./limits";
import { HttpError } from "./server";
import type { Chunk, IndexedChunk, Page } from "./types";

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object";
const num = (x: unknown) => typeof x === "number" && Number.isFinite(x);
const str = (x: unknown) => typeof x === "string";

export function pagesOf(x: unknown): Page[] {
  if (!Array.isArray(x) || !x.length) throw new HttpError("Send a non-empty list of pages.");
  if (x.length > MAX_PAGES) throw new HttpError(`At most ${MAX_PAGES} pages, please.`);
  if (!x.every((p) => isObj(p) && num(p.id) && num(p.page) && str(p.doc) && str(p.text))) {
    throw new HttpError("Each page needs an id, doc, page number and text.");
  }
  return x as Page[];
}

export function chunksOf(x: unknown, max = MAX_CHUNKS): Chunk[] {
  if (!Array.isArray(x) || !x.length) throw new HttpError("Send a non-empty list of chunks.");
  if (x.length > max) throw new HttpError(`At most ${max} chunks, please.`);
  if (!x.every((c) => isObj(c) && num(c.id) && num(c.pageId) && num(c.page) && str(c.doc) && str(c.text) && c.text)) {
    throw new HttpError("Each chunk needs an id, page, doc and some text.");
  }
  return x as Chunk[];
}

export function indexOf(x: unknown): IndexedChunk[] {
  const chunks = chunksOf(x) as IndexedChunk[];
  if (!chunks.every((c) => Array.isArray(c.vector) && c.vector.length === DIMENSIONS && c.vector.every(num))) {
    throw new HttpError(`Every chunk needs a ${DIMENSIONS}-number vector. Run the embed step first.`);
  }
  return chunks;
}

export function questionOf(x: unknown): string {
  const q = str(x) ? (x as string).trim() : "";
  if (!q) throw new HttpError("Type a question first.");
  if (q.length > MAX_QUESTION) throw new HttpError(`Keep the question under ${MAX_QUESTION} characters.`);
  return q;
}
