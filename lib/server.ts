// Small helpers every API route shares: find the key, fail with a plain message.
import OpenAI from "openai";

export const NO_KEY = "Add your OpenAI API key at the top of the page.";

export class HttpError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export const fail = (message: string, status = 400) => Response.json({ error: message }, { status });

/** The visitor's key comes first; .env.local is only a fallback. Never logged or stored. */
export function getKey(req: Request): string {
  const key = req.headers.get("x-openai-key")?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new HttpError(NO_KEY, 401);
  return key;
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (body && typeof body === "object") return body;
  } catch { /* fall through */ }
  throw new HttpError("The request body must be JSON.");
}

/** Wrap a route so any thrown error becomes `{ error }` with a sensible status. */
export function route(handler: (req: Request) => Promise<unknown>) {
  return async (req: Request) => {
    try {
      return Response.json(await handler(req));
    } catch (e) {
      if (e instanceof HttpError) return fail(e.message, e.status);
      if (e instanceof OpenAI.APIConnectionError) return fail("Couldn't reach OpenAI. Check your connection and try again.", 502);
      if (e instanceof OpenAI.APIError) return fail(openAiMessage(e), e.status === 401 ? 401 : 502);
      return fail(e instanceof Error ? e.message : "Something went wrong.", 500);
    }
  };
}

// Turn OpenAI's errors into one plain sentence. The key itself is never echoed.
function openAiMessage(e: InstanceType<typeof OpenAI.APIError>): string {
  if (e.status === 401) return "OpenAI rejected that key. Check it at the top of the page.";
  if (e.status === 429) return "OpenAI says you're out of quota or going too fast. Wait a moment and try again.";
  if (e.status === 404) return "That model isn't available on your OpenAI key. Try the other model.";
  return `OpenAI error: ${e.message}`;
}
