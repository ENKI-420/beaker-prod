-- Create user_roles table for role-based access control
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'clinician', 'researcher', 'patient', 'developer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Add RLS policies to user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admins to manage all roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create custom access token hook to inject user_role into JWT claims
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  claims jsonb;
  user_roles text[];
BEGIN
  -- Get the claims from the event
  claims := event->'claims';
  
  -- Get all roles for the user
  SELECT array_agg(role) INTO user_roles 
  FROM public.user_roles 
  WHERE user_id = (event->>'user_id')::uuid;
  
  -- Add roles to claims if they exist
  IF user_roles IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_roles}', to_jsonb(user_roles));
    
    -- Also set a primary role (first in the array) for simpler checks
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_roles[1]));
  END IF;
  
  -- Update the claims in the event
  event := jsonb_set(event, '{claims}', claims);
  
  RETURN event;
END;
$$;

-- Create function to assign role to user
CREATE OR REPLACE FUNCTION public.assign_role(user_id UUID, role_name TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  role_id UUID;
BEGIN
  -- Validate role name
  IF role_name NOT IN ('admin', 'clinician', 'researcher', 'patient', 'developer') THEN
    RAISE EXCEPTION 'Invalid role: %', role_name;
  END IF;

  -- Insert role and return ID
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id, role_name)
  RETURNING id INTO role_id;
  
  RETURN role_id;
END;
$$;

-- Create function to check if user has role via JWT claims
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN 
    required_role = ANY(
      (current_setting('request.jwt.claims', true)::jsonb->'user_roles')::text[]
    );
END;
$$;
