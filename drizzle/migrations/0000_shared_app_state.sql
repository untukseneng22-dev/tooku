CREATE TABLE public.app_state (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.app_state TO anon, authenticated;
GRANT ALL ON public.app_state TO service_role;
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read shared state" ON public.app_state FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert shared state" ON public.app_state FOR INSERT TO anon, authenticated WITH CHECK (key IN ('products','reviews','orders','users','shippingConfigs','productReviews','flashSales','vouchers','points','reports','notifs','schoolEdits','campaigns','campaignJoins'));
CREATE POLICY "update shared state" ON public.app_state FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (key IN ('products','reviews','orders','users','shippingConfigs','productReviews','flashSales','vouchers','points','reports','notifs','schoolEdits','campaigns','campaignJoins'));
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_state;