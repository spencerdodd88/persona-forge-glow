import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreateWizard } from "@/components/influencer/wizard/CreateWizard";
import { LivePreview } from "@/components/influencer/LivePreview";
import { generatePreview } from "@/lib/generatePreview.functions";
import { buildInfluencerPrompt } from "@/lib/influencerPrompt";
import { DEFAULT_CONFIG, type InfluencerConfig, buildCharacterSummary, configPreviewSeed } from "@/components/influencer/types";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({ meta: [{ title: "Create Influencer · GenFluence" }] }),
  component: CreatePage,
});

const SLIDER_KEYS: (keyof InfluencerConfig)[] = ["age", "height_cm", "bust", "waist", "hips"];

/** Sliders wait for drag pause; dropdowns/scene picks regenerate quickly. */
function generationDebounceMs(prev: InfluencerConfig, next: InfluencerConfig): number {
  const changed = (Object.keys(next) as (keyof InfluencerConfig)[]).filter((k) => prev[k] !== next[k]);
  if (changed.length === 0) return 400;
  const sliderOnly = changed.every((k) => SLIDER_KEYS.includes(k));
  return sliderOnly ? 1400 : 400;
}

function CreatePage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<InfluencerConfig>(DEFAULT_CONFIG);
  const [generationConfig, setGenerationConfig] = useState<InfluencerConfig>(DEFAULT_CONFIG);
  const [pose, setPose] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState(0);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [aiFinal, setAiFinal] = useState(false);
  const requestIdRef = useRef(0);
  const hasAiRef = useRef(false);
  const prevGenerationConfigRef = useRef<InfluencerConfig | null>(null);
  const prevConfigRef = useRef(config);

  useEffect(() => {
    const prev = prevConfigRef.current;
    const delay = generationDebounceMs(prev, config);
    prevConfigRef.current = config;
    const t = setTimeout(() => setGenerationConfig(config), delay);
    return () => clearTimeout(t);
  }, [config]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setGenerating(true);
    setAiFinal(false);

    const prompt = buildInfluencerPrompt(generationConfig) + ` Pose variation ${pose + 1}.`;

    const payload = {
      prompt,
      seed: configPreviewSeed(generationConfig, pose),
      nsfw: generationConfig.nsfw,
    };

    (async () => {
      try {
        let url: string;
        try {
          const result = await generatePreview({ data: payload });
          url = result.url;
        } catch (fnErr) {
          console.warn("generatePreview server fn failed, trying API route", fnErr);
          const { fetchPreview } = await import("@/lib/fetchPreview");
          url = await fetchPreview("/api/generate-preview", payload);
        }

        if (requestId !== requestIdRef.current) return;
        setAiImage(url);
        setAiFinal(true);
        hasAiRef.current = true;
        prevGenerationConfigRef.current = generationConfig;
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("AI preview failed", err);
        const msg = err instanceof Error ? err.message : "Preview generation failed";
        if (hasAiRef.current) {
          toast.error(`Update failed — showing last preview. ${msg}`, {
            id: "preview-gen-error",
            duration: 4000,
          });
        } else {
          toast.error(msg, { id: "preview-gen-error", duration: 6000 });
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setVersion((v) => v + 1);
          setGenerating(false);
        }
      }
    })();
  }, [generationConfig, pose]);

  const cyclePose = () => setPose((p) => (p + 1) % 3);

  const update = <K extends keyof InfluencerConfig>(key: K, value: InfluencerConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const save = async () => {
    if (!config.name.trim()) return toast.error("Add a name before saving.");
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setSaving(false);
      return toast.error("Not signed in");
    }
    const { gender_presentation: _gender, ...dbFields } = config;
    const { error } = await supabase.from("influencers").insert({ ...dbFields, user_id: u.user.id });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`${config.name} added to your roster.`);
    navigate({ to: "/my-influencers" });
  };

  const summary = useMemo(() => buildCharacterSummary(config), [config]);

  return (
    <div className="min-h-full bg-gradient-to-b from-background via-background to-secondary/20">
      <div className="px-5 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10 max-w-[1480px] mx-auto animate-fade-up">
        <header className="mb-6 sm:mb-8 lg:mb-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary/80 font-medium">New influencer</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mt-2">
            Create your <span className="text-gradient-gold">influencer</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] xl:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] gap-8 lg:gap-10 xl:gap-12 items-start">
          {/* Mobile: preview first; desktop: wizard left */}
          <div className="order-2 lg:order-1 min-w-0">
            <div className="wizard-panel glass-card rounded-2xl border-primary/10 p-5 sm:p-7 lg:p-8 shadow-[var(--shadow-soft)]">
              <CreateWizard config={config} onUpdate={update} onSave={save} saving={saving} />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <LivePreview
              config={config}
              renderedConfig={config}
              pose={pose}
              renderedPose={pose}
              aiImage={aiImage}
              aiFinal={aiFinal}
              generating={generating}
              version={version}
              summary={summary}
              onCyclePose={cyclePose}
              variant="wizard"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
