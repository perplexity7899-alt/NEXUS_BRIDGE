
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id TEXT NOT NULL UNIQUE,
  active_content_url TEXT,
  content_type TEXT CHECK (content_type IN ('image','pdf','link')),
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Public insert sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update sessions" ON public.sessions FOR UPDATE USING (true);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER sessions_touch BEFORE UPDATE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER TABLE public.sessions REPLICA IDENTITY FULL;

INSERT INTO storage.buckets (id, name, public) VALUES ('nexus', 'nexus', true);

CREATE POLICY "Public read nexus" ON storage.objects FOR SELECT USING (bucket_id = 'nexus');
CREATE POLICY "Public upload nexus" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'nexus');
