-- ==============================================================================
-- SEEDING, SCHEMA PATCHES & RLS POLICIES
-- Run these queries inside your Supabase Dashboard SQL Editor to apply database fixes.
-- ==============================================================================

-- 1. Ensure the gender column exists with proper constraint
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male','female','other','prefer_not_to_say'));

-- 2. Seed the 17 medical specialties (Required for appointment booking dropdowns)
INSERT INTO public.specialties (name) VALUES
  ('Cardiology'),
  ('Dermatology'),
  ('Endocrinology'),
  ('Gastroenterology'),
  ('General Practice'),
  ('Hematology'),
  ('Nephrology'),
  ('Neurology'),
  ('Oncology'),
  ('Ophthalmology'),
  ('Orthopedics'),
  ('Pediatrics'),
  ('Psychiatry'),
  ('Pulmonology'),
  ('Radiology'),
  ('Rheumatology'),
  ('Urology')
ON CONFLICT (name) DO NOTHING;

-- 3. Add UPDATE policy for profiles table to allow users (patients/doctors/staff) to update their own rows
-- Run this check first to see if any similar policy exists:
-- SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
CREATE POLICY "profiles: user can update own row"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Verification check (Run after executing above queries)
-- SELECT id, name FROM public.specialties ORDER BY name;
