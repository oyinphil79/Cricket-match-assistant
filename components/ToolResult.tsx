"use client";
import { ExternalLink } from "lucide-react";
import type { Match, Snippet, ToolResult as Result } from "@/lib/types";
import FormChart from "./FormChart";

function Scorecard({ m }: { m: Match }) {
  return (
    <div className="rounded-xl border border-black/5 bg-neutral-50/60 p-4">
      <div className="mb-3 flex flex-wrap gap-x-2 text-[11px] uppercase tracking-wide text-neutral-400">
        {[m.league, m.venue, m.date].filter(Boolean).join(" · ")}
      </div>
      <div className="space-y-1.5">
        {m.teams.map((t) => (
          <div key={t.name} className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-neutral-700">{t.name}</span>
            <span className="font-mono text-lg font-medium tabular-nums">{t.score ?? "—"}</span>
          </div>
        ))}
      </div>
      {m.status && <div className="mt-3 text-xs text-emerald-700">{m.status}</div>}
    </div>
  );
}

function MatchRow({ m }: { m: Match }) {
  return (
    <li className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <div className="truncate text-sm">{m.teams.map((t) => t.name).join(" v ")}</div>
        <div className="truncate text-[11px] text-neutral-400">{[m.league, m.date, m.status].filter(Boolean).join(" · ")}</div>
      </div>
      <div className="shrink-0 text-right font-mono text-xs tabular-nums text-neutral-700">
        {m.teams.map((t) => <div key={t.name}>{t.score ?? "—"}</div>)}
      </div>
    </li>
  );
}

function Snippets({ items }: { items: Snippet[] }) {
  if (!items.length) return <p className="text-xs text-neutral-400">No structured match data in this search.</p>;
  return (
    <ul className="space-y-2">
      {items.map((s, i) => (
        <li key={i} className="text-xs">
          <div className="font-medium text-neutral-700">{s.title}</div>
          {s.snippet && <div className="text-neutral-500">{s.snippet}</div>}
        </li>
      ))}
    </ul>
  );
}

export default function ToolResult({ result: r }: { result: Result }) {
  return (
    <div className="space-y-3">
      {r.kind === "score" && (r.match ? <Scorecard m={r.match} /> : <Snippets items={r.snippets} />)}
      {r.kind === "matches" && (r.matches.length
        ? <ul className="divide-y divide-black/5">{r.matches.map((m, i) => <MatchRow key={i} m={m} />)}</ul>
        : <Snippets items={r.snippets} />)}
      {r.kind === "form" && (r.games.length ? (
        <>
          <FormChart games={r.games} team={r.team} />
          <ul className="divide-y divide-black/5">
            {r.games.map((g, i) => (
              <MatchRow key={i} m={{ league: g.tournament, date: g.date, status: g.result, teams: [{ name: r.team, score: g.score }, { name: g.opponent, score: g.oppScore }] }} />
            ))}
          </ul>
        </>
      ) : <Snippets items={r.snippets} />)}
      <div className="flex items-center justify-between text-[11px] text-neutral-400">
        <span>Fetched {new Date(r.fetched_at).toLocaleString()} · may be delayed</span>
        <a href={r.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-neutral-700">
          Google <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  );
}
