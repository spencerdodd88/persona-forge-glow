import { Sparkles, RefreshCw, Camera, Wand2 } from "lucide-react";
import { InfluencerAvatar } from "./InfluencerAvatar";
import type { InfluencerConfig } from "./types";

type Props = {
  config: InfluencerConfig;
  renderedConfig: InfluencerConfig;
  pose: number;
  renderedPose: number;
  aiImage: string | null;
  aiFinal: boolean;
  generating: boolean;
  version: number;
  summary: string;
  onCyclePose: () => void;
};

export function LivePreview({
  config,
  renderedConfig,
  pose,
  renderedPose,
  aiImage,
  aiFinal,
  generating,
  version,
  summary,
  onCyclePose,
}: Props) {
  const hasAi = Boolean(aiImage);
  const showSvgPlaceholder = !hasAi;

  return (
    <div className="sticky top-20 self-start flex flex-col w-full">
      <div className="relative w-full">
        <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary/8 via-transparent to-accent/6 pointer-events-none" />
        <div
          className="relative w-full aspect-[3/4] min-h-[520px] rounded-[2rem] overflow-hidden bg-card
                     ring-1 ring-border/80
                     shadow-[0_48px_100px_-40px_rgba(70,55,30,0.28),0_12px_40px_-16px_rgba(70,55,30,0.14)]"
        >
          <div className="pointer-events-none absolute inset-4 rounded-[1.5rem] border border-primary/25 z-10" />
          <div className="pointer-events-none absolute inset-[18px] rounded-[1.35rem] border border-primary/10 z-10" />

          {/* SVG placeholder — only before first AI image */}
          <div className="absolute inset-0 bg-secondary/30">
            {showSvgPlaceholder && (
              <InfluencerAvatar config={renderedConfig} pose={renderedPose} animated={!generating} />
            )}
          </div>

          {/* Replicate AI — always keep last successful image visible while regenerating */}
          {hasAi && aiImage && (
            <img
              key={aiImage}
              src={aiImage}
              alt="AI character preview"
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover object-top z-[5] transition-all duration-700 ease-out ${
                generating
                  ? "opacity-85 blur-[2px] scale-[1.01]"
                  : aiFinal
                    ? "opacity-100 blur-0 scale-100"
                    : "opacity-90 blur-sm scale-[1.01]"
              }`}
              draggable={false}
            />
          )}

          {/* Generating overlay */}
          <div
            className={`absolute inset-0 z-20 flex items-end justify-center pb-8 pointer-events-none transition-opacity duration-300 ${
              generating ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            <div className="relative flex items-center gap-3 px-5 py-2.5 rounded-full glass-card border-primary/20">
              <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
              <span className="text-xs font-medium tracking-wide text-foreground">Updating preview…</span>
              <div className="h-1 w-16 rounded-full overflow-hidden bg-secondary/60">
                <div className="h-full shimmer-bg" />
              </div>
            </div>
          </div>

          <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-[10px] uppercase tracking-[0.22em] text-primary font-medium">
              <Sparkles className="w-3 h-3" /> Live preview
            </div>
            {hasAi && !generating && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 backdrop-blur-sm text-[10px] uppercase tracking-[0.18em] text-primary">
                <Wand2 className="w-3 h-3" /> AI generated
              </div>
            )}
          </div>

          {config.nsfw && (
            <div className="absolute top-5 right-5 z-20 px-3 py-1.5 rounded-full bg-accent/90 text-accent-foreground text-[10px] uppercase tracking-[0.2em] font-medium">
              Mature
            </div>
          )}

          <button
            type="button"
            onClick={onCyclePose}
            className="absolute bottom-5 right-5 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs text-foreground hover:text-primary hover-lift transition pointer-events-auto border-primary/15"
            aria-label="Cycle pose"
          >
            <Camera className="w-3.5 h-3.5" />
            Pose {pose + 1}/3
          </button>

          <div className="absolute bottom-5 left-5 z-20 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 tabular-nums">
            v{version}
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 rounded-2xl glass-card border-primary/10 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-primary/70 font-medium mb-1">Character</p>
            <h2 className="font-display text-3xl md:text-4xl truncate leading-tight">
              {config.name || "Unnamed"}
            </h2>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-[10px] uppercase tracking-[0.2em] text-primary font-medium">
            <span className={`w-1.5 h-1.5 rounded-full bg-primary ${generating ? "animate-pulse" : ""}`} />
            {generating ? "Generating" : hasAi ? "AI" : "Preview"}
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>

        {config.bio && (
          <blockquote className="text-sm text-foreground/80 italic border-l-2 border-primary/30 pl-4 py-0.5">
            {config.bio}
          </blockquote>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {[config.gender_presentation ?? "Female", config.ethnicity, config.body_type, config.scene_preset].map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-[11px] bg-secondary/80 text-muted-foreground tracking-wide"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
