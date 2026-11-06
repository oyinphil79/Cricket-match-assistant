// Shapes shared by the browser and the API routes.

/** One page of one handbook. `id` is unique across all uploaded PDFs. */
export type Page = { id: number; doc: string; page: number; text: string };

/** A slice of one page. It never crosses a page, so it always knows its page. */
export type Chunk = { id: number; pageId: number; doc: string; page: number; text: string };

/** A chunk plus its embedding. A list of these is the whole search index. */
export type IndexedChunk = Chunk & { vector: number[] };

export type Scored = { id: number; score: number };

export type Answer = {
  answer: string;
  covered: boolean; // false when the handbook does not actually answer the question
  section: string; // the policy section it cites, e.g. "3.2 Carry-over"
  used: number[]; // chunk ids (not the 1–4 numbers the model saw)
  tokens: number;
  ms: number;
};

export type StepId = "read" | "embed" | "search" | "answer";
export type StepState = "wait" | "run" | "done";
export type Steps = Record<StepId, { state: StepState; note: string }>;
