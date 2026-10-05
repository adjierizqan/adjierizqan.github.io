"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { contextHistory, type AskTurn } from "@/lib/ask-context";
import { MAX_CHAT_MESSAGE_LENGTH, PortfolioAiError, streamPortfolioAnswer } from "@/lib/portfolio-ai";
import { projectPath } from "@/lib/projects";

export type AskSuggestion = { question: string; projectId: string; projectTitle: string };

type Turn = AskTurn & { status: "streaming" | "done" | "error" };

/**
 * Ask the portfolio. A real conversation, and only that.
 *
 * The workspace used to open with a question the visitor never asked, typed
 * out character by character and "streamed" on a timer. Nothing here moves
 * until the visitor asks; tokens appear only as they arrive from the worker.
 *
 * A suggested question is scoped to its project, so the worker answers from
 * that project's record, and the answer ends with a link to its case study.
 * That link is built from the canonical slug, never from model output, so the
 * assistant cannot send a visitor to a URL that does not exist.
 */
export function AskPanel({ suggestions }: { suggestions: AskSuggestion[] }) {
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const busy = turns.at(-1)?.status === "streaming";

  useEffect(() => () => abortRef.current?.abort(), []);

  async function ask(question: string, projectId: string | null) {
    const q = question.trim();
    if (!q || busy) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const history = contextHistory(turns.filter((t) => t.status === "done"), projectId);
    setTurns((prev) => [...prev, { projectId, question: q, answer: "", status: "streaming" }]);
    setDraft("");

    const update = (patch: Partial<Turn>) =>
      setTurns((prev) => prev.map((t, i) => (i === prev.length - 1 ? { ...t, ...patch } : t)));

    try {
      let answer = "";
      await streamPortfolioAnswer({
        message: q,
        projectId: projectId ?? undefined,
        locale: "en",
        history,
        signal: controller.signal,
        onToken: (token) => { answer += token; update({ answer }); },
      });
      update({ status: "done", answer: answer.trim() || "No answer came back. The projects below cover the same ground." });
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = error instanceof PortfolioAiError
        ? error.message
        : "The assistant is not reachable right now.";
      update({ status: "error", answer: `${message} Everything it knows is in the projects below.` });
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void ask(draft, null);
  };

  const titleFor = (projectId: string | null) =>
    suggestions.find((s) => s.projectId === projectId)?.projectTitle;

  return (
    <section className="ask" aria-labelledby="ask-heading">
      <h2 id="ask-heading" className="ask-heading">What would you like to know about Adjie?</h2>

      {turns.length > 0 && (
        <ol className="ask-thread" aria-label="Conversation">
          {turns.map((turn, index) => {
            const title = titleFor(turn.projectId);
            return (
              <li key={index} className="ask-turn">
                <p className="ask-question">{turn.question}</p>
                <p className="ask-answer" data-status={turn.status}
                   aria-live={index === turns.length - 1 ? "polite" : undefined}
                   aria-busy={turn.status === "streaming"}>
                  {turn.answer || (turn.status === "streaming" ? "Thinking…" : "")}
                </p>
                {turn.status === "done" && turn.projectId && title && (
                  <Link className="ask-evidence" href={projectPath(turn.projectId)}>
                    Read the {title} case study <span aria-hidden="true">→</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <form className="ask-form" onSubmit={onSubmit}>
        <label htmlFor="ask-input" className="sr-only">Your question</label>
        <textarea
          id="ask-input"
          className="ask-input"
          rows={2}
          maxLength={MAX_CHAT_MESSAGE_LENGTH}
          placeholder="Ask about a project, a technical decision, or how Adjie works"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void ask(draft, null); }
          }}
        />
        <button type="submit" className="ask-send" disabled={busy || !draft.trim()}>
          {busy ? "Answering…" : "Ask"}
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="ask-suggestions">
          <p className="ask-suggestions-label" id="ask-try">Try asking</p>
          <ul aria-labelledby="ask-try">
            {suggestions.map((s) => (
              <li key={s.projectId}>
                <button type="button" disabled={busy} onClick={() => void ask(s.question, s.projectId)}>
                  {s.question}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="ask-note">
        Answers are written by an AI model from this portfolio&rsquo;s project records. The projects below are the source.
      </p>
    </section>
  );
}
