// Reads a newline-delimited JSON response body and calls onEvent for each line.
import type { StreamEvent } from "./types";

export async function readEvents(res: Response, onEvent: (e: StreamEvent) => void) {
  if (!res.body) throw new Error("No response body.");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  const flush = (line: string) => {
    if (!line.trim()) return;
    try { onEvent(JSON.parse(line) as StreamEvent); } catch { /* skip a bad line */ }
  };
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    lines.forEach(flush);
  }
  flush(buf + decoder.decode());
}
