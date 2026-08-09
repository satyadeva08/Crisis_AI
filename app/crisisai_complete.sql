--
-- PostgreSQL database dump
--

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: resource_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.resource_status AS ENUM (
    'available',
    'assigned',
    'deployed',
    'completed'
);


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agent_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_tasks (
    task_id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    task_name character varying(255) NOT NULL,
    task_description text,
    task_type character varying(100),
    status character varying(30) DEFAULT 'pending'::character varying,
    priority integer DEFAULT 5,
    input_data jsonb,
    output_data jsonb,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    error_message text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT agent_tasks_priority_check CHECK (((priority >= 1) AND (priority <= 10))),
    CONSTRAINT agent_tasks_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'running'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: damage_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.damage_assessments (
    assessment_id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    image_id uuid,
    damage_type character varying(150),
    damage_description text,
    damage_percentage numeric(5,2),
    confidence_score numeric(5,2),
    detected_objects jsonb,
    affected_structures jsonb,
    model_name character varying(150),
    model_version character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT damage_assessments_confidence_score_check CHECK (((confidence_score >= (0)::numeric) AND (confidence_score <= (100)::numeric))),
    CONSTRAINT damage_assessments_damage_percentage_check CHECK (((damage_percentage >= (0)::numeric) AND (damage_percentage <= (100)::numeric)))
);


--
-- Name: data_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_sources (
    source_id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    source_type character varying(50) NOT NULL,
    source_name character varying(255),
    source_url text,
    file_path text,
    metadata jsonb,
    collection_time timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT data_sources_source_type_check CHECK (((source_type)::text = ANY ((ARRAY['image'::character varying, 'text_report'::character varying, 'gps'::character varying, 'sensor'::character varying])::text[])))
);


--
-- Name: disaster_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disaster_images (
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    source_id uuid,
    image_path text NOT NULL,
    image_url text,
    image_hash character varying(128),
    width integer,
    height integer,
    image_format character varying(20),
    captured_at timestamp with time zone,
    latitude numeric(9,6),
    longitude numeric(9,6),
    processing_status character varying(30) DEFAULT 'pending'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT disaster_images_latitude_check CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))),
    CONSTRAINT disaster_images_longitude_check CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))),
    CONSTRAINT disaster_images_processing_status_check CHECK (((processing_status)::text = ANY ((ARRAY['pending'::character varying, 'running'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: incidents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incidents (
    incident_id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    disaster_type character varying(100) NOT NULL,
    status character varying(30) DEFAULT 'reported'::character varying NOT NULL,
    severity_level character varying(20) DEFAULT 'low'::character varying NOT NULL,
    severity_score numeric(5,2),
    priority_score numeric(5,2),
    latitude numeric(9,6),
    longitude numeric(9,6),
    location_name character varying(255),
    affected_population integer,
    reported_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT incidents_affected_population_check CHECK ((affected_population >= 0)),
    CONSTRAINT incidents_latitude_check CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))),
    CONSTRAINT incidents_longitude_check CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))),
    CONSTRAINT incidents_priority_score_check CHECK (((priority_score >= (0)::numeric) AND (priority_score <= (100)::numeric))),
    CONSTRAINT incidents_severity_level_check CHECK (((severity_level)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))),
    CONSTRAINT incidents_severity_score_check CHECK (((severity_score >= (0)::numeric) AND (severity_score <= (100)::numeric))),
    CONSTRAINT incidents_status_check CHECK (((status)::text = ANY ((ARRAY['reported'::character varying, 'processing'::character varying, 'assessed'::character varying, 'active'::character varying, 'resolved'::character varying, 'closed'::character varying])::text[])))
);


--
-- Name: knowledge_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knowledge_documents (
    document_id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    document_type character varying(100),
    source character varying(500),
    content text NOT NULL,
    metadata jsonb,
    embedding_id character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: location_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.location_data (
    location_id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    latitude numeric(9,6) NOT NULL,
    longitude numeric(9,6) NOT NULL,
    altitude numeric(10,2),
    location_name character varying(255),
    accuracy_meters numeric(10,2),
    recorded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT location_data_latitude_check CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))),
    CONSTRAINT location_data_longitude_check CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric)))
);


--
-- Name: nlp_analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nlp_analysis (
    nlp_id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_id uuid NOT NULL,
    incident_id uuid NOT NULL,
    summary text,
    emergency_entities jsonb,
    locations jsonb,
    casualties jsonb,
    infrastructure_damage jsonb,
    required_resources jsonb,
    urgency_score numeric(5,2),
    confidence_score numeric(5,2),
    model_name character varying(150),
    model_version character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT nlp_analysis_confidence_score_check CHECK (((confidence_score >= (0)::numeric) AND (confidence_score <= (100)::numeric))),
    CONSTRAINT nlp_analysis_urgency_score_check CHECK (((urgency_score >= (0)::numeric) AND (urgency_score <= (100)::numeric)))
);


--
-- Name: processing_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.processing_jobs (
    job_id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    job_type character varying(100) NOT NULL,
    status character varying(30) DEFAULT 'pending'::character varying,
    model_name character varying(150),
    model_version character varying(50),
    input_data jsonb,
    output_data jsonb,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    processing_time_ms integer,
    error_message text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT processing_jobs_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'running'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recommendations (
    recommendation_id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    recommendation text NOT NULL,
    category character varying(100),
    priority integer,
    reasoning text,
    source_documents jsonb,
    confidence_score numeric(5,2),
    generated_by character varying(150),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT recommendations_confidence_score_check CHECK (((confidence_score >= (0)::numeric) AND (confidence_score <= (100)::numeric))),
    CONSTRAINT recommendations_priority_check CHECK (((priority >= 1) AND (priority <= 10)))
);


--
-- Name: resource_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_assignments (
    assignment_id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    resource_id uuid NOT NULL,
    quantity integer NOT NULL,
    assigned_by character varying(150),
    status character varying(30) DEFAULT 'assigned'::character varying,
    assigned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp with time zone,
    CONSTRAINT resource_assignments_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT resource_assignments_status_check CHECK (((status)::text = ANY ((ARRAY['assigned'::character varying, 'deployed'::character varying, 'completed'::character varying])::text[])))
);


--
-- Name: resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resources (
    resource_id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource_name character varying(255) NOT NULL,
    resource_type character varying(100) NOT NULL,
    quantity integer NOT NULL,
    available_quantity integer NOT NULL,
    location_name character varying(255),
    latitude numeric(9,6),
    longitude numeric(9,6),
    status character varying(30) DEFAULT 'available'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT resources_check CHECK (((available_quantity >= 0) AND (available_quantity <= quantity))),
    CONSTRAINT resources_latitude_check CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))),
    CONSTRAINT resources_longitude_check CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))),
    CONSTRAINT resources_quantity_check CHECK ((quantity >= 0)),
    CONSTRAINT resources_status_check CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'assigned'::character varying, 'deployed'::character varying, 'completed'::character varying])::text[])))
);


--
-- Name: safety_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.safety_alerts (
    alert_id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    alert_type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    severity_level character varying(20),
    status character varying(30) DEFAULT 'active'::character varying,
    latitude numeric(9,6),
    longitude numeric(9,6),
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT safety_alerts_alert_type_check CHECK (((alert_type)::text = ANY ((ARRAY['safety'::character varying, 'severity'::character varying, 'resource'::character varying, 'evacuation'::character varying, 'system'::character varying])::text[]))),
    CONSTRAINT safety_alerts_latitude_check CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))),
    CONSTRAINT safety_alerts_longitude_check CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))),
    CONSTRAINT safety_alerts_severity_level_check CHECK (((severity_level)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))),
    CONSTRAINT safety_alerts_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'acknowledged'::character varying, 'resolved'::character varying])::text[])))
);


--
-- Name: severity_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.severity_assessments (
    severity_id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    severity_level character varying(20) NOT NULL,
    severity_score numeric(5,2),
    confidence_score numeric(5,2),
    reasoning text,
    contributing_factors jsonb,
    model_name character varying(150),
    model_version character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT severity_assessments_confidence_score_check CHECK (((confidence_score >= (0)::numeric) AND (confidence_score <= (100)::numeric))),
    CONSTRAINT severity_assessments_severity_level_check CHECK (((severity_level)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))),
    CONSTRAINT severity_assessments_severity_score_check CHECK (((severity_score >= (0)::numeric) AND (severity_score <= (100)::numeric)))
);


--
-- Name: text_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.text_reports (
    report_id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_id uuid NOT NULL,
    source_id uuid,
    title character varying(255),
    report_text text NOT NULL,
    language character varying(20),
    extracted_entities jsonb,
    keywords jsonb,
    sentiment_score numeric(6,3),
    urgency_score numeric(5,2),
    processing_status character varying(30) DEFAULT 'pending'::character varying,
    reported_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT text_reports_processing_status_check CHECK (((processing_status)::text = ANY ((ARRAY['pending'::character varying, 'running'::character varying, 'completed'::character varying, 'failed'::character varying])::text[]))),
    CONSTRAINT text_reports_urgency_score_check CHECK (((urgency_score >= (0)::numeric) AND (urgency_score <= (100)::numeric)))
);


--
-- Data for Name: agent_tasks; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: damage_assessments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: data_sources; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: disaster_images; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: incidents; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.incidents (incident_id, title, description, disaster_type, status, severity_level, severity_score, priority_score, latitude, longitude, location_name, affected_population, reported_at, created_at, updated_at) VALUES ('0f36c1e0-4ba3-4e9a-b45c-d413f1e401ff', 'Flood Emergency', 'Severe flooding reported in the affected area.', 'Flood', 'reported', 'high', 82.50, 91.00, 17.385000, 78.486700, 'Hyderabad', 5000, '2026-08-08 18:50:41.333115+05:30', '2026-08-08 18:50:41.333115+05:30', '2026-08-08 18:50:41.333115+05:30');


--
-- Data for Name: knowledge_documents; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: location_data; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: nlp_analysis; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: processing_jobs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: recommendations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: resource_assignments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: safety_alerts; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: severity_assessments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: text_reports; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: agent_tasks agent_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_tasks
    ADD CONSTRAINT agent_tasks_pkey PRIMARY KEY (task_id);


--
-- Name: damage_assessments damage_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.damage_assessments
    ADD CONSTRAINT damage_assessments_pkey PRIMARY KEY (assessment_id);


--
-- Name: data_sources data_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_sources
    ADD CONSTRAINT data_sources_pkey PRIMARY KEY (source_id);


--
-- Name: disaster_images disaster_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disaster_images
    ADD CONSTRAINT disaster_images_pkey PRIMARY KEY (image_id);


--
-- Name: incidents incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_pkey PRIMARY KEY (incident_id);


--
-- Name: knowledge_documents knowledge_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_documents
    ADD CONSTRAINT knowledge_documents_pkey PRIMARY KEY (document_id);


--
-- Name: location_data location_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_data
    ADD CONSTRAINT location_data_pkey PRIMARY KEY (location_id);


--
-- Name: nlp_analysis nlp_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nlp_analysis
    ADD CONSTRAINT nlp_analysis_pkey PRIMARY KEY (nlp_id);


--
-- Name: processing_jobs processing_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processing_jobs
    ADD CONSTRAINT processing_jobs_pkey PRIMARY KEY (job_id);


--
-- Name: recommendations recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT recommendations_pkey PRIMARY KEY (recommendation_id);


--
-- Name: resource_assignments resource_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_assignments
    ADD CONSTRAINT resource_assignments_pkey PRIMARY KEY (assignment_id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (resource_id);


--
-- Name: safety_alerts safety_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safety_alerts
    ADD CONSTRAINT safety_alerts_pkey PRIMARY KEY (alert_id);


--
-- Name: severity_assessments severity_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.severity_assessments
    ADD CONSTRAINT severity_assessments_pkey PRIMARY KEY (severity_id);


--
-- Name: text_reports text_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.text_reports
    ADD CONSTRAINT text_reports_pkey PRIMARY KEY (report_id);


--
-- Name: idx_agent_tasks_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agent_tasks_incident ON public.agent_tasks USING btree (incident_id);


--
-- Name: idx_agent_tasks_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agent_tasks_status ON public.agent_tasks USING btree (status);


--
-- Name: idx_alerts_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerts_incident ON public.safety_alerts USING btree (incident_id);


--
-- Name: idx_alerts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerts_status ON public.safety_alerts USING btree (status);


--
-- Name: idx_damage_image; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_damage_image ON public.damage_assessments USING btree (image_id);


--
-- Name: idx_damage_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_damage_incident ON public.damage_assessments USING btree (incident_id);


--
-- Name: idx_data_sources_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_data_sources_incident ON public.data_sources USING btree (incident_id);


--
-- Name: idx_data_sources_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_data_sources_type ON public.data_sources USING btree (source_type);


--
-- Name: idx_images_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_images_incident ON public.disaster_images USING btree (incident_id);


--
-- Name: idx_images_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_images_status ON public.disaster_images USING btree (processing_status);


--
-- Name: idx_incidents_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_created ON public.incidents USING btree (created_at DESC);


--
-- Name: idx_incidents_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_location ON public.incidents USING btree (latitude, longitude);


--
-- Name: idx_incidents_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_priority ON public.incidents USING btree (priority_score DESC);


--
-- Name: idx_incidents_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_severity ON public.incidents USING btree (severity_level);


--
-- Name: idx_incidents_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_status ON public.incidents USING btree (status);


--
-- Name: idx_locations_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_locations_incident ON public.location_data USING btree (incident_id);


--
-- Name: idx_nlp_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nlp_incident ON public.nlp_analysis USING btree (incident_id);


--
-- Name: idx_processing_jobs_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_processing_jobs_incident ON public.processing_jobs USING btree (incident_id);


--
-- Name: idx_processing_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_processing_jobs_status ON public.processing_jobs USING btree (status);


--
-- Name: idx_recommendations_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recommendations_incident ON public.recommendations USING btree (incident_id);


--
-- Name: idx_reports_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_incident ON public.text_reports USING btree (incident_id);


--
-- Name: idx_reports_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_status ON public.text_reports USING btree (processing_status);


--
-- Name: idx_resource_assignments_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resource_assignments_incident ON public.resource_assignments USING btree (incident_id);


--
-- Name: idx_resources_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resources_status ON public.resources USING btree (status);


--
-- Name: idx_severity_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_severity_incident ON public.severity_assessments USING btree (incident_id);


--
-- Name: incidents update_incidents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: resources update_resources_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: agent_tasks fk_agent_incident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_tasks
    ADD CONSTRAINT fk_agent_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(incident_id) ON DELETE CASCADE;


--
-- Name: safety_alerts fk_alert_incident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safety_alerts
    ADD CONSTRAINT fk_alert_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(incident_id) ON DELETE CASCADE;


--
-- Name: resource_assignments fk_assignment_incident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_assignments
    ADD CONSTRAINT fk_assignment_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(incident_id) ON DELETE CASCADE;


--
-- Name: resource_assignments fk_assignment_resource; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_assignments
    ADD CONSTRAINT fk_assignment_resource FOREIGN KEY (resource_id) REFERENCES public.resources(resource_id) ON DELETE CASCADE;


--
-- Name: damage_assessments fk_damage_image; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.damage_assessments
    ADD CONSTRAINT fk_damage_image FOREIGN KEY (image_id) REFERENCES public.disaster_images(image_id) ON DELETE SET NULL;


--
-- Name: damage_assessments fk_damage_incident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.damage_assessments
    ADD CONSTRAINT fk_damage_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(incident_id) ON DELETE CASCADE;


--
-- Name: disaster_images fk_image_incident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disaster_images
    ADD CONSTRAINT fk_image_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(incident_id) ON DELETE CASCADE;


--
-- Name: disaster_images fk_image_source; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disaster_images
    ADD CONSTRAINT fk_image_source FOREIGN KEY (source_id) REFERENCES public.data_sources(source_id) ON DELETE SET NULL;


--
-- Name: processing_jobs fk_job_incident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processing_jobs
    ADD CONSTRAINT fk_job_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(incident_id) ON DELETE CASCADE;


--
-- Name: location_data fk_location_incident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_data
    ADD CONSTRAINT fk_location_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(incident_id) ON DELETE CASCADE;


--
-- Name: nlp_analysis fk_nlp_incident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nlp_analysis
    ADD CONSTRAINT fk_nlp_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(incident_id) ON DELETE CASCADE;


--
-- Name: nlp_analysis fk_nlp_report; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nlp_analysis
    ADD CONSTRAINT fk_nlp_report FOREIGN KEY (report_id) REFERENCES public.text_reports(report_id) ON DELETE CASCADE;


--
-- Name: recommendations fk_recommendation_incident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT fk_recommendation_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(incident_id) ON DELETE CASCADE;


--
-- Name: text_reports fk_report_incident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.text_reports
    ADD CONSTRAINT fk_report_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(incident_id) ON DELETE CASCADE;


--
-- Name: text_reports fk_report_source; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.text_reports
    ADD CONSTRAINT fk_report_source FOREIGN KEY (source_id) REFERENCES public.data_sources(source_id) ON DELETE SET NULL;


--
-- Name: severity_assessments fk_severity_incident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.severity_assessments
    ADD CONSTRAINT fk_severity_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(incident_id) ON DELETE CASCADE;


--
-- Name: data_sources fk_source_incident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_sources
    ADD CONSTRAINT fk_source_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(incident_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

--
