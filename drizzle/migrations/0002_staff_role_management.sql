CREATE OR REPLACE FUNCTION public.list_staff()
RETURNS TABLE (user_id uuid, email text, role public.app_role, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  RETURN QUERY SELECT r.user_id, u.email::text, r.role, r.created_at
    FROM public.user_roles r JOIN auth.users u ON u.id = r.user_id ORDER BY r.created_at;
END $$;

CREATE OR REPLACE FUNCTION public.grant_staff_role(_email text, _role public.app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE uid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT id INTO uid FROM auth.users WHERE lower(email) = lower(trim(_email));
  IF uid IS NULL THEN RAISE EXCEPTION 'No account with that email. Ask them to sign up first.'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, _role) ON CONFLICT DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.revoke_staff_role(_user_id uuid, _role public.app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _user_id = auth.uid() AND _role = 'admin' THEN RAISE EXCEPTION 'You cannot remove your own admin role.'; END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role;
END $$;

REVOKE EXECUTE ON FUNCTION public.list_staff() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.grant_staff_role(text, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.revoke_staff_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_staff_role(text, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_staff_role(uuid, public.app_role) TO authenticated;