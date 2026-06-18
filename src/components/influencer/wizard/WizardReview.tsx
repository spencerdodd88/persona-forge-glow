import type { InfluencerConfig } from "../types";
import { chestLabel } from "../types";

type Props = {
  config: InfluencerConfig;
};

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/50 last:border-0">
      <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right text-foreground">{value}</span>
    </div>
  );
}

export function WizardReview({ config }: Props) {
  const gender = config.gender_presentation ?? "Female";

  return (
    <div className="rounded-2xl border border-border/60 bg-secondary/15 overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 bg-background/40">
        <p className="text-[10px] uppercase tracking-[0.22em] text-primary/80 font-medium">Your influencer</p>
        <h3 className="font-display text-2xl mt-1">{config.name || "Unnamed"}</h3>
      </div>
      <div className="px-5 py-2">
        <ReviewRow label="Content" value={config.nsfw ? "NSFW" : "SFW"} />
        <ReviewRow label="Presentation" value={gender} />
        <ReviewRow label="Age" value={`${config.age} years`} />
        <ReviewRow label="Ethnicity" value={config.ethnicity} />
        <ReviewRow label="Skin" value={config.skin_tone} />
        <ReviewRow
          label="Hair"
          value={`${config.hair_color} · ${config.hair_length} · ${config.hair_style}`}
        />
        <ReviewRow label="Eyes" value={config.eye_color} />
        <ReviewRow label="Body type" value={config.body_type} />
        <ReviewRow label="Height" value={`${config.height_cm} cm`} />
        <ReviewRow label={chestLabel(gender)} value={`${config.bust} cm`} />
        <ReviewRow label="Waist" value={`${config.waist} cm`} />
        <ReviewRow label="Hips" value={`${config.hips} cm`} />
        <ReviewRow label="Scene" value={config.scene_preset} />
        {config.bio.trim() && <ReviewRow label="Bio" value={config.bio.trim()} />}
      </div>
    </div>
  );
}
