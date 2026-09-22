export type PortfolioChatMessage = { role: "user" | "assistant"; content: string };

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

function tokenFromEvent(payload: string) {
  if (!payload || payload === "[DONE]") return "";
  try {
    const parsed = JSON.parse(payload) as { response?: unknown };
    return typeof parsed.response === "string" ? parsed.response : "";
  } catch {
    return "";
  }
}

export async function readWorkersAiStream(response: Response, onToken: (token: string) => void) {
  if (!response.body) throw new PortfolioAiError("The response stream is unavailable.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      for (const line of event.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const token = tokenFromEvent(line.slice(5).trim());
        if (token) {
          answer += token;
          onToken(token);
        }
      }
    }
    if (done) break;
  }

  if (buffer.trim()) {
    for (const line of buffer.split("\n")) {
      if (!line.startsWith("data:")) continue;
      const token = tokenFromEvent(line.slice(5).trim());
      if (token) {
        answer += token;
        onToken(token);
      }
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
    body: JSON.stringify({ message: input.message, projectId: input.projectId, history: input.history.slice(-6) }),
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
