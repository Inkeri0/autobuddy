-- ============================================
-- AutoBuddy - Database Schema (Lovable-compatible)
-- Drops existing tables and recreates with ENUMs
-- ============================================

-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_garage_location ON garages;
DROP TRIGGER IF EXISTS on_review_change ON reviews;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_garage_location();
DROP FUNCTION IF EXISTS update_garage_rating();

-- Drop existing tables (order matters due to foreign keys)
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.availability_slots CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.garage_services CASCADE;
DROP TABLE IF EXISTS public.garages CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.availability_status CASCADE;
DROP TYPE IF EXISTS public.booking_status CASCADE;
DROP TYPE IF EXISTS public.service_category CASCADE;

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOM TYPES (ENUMs)
-- ============================================
CREATE TYPE public.user_role AS ENUM ('consumer', 'garage_owner');
CREATE TYPE public.availability_status AS ENUM ('green', 'orange', 'red');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.service_category AS ENUM (
  'oil_change', 'small_service', 'major_service', 'tire_change',
  'brakes', 'airco_service', 'apk', 'diagnostics',
  'bodywork', 'electrical', 'exhaust', 'suspension', 'other'
);

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'consumer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'consumer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- GARAGES
-- ============================================
CREATE TABLE public.garages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  country TEXT DEFAULT 'NL',
  postal_code TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  photos TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}',
  brands_serviced TEXT[] DEFAULT '{}',
  is_ev_specialist BOOLEAN DEFAULT FALSE,
  opening_hours JSONB NOT NULL DEFAULT '{
    "monday":    {"open": "08:00", "close": "17:30", "closed": false},
    "tuesday":   {"open": "08:00", "close": "17:30", "closed": false},
    "wednesday": {"open": "08:00", "close": "17:30", "closed": false},
    "thursday":  {"open": "08:00", "close": "17:30", "closed": false},
    "friday":    {"open": "08:00", "close": "17:30", "closed": false},
    "saturday":  {"open": "09:00", "close": "14:00", "closed": false},
    "sunday":    {"open": "00:00", "close": "00:00", "closed": true}
  }',
  availability_status availability_status DEFAULT 'green',
  average_rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GARAGE SERVICES
-- ============================================
CREATE TABLE public.garage_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  category service_category NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_from NUMERIC NOT NULL,
  price_to NUMERIC NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.garage_services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TIME NOT NULL,
  status booking_status DEFAULT 'pending',
  car_brand TEXT,
  car_model TEXT,
  car_year INTEGER,
  car_license_plate TEXT,
  car_mileage INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AVAILABILITY SLOTS
-- ============================================
CREATE TABLE public.availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  UNIQUE(garage_id, date, time_slot)
);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
  honesty INTEGER CHECK (honesty >= 1 AND honesty <= 5),
  speed INTEGER CHECK (speed >= 1 AND speed <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update garage average rating on review changes
CREATE OR REPLACE FUNCTION update_garage_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE garages SET
    average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE garage_id = COALESCE(NEW.garage_id, OLD.garage_id)),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE garage_id = COALESCE(NEW.garage_id, OLD.garage_id))
  WHERE id = COALESCE(NEW.garage_id, OLD.garage_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_garage_rating();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Public can view all profiles" ON public.profiles
  FOR SELECT USING (true);

-- Garages
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Garage owners can view own garage" ON public.garages
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Garage owners can insert own garage" ON public.garages
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Garage owners can update own garage" ON public.garages
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Public can view active garages" ON public.garages
  FOR SELECT USING (is_active = true);

-- Services
ALTER TABLE public.garage_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Garage owners can manage own services" ON public.garage_services
  FOR ALL USING (
    garage_id IN (SELECT id FROM public.garages WHERE owner_id = auth.uid())
  );
CREATE POLICY "Public can view available services" ON public.garage_services
  FOR SELECT USING (is_available = true);

-- Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Garage owners can view bookings for their garage" ON public.bookings
  FOR SELECT USING (
    garage_id IN (SELECT id FROM public.garages WHERE owner_id = auth.uid())
  );
CREATE POLICY "Garage owners can update bookings for their garage" ON public.bookings
  FOR UPDATE USING (
    garage_id IN (SELECT id FROM public.garages WHERE owner_id = auth.uid())
  );
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Availability
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Garage owners can manage own slots" ON public.availability_slots
  FOR ALL USING (
    garage_id IN (SELECT id FROM public.garages WHERE owner_id = auth.uid())
  );
CREATE POLICY "Public can view available slots" ON public.availability_slots
  FOR SELECT USING (is_available = true);

-- Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_garages_owner_id ON public.garages(owner_id);
CREATE INDEX idx_garages_city ON public.garages(city);
CREATE INDEX idx_garage_services_garage_id ON public.garage_services(garage_id);
CREATE INDEX idx_bookings_garage_id ON public.bookings(garage_id);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_availability_slots_garage_date ON public.availability_slots(garage_id, date);
CREATE INDEX idx_reviews_garage_id ON public.reviews(garage_id);
