-- SPRINT 1 - Database Layer & Conflict Detection

-- STEP 1 — Add missing columns to appointments table
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Add indexes for the new columns and any missing ones
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON public.appointments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_scheduled ON public.appointments(doctor_id, scheduled_at)
  WHERE deleted_at IS NULL;

-- STEP 2 — Conflict detection function
CREATE OR REPLACE FUNCTION public.check_appointment_conflict(
  p_doctor_id      UUID,
  p_scheduled_at   TIMESTAMPTZ,
  p_duration_mins  INTEGER DEFAULT 30,
  p_exclude_id     UUID DEFAULT NULL  -- pass existing appointment ID when rescheduling
)
RETURNS JSONB AS $$
DECLARE
  conflict_row public.appointments%ROWTYPE;
  p_end_time TIMESTAMPTZ;
BEGIN
  p_end_time := p_scheduled_at + (p_duration_mins || ' minutes')::INTERVAL;

  SELECT * INTO conflict_row
  FROM public.appointments
  WHERE doctor_id = p_doctor_id
    AND deleted_at IS NULL
    AND status IN ('pending', 'confirmed')
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
    AND (
      -- New appointment starts during existing appointment
      (p_scheduled_at >= scheduled_at AND p_scheduled_at < scheduled_at + (duration_minutes || ' minutes')::INTERVAL)
      OR
      -- New appointment ends during existing appointment
      (p_end_time > scheduled_at AND p_end_time <= scheduled_at + (duration_minutes || ' minutes')::INTERVAL)
      OR
      -- New appointment completely contains existing appointment
      (p_scheduled_at <= scheduled_at AND p_end_time >= scheduled_at + (duration_minutes || ' minutes')::INTERVAL)
    )
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'has_conflict', true,
      'conflicting_appointment_id', conflict_row.id,
      'conflicting_scheduled_at', conflict_row.scheduled_at,
      'conflicting_status', conflict_row.status
    );
  END IF;

  RETURN jsonb_build_object('has_conflict', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3 — Get available doctors by specialty function
CREATE OR REPLACE FUNCTION public.get_available_doctors(
  p_specialty_id UUID DEFAULT NULL,
  p_department   TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'specialty_id', p.specialty_id,
      'specialty_name', s.name,
      'department', p.department,
      'bio', p.bio,
      'pending_appointments', (
        SELECT COUNT(*) FROM public.appointments a
        WHERE a.doctor_id = p.id
          AND a.status = 'pending'
          AND a.deleted_at IS NULL
      ),
      'confirmed_appointments', (
        SELECT COUNT(*) FROM public.appointments a
        WHERE a.doctor_id = p.id
          AND a.status = 'confirmed'
          AND a.scheduled_at > NOW()
          AND a.deleted_at IS NULL
      )
    )
    ORDER BY p.full_name ASC
  )
  INTO result
  FROM public.profiles p
  LEFT JOIN public.specialties s ON s.id = p.specialty_id
  WHERE p.role IN ('doctor', 'staff')
    AND p.status = 'active'
    AND p.deleted_at IS NULL
    AND (p_specialty_id IS NULL OR p.specialty_id = p_specialty_id)
    AND (p_department IS NULL OR LOWER(p.department) = LOWER(p_department));

  RETURN COALESCE(result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 4 — Auto-complete past appointments via pg_cron
-- Note: the pg_cron extension needs to be enabled in Supabase for this to work
SELECT cron.schedule('auto-complete-appointments', '*/15 * * * *', $$
  UPDATE public.appointments
  SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE status = 'confirmed'
    AND scheduled_at + (duration_minutes || ' minutes')::INTERVAL < NOW()
    AND deleted_at IS NULL;
$$);

-- STEP 5 — RLS policies for appointments

-- Drop existing policies first
DROP POLICY IF EXISTS "appointments: patient own" ON public.appointments;
DROP POLICY IF EXISTS "appointments: patient insert own" ON public.appointments;
DROP POLICY IF EXISTS "appointments: doctor own" ON public.appointments;
DROP POLICY IF EXISTS "appointments: doctor update own" ON public.appointments;
DROP POLICY IF EXISTS "appointments: admin ceo all" ON public.appointments;

-- Patient: read own appointments only
CREATE POLICY "appt: patient select own"
  ON public.appointments FOR SELECT
  USING (patient_id = auth.uid() AND deleted_at IS NULL);

-- Patient: insert own appointments only (patient_id must equal their own ID)
CREATE POLICY "appt: patient insert own"
  ON public.appointments FOR INSERT
  WITH CHECK (patient_id = auth.uid());

-- Patient: can only cancel their own pending appointments
CREATE POLICY "appt: patient cancel own"
  ON public.appointments FOR UPDATE
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid() AND status = 'cancelled');

-- Doctor: read appointments assigned to them
CREATE POLICY "appt: doctor select own"
  ON public.appointments FOR SELECT
  USING (doctor_id = auth.uid() AND deleted_at IS NULL);

-- Doctor: confirm or reject their own appointments
CREATE POLICY "appt: doctor update own"
  ON public.appointments FOR UPDATE
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- CEO/Admin: full access to everything
CREATE POLICY "appt: ceo admin all"
  ON public.appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('ceo', 'admin')
    )
  );
