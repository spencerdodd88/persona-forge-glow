import type { InfluencerConfig } from "@/components/influencer/types";
import { buildBodyPrompt } from "./bodyPrompt";

export function buildInfluencerPrompt(c: InfluencerConfig): string {
  const sceneMap: Record<string, string> = {
    "Beach Day": "on a sunny tropical beach, golden hour lighting",
    "Luxury Bedroom": "in a luxurious bedroom with soft warm lighting",
    "Gym Selfie": "in a modern gym, athletic atmosphere",
    "Night Out": "at a stylish nightclub with neon bokeh",
    "Yacht": "on a luxury yacht at sea, bright daylight",
    "Coffee Shop": "in a cozy artisan coffee shop, warm window light",
    "Penthouse": "in a luxury penthouse with city skyline view at dusk",
    "Garden Party": "at an elegant garden party with soft sunlight and florals",
  };
  const scene = sceneMap[c.scene_preset] ?? c.scene_preset;

  const subject =
    (c.gender_presentation ?? "Female") === "Male" ? "man" :
    c.gender_presentation === "Non-binary" ? "androgynous person" :
    "woman";

  const bodyBlock = buildBodyPrompt(c);

  // Body instructions first — diffusion models weight early tokens heavily
  return [
    bodyBlock,
    `Ultra-photorealistic editorial three-quarter body portrait photograph of one ${subject}, age ${c.age},`,
    `${c.ethnicity} heritage, ${c.skin_tone.toLowerCase()} skin,`,
    `${c.hair_color.toLowerCase()} ${c.hair_length.toLowerCase()} ${c.hair_style.toLowerCase()} hair,`,
    `${c.eye_color.toLowerCase()} eyes,`,
    `${scene}.`,
    "Single subject centered in frame, full torso visible, fashion magazine quality,",
    "natural skin texture, soft cinematic lighting, shallow depth of field, 85mm lens.",
    c.nsfw ? "Tasteful glamour fashion styling." : "Elegant chic fashionable outfit.",
    "Accurate body proportions as specified above — do not use a generic default body shape.",
  ].join(" ");
}
