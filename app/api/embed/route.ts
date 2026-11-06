// Step 2: chunks -> vectors. Chunks + vectors together are the whole index.
import { embed } from "@/lib/agent";
import { getKey, readJson, route } from "@/lib/server";
import { chunksOf } from "@/lib/validate";

export const POST = route(async (req) => {
  const key = getKey(req);
  const chunks = chunksOf((await readJson(req)).chunks);
  const { vectors, tokens } = await embed(key, chunks.map((c) => c.text));
  // Send the index back; the browser keeps it so follow-up questions skip this step.
  return { index: chunks.map((c, i) => ({ ...c, vector: vectors[i] })), tokens };
});
