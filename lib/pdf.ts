// Turn PDF files into one plain-text entry per page.
import { extractText, getDocumentProxy } from "unpdf";
import { MAX_PAGES } from "./limits";
import type { Page } from "./types";

// Collapse whitespace so chunk text is an exact substring of the page text
// (the answer card relies on that to highlight the chunk).
export const clean = (s: string) => s.replace(/\s+/g, " ").trim();

export async function readPdfs(files: File[]): Promise<Page[]> {
  const pages: Page[] = [];
  for (const file of files) {
    let texts: string[];
    try {
      const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
      ({ text: texts } = await extractText(pdf, { mergePages: false }));
    } catch {
      throw new Error(`Couldn't read "${file.name}". Is it a valid, unlocked PDF?`);
    }
    if (pages.length + texts.length > MAX_PAGES) {
      throw new Error(`That's more than ${MAX_PAGES} pages in total. Try a shorter handbook.`);
    }
    texts.forEach((t, i) => pages.push({ id: pages.length, doc: file.name.replace(/\.pdf$/i, ""), page: i + 1, text: clean(t) }));
  }
  if (!pages.some((p) => p.text)) {
    throw new Error("No text found. Scanned PDFs (images of pages) can't be read.");
  }
  return pages;
}
