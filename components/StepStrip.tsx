import { Check } from "lucide-react";
import type { StepId, Steps } from "@/lib/types";

const ORDER: { id: StepId; label: string }[] = [
  { id: "read", label: "Read & chunk" },
  { id: "embed", label: "Embed" },
  { id: "search", label: "Search" },
  { id: "answer", label: "Answer" },
];

// The slim strip on top of the wall: grey = waiting, black pulse = running, green tick = done.
export default function StepStrip({ steps }: { steps: Steps }) {
  return (
    <ol className="grid grid-cols-2 gap-x-4 gap-y-2 border-b border-black/5 px-4 py-3 sm:grid-cols-4">
      {ORDER.map(({ id, label }, i) => {
        const { state, note } = steps[id];
        const dot =
          state === "done" ? "bg-emerald-500 text-white"
          : state === "run" ? "animate-pulse bg-ink text-white"
          : "bg-neutral-100 text-neutral-400";
        return (
          <li key={id} className="flex min-w-0 items-center gap-2">
            <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-medium ${dot}`}>
              {state === "done" ? <Check className="size-3" strokeWidth={2.5} /> : i + 1}
            </span>
            <span className="min-w-0 leading-tight">
              <span className={`block text-xs font-medium ${state === "wait" ? "text-neutral-400" : "text-neutral-900"}`}>{label}</span>
              <span className="block truncate font-mono text-[10px] text-neutral-400">{note}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
