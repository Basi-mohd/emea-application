-- ============================================================
-- Combined migration: creates all tables for EMEA application
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Users table (for auth)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY NOT NULL,
    avatar_url text,
    user_id text UNIQUE,
    token_identifier text NOT NULL,
    image text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone,
    email text,
    name text,
    full_name text
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can view own data'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can view own data" ON public.users
                FOR SELECT USING (auth.uid()::text = user_id)';
    END IF;
END
$$;

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, user_id, email, name, full_name, avatar_url, token_identifier, created_at, updated_at)
  VALUES (NEW.id, NEW.id::text, NEW.email, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url', NEW.email, NEW.created_at, NEW.updated_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users SET email = NEW.email, name = NEW.raw_user_meta_data->>'name', full_name = NEW.raw_user_meta_data->>'full_name', avatar_url = NEW.raw_user_meta_data->>'avatar_url', updated_at = NEW.updated_at
  WHERE user_id = NEW.id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Applications table (matches the current form schema)
CREATE TABLE IF NOT EXISTS public.applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    application_number INT UNIQUE,
    fee_paid numeric DEFAULT 0,
    google_pay_number text,
    payment_date text,
    applicant_name text NOT NULL,
    mobile_number text NOT NULL,
    whatsapp_number text NOT NULL,
    qualifying_exam text NOT NULL,
    register_number text NOT NULL,
    exam_year text NOT NULL,
    school_name text NOT NULL,
    gender text NOT NULL,
    religion text NOT NULL,
    date_of_birth text NOT NULL,
    mother_name text,
    father_name text,
    permanent_address text NOT NULL,
    house_name text NOT NULL,
    post_office text NOT NULL,
    taluk text NOT NULL,
    panchayath_municipality text NOT NULL,
    exam_type text NOT NULL,
    course_preferences jsonb NOT NULL DEFAULT '[]'::jsonb,
    subject_grades jsonb,
    bonus_points jsonb,
    sports_participation jsonb,
    kalolsavam_participation jsonb,
    national_state_test boolean DEFAULT false,
    co_curricular_activities jsonb,
    eligibility jsonb,
    cbse_marks jsonb,
    status text DEFAULT 'pending'
);

-- Unique constraint on register_number
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_register_number_unique;
ALTER TABLE public.applications ADD CONSTRAINT applications_register_number_unique UNIQUE (register_number);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Admin policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'applications' AND policyname = 'Admin can view all applications'
    ) THEN
        EXECUTE 'CREATE POLICY "Admin can view all applications" ON public.applications FOR ALL USING (true)';
    END IF;
END
$$;

-- Enable realtime
alter publication supabase_realtime add table applications;
