import { describe, expect, test } from "bun:test";
import { PortfolioAiError, readWorkersAiStream } from "./portfolio-ai";

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

  test("fails cleanly when a response has no stream", async () => {
    await expect(readWorkersAiStream(new Response(null), () => undefined)).rejects.toBeInstanceOf(PortfolioAiError);
  });
});
