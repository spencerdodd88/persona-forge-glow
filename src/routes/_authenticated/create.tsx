import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CharacterBuilderControls } from "@/components/influencer/CharacterBuilderControls";
import { LivePreview } from "@/components/influencer/LivePreview";
import { generatePreview } from "@/lib/generatePreview.functions";
import { buildInfluencerPrompt } from "@/lib/influencerPrompt";
import { DEFAULT_CONFIG, type InfluencerConfig, buildCharacterSummary, configPreviewSeed } from "@/components/influencer/types";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({ meta: [{ title: "Character Builder · GenFluence" }] }),
  component: CreatePage,
});

/** Wait until the user pauses before firing Replicate (avoids spam while dragging sliders). */
const GENERATION_DEBOUNCE_MS = 1400;

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

  // Debounce config → generationConfig so sliders don't spam Replicate mid-drag
  useEffect(() => {
    const t = setTimeout(() => setGenerationConfig(config), GENERATION_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [config]);

  // Replicate generation — runs on debounced config + pose changes
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
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("AI preview failed", err);
        const msg = err instanceof Error ? err.message : "Preview generation failed";
        // Keep last AI image on screen — only toast (no Lovable static fallback)
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
      <div className="px-6 md:px-10 lg:px-12 py-8 md:py-10 max-w-[1680px] mx-auto animate-fade-up">
        <header className="flex items-end justify-between flex-wrap gap-6 mb-10 md:mb-12">
          <div className="space-y-2 max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-primary/80 font-medium">Character Builder</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.08]">
              Create your <span className="text-gradient-gold">influencer</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed pt-1">
              Design a unique AI persona with precise controls. Preview updates live as you refine each detail.
            </p>
          </div>
          <Button
            onClick={save}
            disabled={saving}
            className="h-12 px-8 rounded-xl bg-gradient-luxe text-primary-foreground border-0 hover:opacity-90 shadow-[var(--shadow-soft)]"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save character
          </Button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] gap-8 xl:gap-12 items-start">
          <CharacterBuilderControls config={config} onUpdate={update} />

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
          />
        </div>
      </div>
    </div>
  );
}
