// The two answer models in the switch at the top right.
export const MODELS = [
  { id: "gpt-5-mini", label: "GPT-5 mini" },
  { id: "gpt-6.1-sol", label: "GPT-6.1 Sol · cheaper" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];
export const DEFAULT_MODEL: ModelId = "gpt-5-mini";

export const isModel = (m: unknown): m is ModelId => MODELS.some((x) => x.id === m);

// Embeddings use one fixed model so the question and the pages share a vector space.
export const EMBED_MODEL = "text-embedding-3-small";
