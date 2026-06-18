import { type InfluencerConfig } from "./types";
import auburn from "@/assets/european-curvy/auburn.jpg.asset.json";
import black from "@/assets/european-curvy/black.jpg.asset.json";
import blonde from "@/assets/european-curvy/blonde.jpg.asset.json";
import brown from "@/assets/european-curvy/brown.jpg.asset.json";
import pink from "@/assets/european-curvy/pink.jpg.asset.json";
import platinum from "@/assets/european-curvy/platinum.jpg.asset.json";
import red from "@/assets/european-curvy/red.jpg.asset.json";
import silver from "@/assets/european-curvy/silver.jpg.asset.json";

const HAIR_MAP: Record<string, string> = {
  Auburn: auburn.url,
  Black: black.url,
  Blonde: blonde.url,
  Brown: brown.url,
  Pink: pink.url,
  Platinum: platinum.url,
  Red: red.url,
  Silver: silver.url,
};

/** Returns a photo URL if we have a matching shoot, else null (caller falls back to SVG). */
export function resolvePhoto(config: InfluencerConfig): string | null {
  const isEuropean = config.ethnicity === "European";
  const isCurvy = config.body_type === "Curvy" || config.body_type === "Voluptuous";
  if (!isEuropean || !isCurvy) return null;
  return HAIR_MAP[config.hair_color] ?? null;
}

export function PhotoPreview({ url }: { url: string }) {
  return (
    <img
      src={url}
      alt="Influencer preview"
      className="absolute inset-0 w-full h-full object-cover object-top animate-breathe"
      draggable={false}
    />
  );
}
