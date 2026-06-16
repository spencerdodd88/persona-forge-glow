
CREATE TABLE public.influencers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  age INT NOT NULL DEFAULT 24,
  ethnicity TEXT NOT NULL DEFAULT 'European',
  skin_tone TEXT NOT NULL DEFAULT 'Light',
  hair_color TEXT NOT NULL DEFAULT 'Brown',
  hair_length TEXT NOT NULL DEFAULT 'Long',
  hair_style TEXT NOT NULL DEFAULT 'Straight',
  eye_color TEXT NOT NULL DEFAULT 'Brown',
  height_cm INT NOT NULL DEFAULT 170,
  bust INT NOT NULL DEFAULT 90,
  waist INT NOT NULL DEFAULT 65,
  hips INT NOT NULL DEFAULT 95,
  body_type TEXT NOT NULL DEFAULT 'Athletic',
  nsfw BOOLEAN NOT NULL DEFAULT false,
  scene_preset TEXT NOT NULL DEFAULT 'Coffee Shop',
  preview_seed TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencers TO authenticated;
GRANT ALL ON public.influencers TO service_role;

ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own influencers"
  ON public.influencers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER influencers_set_updated_at
  BEFORE UPDATE ON public.influencers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
