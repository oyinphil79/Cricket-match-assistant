// Hard caps so one click can't burn through a free quota.
export const MAX_FILES = 3;
export const MAX_BYTES = 4 * 1024 * 1024; // 4 MB for all files together
export const MAX_PAGES = 40;
export const MAX_CHUNKS = 150;
export const MAX_QUESTION = 500; // characters

export const CHUNK_WORDS = 120;
export const OVERLAP_WORDS = 30;
export const TOP_K = 4;
export const DIMENSIONS = 768;

/** Quick check in the browser so a too-big upload fails before it is sent. The server checks again. */
export function checkFiles(files: File[]): string | null {
  if (!files.length) return "Choose at least one PDF.";
  if (files.length > MAX_FILES) return `Upload at most ${MAX_FILES} PDFs.`;
  if (files.some((f) => !f.name.toLowerCase().endsWith(".pdf"))) return "Only PDF files, please.";
  if (files.reduce((n, f) => n + f.size, 0) > MAX_BYTES) return "Keep the PDFs under 4 MB in total.";
  return null;
}
