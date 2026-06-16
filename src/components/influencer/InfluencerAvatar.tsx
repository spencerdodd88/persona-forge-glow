import { type InfluencerConfig, SKIN_HEX, HAIR_HEX, EYE_HEX, SCENE_BG } from "./types";
import { useId, useMemo } from "react";

type Props = { config: InfluencerConfig; animated?: boolean };

/**
 * Stylized SVG avatar that reacts to every config slider.
 * Body widths derive from bust/waist/hips; height scales the figure vertically;
 * face proportions shift slightly with age; hair shape from length/style.
 * Subtle CSS animations (breathing torso, gentle hair sway) give it life.
 */
export function InfluencerAvatar({ config, animated = true }: Props) {
  const id = useId();
  const skin = SKIN_HEX[config.skin_tone] ?? "#ecc6a8";
  const skinDark = useMemo(() => shade(skin, -0.18), [skin]);
  const hair = HAIR_HEX[config.hair_color] ?? "#4a2a1a";
  const eye = EYE_HEX[config.eye_color] ?? "#5a3320";
  const lips = useMemo(() => shade(skin, -0.35, true), [skin]);
  const scene = SCENE_BG[config.scene_preset] ?? SCENE_BG["Coffee Shop"];

  // Body proportions (centered around 200 wide canvas)
  const bustW = lerp(38, 78, range(config.bust, 70, 120));
  const waistW = lerp(28, 60, range(config.waist, 55, 90));
  const hipsW = lerp(40, 82, range(config.hips, 75, 120));
  // Height scales total figure height
  const heightScale = lerp(0.93, 1.08, range(config.height_cm, 150, 190));
  // Body type tweaks
  const bodyMul: Record<string, number> = { Slim: 0.92, Athletic: 1, Curvy: 1.08, Voluptuous: 1.18 };
  const bm = bodyMul[config.body_type] ?? 1;

  // Age affects face: younger => rounder cheeks, fuller lips
  const youth = 1 - range(config.age, 18, 45);
  const cheekR = 18 + youth * 6;
  const lipW = 22 + youth * 8;

  // Hair shape
  const hairLong = ["Long", "Extra Long"].includes(config.hair_length);
  const hairMed = config.hair_length === "Medium";
  const hairShort = ["Pixie", "Short"].includes(config.hair_length);
  const hairWavy = config.hair_style === "Wavy" || config.hair_style === "Curly";
  const ponytail = config.hair_style === "Ponytail";
  const bun = config.hair_style === "Bun";

  // NSFW: shorter top hint (UI only, still tasteful stylized SVG)
  const topY = config.nsfw ? 240 : 230;
  const topH = config.nsfw ? 36 : 50;

  return (
    <svg viewBox="0 0 400 540" className="w-full h-full block" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene[0]} />
          <stop offset="55%" stopColor={scene[1]} />
          <stop offset="100%" stopColor={scene[2]} />
        </linearGradient>
        <radialGradient id={`${id}-vignette`} cx="50%" cy="40%" r="75%">
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
      <rect width="400" height="540" fill={`url(#${id}-bg)`} />
      {/* soft bokeh dots */}
      {Array.from({ length: 14 }).map((_, i) => (
        <circle key={i} cx={(i * 73) % 400} cy={(i * 41) % 540} r={6 + (i % 4) * 2}
          fill="white" opacity={0.06 + ((i * 7) % 8) / 100} />
      ))}

      {/* Figure group — scales with height, breathing animation */}
      <g transform={`translate(200 285) scale(${heightScale * bm})`} className={animated ? "animate-breathe" : ""} style={{ transformOrigin: "200px 285px" }}>
        {/* Neck */}
        <path d={`M -18 -55 Q -18 -30 -22 -10 L 22 -10 Q 18 -30 18 -55 Z`} fill={`url(#${id}-skin)`} />
        {/* Shoulders / torso */}
        <path d={`
          M ${-bustW} ${-15}
          Q ${-bustW - 6} ${30} ${-waistW} ${70}
          Q 0 ${78} ${waistW} ${70}
          Q ${bustW + 6} ${30} ${bustW} ${-15}
          Q 0 ${-25} ${-bustW} ${-15} Z`}
          fill={`url(#${id}-outfit)`} />
        {/* Bust highlight */}
        <ellipse cx={-bustW * 0.45} cy={5} rx={bustW * 0.32} ry={14} fill={shade(skin, 0.1)} opacity="0.18" />
        <ellipse cx={bustW * 0.45} cy={5} rx={bustW * 0.32} ry={14} fill={shade(skin, 0.1)} opacity="0.18" />
        {/* Hips/skirt */}
        <path d={`
          M ${-waistW} ${68}
          Q ${-hipsW - 4} ${130} ${-hipsW + 4} ${190}
          L ${hipsW - 4} ${190}
          Q ${hipsW + 4} ${130} ${waistW} ${68} Z`}
          fill={`url(#${id}-outfit)`} opacity="0.92" />
        {/* Arm (one resting at waist — "hand on waist") */}
        <path d={`M ${-bustW} ${-10} Q ${-bustW - 30} ${50} ${-waistW - 10} ${78}`}
          stroke={`url(#${id}-skin)`} strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d={`M ${bustW} ${-10} Q ${bustW + 26} ${40} ${waistW + 18} ${78}`}
          stroke={`url(#${id}-skin)`} strokeWidth="14" fill="none" strokeLinecap="round" />
        {/* hand on waist */}
        <ellipse cx={waistW + 16} cy={76} rx={9} ry={7} fill={skin} />

        {/* NSFW-aware outfit accent line */}
        <path d={`M ${-bustW + 6} ${topY - 285} Q 0 ${topY + topH - 285 + 6} ${bustW - 6} ${topY - 285}`}
          stroke="#d4a854" strokeWidth="1.2" fill="none" opacity="0.55" />
      </g>

      {/* Head group — slight sway for life */}
      <g transform={`translate(200 165)`} className={animated ? "animate-sway" : ""} style={{ transformOrigin: "200px 165px" }}>
        {/* Hair back layer */}
        {hairLong && (
          <path d={`M -64 -10 Q -88 ${ponytail ? 60 : 130} ${ponytail ? -30 : -50} ${ponytail ? 180 : 200}
                     L ${ponytail ? 30 : 50} ${ponytail ? 180 : 200} Q 88 ${ponytail ? 60 : 130} 64 -10 Z`}
            fill={`url(#${id}-hair)`} opacity="0.95" />
        )}
        {hairMed && (
          <path d="M -62 -8 Q -78 70 -40 90 L 40 90 Q 78 70 62 -8 Z" fill={`url(#${id}-hair)`} />
        )}

        {/* Face shape */}
        <ellipse cx={0} cy={0} rx={52} ry={64} fill={`url(#${id}-skin)`} />
        {/* Cheek blush */}
        <ellipse cx={-cheekR} cy={18} rx={12} ry={7} fill="#e89bb6" opacity="0.18" filter={`url(#${id}-soft)`} />
        <ellipse cx={cheekR} cy={18} rx={12} ry={7} fill="#e89bb6" opacity="0.18" filter={`url(#${id}-soft)`} />

        {/* Eyebrows */}
        <path d="M -28 -16 Q -18 -22 -8 -16" stroke={shade(hair, -0.3)} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 8 -16 Q 18 -22 28 -16" stroke={shade(hair, -0.3)} strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Eyes */}
        <ellipse cx={-18} cy={-2} rx={7} ry={4} fill="white" />
        <ellipse cx={18} cy={-2} rx={7} ry={4} fill="white" />
        <circle cx={-18} cy={-2} r={3.2} fill={eye} />
        <circle cx={18} cy={-2} r={3.2} fill={eye} />
        <circle cx={-17} cy={-3} r={1} fill="white" />
        <circle cx={19} cy={-3} r={1} fill="white" />
        {/* Lashes */}
        <path d="M -25 -4 Q -18 -7 -11 -4" stroke="#1a1110" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M 11 -4 Q 18 -7 25 -4" stroke="#1a1110" strokeWidth="1.4" fill="none" strokeLinecap="round" />

        {/* Nose */}
        <path d="M 0 6 Q -4 18 0 22 Q 4 18 0 6" stroke={skinDark} strokeWidth="1.2" fill="none" opacity="0.6" />

        {/* Lips */}
        <path d={`M ${-lipW / 2} 36 Q -4 32 0 36 Q 4 32 ${lipW / 2} 36 Q 4 44 0 42 Q -4 44 ${-lipW / 2} 36 Z`} fill={lips} />
        <path d={`M ${-lipW / 2} 36 Q 0 38 ${lipW / 2} 36`} stroke={shade(lips, -0.25)} strokeWidth="0.6" fill="none" />

        {/* Hair front */}
        {!bun && !hairShort && (
          <path d="M -52 -42 Q -28 -68 0 -58 Q 30 -68 52 -42 Q 46 -28 28 -32 Q 10 -38 0 -32 Q -10 -38 -28 -32 Q -46 -28 -52 -42 Z"
            fill={`url(#${id}-hair)`} />
        )}
        {hairShort && (
          <path d="M -54 -30 Q -30 -68 0 -60 Q 30 -68 54 -30 Q 50 -10 30 -14 L -30 -14 Q -50 -10 -54 -30 Z"
            fill={`url(#${id}-hair)`} />
        )}
        {bun && (
          <>
            <ellipse cx={0} cy={-68} rx={22} ry={18} fill={`url(#${id}-hair)`} />
            <path d="M -50 -30 Q -28 -54 0 -50 Q 28 -54 50 -30 Q 48 -16 30 -18 L -30 -18 Q -48 -16 -50 -30 Z"
              fill={`url(#${id}-hair)`} />
          </>
        )}
        {/* Wavy strands accent */}
        {hairWavy && hairLong && (
          <>
            <path d="M -64 20 Q -76 60 -58 100" stroke={shade(hair, 0.1)} strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M 64 20 Q 76 60 58 100" stroke={shade(hair, 0.1)} strokeWidth="2" fill="none" opacity="0.5" />
          </>
        )}

        {/* Earrings — small luxe accent */}
        <circle cx={-50} cy={20} r={2.4} fill="#e6c178" />
        <circle cx={50} cy={20} r={2.4} fill="#e6c178" />
      </g>

      {/* Vignette */}
      <rect width="400" height="540" fill={`url(#${id}-vignette)`} pointerEvents="none" />
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
