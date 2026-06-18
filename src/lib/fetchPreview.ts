/** Fetch AI preview via JSON API (works on Lovable edge + local dev). */
export async function fetchPreview(
  endpoint: string,
  body: {
    prompt: string;
    seed?: number;
    nsfw?: boolean;
    referenceImage?: string;
    promptStrength?: number;
  },
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Preview failed (${res.status})`);
  }
  if (!data.url) throw new Error("No image URL returned");
  return data.url;
}
