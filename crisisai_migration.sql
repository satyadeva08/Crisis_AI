-- ============================================================
-- CrisisAI — Database Migration
-- Run this AFTER the base schema (crisisai_complete.sql)
-- to add columns and tables needed by the frontend.
-- ============================================================

-- 1. Add missing columns to the incidents table
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS reported_by VARCHAR(255);
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);

-- 2. Fix the status constraint to include 'in-progress' (used by frontend)
ALTER TABLE public.incidents DROP CONSTRAINT IF EXISTS incidents_status_check;
ALTER TABLE public.incidents ADD CONSTRAINT incidents_status_check
  CHECK (status IN ('reported','processing','assessed','active','in-progress','resolved','closed'));

-- 3. Create the incident_updates table (activity timeline)
CREATE TABLE IF NOT EXISTS public.incident_updates (
    update_id UUID DEFAULT gen_random_uuid() NOT NULL,
    incident_id UUID NOT NULL,
    update_text TEXT NOT NULL,
    update_time VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT incident_updates_pkey PRIMARY KEY (update_id),
    CONSTRAINT fk_update_incident FOREIGN KEY (incident_id)
        REFERENCES public.incidents(incident_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_updates_incident
    ON public.incident_updates USING btree (incident_id);

-- 4. Remove dummy seed data (the one hardcoded row in crisisai_complete.sql)
DELETE FROM public.incidents WHERE incident_id = '0f36c1e0-4ba3-4e9a-b45c-d413f1e401ff';

-- 5. Enable Row Level Security on key tables (Supabase best practice)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disaster_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.severity_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.text_reports ENABLE ROW LEVEL SECURITY;

-- 6. Create permissive policies for anon access (hackathon demo — tighten for production)
-- Allow anyone to read incidents
CREATE POLICY IF NOT EXISTS "Allow public read incidents"
    ON public.incidents FOR SELECT
    USING (true);

-- Allow anyone to insert incidents (user report submission)
CREATE POLICY IF NOT EXISTS "Allow public insert incidents"
    ON public.incidents FOR INSERT
    WITH CHECK (true);

-- Allow anyone to update incidents (authority status changes)
CREATE POLICY IF NOT EXISTS "Allow public update incidents"
    ON public.incidents FOR UPDATE
    USING (true);

-- Allow public read on alerts
CREATE POLICY IF NOT EXISTS "Allow public read alerts"
    ON public.safety_alerts FOR SELECT
    USING (true);

-- Allow public read/insert on updates
CREATE POLICY IF NOT EXISTS "Allow public read updates"
    ON public.incident_updates FOR SELECT
    USING (true);

CREATE POLICY IF NOT EXISTS "Allow public insert updates"
    ON public.incident_updates FOR INSERT
    WITH CHECK (true);

-- Allow public read on images
CREATE POLICY IF NOT EXISTS "Allow public read images"
    ON public.disaster_images FOR SELECT
    USING (true);

CREATE POLICY IF NOT EXISTS "Allow public insert images"
    ON public.disaster_images FOR INSERT
    WITH CHECK (true);

-- Allow public read on severity assessments
CREATE POLICY IF NOT EXISTS "Allow public read severity"
    ON public.severity_assessments FOR SELECT
    USING (true);

-- Allow public read on recommendations
CREATE POLICY IF NOT EXISTS "Allow public read recommendations"
    ON public.recommendations FOR SELECT
    USING (true);

-- Allow public read/insert on text reports
CREATE POLICY IF NOT EXISTS "Allow public read reports"
    ON public.text_reports FOR SELECT
    USING (true);

CREATE POLICY IF NOT EXISTS "Allow public insert reports"
    ON public.text_reports FOR INSERT
    WITH CHECK (true);

-- Done. The database is now ready for the frontend.
