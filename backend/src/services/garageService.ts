import { supabase } from './supabase';

// Fetch all active garages with their services
export async function fetchGarages() {
  const { data: garages, error } = await supabase
    .from('garages')
    .select('*')
    .eq('is_active', true)
    .order('average_rating', { ascending: false });

  if (error) throw error;
  return garages || [];
}

// Fetch a single garage by ID with its services
export async function fetchGarageById(garageId: string) {
  const { data: garage, error: garageError } = await supabase
    .from('garages')
    .select('*')
    .eq('id', garageId)
    .single();

  if (garageError) throw garageError;

  const { data: services, error: servicesError } = await supabase
    .from('garage_services')
    .select('*')
    .eq('garage_id', garageId)
    .eq('is_available', true)
    .order('price_from', { ascending: true });

  if (servicesError) throw servicesError;

  return { garage, services: services || [] };
}

// Fetch garages filtered by service category
export async function fetchGaragesByService(category: string) {
  const { data: serviceGarageIds, error: sError } = await supabase
    .from('garage_services')
    .select('garage_id')
    .eq('category', category)
    .eq('is_available', true);

  if (sError) throw sError;

  const garageIds = [...new Set((serviceGarageIds || []).map((s) => s.garage_id))];

  if (garageIds.length === 0) return [];

  const { data: garages, error } = await supabase
    .from('garages')
    .select('*')
    .in('id', garageIds)
    .eq('is_active', true);

  if (error) throw error;
  return garages || [];
}

// Fetch services for a specific garage
export async function fetchGarageServices(garageId: string) {
  const { data, error } = await supabase
    .from('garage_services')
    .select('*')
    .eq('garage_id', garageId)
    .eq('is_available', true)
    .order('price_from', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Create a booking
export async function createBooking(booking: {
  user_id: string;
  garage_id: string;
  service_id: string;
  date: string;
  time_slot: string;
  car_brand?: string;
  car_model?: string;
  car_year?: number;
  car_license_plate?: string;
  car_mileage?: number;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Fetch user's bookings
export async function fetchUserBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      garages:garage_id (name, city, phone),
      garage_services:service_id (name, category, price_from, price_to)
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch booking counts per garage for a specific date
export async function fetchBookingCountsByDate(date: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('bookings')
    .select('garage_id')
    .eq('date', date)
    .neq('status', 'cancelled');

  if (error) throw error;

  const counts: Record<string, number> = {};
  (data || []).forEach((b) => {
    counts[b.garage_id] = (counts[b.garage_id] || 0) + 1;
  });
  return counts;
}

// Fetch reviews for a garage
export async function fetchGarageReviews(garageId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles:user_id (full_name, avatar_url)
    `)
    .eq('garage_id', garageId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch a single booking by ID with full garage + service details
export async function fetchBookingById(bookingId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      garages:garage_id (*),
      garage_services:service_id (*)
    `)
    .eq('id', bookingId)
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// BOOKING ACTIONS
// ============================================

// Cancel a booking
export async function cancelBooking(bookingId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// CARS CRUD
// ============================================

export async function fetchUserCars(userId: string) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createCar(car: {
  user_id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  mileage?: number;
  photo_url?: string;
  is_default?: boolean;
}) {
  const { data, error } = await supabase
    .from('cars')
    .insert(car)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCar(carId: string, updates: {
  brand?: string;
  model?: string;
  year?: number;
  license_plate?: string;
  mileage?: number;
  photo_url?: string;
}) {
  const { data, error } = await supabase
    .from('cars')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', carId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCar(carId: string) {
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', carId);

  if (error) throw error;
}

export async function setDefaultCar(userId: string, carId: string) {
  // Unset current default
  await supabase
    .from('cars')
    .update({ is_default: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_default', true);

  // Set new default
  const { data, error } = await supabase
    .from('cars')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', carId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// CAR PHOTOS
// ============================================

export async function uploadCarPhoto(carId: string, uri: string): Promise<string> {
  const contentType = 'image/jpeg';
  const filePath = `${carId}.jpg`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('car-photos')
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('car-photos')
    .getPublicUrl(filePath);

  const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

  // Update the car record with the photo URL
  const { error: updateError } = await supabase
    .from('cars')
    .update({ photo_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', carId);

  if (updateError) throw updateError;

  return publicUrl;
}

// ============================================
// FAVORITES
// ============================================

export async function fetchUserFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      garages:garage_id (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addFavorite(userId: string, garageId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, garage_id: garageId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFavorite(userId: string, garageId: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('garage_id', garageId);

  if (error) throw error;
}

export async function isFavorited(userId: string, garageId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('garage_id', garageId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

// ============================================
// REVIEWS
// ============================================

// Check if user already reviewed a booking
export async function fetchReviewForBooking(userId: string, bookingId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Create a review
export async function createReview(review: {
  user_id: string;
  garage_id: string;
  booking_id: string;
  rating: number;
  comment?: string;
  service_quality: number;
  honesty: number;
  speed: number;
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) throw error;

  // Update garage average rating and total reviews via RPC
  // This calls a Supabase database function that bypasses RLS
  const { error: rpcError } = await supabase.rpc('update_garage_rating', {
    p_garage_id: review.garage_id,
  });

  if (rpcError) {
    // Fallback: try direct update (works if RLS allows it)
    console.warn('RPC update_garage_rating failed, trying direct update:', rpcError.message);
    const { data: stats } = await supabase
      .from('reviews')
      .select('rating')
      .eq('garage_id', review.garage_id);

    if (stats && stats.length > 0) {
      const total = stats.length;
      const avg = stats.reduce((sum, r) => sum + r.rating, 0) / total;
      const { error: updateErr } = await supabase
        .from('garages')
        .update({ average_rating: Math.round(avg * 10) / 10, total_reviews: total })
        .eq('id', review.garage_id);

      if (updateErr) {
        console.error('Direct garage rating update also failed:', updateErr.message);
      }
    }
  }

  return data;
}

// ============================================
// MAINTENANCE HISTORY
// ============================================

export async function fetchMaintenanceHistory(userId: string) {
  const { data, error } = await supabase
    .from('maintenance_records')
    .select(`
      *,
      garages:garage_id (name, city),
      bookings:booking_id (
        service_id,
        garage_services:service_id (name, category)
      )
    `)
    .eq('user_id', userId)
    .order('service_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchMaintenanceForCar(userId: string, licensePlate: string) {
  const { data, error } = await supabase
    .from('maintenance_records')
    .select(`
      *,
      garages:garage_id (name, city),
      bookings:booking_id (
        service_id,
        garage_services:service_id (name, category)
      )
    `)
    .eq('user_id', userId)
    .eq('car_license_plate', licensePlate)
    .order('service_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchNextApkDate(userId: string, licensePlate: string) {
  const { data, error } = await supabase
    .from('maintenance_records')
    .select('next_apk_date')
    .eq('user_id', userId)
    .eq('car_license_plate', licensePlate)
    .not('next_apk_date', 'is', null)
    .order('service_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.next_apk_date || null;
}

// ============================================
// DEV / SEED
// ============================================

// Seed a completed booking for testing the review flow
export async function seedCompletedBooking(userId: string) {
  // 1. Pick the first active garage
  const { data: garage, error: gErr } = await supabase
    .from('garages')
    .select('id, name')
    .eq('is_active', true)
    .limit(1)
    .single();

  if (gErr || !garage) throw new Error('Geen garages gevonden. Voeg eerst een garage toe.');

  // 2. Pick the first available service for that garage
  const { data: service, error: sErr } = await supabase
    .from('garage_services')
    .select('id, name')
    .eq('garage_id', garage.id)
    .eq('is_available', true)
    .limit(1)
    .single();

  if (sErr || !service) throw new Error(`Geen services gevonden voor ${garage.name}.`);

  // 3. Create a completed booking dated 3 days ago
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 3);
  const dateStr = pastDate.toISOString().split('T')[0];

  const { data: booking, error: bErr } = await supabase
    .from('bookings')
    .insert({
      user_id: userId,
      garage_id: garage.id,
      service_id: service.id,
      date: dateStr,
      time_slot: '10:00',
      status: 'completed',
      car_brand: 'BMW',
      car_model: '3 Serie',
      car_year: 2020,
      car_license_plate: 'AB-123-CD',
      car_mileage: 45000,
      notes: 'Graag ook banden checken',
    })
    .select()
    .single();

  if (bErr) throw bErr;
  return booking;
}
