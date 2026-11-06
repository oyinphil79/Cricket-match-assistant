"use client";
import { useEffect, useRef, useState } from "react";
import AnswerCard from "@/components/AnswerCard";
import AskBar from "@/components/AskBar";
import ChunkList from "@/components/ChunkList";
import LiveBar from "@/components/LiveBar";
import PageWall from "@/components/PageWall";
import { ApiError, KEY_STORAGE, post } from "@/lib/client";
import { checkFiles } from "@/lib/limits";
import { DEFAULT_MODEL, MODELS, type ModelId } from "@/lib/models";
import { samplePages, SAMPLES } from "@/lib/samples";
import type { Answer, Chunk, IndexedChunk, Page, Scored, StepId, StepState, Steps } from "@/lib/types";

type Source = { kind: "sample"; id: string } | { kind: "upload"; files: File[] };

const IDLE: Steps = {
  read: { state: "wait", note: "pages → chunks" },
  embed: { state: "wait", note: "chunks → vectors" },
  search: { state: "wait", note: "cosine, top 4" },
  answer: { state: "wait", note: "cited reply" },
};
const sourceKey = (s: Source) => (s.kind === "sample" ? s.id : s.files.map((f) => `${f.name}:${f.size}`).join("|"));
const strip = ({ vector: _, ...c }: IndexedChunk): Chunk => c; // the answer step doesn't need vectors

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);
  const [source, setSource] = useState<Source>({ kind: "sample", id: SAMPLES[0].id });
  const [question, setQuestion] = useState(SAMPLES[0].question); // first preset pre-filled
  const [pages, setPages] = useState<Page[]>(() => samplePages(SAMPLES[0]));
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [ranked, setRanked] = useState<Scored[]>([]);
  const [top, setTop] = useState<number[]>([]);
  const [result, setResult] = useState<Answer | null>(null);
  const [steps, setSteps] = useState<Steps>(IDLE);
  const [reading, setReading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [keyError, setKeyError] = useState("");
  // The index (chunks + vectors) stays in the browser, so follow-up questions skip embedding.
  const indexes = useRef(new Map<string, { pages: Page[]; index: IndexedChunk[] }>());

  // The key lives in sessionStorage only: gone when the tab closes, never sent anywhere but our API.
  useEffect(() => { try { setApiKey(sessionStorage.getItem(KEY_STORAGE) ?? ""); } catch { /* storage blocked */ } }, []);
  function saveKey(k: string) {
    setApiKey(k); setKeyError("");
    try { if (k) sessionStorage.setItem(KEY_STORAGE, k); else sessionStorage.removeItem(KEY_STORAGE); } catch { /* ignore */ }
  }

  function reset(next: Source, nextPages: Page[]) {
    setSource(next); setPages(nextPages); setChunks([]); setRanked([]); setTop([]);
    setResult(null); setSteps(IDLE); setError("");
  }
  function pickPreset(id: string) {
    const s = SAMPLES.find((x) => x.id === id)!;
    const cached = indexes.current.get(id);
    reset({ kind: "sample", id }, samplePages(s));
    if (cached) setChunks(cached.index.map(strip));
    setQuestion(s.question);
  }
  function pickFiles(files: File[]) {
    const problem = checkFiles(files);
    if (problem) return setError(problem);
    reset({ kind: "upload", files }, []);
    setQuestion("");
  }

  async function run() {
    if (busy || !question.trim()) return;
    const mark = (id: StepId, state: StepState, note?: string) =>
      setSteps((s) => ({ ...s, [id]: { state, note: note ?? s[id].note } }));
    setBusy(true); setError(""); setKeyError(""); setResult(null); setRanked([]); setTop([]);
    setSteps(IDLE);
    try {
      const key = sourceKey(source);
      let cached = indexes.current.get(key);
      if (!cached) {
        // 1. Read the pages, then cut them into chunks.
        mark("read", "run", "reading pages"); setReading(true); setChunks([]);
        const body = source.kind === "sample" ? { sample: source.id } : toForm(source.files);
        const { pages } = await post<{ pages: Page[] }>("/api/read", body, apiKey);
        setPages(pages); setReading(false);
        const { chunks } = await post<{ chunks: Chunk[] }>("/api/chunk", { pages }, apiKey);
        setChunks(chunks);
        mark("read", "done", `${pages.length} pages · ${chunks.length} chunks`);
        // 2. Embed every chunk. The result is the whole index.
        mark("embed", "run", `embedding ${chunks.length} chunks`);
        const r = await post<{ index: IndexedChunk[]; tokens: number }>("/api/embed", { chunks }, apiKey);
        cached = { pages, index: r.index };
        indexes.current.set(key, cached);
        mark("embed", "done", `${r.index.length} vectors · ${r.tokens.toLocaleString()} tokens`);
      } else {
        setPages(cached.pages); setChunks(cached.index.map(strip));
        mark("read", "done", `${cached.pages.length} pages · ${cached.index.length} chunks`);
        mark("embed", "done", `${cached.index.length} vectors · kept in tab`);
      }
      const index = cached.index;

      // 3. Embed the question and score every chunk against it.
      mark("search", "run", "scoring every chunk");
      const s = await post<{ ranked: Scored[]; top: number[] }>("/api/search", { question, index }, apiKey);
      setRanked(s.ranked); setTop(s.top);
      mark("search", "done", `top ${s.top.length} of ${index.length} · best ${s.ranked[0].score.toFixed(2)}`);

      // 4. Only the top chunks go to the model.
      const label = MODELS.find((m) => m.id === model)!.label;
      mark("answer", "run", `asking ${label}`);
      const sent = s.top.map((id) => strip(index.find((c) => c.id === id)!));
      const a = await post<Answer>("/api/answer", { question, chunks: sent, model }, apiKey);
      setResult(a);
      mark("answer", "done", a.covered ? `used ${a.used.length} of ${sent.length} chunks` : "not covered");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      if (e instanceof ApiError && e.status === 401) setKeyError(msg); else setError(msg);
      // Put the step that failed back to waiting so the strip shows where it stopped.
      setSteps((s) => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, v.state === "run" ? IDLE[k as StepId] : v])) as Steps);
    } finally {
      setBusy(false); setReading(false);
    }
  }

  const sample = source.kind === "sample" ? SAMPLES.find((x) => x.id === source.id) : undefined;
  const sourceLabel = sample ? `${sample.title} (sample handbook)` : source.kind === "upload" ? source.files.map((f) => f.name).join(", ") : "";

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:py-10">
      <LiveBar apiKey={apiKey} onKey={saveKey} keyError={keyError} model={model} onModel={setModel} busy={busy} />
      <AskBar
        question={question} onQuestion={setQuestion} onAsk={run} busy={busy}
        activeSample={sample?.id ?? null} onPreset={pickPreset} sourceLabel={sourceLabel} onUpload={pickFiles}
      />
      {error && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</p>}
      {result && <AnswerCard result={result} pages={pages} chunks={chunks} modelLabel={MODELS.find((m) => m.id === model)!.label} />}
      <PageWall
        pages={pages} pending={source.kind === "upload" ? source.files.map((f) => f.name) : []} reading={reading}
        steps={steps} chunks={chunks} ranked={ranked} top={top} used={result?.used ?? []}
      />
      <ChunkList ranked={ranked} chunks={chunks} top={top} used={result?.used ?? []} />
    </main>
  );
}

function toForm(files: File[]) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return form;
}
