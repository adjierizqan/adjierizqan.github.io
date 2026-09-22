import { describe, expect, test } from "bun:test";
import { PortfolioAiError, readWorkersAiStream, streamPortfolioAnswer } from "./portfolio-ai";

describe("portfolio AI stream client", () => {
  test("assembles split Workers AI SSE events", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"response":"Halo"}\n'));
        controller.enqueue(encoder.encode('\ndata: {"response":" Adjie"}\n\ndata: [DONE]\n\n'));
        controller.close();
      },
    });
    const tokens: string[] = [];
    const answer = await readWorkersAiStream(new Response(stream), (token) => tokens.push(token));
    expect(answer).toBe("Halo Adjie");
    expect(tokens).toEqual(["Halo", " Adjie"]);
  });

  test("assembles the OpenAI-compatible delta stream returned by Workers AI", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"reasoning":"ignored"}}]}\n\n'));
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"Adjie builds"}}]}\n'));
        controller.enqueue(encoder.encode('\ndata: {"choices":[{"delta":{"content":" operational software."}}]}\n\n'));
        controller.enqueue(encoder.encode('data: {"response":"Adjie builds operational software."}\n\ndata: [DONE]\n\n'));
        controller.close();
      },
    });
    const tokens: string[] = [];
    const answer = await readWorkersAiStream(new Response(stream), (token) => tokens.push(token));
    expect(answer).toBe("Adjie builds operational software.");
    expect(tokens).toEqual(["Adjie builds", " operational software."]);
  });

  test("fails cleanly when a response has no stream", async () => {
    await expect(readWorkersAiStream(new Response(null), () => undefined)).rejects.toBeInstanceOf(PortfolioAiError);
  });

  test("bounds conversation history to the Worker request contract", async () => {
    const originalFetch = globalThis.fetch;
    const originalEndpoint = process.env.NEXT_PUBLIC_ASK_API_URL;
    let requestBody: { history: Array<{ content: string }> } | undefined;
    process.env.NEXT_PUBLIC_ASK_API_URL = "http://localhost:8787";
    globalThis.fetch = (async (_input, init) => {
      requestBody = JSON.parse(String(init?.body));
      return new Response('data: {"response":"Okay"}\n\ndata: [DONE]\n\n');
    }) as typeof fetch;
    try {
      await streamPortfolioAnswer({
        message: "Follow up",
        history: [{ role: "assistant", content: "x".repeat(1200) }],
        signal: new AbortController().signal,
        onToken: () => undefined,
      });
      expect(requestBody?.history[0].content.length).toBe(800);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalEndpoint === undefined) delete process.env.NEXT_PUBLIC_ASK_API_URL;
      else process.env.NEXT_PUBLIC_ASK_API_URL = originalEndpoint;
    }
  });
});
