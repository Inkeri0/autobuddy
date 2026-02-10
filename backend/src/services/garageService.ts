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
