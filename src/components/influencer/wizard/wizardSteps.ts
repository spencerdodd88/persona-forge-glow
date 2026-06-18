import type { InfluencerConfig } from "../types";

export type WizardStepId =
  | "content_mode"
  | "name"
  | "gender"
  | "age"
  | "ethnicity"
  | "skin_tone"
  | "hair_color"
  | "hair_length"
  | "hair_style"
  | "eye_color"
  | "body_type"
  | "height"
  | "bust"
  | "waist"
  | "hips"
  | "scene"
  | "bio"
  | "review";

export type WizardStep = {
  id: WizardStepId;
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: "content_mode",
    eyebrow: "Before we start…",
    title: "Will this influencer create adult content?",
  },
  {
    id: "name",
    title: "Choose your name",
    subtitle: "This is how your influencer will appear across GenFluence.",
  },
  {
    id: "gender",
    title: "How should they present?",
    subtitle: "Shapes body proportions and styling in your preview.",
  },
  {
    id: "age",
    title: "How old are they?",
    subtitle: "Must be 18 or older.",
  },
  {
    id: "ethnicity",
    title: "What's their ethnicity?",
  },
  {
    id: "skin_tone",
    title: "Choose a skin tone",
  },
  {
    id: "hair_color",
    title: "Pick a hair colour",
  },
  {
    id: "hair_length",
    title: "How long is their hair?",
  },
  {
    id: "hair_style",
    title: "What's their hair style?",
  },
  {
    id: "eye_color",
    title: "Choose eye colour",
  },
  {
    id: "body_type",
    title: "Select a body type",
    subtitle: "Overall frame and silhouette.",
  },
  {
    id: "height",
    title: "How tall are they?",
  },
  {
    id: "bust",
    title: "Chest / bust size",
    subtitle: "Fine-tune upper-body proportions.",
  },
  {
    id: "waist",
    title: "Waist size",
  },
  {
    id: "hips",
    title: "Hip size",
  },
  {
    id: "scene",
    title: "Where's the scene?",
    subtitle: "Your preview background updates with this choice.",
  },
  {
    id: "bio",
    title: "Add a short bio",
    subtitle: "Optional — a tagline or backstory for this persona.",
  },
  {
    id: "review",
    title: "Ready to create?",
    subtitle: "Review your choices, then bring your influencer to life.",
  },
];

export const PROGRESS_STEPS = WIZARD_STEPS.filter((s) => s.id !== "review");

export type ProportionPreset = { label: string; hint: string; value: number };

export const HEIGHT_PRESETS: ProportionPreset[] = [
  { label: "Petite", hint: "158 cm", value: 158 },
  { label: "Average", hint: "170 cm", value: 170 },
  { label: "Tall", hint: "182 cm", value: 182 },
];

export const BUST_PRESETS: ProportionPreset[] = [
  { label: "Petite", hint: "Subtle", value: 78 },
  { label: "Natural", hint: "Balanced", value: 90 },
  { label: "Full", hint: "Curvy", value: 102 },
  { label: "Voluptuous", hint: "Bold", value: 115 },
];

export const WAIST_PRESETS: ProportionPreset[] = [
  { label: "Narrow", hint: "Cinched", value: 60 },
  { label: "Defined", hint: "Toned", value: 68 },
  { label: "Average", hint: "Natural", value: 75 },
  { label: "Full", hint: "Soft", value: 85 },
];

export const HIP_PRESETS: ProportionPreset[] = [
  { label: "Slim", hint: "Straight", value: 82 },
  { label: "Balanced", hint: "Gentle curve", value: 95 },
  { label: "Curvy", hint: "Full hips", value: 105 },
  { label: "Wide", hint: "Dramatic", value: 118 },
];

export const AGE_OPTIONS = [20, 24, 28, 32, 38] as const;

export function canAdvanceStep(
  stepId: WizardStepId,
  config: InfluencerConfig,
  contentModeChosen: boolean,
): boolean {
  switch (stepId) {
    case "content_mode":
      return contentModeChosen;
    case "name":
      return config.name.trim().length > 0;
    case "bio":
      return true;
    case "review":
      return config.name.trim().length > 0;
    default:
      return true;
  }
}

export function bustStepTitle(config: InfluencerConfig): string {
  const g = config.gender_presentation ?? "Female";
  if (g === "Male") return "Chest size";
  if (g === "Non-binary") return "Bust / chest size";
  return "Bust size";
}
