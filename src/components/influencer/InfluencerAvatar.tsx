import { type InfluencerConfig, SKIN_HEX, HAIR_HEX, EYE_HEX, SCENE_BG } from "./types";
import { useId, useMemo } from "react";

type Props = { config: InfluencerConfig; animated?: boolean; pose?: number };

/**
 * Stylized SVG avatar that reacts to every config slider.
 * viewBox is tuned so the full 3/4 figure fits in a 3:4 frame with `meet`.
 * Pose index (0..2) shifts head tilt, arm position, and hair flow:
 *   0 — hand on waist (signature)
 *   1 — hair toss (head tilted, arm raised)
 *   2 — looking away (head turned, soft arms)
 */
export function InfluencerAvatar({ config, animated = true, pose = 0 }: Props) {
  const id = useId();
  const skin = SKIN_HEX[config.skin_tone] ?? "#ecc6a8";
  const skinDark = useMemo(() => shade(skin, -0.18), [skin]);
  const hair = HAIR_HEX[config.hair_color] ?? "#4a2a1a";
  const eye = EYE_HEX[config.eye_color] ?? "#5a3320";
  const lips = useMemo(() => shade(skin, -0.35, true), [skin]);
  const scene = SCENE_BG[config.scene_preset] ?? SCENE_BG["Coffee Shop"];

  // Body proportions
  const bustW = lerp(34, 70, range(config.bust, 70, 120));
  const waistW = lerp(24, 52, range(config.waist, 55, 90));
  const hipsW = lerp(38, 74, range(config.hips, 75, 120));
  const heightScale = lerp(0.94, 1.06, range(config.height_cm, 150, 190));
  const bodyMul: Record<string, number> = { Slim: 0.94, Athletic: 1, Curvy: 1.07, Voluptuous: 1.15 };
  const bm = bodyMul[config.body_type] ?? 1;

  const youth = 1 - range(config.age, 18, 45);
  const cheekR = 18 + youth * 6;
  const lipW = 22 + youth * 8;

  const hairLong = ["Long", "Extra Long"].includes(config.hair_length);
  const hairMed = config.hair_length === "Medium";
  const hairShort = ["Pixie", "Short"].includes(config.hair_length);
  const hairWavy = config.hair_style === "Wavy" || config.hair_style === "Curly";
  const ponytail = config.hair_style === "Ponytail";
  const bun = config.hair_style === "Bun";

  const topY = config.nsfw ? 240 : 230;
  const topH = config.nsfw ? 36 : 50;

  // Pose-driven values
  const headTilt = pose === 1 ? -8 : pose === 2 ? 10 : -2;
  const headTurn = pose === 2 ? 0.85 : 1; // squashes face horizontally for 3/4 view
  const leftArm = pose === 1
    ? `M ${-bustW} ${-10} Q ${-bustW - 40} ${-50} ${-bustW - 18} ${-100}` // raised hair toss
    : `M ${-bustW} ${-10} Q ${-bustW - 30} ${50} ${-waistW - 12} ${80}`;   // resting / hand on waist
  const rightArm = pose === 2
    ? `M ${bustW} ${-10} Q ${bustW + 32} ${30} ${bustW + 10} ${90}`
    : `M ${bustW} ${-10} Q ${bustW + 26} ${40} ${waistW + 18} ${80}`;
  const handOnWaist = pose === 0;

  return (
    <svg viewBox="0 0 400 560" className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene[0]} />
          <stop offset="55%" stopColor={scene[1]} />
          <stop offset="100%" stopColor={scene[2]} />
        </linearGradient>
        <radialGradient id={`${id}-vignette`} cx="50%" cy="45%" r="80%">
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </radialGradient>
        <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={shade(skin, 0.08)} />
          <stop offset="100%" stopColor={skinDark} />
        </linearGradient>
        <linearGradient id={`${id}-hair`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade(hair, 0.15)} />
          <stop offset="100%" stopColor={shade(hair, -0.2)} />
        </linearGradient>
        <linearGradient id={`${id}-outfit`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1018" />
          <stop offset="100%" stopColor="#3a1a30" />
        </linearGradient>
        <filter id={`${id}-soft`}><feGaussianBlur stdDeviation="0.6" /></filter>
      </defs>

      {/* Scene background */}
      <rect width="400" height="560" fill={`url(#${id}-bg)`} />
      {Array.from({ length: 14 }).map((_, i) => (
        <circle key={i} cx={(i * 73) % 400} cy={(i * 41) % 560} r={6 + (i % 4) * 2}
          fill="white" opacity={0.06 + ((i * 7) % 8) / 100} />
      ))}

      {/* Figure group — moved up so hips fit on canvas */}
      <g transform={`translate(200 245) scale(${heightScale * bm})`} className={animated ? "animate-breathe" : ""} style={{ transformOrigin: "200px 245px" }}>
        {/* Neck */}
        <path d={`M -16 -52 Q -16 -28 -20 -8 L 20 -8 Q 16 -28 16 -52 Z`} fill={`url(#${id}-skin)`} />
        {/* Torso */}
        <path d={`
          M ${-bustW} ${-12}
          Q ${-bustW - 6} ${28} ${-waistW} ${66}
          Q 0 ${74} ${waistW} ${66}
          Q ${bustW + 6} ${28} ${bustW} ${-12}
          Q 0 ${-22} ${-bustW} ${-12} Z`}
          fill={`url(#${id}-outfit)`} />
        {/* Bust soft highlight */}
        <ellipse cx={-bustW * 0.45} cy={5} rx={bustW * 0.32} ry={12} fill={shade(skin, 0.1)} opacity="0.18" />
        <ellipse cx={bustW * 0.45} cy={5} rx={bustW * 0.32} ry={12} fill={shade(skin, 0.1)} opacity="0.18" />
        {/* Hips / skirt — full silhouette through to thighs */}
        <path d={`
          M ${-waistW} ${64}
          Q ${-hipsW - 6} ${130} ${-hipsW + 2} ${220}
          L ${hipsW - 2} ${220}
          Q ${hipsW + 6} ${130} ${waistW} ${64} Z`}
          fill={`url(#${id}-outfit)`} opacity="0.94" />
        {/* Thigh hint */}
        <path d={`M ${-hipsW + 2} ${220} Q -2 ${236} ${hipsW - 2} ${220} L ${hipsW - 14} ${258} Q 0 ${266} ${-hipsW + 14} ${258} Z`}
          fill={`url(#${id}-skin)`} opacity="0.85" />

        {/* Arms (pose-aware) */}
        <path d={leftArm} stroke={`url(#${id}-skin)`} strokeWidth="13" fill="none" strokeLinecap="round" />
        <path d={rightArm} stroke={`url(#${id}-skin)`} strokeWidth="13" fill="none" strokeLinecap="round" />
        {handOnWaist && <ellipse cx={waistW + 16} cy={78} rx={9} ry={7} fill={skin} />}
        {pose === 1 && <ellipse cx={-bustW - 18} cy={-102} rx={8} ry={9} fill={skin} />}

        {/* Outfit accent */}
        <path d={`M ${-bustW + 6} ${topY - 245} Q 0 ${topY + topH - 245 + 6} ${bustW - 6} ${topY - 245}`}
          stroke="#d4a854" strokeWidth="1.2" fill="none" opacity="0.55" />
      </g>

      {/* Head group */}
      <g transform={`translate(200 145) rotate(${headTilt})`} className={animated ? "animate-sway" : ""} style={{ transformOrigin: "200px 145px" }}>
        <g transform={`scale(${headTurn} 1)`}>
          {/* Hair back */}
          {hairLong && (
            <path d={`M -60 -10 Q -84 ${ponytail ? 60 : 130} ${ponytail ? -28 : -48} ${ponytail ? 170 : 200}
                       L ${ponytail ? 28 : 48} ${ponytail ? 170 : 200} Q 84 ${ponytail ? 60 : 130} 60 -10 Z`}
              fill={`url(#${id}-hair)`} opacity="0.95" />
          )}
          {hairMed && (
            <path d="M -58 -8 Q -74 70 -38 88 L 38 88 Q 74 70 58 -8 Z" fill={`url(#${id}-hair)`} />
          )}

          {/* Face */}
          <ellipse cx={0} cy={0} rx={48} ry={60} fill={`url(#${id}-skin)`} />
          <ellipse cx={-cheekR} cy={18} rx={11} ry={7} fill="#e89bb6" opacity="0.18" filter={`url(#${id}-soft)`} />
          <ellipse cx={cheekR} cy={18} rx={11} ry={7} fill="#e89bb6" opacity="0.18" filter={`url(#${id}-soft)`} />

          {/* Brows */}
          <path d="M -26 -14 Q -16 -20 -6 -14" stroke={shade(hair, -0.3)} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 6 -14 Q 16 -20 26 -14" stroke={shade(hair, -0.3)} strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Eyes */}
          <ellipse cx={-16} cy={0} rx={6.5} ry={3.8} fill="white" />
          <ellipse cx={16} cy={0} rx={6.5} ry={3.8} fill="white" />
          <circle cx={-16} cy={0} r={3} fill={eye} />
          <circle cx={16} cy={0} r={3} fill={eye} />
          <circle cx={-15} cy={-1} r={0.9} fill="white" />
          <circle cx={17} cy={-1} r={0.9} fill="white" />
          <path d="M -23 -2 Q -16 -5 -9 -2" stroke="#1a1110" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M 9 -2 Q 16 -5 23 -2" stroke="#1a1110" strokeWidth="1.3" fill="none" strokeLinecap="round" />

          {/* Nose */}
          <path d="M 0 8 Q -3 18 0 22 Q 3 18 0 8" stroke={skinDark} strokeWidth="1.1" fill="none" opacity="0.6" />

          {/* Lips */}
          <path d={`M ${-lipW / 2} 34 Q -4 30 0 34 Q 4 30 ${lipW / 2} 34 Q 4 42 0 40 Q -4 42 ${-lipW / 2} 34 Z`} fill={lips} />
          <path d={`M ${-lipW / 2} 34 Q 0 36 ${lipW / 2} 34`} stroke={shade(lips, -0.25)} strokeWidth="0.6" fill="none" />

          {/* Hair front */}
          {!bun && !hairShort && (
            <path d="M -50 -40 Q -26 -64 0 -56 Q 28 -64 50 -40 Q 44 -28 26 -32 Q 8 -36 0 -32 Q -8 -36 -26 -32 Q -44 -28 -50 -40 Z"
              fill={`url(#${id}-hair)`} />
          )}
          {hairShort && (
            <path d="M -52 -28 Q -28 -64 0 -56 Q 28 -64 52 -28 Q 48 -10 28 -14 L -28 -14 Q -48 -10 -52 -28 Z"
              fill={`url(#${id}-hair)`} />
          )}
          {bun && (
            <>
              <ellipse cx={0} cy={-64} rx={20} ry={16} fill={`url(#${id}-hair)`} />
              <path d="M -48 -28 Q -26 -50 0 -46 Q 26 -50 48 -28 Q 46 -16 28 -18 L -28 -18 Q -46 -16 -48 -28 Z"
                fill={`url(#${id}-hair)`} />
            </>
          )}
          {hairWavy && hairLong && (
            <>
              <path d="M -60 20 Q -72 60 -54 100" stroke={shade(hair, 0.1)} strokeWidth="2" fill="none" opacity="0.5" />
              <path d="M 60 20 Q 72 60 54 100" stroke={shade(hair, 0.1)} strokeWidth="2" fill="none" opacity="0.5" />
            </>
          )}

          {/* Earrings */}
          <circle cx={-46} cy={20} r={2.4} fill="#e6c178" />
          <circle cx={46} cy={20} r={2.4} fill="#e6c178" />
        </g>
      </g>

      {/* Vignette */}
      <rect width="400" height="560" fill={`url(#${id}-vignette)`} pointerEvents="none" />
    </svg>
  );
}

// Helpers
function range(v: number, min: number, max: number) {
  return Math.max(0, Math.min(1, (v - min) / (max - min)));
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function shade(hex: string, amt: number, warm = false) {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  let r = (num >> 16) & 0xff, g = (num >> 8) & 0xff, b = num & 0xff;
  const adj = (v: number) => Math.round(Math.max(0, Math.min(255, v + amt * 255)));
  r = adj(r); g = adj(g); b = adj(b);
  if (warm) { r = Math.min(255, r + 20); }
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}
