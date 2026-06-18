import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  type BodyType,
  type GenderPresentation,
  ETHNICITIES,
  SKIN_TONES,
  HAIR_COLORS,
  HAIR_LENGTHS,
  HAIR_STYLES,
  EYE_COLORS,
  BODY_TYPES,
  GENDER_OPTIONS,
  SCENES,
  SKIN_HEX,
  HAIR_HEX,
  EYE_HEX,
  SCENE_BG,
} from "../types";
import { AGE_OPTIONS, type ProportionPreset } from "./wizardSteps";
import { Shield, Sparkles } from "lucide-react";

type CardProps = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
};

export function ChoiceCard({ active, onClick, children, className }: CardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "wizard-choice-card text-left transition-all duration-200",
        active && "wizard-choice-card-active",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ContentModeChoices({
  value,
  chosen,
  onChange,
}: {
  value: boolean;
  chosen: boolean;
  onChange: (nsfw: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <ChoiceCard active={chosen && !value} onClick={() => onChange(false)} className="p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-display text-xl sm:text-2xl text-foreground">No</p>
            <p className="text-sm text-muted-foreground mt-1">SFW Influencer</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Fashion, lifestyle, and brand-safe content only.
          </p>
        </div>
      </ChoiceCard>
      <ChoiceCard active={chosen && value} onClick={() => onChange(true)} className="p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="font-display text-xl sm:text-2xl text-foreground">Yes</p>
            <p className="text-sm text-muted-foreground mt-1">NSFW Influencer</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Mature glamour content with safety controls enabled.
          </p>
        </div>
      </ChoiceCard>
    </div>
  );
}

export function GenderChoices({
  value,
  onChange,
}: {
  value: GenderPresentation;
  onChange: (v: GenderPresentation) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {GENDER_OPTIONS.map((option) => (
        <ChoiceCard key={option} active={value === option} onClick={() => onChange(option)} className="p-4 text-center">
          <span className="text-sm font-medium">{option}</span>
        </ChoiceCard>
      ))}
    </div>
  );
}

export function AgeChoices({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {AGE_OPTIONS.map((age) => (
        <ChoiceCard key={age} active={value === age} onClick={() => onChange(age)} className="p-5 text-center">
          <span className="font-display text-2xl tabular-nums">{age}</span>
          <span className="block text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">years</span>
        </ChoiceCard>
      ))}
    </div>
  );
}

export function TextChoices({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  columns?: 2 | 3;
}) {
  return (
    <div className={cn("grid gap-3", columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2")}>
      {options.map((option) => (
        <ChoiceCard key={option} active={value === option} onClick={() => onChange(option)} className="px-4 py-3.5">
          <span className="text-sm font-medium">{option}</span>
        </ChoiceCard>
      ))}
    </div>
  );
}

export function EthnicityChoices({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <TextChoices options={ETHNICITIES} value={value} onChange={onChange} columns={2} />;
}

export function HairLengthChoices({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <TextChoices options={HAIR_LENGTHS} value={value} onChange={onChange} columns={2} />;
}

export function HairStyleChoices({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <TextChoices options={HAIR_STYLES} value={value} onChange={onChange} columns={2} />;
}

export function ColorSwatchGrid({
  options,
  colors,
  value,
  onChange,
}: {
  options: readonly string[];
  colors: Record<string, string>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {options.map((option) => {
        const active = value === option;
        const hex = colors[option] ?? "#ccc";
        return (
          <ChoiceCard key={option} active={active} onClick={() => onChange(option)} className="p-3">
            <div className="flex flex-col items-center gap-2.5">
              <span
                className={cn(
                  "w-12 h-12 rounded-full ring-2 transition-all",
                  active ? "ring-primary scale-105" : "ring-border/60",
                )}
                style={{ backgroundColor: hex }}
              />
              <span className="text-xs font-medium text-center">{option}</span>
            </div>
          </ChoiceCard>
        );
      })}
    </div>
  );
}

export function SkinToneChoices(props: { value: string; onChange: (v: string) => void }) {
  return <ColorSwatchGrid options={SKIN_TONES} colors={SKIN_HEX} {...props} />;
}

export function HairColorChoices(props: { value: string; onChange: (v: string) => void }) {
  return <ColorSwatchGrid options={HAIR_COLORS} colors={HAIR_HEX} {...props} />;
}

export function EyeColorChoices(props: { value: string; onChange: (v: string) => void }) {
  return <ColorSwatchGrid options={EYE_COLORS} colors={EYE_HEX} {...props} />;
}

const BODY_HINTS: Record<BodyType, string> = {
  Slim: "Lean silhouette",
  Athletic: "Toned & defined",
  Curvy: "Full figure",
};

export function BodyTypeChoices({ value, onChange }: { value: BodyType; onChange: (v: BodyType) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {BODY_TYPES.map((type) => (
        <ChoiceCard key={type} active={value === type} onClick={() => onChange(type)} className="p-5">
          <p className="text-sm font-medium">{type}</p>
          <p className="text-xs text-muted-foreground mt-1">{BODY_HINTS[type]}</p>
        </ChoiceCard>
      ))}
    </div>
  );
}

export function ProportionChoices({
  presets,
  value,
  onChange,
}: {
  presets: ProportionPreset[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {presets.map((preset) => (
        <ChoiceCard
          key={preset.label}
          active={value === preset.value}
          onClick={() => onChange(preset.value)}
          className="p-4"
        >
          <p className="text-sm font-medium">{preset.label}</p>
          <p className="text-xs text-muted-foreground mt-1">{preset.hint}</p>
        </ChoiceCard>
      ))}
    </div>
  );
}

export function SceneChoices({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {SCENES.map((scene) => {
        const gradient = SCENE_BG[scene];
        const active = value === scene;
        return (
          <ChoiceCard key={scene} active={active} onClick={() => onChange(scene)} className="overflow-hidden p-0">
            <div
              className="h-16 w-full"
              style={{
                background: gradient
                  ? `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]}, ${gradient[2] ?? gradient[1]})`
                  : undefined,
              }}
            />
            <div className="px-3 py-3">
              <span className="text-sm font-medium">{scene}</span>
            </div>
          </ChoiceCard>
        );
      })}
    </div>
  );
}
