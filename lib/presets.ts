// Static UI data: models, preset questions and tool descriptions.

export const MODELS = [
  { id: "gpt-5.4-mini", label: "GPT-5.4 mini" },
  { id: "gpt-5.4-nano", label: "GPT-5.4 nano" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];
export const DEFAULT_MODEL: ModelId = MODELS[0].id;

export const isModelId = (v: unknown): v is ModelId =>
  MODELS.some((m) => m.id === v);

export const modelLabel = (id: string) =>
  MODELS.find((m) => m.id === id)?.label ?? id;

export const PRESETS = [
  { label: "Live scores right now", dot: "bg-emerald-400", question: "What cricket matches are live right now, and what are the scores?" },
  { label: "India vs Australia form", dot: "bg-orange-300", question: "Compare the recent form of India and Australia in their last few matches." },
  { label: "England's last matches", dot: "bg-sky-400", question: "How has England played in their recent matches? Show their scores." },
];

export const TOOL_INFO = [
  { name: "find_matches", icon: "list", text: "Live, recent and upcoming matches for a search." },
  { name: "get_match_score", icon: "score", text: "The current score and status of one match." },
  { name: "get_team_form", icon: "chart", text: "A team's recent results and scores." },
] as const;
