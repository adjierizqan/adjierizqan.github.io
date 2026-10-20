"use client";

import { useRef, useState } from "react";
import { PortfolioAiError, portfolioAskEndpoint, streamPortfolioAnswer, type PortfolioChatMessage } from "@/lib/portfolio-ai";

type State = { kind: "idle" } | { kind: "loading"; question: string; answer: string } | { kind: "done"; question: string; answer: string } | { kind: "error"; question: string; message: string };

/**
 * Ask about my work. Uses the existing Cloudflare Worker (lib/portfolio-ai.ts).
 * Renders nothing when NEXT_PUBLIC_ASK_API_URL is not set at build time, so a
 * build without the Worker never shows a control that cannot work.
 */
export function AskBox({ email }: { email: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [value, setValue] = useState("");
  const history = useRef<PortfolioChatMessage[]>([]);
  const abort = useRef<AbortController | null>(null);

  if (!portfolioAskEndpoint()) return null;

  const ask = async (question: string) => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setState({ kind: "loading", question, answer: "" });
    let answer = "";
    try {
      answer = await streamPortfolioAnswer({
        message: question,
        history: history.current,
        signal: controller.signal,
        onToken: (token) => {
          answer += token;
          setState({ kind: "loading", question, answer });
        },
      });
      history.current = [...history.current, { role: "user" as const, content: question }, { role: "assistant" as const, content: answer }].slice(-6);
      setState({ kind: "done", question, answer: answer.trim() || "No answer came back. Try asking in a different way." });
    } catch (error) {
      if (controller.signal.aborted) return;
      // Worker errors carry a safe public message; network failures do not.
      const message = error instanceof PortfolioAiError ? error.message : "The assistant couldn’t be reached.";
      setState({ kind: "error", question, message });
    }
  };

  const busy = state.kind === "loading";
  return (
    <section className="ask" aria-labelledby="ask-label">
      <h2 id="ask-label" className="sr-only">Ask about my work</h2>
      <form
        className="ask-form"
        onSubmit={(e) => {
          e.preventDefault();
          const q = value.trim();
          if (!q || busy) return;
          setValue("");
          void ask(q);
        }}
      >
        <label htmlFor="ask-input" className="sr-only">Your question</label>
        <input
          id="ask-input"
          value={value}
          maxLength={800}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask about my work"
          autoComplete="off"
        />
        <button type="submit" disabled={busy || !value.trim()}>{busy ? "Asking" : "Ask"}</button>
      </form>
      <p className="caption ask-note">Answers come from an AI model that only knows what is on this site. It can be wrong; the case studies are the source.</p>
      <div aria-live="polite">
        {state.kind !== "idle" && (
          <div className="ask-answer">
            <span className="q">{state.question}</span>
            {state.kind === "loading" && (state.answer ? state.answer : <span className="status">Thinking…</span>)}
            {state.kind === "done" && state.answer}
            {state.kind === "error" && (
              <span className="status">
                {state.message} You can still email me at <a href={`mailto:${email}`}>{email}</a>.
              </span>
            )}
          </div>
        )}
      </div>
      {state.kind === "error" && (
        <div className="ask-actions"><button type="button" onClick={() => void ask(state.question)}>Try again</button></div>
      )}
    </section>
  );
}
