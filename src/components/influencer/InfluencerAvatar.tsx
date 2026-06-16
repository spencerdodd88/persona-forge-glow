import { type InfluencerConfig, SKIN_HEX, HAIR_HEX, EYE_HEX, SCENE_BG } from "./types";
import { useId, useMemo } from "react";

type Props = { config: InfluencerConfig; animated?: boolean; pose?: number };

const VB_W = 400;
const VB_H = 500;
const CX = VB_W / 2;       // 200 — vertical centerline
const HEAD_CY = 140;        // head center
const BODY_CY = 250;        // body anchor (shoulders)

/**
 * Stylized SVG avatar. Painted with absolute coords centered on CX so the
 * figure always sits in the middle of the viewBox; no nested transforms that
 * could shift the composition off-center.
 *
 * Pose:
 *  0 — hand on waist (signature)
 *  1 — hair toss (arm raised)
 *  2 — looking away (head turned, hand reaching down)
 */
export function InfluencerAvatar({ config, animated = true, pose = 0 }: Props) {
  const id = useId();
  const skin = SKIN_HEX[config.skin_tone] ?? "#ecc6a8";
  const skinDark = useMemo(() => shade(skin, -0.18), [skin]);
  const hair = HAIR_HEX[config.hair_color] ?? "#4a2a1a";
  const eye = EYE_HEX[config.eye_color] ?? "#5a3320";
  const lips = useMemo(() => shade(skin, -0.35, true), [skin]);
  const scene = SCENE_BG[config.scene_preset] ?? SCENE_BG["Coffee Shop"];

  // Body widths (in viewBox units) driven by sliders
  const bodyMul: Record<string, number> = { Slim: 0.92, Athletic: 1, Curvy: 1.08, Voluptuous: 1.16 };
  const bm = bodyMul[config.body_type] ?? 1;
  const bustW = lerp(34, 64, range(config.bust, 70, 120)) * bm;
  const waistW = lerp(22, 46, range(config.waist, 55, 90)) * bm;
  const hipsW = lerp(36, 68, range(config.hips, 75, 120)) * bm;
  // Height changes the vertical extent (longer torso + thighs)
  const heightT = range(config.height_cm, 150, 190);
  const torsoH = lerp(70, 86, heightT);
  const hipH = lerp(60, 78, heightT);

  // Face shape from age
  const youth = 1 - range(config.age, 18, 45);
  const cheekX = 18 + youth * 6;
  const lipW = 22 + youth * 8;
  const faceRX = 46;
  const faceRY = 58;

  // Hair
  const hairLong = ["Long", "Extra Long"].includes(config.hair_length);
  const hairMed = config.hair_length === "Medium";
  const hairShort = ["Pixie", "Short"].includes(config.hair_length);
  const hairWavy = config.hair_style === "Wavy" || config.hair_style === "Curly";
  const ponytail = config.hair_style === "Ponytail";
  const bun = config.hair_style === "Bun";

  // Pose-driven head + arm geometry (absolute coordinates)
  const headTilt = pose === 1 ? -7 : pose === 2 ? 9 : -2;
  const headTurn = pose === 2 ? 0.86 : 1;

  // Shoulder anchor points (absolute, around BODY_CY)
  const shoulderY = BODY_CY - 8;
  const waistY = BODY_CY + torsoH;
  const hipsBottomY = waistY + hipH;

  // Arms — absolute coords
  const armLeft = pose === 1
    // raised: hand near top-left of head
    ? `M ${CX - bustW} ${shoulderY} Q ${CX - bustW - 38} ${shoulderY - 60} ${CX - bustW - 16} ${shoulderY - 110}`
    : `M ${CX - bustW} ${shoulderY} Q ${CX - bustW - 28} ${shoulderY + 60} ${CX - waistW - 10} ${waistY + 6}`;
  const armRight = pose === 2
    ? `M ${CX + bustW} ${shoulderY} Q ${CX + bustW + 34} ${shoulderY + 40} ${CX + bustW + 8} ${waistY + 22}`
    : `M ${CX + bustW} ${shoulderY} Q ${CX + bustW + 26} ${shoulderY + 50} ${CX + waistW + 18} ${waistY + 6}`;

  const handOnWaist = pose === 0;

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene[0]} />
          <stop offset="55%" stopColor={scene[1]} />
          <stop offset="100%" stopColor={scene[2]} />
        </linearGradient>
        <radialGradient id={`${id}-vignette`} cx="50%" cy="45%" r="80%">
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
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
      <rect width={VB_W} height={VB_H} fill={`url(#${id}-bg)`} />
      {/* Subtle bokeh — fewer and dimmer so they don't compete with the figure */}
      {[
        [60, 60, 5], [340, 90, 7], [50, 430, 6], [360, 420, 8], [310, 470, 4],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="white" opacity={0.05} />
      ))}

      {/* ============ FIGURE (absolute coords, animated as one group) ============ */}
      <g className={animated ? "animate-breathe" : ""} style={{ transformOrigin: `${CX}px ${BODY_CY}px` }}>
        {/* Neck */}
        <path
          d={`M ${CX - 16} ${HEAD_CY + faceRY - 6}
              Q ${CX - 16} ${shoulderY - 22} ${CX - 20} ${shoulderY - 4}
              L ${CX + 20} ${shoulderY - 4}
              Q ${CX + 16} ${shoulderY - 22} ${CX + 16} ${HEAD_CY + faceRY - 6} Z`}
          fill={`url(#${id}-skin)`}
        />

        {/* Torso (outfit) */}
        <path
          d={`M ${CX - bustW} ${shoulderY}
              Q ${CX - bustW - 6} ${shoulderY + 40} ${CX - waistW} ${waistY}
              Q ${CX} ${waistY + 8} ${CX + waistW} ${waistY}
              Q ${CX + bustW + 6} ${shoulderY + 40} ${CX + bustW} ${shoulderY}
              Q ${CX} ${shoulderY - 10} ${CX - bustW} ${shoulderY} Z`}
          fill={`url(#${id}-outfit)`}
        />
        {/* Bust shading */}
        <ellipse cx={CX - bustW * 0.45} cy={shoulderY + 18} rx={bustW * 0.32} ry={12} fill={shade(skin, 0.1)} opacity="0.18" />
        <ellipse cx={CX + bustW * 0.45} cy={shoulderY + 18} rx={bustW * 0.32} ry={12} fill={shade(skin, 0.1)} opacity="0.18" />
        {/* Subtle gold trim under bustline */}
        <path d={`M ${CX - bustW + 6} ${shoulderY + 28} Q ${CX} ${shoulderY + 38} ${CX + bustW - 6} ${shoulderY + 28}`}
          stroke="#d4a854" strokeWidth="1.1" fill="none" opacity="0.55" />

        {/* Hips & skirt */}
        <path
          d={`M ${CX - waistW} ${waistY - 2}
              Q ${CX - hipsW - 6} ${waistY + 30} ${CX - hipsW + 2} ${hipsBottomY}
              L ${CX + hipsW - 2} ${hipsBottomY}
              Q ${CX + hipsW + 6} ${waistY + 30} ${CX + waistW} ${waistY - 2} Z`}
          fill={`url(#${id}-outfit)`} opacity="0.95"
        />
        {/* Thigh hint */}
        <path
          d={`M ${CX - hipsW + 6} ${hipsBottomY}
              L ${CX - hipsW + 14} ${hipsBottomY + 26}
              Q ${CX} ${hipsBottomY + 34} ${CX + hipsW - 14} ${hipsBottomY + 26}
              L ${CX + hipsW - 6} ${hipsBottomY} Z`}
          fill={`url(#${id}-skin)`} opacity="0.85"
        />

        {/* Arms */}
        <path d={armLeft} stroke={`url(#${id}-skin)`} strokeWidth="13" fill="none" strokeLinecap="round" />
        <path d={armRight} stroke={`url(#${id}-skin)`} strokeWidth="13" fill="none" strokeLinecap="round" />
        {handOnWaist && <ellipse cx={CX + waistW + 16} cy={waistY + 6} rx={9} ry={7} fill={skin} />}
        {pose === 1 && <ellipse cx={CX - bustW - 16} cy={shoulderY - 112} rx={8} ry={9} fill={skin} />}
      </g>

      {/* ============ HEAD (gentle sway) ============ */}
      <g
        className={animated ? "animate-sway" : ""}
        style={{ transformOrigin: `${CX}px ${HEAD_CY}px` }}
        transform={`rotate(${headTilt} ${CX} ${HEAD_CY})`}
      >
        {/* Hair back layer */}
        {hairLong && (
          <path
            d={`M ${CX - 58} ${HEAD_CY - 10}
                Q ${CX - 84} ${HEAD_CY + (ponytail ? 60 : 130)}
                  ${CX - (ponytail ? 28 : 48)} ${HEAD_CY + (ponytail ? 170 : 200)}
                L ${CX + (ponytail ? 28 : 48)} ${HEAD_CY + (ponytail ? 170 : 200)}
                Q ${CX + 84} ${HEAD_CY + (ponytail ? 60 : 130)} ${CX + 58} ${HEAD_CY - 10} Z`}
            fill={`url(#${id}-hair)`}
            opacity="0.95"
          />
        )}
        {hairMed && (
          <path
            d={`M ${CX - 56} ${HEAD_CY - 8} Q ${CX - 74} ${HEAD_CY + 70} ${CX - 36} ${HEAD_CY + 90}
                L ${CX + 36} ${HEAD_CY + 90} Q ${CX + 74} ${HEAD_CY + 70} ${CX + 56} ${HEAD_CY - 8} Z`}
            fill={`url(#${id}-hair)`}
          />
        )}

        {/* Face (apply turn squash via inner group) */}
        <g transform={`translate(${CX} ${HEAD_CY}) scale(${headTurn} 1)`}>
          <ellipse cx={0} cy={0} rx={faceRX} ry={faceRY} fill={`url(#${id}-skin)`} />
          <ellipse cx={-cheekX} cy={18} rx={11} ry={7} fill="#e89bb6" opacity="0.2" filter={`url(#${id}-soft)`} />
          <ellipse cx={cheekX} cy={18} rx={11} ry={7} fill="#e89bb6" opacity="0.2" filter={`url(#${id}-soft)`} />

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
          {/* Lashes */}
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
      <rect width={VB_W} height={VB_H} fill={`url(#${id}-vignette)`} pointerEvents="none" />
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
