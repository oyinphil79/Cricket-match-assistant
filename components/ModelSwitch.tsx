"use client";
import { MODELS, type ModelId } from "@/lib/models";

type Props = { value: ModelId; onChange: (m: ModelId) => void; disabled?: boolean };

export default function ModelSwitch({ value, onChange, disabled }: Props) {
  return (
    <div className="flex rounded-full border border-black/5 bg-white/70 p-0.5 shadow-sm">
      {MODELS.map((m) => (
        <button
          key={m.id} disabled={disabled} onClick={() => onChange(m.id)}
          className={`rounded-full px-3 py-1 text-xs transition disabled:cursor-not-allowed ${value === m.id ? "bg-ink text-white" : "text-neutral-500 hover:text-neutral-900"}`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
