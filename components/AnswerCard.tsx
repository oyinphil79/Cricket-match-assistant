import { CircleAlert, Clock, Hash } from "lucide-react";
import LiftedPage from "./LiftedPage";
import type { Answer, Chunk, Page } from "@/lib/types";

type Props = { result: Answer; pages: Page[]; chunks: Chunk[]; modelLabel: string };

export default function AnswerCard({ result, pages, chunks, modelLabel }: Props) {
  const used = chunks.filter((c) => result.used.includes(c.id));
  // Show the page of the first chunk the model relied on, highlighting every used chunk on it.
  const page = result.covered && used[0] ? pages.find((p) => p.id === used[0].pageId) : undefined;
  const otherPages = [...new Set(used.filter((c) => c.pageId !== page?.id).map((c) => c.page))];

  return (
    <section className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
      {page && <LiftedPage page={page} highlights={used.filter((c) => c.pageId === page.id).map((c) => c.text)} />}
      <div className="min-w-0 flex-1 space-y-3">
        {page ? (
          <div>
            <p className="text-4xl font-semibold tracking-tight">Page {page.page}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {result.section ? <>Section <span className="font-medium text-neutral-800">{result.section}</span> · </> : null}
              {page.doc}
              {otherPages.length > 0 && <> · also p. {otherPages.join(", ")}</>}
            </p>
          </div>
        ) : (
          <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
            <CircleAlert className="size-4" strokeWidth={1.75} /> The handbook doesn&apos;t cover this
          </p>
        )}
        <p className="text-[15px] leading-relaxed text-neutral-800">{result.answer}</p>
        <p className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-neutral-400">
          <span className="flex items-center gap-1"><Clock className="size-3" strokeWidth={1.75} />{(result.ms / 1000).toFixed(1)} s</span>
          <span className="flex items-center gap-1"><Hash className="size-3" strokeWidth={1.75} />{result.tokens.toLocaleString()} tokens</span>
          <span>{modelLabel}</span>
        </p>
      </div>
    </section>
  );
}
