// Tool definitions sent to OpenAI, and the code that runs them.
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { googleUrl, parseMatches, parseSnippets, serpSearch, toForm } from "./serpapi";
import type { ToolResult } from "./types";

const fn = (name: string, description: string, properties: Record<string, unknown>, required: string[]): ChatCompletionTool => ({
  type: "function",
  function: { name, description, parameters: { type: "object", properties, required, additionalProperties: false } },
});

export const TOOLS: ChatCompletionTool[] = [
  fn("find_matches", "Search Google for live, recent or upcoming cricket matches. Returns a list of matches with teams, scores and status.",
    { query: { type: "string", description: "e.g. 'live cricket score', 'IPL matches today', 'Ashes'" } }, ["query"]),
  fn("get_match_score", "Get the current or final score and status of one cricket match.",
    { teams: { type: "string", description: "The two sides, e.g. 'India vs Australia'" },
      format: { type: "string", description: "Optional: 'Test', 'ODI', 'T20' or a tournament name" } }, ["teams"]),
  fn("get_team_form", "Get a cricket team's most recent results with each innings score.",
    { team: { type: "string", description: "e.g. 'England', 'Mumbai Indians'" },
      limit: { type: "integer", description: "How many recent matches (1-10, default 6)" } }, ["team"]),
];

type Args = Record<string, unknown>;
const text = (v: unknown, fallback = "") => (typeof v === "string" ? v.trim().slice(0, 120) : fallback);

export async function runTool(name: string, args: Args, serpKey: string, signal?: AbortSignal): Promise<ToolResult> {
  const fetched_at = new Date().toISOString();

  if (name === "find_matches") {
    const query = text(args.query, "live cricket score") || "live cricket score";
    const body = await serpSearch(query, serpKey, signal);
    return { kind: "matches", query, fetched_at, source_url: googleUrl(query), matches: parseMatches(body).slice(0, 8), snippets: parseSnippets(body, 3) };
  }

  if (name === "get_match_score") {
    const teams = text(args.teams);
    if (!teams) throw new Error("Missing 'teams'.");
    const query = [teams, text(args.format), "cricket score"].filter(Boolean).join(" ");
    const body = await serpSearch(query, serpKey, signal);
    return { kind: "score", query, fetched_at, source_url: googleUrl(query), match: parseMatches(body)[0] ?? null, snippets: parseSnippets(body, 3) };
  }

  if (name === "get_team_form") {
    const team = text(args.team);
    if (!team) throw new Error("Missing 'team'.");
    const limit = Math.min(10, Math.max(1, Number(args.limit) || 6));
    const query = `${team} cricket team results`;
    const body = await serpSearch(query, serpKey, signal);
    const games = toForm(parseMatches(body), team).slice(0, limit);
    return { kind: "form", team, query, fetched_at, source_url: googleUrl(query), games, snippets: games.length ? [] : parseSnippets(body, 3) };
  }

  throw new Error(`Unknown tool: ${name}`);
}
