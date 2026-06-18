import type { InfluencerConfig } from "@/components/influencer/types";
import { buildBodyPrompt } from "./bodyPrompt";
import { buildScenePrompt } from "./scenePrompt";

export function buildInfluencerPrompt(c: InfluencerConfig): string {
  const sceneBlock = buildScenePrompt(c.scene_preset);

  const subject =
    (c.gender_presentation ?? "Female") === "Male" ? "man" :
    c.gender_presentation === "Non-binary" ? "androgynous person" :
    "woman";

  const bodyBlock = buildBodyPrompt(c);

  // Scene first — setting must dominate before body details or models default to generic outdoor/garden
  return [
    sceneBlock,
    `Environmental portrait in ${c.scene_preset} — background location must be unmistakable.`,
    bodyBlock,
    `Ultra-photorealistic editorial three-quarter body portrait photograph of one ${subject}, age ${c.age},`,
    `${c.ethnicity} heritage, ${c.skin_tone.toLowerCase()} skin,`,
    `${c.hair_color.toLowerCase()} ${c.hair_length.toLowerCase()} ${c.hair_style.toLowerCase()} hair,`,
    `${c.eye_color.toLowerCase()} eyes.`,
    "Single subject centered in frame, full torso visible, fashion magazine quality,",
    "natural skin texture, soft cinematic lighting, background environment in sharp focus, wide environmental shot.",
    c.nsfw ? "Tasteful glamour fashion styling." : "Elegant chic fashionable outfit matching the scene.",
    sceneBlock,
    "Accurate body proportions as specified above — do not use a generic default body shape.",
  ].join(" ");
}
