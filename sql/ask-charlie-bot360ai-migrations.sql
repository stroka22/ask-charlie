-- =================================================================
-- Bot360AI to Ask Charlie Migration Script
-- =================================================================
-- This script ports the Bot360AI database structure to Ask Charlie's Supabase project.
-- It is designed to be idempotent (safe to run multiple times).
-- Run this in the Supabase SQL Editor to set up your database.

-- =================================================================
-- 1. Enable Extensions
-- =================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =================================================================
-- 2. Initial Schema: Users, Characters, Chats, Messages
-- =================================================================

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create Bible characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  persona_prompt TEXT NOT NULL,
  opening_line TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Ensure character names are unique
  CONSTRAINT unique_character_name UNIQUE (name)
);

-- Create index on character name for faster searches
CREATE INDEX IF NOT EXISTS idx_character_name ON characters (name);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for chat queries
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chats (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_character_id ON chats (character_id);
CREATE INDEX IF NOT EXISTS idx_chat_updated_at ON chats (updated_at DESC);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for retrieving messages by chat
CREATE INDEX IF NOT EXISTS idx_message_chat_id ON chat_messages (chat_id, created_at);

-- Create function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON chats
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS policies for characters table (public read access)
DROP POLICY IF EXISTS "Characters are viewable by all users" ON characters;
CREATE POLICY "Characters are viewable by all users" ON characters
  FOR SELECT USING (true);

-- RLS policies for chats table
DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own chats" ON chats;
CREATE POLICY "Users can create their own chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own chats" ON chats;
CREATE POLICY "Users can update their own chats" ON chats
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own chats" ON chats;
CREATE POLICY "Users can delete their own chats" ON chats
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for chat_messages table
DROP POLICY IF EXISTS "Users can view messages in their chats" ON chat_messages;
CREATE POLICY "Users can view messages in their chats" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = chat_messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages in their chats" ON chat_messages;
CREATE POLICY "Users can insert messages in their chats" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = chat_messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

-- =================================================================
-- 3. Character Extensions
-- =================================================================

-- Add feature_image_url and other fields to characters table
DO $$ 
BEGIN
  -- Only add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'feature_image_url') THEN
    ALTER TABLE characters ADD COLUMN feature_image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'short_biography') THEN
    ALTER TABLE characters ADD COLUMN short_biography TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'bible_book') THEN
    ALTER TABLE characters ADD COLUMN bible_book TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'scriptural_context') THEN
    ALTER TABLE characters ADD COLUMN scriptural_context TEXT;
  END IF;
END $$;

-- Create trigger to automatically update updated_at for characters table
DROP TRIGGER IF EXISTS update_characters_updated_at ON characters;
CREATE TRIGGER update_characters_updated_at
BEFORE UPDATE ON characters
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add is_visible column to the characters table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'is_visible') THEN
    ALTER TABLE characters ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Add character insights fields to the characters table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'timeline_period') THEN
    ALTER TABLE characters ADD COLUMN timeline_period VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'historical_context') THEN
    ALTER TABLE characters ADD COLUMN historical_context TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'geographic_location') THEN
    ALTER TABLE characters ADD COLUMN geographic_location VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'key_scripture_references') THEN
    ALTER TABLE characters ADD COLUMN key_scripture_references TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'theological_significance') THEN
    ALTER TABLE characters ADD COLUMN theological_significance TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'relationships') THEN
    ALTER TABLE characters ADD COLUMN relationships JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'study_questions') THEN
    ALTER TABLE characters ADD COLUMN study_questions TEXT;
  END IF;
END $$;

-- =================================================================
-- 4. Character Groups
-- =================================================================

-- Create character_groups table
CREATE TABLE IF NOT EXISTS character_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  CONSTRAINT unique_group_name UNIQUE (name)
);

-- Create trigger to automatically update updated_at for character_groups table
DROP TRIGGER IF EXISTS update_character_groups_updated_at ON character_groups;
CREATE TRIGGER update_character_groups_updated_at
BEFORE UPDATE ON character_groups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create character_group_mappings table
CREATE TABLE IF NOT EXISTS character_group_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES character_groups(id) ON DELETE CASCADE NOT NULL,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  CONSTRAINT unique_group_character UNIQUE (group_id, character_id)
);

-- Create trigger to automatically update updated_at for character_group_mappings table
DROP TRIGGER IF EXISTS update_character_group_mappings_updated_at ON character_group_mappings;
CREATE TRIGGER update_character_group_mappings_updated_at
BEFORE UPDATE ON character_group_mappings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for character_group_mappings
CREATE INDEX IF NOT EXISTS idx_group_mapping_group_id ON character_group_mappings (group_id);
CREATE INDEX IF NOT EXISTS idx_group_mapping_character_id ON character_group_mappings (character_id);
CREATE INDEX IF NOT EXISTS idx_group_mapping_sort_order ON character_group_mappings (sort_order);

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE character_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_group_mappings ENABLE ROW LEVEL SECURITY;

-- RLS policies for character_groups table
DROP POLICY IF EXISTS "Character groups are viewable by all users" ON character_groups;
CREATE POLICY "Character groups are viewable by all users" ON character_groups
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all inserts on character_groups" ON character_groups;
CREATE POLICY "Allow all inserts on character_groups" ON character_groups
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all updates on character_groups" ON character_groups;
CREATE POLICY "Allow all updates on character_groups" ON character_groups
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow all deletes on character_groups" ON character_groups;
CREATE POLICY "Allow all deletes on character_groups" ON character_groups
  FOR DELETE USING (true);

-- RLS policies for character_group_mappings table
DROP POLICY IF EXISTS "Character group mappings are viewable by all users" ON character_group_mappings;
CREATE POLICY "Character group mappings are viewable by all users" ON character_group_mappings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all inserts on character_group_mappings" ON character_group_mappings;
CREATE POLICY "Allow all inserts on character_group_mappings" ON character_group_mappings
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all updates on character_group_mappings" ON character_group_mappings;
CREATE POLICY "Allow all updates on character_group_mappings" ON character_group_mappings
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow all deletes on character_group_mappings" ON character_group_mappings;
CREATE POLICY "Allow all deletes on character_group_mappings" ON character_group_mappings
  FOR DELETE USING (true);

-- =================================================================
-- 5. Subscriptions
-- =================================================================

-- Add subscription fields to the existing users table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
    ALTER TABLE users ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'free';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_subscription_id') THEN
    ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_period_end') THEN
    ALTER TABLE users ADD COLUMN subscription_period_end TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'payment_method_id') THEN
    ALTER TABLE users ADD COLUMN payment_method_id TEXT;
  END IF;
END $$;

-- Create subscriptions table to track payment history
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  status TEXT NOT NULL, -- e.g., 'active', 'canceled', 'past_due', 'trialing'
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  price_id TEXT, -- Stripe Price ID
  product_id TEXT, -- Stripe Product ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  CONSTRAINT unique_stripe_subscription UNIQUE (stripe_subscription_id)
);

-- Create indexes for subscriptions table
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);

-- Create trigger to automatically update updated_at for subscriptions table
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on new subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions table
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow authenticated inserts on subscriptions" ON subscriptions;
CREATE POLICY "Allow authenticated inserts on subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow authenticated updates on subscriptions" ON subscriptions;
CREATE POLICY "Allow authenticated updates on subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow authenticated deletes on subscriptions" ON subscriptions;
CREATE POLICY "Allow authenticated deletes on subscriptions" ON subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- =================================================================
-- 6. Profiles with user_role enum
-- =================================================================

-- Create a custom type for user roles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'pastor', 'user');
  END IF;
END$$;

-- Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for the profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        -- Prevent users from changing their own role
        (role = (SELECT role FROM profiles WHERE id = auth.uid()))
    );

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Pastors can view regular user profiles" ON profiles;
CREATE POLICY "Pastors can view regular user profiles"
    ON profiles FOR SELECT
    USING (
        (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE id = auth.uid() AND role = 'pastor'
            )
        ) AND (
            role = 'user' OR id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Pastors can update regular user profiles" ON profiles;
CREATE POLICY "Pastors can update regular user profiles"
    ON profiles FOR UPDATE
    USING (
        (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE id = auth.uid() AND role = 'pastor'
            )
        ) AND (
            role = 'user'
        )
    );

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create a profile when a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at field
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =================================================================
-- 7. Profiles RLS fixes + helper functions
-- =================================================================

-- Add superadmin to user_role enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'superadmin'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'superadmin';
  END IF;
END $$;

-- Create helper functions with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  r text;
  jwt_email text;
BEGIN
  uid := auth.uid();
  IF uid IS NOT NULL THEN
    SELECT role::text INTO r FROM public.profiles WHERE id = uid LIMIT 1;
    IF r IS NOT NULL THEN RETURN r; END IF;
  END IF;
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'email') INTO jwt_email;
  IF jwt_email IS NOT NULL THEN
    SELECT role::text INTO r FROM public.profiles WHERE lower(email) = lower(jwt_email) LIMIT 1;
  END IF;
  RETURN r;
END$$;

CREATE OR REPLACE FUNCTION public.current_user_owner_slug()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  v text;
  jwt_email text;
BEGIN
  uid := auth.uid();
  IF uid IS NOT NULL THEN
    SELECT owner_slug INTO v FROM public.profiles WHERE id = uid LIMIT 1;
    IF v IS NOT NULL THEN RETURN v; END IF;
  END IF;
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'email') INTO jwt_email;
  IF jwt_email IS NOT NULL THEN
    SELECT owner_slug INTO v FROM public.profiles WHERE lower(email) = lower(jwt_email) LIMIT 1;
  END IF;
  RETURN v;
END$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_owner_slug() TO authenticated;

-- Add owner_slug column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'owner_slug') THEN
    ALTER TABLE profiles ADD COLUMN owner_slug TEXT;
  END IF;
END $$;

-- Enable RLS and set select policies on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
CREATE POLICY profiles_select_self
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_select_superadmin ON public.profiles;
CREATE POLICY profiles_select_superadmin
ON public.profiles
FOR SELECT
TO authenticated
USING (public.current_user_role() = 'superadmin');

DROP POLICY IF EXISTS profiles_select_admin_org ON public.profiles;
CREATE POLICY profiles_select_admin_org
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.current_user_role() = 'admin'
  AND owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
);

-- =================================================================
-- 8. Owners table minimal + policies
-- =================================================================

-- Create owners table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.owners (
  owner_slug TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert default owner if it doesn't exist
INSERT INTO public.owners (owner_slug, display_name)
VALUES ('default', 'Default Organization')
ON CONFLICT (owner_slug) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "owners_select_policy" ON public.owners;

-- Create select policy allowing authenticated users to read all rows
CREATE POLICY "owners_select_policy" ON public.owners
FOR SELECT
TO authenticated
USING (true);

-- Superadmin-only insert/update
DROP POLICY IF EXISTS owners_insert_superadmin ON public.owners;
CREATE POLICY owners_insert_superadmin ON public.owners
FOR INSERT TO authenticated
WITH CHECK (public.current_user_role() = 'superadmin');

DROP POLICY IF EXISTS owners_update_superadmin ON public.owners;
CREATE POLICY owners_update_superadmin ON public.owners
FOR UPDATE TO authenticated
USING (public.current_user_role() = 'superadmin')
WITH CHECK (public.current_user_role() = 'superadmin');

-- =================================================================
-- 9. Tier settings table + policies + default row
-- =================================================================

-- Create the tier_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tier_settings (
  owner_slug TEXT PRIMARY KEY,
  free_message_limit INTEGER NOT NULL DEFAULT 5,
  free_character_limit INTEGER NOT NULL DEFAULT 10,
  free_characters JSONB NOT NULL DEFAULT '[]',
  free_character_names JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment to the table
COMMENT ON TABLE public.tier_settings IS 'Stores account tier settings per owner slug for multi-tenant configuration';

-- Enable Row Level Security
ALTER TABLE public.tier_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (both anonymous and authenticated users)
DROP POLICY IF EXISTS tier_settings_select_policy ON public.tier_settings;
CREATE POLICY tier_settings_select_policy
  ON public.tier_settings
  FOR SELECT
  USING (true);

-- Create policy for admin-only insert/update
-- This checks if the authenticated user has 'admin' role in the profiles table
DROP POLICY IF EXISTS tier_settings_insert_policy ON public.tier_settings;
CREATE POLICY tier_settings_insert_policy
  ON public.tier_settings
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','superadmin')
    )
  );

DROP POLICY IF EXISTS tier_settings_update_policy ON public.tier_settings;
CREATE POLICY tier_settings_update_policy
  ON public.tier_settings
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','superadmin')
    )
  );

-- Create index on owner_slug for faster lookups
CREATE INDEX IF NOT EXISTS tier_settings_owner_slug_idx ON public.tier_settings (owner_slug);

-- Add default record for 'default' slug if it doesn't exist
INSERT INTO public.tier_settings (owner_slug)
VALUES ('default')
ON CONFLICT (owner_slug) DO NOTHING;

-- =================================================================
-- 10. Roundtable settings table + trigger + policies
-- =================================================================

-- Create the roundtable_settings table
CREATE TABLE IF NOT EXISTS roundtable_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_slug TEXT NOT NULL UNIQUE,
  defaults JSONB NOT NULL DEFAULT '{}'::jsonb,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  locks JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index on owner_slug for faster lookups
CREATE INDEX IF NOT EXISTS roundtable_settings_owner_slug_idx ON roundtable_settings (owner_slug);

-- Create function for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION update_roundtable_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
DROP TRIGGER IF EXISTS update_roundtable_settings_updated_at ON roundtable_settings;
CREATE TRIGGER update_roundtable_settings_updated_at
BEFORE UPDATE ON roundtable_settings
FOR EACH ROW
EXECUTE FUNCTION update_roundtable_settings_updated_at();

-- Enable Row Level Security
ALTER TABLE roundtable_settings ENABLE ROW LEVEL SECURITY;

-- Define RLS policies
DROP POLICY IF EXISTS "roundtable_settings_select_policy" ON roundtable_settings;
DROP POLICY IF EXISTS "roundtable_settings_insert_policy" ON roundtable_settings;
DROP POLICY IF EXISTS "roundtable_settings_update_policy" ON roundtable_settings;
DROP POLICY IF EXISTS "roundtable_settings_delete_policy" ON roundtable_settings;

-- SELECT: Allow any user (including anonymous) to read settings
CREATE POLICY "roundtable_settings_select_policy" ON roundtable_settings
  FOR SELECT
  USING (true);

-- INSERT: Only admin or superadmin can insert new settings
CREATE POLICY "roundtable_settings_insert_policy" ON roundtable_settings
  FOR INSERT
  WITH CHECK (
    coalesce((auth.jwt() ->> 'role'), '') IN ('admin', 'superadmin')
  );

-- UPDATE: Only admin or superadmin can update settings
CREATE POLICY "roundtable_settings_update_policy" ON roundtable_settings
  FOR UPDATE
  USING (
    coalesce((auth.jwt() ->> 'role'), '') IN ('admin', 'superadmin')
  );

-- DELETE: Only superadmin can delete settings (stricter)
CREATE POLICY "roundtable_settings_delete_policy" ON roundtable_settings
  FOR DELETE
  USING (
    coalesce((auth.jwt() ->> 'role'), '') = 'superadmin'
  );

-- Add explanatory comment
COMMENT ON TABLE roundtable_settings IS 'Table for storing roundtable configuration with RLS: read=all, write=admin+superadmin, delete=superadmin';

-- =================================================================
-- 11. Bible studies schema
-- =================================================================

-- Ensure we have the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Main Bible Studies table
CREATE TABLE IF NOT EXISTS bible_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_slug text NOT NULL,
  title text NOT NULL,
  description text,
  cover_image_url text,
  -- Link to the guiding character (matches characters.id which is UUID)
  character_id uuid REFERENCES characters(id) ON DELETE SET NULL,
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  is_premium boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS bible_studies_owner_slug_idx ON bible_studies(owner_slug);
CREATE INDEX IF NOT EXISTS bible_studies_is_premium_idx ON bible_studies(is_premium);

-- Enable RLS
ALTER TABLE bible_studies ENABLE ROW LEVEL SECURITY;

-- Bible Study Lessons table
CREATE TABLE IF NOT EXISTS bible_study_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL REFERENCES bible_studies(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  title text NOT NULL,
  scripture_refs text[] DEFAULT '{}',
  summary text,
  prompts jsonb DEFAULT '[]'::jsonb,
  resources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (study_id, order_index)
);

-- Create index
CREATE INDEX IF NOT EXISTS bible_study_lessons_study_id_idx ON bible_study_lessons(study_id);

-- Enable RLS
ALTER TABLE bible_study_lessons ENABLE ROW LEVEL SECURITY;

-- User Study Progress table
CREATE TABLE IF NOT EXISTS user_study_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  study_id uuid NOT NULL REFERENCES bible_studies(id) ON DELETE CASCADE,
  current_lesson_index integer NOT NULL DEFAULT 0,
  completed_lessons integer[] NOT NULL DEFAULT '{}',
  notes jsonb DEFAULT '{}'::jsonb,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, study_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS user_study_progress_user_id_idx ON user_study_progress(user_id);

-- Enable RLS
ALTER TABLE user_study_progress ENABLE ROW LEVEL SECURITY;

-- AI Outlines table (admin authoring aid)
CREATE TABLE IF NOT EXISTS ai_outlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL REFERENCES bible_studies(id) ON DELETE CASCADE,
  outline jsonb NOT NULL,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_outlines ENABLE ROW LEVEL SECURITY;

-- Add explanatory comments
COMMENT ON TABLE bible_studies IS 'Character-directed Bible studies with metadata';
COMMENT ON TABLE bible_study_lessons IS 'Individual lessons within a Bible study';
COMMENT ON TABLE user_study_progress IS 'Tracks user progress through Bible studies';
COMMENT ON TABLE ai_outlines IS 'AI-generated outlines for Bible study authoring (admin tool)';

-- Add new columns for subject and character instructions (idempotent)
DO $$ BEGIN
  -- Add 'subject' column if it does not exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bible_studies' AND column_name = 'subject'
  ) THEN
    ALTER TABLE bible_studies ADD COLUMN subject text;
  END IF;

  -- Add 'character_instructions' column if it does not exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bible_studies' AND column_name = 'character_instructions'
  ) THEN
    ALTER TABLE bible_studies ADD COLUMN character_instructions text;
  END IF;
END $$;

-- =================================================================
-- 12. Bible studies RLS policies
-- =================================================================

-- Enable RLS defensively (safe if already enabled)
ALTER TABLE bible_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_study_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_outlines ENABLE ROW LEVEL SECURITY;

-- bible_studies table policies
DROP POLICY IF EXISTS "bible_studies_select_policy" ON bible_studies;
DROP POLICY IF EXISTS "bible_studies_insert_policy" ON bible_studies;
DROP POLICY IF EXISTS "bible_studies_update_policy" ON bible_studies;
DROP POLICY IF EXISTS "bible_studies_delete_policy" ON bible_studies;

-- SELECT: Allow any user (including anonymous) to read studies
CREATE POLICY "bible_studies_select_policy" ON bible_studies
  FOR SELECT
  USING (true);

-- INSERT: Admins within their org or superadmin
CREATE POLICY "bible_studies_insert_policy" ON bible_studies
  FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('admin','superadmin')
    AND (
      public.current_user_role() = 'superadmin' OR
      owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
    )
  );

-- UPDATE: Admins within their org or superadmin
CREATE POLICY "bible_studies_update_policy" ON bible_studies
  FOR UPDATE
  USING (
    public.current_user_role() IN ('admin','superadmin')
    AND (
      public.current_user_role() = 'superadmin' OR
      owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
    )
  )
  WITH CHECK (
    public.current_user_role() IN ('admin','superadmin')
    AND (
      public.current_user_role() = 'superadmin' OR
      owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
    )
  );

-- DELETE: Admins can delete within their org; superadmin can delete any
CREATE POLICY "bible_studies_delete_policy" ON bible_studies
  FOR DELETE
  USING (
    public.current_user_role() = 'superadmin' OR (
      public.current_user_role() = 'admin' AND
      owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
    )
  );

-- bible_study_lessons table policies (inherit permissions from parent study)
DROP POLICY IF EXISTS "bible_study_lessons_select_policy" ON bible_study_lessons;
DROP POLICY IF EXISTS "bible_study_lessons_insert_policy" ON bible_study_lessons;
DROP POLICY IF EXISTS "bible_study_lessons_update_policy" ON bible_study_lessons;
DROP POLICY IF EXISTS "bible_study_lessons_delete_policy" ON bible_study_lessons;

-- SELECT: Allow any user (including anonymous) to read lessons
CREATE POLICY "bible_study_lessons_select_policy" ON bible_study_lessons
  FOR SELECT
  USING (true);

-- INSERT: Admins within their org or superadmin, based on parent study
CREATE POLICY "bible_study_lessons_insert_policy" ON bible_study_lessons
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM bible_studies s
      WHERE s.id = bible_study_lessons.study_id
        AND (
          public.current_user_role() = 'superadmin' OR (
            public.current_user_role() = 'admin' AND
            s.owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
          )
        )
    )
  );

-- UPDATE: Admins within their org or superadmin, based on parent study
CREATE POLICY "bible_study_lessons_update_policy" ON bible_study_lessons
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM bible_studies s
      WHERE s.id = bible_study_lessons.study_id
        AND (
          public.current_user_role() = 'superadmin' OR (
            public.current_user_role() = 'admin' AND
            s.owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM bible_studies s
      WHERE s.id = bible_study_lessons.study_id
        AND (
          public.current_user_role() = 'superadmin' OR (
            public.current_user_role() = 'admin' AND
            s.owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
          )
        )
    )
  );

-- DELETE: Admins within their org or superadmin, based on parent study
CREATE POLICY "bible_study_lessons_delete_policy" ON bible_study_lessons
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM bible_studies s
      WHERE s.id = bible_study_lessons.study_id
        AND (
          public.current_user_role() = 'superadmin' OR (
            public.current_user_role() = 'admin' AND
            s.owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
          )
        )
    )
  );

-- user_study_progress table policies
DROP POLICY IF EXISTS "user_study_progress_select_policy" ON user_study_progress;
DROP POLICY IF EXISTS "user_study_progress_insert_policy" ON user_study_progress;
DROP POLICY IF EXISTS "user_study_progress_update_policy" ON user_study_progress;
DROP POLICY IF EXISTS "user_study_progress_delete_policy" ON user_study_progress;

-- SELECT: Users can only see their own progress, admins/superadmins can see all
CREATE POLICY "user_study_progress_select_policy" ON user_study_progress
  FOR SELECT
  USING (
    (auth.uid() = user_id) OR 
    public.current_user_role() IN ('admin', 'superadmin')
  );

-- INSERT: Users can only insert their own progress
CREATE POLICY "user_study_progress_insert_policy" ON user_study_progress
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- UPDATE: Users can only update their own progress, admins/superadmins can update any
CREATE POLICY "user_study_progress_update_policy" ON user_study_progress
  FOR UPDATE
  USING (
    (auth.uid() = user_id) OR 
    public.current_user_role() IN ('admin', 'superadmin')
  );

-- DELETE: Users can only delete their own progress, admins/superadmins can delete any
CREATE POLICY "user_study_progress_delete_policy" ON user_study_progress
  FOR DELETE
  USING (
    (auth.uid() = user_id) OR 
    public.current_user_role() IN ('admin', 'superadmin')
  );

-- ai_outlines table policies (admin-only)
DROP POLICY IF EXISTS "ai_outlines_select_policy" ON ai_outlines;
DROP POLICY IF EXISTS "ai_outlines_insert_policy" ON ai_outlines;
DROP POLICY IF EXISTS "ai_outlines_update_policy" ON ai_outlines;
DROP POLICY IF EXISTS "ai_outlines_delete_policy" ON ai_outlines;

-- SELECT: Only admin or superadmin can view outlines
CREATE POLICY "ai_outlines_select_policy" ON ai_outlines
  FOR SELECT
  USING (
    public.current_user_role() IN ('admin', 'superadmin')
  );

-- INSERT: Only admin or superadmin can create outlines
CREATE POLICY "ai_outlines_insert_policy" ON ai_outlines
  FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('admin', 'superadmin')
  );

-- UPDATE: Only admin or superadmin can update outlines
CREATE POLICY "ai_outlines_update_policy" ON ai_outlines
  FOR UPDATE
  USING (
    public.current_user_role() IN ('admin', 'superadmin')
  );

-- DELETE: Admins and superadmins
CREATE POLICY "ai_outlines_delete_policy" ON ai_outlines
  FOR DELETE
  USING (
    public.current_user_role() IN ('admin', 'superadmin')
  );

-- Add explanatory comments
COMMENT ON TABLE bible_studies IS 'Bible studies with RLS: read=all, write=admin(superadmin override), delete=admin within org or superadmin';
COMMENT ON TABLE bible_study_lessons IS 'Lessons with RLS: read=all, write/delete=admin within org or superadmin via parent study';
COMMENT ON TABLE user_study_progress IS 'User study progress with RLS: read/write=own or admin/superadmin';
COMMENT ON TABLE ai_outlines IS 'AI-generated study outlines with RLS: admin/superadmin operations only';

-- =================================================================
-- Instructions for running this script
-- =================================================================
/*
To run this migration script:

1. Log in to your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste this entire script
4. Click "Run" to execute the script
5. Check for any errors in the output

This script is idempotent and can be safely run multiple times.
It will not overwrite existing data, only add missing tables and columns.

After running this script, you should:
1. Verify that all tables were created successfully
2. Check that RLS policies are working as expected
3. Create at least one admin user in the profiles table
4. Configure any additional settings needed for your application
*/
