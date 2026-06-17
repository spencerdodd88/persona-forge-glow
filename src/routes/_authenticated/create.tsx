import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfluencerAvatar } from "@/components/influencer/InfluencerAvatar";
import {
  DEFAULT_CONFIG, type InfluencerConfig,
  ETHNICITIES, SKIN_TONES, HAIR_COLORS, HAIR_LENGTHS, HAIR_STYLES, EYE_COLORS, BODY_TYPES, SCENES,
} from "@/components/influencer/types";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({ meta: [{ title: "Create Influencer · GenFluence" }] }),
  component: CreatePage,
});

function CreatePage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<InfluencerConfig>(DEFAULT_CONFIG);
  const [renderedConfig, setRenderedConfig] = useState<InfluencerConfig>(DEFAULT_CONFIG);
  const [pose, setPose] = useState(0);
  const [renderedPose, setRenderedPose] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced "regeneration" — swap preview after a short pause for premium feel
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setGenerating(true);
    debounceRef.current = setTimeout(() => {
      setRenderedConfig(config);
      setRenderedPose(pose);
      setVersion((v) => v + 1);
      setGenerating(false);
    }, 550);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [config, pose]);

  const cyclePose = () => setPose((p) => (p + 1) % 3);


  const update = <K extends keyof InfluencerConfig>(key: K, value: InfluencerConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const save = async () => {
    if (!config.name.trim()) return toast.error("Give her a name first.");
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setSaving(false); return toast.error("Not signed in"); }
    const { error } = await supabase.from("influencers").insert({ ...config, user_id: u.user.id });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`${config.name} added to your roster.`);
    navigate({ to: "/my-influencers" });
  };

  const summary = useMemo(
    () => `${config.age}y · ${config.ethnicity} · ${config.hair_color} ${config.hair_length.toLowerCase()} hair · ${config.body_type.toLowerCase()} · ${config.scene_preset}`,
    [config],
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Studio</p>
          <h1 className="font-display text-4xl md:text-5xl mt-1">Create <span className="text-gradient-gold">Influencer</span></h1>
        </div>
        <Button onClick={save} disabled={saving} className="h-11 px-6 bg-gradient-luxe text-primary-foreground border-0 hover:opacity-90">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save influencer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,38%)_minmax(0,62%)] gap-6">
        {/* LEFT: form */}
        <div className="glass-card rounded-2xl p-5 md:p-6 space-y-7 max-h-[calc(100vh-180px)] overflow-y-auto">
          <Section title="Identity">
            <FieldRow>
              <Field label="Name">
                <Input value={config.name} onChange={(e) => update("name", e.target.value)} placeholder="Aria" className="bg-input/60" />
              </Field>
              <Field label="Age" hint={`${config.age}`}>
                <Slider value={[config.age]} min={18} max={45} step={1} onValueChange={([v]) => update("age", v)} />
              </Field>
            </FieldRow>
            <Field label="Bio">
              <Textarea rows={3} value={config.bio} onChange={(e) => update("bio", e.target.value)}
                placeholder="A short tagline or backstory…" className="bg-input/60 resize-none" />
            </Field>
          </Section>

          <Section title="Appearance">
            <FieldRow>
              <Field label="Ethnicity">
                <SelectField value={config.ethnicity} options={ETHNICITIES} onChange={(v) => update("ethnicity", v)} />
              </Field>
              <Field label="Skin tone">
                <SelectField value={config.skin_tone} options={SKIN_TONES} onChange={(v) => update("skin_tone", v)} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Hair color">
                <SelectField value={config.hair_color} options={HAIR_COLORS} onChange={(v) => update("hair_color", v)} />
              </Field>
              <Field label="Hair length">
                <SelectField value={config.hair_length} options={HAIR_LENGTHS} onChange={(v) => update("hair_length", v)} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Hair style">
                <SelectField value={config.hair_style} options={HAIR_STYLES} onChange={(v) => update("hair_style", v)} />
              </Field>
              <Field label="Eye color">
                <SelectField value={config.eye_color} options={EYE_COLORS} onChange={(v) => update("eye_color", v)} />
              </Field>
            </FieldRow>
          </Section>

          <Section title="Body">
            <Field label="Height" hint={`${config.height_cm} cm`}>
              <Slider value={[config.height_cm]} min={150} max={190} step={1} onValueChange={([v]) => update("height_cm", v)} />
            </Field>
            <FieldRow>
              <Field label="Bust" hint={`${config.bust}`}>
                <Slider value={[config.bust]} min={70} max={120} step={1} onValueChange={([v]) => update("bust", v)} />
              </Field>
              <Field label="Waist" hint={`${config.waist}`}>
                <Slider value={[config.waist]} min={55} max={90} step={1} onValueChange={([v]) => update("waist", v)} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Hips" hint={`${config.hips}`}>
                <Slider value={[config.hips]} min={75} max={120} step={1} onValueChange={([v]) => update("hips", v)} />
              </Field>
              <Field label="Body type">
                <SelectField value={config.body_type} options={BODY_TYPES} onChange={(v) => update("body_type", v as any)} />
              </Field>
            </FieldRow>
          </Section>

          <Section title="Scene & Mode">
            <Field label="Scene preset">
              <SelectField value={config.scene_preset} options={SCENES} onChange={(v) => update("scene_preset", v)} />
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 px-4 py-3">
              <div>
                <div className="text-sm font-medium">NSFW mode</div>
                <div className="text-xs text-muted-foreground">Stored on the profile. Disabled by default.</div>
              </div>
              <Switch checked={config.nsfw} onCheckedChange={(v) => update("nsfw", v)} />
            </div>
          </Section>
        </div>

        {/* RIGHT: large live preview */}
        <div className="sticky top-20 self-start flex flex-col items-center">
          <div
            className="relative w-full max-w-[580px] aspect-[4/5] rounded-[2rem] overflow-hidden bg-card
                       ring-1 ring-border
                       shadow-[0_40px_90px_-35px_rgba(70,55,30,0.35),0_8px_30px_-12px_rgba(70,55,30,0.18)]"
          >
            {/* Decorative inner gold frame */}
            <div className="pointer-events-none absolute inset-3 rounded-[1.6rem] border border-primary/30 z-10" />

            {/* Avatar layer */}
            <div key={version} className="absolute inset-0 animate-fade-up">
              <InfluencerAvatar config={renderedConfig} pose={renderedPose} animated />
            </div>

            {/* Generating overlay */}
            <div className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${generating ? "opacity-100" : "opacity-0"}`}>
              <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
              <div className="relative flex flex-col items-center gap-3 px-5 py-3 rounded-xl glass-card">
                <div className="flex items-center gap-2 text-primary">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="font-medium tracking-wide">Generating…</span>
                </div>
                <div className="h-1 w-32 rounded-full overflow-hidden bg-secondary/60">
                  <div className="h-full shimmer-bg" />
                </div>
              </div>
            </div>

            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-card text-[10px] uppercase tracking-[0.2em] text-primary">
              <Sparkles className="w-3 h-3" /> Preview
            </div>
            {config.nsfw && (
              <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full bg-accent/80 text-accent-foreground text-[10px] uppercase tracking-[0.2em] font-medium">NSFW</div>
            )}

            <button
              type="button"
              onClick={cyclePose}
              className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-xs text-foreground hover:text-primary hover-lift transition pointer-events-auto"
              aria-label="Regenerate pose"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Pose {pose + 1}/3
            </button>

            <div className="absolute bottom-4 left-4 z-20 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
              v{version}
            </div>
          </div>

          <div className="mt-5 w-full max-w-[560px] flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-display text-2xl truncate">{config.name || "Unnamed"}</div>
              <div className="text-sm text-muted-foreground mt-0.5 truncate">{summary}</div>
            </div>
            <div className="text-xs text-muted-foreground text-right shrink-0 uppercase tracking-[0.2em] mt-1">
              Live
            </div>
          </div>
          {config.bio && <p className="mt-3 w-full max-w-[560px] text-sm text-muted-foreground italic">"{config.bio}"</p>}
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.25em] text-primary/80 mb-3 font-medium">{title}</div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
        {hint && <span className="text-xs text-primary/80 tabular-nums">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SelectField({ value, options, onChange }: { value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-input/60"><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  );
}
