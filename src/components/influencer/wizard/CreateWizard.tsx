import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { InfluencerConfig } from "../types";
import {
  WIZARD_STEPS,
  PROGRESS_STEPS,
  canAdvanceStep,
  bustStepTitle,
  HEIGHT_PRESETS,
  BUST_PRESETS,
  WAIST_PRESETS,
  HIP_PRESETS,
  type WizardStepId,
} from "./wizardSteps";
import {
  ContentModeChoices,
  GenderChoices,
  AgeChoices,
  EthnicityChoices,
  SkinToneChoices,
  HairColorChoices,
  HairLengthChoices,
  HairStyleChoices,
  EyeColorChoices,
  BodyTypeChoices,
  ProportionChoices,
  SceneChoices,
} from "./WizardChoices";
import { WizardReview } from "./WizardReview";

type Props = {
  config: InfluencerConfig;
  onUpdate: <K extends keyof InfluencerConfig>(key: K, value: InfluencerConfig[K]) => void;
  onSave: () => void;
  saving: boolean;
};

export function CreateWizard({ config, onUpdate, onSave, saving }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [contentModeChosen, setContentModeChosen] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const step = WIZARD_STEPS[stepIndex];
  const progressIndex = PROGRESS_STEPS.findIndex((s) => s.id === step.id);
  const progressValue =
    step.id === "review"
      ? 100
      : ((progressIndex + 1) / PROGRESS_STEPS.length) * 100;

  const canNext = canAdvanceStep(step.id, config, contentModeChosen);

  const goNext = () => {
    if (!canNext || stepIndex >= WIZARD_STEPS.length - 1) return;
    setDirection("forward");
    setStepIndex((i) => i + 1);
  };

  const goBack = () => {
    if (stepIndex <= 0) return;
    setDirection("back");
    setStepIndex((i) => i - 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.shiftKey || e.metaKey || e.ctrlKey) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "TEXTAREA") return;
      if (step.id === "review") return;
      if (!canAdvanceStep(step.id, config, contentModeChosen)) return;
      e.preventDefault();
      setDirection("forward");
      setStepIndex((i) => (i >= WIZARD_STEPS.length - 1 ? i : i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step.id, config, contentModeChosen]);

  const handleContentMode = (nsfw: boolean) => {
    setContentModeChosen(true);
    onUpdate("nsfw", nsfw);
  };

  const title =
    step.id === "bust"
      ? bustStepTitle(config)
      : step.title;

  return (
    <div className="wizard-shell flex flex-col min-h-[min(720px,calc(100vh-12rem))]">
      {/* Progress */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>Step {Math.min(stepIndex + 1, PROGRESS_STEPS.length)} of {PROGRESS_STEPS.length}</span>
          <span className="tabular-nums">{Math.round(progressValue)}%</span>
        </div>
        <Progress value={progressValue} className="h-1.5 bg-secondary/80" />
      </div>

      {/* Question */}
      <div
        key={step.id}
        className={cn(
          "flex-1 flex flex-col animate-fade-up",
          direction === "back" && "animate-fade-up",
        )}
      >
        {step.eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary/80 font-medium mb-3">
            {step.eyebrow}
          </p>
        )}
        <h2 className="font-display text-3xl sm:text-4xl leading-[1.12] text-foreground mb-2">
          {title}
        </h2>
        {step.subtitle && (
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8 max-w-lg">
            {step.subtitle}
          </p>
        )}
        {!step.subtitle && step.id !== "content_mode" && <div className="mb-8" />}

        <div className="flex-1 pb-6">
          <WizardStepBody
            stepId={step.id}
            config={config}
            contentModeChosen={contentModeChosen}
            onUpdate={onUpdate}
            onContentMode={handleContentMode}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-6 border-t border-border/50 mt-auto">
        {stepIndex > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            className="h-12 px-5 rounded-xl border-border/70"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        ) : (
          <div className="w-[88px]" />
        )}

        {step.id === "review" ? (
          <Button
            type="button"
            onClick={onSave}
            disabled={saving || !config.name.trim()}
            className="flex-1 h-12 rounded-xl bg-gradient-luxe text-primary-foreground border-0 hover:opacity-90 shadow-[var(--shadow-soft)]"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Create influencer
          </Button>
        ) : (
          <Button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            className="flex-1 h-12 rounded-xl bg-gradient-luxe text-primary-foreground border-0 hover:opacity-90 shadow-[var(--shadow-soft)] disabled:opacity-40"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

function WizardStepBody({
  stepId,
  config,
  contentModeChosen,
  onUpdate,
  onContentMode,
}: {
  stepId: WizardStepId;
  config: InfluencerConfig;
  contentModeChosen: boolean;
  onUpdate: Props["onUpdate"];
  onContentMode: (nsfw: boolean) => void;
}) {
  switch (stepId) {
    case "content_mode":
      return (
        <ContentModeChoices
          value={config.nsfw}
          chosen={contentModeChosen}
          onChange={onContentMode}
        />
      );
    case "name":
      return (
        <Input
          autoFocus
          value={config.name}
          onChange={(e) => onUpdate("name", e.target.value)}
          placeholder="e.g. Alex, River, Nova…"
          className="h-14 sm:h-16 text-lg sm:text-xl px-5 rounded-2xl bg-input/50 border-border/70 focus-visible:ring-primary/40"
        />
      );
    case "gender":
      return (
        <GenderChoices
          value={config.gender_presentation ?? "Female"}
          onChange={(v) => onUpdate("gender_presentation", v)}
        />
      );
    case "age":
      return <AgeChoices value={config.age} onChange={(v) => onUpdate("age", v)} />;
    case "ethnicity":
      return <EthnicityChoices value={config.ethnicity} onChange={(v) => onUpdate("ethnicity", v)} />;
    case "skin_tone":
      return <SkinToneChoices value={config.skin_tone} onChange={(v) => onUpdate("skin_tone", v)} />;
    case "hair_color":
      return <HairColorChoices value={config.hair_color} onChange={(v) => onUpdate("hair_color", v)} />;
    case "hair_length":
      return <HairLengthChoices value={config.hair_length} onChange={(v) => onUpdate("hair_length", v)} />;
    case "hair_style":
      return <HairStyleChoices value={config.hair_style} onChange={(v) => onUpdate("hair_style", v)} />;
    case "eye_color":
      return <EyeColorChoices value={config.eye_color} onChange={(v) => onUpdate("eye_color", v)} />;
    case "body_type":
      return <BodyTypeChoices value={config.body_type} onChange={(v) => onUpdate("body_type", v)} />;
    case "height":
      return (
        <ProportionChoices
          presets={HEIGHT_PRESETS}
          value={config.height_cm}
          onChange={(v) => onUpdate("height_cm", v)}
        />
      );
    case "bust":
      return (
        <ProportionChoices presets={BUST_PRESETS} value={config.bust} onChange={(v) => onUpdate("bust", v)} />
      );
    case "waist":
      return (
        <ProportionChoices presets={WAIST_PRESETS} value={config.waist} onChange={(v) => onUpdate("waist", v)} />
      );
    case "hips":
      return (
        <ProportionChoices presets={HIP_PRESETS} value={config.hips} onChange={(v) => onUpdate("hips", v)} />
      );
    case "scene":
      return <SceneChoices value={config.scene_preset} onChange={(v) => onUpdate("scene_preset", v)} />;
    case "bio":
      return (
        <Textarea
          rows={4}
          value={config.bio}
          onChange={(e) => onUpdate("bio", e.target.value)}
          placeholder="A short tagline or backstory…"
          className="text-base rounded-2xl bg-input/50 border-border/70 resize-none focus-visible:ring-primary/40 min-h-[140px]"
        />
      );
    case "review":
      return <WizardReview config={config} />;
    default:
      return null;
  }
}
