// Step 1b: pages -> overlapping ~120-word chunks that never cross a page.
import { chunkPages } from "@/lib/chunk";
import { MAX_CHUNKS } from "@/lib/limits";
import { getKey, HttpError, readJson, route } from "@/lib/server";
import { pagesOf } from "@/lib/validate";

export const POST = route(async (req) => {
  getKey(req);
  const pages = pagesOf((await readJson(req)).pages);
  const chunks = chunkPages(pages);
  if (!chunks.length) throw new HttpError("These pages have no text to chunk.");
  if (chunks.length > MAX_CHUNKS) {
    throw new HttpError(`That makes ${chunks.length} chunks; the cap is ${MAX_CHUNKS}. Try a shorter handbook.`);
  }
  return { chunks };
});
