import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  prompt: z.string().min(1),
  seed: z.number().int().optional(),
  nsfw: z.boolean().optional(),
});

/** Server function — preferred on Lovable (reliable env + no SSE edge issues). */
export const generatePreview = createServerFn({ method: "POST" })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    const { runFluxPreview } = await import("./replicate.server");
    const url = await runFluxPreview(data.prompt, {
      seed: data.seed,
      nsfw: data.nsfw,
    });
    return { url };
  });
