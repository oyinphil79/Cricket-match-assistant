"use client";
import { useState } from "react";
import { Braces, Check, ChevronDown, CircleAlert, LoaderCircle, Wrench } from "lucide-react";
import type { ToolCall } from "@/lib/types";
import ToolResult from "./ToolResult";

export default function ToolCallCard({ call }: { call: ToolCall }) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState(false);
  const pending = call.ms == null;
  const argText = Object.entries(call.args).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ");

  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50/70">
        <Wrench className="size-3.5 shrink-0 text-neutral-400" strokeWidth={1.75} />
        <span className="font-mono text-xs font-medium">{call.name}</span>
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-neutral-400">{argText}</span>
        {pending ? <LoaderCircle className="size-3.5 animate-spin text-neutral-400" />
          : call.error ? <CircleAlert className="size-3.5 text-rose-500" />
          : <Check className="size-3.5 text-emerald-600" />}
        {!pending && <span className="font-mono text-[11px] tabular-nums text-neutral-400">{call.ms} ms</span>}
        <ChevronDown className={`size-3.5 text-neutral-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-4 border-t border-black/5 px-4 py-4">
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-wide text-neutral-400">Arguments</div>
            <pre className="overflow-x-auto rounded-lg bg-neutral-50 p-2.5 font-mono text-[11px] text-neutral-700">{JSON.stringify(call.args, null, 2)}</pre>
          </div>
          {call.error && <p className="text-xs text-rose-600">{call.error}</p>}
          {call.result && <ToolResult result={call.result} />}
          {!pending && (
            <div>
              <button onClick={() => setRaw(!raw)} className="flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-neutral-900">
                <Braces className="size-3" /> {raw ? "Hide" : "Show"} raw JSON sent to the model
              </button>
              {raw && (
                <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-neutral-50 p-2.5 font-mono text-[11px] text-neutral-700">
                  {JSON.stringify(call.result ? { data: call.result } : { error: call.error }, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
