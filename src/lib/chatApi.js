// Client for the backend's OpenAI-compatible chat endpoint
// (POST /api/v1/chat/completions, SSE streaming).
//
// Same-origin by default: the Vite dev server proxies /api/v1 to the backend
// (see vite.config.js), and in production the ingress routes /api/* to the
// backend. Override with VITE_CHAT_API_URL if the API lives elsewhere.

const CHAT_API_BASE = import.meta.env.VITE_CHAT_API_URL || '/api/v1';

/**
 * Stream a chat completion.
 *
 * @param {Array<{role: 'user'|'assistant'|'system', content: string}>} messages
 *   Full conversation history, OpenAI-style.
 * @param {object} opts
 * @param {(delta: string) => void} [opts.onDelta] - called per streamed text chunk
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<string>} the full assistant reply
 */
export async function streamChat(messages, { onDelta, signal } = {}) {
  const res = await fetch(`${CHAT_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: true }),
    signal,
  });

  if (!res.ok) {
    let message = `Chat request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error?.message) message = body.error.message;
    } catch { /* non-JSON error body */ }
    throw new Error(message);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by blank lines; keep the tail in the buffer.
    const events = buffer.split('\n\n');
    buffer = events.pop();

    for (const event of events) {
      for (const line of event.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const delta = JSON.parse(data).choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onDelta?.(delta);
          }
        } catch { /* ignore malformed chunk */ }
      }
    }
  }

  return fullText;
}
