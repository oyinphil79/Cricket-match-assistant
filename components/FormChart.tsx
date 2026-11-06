"use client";
import { useState } from "react";
import type { FormGame } from "@/lib/types";

const W = 560, H = 190, PAD = { l: 44, r: 12, t: 12 }, LINE_H = 120, BAR_H = 36, GAP = 14;

export default function FormChart({ games, team }: { games: FormGame[]; team: string }) {
  const data = games.filter((g) => g.runs != null).slice().reverse(); // oldest -> newest
  const [hover, setHover] = useState<number | null>(null);
  if (data.length < 2) return null;

  const vals = data.flatMap((g) => [g.runs, g.oppRuns]).filter((v): v is number => v != null);
  const hi = Math.max(...vals), lo = Math.min(...vals), pad = Math.max(10, (hi - lo) * 0.15);
  const min = Math.max(0, Math.floor((lo - pad) / 10) * 10), max = Math.ceil((hi + pad) / 10) * 10;
  const step = (W - PAD.l - PAD.r) / (data.length - 1);
  const x = (i: number) => PAD.l + i * step;
  const y = (v: number) => PAD.t + LINE_H - ((v - min) / (max - min)) * LINE_H;
  const barTop = PAD.t + LINE_H + GAP;
  const path = (key: "runs" | "oppRuns") =>
    data.map((g, i) => (g[key] == null ? null : `${x(i)},${y(g[key]!)}`)).filter(Boolean).join(" ");
  const g = data[hover ?? data.length - 1];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
        <span className="font-medium text-neutral-900">{team} {g.score}</span>
        <span className="text-neutral-500">vs {g.opponent} {g.oppScore}</span>
        {g.date && <span className="text-neutral-400">{g.date}</span>}
        {g.result && <span className="text-neutral-500">· {g.result}</span>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(min + (max - min) * f)} y2={y(min + (max - min) * f)} stroke="#eee" />
            <text x={PAD.l - 12} y={y(min + (max - min) * f) + 3} textAnchor="end" className="fill-neutral-400 text-[9px]">{Math.round(min + (max - min) * f)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const h = ((d.wickets ?? 0) / 10) * BAR_H;
          return <rect key={i} x={x(i) - 7} width={14} y={barTop + BAR_H - h} height={h} rx={2} fill={hover === i ? "#a3a3a3" : "#e5e5e5"} />;
        })}
        <text x={PAD.l - 12} y={barTop + BAR_H} textAnchor="end" className="fill-neutral-400 text-[9px]">wkts</text>
        <polyline points={path("oppRuns")} fill="none" stroke="#f6b38f" strokeWidth={1.5} strokeDasharray="4 3" />
        <polyline points={path("runs")} fill="none" stroke="#17171a" strokeWidth={1.75} />
        {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d.runs!)} r={hover === i ? 3.5 : 2.5} fill="#17171a" />)}
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={barTop + BAR_H} stroke="#d4d4d4" strokeDasharray="2 2" />}
        {data.map((_, i) => (
          <rect key={i} x={x(i) - step / 2} width={step} y={0} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      <div className="flex gap-4 text-[11px] text-neutral-500">
        <span className="flex items-center gap-1.5"><span className="h-px w-4 bg-ink" />{team} runs</span>
        <span className="flex items-center gap-1.5"><span className="h-px w-4 border-t border-dashed border-orange-300" />Opponent runs</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-neutral-200" />Wickets lost</span>
      </div>
    </div>
  );
}
