export type BodyType = "Slim" | "Athletic" | "Curvy" | "Voluptuous";

export type InfluencerConfig = {
  name: string;
  bio: string;
  age: number;
  ethnicity: string;
  skin_tone: string;
  hair_color: string;
  hair_length: string;
  hair_style: string;
  eye_color: string;
  height_cm: number;
  bust: number;
  waist: number;
  hips: number;
  body_type: BodyType;
  nsfw: boolean;
  scene_preset: string;
};

export const ETHNICITIES = ["Asian", "Latina", "European", "African", "Mixed", "Middle Eastern"];
export const SKIN_TONES = ["Porcelain", "Light", "Olive", "Tan", "Bronze", "Deep"];
export const HAIR_COLORS = ["Black", "Brown", "Blonde", "Auburn", "Red", "Platinum", "Pink", "Silver"];
export const HAIR_LENGTHS = ["Pixie", "Short", "Medium", "Long", "Extra Long"];
export const HAIR_STYLES = ["Straight", "Wavy", "Curly", "Braided", "Ponytail", "Bun"];
export const EYE_COLORS = ["Brown", "Hazel", "Green", "Blue", "Grey", "Amber"];
export const BODY_TYPES: BodyType[] = ["Slim", "Athletic", "Curvy", "Voluptuous"];
export const SCENES = ["Beach Day", "Luxury Bedroom", "Gym Selfie", "Night Out", "Yacht", "Coffee Shop", "Penthouse", "Garden Party"];

// Color tokens for SVG
export const SKIN_HEX: Record<string, string> = {
  Porcelain: "#f5d9c4",
  Light: "#ecc6a8",
  Olive: "#d9aa80",
  Tan: "#c08a5e",
  Bronze: "#9a6644",
  Deep: "#6a3f2a",
};

export const HAIR_HEX: Record<string, string> = {
  Black: "#1a1110",
  Brown: "#4a2a1a",
  Blonde: "#e6c178",
  Auburn: "#8a3a1a",
  Red: "#b03020",
  Platinum: "#ebe4d0",
  Pink: "#e89bb6",
  Silver: "#c9c9d1",
};

export const EYE_HEX: Record<string, string> = {
  Brown: "#5a3320",
  Hazel: "#8a6a3a",
  Green: "#4a7a4a",
  Blue: "#5a8aba",
  Grey: "#8a8a96",
  Amber: "#c08a3a",
};

export const SCENE_BG: Record<string, string[]> = {
  "Beach Day": ["#f7d9a5", "#e8a87c", "#7fb3d5"],
  "Luxury Bedroom": ["#3a2030", "#5a2840", "#8a3a5a"],
  "Gym Selfie": ["#1a1a22", "#2a2a36", "#3a3a4a"],
  "Night Out": ["#1a0a2a", "#4a1a6a", "#a83aa0"],
  "Yacht": ["#a8d0e6", "#5a8aba", "#1a3a5a"],
  "Coffee Shop": ["#3a261a", "#6a4a30", "#a87a4a"],
  "Penthouse": ["#1a1a2a", "#3a2a4a", "#8a6a3a"],
  "Garden Party": ["#d6e8b5", "#9ab97a", "#f5b5d0"],
};

export const DEFAULT_CONFIG: InfluencerConfig = {
  name: "Aria",
  bio: "",
  age: 24,
  ethnicity: "European",
  skin_tone: "Light",
  hair_color: "Brown",
  hair_length: "Long",
  hair_style: "Wavy",
  eye_color: "Brown",
  height_cm: 170,
  bust: 90,
  waist: 65,
  hips: 95,
  body_type: "Athletic",
  nsfw: false,
  scene_preset: "Coffee Shop",
};
