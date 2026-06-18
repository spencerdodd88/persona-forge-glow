import type { BodyType, InfluencerConfig } from "@/components/influencer/types";

function clamp01(v: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (v - min) / (max - min)));
}

function pickLabel(t: number, labels: string[]): string {
  const idx = Math.min(labels.length - 1, Math.floor(t * labels.length));
  return labels[idx];
}

function bustDescription(c: InfluencerConfig): string {
  const t = clamp01(c.bust, 70, 120);
  const gender = c.gender_presentation ?? "Female";

  if (gender === "Male") {
    if (t < 0.12) return "REQUIRED: very flat narrow chest, no pec definition, lean flat torso";
    if (t > 0.88) return "REQUIRED: extremely broad muscular chest, massive pecs, bodybuilder torso";
    return pickLabel(t, [
      "flat narrow chest, lean torso",
      "slim chest, lightly defined pecs",
      "moderate chest, natural male build",
      "broad chest, athletic pec definition",
      "very broad muscular chest, thick torso",
      "extremely broad powerful chest, bodybuilder upper body",
    ]);
  }

  // Extremes use imperative language — diffusion models respond to strong directives
  if (t < 0.12) {
    return "REQUIRED: completely flat chest, AA cup, no bust volume, no cleavage, flat chested, androgynous flat torso";
  }
  if (t > 0.88) {
    return "REQUIRED: extremely massive bust, huge breasts dominate the frame, very large heavy bust, prominent deep cleavage";
  }

  return pickLabel(t, [
    "very flat petite chest, minimal bust, small cup silhouette",
    "small modest bust, subtle chest, petite upper body",
    "medium natural bust, balanced proportions",
    "full noticeable bust, visible cleavage, fuller chest",
    "large voluptuous bust, prominent chest, heavy bust focal point",
    "extremely large bust, very voluptuous chest dominates the silhouette",
  ]);
}

function waistDescription(c: InfluencerConfig): string {
  const t = clamp01(c.waist, 55, 90);
  if (t < 0.12) return "REQUIRED: extremely narrow wasp waist, tiny cinched midsection";
  if (t > 0.88) return "REQUIRED: wide thick waist, no waist taper, straight blocky midsection";
  return pickLabel(t, [
    "extremely narrow cinched waist, tiny midsection",
    "very slim waist, defined hourglass taper",
    "slim waist, toned midsection",
    "average waist width, natural midsection",
    "thicker waist, soft midsection, less taper",
    "wide waist, straight midsection, minimal waist definition",
  ]);
}

function hipsDescription(c: InfluencerConfig): string {
  const t = clamp01(c.hips, 75, 120);
  if (t < 0.12) return "REQUIRED: very narrow straight hips, boyish hip line, no hip curve";
  if (t > 0.88) return "REQUIRED: extremely wide hips, massive lower body, very thick thighs";
  return pickLabel(t, [
    "very narrow hips, straight hip line, minimal curve",
    "slim hips, narrow lower body",
    "moderate hips, gentle curve",
    "full hips, rounded lower body",
    "wide full hips, thick thighs, pronounced lower curve",
    "extremely wide hips, very thick thighs, dramatic lower-body curve",
  ]);
}

function heightDescription(c: InfluencerConfig): string {
  const t = clamp01(c.height_cm, 150, 190);
  return pickLabel(t, [
    "petite short stature, compact proportions",
    "below-average height, petite frame",
    "average height, balanced proportions",
    "tall stature, long legs, model height",
    "very tall stature, elongated legs, runway model height",
  ]);
}

/** Frame/silhouette only — bust/waist/hips come from sliders (no conflicting "full bust" here). */
const BODY_TYPE_BLOCK: Record<BodyType, string> = {
  Slim:
    "Overall frame: extremely slim ectomorph, thin shoulders, flat stomach, minimal body fat, fashion-model thin silhouette, visible collarbones",
  Athletic:
    "Overall frame: athletic mesomorph, toned muscle definition, firm abs, strong shoulders, fit gym-trained body",
  Curvy:
    "Overall frame: curvy hourglass silhouette, wide hip-to-waist ratio, thick thighs, soft feminine curves, voluptuous lower body",
};

/** Natural-language body block — sliders are authoritative for measurements. */
export function buildBodyPrompt(c: InfluencerConfig): string {
  const gender = c.gender_presentation ?? "Female";

  return [
    `CRITICAL — chest/bust: ${bustDescription(c)}`,
    `CRITICAL — waist: ${waistDescription(c)}`,
    `CRITICAL — hips: ${hipsDescription(c)}`,
    BODY_TYPE_BLOCK[c.body_type],
    `Height: ${heightDescription(c)}.`,
    gender === "Male"
      ? "Male anatomy, masculine proportions."
      : gender === "Non-binary"
        ? "Androgynous proportions."
        : "Female anatomy.",
    "These exact body proportions MUST be clearly visible. Do NOT use a generic default body.",
  ].join(" ");
}

/** Body/proportion changes always need fresh text-to-image — img2img locks the old body shape. */
export function hasProportionChange(prev: InfluencerConfig | null, next: InfluencerConfig): boolean {
  if (!prev) return true;
  return (
    prev.bust !== next.bust ||
    prev.waist !== next.waist ||
    prev.hips !== next.hips ||
    prev.height_cm !== next.height_cm ||
    prev.body_type !== next.body_type
  );
}

export function isMajorAppearanceChange(prev: InfluencerConfig | null, next: InfluencerConfig): boolean {
  if (!prev) return true;
  return (
    hasProportionChange(prev, next) ||
    prev.gender_presentation !== next.gender_presentation ||
    prev.ethnicity !== next.ethnicity ||
    prev.skin_tone !== next.skin_tone ||
    prev.hair_color !== next.hair_color ||
    prev.hair_length !== next.hair_length ||
    prev.hair_style !== next.hair_style ||
    prev.eye_color !== next.eye_color ||
    prev.age !== next.age
  );
}
