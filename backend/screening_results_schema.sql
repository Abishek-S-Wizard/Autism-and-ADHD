-- ==========================================
-- 🗄️ SUPABASE SQL SCREENING SCHEMA (NO RLS)
-- ==========================================

-- Enable UI-OSSP extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 📋 TABLE: screening_results
CREATE TABLE IF NOT EXISTS public.screening_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL,
    answers JSONB,
    speech_data JSONB,
    camera_data JSONB,
    detection_type TEXT,
    result TEXT,
    severity TEXT,
    confidence FLOAT8,
    asd_score FLOAT8,
    adhd_score FLOAT8,
    secondary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ⚡ INDEX: for performance on patient_id
CREATE INDEX IF NOT EXISTS screening_results_patient_id_idx ON public.screening_results(patient_id);
