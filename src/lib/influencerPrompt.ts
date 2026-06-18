import type { InfluencerConfig } from "@/components/influencer/types";

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
  const figure =
    c.body_type === "Slim" ? "slim slender figure" :
    c.body_type === "Athletic" ? "athletic toned figure" :
    "curvy hourglass figure";

  const subject =
    (c.gender_presentation ?? "Female") === "Male" ? "man" :
    c.gender_presentation === "Non-binary" ? "androgynous person" :
    "woman";

  return [
    `Ultra-photorealistic editorial portrait photograph of a single ${subject},`,
    `${c.age} years old, ${c.ethnicity} ethnicity, ${c.skin_tone.toLowerCase()} skin tone,`,
    `${c.hair_color.toLowerCase()} ${c.hair_length.toLowerCase()} ${c.hair_style.toLowerCase()} hair,`,
    `${c.eye_color.toLowerCase()} eyes, ${figure},`,
    `height ${c.height_cm}cm, bust ${c.bust}cm, waist ${c.waist}cm, hips ${c.hips}cm,`,
    `${scene}.`,
    "Three-quarter body shot, centered composition, fashion magazine quality,",
    "natural skin texture, soft cinematic lighting, shallow depth of field, 85mm lens.",
    c.nsfw ? "Tasteful glamour fashion styling." : "Elegant chic fashionable outfit.",
  ].join(" ");
}
