import type { PortfolioChatMessage } from "@/lib/portfolio-ai";

// One continuous Ask conversation in which every turn keeps the project context it was asked in.
// projectId null means General (the whole portfolio).
export type AskTurn = { projectId: string | null; question: string; answer: string };
export type AskGroup<T extends { projectId: string | null }> = { projectId: string | null; turns: T[] };

// Consecutive turns with the same context form one group; a new group starts where the context changes.
export function groupTurns<T extends { projectId: string | null }>(turns: T[]): AskGroup<T>[] {
  const groups: AskGroup<T>[] = [];
  for (const turn of turns) {
    const last = groups[groups.length - 1];
    if (last && last.projectId === turn.projectId) last.turns.push(turn);
    else groups.push({ projectId: turn.projectId, turns: [turn] });
  }
  return groups;
}

// History for a new turn: only the latest run of turns in the same context, so answers about one project
// are not carried into questions about another. At most maxTurns turns (two messages each).
export function contextHistory(turns: AskTurn[], projectId: string | null, maxTurns = 3): PortfolioChatMessage[] {
  const run: AskTurn[] = [];
  for (let index = turns.length - 1; index >= 0 && turns[index].projectId === projectId; index -= 1) run.unshift(turns[index]);
  return run.slice(-maxTurns).flatMap((turn) => [
    { role: "user" as const, content: turn.question },
    { role: "assistant" as const, content: turn.answer },
  ]);
}
