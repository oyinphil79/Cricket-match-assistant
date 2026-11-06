// Step 1a: PDFs (or a built-in sample) -> one plain-text entry per page.
import { MAX_BYTES, MAX_FILES } from "@/lib/limits";
import { readPdfs } from "@/lib/pdf";
import { samplePages, SAMPLES } from "@/lib/samples";
import { getKey, HttpError, route } from "@/lib/server";

export const POST = route(async (req) => {
  getKey(req); // stop early if there's no key, before doing any work

  // Samples are sent as JSON { sample: "leave" } — they are already split into pages.
  if (req.headers.get("content-type")?.includes("application/json")) {
    const { sample } = (await req.json().catch(() => ({}))) as { sample?: string };
    const s = SAMPLES.find((x) => x.id === sample);
    if (!s) throw new HttpError("Unknown sample handbook.");
    return { pages: samplePages(s) };
  }

  const form = await req.formData().catch(() => null);
  const files = (form?.getAll("files") ?? []).filter((f): f is File => f instanceof File);
  if (!files.length) throw new HttpError("Choose at least one PDF.");
  if (files.length > MAX_FILES) throw new HttpError(`Upload at most ${MAX_FILES} PDFs.`);
  if (files.some((f) => !f.name.toLowerCase().endsWith(".pdf"))) throw new HttpError("Only PDF files, please.");
  if (files.reduce((n, f) => n + f.size, 0) > MAX_BYTES) throw new HttpError("Keep the PDFs under 4 MB in total.");
  return { pages: await readPdfs(files) };
});
