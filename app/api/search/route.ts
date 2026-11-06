// Step 3: embed the question, score every chunk with cosine similarity, keep the top 4.
import { embed } from "@/lib/agent";
import { rank } from "@/lib/cosine";
import { TOP_K } from "@/lib/limits";
import { getKey, readJson, route } from "@/lib/server";
import { indexOf, questionOf } from "@/lib/validate";

export const POST = route(async (req) => {
  const key = getKey(req);
  const body = await readJson(req);
  const question = questionOf(body.question);
  const index = indexOf(body.index);
  const { vectors, tokens } = await embed(key, [question]);
  const ranked = rank(vectors[0], index); // every chunk, best first — the UI shows them all
  return { ranked, top: ranked.slice(0, TOP_K).map((r) => r.id), tokens };
});
