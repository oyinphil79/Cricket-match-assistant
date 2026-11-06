"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";

type Props = { busy: boolean; disabled?: boolean; onSend: (text: string) => void; onStop: () => void };

export default function MessageBox({ busy, disabled, onSend, onStop }: Props) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [text]);

  const send = () => {
    if (busy || disabled || !text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="card flex items-end gap-2 p-2 pl-4">
      <textarea
        ref={ref} rows={1} value={text} disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
        placeholder={disabled ? "Add your OpenAI key above to start" : "Ask about a match, a score or a team's form…"}
        className="max-h-44 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-neutral-400"
      />
      {busy ? (
        <button onClick={onStop} className="pill bg-ink text-white hover:bg-neutral-700">
          <Square className="size-3 fill-current" /> Stop
        </button>
      ) : (
        <button onClick={send} disabled={disabled || !text.trim()} className="pill bg-ink text-white hover:bg-neutral-700 disabled:opacity-30">
          <ArrowUp className="size-3.5" strokeWidth={2} /> Send
        </button>
      )}
    </div>
  );
}
