// Step 4: give the model only the top chunks and get a short, cited answer back.
import { answer } from "@/lib/agent";
import { TOP_K } from "@/lib/limits";
import { DEFAULT_MODEL, isModel } from "@/lib/models";
import { getKey, readJson, route } from "@/lib/server";
import { chunksOf, questionOf } from "@/lib/validate";

export const POST = route(async (req) => {
  const key = getKey(req);
  const body = await readJson(req);
  const question = questionOf(body.question);
  const chunks = chunksOf(body.chunks, TOP_K);
  const model = isModel(body.model) ? body.model : DEFAULT_MODEL;
  const t0 = Date.now();
  const result = await answer(key, model, question, chunks);
  return { ...result, ms: Date.now() - t0 };
});
