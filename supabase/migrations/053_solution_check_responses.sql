-- Migration 053: solution_check_responses
-- Antworten des Lösungs-Checks auf der Landingpage (B2B-Prospects: Installateure/Agenturen).
-- Zweck: Founder-Learning (welche Schmerzen brennen am häufigsten?) + Lead-Pipeline.
-- Anonymer Insert (Check läuft ohne Login). Lesen nur authed/Service-Role (Dashboard).

CREATE TABLE IF NOT EXISTS public.solution_check_responses (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role               text,
  answers            jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommended_module text,
  name               text,
  email              text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.solution_check_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon insert check" ON public.solution_check_responses;
CREATE POLICY "anon insert check"
  ON public.solution_check_responses
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "authed read check" ON public.solution_check_responses;
CREATE POLICY "authed read check"
  ON public.solution_check_responses
  FOR SELECT TO authenticated
  USING (true);
