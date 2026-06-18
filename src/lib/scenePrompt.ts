/** Strong, distinct scene blocks — diffusion models need explicit setting cues up front. */
const SCENE_BLOCKS: Record<string, { setting: string; avoid: string }> = {
  "Beach Day": {
    setting:
      "SETTING (CRITICAL): sunny tropical beach, white sand, turquoise ocean waves, palm trees, bright open sky, coastal beach environment fills the background",
    avoid: "NOT an indoor room, NOT a garden, NOT flowers or lawn",
  },
  "Luxury Bedroom": {
    setting:
      "SETTING (CRITICAL): upscale luxury bedroom interior, king bed with silk sheets, warm bedside lamp light, plush headboard, indoor bedroom environment clearly visible",
    avoid: "NOT outdoors, NOT a garden, NOT beach or gym",
  },
  "Gym Selfie": {
    setting:
      "SETTING (CRITICAL): modern fitness gym interior, weight racks, mirrors, rubber flooring, fluorescent gym lighting, athletic gym environment in background",
    avoid: "NOT outdoors, NOT bedroom, NOT garden or party",
  },
  "Night Out": {
    setting:
      "SETTING (CRITICAL): stylish nightclub interior, neon lights, dark moody club atmosphere, colorful bokeh from bar lights, nightlife venue background",
    avoid: "NOT daylight outdoors, NOT garden, NOT bedroom",
  },
  Yacht: {
    setting:
      "SETTING (CRITICAL): luxury yacht deck at sea, white railings, blue ocean horizon, nautical yacht environment, bright maritime daylight",
    avoid: "NOT land, NOT garden, NOT indoor bedroom",
  },
  "Coffee Shop": {
    setting:
      "SETTING (CRITICAL): cozy artisan coffee shop interior, wooden tables, espresso bar, warm window light, café environment with coffee cups visible",
    avoid: "NOT outdoors, NOT beach, NOT gym or garden",
  },
  Penthouse: {
    setting:
      "SETTING (CRITICAL): luxury penthouse apartment, floor-to-ceiling windows, city skyline at dusk, modern high-rise interior, urban skyline background",
    avoid: "NOT garden, NOT beach, NOT gym",
  },
  "Garden Party": {
    setting:
      "SETTING (CRITICAL): elegant outdoor garden party, manicured lawn, floral arrangements, soft sunlight, garden terrace with flowers and greenery",
    avoid: "NOT indoor bedroom, NOT gym, NOT nightclub",
  },
};

export function buildScenePrompt(scenePreset: string): string {
  const block = SCENE_BLOCKS[scenePreset];
  if (!block) {
    return `SETTING (CRITICAL): ${scenePreset} environment, distinctive background clearly visible and in focus.`;
  }
  return `${block.setting}. Background MUST match this exact location. ${block.avoid}.`;
}
