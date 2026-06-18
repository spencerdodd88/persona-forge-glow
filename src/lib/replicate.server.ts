/** Read Replicate token — supports common secret names on Lovable / local .env. */
export function getReplicateToken(): string {
  const token =
    process.env.REPLICATE_API_TOKEN ??
    process.env.REPLICATE_API_KEY ??
    process.env.REPLICATE_TOKEN;
  if (!token?.trim()) {
    throw new Error(
      "Missing Replicate API token. Set REPLICATE_API_TOKEN in Lovable Secrets or .env",
    );
  }
  return token.trim();
}

type ReplicatePrediction = {
  id: string;
  status: string;
  output?: string[] | null;
  error?: string | null;
};

export type FluxPreviewOptions = {
  seed?: number;
  nsfw?: boolean;
};

async function createFluxPrediction(
  prompt: string,
  opts: FluxPreviewOptions,
  signal?: AbortSignal,
): Promise<ReplicatePrediction> {
  let res: Response;
  try {
    res = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getReplicateToken()}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify({
        input: {
          prompt,
          aspect_ratio: "3:4",
          num_outputs: 1,
          num_inference_steps: 4,
          output_format: "webp",
          output_quality: 90,
          go_fast: true,
          megapixels: "1",
          disable_safety_checker: opts.nsfw === true,
          ...(opts.seed != null ? { seed: opts.seed } : {}),
        },
      }),
      signal,
    });
  } catch (err) {
    const cause = err instanceof Error ? err.cause ?? err.message : String(err);
    throw new Error(`Could not reach Replicate API: ${cause}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let detail = text;
    try {
      const json = JSON.parse(text) as { detail?: string; title?: string };
      detail = json.detail ?? json.title ?? text;
    } catch {
      /* use raw text */
    }
    if (res.status === 401) {
      throw new Error("Invalid Replicate API token. Check REPLICATE_API_TOKEN in Lovable Secrets.");
    }
    if (res.status === 402) {
      throw new Error("Replicate account needs billing credit. Add funds at replicate.com/account/billing");
    }
    throw new Error(`Replicate error ${res.status}: ${detail}`);
  }

  return res.json() as Promise<ReplicatePrediction>;
}

async function getPrediction(id: string, signal?: AbortSignal): Promise<ReplicatePrediction> {
  const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: { Authorization: `Bearer ${getReplicateToken()}` },
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Replicate poll error ${res.status}: ${text}`);
  }
  return res.json() as Promise<ReplicatePrediction>;
}

const TERMINAL = new Set(["succeeded", "failed", "canceled"]);

/** Run flux-schnell and return the hosted output image URL. */
export async function runFluxPreview(
  prompt: string,
  opts: FluxPreviewOptions = {},
  signal?: AbortSignal,
): Promise<string> {
  let prediction = await createFluxPrediction(prompt, opts, signal);

  const deadline = Date.now() + 55_000;
  while (!TERMINAL.has(prediction.status) && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 500));
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    prediction = await getPrediction(prediction.id, signal);
  }

  if (prediction.status !== "succeeded") {
    throw new Error(
      prediction.error ||
        `Prediction ended with status: ${prediction.status ?? "timeout"}`,
    );
  }

  const url = Array.isArray(prediction.output) ? prediction.output[0] : null;
  if (!url || typeof url !== "string") throw new Error("No image URL in Replicate output");
  return url;
}
