// ============================================
// AutoBuddy - Core Type Definitions
// ============================================

// --- User Types ---
export type UserRole = 'consumer' | 'garage_owner';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

// --- Garage Types ---
export type AvailabilityStatus = 'green' | 'orange' | 'red';

export interface Garage {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  website?: string;
  logo_url?: string;
  photos: string[];
  specializations: string[];
  brands_serviced: string[];
  is_ev_specialist: boolean;
  opening_hours: OpeningHours;
  availability_status: AvailabilityStatus;
  average_rating: number;
  total_reviews: number;
  created_at: string;
}

export interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;   // e.g. "08:00"
  close: string;  // e.g. "17:30"
  closed: boolean;
}

// --- Service Types ---
export type ServiceCategory =
  | 'oil_change'        // Oliebeurt
  | 'small_service'     // Kleine beurt
  | 'major_service'     // Grote beurt
  | 'tire_change'       // Bandenwissel
  | 'brakes'            // Remmen
  | 'airco_service'     // Airco-service
  | 'apk'              // APK keuring
  | 'diagnostics'       // Diagnose
  | 'bodywork'          // Carrosserie
  | 'electrical'        // Elektrisch
  | 'exhaust'           // Uitlaat
  | 'suspension'        // Vering/ophanging
  | 'other';

export interface GarageService {
  id: string;
  garage_id: string;
  category: ServiceCategory;
  name: string;
  description?: string;
  price_from: number;
  price_to: number;
  duration_minutes: number;
  is_available: boolean;
}

// --- Booking Types ---
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Booking {
  id: string;
  user_id: string;
  garage_id: string;
  service_id: string;
  date: string;          // YYYY-MM-DD
  time_slot: string;     // HH:MM
  status: BookingStatus;
  car_brand?: string;
  car_model?: string;
  car_year?: number;
  car_license_plate?: string;
  car_mileage?: number;
  notes?: string;
  created_at: string;
  // Joined data
  garage?: Garage;
  service?: GarageService;
}

// --- Availability Types ---
export interface TimeSlot {
  time: string;        // e.g. "09:00"
  available: boolean;
}

export interface DayAvailability {
  date: string;        // YYYY-MM-DD
  slots: TimeSlot[];
}

// --- Map Types ---
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface GaragePin {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  garage: Garage;
  services: GarageService[];
}

// --- Filter Types ---
export interface GarageFilters {
  serviceCategory?: ServiceCategory;
  maxDistance?: number;      // in km
  minRating?: number;
  brand?: string;           // e.g. "BMW" for specialists
  availabilityStatus?: AvailabilityStatus;
  maxPrice?: number;
  isEvSpecialist?: boolean;
}

// --- Review Types ---
export interface Review {
  id: string;
  user_id: string;
  garage_id: string;
  booking_id?: string;
  rating: number;          // 1-5
  comment?: string;
  service_quality: number; // 1-5
  honesty: number;         // 1-5
  speed: number;           // 1-5
  created_at: string;
  user?: Pick<User, 'full_name' | 'avatar_url'>;
}

// --- Car Types ---
export interface Car {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  mileage?: number;
  photo_url?: string;
  is_default: boolean;
  created_at: string;
  updated_at?: string;
}

// --- Maintenance Record Types ---
export interface MaintenanceRecord {
  id: string;
  booking_id: string;
  garage_id: string;
  user_id: string;
  car_license_plate: string;
  car_brand?: string;
  car_model?: string;
  car_year?: number;
  mileage: number;
  work_description: string;
  service_date: string;     // YYYY-MM-DD
  next_apk_date?: string;   // YYYY-MM-DD
  created_at: string;
  // Joined data
  garage?: { name: string; city: string };
  booking?: { service_id: string; garage_services?: { name: string; category: string } };
}

// --- Favorite Types ---
export interface Favorite {
  id: string;
  user_id: string;
  garage_id: string;
  created_at: string;
  garage?: Garage;
}
