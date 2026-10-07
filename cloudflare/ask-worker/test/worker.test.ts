import { describe, expect, test } from "bun:test";
import { buildModelMessages, handleRequest, validateAskBody, MAX_MESSAGE_LENGTH, MODEL, type Env } from "../src/core";

const origin = "http://localhost:4174";

function sse(text: string) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: text })}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

function environment(answer = "Verified answer.", capture?: (input: unknown) => void): Env {
  return {
    AI: {
      async run(model, input) {
        expect(model).toBe(MODEL);
        expect(input.reasoning_effort).toBe("low");
        expect(input.chat_template_kwargs).toEqual({ enable_thinking: false });
        capture?.(input);
        return sse(answer);
      },
    },
    RATE_LIMITER: { async limit() { return { success: true }; } },
    ALLOWED_ORIGINS: "https://adjierizqan.github.io",
  };
}

function ask(body: unknown, env = environment(), requestOrigin = origin) {
  return handleRequest(new Request("https://ask.example.com/ask", {
    method: "POST",
    headers: { "content-type": "application/json", origin: requestOrigin, "cf-connecting-ip": "192.0.2.1" },
    body: JSON.stringify(body),
  }), env);
}

describe("Adjie Workspace Ask Worker", () => {
  test("streams a valid portfolio answer", async () => {
    const response = await ask({ message: "What kind of software does Adjie build?" });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(await response.text()).toContain("Verified answer.");
  });

  test("keeps an Indonesian question and same-language instruction", async () => {
    let captured: unknown;
    const response = await ask({ message: "Proyek operasional apa yang dibuat Adjie?" }, environment("Jawaban terverifikasi.", (input) => { captured = input; }));
    expect(response.status).toBe(200);
    const messages = (captured as { messages: { content: string }[] }).messages;
    expect(messages.at(-1)?.content).toBe("Proyek operasional apa yang dibuat Adjie?");
    expect(messages[0].content).toContain("same language");
  });

  test("prioritizes verified context for a selected project", () => {
    const messages = buildModelMessages({ message: "How does it work?", projectId: "suhulog", history: [] });
    expect(messages[0].content).toContain("explicitly selected SuhuLog");
    expect(messages[0].content).toContain("Corrections append a new record");
    expect(messages[0].content).toContain("276 automated tests");
  });

  test("supplies exact verified LabStock and TomatoVision facts", () => {
    const labstock = buildModelMessages({ message: "How are imports protected?", projectId: "labstock", history: [] })[0].content;
    const tomato = buildModelMessages({ message: "What were the results?", projectId: "tomato-ripeness", history: [] })[0].content;
    expect(labstock).toContain("Idempotent re-import");
    expect(labstock).toContain("Production infrastructure, hospital data, URLs, and unsanitized screenshots are withheld");
    expect(tomato).toContain("0.807 mAP@0.5");
    expect(tomato).toContain("0.824 mAP@0.5");
    expect(tomato).toContain("0.499 mAP@0.5:0.95");
  });

  test("guards unrelated and missing-context answers in the system prompt", () => {
    const messages = buildModelMessages({ message: "Explain quantum gravity.", history: [] });
    expect(messages[0].content).toContain("Do not answer unrelated general-knowledge questions");
    expect(messages[0].content).toContain("public portfolio does not identify");
    expect(messages[0].content).not.toContain("THINK IT");
  });

  test("sets concise natural response style and primary project hierarchy", () => {
    const prompt = buildModelMessages({ message: "What are Adjie’s main projects?", history: [] })[0].content;
    expect(prompt).toContain("around 40–100 words");
    expect(prompt).toContain("without a preamble or artificial heading");
    expect(prompt).toContain("LabStock, SuhuLog, TomatoVision, and BDRS");
    expect(prompt).toContain("describe only those four and stop");
    expect(prompt).toContain("at most one brief, relevant follow-up sentence");
    expect(prompt).toContain("Indonesian should be conversational and professional");
    expect(prompt).toContain("outside Adjie Workspace’s portfolio scope");
    expect(prompt).toContain("explain Adjie Workspace itself");
    expect(prompt).toContain("Never use first-person capability statements");
    expect(prompt).toContain("does not identify specific customers or clients");
    expect(prompt).toContain("without saying a system is live, deployed, in production, or internal");
    expect(prompt).toContain("Do not mention Labs or secondary work");
    expect(prompt).toContain("Preserve domain wording from the context");
    expect(prompt).toContain("familiar words and concrete verbs");
  });

  test("rejects empty, too-long, malformed, and unknown project requests", async () => {
    expect((await ask({ message: "  " })).status).toBe(400);
    expect((await ask({ message: "x".repeat(MAX_MESSAGE_LENGTH + 1) })).status).toBe(400);
    expect((await ask({ message: "Hello", projectId: "missing" })).status).toBe(400);
    expect((await ask({ message: "Hello", history: Array.from({ length: 7 }, () => ({ role: "user", content: "Earlier question" })) })).status).toBe(400);
    const malformed = await handleRequest(new Request("https://ask.example.com/ask", { method: "POST", headers: { "content-type": "application/json", origin }, body: "{" }), environment());
    expect(malformed.status).toBe(400);
  });

  test("enforces CORS and handles preflight", async () => {
    expect((await ask({ message: "Hello" }, environment(), "https://evil.example")).status).toBe(403);
    const preflight = await handleRequest(new Request("https://ask.example.com/ask", { method: "OPTIONS", headers: { origin } }), environment());
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-origin")).toBe(origin);
  });

  test("returns 429 when the native limiter rejects the request", async () => {
    const env = environment();
    env.RATE_LIMITER = { async limit() { return { success: false }; } };
    const response = await ask({ message: "Tell me about LabStock." }, env);
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
  });

  test("returns a clean endpoint failure without a stack trace", async () => {
    const env = environment();
    env.AI.run = async () => { throw new Error("secret internal failure"); };
    const response = await ask({ message: "Tell me about LabStock." }, env);
    expect(response.status).toBe(502);
    const body = await response.text();
    expect(body).toContain("temporarily unavailable");
    expect(body).not.toContain("secret internal failure");
  });
});

describe("locale", () => {
  test("locale is validated and steers the answer language", () => {
    expect(validateAskBody({ message: "hi", locale: "fr" }).ok).toBe(false);
    const id = validateAskBody({ message: "hi", locale: "id" });
    expect(id.ok && id.value.locale).toBe("id");
    if (!id.ok) return;
    expect(buildModelMessages(id.value)[0].content).toContain("selected Indonesian");
    const none = validateAskBody({ message: "hi" });
    expect(none.ok && buildModelMessages(none.value)[0].content).not.toContain("selected Indonesian");
  });
});

describe("reconciled release context", () => {
  test("public degrees and BDRS release retain their evidence boundaries", async () => {
    const { readFileSync } = await import("node:fs");
    const context = JSON.parse(readFileSync("../../data/portfolio-ai-context.json", "utf8"));
    expect(context.education[0].program).toContain("completed 2026");
    expect(context.education[1].program).toContain("completed 2023");
    const bdrs = context.projects.find((p: {id:string}) => p.id === "bdrs");
    expect(bdrs.verifiedEvidence[1].value).toContain("74 skipped · 3 incomplete");
    expect(bdrs.publicLimitations).toContain("record-empty database");
    expect(readFileSync("src/core.ts", "utf8")).not.toContain('Never use "graduated"');
    expect(readFileSync("src/core.ts", "utf8")).toContain("Do not output URLs");
  });
});
