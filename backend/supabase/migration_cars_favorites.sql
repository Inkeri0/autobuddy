-- ============================================
-- AutoBuddy - Migration: Cars & Favorites tables
-- Run this in the Supabase SQL Editor
-- ============================================

-- ============================================
-- CARS TABLE
-- ============================================
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  license_plate TEXT NOT NULL,
  mileage INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enforce only one default car per user
CREATE UNIQUE INDEX idx_cars_one_default_per_user
  ON public.cars (user_id) WHERE is_default = TRUE;

CREATE INDEX idx_cars_user_id ON public.cars(user_id);

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, garage_id)
);

CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_garage_id ON public.favorites(garage_id);

-- ============================================
-- ROW LEVEL SECURITY — Cars
-- ============================================
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cars" ON public.cars
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cars" ON public.cars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cars" ON public.cars
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cars" ON public.cars
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ROW LEVEL SECURITY — Favorites
-- ============================================
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);
