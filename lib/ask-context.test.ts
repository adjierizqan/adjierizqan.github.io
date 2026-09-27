import { describe, expect, test } from "bun:test";
import { contextHistory, groupTurns, type AskTurn } from "./ask-context";

const turn = (projectId: string | null, question: string): AskTurn => ({ projectId, question, answer: "A: " + question });

describe("Ask project context", () => {
  const turns = [turn("labstock", "q1"), turn("labstock", "q2"), turn("tomato-ripeness", "q3"), turn(null, "q4"), turn("labstock", "q5")];

  test("groups consecutive turns by context and keeps earlier labels", () => {
    const groups = groupTurns(turns);
    expect(groups.map((group) => group.projectId)).toEqual(["labstock", "tomato-ripeness", null, "labstock"]);
    expect(groups[0].turns.map((t) => t.question)).toEqual(["q1", "q2"]);
    expect(groups[3].turns.map((t) => t.question)).toEqual(["q5"]);
  });

  test("history for a new turn comes only from the latest run in the same context", () => {
    expect(contextHistory(turns, "labstock").map((m) => m.content)).toEqual(["q5", "A: q5"]);
    expect(contextHistory(turns.slice(0, 2), "labstock").map((m) => m.content)).toEqual(["q1", "A: q1", "q2", "A: q2"]);
    expect(contextHistory(turns, "tomato-ripeness")).toEqual([]);
    expect(contextHistory(turns.slice(0, 4), null).map((m) => m.content)).toEqual(["q4", "A: q4"]);
  });

  test("history is capped at three turns", () => {
    const many = Array.from({ length: 5 }, (_, i) => turn("bdrs", "q" + i));
    expect(contextHistory(many, "bdrs")).toHaveLength(6);
    expect(contextHistory(many, "bdrs")[0].content).toBe("q2");
  });
});
