import { createFileRoute } from "@tanstack/react-router";
import { runFluxPreview } from "@/lib/replicate.server";

type Body = {
  prompt: string;
  seed?: number;
  nsfw?: boolean;
  referenceImage?: string;
  promptStrength?: number;
};

/** JSON fallback route for direct API testing / non-server-fn clients. */
export const Route = createFileRoute("/api/generate-preview")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { prompt, seed, nsfw, referenceImage, promptStrength } = body;
        if (!prompt?.trim()) {
          return Response.json({ error: "Missing prompt" }, { status: 400 });
        }

        try {
          const url = await runFluxPreview(
            prompt,
            { seed, nsfw, referenceImage, promptStrength },
            request.signal,
          );
          return Response.json({ url });
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            return Response.json({ error: "Aborted" }, { status: 499 });
          }
          const message = err instanceof Error ? err.message : "Generation failed";
          console.error("[generate-preview]", message);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
