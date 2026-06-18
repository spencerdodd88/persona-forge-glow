import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  type BodyType,
  type GenderPresentation,
  type InfluencerConfig,
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
  chestLabel,
} from "./types";

type Props = {
  config: InfluencerConfig;
  onUpdate: <K extends keyof InfluencerConfig>(key: K, value: InfluencerConfig[K]) => void;
};

export function CharacterBuilderControls({ config, onUpdate }: Props) {
  return (
    <div className="builder-panel glass-card rounded-2xl overflow-hidden border-primary/10 shadow-[var(--shadow-soft)]">
      <Tabs defaultValue="identity" className="flex flex-col">
        <div className="px-5 pt-5 pb-0 border-b border-border/50 bg-gradient-to-b from-background/40 to-transparent">
          <TabsList className="w-full h-auto p-1 bg-secondary/50 rounded-xl grid grid-cols-4 gap-0.5">
            {[
              { value: "identity", label: "Identity" },
              { value: "appearance", label: "Look" },
              { value: "body", label: "Body" },
              { value: "scene", label: "Scene" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg py-2 text-[11px] uppercase tracking-[0.12em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="p-5 md:p-6 max-h-[calc(100vh-220px)] overflow-y-auto builder-scroll">
          <TabsContent value="identity" className="mt-0 space-y-6 animate-fade-up">
            <Field label="Presentation">
              <GenderPicker
                value={config.gender_presentation ?? "Female"}
                onChange={(v) => onUpdate("gender_presentation", v)}
              />
            </Field>
            <Field label="Character name">
              <Input
                value={config.name}
                onChange={(e) => onUpdate("name", e.target.value)}
                placeholder="e.g. Alex, River, Nova…"
                className="h-11 bg-input/50 border-border/70 focus-visible:ring-primary/40"
              />
            </Field>
            <Field label="Age" hint={`${config.age} years`}>
              <BuilderSlider
                value={[config.age]}
                min={18}
                max={45}
                step={1}
                onValueChange={([v]) => onUpdate("age", v)}
              />
            </Field>
            <Field label="Bio" hint="Optional">
              <Textarea
                rows={3}
                value={config.bio}
                onChange={(e) => onUpdate("bio", e.target.value)}
                placeholder="A short tagline or backstory for this persona…"
                className="bg-input/50 border-border/70 resize-none focus-visible:ring-primary/40"
              />
            </Field>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0 space-y-6 animate-fade-up">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ethnicity">
                <SelectField value={config.ethnicity} options={ETHNICITIES} onChange={(v) => onUpdate("ethnicity", v)} />
              </Field>
              <Field label="Skin tone">
                <ColorSelect
                  value={config.skin_tone}
                  options={SKIN_TONES}
                  colors={SKIN_HEX}
                  onChange={(v) => onUpdate("skin_tone", v)}
                />
              </Field>
            </div>

            <Field label="Hair color">
              <ColorSelect
                value={config.hair_color}
                options={HAIR_COLORS}
                colors={HAIR_HEX}
                onChange={(v) => onUpdate("hair_color", v)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Hair length">
                <SelectField value={config.hair_length} options={HAIR_LENGTHS} onChange={(v) => onUpdate("hair_length", v)} />
              </Field>
              <Field label="Hair style">
                <SelectField value={config.hair_style} options={HAIR_STYLES} onChange={(v) => onUpdate("hair_style", v)} />
              </Field>
            </div>

            <Field label="Eye color">
              <ColorSelect
                value={config.eye_color}
                options={EYE_COLORS}
                colors={EYE_HEX}
                onChange={(v) => onUpdate("eye_color", v)}
              />
            </Field>
          </TabsContent>

          <TabsContent value="body" className="mt-0 space-y-6 animate-fade-up">
            <Field label="Body type">
              <BodyTypePicker value={config.body_type} onChange={(v) => onUpdate("body_type", v)} />
            </Field>

            <Field label="Height" hint={`${config.height_cm} cm`}>
              <BuilderSlider
                value={[config.height_cm]}
                min={150}
                max={190}
                step={1}
                onValueChange={([v]) => onUpdate("height_cm", v)}
              />
            </Field>

            <div className="rounded-xl border border-border/60 bg-secondary/20 p-4 space-y-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-medium">Proportions</p>
              <Field label={chestLabel(config.gender_presentation)} hint={`${config.bust} cm`}>
                <BuilderSlider value={[config.bust]} min={70} max={120} step={1} onValueChange={([v]) => onUpdate("bust", v)} />
              </Field>
              <Field label="Waist" hint={`${config.waist} cm`}>
                <BuilderSlider value={[config.waist]} min={55} max={90} step={1} onValueChange={([v]) => onUpdate("waist", v)} />
              </Field>
              <Field label="Hips" hint={`${config.hips} cm`}>
                <BuilderSlider value={[config.hips]} min={75} max={120} step={1} onValueChange={([v]) => onUpdate("hips", v)} />
              </Field>
            </div>
          </TabsContent>

          <TabsContent value="scene" className="mt-0 space-y-6 animate-fade-up">
            <Field label="Scene preset">
              <ScenePicker value={config.scene_preset} onChange={(v) => onUpdate("scene_preset", v)} />
            </Field>

            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/25 px-4 py-4">
              <div className="pr-4">
                <div className="text-sm font-medium">Mature content mode</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Stored on the profile. Off by default.
                </div>
              </div>
              <Switch checked={config.nsfw} onCheckedChange={(v) => onUpdate("nsfw", v)} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">{label}</Label>
        {hint && <span className="text-xs text-primary/90 tabular-nums shrink-0">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function BuilderSlider(props: React.ComponentProps<typeof Slider>) {
  return <Slider {...props} className={cn("builder-slider py-1", props.className)} />;
}

function SelectField({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 bg-input/50 border-border/70 focus:ring-primary/40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ColorSelect({
  value,
  options,
  colors,
  onChange,
}: {
  value: string;
  options: readonly string[];
  colors: Record<string, string>;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 bg-input/50 border-border/70 focus:ring-primary/40">
        <span className="flex items-center gap-2.5">
          <ColorDot color={colors[value] ?? "#ccc"} />
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            <span className="flex items-center gap-2.5">
              <ColorDot color={colors[o] ?? "#ccc"} />
              {o}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-3.5 h-3.5 rounded-full ring-1 ring-border/80 shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}

const BODY_HINTS: Record<BodyType, string> = {
  Slim: "Lean silhouette",
  Athletic: "Toned & defined",
  Curvy: "Full figure",
};

function GenderPicker({
  value,
  onChange,
}: {
  value: GenderPresentation;
  onChange: (v: GenderPresentation) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {GENDER_OPTIONS.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-xl border px-3 py-3 text-center transition-all duration-200",
              active
                ? "border-primary/50 bg-primary/8 text-primary font-medium shadow-[inset_0_0_0_1px_oklch(0.74_0.11_80/0.25)]"
                : "border-border/60 bg-input/30 text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            <span className="text-sm">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

function BodyTypePicker({ value, onChange }: { value: BodyType; onChange: (v: BodyType) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {BODY_TYPES.map((type) => {
        const active = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              "relative rounded-xl border px-4 py-3 text-left transition-all duration-200",
              active
                ? "border-primary/50 bg-primary/8 shadow-[inset_0_0_0_1px_oklch(0.74_0.11_80/0.25)]"
                : "border-border/60 bg-input/30 hover:border-primary/30 hover:bg-input/50",
            )}
          >
            <div className={cn("text-sm font-medium", active && "text-primary")}>{type}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{BODY_HINTS[type]}</div>
            {active && <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}

function ScenePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SCENES.map((scene) => {
        const active = value === scene;
        return (
          <button
            key={scene}
            type="button"
            onClick={() => onChange(scene)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-200",
              active
                ? "border-primary/50 bg-primary/8 text-primary font-medium"
                : "border-border/60 bg-input/30 text-muted-foreground hover:border-primary/25 hover:text-foreground",
            )}
          >
            {scene}
          </button>
        );
      })}
    </div>
  );
}
