-- ============================================
-- AutoBuddy - Mock Garage Seed Data
-- Run this in Supabase SQL Editor
-- ============================================

-- Use existing garage owner profiles
-- Owner A: 3cb71569-cc67-4b99-bca8-508776ef5521
-- Owner B: 49ef0b7c-f799-46a7-ac3b-7902f37d2a8d

-- ============================================
-- GARAGES (10 diverse Dutch garages)
-- ============================================

INSERT INTO public.garages (id, owner_id, name, description, address, city, province, country, postal_code, latitude, longitude, phone, email, website, specializations, brands_serviced, is_ev_specialist, opening_hours, availability_status, average_rating, total_reviews, is_active)
VALUES
-- 1. Amsterdam - Premium BMW specialist
('11111111-1111-1111-1111-111111111111',
 '3cb71569-cc67-4b99-bca8-508776ef5521',
 'AutoPro Amsterdam',
 'Gespecialiseerd in BMW en MINI. Al 15 jaar de #1 BMW specialist van Amsterdam. Originele onderdelen, gecertificeerde monteurs.',
 'Spaklerweg 42', 'Amsterdam', 'Noord-Holland', 'NL', '1096BA',
 52.3402, 4.9178, '020-555-0101', 'info@autoproadam.nl', 'https://autoproadam.nl',
 ARRAY['BMW Specialist', 'MINI Specialist', 'Diagnose'],
 ARRAY['BMW', 'MINI'],
 false,
 '{"monday":{"open":"07:30","close":"18:00","closed":false},"tuesday":{"open":"07:30","close":"18:00","closed":false},"wednesday":{"open":"07:30","close":"18:00","closed":false},"thursday":{"open":"07:30","close":"18:00","closed":false},"friday":{"open":"07:30","close":"17:00","closed":false},"saturday":{"open":"09:00","close":"14:00","closed":false},"sunday":{"open":"00:00","close":"00:00","closed":true}}'::jsonb,
 'green', 4.7, 128, true),

-- 2. Rotterdam - Budget-friendly allrounder
('22222222-2222-2222-2222-222222222222',
 '49ef0b7c-f799-46a7-ac3b-7902f37d2a8d',
 'Garage de Maas',
 'Betaalbaar en betrouwbaar! Wij werken aan alle merken. Geen onverwachte kosten, altijd een duidelijke offerte vooraf.',
 'Maashaven Zuidzijde 100', 'Rotterdam', 'Zuid-Holland', 'NL', '3083AV',
 51.8975, 4.4900, '010-555-0202', 'info@garagedemaas.nl', NULL,
 ARRAY['Alle merken', 'APK Station', 'Bandenservice'],
 ARRAY['Volkswagen', 'Opel', 'Renault', 'Peugeot', 'Ford', 'Toyota'],
 false,
 '{"monday":{"open":"08:00","close":"17:30","closed":false},"tuesday":{"open":"08:00","close":"17:30","closed":false},"wednesday":{"open":"08:00","close":"17:30","closed":false},"thursday":{"open":"08:00","close":"17:30","closed":false},"friday":{"open":"08:00","close":"17:00","closed":false},"saturday":{"open":"09:00","close":"13:00","closed":false},"sunday":{"open":"00:00","close":"00:00","closed":true}}'::jsonb,
 'green', 4.2, 89, true),

-- 3. Utrecht - EV & Hybrid specialist
('33333333-3333-3333-3333-333333333333',
 '3cb71569-cc67-4b99-bca8-508776ef5521',
 'GreenDrive Utrecht',
 'De toekomst is elektrisch! Utrecht''s eerste volledig EV-gecertificeerde garage. Tesla, Polestar, Hyundai Ioniq - wij kennen ze allemaal.',
 'Kanaalweg 88', 'Utrecht', 'Utrecht', 'NL', '3526KL',
 52.0799, 5.1013, '030-555-0303', 'info@greendrive.nl', 'https://greendrive.nl',
 ARRAY['EV Specialist', 'Hybride', 'Accu Diagnose', 'Software Updates'],
 ARRAY['Tesla', 'Polestar', 'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz'],
 true,
 '{"monday":{"open":"08:00","close":"18:00","closed":false},"tuesday":{"open":"08:00","close":"18:00","closed":false},"wednesday":{"open":"08:00","close":"18:00","closed":false},"thursday":{"open":"08:00","close":"20:00","closed":false},"friday":{"open":"08:00","close":"17:00","closed":false},"saturday":{"open":"10:00","close":"16:00","closed":false},"sunday":{"open":"00:00","close":"00:00","closed":true}}'::jsonb,
 'orange', 4.9, 67, true),

-- 4. Den Haag - Mercedes & luxury specialist
('44444444-4444-4444-4444-444444444444',
 '49ef0b7c-f799-46a7-ac3b-7902f37d2a8d',
 'Premium Cars Den Haag',
 'Luxe verdient de beste zorg. Gespecialiseerd in Mercedes-Benz, Audi en Volvo. Haal- en brengservice beschikbaar.',
 'Binckhorstlaan 200', 'Den Haag', 'Zuid-Holland', 'NL', '2516BC',
 52.0689, 4.3259, '070-555-0404', 'service@premiumcars.nl', 'https://premiumcarsdh.nl',
 ARRAY['Mercedes Specialist', 'Audi Specialist', 'Volvo Specialist', 'Haal/Breng Service'],
 ARRAY['Mercedes-Benz', 'Audi', 'Volvo'],
 false,
 '{"monday":{"open":"08:00","close":"17:30","closed":false},"tuesday":{"open":"08:00","close":"17:30","closed":false},"wednesday":{"open":"08:00","close":"17:30","closed":false},"thursday":{"open":"08:00","close":"17:30","closed":false},"friday":{"open":"08:00","close":"17:00","closed":false},"saturday":{"open":"00:00","close":"00:00","closed":true},"sunday":{"open":"00:00","close":"00:00","closed":true}}'::jsonb,
 'green', 4.5, 156, true),

-- 5. Eindhoven - Japanese car specialist
('55555555-5555-5555-5555-555555555555',
 '3cb71569-cc67-4b99-bca8-508776ef5521',
 'Japan Auto Eindhoven',
 'Al 20 jaar specialist in Japanse auto''s. Van Toyota tot Mazda, van Subaru tot Lexus. Import auto''s geen probleem!',
 'Hurksestraat 44', 'Eindhoven', 'Noord-Brabant', 'NL', '5652AJ',
 51.4381, 5.4752, '040-555-0505', 'info@japanauto.nl', NULL,
 ARRAY['Japanse auto''s', 'Import specialist', 'Tuning'],
 ARRAY['Toyota', 'Honda', 'Mazda', 'Subaru', 'Nissan', 'Lexus', 'Mitsubishi', 'Suzuki'],
 false,
 '{"monday":{"open":"08:00","close":"17:00","closed":false},"tuesday":{"open":"08:00","close":"17:00","closed":false},"wednesday":{"open":"08:00","close":"17:00","closed":false},"thursday":{"open":"08:00","close":"17:00","closed":false},"friday":{"open":"08:00","close":"17:00","closed":false},"saturday":{"open":"09:00","close":"13:00","closed":false},"sunday":{"open":"00:00","close":"00:00","closed":true}}'::jsonb,
 'red', 4.6, 201, true),

-- 6. Groningen - Student-friendly budget garage
('66666666-6666-6666-6666-666666666666',
 '49ef0b7c-f799-46a7-ac3b-7902f37d2a8d',
 'Budget Garage Groningen',
 'Studenten & starter-vriendelijk! Scherpe prijzen zonder in te leveren op kwaliteit. Gratis check bij elke beurt.',
 'Peizerweg 150', 'Groningen', 'Groningen', 'NL', '9727KH',
 53.2194, 6.5322, '050-555-0606', 'info@budgetgarage050.nl', NULL,
 ARRAY['Budget vriendelijk', 'Studenten korting', 'Occasions'],
 ARRAY['Volkswagen', 'Opel', 'Ford', 'Renault', 'Peugeot', 'Citroën', 'Fiat'],
 false,
 '{"monday":{"open":"08:30","close":"17:00","closed":false},"tuesday":{"open":"08:30","close":"17:00","closed":false},"wednesday":{"open":"08:30","close":"17:00","closed":false},"thursday":{"open":"08:30","close":"17:00","closed":false},"friday":{"open":"08:30","close":"16:30","closed":false},"saturday":{"open":"00:00","close":"00:00","closed":true},"sunday":{"open":"00:00","close":"00:00","closed":true}}'::jsonb,
 'green', 4.0, 312, true),

-- 7. Tilburg - Full-service body & paint shop
('77777777-7777-7777-7777-777777777777',
 '3cb71569-cc67-4b99-bca8-508776ef5521',
 'Autoschade Tilburg',
 'Schade? Wij regelen het! Carrosserie, spuitwerk, deukherstel en verzekeringsclaims. Vervangend vervoer beschikbaar.',
 'Ringbaan-Oost 200', 'Tilburg', 'Noord-Brabant', 'NL', '5013CA',
 51.5607, 5.1019, '013-555-0707', 'schade@autoschadetilburg.nl', 'https://autoschadetilburg.nl',
 ARRAY['Carrosserie', 'Spuitwerk', 'Deukherstel', 'Verzekeringsclaims'],
 ARRAY['Alle merken'],
 false,
 '{"monday":{"open":"07:00","close":"17:30","closed":false},"tuesday":{"open":"07:00","close":"17:30","closed":false},"wednesday":{"open":"07:00","close":"17:30","closed":false},"thursday":{"open":"07:00","close":"17:30","closed":false},"friday":{"open":"07:00","close":"16:00","closed":false},"saturday":{"open":"00:00","close":"00:00","closed":true},"sunday":{"open":"00:00","close":"00:00","closed":true}}'::jsonb,
 'orange', 4.3, 94, true),

-- 8. Almere - Family garage with broad services
('88888888-8888-8888-8888-888888888888',
 '49ef0b7c-f799-46a7-ac3b-7902f37d2a8d',
 'Familiebedrijf Garage Visser',
 'Een familiebedrijf met hart voor auto''s. Al 3 generaties staan wij klaar voor onderhoud, reparatie en advies. Persoonlijke service gegarandeerd.',
 'Markerkant 10', 'Almere', 'Flevoland', 'NL', '1314AN',
 52.3788, 5.2147, '036-555-0808', 'info@garagevisser.nl', NULL,
 ARRAY['Familiebedrijf', 'Onderhoud', 'APK Station', 'Airco Service'],
 ARRAY['Volkswagen', 'Toyota', 'Kia', 'Hyundai', 'Skoda', 'Seat'],
 false,
 '{"monday":{"open":"08:00","close":"17:30","closed":false},"tuesday":{"open":"08:00","close":"17:30","closed":false},"wednesday":{"open":"08:00","close":"17:30","closed":false},"thursday":{"open":"08:00","close":"17:30","closed":false},"friday":{"open":"08:00","close":"17:00","closed":false},"saturday":{"open":"09:00","close":"15:00","closed":false},"sunday":{"open":"00:00","close":"00:00","closed":true}}'::jsonb,
 'green', 4.8, 245, true),

-- 9. Breda - Performance & tuning garage
('99999999-9999-9999-9999-999999999999',
 '3cb71569-cc67-4b99-bca8-508776ef5521',
 'Speed Garage Breda',
 'Voor de echte autoliefhebber! Chiptuning, sportuitlaten, verlaging, remupgrades en meer. Track day prep? Wij doen het!',
 'Emerweg 15', 'Breda', 'Noord-Brabant', 'NL', '4814RC',
 51.5719, 4.7683, '076-555-0909', 'info@speedgaragebreda.nl', 'https://speedgaragebreda.nl',
 ARRAY['Chiptuning', 'Performance', 'Sport Uitlaat', 'Verlaging'],
 ARRAY['BMW', 'Audi', 'Volkswagen', 'Mercedes-Benz', 'Ford', 'Seat'],
 false,
 '{"monday":{"open":"09:00","close":"18:00","closed":false},"tuesday":{"open":"09:00","close":"18:00","closed":false},"wednesday":{"open":"09:00","close":"18:00","closed":false},"thursday":{"open":"09:00","close":"21:00","closed":false},"friday":{"open":"09:00","close":"17:00","closed":false},"saturday":{"open":"10:00","close":"16:00","closed":false},"sunday":{"open":"00:00","close":"00:00","closed":true}}'::jsonb,
 'orange', 4.4, 178, true),

-- 10. Haarlem - Quick service center
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '49ef0b7c-f799-46a7-ac3b-7902f37d2a8d',
 'Kwik-Fit Haarlem',
 'Snel en zonder afspraak! Banden, remmen, uitlaat, APK - wij staan altijd voor je klaar. Geen afspraak nodig.',
 'Schipholweg 301', 'Haarlem', 'Noord-Holland', 'NL', '2034LS',
 52.3725, 4.6444, '023-555-1010', 'haarlem@kwikfit-voorbeeld.nl', NULL,
 ARRAY['Zonder afspraak', 'Snelservice', 'Banden', 'APK Station'],
 ARRAY['Alle merken'],
 false,
 '{"monday":{"open":"08:00","close":"18:00","closed":false},"tuesday":{"open":"08:00","close":"18:00","closed":false},"wednesday":{"open":"08:00","close":"18:00","closed":false},"thursday":{"open":"08:00","close":"18:00","closed":false},"friday":{"open":"08:00","close":"18:00","closed":false},"saturday":{"open":"08:00","close":"17:00","closed":false},"sunday":{"open":"10:00","close":"16:00","closed":false}}'::jsonb,
 'green', 3.8, 420, true);


-- ============================================
-- GARAGE SERVICES (mixed per garage)
-- ============================================

INSERT INTO public.garage_services (garage_id, category, name, description, price_from, price_to, duration_minutes, is_available)
VALUES
-- === AutoPro Amsterdam (BMW specialist) ===
('11111111-1111-1111-1111-111111111111', 'oil_change', 'BMW Oliebeurt', 'Inclusief BMW originele olie en filter', 149, 249, 45, true),
('11111111-1111-1111-1111-111111111111', 'major_service', 'BMW Grote Beurt', 'Complete inspectie + alle vloeistoffen + filters', 395, 650, 180, true),
('11111111-1111-1111-1111-111111111111', 'small_service', 'BMW Kleine Beurt', 'Olie, filters en visuele controle', 195, 295, 90, true),
('11111111-1111-1111-1111-111111111111', 'diagnostics', 'BMW ISTA Diagnose', 'Uitlezen met officiële BMW software', 75, 95, 30, true),
('11111111-1111-1111-1111-111111111111', 'brakes', 'BMW Remmen vervangen', 'Remblokken en/of schijven, originele kwaliteit', 250, 550, 120, true),
('11111111-1111-1111-1111-111111111111', 'apk', 'APK Keuring', 'Officiële APK keuring', 35, 45, 30, true),

-- === Garage de Maas Rotterdam (budget allrounder) ===
('22222222-2222-2222-2222-222222222222', 'oil_change', 'Oliebeurt', 'Olie verversen + filter', 59, 89, 30, true),
('22222222-2222-2222-2222-222222222222', 'small_service', 'Kleine Beurt', 'Olie, filters, vloeistofniveaus controle', 99, 149, 60, true),
('22222222-2222-2222-2222-222222222222', 'major_service', 'Grote Beurt', 'Compleet onderhoud alle onderdelen', 199, 349, 150, true),
('22222222-2222-2222-2222-222222222222', 'apk', 'APK Keuring', 'Officieel RDW erkend APK station', 25, 35, 30, true),
('22222222-2222-2222-2222-222222222222', 'tire_change', 'Banden wisselen', '4 banden wisselen en balanceren', 40, 60, 45, true),
('22222222-2222-2222-2222-222222222222', 'brakes', 'Remmen service', 'Remblokken en schijven controle/vervanging', 120, 280, 90, true),
('22222222-2222-2222-2222-222222222222', 'exhaust', 'Uitlaat reparatie', 'Uitlaatsysteem controle en vervanging', 80, 350, 60, true),

-- === GreenDrive Utrecht (EV specialist) ===
('33333333-3333-3333-3333-333333333333', 'diagnostics', 'EV Accu Diagnose', 'Volledige batterij gezondheidscheck + rapport', 95, 150, 60, true),
('33333333-3333-3333-3333-333333333333', 'small_service', 'EV Kleine Beurt', 'Remvloeistof, koelvloeistof, cabin filter, visuele inspectie', 129, 199, 60, true),
('33333333-3333-3333-3333-333333333333', 'major_service', 'EV Grote Beurt', 'Compleet EV onderhoud incl. software update', 249, 399, 120, true),
('33333333-3333-3333-3333-333333333333', 'tire_change', 'EV Banden wisselen', 'Speciale EV-banden (extra draagvermogen), wisselen + balanceren', 60, 80, 45, true),
('33333333-3333-3333-3333-333333333333', 'brakes', 'Remmen controle', 'Remblokken + schijven check (EV slijtage patroon)', 80, 200, 60, true),
('33333333-3333-3333-3333-333333333333', 'airco_service', 'Airco/Warmtepomp Service', 'Airco bijvullen + warmtepomp check', 89, 149, 45, true),
('33333333-3333-3333-3333-333333333333', 'electrical', 'Laadsysteem Check', 'On-board charger + laadpoort diagnose', 75, 125, 45, true),
('33333333-3333-3333-3333-333333333333', 'apk', 'APK Keuring', 'APK voor elektrische voertuigen', 30, 40, 30, true),

-- === Premium Cars Den Haag (Mercedes/luxury) ===
('44444444-4444-4444-4444-444444444444', 'oil_change', 'Mercedes Oliebeurt', 'MB-goedgekeurde olie + originele filters', 169, 289, 45, true),
('44444444-4444-4444-4444-444444444444', 'major_service', 'Mercedes Grote Beurt A/B', 'Complete A of B service conform onderhoudsschema', 449, 799, 240, true),
('44444444-4444-4444-4444-444444444444', 'small_service', 'Mercedes Kleine Beurt', 'Olie, filter en basisinspectie', 229, 349, 90, true),
('44444444-4444-4444-4444-444444444444', 'diagnostics', 'Star Diagnose', 'Mercedes STAR uitlezing + foutcodes analyse', 89, 120, 30, true),
('44444444-4444-4444-4444-444444444444', 'airco_service', 'Airco Service Deluxe', 'Airco bijvullen + desinfectie + pollenfilter', 119, 179, 60, true),
('44444444-4444-4444-4444-444444444444', 'brakes', 'Remmen vervangen', 'Premium remblokken + schijven, originele kwaliteit', 300, 700, 120, true),
('44444444-4444-4444-4444-444444444444', 'apk', 'APK Keuring', 'APK met pre-check', 40, 50, 45, true),

-- === Japan Auto Eindhoven (Japanese cars) ===
('55555555-5555-5555-5555-555555555555', 'oil_change', 'Oliebeurt Japans', 'Japanse specificatie olie + OEM filter', 79, 129, 30, true),
('55555555-5555-5555-5555-555555555555', 'small_service', 'Kleine Beurt', 'Olie, filters en 25-punts controle', 119, 189, 60, true),
('55555555-5555-5555-5555-555555555555', 'major_service', 'Grote Beurt', 'Compleet onderhoud conform fabrieksschema', 249, 449, 150, true),
('55555555-5555-5555-5555-555555555555', 'tire_change', 'Banden wisselen', 'Wisselen, balanceren en uitlijnen', 50, 70, 45, true),
('55555555-5555-5555-5555-555555555555', 'apk', 'APK Keuring', 'APK keuring', 30, 40, 30, true),
('55555555-5555-5555-5555-555555555555', 'diagnostics', 'OBD Diagnose', 'Foutcodes uitlezen en analyse', 55, 75, 30, true),
('55555555-5555-5555-5555-555555555555', 'suspension', 'Vering & Ophanging', 'Schokdempers, veren, draagarms controle/vervanging', 150, 450, 120, true),
('55555555-5555-5555-5555-555555555555', 'exhaust', 'Uitlaat systeem', 'Katalysator, middendemper, einddemper', 100, 400, 90, true),

-- === Budget Garage Groningen (student-friendly) ===
('66666666-6666-6666-6666-666666666666', 'oil_change', 'Oliebeurt Budget', 'Kwalitatieve olie voor een scherpe prijs', 45, 69, 30, true),
('66666666-6666-6666-6666-666666666666', 'small_service', 'Kleine Beurt Budget', 'Basis onderhoud, alles gecontroleerd', 79, 119, 60, true),
('66666666-6666-6666-6666-666666666666', 'major_service', 'Grote Beurt Budget', 'Groot onderhoud zonder de grote prijs', 159, 279, 120, true),
('66666666-6666-6666-6666-666666666666', 'apk', 'APK Keuring', 'Goedkoopste APK van Groningen', 20, 30, 30, true),
('66666666-6666-6666-6666-666666666666', 'tire_change', 'Banden wisselen', 'Wisselen + balanceren, budget banden leverbaar', 30, 50, 40, true),
('66666666-6666-6666-6666-666666666666', 'brakes', 'Remmen check & vervangen', 'Scherpe prijzen op remblokken', 89, 220, 75, true),
('66666666-6666-6666-6666-666666666666', 'exhaust', 'Uitlaat reparatie', 'Lassen of vervangen', 60, 250, 60, true),

-- === Autoschade Tilburg (body & paint) ===
('77777777-7777-7777-7777-777777777777', 'bodywork', 'Deuk reparatie klein', 'Kleine deuk verwijderen zonder spuiten (PDR)', 75, 200, 60, true),
('77777777-7777-7777-7777-777777777777', 'bodywork', 'Bumper reparatie', 'Bumper herstellen + lakken in kleur', 250, 500, 240, true),
('77777777-7777-7777-7777-777777777777', 'bodywork', 'Compleet spuitwerk paneel', 'Één paneel schuren, plamuren, gronden en lakken', 350, 650, 480, true),
('77777777-7777-7777-7777-777777777777', 'bodywork', 'Kras reparatie', 'Oppervlakkige tot diepe krassen herstellen', 100, 300, 120, true),
('77777777-7777-7777-7777-777777777777', 'diagnostics', 'Schade taxatie', 'Schade inspectie + offerte voor verzekering', 0, 0, 30, true),
('77777777-7777-7777-7777-777777777777', 'apk', 'APK Keuring', 'APK keuring', 30, 40, 30, true),

-- === Familiebedrijf Garage Visser Almere (family full-service) ===
('88888888-8888-8888-8888-888888888888', 'oil_change', 'Oliebeurt', 'Olie + filter, alle merken', 69, 109, 30, true),
('88888888-8888-8888-8888-888888888888', 'small_service', 'Kleine Beurt', 'Basis onderhoud met persoonlijk advies', 109, 169, 60, true),
('88888888-8888-8888-8888-888888888888', 'major_service', 'Grote Beurt', 'Compleet onderhoud + uitgebreide controle', 229, 389, 150, true),
('88888888-8888-8888-8888-888888888888', 'apk', 'APK Keuring', 'APK + gratis herkeuring bij afkeur', 30, 40, 30, true),
('88888888-8888-8888-8888-888888888888', 'airco_service', 'Airco Service', 'Airco bijvullen + lektest + desinfectie', 79, 129, 45, true),
('88888888-8888-8888-8888-888888888888', 'tire_change', 'Banden wisselen', 'Seizoenswisseling, opslag mogelijk', 45, 65, 45, true),
('88888888-8888-8888-8888-888888888888', 'brakes', 'Remmen service', 'Controle + vervanging indien nodig', 110, 300, 90, true),
('88888888-8888-8888-8888-888888888888', 'electrical', 'Elektrische storing', 'Accu, dynamo, startmotor, bedrading', 65, 250, 60, true),
('88888888-8888-8888-8888-888888888888', 'suspension', 'Vering & Ophanging', 'Schokdempers en draagarms', 130, 400, 120, true),

-- === Speed Garage Breda (performance & tuning) ===
('99999999-9999-9999-9999-999999999999', 'diagnostics', 'Performance Diagnose', 'Vermogensmeting + motordiagnose op de rollenbank', 99, 149, 60, true),
('99999999-9999-9999-9999-999999999999', 'exhaust', 'Sport Uitlaat systeem', 'RVS sport uitlaat plaatsen (diverse merken)', 350, 1200, 180, true),
('99999999-9999-9999-9999-999999999999', 'suspension', 'Sport Verlaging', 'Verlagingsveren of coilovers plaatsen + uitlijnen', 250, 800, 180, true),
('99999999-9999-9999-9999-999999999999', 'brakes', 'Performance Remmen', 'Upgrade naar grotere remmen / remklauw sets', 400, 1500, 180, true),
('99999999-9999-9999-9999-999999999999', 'oil_change', 'Performance Oliebeurt', 'Racing spec olie + high-flow filter', 99, 179, 30, true),
('99999999-9999-9999-9999-999999999999', 'major_service', 'Track Day Prep', 'Volledige auto check voor circuit gebruik', 199, 349, 120, true),
('99999999-9999-9999-9999-999999999999', 'apk', 'APK Keuring', 'APK (ook voor getunede auto''s)', 35, 45, 30, true),

-- === Kwik-Fit Haarlem (quick service) ===
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'apk', 'APK Keuring', 'Snel en zonder afspraak, klaar terwijl u wacht', 20, 30, 20, true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'tire_change', 'Banden wisselen', '4 banden wisselen + balanceren, grote voorraad', 35, 55, 30, true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'brakes', 'Remmen check + vervangen', 'Snelle remmenservice, vaak zelfde dag klaar', 99, 280, 60, true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'exhaust', 'Uitlaat reparatie', 'Uitlaat vervangen of lassen', 70, 300, 45, true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'oil_change', 'Snelle Oliebeurt', 'Olie + filter in 20 minuten', 49, 79, 20, true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'small_service', 'Kleine Beurt Express', 'Basis onderhoud terwijl u wacht', 89, 139, 45, true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'airco_service', 'Airco bijvullen', 'Airco gas bijvullen + lektest', 69, 99, 30, true);


-- ============================================
-- MAASTRICHT GARAGES (6 extra)
-- ============================================

INSERT INTO public.garages (id, owner_id, name, description, address, city, province, country, postal_code, latitude, longitude, phone, email, website, specializations, brands_serviced, is_ev_specialist, opening_hours, availability_status, average_rating, total_reviews, is_active)
VALUES
-- 11. Maastricht - French car specialist
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 '3cb71569-cc67-4b99-bca8-508776ef5521',
 'Garage Francais Maastricht',
 'Vlakbij de grens, expert in Franse auto''s. Peugeot, Renault, Citroën - wij spreken hun taal! Onderdelen snel leverbaar uit Frankrijk en België.',
 'Meerssenerweg 100', 'Maastricht', 'Limburg', 'NL', '6224AM',
 50.8588, 5.7010, '043-555-1101', 'info@garagefrancais.nl', NULL,
 ARRAY['Franse auto''s', 'Import België/Frankrijk', 'Onderdelen specialist'],
 ARRAY['Peugeot', 'Renault', 'Citroën', 'Dacia', 'DS'],
 false,
 '{"monday":{"open":"08:00","close":"17:30","closed":false},"tuesday":{"open":"08:00","close":"17:30","closed":false},"wednesday":{"open":"08:00","close":"17:30","closed":false},"thursday":{"open":"08:00","close":"17:30","closed":false},"friday":{"open":"08:00","close":"17:00","closed":false},"saturday":{"open":"09:00","close":"13:00","closed":false},"sunday":{"open":"00:00","close":"00:00","closed":true}}'::jsonb,
 'green', 4.3, 97, true),

-- 12. Maastricht - Oldtimer & classic car garage
('cccccccc-cccc-cccc-cccc-cccccccccccc',
 '49ef0b7c-f799-46a7-ac3b-7902f37d2a8d',
 'Klassiek Maastricht',
 'Gepassioneerd door klassiekers! Restauratie, onderhoud en APK voor oldtimers en youngtimers. Meer dan 30 jaar ervaring met klassieke auto''s.',
 'Brusselseweg 450', 'Maastricht', 'Limburg', 'NL', '6217HD',
 50.8675, 5.6700, '043-555-1102', 'info@klassiekmaastricht.nl', 'https://klassiekmaastricht.nl',
 ARRAY['Oldtimer restauratie', 'Youngtimers', 'Klassiek onderhoud', 'Spuitwerk klassiek'],
 ARRAY['Mercedes-Benz', 'BMW', 'Porsche', 'Jaguar', 'Alfa Romeo', 'Fiat', 'Volkswagen'],
 false,
 '{"monday":{"open":"08:30","close":"17:00","closed":false},"tuesday":{"open":"08:30","close":"17:00","closed":false},"wednesday":{"open":"08:30","close":"17:00","closed":false},"thursday":{"open":"08:30","close":"17:00","closed":false},"friday":{"open":"08:30","close":"16:30","closed":false},"saturday":{"open":"00:00","close":"00:00","closed":true},"sunday":{"open":"00:00","close":"00:00","closed":true}}'::jsonb,
 'orange', 4.8, 63, true),

-- 13. Maastricht - VW/Audi Group specialist
('dddddddd-dddd-dddd-dddd-dddddddddddd',
 '3cb71569-cc67-4b99-bca8-508776ef5521',
 'VAG Specialist Limburg',
 'Alles voor Volkswagen, Audi, Škoda en SEAT. VCDS diagnose, DSG onderhoud, turbo revisie. De VAG-kenner van Zuid-Limburg.',
 'Industrieweg 22', 'Maastricht', 'Limburg', 'NL', '6227AL',
 50.8390, 5.7150, '043-555-1103', 'info@vagspecialist.nl', 'https://vagspecialist-limburg.nl',
 ARRAY['VAG Specialist', 'VCDS Diagnose', 'DSG Onderhoud', 'Turbo Revisie'],
 ARRAY['Volkswagen', 'Audi', 'Škoda', 'SEAT', 'Cupra'],
 false,
 '{"monday":{"open":"07:30","close":"18:00","closed":false},"tuesday":{"open":"07:30","close":"18:00","closed":false},"wednesday":{"open":"07:30","close":"18:00","closed":false},"thursday":{"open":"07:30","close":"18:00","closed":false},"friday":{"open":"07:30","close":"17:00","closed":false},"saturday":{"open":"09:00","close":"14:00","closed":false},"sunday":{"open":"00:00","close":"00:00","closed":true}}'::jsonb,
 'green', 4.6, 189, true),

-- 14. Maastricht - Quick APK & tire center
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
 '49ef0b7c-f799-46a7-ac3b-7902f37d2a8d',
 'Snelservice Maastricht',
 'Geen afspraak nodig! APK in 20 minuten, banden wisselen terwijl u wacht, remmen direct gecontroleerd. De snelste van Maastricht.',
 'Scharnerweg 80', 'Maastricht', 'Limburg', 'NL', '6224JH',
 50.8510, 5.6960, '043-555-1104', 'info@snelservicemst.nl', NULL,
 ARRAY['Zonder afspraak', 'APK Station', 'Bandencentrum', 'Snelservice'],
 ARRAY['Alle merken'],
 false,
 '{"monday":{"open":"07:30","close":"18:30","closed":false},"tuesday":{"open":"07:30","close":"18:30","closed":false},"wednesday":{"open":"07:30","close":"18:30","closed":false},"thursday":{"open":"07:30","close":"18:30","closed":false},"friday":{"open":"07:30","close":"18:30","closed":false},"saturday":{"open":"08:00","close":"17:00","closed":false},"sunday":{"open":"10:00","close":"15:00","closed":false}}'::jsonb,
 'green', 4.1, 356, true),

-- 15. Maastricht - Luxury detailing & care
('ffffffff-ffff-ffff-ffff-ffffffffffff',
 '3cb71569-cc67-4b99-bca8-508776ef5521',
 'Maas Detailing & Care',
 'Uw auto verdient het beste. Professionele detailing, keramische coating, PPF, interieurreiniging en lakbescherming. Ook onderhoud en kleine reparaties.',
 'Avenue Céramique 15', 'Maastricht', 'Limburg', 'NL', '6221KV',
 50.8445, 5.6920, '043-555-1105', 'info@maasdetailing.nl', 'https://maasdetailing.nl',
 ARRAY['Detailing', 'Keramische Coating', 'PPF', 'Lakbescherming'],
 ARRAY['Alle merken'],
 false,
 '{"monday":{"open":"09:00","close":"18:00","closed":false},"tuesday":{"open":"09:00","close":"18:00","closed":false},"wednesday":{"open":"09:00","close":"18:00","closed":false},"thursday":{"open":"09:00","close":"18:00","closed":false},"friday":{"open":"09:00","close":"17:00","closed":false},"saturday":{"open":"10:00","close":"16:00","closed":false},"sunday":{"open":"00:00","close":"00:00","closed":true}}'::jsonb,
 'orange', 4.9, 82, true),

-- 16. Maastricht - Diesel & commercial vehicle specialist
('abababab-abab-abab-abab-abababababab',
 '49ef0b7c-f799-46a7-ac3b-7902f37d2a8d',
 'Diesel Centrum Maastricht',
 'Specialist in dieselmotoren en bedrijfsvoertuigen. Injectoren, turbo''s, DPF reiniging, AdBlue systemen. Ook bestelwagens en campers.',
 'Beatrixhaven 12', 'Maastricht', 'Limburg', 'NL', '6211AA',
 50.8350, 5.7250, '043-555-1106', 'info@dieselcentrum.nl', NULL,
 ARRAY['Diesel specialist', 'Bedrijfsvoertuigen', 'DPF Reiniging', 'Turbo Revisie', 'Campers'],
 ARRAY['Mercedes-Benz', 'Volkswagen', 'Ford', 'Renault', 'Fiat', 'Iveco', 'MAN'],
 false,
 '{"monday":{"open":"07:00","close":"17:30","closed":false},"tuesday":{"open":"07:00","close":"17:30","closed":false},"wednesday":{"open":"07:00","close":"17:30","closed":false},"thursday":{"open":"07:00","close":"17:30","closed":false},"friday":{"open":"07:00","close":"16:00","closed":false},"saturday":{"open":"08:00","close":"12:00","closed":false},"sunday":{"open":"00:00","close":"00:00","closed":true}}'::jsonb,
 'red', 4.4, 134, true);


-- ============================================
-- MAASTRICHT GARAGE SERVICES
-- ============================================

INSERT INTO public.garage_services (garage_id, category, name, description, price_from, price_to, duration_minutes, is_available)
VALUES
-- === Garage Francais Maastricht (French cars) ===
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'oil_change', 'Oliebeurt Frans', 'PSA/Renault-spec olie + OEM filter', 69, 109, 30, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'small_service', 'Kleine Beurt', 'Olie, filters en 20-punts controle', 109, 169, 60, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'major_service', 'Grote Beurt', 'Compleet onderhoud conform fabrieksschema', 219, 379, 150, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'apk', 'APK Keuring', 'APK keuring', 30, 40, 30, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'diagnostics', 'Diagnose Peugeot/Renault/Citroën', 'Uitlezen met Lexia/CLIP/DiagBox', 65, 85, 30, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'electrical', 'Elektronische storing', 'BSI reset, immobilizer, ruitbediening', 75, 200, 60, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'suspension', 'Vering reparatie', 'Typische Citroën hydraulische vering + standaard', 120, 450, 120, true),

-- === Klassiek Maastricht (oldtimer/classic) ===
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'oil_change', 'Klassieke Oliebeurt', 'Speciale olie voor klassieke motoren', 89, 149, 45, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'major_service', 'Groot Onderhoud Klassieker', 'Compleet nazien, afstellen carburateur/injectie, bougies, timing', 350, 750, 300, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'brakes', 'Remmen revisie', 'Remcilinders, schijven/trommels, leiding vervangen', 200, 600, 180, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bodywork', 'Roest reparatie', 'Plaatwerk herstellen, lassen, conserveren', 300, 1500, 480, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'exhaust', 'Uitlaat op maat', 'RVS uitlaat op maat maken voor klassieker', 250, 800, 240, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'electrical', 'Elektra restauratie', 'Bedrading vernieuwen, dynamo revisie, instrumenten', 150, 500, 180, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'apk', 'APK Oldtimer', 'APK met oog voor klassiekers', 40, 50, 45, true),

-- === VAG Specialist Limburg (VW/Audi) ===
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'oil_change', 'VAG Oliebeurt', 'VW LongLife olie + OEM filter', 89, 139, 30, true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'small_service', 'VAG Kleine Beurt', 'Olie, filters, inspectie reset', 139, 209, 60, true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'major_service', 'VAG Grote Beurt', 'Incl. DSG olie, Haldex, bougies, alles conform schema', 299, 549, 180, true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'diagnostics', 'VCDS Diagnose', 'Uitgebreid uitlezen + coderen met VCDS/ODIS', 69, 99, 30, true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'apk', 'APK Keuring', 'APK keuring', 30, 40, 30, true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'tire_change', 'Banden wisselen', 'Wisselen + balanceren + uitlijnen', 50, 75, 45, true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'airco_service', 'Airco Service', 'Airco bijvullen R134a/R1234yf + lektest', 89, 149, 45, true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'brakes', 'Remmen vervangen', 'Remblokken + schijven, VAG kwaliteit', 150, 400, 90, true),

-- === Snelservice Maastricht (quick APK & tires) ===
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'apk', 'APK Express', 'APK in 20 minuten, klaar terwijl u wacht', 20, 30, 20, true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'tire_change', 'Banden wisselen', 'Grote voorraad, alle maten, direct montage', 30, 50, 25, true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'brakes', 'Remmen snelcheck', 'Gratis controle, vervanging zelfde dag', 89, 250, 60, true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'oil_change', 'Oliebeurt Snel', 'Klaar in 15 minuten', 45, 75, 15, true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'exhaust', 'Uitlaat reparatie', 'Lassen of vervangen, dezelfde dag', 65, 280, 45, true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'small_service', 'Kleine Beurt Express', 'Snel onderhoud zonder afspraak', 79, 129, 40, true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'airco_service', 'Airco bijvullen', 'Snel bijvullen + snelle lektest', 65, 95, 20, true),

-- === Maas Detailing & Care (detailing + light maintenance) ===
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'bodywork', 'Lakbescherming PPF', 'Paint Protection Film op neus, spiegels, dorpels', 500, 2500, 480, true),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'bodywork', 'Kras & Swirl verwijderen', 'Machine polijsten + keramische coating', 250, 600, 300, true),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'bodywork', 'Deukherstel zonder spuiten', 'PDR: kleine deuken verwijderen', 80, 250, 60, true),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'oil_change', 'Oliebeurt', 'Olie + filter tijdens detailing', 69, 99, 30, true),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'small_service', 'Kleine Beurt', 'Basisonderhoud terwijl uw auto gedetaild wordt', 99, 159, 60, true),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'apk', 'APK Keuring', 'APK keuring', 35, 45, 30, true),

-- === Diesel Centrum Maastricht (diesel & commercial) ===
('abababab-abab-abab-abab-abababababab', 'oil_change', 'Diesel Oliebeurt', 'Speciale diesel olie + dubbele filter', 79, 139, 30, true),
('abababab-abab-abab-abab-abababababab', 'major_service', 'Grote Beurt Diesel', 'Compleet diesel onderhoud incl. brandstoffilter + AdBlue', 249, 449, 180, true),
('abababab-abab-abab-abab-abababababab', 'diagnostics', 'Diesel Diagnose', 'Injectoren testen, turbo druk, DPF status', 89, 129, 45, true),
('abababab-abab-abab-abab-abababababab', 'exhaust', 'DPF Reiniging', 'Roetfilter professioneel reinigen (geen verwijderen!)', 250, 450, 120, true),
('abababab-abab-abab-abab-abababababab', 'exhaust', 'Turbo revisie', 'Turbo demonteren, reviseren en terugplaatsen', 500, 1200, 300, true),
('abababab-abab-abab-abab-abababababab', 'apk', 'APK Keuring', 'APK voor diesel personenauto + bedrijfswagen', 30, 45, 30, true),
('abababab-abab-abab-abab-abababababab', 'brakes', 'Remmen bedrijfswagen', 'Remblokken + schijven voor busjes en bestelwagens', 180, 500, 120, true),
('abababab-abab-abab-abab-abababababab', 'electrical', 'AdBlue systeem reparatie', 'AdBlue tank, sensor, doseermodule', 150, 600, 90, true);
