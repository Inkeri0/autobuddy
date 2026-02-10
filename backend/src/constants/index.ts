import { ServiceCategory } from '../types';

// --- App Theme Colors ---
export const COLORS = {
  primary: '#1E3A5F',       // Deep blue - trust & professionalism
  primaryLight: '#2E5A8F',
  secondary: '#FF6B35',     // Orange - energy & action
  secondaryLight: '#FF8B5E',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',       // Green - available
  warning: '#F59E0B',       // Orange - limited
  danger: '#EF4444',        // Red - full / error
  white: '#FFFFFF',
  black: '#000000',
};

// --- Availability Status Colors ---
export const AVAILABILITY_COLORS = {
  green: COLORS.success,
  orange: COLORS.warning,
  red: COLORS.danger,
};

// --- Service Categories (NL labels) ---
export const SERVICE_LABELS: Record<ServiceCategory, string> = {
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

// --- Service Category Icons (emoji placeholders, replace with proper icons later) ---
export const SERVICE_ICONS: Record<ServiceCategory, string> = {
  oil_change: 'oil-can',
  small_service: 'wrench',
  major_service: 'tools',
  tire_change: 'tire',
  brakes: 'disc',
  airco_service: 'snowflake',
  apk: 'clipboard-check',
  diagnostics: 'laptop-code',
  bodywork: 'car-side',
  electrical: 'bolt',
  exhaust: 'smog',
  suspension: 'car',
  other: 'ellipsis-h',
};

// --- Default Map Region (Netherlands) ---
export const DEFAULT_MAP_REGION = {
  latitude: 52.1326,
  longitude: 5.2913,
  latitudeDelta: 3.5,
  longitudeDelta: 3.5,
};

// --- Initial Map Region (Maastricht) ---
export const MAASTRICHT_MAP_REGION = {
  latitude: 50.8514,
  longitude: 5.6910,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

// --- API / Supabase ---
export const SUPABASE_URL = 'https://onzllnshvfarlzyyejsy.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uemxsbnNodmZhcmx6eXllanN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODkyNTIsImV4cCI6MjA4NjA2NTI1Mn0.WNgUZw1HpjhXGJjeMdvWRO49WyeE0lJmga1cV77YEYo';
