CREATE TABLE IF NOT EXISTS public.incident_updates (
    update_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id uuid NOT NULL REFERENCES public.incidents(incident_id) ON DELETE CASCADE,
    update_text text NOT NULL,
    update_time character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
