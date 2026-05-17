-- ==========================================
-- SPRINT 1: Database Foundation & Supabase Configuration
-- Tj's Medical Hub — Authentication Revamp
-- ==========================================

-- STEP 1 — Drop old tables safely
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.specialties CASCADE;

-- Now create all tables fresh:

-- SPECIALTIES (keep this, it's still needed)
CREATE TABLE public.specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

-- PROFILES (completely rebuilt)
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'patient'
                  CHECK (role IN ('patient','doctor','staff','admin','ceo')),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','active','suspended','rejected')),
  specialty_id    UUID REFERENCES public.specialties(id),
  department      TEXT,
  bio             TEXT,
  medical_history TEXT,
  allergies       TEXT,
  date_of_birth   DATE,
  phone           TEXT,
  avatar_url      TEXT,
  mfa_enforced    BOOLEAN DEFAULT FALSE,
  last_login_at   TIMESTAMPTZ,
  failed_attempts INTEGER DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- APPOINTMENTS (rebuilt with override and hard-delete support)
CREATE TABLE public.appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.profiles(id),
  doctor_id       UUID NOT NULL REFERENCES public.profiles(id),
  specialty_id    UUID REFERENCES public.specialties(id),
  scheduled_at    TIMESTAMPTZ NOT NULL,
  reason_for_visit TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','rejected','cancelled','completed','overridden')),
  overridden_by   UUID REFERENCES public.profiles(id),
  notes           TEXT,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES public.profiles(id),
  actor_role  TEXT,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   UUID,
  metadata    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RATE LIMITS (replaces Redis — stays in Supabase)
CREATE TABLE public.rate_limits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier    TEXT NOT NULL,
  action        TEXT NOT NULL,
  attempts      INTEGER DEFAULT 1,
  window_start  TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  UNIQUE(identifier, action)
);

-- USER SESSIONS
CREATE TABLE public.user_sessions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES public.profiles(id),
  device_fingerprint TEXT,
  ip_address         INET,
  user_agent         TEXT,
  is_active          BOOLEAN DEFAULT TRUE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at       TIMESTAMPTZ DEFAULT NOW(),
  revoked_at         TIMESTAMPTZ
);

-- ==========================================
-- STEP 2 — Create All Indexes
-- ==========================================
CREATE INDEX ON public.profiles(role);
CREATE INDEX ON public.profiles(status);
CREATE INDEX ON public.profiles(email);
CREATE INDEX ON public.appointments(patient_id);
CREATE INDEX ON public.appointments(doctor_id);
CREATE INDEX ON public.appointments(status);
CREATE INDEX ON public.appointments(scheduled_at);
CREATE INDEX ON public.appointments(deleted_at);
CREATE INDEX ON public.audit_logs(actor_id);
CREATE INDEX ON public.audit_logs(created_at);
CREATE INDEX ON public.rate_limits(identifier, action);
CREATE INDEX ON public.user_sessions(user_id, is_active);

-- ==========================================
-- STEP 3 — Security Definer Functions
-- ==========================================

-- 3A — Audit Log Writer (clients can never write directly)
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_actor_id    UUID,
  p_actor_role  TEXT,
  p_action      TEXT,
  p_target_type TEXT,
  p_target_id   UUID,
  p_metadata    JSONB,
  p_ip_address  INET,
  p_user_agent  TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs(actor_id, actor_role, action, target_type, target_id, metadata, ip_address, user_agent)
  VALUES (p_actor_id, p_actor_role, p_action, p_target_type, p_target_id, p_metadata, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3B — Rate Limit Checker
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_identifier TEXT,
  p_action     TEXT,
  p_max        INTEGER,
  p_window_mins INTEGER,
  p_block_mins  INTEGER
)
RETURNS JSONB AS $$
DECLARE
  rec rate_limits%ROWTYPE;
  result JSONB;
BEGIN
  SELECT * INTO rec FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action;

  IF NOT FOUND THEN
    INSERT INTO public.rate_limits(identifier, action, attempts, window_start)
    VALUES (p_identifier, p_action, 1, NOW());
    RETURN '{"allowed": true, "attempts": 1}'::JSONB;
  END IF;

  -- Reset window if expired
  IF rec.window_start < NOW() - (p_window_mins || ' minutes')::INTERVAL THEN
    UPDATE public.rate_limits
    SET attempts = 1, window_start = NOW(), blocked_until = NULL
    WHERE identifier = p_identifier AND action = p_action;
    RETURN '{"allowed": true, "attempts": 1}'::JSONB;
  END IF;

  -- Check if currently blocked
  IF rec.blocked_until IS NOT NULL AND rec.blocked_until > NOW() THEN
    RETURN jsonb_build_object('allowed', false, 'blocked_until', rec.blocked_until);
  END IF;

  -- Increment and check
  UPDATE public.rate_limits
  SET attempts = attempts + 1,
      blocked_until = CASE WHEN attempts + 1 >= p_max
                           THEN NOW() + (p_block_mins || ' minutes')::INTERVAL
                           ELSE NULL END
  WHERE identifier = p_identifier AND action = p_action
  RETURNING * INTO rec;

  RETURN jsonb_build_object(
    'allowed', rec.blocked_until IS NULL,
    'attempts', rec.attempts,
    'blocked_until', rec.blocked_until
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3C — Auto Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_status TEXT;
  v_ceo_email TEXT;
BEGIN
  -- Read CEO email from Vault
  SELECT decrypted_secret INTO v_ceo_email
  FROM vault.decrypted_secrets
  WHERE name = 'ceo_email';

  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');

  -- CEO override
  IF NEW.email = v_ceo_email THEN
    v_role := 'ceo';
    v_status := 'active';
  -- Patients are immediately active
  ELSIF v_role = 'patient' THEN
    v_status := 'active';
  -- Doctors and staff go to pending
  ELSE
    v_status := 'pending';
  END IF;

  INSERT INTO public.profiles(id, full_name, email, role, status, mfa_enforced)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    v_role,
    v_status,
    CASE WHEN NEW.email = v_ceo_email THEN TRUE ELSE FALSE END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3D — Custom JWT Claims Hook
CREATE OR REPLACE FUNCTION public.custom_jwt_claims(event JSONB)
RETURNS JSONB AS $$
DECLARE
  p profiles%ROWTYPE;
  claims JSONB;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = (event->>'userId')::UUID;
  claims := event->'claims';
  claims := jsonb_set(claims, '{app_role}', to_jsonb(p.role));
  claims := jsonb_set(claims, '{app_status}', to_jsonb(p.status));
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- STEP 4 — Row Level Security Policies
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles: own row" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles: block pending and suspended" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.status = 'active'
    )
  );

CREATE POLICY "profiles: admin full access" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin','ceo')
    )
  );

-- APPOINTMENTS
CREATE POLICY "appointments: patient own" ON public.appointments
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "appointments: patient insert own" ON public.appointments
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "appointments: doctor own" ON public.appointments
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "appointments: doctor update own" ON public.appointments
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "appointments: admin ceo all" ON public.appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin','ceo')
    )
  );

-- AUDIT LOGS
CREATE POLICY "audit_logs: no direct insert" ON public.audit_logs
  FOR INSERT WITH CHECK (FALSE);

CREATE POLICY "audit_logs: admin ceo read" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin','ceo')
    )
  );

-- RATE LIMITS
CREATE POLICY "rate_limits: no client access" ON public.rate_limits
  FOR ALL USING (FALSE);

-- USER SESSIONS
CREATE POLICY "sessions: own" ON public.user_sessions
  FOR SELECT USING (user_id = auth.uid());

-- SPECIALTIES
CREATE POLICY "specialties: public read" ON public.specialties
  FOR SELECT USING (TRUE);

-- ==========================================
-- STEP 5 — Cron Jobs (Run after enabling pg_cron)
-- ==========================================
-- Auto-expire pending doctors after 30 days
SELECT cron.schedule('expire-pending-doctors', '0 2 * * *', $$
  UPDATE public.profiles
  SET status = 'rejected'
  WHERE status = 'pending'
  AND role IN ('doctor','staff')
  AND created_at < NOW() - INTERVAL '30 days';
$$);

-- Clean old rate limit records hourly
SELECT cron.schedule('clean-rate-limits', '0 * * * *', $$
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '2 hours'
  AND (blocked_until IS NULL OR blocked_until < NOW());
$$);
