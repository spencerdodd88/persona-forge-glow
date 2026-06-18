import { createParser } from "eventsource-parser";
import { flushSync } from "react-dom";

export type ImageStreamEvent =
  | { type: "image_generation.partial_image"; b64_json: string; partial_image_index: number; created_at: number }
  | { type: "image_generation.completed"; b64_json?: string; url?: string; created_at: number };

export async function streamImage(
  endpoint: string,
  body: unknown,
  onFrame: (imageSrc: string, isFinal: boolean) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(`Image stream failed: ${res.status} ${await res.text().catch(() => "")}`);
  }

  let sawCompleted = false;
  let errorMessage: string | null = null;

  const parser = createParser({
    onEvent(event) {
      if (event.event === "error") {
        try {
          const payload = JSON.parse(event.data) as { message?: string };
          errorMessage = payload.message ?? "Generation failed";
        } catch {
          errorMessage = "Generation failed";
        }
        return;
      }

      if (
        event.event !== "image_generation.partial_image" &&
        event.event !== "image_generation.completed"
      ) {
        return;
      }

      let payload: ImageStreamEvent;
      try {
        payload = JSON.parse(event.data) as ImageStreamEvent;
      } catch {
        return;
      }

      const isFinal = event.event === "image_generation.completed";
      const imageSrc =
        "url" in payload && payload.url
          ? payload.url
          : payload.b64_json
            ? `data:image/png;base64,${payload.b64_json}`
            : null;
      if (!imageSrc) return;

      flushSync(() => {
        onFrame(imageSrc, isFinal);
      });
      if (isFinal) sawCompleted = true;
    },
  });

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      parser.feed(value);
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  if (errorMessage) throw new Error(errorMessage);
  if (!sawCompleted) throw new Error("Image stream ended without completion");
}
