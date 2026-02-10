import { AvailabilityStatus, GarageService, ServiceCategory } from '../types';

// Mock garage data for development
// This will be replaced with real Supabase data once connected

interface MockGarage {
  id: string;
  name: string;
  city: string;
  province: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  availability_status: AvailabilityStatus;
  average_rating: number;
  total_reviews: number;
  brands_serviced: string[];
  specializations: string[];
  is_ev_specialist: boolean;
  opening_hours: {
    today: string;
    next_slot: string;
  };
  services: MockService[];
}

interface MockService {
  id: string;
  category: ServiceCategory;
  name: string;
  price_from: number;
  price_to: number;
  duration_minutes: number;
}

export const MOCK_GARAGES: MockGarage[] = [
  {
    id: '1',
    name: 'AutoService Van Dijk',
    city: 'Amsterdam',
    province: 'Noord-Holland',
    address: 'Industrieweg 45, 1099 AB Amsterdam',
    latitude: 52.3676,
    longitude: 4.9041,
    phone: '+31 20 123 4567',
    availability_status: 'green',
    average_rating: 4.7,
    total_reviews: 234,
    brands_serviced: ['BMW', 'Mercedes', 'Audi', 'Volkswagen'],
    specializations: ['Duitse merken', 'Diagnose'],
    is_ev_specialist: false,
    opening_hours: {
      today: '08:00 – 18:00',
      next_slot: 'Vandaag 14:30',
    },
    services: [
      { id: 's1', category: 'apk', name: 'APK Keuring', price_from: 29, price_to: 39, duration_minutes: 30 },
      { id: 's2', category: 'oil_change', name: 'Oliebeurt', price_from: 89, price_to: 149, duration_minutes: 45 },
      { id: 's3', category: 'small_service', name: 'Kleine beurt', price_from: 149, price_to: 229, duration_minutes: 60 },
      { id: 's4', category: 'major_service', name: 'Grote beurt', price_from: 299, price_to: 499, duration_minutes: 120 },
      { id: 's5', category: 'brakes', name: 'Remmen vervangen', price_from: 149, price_to: 349, duration_minutes: 90 },
      { id: 's6', category: 'diagnostics', name: 'Diagnose', price_from: 59, price_to: 89, duration_minutes: 30 },
    ],
  },
  {
    id: '2',
    name: 'Garage De Groot',
    city: 'Rotterdam',
    province: 'Zuid-Holland',
    address: 'Havenstraat 12, 3011 TG Rotterdam',
    latitude: 51.9244,
    longitude: 4.4777,
    phone: '+31 10 987 6543',
    availability_status: 'orange',
    average_rating: 4.3,
    total_reviews: 156,
    brands_serviced: ['Toyota', 'Honda', 'Nissan', 'Mazda'],
    specializations: ['Japanse merken', 'Hybride'],
    is_ev_specialist: false,
    opening_hours: {
      today: '08:30 – 17:30',
      next_slot: 'Morgen 09:00',
    },
    services: [
      { id: 's7', category: 'apk', name: 'APK Keuring', price_from: 24, price_to: 34, duration_minutes: 30 },
      { id: 's8', category: 'oil_change', name: 'Oliebeurt', price_from: 79, price_to: 129, duration_minutes: 45 },
      { id: 's9', category: 'tire_change', name: 'Bandenwissel', price_from: 39, price_to: 69, duration_minutes: 30 },
      { id: 's10', category: 'airco_service', name: 'Airco-service', price_from: 69, price_to: 99, duration_minutes: 45 },
      { id: 's11', category: 'small_service', name: 'Kleine beurt', price_from: 129, price_to: 199, duration_minutes: 60 },
      { id: 's12', category: 'major_service', name: 'Grote beurt', price_from: 249, price_to: 449, duration_minutes: 120 },
    ],
  },
  {
    id: '3',
    name: 'EV Centrum Utrecht',
    city: 'Utrecht',
    province: 'Utrecht',
    address: 'Stationsplein 8, 3511 ED Utrecht',
    latitude: 52.0907,
    longitude: 5.1214,
    phone: '+31 30 456 7890',
    availability_status: 'green',
    average_rating: 4.9,
    total_reviews: 89,
    brands_serviced: ['Tesla', 'Volkswagen', 'BMW', 'Hyundai'],
    specializations: ['Elektrische voertuigen', 'Software updates'],
    is_ev_specialist: true,
    opening_hours: {
      today: '09:00 – 18:00',
      next_slot: 'Vandaag 15:00',
    },
    services: [
      { id: 's13', category: 'diagnostics', name: 'EV Diagnose', price_from: 79, price_to: 119, duration_minutes: 45 },
      { id: 's14', category: 'brakes', name: 'Remmen controle', price_from: 49, price_to: 89, duration_minutes: 30 },
      { id: 's15', category: 'tire_change', name: 'Bandenwissel', price_from: 49, price_to: 79, duration_minutes: 30 },
      { id: 's16', category: 'electrical', name: 'Accu check', price_from: 99, price_to: 149, duration_minutes: 60 },
      { id: 's17', category: 'small_service', name: 'EV Onderhoudsbeurt', price_from: 149, price_to: 249, duration_minutes: 60 },
      { id: 's18', category: 'apk', name: 'APK Keuring', price_from: 34, price_to: 44, duration_minutes: 30 },
    ],
  },
  {
    id: '4',
    name: 'Bakker Autoservice',
    city: 'Den Haag',
    province: 'Zuid-Holland',
    address: 'Loosduinsekade 22, 2571 BH Den Haag',
    latitude: 52.0705,
    longitude: 4.3007,
    phone: '+31 70 111 2233',
    availability_status: 'red',
    average_rating: 4.1,
    total_reviews: 312,
    brands_serviced: ['Alle merken'],
    specializations: ['APK specialist', 'Snel service'],
    is_ev_specialist: false,
    opening_hours: {
      today: '07:30 – 18:00',
      next_slot: 'Overmorgen 08:00',
    },
    services: [
      { id: 's19', category: 'apk', name: 'APK Keuring', price_from: 19, price_to: 29, duration_minutes: 25 },
      { id: 's20', category: 'oil_change', name: 'Oliebeurt', price_from: 69, price_to: 119, duration_minutes: 40 },
      { id: 's21', category: 'tire_change', name: 'Bandenwissel', price_from: 29, price_to: 49, duration_minutes: 25 },
      { id: 's22', category: 'small_service', name: 'Kleine beurt', price_from: 119, price_to: 189, duration_minutes: 55 },
      { id: 's23', category: 'major_service', name: 'Grote beurt', price_from: 229, price_to: 399, duration_minutes: 110 },
      { id: 's24', category: 'exhaust', name: 'Uitlaat reparatie', price_from: 89, price_to: 249, duration_minutes: 60 },
    ],
  },
  {
    id: '5',
    name: 'Premium Cars Eindhoven',
    city: 'Eindhoven',
    province: 'Noord-Brabant',
    address: 'Fellenoord 100, 5611 ZB Eindhoven',
    latitude: 51.4416,
    longitude: 5.4697,
    phone: '+31 40 555 6677',
    availability_status: 'green',
    average_rating: 4.6,
    total_reviews: 178,
    brands_serviced: ['BMW', 'Porsche', 'Mercedes', 'Audi'],
    specializations: ['Premium merken', 'Performance tuning'],
    is_ev_specialist: false,
    opening_hours: {
      today: '08:00 – 17:00',
      next_slot: 'Vandaag 16:00',
    },
    services: [
      { id: 's25', category: 'oil_change', name: 'Premium oliebeurt', price_from: 129, price_to: 199, duration_minutes: 50 },
      { id: 's26', category: 'major_service', name: 'Grote beurt premium', price_from: 449, price_to: 799, duration_minutes: 180 },
      { id: 's27', category: 'brakes', name: 'Performance remmen', price_from: 299, price_to: 599, duration_minutes: 120 },
      { id: 's28', category: 'diagnostics', name: 'Uitgebreide diagnose', price_from: 89, price_to: 149, duration_minutes: 60 },
      { id: 's29', category: 'suspension', name: 'Ophanging sport', price_from: 399, price_to: 899, duration_minutes: 180 },
      { id: 's30', category: 'apk', name: 'APK Keuring', price_from: 39, price_to: 49, duration_minutes: 35 },
    ],
  },
];
