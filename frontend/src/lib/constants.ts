import { ServiceCategory } from '@/types/database';

// Service category labels in Dutch
export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  oil_change: 'Oliebeurt',
  small_service: 'Kleine beurt',
  major_service: 'Grote beurt',
  tire_change: 'Bandenwissel',
  brakes: 'Remmen',
  airco_service: 'Airco-service',
  apk: 'APK Keuring',
  diagnostics: 'Diagnose',
  bodywork: 'Carrosserie',
  electrical: 'Elektrisch',
  exhaust: 'Uitlaat',
  suspension: 'Ophanging',
  other: 'Overig',
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'oil_change',
  'small_service',
  'major_service',
  'tire_change',
  'brakes',
  'airco_service',
  'apk',
  'diagnostics',
  'bodywork',
  'electrical',
  'exhaust',
  'suspension',
  'other',
];

// Common car brands
export const CAR_BRANDS = [
  'Audi',
  'BMW',
  'Citroën',
  'Dacia',
  'Fiat',
  'Ford',
  'Honda',
  'Hyundai',
  'Kia',
  'Mazda',
  'Mercedes-Benz',
  'Mini',
  'Mitsubishi',
  'Nissan',
  'Opel',
  'Peugeot',
  'Renault',
  'Seat',
  'Škoda',
  'Suzuki',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
];

// Specializations in Dutch
export const SPECIALIZATIONS = [
  'Duitse merken',
  'Japanse merken',
  'Franse merken',
  'Koreaanse merken',
  'Amerikaanse merken',
  'EV specialist',
  'APK specialist',
  'Klassieke auto\'s',
  'Sportauto\'s',
  'Bedrijfswagens',
  'Hybrid voertuigen',
  'Dieselmotoren',
];

// Dutch provinces
export const PROVINCES = [
  'Drenthe',
  'Flevoland',
  'Friesland',
  'Gelderland',
  'Groningen',
  'Limburg',
  'Noord-Brabant',
  'Noord-Holland',
  'Overijssel',
  'Utrecht',
  'Zeeland',
  'Zuid-Holland',
];

// Days of the week in Dutch
export const WEEKDAYS = [
  { key: 'monday', label: 'Maandag' },
  { key: 'tuesday', label: 'Dinsdag' },
  { key: 'wednesday', label: 'Woensdag' },
  { key: 'thursday', label: 'Donderdag' },
  { key: 'friday', label: 'Vrijdag' },
  { key: 'saturday', label: 'Zaterdag' },
  { key: 'sunday', label: 'Zondag' },
] as const;

// Booking status labels in Dutch
export const BOOKING_STATUS_LABELS = {
  pending: 'In afwachting',
  confirmed: 'Bevestigd',
  in_progress: 'Bezig',
  completed: 'Voltooid',
  cancelled: 'Geannuleerd',
  no_show: 'Niet komen opdagen',
};

// Availability status labels in Dutch
export const AVAILABILITY_STATUS_LABELS = {
  green: 'Veel plek',
  orange: 'Beperkt',
  red: 'Vol vandaag',
};

// Time slots (30 minute intervals from 08:00 to 18:00)
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];
