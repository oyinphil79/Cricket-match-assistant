"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CircleAlert, LoaderCircle } from "lucide-react";
import type { AssistantMessage, ChatMessage } from "@/lib/types";
import ToolCallCard from "./ToolCallCard";

function Assistant({ m }: { m: AssistantMessage }) {
  return (
    <div className="space-y-3">
      {m.state === "running" && (
        <ol className="space-y-1">
          {m.steps.map((s, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-neutral-500">
              {i === m.steps.length - 1
                ? <LoaderCircle className="size-3 animate-spin" />
                : <span className="mx-1 size-1 rounded-full bg-neutral-300" />}
              {s}
            </li>
          ))}
        </ol>
      )}
      {m.calls.length > 0 && (
        <div className="space-y-2">{m.calls.map((c) => <ToolCallCard key={c.id} call={c} />)}</div>
      )}
      {m.answer && (
        <div className="prose prose-sm prose-neutral max-w-none prose-p:leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.answer}</ReactMarkdown>
        </div>
      )}
      {m.error && (
        <p className="flex items-center gap-2 text-sm text-rose-600"><CircleAlert className="size-4" />{m.error}</p>
      )}
      {m.state === "stopped" && <p className="text-xs text-neutral-400">Stopped.</p>}
    </div>
  );
}

export default function Thread({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="space-y-8 py-8">
      {messages.map((m) =>
        m.role === "user" ? (
          <div key={m.id} className="flex justify-end">
            <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-sm text-white">{m.text}</div>
          </div>
        ) : (
          <Assistant key={m.id} m={m} />
        ),
      )}
    </div>
  );
}
