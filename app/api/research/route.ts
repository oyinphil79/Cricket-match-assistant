// POST /api/research — streams the agent's steps as newline-delimited JSON.
import { runAgent } from "@/lib/agent";
import { isModelId } from "@/lib/presets";
import type { HistoryTurn, StreamEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Strip anything that looks like a key from error text so it never reaches the page.
const clean = (s: string, ...keys: string[]) =>
  keys.filter(Boolean).reduce((t, k) => t.split(k).join("…"), s).replace(/sk-[\w*\-]+/g, "sk-…");

// Lets the page know whether it must ask the user for a SerpApi key.
export function GET() {
  return Response.json({ serpapiOnServer: Boolean(process.env.SERPAPI_API_KEY) });
}

function friendly(e: unknown, ...keys: string[]): string {
  const status = (e as { status?: number })?.status;
  if (status === 401) return "OpenAI rejected the API key. Check it and try again.";
  if (status === 429) return "OpenAI rate limit or quota reached. Try again shortly.";
  if (status === 404) return "That model is not available for this API key.";
  return clean(e instanceof Error ? e.message : "Something went wrong.", ...keys);
}

export async function POST(req: Request) {
  const apiKey = req.headers.get("openai-key")?.trim();
  if (!apiKey) return Response.json({ error: "Missing openai-key header." }, { status: 401 });
  // A key typed in the page wins; otherwise fall back to the server's own key.
  const serpKey = req.headers.get("serpapi-key")?.trim() || process.env.SERPAPI_API_KEY || "";

  const body = await req.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim().slice(0, 2000) : "";
  if (!question) return Response.json({ error: "Missing question." }, { status: 400 });
  const model = isModelId(body?.model) ? body.model : "gpt-5.4-mini";
  const history: HistoryTurn[] = (Array.isArray(body?.history) ? body.history : [])
    .filter((t: HistoryTurn) => (t?.role === "user" || t?.role === "assistant") && typeof t.content === "string")
    .slice(-12)
    .map((t: HistoryTurn) => ({ role: t.role, content: t.content.slice(0, 4000) }));

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: StreamEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        for await (const event of runAgent({ apiKey, serpKey, model, history, question, signal: req.signal })) send(event);
      } catch (e) {
        if (!req.signal.aborted) send({ type: "error", message: friendly(e, apiKey, serpKey) });
      } finally {
        try { controller.close(); } catch { /* already closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
