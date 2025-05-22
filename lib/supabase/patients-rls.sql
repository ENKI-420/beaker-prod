-- Create patients table with RLS
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  mrn TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on patients table
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
CREATE POLICY "Admins have full access to patients"
  ON public.patients
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Clinicians can view all patients
CREATE POLICY "Clinicians can view all patients"
  ON public.patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'clinician'
    )
  );

-- Researchers can view all patients but with limited fields
CREATE POLICY "Researchers can view limited patient data"
  ON public.patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'researcher'
    )
  );

-- Patients can only view their own records
CREATE POLICY "Patients can view their own records"
  ON public.patients
  FOR SELECT
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'patient'
    )
  );

-- Create policy using the has_role function
CREATE POLICY "Allow access based on JWT role claim"
  ON public.patients
  USING (
    has_role('admin') OR 
    has_role('clinician') OR
    (has_role('patient') AND user_id = auth.uid())
  );
