// Shared shapes for tool results, stream events and chat messages.

export type TeamLine = { name: string; score?: string };

export type Match = {
  title?: string;
  league?: string;
  status?: string;
  date?: string;
  venue?: string;
  teams: TeamLine[];
};

export type Snippet = { title: string; snippet?: string; link?: string; date?: string };

export type FormGame = {
  date?: string;
  tournament?: string;
  opponent: string;
  score?: string;
  oppScore?: string;
  runs?: number;
  wickets?: number;
  oppRuns?: number;
  result?: string;
};

type Base = { query: string; fetched_at: string; source_url: string; snippets: Snippet[] };

export type ToolResult =
  | (Base & { kind: "matches"; matches: Match[] })
  | (Base & { kind: "score"; match: Match | null })
  | (Base & { kind: "form"; team: string; games: FormGame[] });

export type StreamEvent =
  | { type: "status"; text: string }
  | { type: "tool_start"; id: string; name: string; args: Record<string, unknown> }
  | { type: "tool_end"; id: string; ms: number; result?: ToolResult; error?: string }
  | { type: "answer"; text: string }
  | { type: "error"; message: string }
  | { type: "done"; toolCalls: number; rounds: number };

export type ToolCall = {
  id: string;
  name: string;
  args: Record<string, unknown>;
  ms?: number;
  result?: ToolResult;
  error?: string;
};

export type UserMessage = { id: string; role: "user"; text: string };
export type AssistantMessage = {
  id: string;
  role: "assistant";
  state: "running" | "done" | "stopped" | "error";
  steps: string[];
  calls: ToolCall[];
  answer?: string;
  error?: string;
};
export type ChatMessage = UserMessage | AssistantMessage;

export type HistoryTurn = { role: "user" | "assistant"; content: string };
