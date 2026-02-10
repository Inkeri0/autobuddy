# AutoBuddy - Project Plan & Documentation

## Overview

AutoBuddy is an AI-driven auto & garage platform combining the functionality of AutoScout, Google Maps, and a smart AI assistant. Built with **React Native (Expo)** and **Supabase**.

Users can find garages for maintenance, search for cars, upload photos for AI recognition, book appointments, and get intelligent pricing and maintenance advice - all from one app for iOS and Android.

---

## Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Frontend     | React Native (Expo) + TypeScript  |
| Backend      | Supabase (PostgreSQL, Auth, Edge Functions, Realtime, Storage) |
| Maps         | React Native Maps / Mapbox        |
| AI           | Claude / OpenAI Vision API        |
| Payments     | Stripe / Mollie                   |
| Deployment   | Expo EAS (iOS & Android builds)   |

---

## Phased Roadmap

### Phase 1 - Garage & Maintenance Platform (MVP)

**Goal:** Users find garages, see services/prices/availability, and book appointments.

**Status:** `IN PROGRESS`

| # | Task | Status |
|---|------|--------|
| 1.1 | Project setup - Expo + TypeScript, Supabase project, navigation (React Navigation), folder structure | DONE |
| 1.2 | Authentication - Sign up / login / guest mode via Supabase Auth (email + Google/Apple) | DONE |
| 1.3 | Database schema - Users, garages, services, bookings, availability tables | DONE |
| 1.4 | Garage profiles - Specializations, services offered, contact info, photos | DONE |
| 1.5 | Service search & filters - Find garages by service type (oliebeurt, grote beurt, bandenwissel, APK, airco, remmen), location, specialization | DONE |
| 1.6 | Indicative pricing - Per garage per service with regional average comparison (cheap/normal/expensive) | DONE |
| 1.7 | Map view with garage pins - Interactive map with clustering, color-coded pins, filtered garage list | DONE |
| 1.8 | Live availability / drukte - Green/orange/red status, next available slot | DONE |
| 1.9 | Booking calendar - Pick day + time + service + car info → garage receives werkbon | DONE |
| 1.10 | Garage dashboard (web portal) - Garages manage profile, services, pricing, availability, bookings | IN PROGRESS (Lovable) |
| 1.11 | Connect real Supabase project (create project + paste URL/key) | DONE |
| 1.12 | Real data integration - All screens fetch from Supabase instead of mock data | DONE |
| 1.13 | Schema migration - ENUMs to match Lovable dashboard expectations | DONE |

---

### Phase 2 - Car Search & Listings

**Goal:** Users search for cars via filters and see them on the map at garages/dealers.

**Status:** `NOT STARTED`

| # | Task | Status |
|---|------|--------|
| 2.1 | Car search with filters - Budget, merk, model, bouwjaar, brandstof, km-stand, transmissie | - |
| 2.2 | Car listings database - Garages list cars for sale via dashboard | - |
| 2.3 | Car detail screen - Full info page (price, km, fuel, photos, specs) | - |
| 2.4 | Map integration - Car listings shown at garage pins | - |
| 2.5 | Garage pin expansion - Tap pin → see services AND cars for sale | - |

---

### Phase 3 - AI Photo Recognition & Lookalike Search

**Goal:** Upload a photo, AI identifies the car, find similar ones nearby.

**Status:** `NOT STARTED`

| # | Task | Status |
|---|------|--------|
| 3.1 | Camera/gallery integration - Pick or take a photo | - |
| 3.2 | AI car recognition - Vision API detects make, model, generation, color, engine type | - |
| 3.3 | Lookalike matching - Query DB for same/similar models in region | - |
| 3.4 | Smart suggestions - Budget-aware alternatives when exact match is too expensive | - |

---

### Phase 4 - Communication & Trust

**Goal:** Build confidence through data, reviews, and secure messaging.

**Status:** `NOT STARTED`

| # | Task | Status |
|---|------|--------|
| 4.1 | In-app chat - User <-> garage messaging, photo sharing, quote requests | - |
| 4.2 | AI chat assistant - General car questions, parts lookup for specific cars | - |
| 4.3 | Reviews & ratings - Star ratings + short reviews for garages (service, honesty, speed) | - |
| 4.4 | Vehicle history checks - RDW integration: km-stand, schade, import, eigenaren | - |
| 4.5 | User rating system - Everyone gets a rating, no-show tracking | - |

---

### Phase 5 - Smart AI Features & Price Intelligence

**Goal:** AI becomes a true "AutoBuddy" assistant.

**Status:** `NOT STARTED`

| # | Task | Status |
|---|------|--------|
| 5.1 | Price check / market value - Compare asking price with regional averages | - |
| 5.2 | Maintenance advisor - Kenteken + km → predicted upcoming maintenance + garage suggestions | - |
| 5.3 | Inruil & waardebepaling - AI estimates your car's trade-in value | - |
| 5.4 | Garage bidding on trade-ins - Garages can bid on user's car | - |

---

### Phase 6 - Monetization & Payments

**Goal:** Revenue streams for the platform.

**Status:** `NOT STARTED`

| # | Task | Status |
|---|------|--------|
| 6.1 | Payment integration - Stripe / Mollie | - |
| 6.2 | Commission on bookings - % on maintenance appointments booked via app | - |
| 6.3 | Commission on car deals - % on cars sold via platform | - |
| 6.4 | Garage subscriptions - Paid tiers for visibility, top positions, planning tools | - |
| 6.5 | Lead generation - Pay-per-contact model for garages | - |
| 6.6 | No-show sanctions - Penalty system for missed appointments | - |

---

### Phase 7 - Favorites, Alerts & Financial Tools

**Goal:** Retention features that keep users coming back.

**Status:** `NOT STARTED`

| # | Task | Status |
|---|------|--------|
| 7.1 | Favorites - Save cars to a list | - |
| 7.2 | Alerts - Notify when new cars match filters or saved car drops in price | - |
| 7.3 | Financing calculator - Monthly cost estimation | - |
| 7.4 | Insurance estimate - Indicative premium range | - |

---

### Phase 8 - Internationalization & Scale

**Goal:** Multi-country, multi-language expansion.

**Status:** `NOT STARTED`

| # | Task | Status |
|---|------|--------|
| 8.1 | Multi-language - Nederlands, Engels, Duits, Frans, etc. | - |
| 8.2 | Multi-country - Country-specific rules (APK vs TUV vs MOT) | - |
| 8.3 | Regional data sources - Different vehicle databases per country | - |
| 8.4 | Privacy & GDPR - Manual region selection, location consent, data protection | - |

---

## Business Model

| Revenue Stream | Description |
|----------------|-------------|
| Booking commission | % on maintenance appointments booked through app |
| Car deal commission | % on cars sold via the platform |
| Garage subscriptions | Paid tiers for extra visibility, top positions, planning tools |
| Lead generation | Pay-per-contact model for garages |
| Premium listings | Garages pay for highlighted/promoted listings |

The app is **free for consumers** in its base form.

---

## Key Features Summary

- **Garage search & booking** - Find, compare, and book maintenance at nearby garages
- **Live availability** - Green/orange/red drukte status per garage
- **Car search & listings** - Filter-based car search with map visualization
- **AI photo recognition** - Upload a photo → identify car → find similar ones
- **Price intelligence** - Under/over market value analysis
- **In-app chat** - Secure communication between users and garages
- **Reviews & ratings** - Community-driven trust system for garages AND users
- **Vehicle history** - RDW integration for km-check, schade, import status
- **Maintenance advisor** - AI predicts upcoming maintenance needs
- **Trade-in valuation** - AI estimates your car's value
- **Financial tools** - Financing calculator, insurance estimates
- **Multi-language & multi-country** - International expansion ready

---

## Changelog

| Date | Description |
|------|-------------|
| 2026-02-07 | Initial project plan created. Tech stack decided: Expo + Supabase. Phases defined with garage & maintenance as MVP priority. |
| 2026-02-07 | Phase 1 scaffolding complete: Project setup, auth, all core screens (Home, Search, Map, GarageDetail, Booking, Profile, Login), navigation, types, mock data, Supabase schema SQL. TypeScript compiles with 0 errors. |
| 2026-02-07 | Supabase connected: URL + anon key configured. Schema migrated to ENUMs for Lovable compatibility. Garage dashboard started in Lovable (separate web portal for garage owners). |
| 2026-02-07 | Real data integration: All screens (Home, Search, Map, GarageDetail, Booking) now fetch from Supabase. Created garageService.ts (data layer) + useGarages.ts (hooks). Bookings create real records in DB. TypeScript 0 errors. |
| 2026-02-10 | Interactive map: Replaced placeholder MapScreen with react-native-maps + clustering. Color-coded pins (green/orange/red), callouts, region-filtered garage list. Centered on Maastricht. 16 mock garages seeded. |

