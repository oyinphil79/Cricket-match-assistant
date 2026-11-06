// Minimal SerpApi client plus parsers for Google's sports_results block.
import type { FormGame, Match, Snippet, TeamLine } from "./types";

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export async function serpSearch(q: string, key: string, signal?: AbortSignal): Promise<Json> {
  if (!key) throw new Error("No SerpApi key. Add one in the key bar, or set SERPAPI_API_KEY on the server.");
  const url = new URL("/search.json", process.env.SERPAPI_BASE_URL ?? "https://serpapi.com");
  url.search = new URLSearchParams({ engine: "google", q, hl: "en", gl: "uk", api_key: key }).toString();
  // Never let the request URL (which holds the key) end up in an error message.
  const res = await fetch(url, { signal, cache: "no-store" }).catch((e) => {
    if (signal?.aborted) throw e;
    throw new Error("Could not reach SerpApi.");
  });
  const body = (await res.json().catch(() => ({}))) as Json;
  if (!res.ok || body.error) throw new Error(`SerpApi: ${body.error ?? res.statusText}`);
  return body;
}

export const googleUrl = (q: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(q)}`;

const str = (v: unknown): string | undefined => {
  if (v == null || v === "") return undefined;
  if (typeof v === "string" || typeof v === "number") return String(v).trim();
  if (Array.isArray(v)) return v.map(str).filter(Boolean).join(" ") || undefined;
  if (typeof v === "object") return Object.values(v as Json).map(str).filter(Boolean).join(" ") || undefined;
  return undefined;
};

function teams(raw: unknown): TeamLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t: Json) => ({ name: str(t?.name) ?? "", score: str(t?.score) }))
    .filter((t) => t.name);
}

function toMatch(g: Json, title?: string): Match {
  return {
    title,
    league: str(g.league ?? g.tournament),
    status: str(g.status ?? g.stage),
    date: str(g.date),
    venue: str(g.stadium ?? g.venue),
    teams: teams(g.teams),
  };
}

export function parseMatches(body: Json): Match[] {
  const sr = body.sports_results;
  if (!sr) return [];
  const out: Match[] = [];
  if (sr.game_spotlight) out.push(toMatch(sr.game_spotlight, str(sr.title)));
  for (const g of Array.isArray(sr.games) ? sr.games : []) out.push(toMatch(g));
  return out.filter((m) => m.teams.length > 0);
}

export function parseSnippets(body: Json, n = 4): Snippet[] {
  const out: Snippet[] = [];
  const ab = body.answer_box;
  if (ab) out.push({ title: str(ab.title) ?? "Answer box", snippet: str(ab.snippet ?? ab.answer ?? ab.result), link: str(ab.link) });
  for (const r of (body.organic_results ?? []).slice(0, n)) {
    out.push({ title: str(r.title) ?? "", snippet: str(r.snippet), link: str(r.link), date: str(r.date) });
  }
  return out.slice(0, n);
}

/** "287/5 (50 ov)" -> runs 287, wickets 5. Test scores use the first innings. */
export function parseScore(s?: string): { runs?: number; wickets?: number } {
  const m = s?.match(/(\d{1,3})(?:\s*\/\s*(\d{1,2}))?/);
  if (!m) return {};
  return { runs: Number(m[1]), wickets: m[2] != null ? Number(m[2]) : 10 };
}

const same = (a: string, b: string) => {
  const x = a.toLowerCase(), y = b.toLowerCase();
  return x.includes(y) || y.includes(x);
};

export function toForm(matches: Match[], team: string): FormGame[] {
  const games: FormGame[] = [];
  for (const m of matches) {
    const us = m.teams.find((t) => same(t.name, team));
    const them = m.teams.find((t) => t !== us);
    if (!us || !them || !us.score) continue;
    const a = parseScore(us.score), b = parseScore(them.score);
    games.push({
      date: m.date, tournament: m.league, opponent: them.name,
      score: us.score, oppScore: them.score,
      runs: a.runs, wickets: a.wickets, oppRuns: b.runs, result: m.status,
    });
  }
  return games;
}
