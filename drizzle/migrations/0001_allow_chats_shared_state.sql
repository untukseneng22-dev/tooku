DROP POLICY IF EXISTS "insert shared state" ON public.app_state;
DROP POLICY IF EXISTS "update shared state" ON public.app_state;

CREATE POLICY "insert shared state" ON public.app_state
  FOR INSERT TO anon, authenticated
  WITH CHECK (key IN ('products','reviews','orders','users','shippingConfigs','productReviews','flashSales','vouchers','points','reports','notifs','schoolEdits','campaigns','campaignJoins','chats'));

CREATE POLICY "update shared state" ON public.app_state
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (key IN ('products','reviews','orders','users','shippingConfigs','productReviews','flashSales','vouchers','points','reports','notifs','schoolEdits','campaigns','campaignJoins','chats'));