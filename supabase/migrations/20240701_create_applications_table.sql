-- Create applications table to store form submissions
CREATE TABLE IF NOT EXISTS public.applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_paid numeric,
    google_pay_number varchar(10),
    payment_date date,
    applicant_name text NOT NULL,
    mobile_number varchar(10) NOT NULL,
    whatsapp_number varchar(10) NOT NULL,
    single_window_appln_no varchar(10) NOT NULL,
    qualifying_exam text NOT NULL,
    register_number text NOT NULL,
    exam_year varchar(4) NOT NULL,
    school_name text NOT NULL,
    gender text NOT NULL,
    religion text NOT NULL,
    date_of_birth date NOT NULL,
    mother_name text,
    father_name text,
    permanent_address text NOT NULL,
    house_name text NOT NULL,
    post_office text NOT NULL,
    taluk text NOT NULL,
    panchayath_municipality text NOT NULL,
    exam_type text NOT NULL,
    subject_grades jsonb,
    course_preferences jsonb NOT NULL,
    bonus_points jsonb,
    sports_participation jsonb,
    kalolsavam_participation jsonb,
    national_state_test boolean,
    co_curricular_activities jsonb,
    eligibility jsonb,
    created_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'pending'
);

-- Enable row level security
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'applications' 
        AND policyname = 'Admin can view all applications'
    ) THEN
        EXECUTE 'CREATE POLICY "Admin can view all applications" ON public.applications
                FOR ALL USING (true)';
    END IF;
END
$$;

-- Enable realtime for applications table
alter publication supabase_realtime add table applications;
