-- =================================================================
-- Supabase RLS Fixes (Profiles recursion + Characters CRUD)
-- Date: 2025-09-22
-- Notes:
-- - Replaces recursive profiles policies that referenced the profiles table
--   inside profiles policies (causing "infinite recursion detected" errors).
-- - Adds admin/superadmin CRUD policies for characters.
-- - Uses helper functions current_user_role() and current_user_owner_slug()
--   which are SECURITY DEFINER and safe to call in policies.
-- =================================================================

-- Ensure helper functions exist (defined in prior migrations). If not, fail loudly.
-- You can re-run the previous migration section 7 to create them if missing.

-- =============================
-- 1) PROFILES: Drop old policies
-- =============================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop legacy recursive policies if present (ignore errors if absent)
DO $$ BEGIN
  BEGIN EXECUTE 'DROP POLICY "Users can view own profile" ON public.profiles'; EXCEPTION WHEN others THEN END;
  BEGIN EXECUTE 'DROP POLICY "Users can update own profile" ON public.profiles'; EXCEPTION WHEN others THEN END;
  BEGIN EXECUTE 'DROP POLICY "Admins can view all profiles" ON public.profiles'; EXCEPTION WHEN others THEN END;
  BEGIN EXECUTE 'DROP POLICY "Admins can update all profiles" ON public.profiles'; EXCEPTION WHEN others THEN END;
  BEGIN EXECUTE 'DROP POLICY "Pastors can view regular user profiles" ON public.profiles'; EXCEPTION WHEN others THEN END;
  BEGIN EXECUTE 'DROP POLICY "Pastors can update regular user profiles" ON public.profiles'; EXCEPTION WHEN others THEN END;
  -- Drop any prior iterations of the newer policies to avoid duplicates
  BEGIN EXECUTE 'DROP POLICY IF EXISTS profiles_select_self ON public.profiles'; EXCEPTION WHEN others THEN END;
  BEGIN EXECUTE 'DROP POLICY IF EXISTS profiles_select_superadmin ON public.profiles'; EXCEPTION WHEN others THEN END;
  BEGIN EXECUTE 'DROP POLICY IF EXISTS profiles_select_admin_org ON public.profiles'; EXCEPTION WHEN others THEN END;
  BEGIN EXECUTE 'DROP POLICY IF EXISTS profiles_update_self ON public.profiles'; EXCEPTION WHEN others THEN END;
  BEGIN EXECUTE 'DROP POLICY IF EXISTS profiles_update_admin ON public.profiles'; EXCEPTION WHEN others THEN END;
  BEGIN EXECUTE 'DROP POLICY IF EXISTS profiles_update_superadmin ON public.profiles'; EXCEPTION WHEN others THEN END;
  BEGIN EXECUTE 'DROP POLICY IF EXISTS profiles_delete_superadmin ON public.profiles'; EXCEPTION WHEN others THEN END;
END $$;

-- =============================
-- 2) PROFILES: Safe policies
-- =============================

-- SELECT: self
CREATE POLICY profiles_select_self
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- SELECT: superadmin can view all
CREATE POLICY profiles_select_superadmin
ON public.profiles
FOR SELECT
TO authenticated
USING (public.current_user_role() = 'superadmin');

-- SELECT: admin can view only within their org (owner_slug)
CREATE POLICY profiles_select_admin_org
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.current_user_role() = 'admin'
  AND owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
);

-- UPDATE: self may update own profile but cannot change role/owner_slug
CREATE POLICY profiles_update_self
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND role = public.current_user_role()
  AND owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
);

-- UPDATE: admin may update profiles within their org (but cannot set superadmin)
CREATE POLICY profiles_update_admin
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  public.current_user_role() = 'admin'
  AND owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
)
WITH CHECK (
  public.current_user_role() = 'admin'
  AND owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
  AND COALESCE(role::text, 'user') <> 'superadmin'
);

-- UPDATE: superadmin may update any profile
CREATE POLICY profiles_update_superadmin
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.current_user_role() = 'superadmin')
WITH CHECK (public.current_user_role() = 'superadmin');

-- DELETE: superadmin only (optional hard-guard)
CREATE POLICY profiles_delete_superadmin
ON public.profiles
FOR DELETE
TO authenticated
USING (public.current_user_role() = 'superadmin');

-- Note: INSERT on profiles is typically performed by trigger handle_new_user()
-- with SECURITY DEFINER – no explicit INSERT policy needed for clients.

-- ======================================
-- 3) CHARACTERS: Admin/superadmin CRUD
-- ======================================

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Keep public read (already present in prior migrations). Re-create idempotently.
DO $$ BEGIN
  BEGIN EXECUTE 'DROP POLICY IF EXISTS "Characters are viewable by all users" ON public.characters'; EXCEPTION WHEN others THEN END;
END $$;
CREATE POLICY "Characters are viewable by all users" ON public.characters
  FOR SELECT USING (true);

-- Admins and superadmins can insert/update/delete
DO $$ BEGIN
  BEGIN EXECUTE 'DROP POLICY IF EXISTS characters_insert_admins ON public.characters'; EXCEPTION WHEN others THEN END;
  BEGIN EXECUTE 'DROP POLICY IF EXISTS characters_update_admins ON public.characters'; EXCEPTION WHEN others THEN END;
  BEGIN EXECUTE 'DROP POLICY IF EXISTS characters_delete_admins ON public.characters'; EXCEPTION WHEN others THEN END;
END $$;

CREATE POLICY characters_insert_admins
ON public.characters
FOR INSERT
TO authenticated
WITH CHECK (public.current_user_role() IN ('admin','superadmin'));

CREATE POLICY characters_update_admins
ON public.characters
FOR UPDATE
TO authenticated
USING (public.current_user_role() IN ('admin','superadmin'))
WITH CHECK (public.current_user_role() IN ('admin','superadmin'));

CREATE POLICY characters_delete_admins
ON public.characters
FOR DELETE
TO authenticated
USING (public.current_user_role() IN ('admin','superadmin'));

-- =================================================================
-- End of migration
-- =================================================================
