export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OpeningHours = {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
};

export type AvailabilityStatus = 'green' | 'orange' | 'red';

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export type ServiceCategory = 
  | 'oil_change' 
  | 'small_service' 
  | 'major_service' 
  | 'tire_change' 
  | 'brakes' 
  | 'airco_service' 
  | 'apk' 
  | 'diagnostics' 
  | 'bodywork' 
  | 'electrical' 
  | 'exhaust' 
  | 'suspension' 
  | 'other';

export type UserRole = 'consumer' | 'garage_owner';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          role: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      garages: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          address: string;
          city: string;
          province: string;
          country: string;
          postal_code: string;
          latitude: number;
          longitude: number;
          phone: string;
          email: string | null;
          website: string | null;
          logo_url: string | null;
          photos: string[];
          specializations: string[];
          brands_serviced: string[];
          is_ev_specialist: boolean;
          opening_hours: OpeningHours;
          availability_status: AvailabilityStatus;
          average_rating: number;
          total_reviews: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          address: string;
          city: string;
          province: string;
          country?: string;
          postal_code: string;
          latitude: number;
          longitude: number;
          phone: string;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
          photos?: string[];
          specializations?: string[];
          brands_serviced?: string[];
          is_ev_specialist?: boolean;
          opening_hours: OpeningHours;
          availability_status?: AvailabilityStatus;
          average_rating?: number;
          total_reviews?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          address?: string;
          city?: string;
          province?: string;
          country?: string;
          postal_code?: string;
          latitude?: number;
          longitude?: number;
          phone?: string;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
          photos?: string[];
          specializations?: string[];
          brands_serviced?: string[];
          is_ev_specialist?: boolean;
          opening_hours?: OpeningHours;
          availability_status?: AvailabilityStatus;
          average_rating?: number;
          total_reviews?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      garage_services: {
        Row: {
          id: string;
          garage_id: string;
          category: ServiceCategory;
          name: string;
          description: string | null;
          price_from: number;
          price_to: number;
          duration_minutes: number;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          garage_id: string;
          category: ServiceCategory;
          name: string;
          description?: string | null;
          price_from: number;
          price_to: number;
          duration_minutes: number;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          garage_id?: string;
          category?: ServiceCategory;
          name?: string;
          description?: string | null;
          price_from?: number;
          price_to?: number;
          duration_minutes?: number;
          is_available?: boolean;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          garage_id: string;
          service_id: string;
          date: string;
          time_slot: string;
          status: BookingStatus;
          car_brand: string | null;
          car_model: string | null;
          car_year: number | null;
          car_license_plate: string | null;
          car_mileage: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          garage_id: string;
          service_id: string;
          date: string;
          time_slot: string;
          status?: BookingStatus;
          car_brand?: string | null;
          car_model?: string | null;
          car_year?: number | null;
          car_license_plate?: string | null;
          car_mileage?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          garage_id?: string;
          service_id?: string;
          date?: string;
          time_slot?: string;
          status?: BookingStatus;
          car_brand?: string | null;
          car_model?: string | null;
          car_year?: number | null;
          car_license_plate?: string | null;
          car_mileage?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      availability_slots: {
        Row: {
          id: string;
          garage_id: string;
          date: string;
          time_slot: string;
          is_available: boolean;
          booking_id: string | null;
        };
        Insert: {
          id?: string;
          garage_id: string;
          date: string;
          time_slot: string;
          is_available?: boolean;
          booking_id?: string | null;
        };
        Update: {
          id?: string;
          garage_id?: string;
          date?: string;
          time_slot?: string;
          is_available?: boolean;
          booking_id?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          garage_id: string;
          booking_id: string | null;
          rating: number;
          comment: string | null;
          service_quality: number | null;
          honesty: number | null;
          speed: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          garage_id: string;
          booking_id?: string | null;
          rating: number;
          comment?: string | null;
          service_quality?: number | null;
          honesty?: number | null;
          speed?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          garage_id?: string;
          booking_id?: string | null;
          rating?: number;
          comment?: string | null;
          service_quality?: number | null;
          honesty?: number | null;
          speed?: number | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Garage = Database['public']['Tables']['garages']['Row'];
export type GarageService = Database['public']['Tables']['garage_services']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];

export type BookingWithDetails = Booking & {
  profile?: Profile;
  service?: GarageService;
};

export type ReviewWithProfile = Review & {
  profile?: Profile;
};
