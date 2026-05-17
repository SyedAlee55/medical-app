-- ==============================================================================
-- SIMPLIFIED CEO PORTAL FIX: Vault Email Only, No IP Complexity
-- ==============================================================================

-- STEP 1: Replace the trigger function with the simplified vault check
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_ceo_email TEXT;
  v_role TEXT;
  v_status TEXT;
BEGIN
  -- Safely read CEO email from vault
  BEGIN
    SELECT LOWER(TRIM(decrypted_secret)) INTO v_ceo_email
    FROM vault.decrypted_secrets
    WHERE name = 'ceo_email'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_ceo_email := NULL;
  END;

  -- Read intended role from signup metadata, default to patient
  v_role := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'role', 'patient')));

  -- Security: never allow role escalation through signup form
  -- Only 'patient', 'doctor', 'staff' are valid from the form
  -- 'admin' and 'ceo' can never be self-assigned
  IF v_role NOT IN ('patient', 'doctor', 'staff') THEN
    v_role := 'patient';
  END IF;

  -- CEO override: email match trumps everything
  IF v_ceo_email IS NOT NULL AND LOWER(TRIM(NEW.email)) = v_ceo_email THEN
    v_role := 'ceo';
    v_status := 'active';

  -- Patients are immediately active — no approval needed, ever
  ELSIF v_role = 'patient' THEN
    v_status := 'active';

  -- Doctors and staff go to pending — require CEO approval
  ELSIF v_role IN ('doctor', 'staff') THEN
    v_status := 'pending';

  -- Fallback safety net
  ELSE
    v_role := 'patient';
    v_status := 'active';
  END IF;

  -- Upsert so re-runs don't create duplicate rows
  INSERT INTO public.profiles(id, full_name, email, role, status, mfa_enforced, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    LOWER(TRIM(NEW.email)),
    v_role,
    v_status,
    CASE WHEN v_role = 'ceo' THEN TRUE ELSE FALSE END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    mfa_enforced = EXCLUDED.mfa_enforced,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Fix the CEO profile row and clear blocks
-- IMPORTANT: Replace 'your-ceo-email-here' with your actual CEO email address
UPDATE public.profiles
SET role = 'ceo', status = 'active', mfa_enforced = true
WHERE email = 'your-ceo-email-here';

-- Clear any rate limit blocks
DELETE FROM public.rate_limits
WHERE identifier = 'your-ceo-email-here';

-- STEP 4: Verify the vault entry
-- The output must exactly match your CEO email in lowercase.
SELECT LOWER(TRIM(decrypted_secret)) as stored_email
FROM vault.decrypted_secrets
WHERE name = 'ceo_email';
