// Cosine similarity, written out: how closely two vectors point the same way (-1 to 1).
export function cosine(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/** Score every chunk against the question, best first. A plain loop is the whole "vector search". */
export function rank(question: number[], vectors: { id: number; vector: number[] }[]) {
  return vectors
    .map((c) => ({ id: c.id, score: cosine(question, c.vector) }))
    .sort((x, y) => y.score - x.score);
}
