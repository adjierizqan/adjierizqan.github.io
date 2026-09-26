export type PortfolioChatMessage = { role: "user" | "assistant"; content: string };
const MAX_CHAT_MESSAGE_LENGTH = 800;

export class PortfolioAiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PortfolioAiError";
    this.status = status;
  }
}

export function portfolioAskEndpoint() {
  const base = process.env.NEXT_PUBLIC_ASK_API_URL?.trim();
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/ask`;
}

type WorkersAiEvent = {
  response?: unknown;
  choices?: Array<{ delta?: { content?: unknown } }>;
};

function contentFromEvent(payload: string) {
  if (!payload || payload === "[DONE]") return null;
  try {
    const parsed = JSON.parse(payload) as WorkersAiEvent;
    const delta = parsed.choices?.[0]?.delta?.content;
    if (typeof delta === "string") return { kind: "delta" as const, content: delta };
    if (typeof parsed.response === "string") return { kind: "response" as const, content: parsed.response };
    return null;
  } catch {
    return null;
  }
}

export async function readWorkersAiStream(response: Response, onToken: (token: string) => void) {
  if (!response.body) throw new PortfolioAiError("The response stream is unavailable.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";
  let sawDelta = false;

  const consumeLine = (line: string) => {
    if (!line.startsWith("data:")) return;
    const event = contentFromEvent(line.slice(5).trim());
    if (!event?.content) return;
    if (event.kind === "delta") sawDelta = true;
    if (event.kind === "response" && sawDelta) return;
    answer += event.content;
    onToken(event.content);
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      for (const line of event.split("\n")) {
        consumeLine(line);
      }
    }
    if (done) break;
  }

  if (buffer.trim()) {
    for (const line of buffer.split("\n")) {
      consumeLine(line);
    }
  }
  return answer;
}

export async function streamPortfolioAnswer(input: {
  message: string;
  projectId?: string;
  history: PortfolioChatMessage[];
  signal: AbortSignal;
  onToken: (token: string) => void;
}) {
  const endpoint = portfolioAskEndpoint();
  if (!endpoint) throw new PortfolioAiError("Adjie AI endpoint is not configured.");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message: input.message,
      projectId: input.projectId,
      history: input.history.slice(-6).map((message) => ({
        ...message,
        content: message.content.slice(0, MAX_CHAT_MESSAGE_LENGTH),
      })),
    }),
    signal: input.signal,
  });
  if (!response.ok) {
    let message = "Adjie AI is temporarily unavailable.";
    try {
      const body = await response.json() as { error?: unknown };
      if (typeof body.error === "string") message = body.error;
    } catch {
      // Keep the safe public fallback message.
    }
    throw new PortfolioAiError(message, response.status);
  }
  return readWorkersAiStream(response, input.onToken);
}
