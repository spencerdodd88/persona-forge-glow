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

/** flux-dev follows prompts more accurately than flux-schnell. Override via env if needed. */
export function getReplicateModel(): string {
  return process.env.REPLICATE_IMAGE_MODEL?.trim() || "black-forest-labs/flux-dev";
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
  /** Previous preview URL — enables img2img for slider refinements */
  referenceImage?: string;
  /** 0–1, how strongly the prompt transforms the reference (higher = more change) */
  promptStrength?: number;
};

function buildModelInput(prompt: string, opts: FluxPreviewOptions) {
  const model = getReplicateModel();
  const isSchnell = model.includes("flux-schnell");

  const base: Record<string, unknown> = {
    prompt,
    aspect_ratio: "3:4",
    num_outputs: 1,
    output_format: "webp",
    output_quality: 90,
    disable_safety_checker: opts.nsfw === true,
    ...(opts.seed != null ? { seed: opts.seed } : {}),
  };

  if (isSchnell) {
    return {
      ...base,
      num_inference_steps: 4,
      go_fast: true,
      megapixels: "1",
    };
  }

  // flux-dev — better instruction following for body sliders & body type
  const input: Record<string, unknown> = {
    ...base,
    num_inference_steps: 28,
    guidance: 4.5,
    megapixels: "1",
  };

  if (opts.referenceImage) {
    input.image = opts.referenceImage;
    input.prompt_strength = opts.promptStrength ?? 0.72;
  }

  return input;
}

async function createFluxPrediction(
  prompt: string,
  opts: FluxPreviewOptions,
  signal?: AbortSignal,
): Promise<ReplicatePrediction> {
  const model = getReplicateModel();
  let res: Response;
  try {
    res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getReplicateToken()}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify({ input: buildModelInput(prompt, opts) }),
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

/** Run flux and return the hosted output image URL. */
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
