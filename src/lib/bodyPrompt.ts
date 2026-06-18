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
    return pickLabel(t, [
      "flat narrow chest, lean torso",
      "slim chest, lightly defined pecs",
      "moderate chest, natural male build",
      "broad chest, athletic pec definition",
      "very broad muscular chest, thick torso",
      "extremely broad powerful chest, bodybuilder upper body",
    ]);
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

const BODY_TYPE_BLOCK: Record<BodyType, string> = {
  Slim:
    "BODY TYPE: extremely slim ectomorph frame, thin angular shoulders, flat stomach, narrow hips, minimal body fat, delicate fashion-model thin silhouette, visible collarbones, no curves",
  Athletic:
    "BODY TYPE: athletic mesomorph physique, toned visible muscle definition, firm abs, strong shoulders, fit gym-trained body, sporty compact build, defined arms and legs",
  Curvy:
    "BODY TYPE: curvy hourglass figure, dramatically wide hips, thick thighs, narrow waist, full bust, soft feminine curves, voluptuous pear-hourglass silhouette, body-positive plus-curve proportions",
};

/** Natural-language body block — models respond to this far better than raw cm. */
export function buildBodyPrompt(c: InfluencerConfig): string {
  const gender = c.gender_presentation ?? "Female";
  const chest = bustDescription(c);

  return [
    BODY_TYPE_BLOCK[c.body_type],
    `PROPORTIONS: ${heightDescription(c)}.`,
    `Chest/bust: ${chest}.`,
    `Waist: ${waistDescription(c)}.`,
    `Hips: ${hipsDescription(c)}.`,
    gender === "Male"
      ? "Male anatomy, masculine upper body proportions."
      : gender === "Non-binary"
        ? "Androgynous balanced proportions, gender-neutral silhouette."
        : "Female anatomy, feminine body proportions.",
    "The body shape and proportions described above must be clearly visible and accurate in the final image.",
  ].join(" ");
}

/** True when appearance identity should reset (fresh text-to-image). */
export function isMajorAppearanceChange(prev: InfluencerConfig | null, next: InfluencerConfig): boolean {
  if (!prev) return true;
  return (
    prev.gender_presentation !== next.gender_presentation ||
    prev.ethnicity !== next.ethnicity ||
    prev.skin_tone !== next.skin_tone ||
    prev.hair_color !== next.hair_color ||
    prev.hair_length !== next.hair_length ||
    prev.hair_style !== next.hair_style ||
    prev.eye_color !== next.eye_color ||
    prev.body_type !== next.body_type ||
    prev.age !== next.age
  );
}

export function img2imgStrength(prev: InfluencerConfig | null, next: InfluencerConfig): number {
  if (!prev || isMajorAppearanceChange(prev, next)) return 0.88;
  const delta =
    Math.abs(prev.bust - next.bust) / 50 +
    Math.abs(prev.waist - next.waist) / 35 +
    Math.abs(prev.hips - next.hips) / 45 +
    Math.abs(prev.height_cm - next.height_cm) / 40;
  return Math.min(0.92, 0.68 + delta * 0.14);
}
