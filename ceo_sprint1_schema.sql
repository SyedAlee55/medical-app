-- Track who created a profile and when it was hard-deleted
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS notes TEXT; -- CEO can add internal notes on any user

-- Employee ID approval tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS employee_id TEXT,
  ADD COLUMN IF NOT EXISTS employee_id_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS employee_id_verified_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS employee_id_verified_at TIMESTAMPTZ;

-- Kill switch tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kill_switched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kill_switched_by UUID REFERENCES public.profiles(id);

-- Add indexes
CREATE INDEX IF NOT EXISTS ON public.profiles(deleted_at);
CREATE INDEX IF NOT EXISTS ON public.profiles(employee_id_verified);
CREATE INDEX IF NOT EXISTS ON public.profiles(kill_switched_at);

-- Update the RLS policy for profiles so that soft-deleted profiles (deleted_at IS NOT NULL) are invisible to everyone except CEO
CREATE POLICY "profiles: hide soft deleted from non-ceo" ON public.profiles
  FOR SELECT USING (
    deleted_at IS NULL OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'ceo'
    )
  );

-- Export Audit Logs function
CREATE OR REPLACE FUNCTION public.export_audit_logs(
  p_from TIMESTAMPTZ DEFAULT NULL,
  p_to TIMESTAMPTZ DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL,
  p_action TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', a.id,
      'timestamp', a.created_at,
      'actor_id', a.actor_id,
      'actor_role', a.actor_role,
      'action', a.action,
      'target_type', a.target_type,
      'target_id', a.target_id,
      'metadata', a.metadata,
      'ip_address', a.ip_address,
      'user_agent', a.user_agent
    ) ORDER BY a.created_at DESC
  )
  INTO result
  FROM public.audit_logs a
  WHERE
    (p_from IS NULL OR a.created_at >= p_from) AND
    (p_to IS NULL OR a.created_at <= p_to) AND
    (p_actor_id IS NULL OR a.actor_id = p_actor_id) AND
    (p_action IS NULL OR a.action = p_action);

  RETURN COALESCE(result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
