-- ============================================================
-- CarWise: Mock Bookings Seed Data
-- Run in Supabase SQL Editor to populate dynamic map pin colors
-- Pin thresholds: 0-2 = green, 3-5 = orange, 6+ = red
-- ============================================================

-- Consumer user for all bookings
-- a6ffad28-85fc-4106-9c52-cd29e07d2556

-- ============================================================
-- TODAY: 2026-02-10 (Tuesday)
-- ============================================================

-- Garage de Maas → 7 bookings (RED)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '53fe64ef-3cbb-421d-99a4-6f46cf1d2e94', '2026-02-10', '09:00', 'confirmed', 'Volkswagen', 'Golf', 'AB-123-CD'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', 'a7dd9518-4de5-4c6f-87aa-620694974b6b', '2026-02-10', '09:30', 'confirmed', 'Toyota', 'Yaris', 'EF-456-GH'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '3993ca1c-bcd7-4de2-9fb1-62e19305326f', '2026-02-10', '10:00', 'confirmed', 'Opel', 'Corsa', 'IJ-789-KL'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '1b3979d1-2592-4080-bc9d-506a1c8ce8f4', '2026-02-10', '10:30', 'pending', 'Ford', 'Focus', 'MN-012-OP'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', 'dcc82426-0d7c-4ce1-8839-c89b19b64786', '2026-02-10', '13:00', 'confirmed', 'Renault', 'Clio', 'QR-345-ST'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '7440eec8-b5d1-418e-b4c5-0755c2de384d', '2026-02-10', '14:00', 'confirmed', 'Peugeot', '208', 'UV-678-WX'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '6072f669-ded9-4b4f-b669-194efbc9b9cd', '2026-02-10', '15:00', 'pending', 'Citroën', 'C3', 'YZ-901-AB');

-- Snelservice Maastricht → 4 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '9aeb293d-d942-4491-925a-c376983116d0', '2026-02-10', '09:00', 'confirmed', 'Fiat', '500', 'CD-234-EF'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'fb498854-1c6b-43bf-b904-d6c93e5f85aa', '2026-02-10', '10:00', 'confirmed', 'Honda', 'Civic', 'GH-567-IJ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '92240d6f-6199-4a52-b4fd-56df42813656', '2026-02-10', '11:00', 'pending', 'Kia', 'Picanto', 'KL-890-MN'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'be18124b-aa65-4bd2-8ed9-d763ec5b8efd', '2026-02-10', '13:30', 'confirmed', 'Hyundai', 'i20', 'OP-123-QR');

-- VAG Specialist Limburg → 5 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '64f64ece-7d7a-4264-a923-fdfc026c5658', '2026-02-10', '09:00', 'confirmed', 'Audi', 'A3', 'ST-456-UV'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'f0684e72-3ac6-40aa-8e41-29d1b6986bee', '2026-02-10', '10:00', 'confirmed', 'Volkswagen', 'Polo', 'WX-789-YZ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '46362563-2d4a-4e5b-8199-8de02591cb48', '2026-02-10', '11:00', 'confirmed', 'Skoda', 'Octavia', 'AB-012-CD'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '496ec5c2-f7a3-420d-982d-006903b5765e', '2026-02-10', '13:00', 'pending', 'Seat', 'Leon', 'EF-345-GH'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'e7b1e15e-05d7-48f3-ac8a-fb09979dc9e4', '2026-02-10', '14:30', 'confirmed', 'Audi', 'A4', 'IJ-678-KL');

-- Maas Detailing & Care → 6 bookings (RED)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '76bd6042-2776-4b55-837f-53ae8a3a383a', '2026-02-10', '09:00', 'confirmed', 'BMW', '3 Serie', 'MN-901-OP'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'fc00282b-5e55-48c0-8007-0ca3e7039fe7', '2026-02-10', '09:30', 'confirmed', 'Mercedes', 'C-Klasse', 'QR-234-ST'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'b56ece90-d4ba-497e-be7d-ae67c3d7818c', '2026-02-10', '10:30', 'confirmed', 'Audi', 'Q5', 'UV-567-WX'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '94c30727-4cc9-4e19-bd4e-34d892eeb544', '2026-02-10', '11:30', 'pending', 'Volvo', 'XC60', 'YZ-890-AB'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '5cf6fa9d-c2f0-409f-93f4-de6a3076d029', '2026-02-10', '13:00', 'confirmed', 'Tesla', 'Model 3', 'CD-123-EF'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f689a773-a1a0-43b1-a028-b5560bc521fb', '2026-02-10', '14:00', 'confirmed', 'Porsche', 'Cayenne', 'GH-456-IJ');

-- MU Automotive → 3 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'd1810eb5-f0bb-4844-84cc-df0200e3b26c', 'c80885e6-a761-48e6-81a5-3a173ac214b0', '2026-02-10', '09:00', 'confirmed', 'Mazda', '3', 'KL-789-MN'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'd1810eb5-f0bb-4844-84cc-df0200e3b26c', '2e06edb3-e763-484c-8ba4-1d8fb7f040fe', '2026-02-10', '10:30', 'confirmed', 'Nissan', 'Qashqai', 'OP-012-QR'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'd1810eb5-f0bb-4844-84cc-df0200e3b26c', 'f328ca44-4e70-4cd7-8d47-671e56d53e90', '2026-02-10', '14:00', 'pending', 'Suzuki', 'Swift', 'ST-345-UV');

-- Diesel Centrum Maastricht → 2 bookings (GREEN)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', '6e6f3bb6-3cdb-43d0-bddc-8f1233367043', '2026-02-10', '09:00', 'confirmed', 'Mercedes', 'Sprinter', 'WX-678-YZ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', '20ab25bd-5928-4c35-b998-679fc5527b30', '2026-02-10', '11:00', 'confirmed', 'Volkswagen', 'Transporter', 'AB-901-CD');

-- Klassiek Maastricht → 1 booking (GREEN)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '4221a3fd-e0e1-4a47-b584-8f71f6391f7c', '2026-02-10', '10:00', 'confirmed', 'MG', 'MGB', 'EF-234-GH');


-- ============================================================
-- TOMORROW: 2026-02-11 (Wednesday)
-- ============================================================

-- Garage de Maas → 3 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '53fe64ef-3cbb-421d-99a4-6f46cf1d2e94', '2026-02-11', '09:00', 'confirmed', 'Dacia', 'Sandero', 'IJ-567-KL'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '1b3979d1-2592-4080-bc9d-506a1c8ce8f4', '2026-02-11', '10:30', 'pending', 'Opel', 'Astra', 'MN-890-OP'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', 'dcc82426-0d7c-4ce1-8839-c89b19b64786', '2026-02-11', '14:00', 'confirmed', 'Ford', 'Fiesta', 'QR-123-ST');

-- Snelservice Maastricht → 7 bookings (RED)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '9aeb293d-d942-4491-925a-c376983116d0', '2026-02-11', '09:00', 'confirmed', 'Toyota', 'Aygo', 'UV-456-WX'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'fb498854-1c6b-43bf-b904-d6c93e5f85aa', '2026-02-11', '09:30', 'confirmed', 'Suzuki', 'Baleno', 'YZ-789-AB'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '92240d6f-6199-4a52-b4fd-56df42813656', '2026-02-11', '10:00', 'confirmed', 'Mitsubishi', 'Space Star', 'CD-012-EF'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'be18124b-aa65-4bd2-8ed9-d763ec5b8efd', '2026-02-11', '10:30', 'pending', 'Kia', 'Rio', 'GH-345-IJ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'd970e31a-ce3b-4b12-ad98-b518bdfc95af', '2026-02-11', '13:00', 'confirmed', 'Hyundai', 'i10', 'KL-678-MN'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '1dc0d0d3-b672-42bd-af68-2d37e6b998ab', '2026-02-11', '14:00', 'confirmed', 'Volkswagen', 'Up', 'OP-901-QR'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'dcc915f0-0d60-4267-806c-9c2c0fa6edb6', '2026-02-11', '15:00', 'confirmed', 'Fiat', 'Panda', 'ST-234-UV');

-- Diesel Centrum → 6 bookings (RED)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', '6e6f3bb6-3cdb-43d0-bddc-8f1233367043', '2026-02-11', '09:00', 'confirmed', 'Mercedes', 'Vito', 'WX-567-YZ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', 'bf834676-5a6f-4066-94e8-59553b77a6f0', '2026-02-11', '09:30', 'confirmed', 'Volvo', 'V60 D4', 'AB-890-CD'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', '254aa0bf-11ee-4bf1-a64e-b9d675c51127', '2026-02-11', '10:30', 'confirmed', 'BMW', '320d', 'EF-123-GH'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', '20ab25bd-5928-4c35-b998-679fc5527b30', '2026-02-11', '11:30', 'pending', 'Peugeot', 'Partner', 'IJ-456-KL'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', '4c2ad9a3-cd1a-4c46-89c4-dd67ff97ff72', '2026-02-11', '13:30', 'confirmed', 'Renault', 'Master', 'MN-789-OP'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', '35f97ec6-9f6f-49e4-8371-b297bca6ea84', '2026-02-11', '15:00', 'confirmed', 'Ford', 'Transit', 'QR-012-ST');

-- Garage Francais → 4 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1510ad08-edaa-409e-a46f-8a542043cf3e', '2026-02-11', '09:00', 'confirmed', 'Peugeot', '308', 'UV-345-WX'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '6a41ddbe-51b0-4ff9-8bf0-e8ca933fba79', '2026-02-11', '10:00', 'confirmed', 'Renault', 'Megane', 'YZ-678-AB'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dd8dd96c-45fc-429a-a5b9-d3955933311f', '2026-02-11', '11:00', 'pending', 'Citroën', 'C4', 'CD-901-EF'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'efea29ea-aa92-43cf-b614-1d13507ce3da', '2026-02-11', '14:00', 'confirmed', 'Dacia', 'Duster', 'GH-234-IJ');

-- VAG Specialist → 1 booking (GREEN)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33e6bf99-8b05-4fb2-89a2-cab3b5398fb3', '2026-02-11', '10:00', 'confirmed', 'Volkswagen', 'Passat', 'KL-567-MN');


-- ============================================================
-- 2026-02-12 (Thursday)
-- ============================================================

-- VAG Specialist → 8 bookings (RED)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '64f64ece-7d7a-4264-a923-fdfc026c5658', '2026-02-12', '09:00', 'confirmed', 'Audi', 'A1', 'OP-890-QR'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'f0684e72-3ac6-40aa-8e41-29d1b6986bee', '2026-02-12', '09:30', 'confirmed', 'Seat', 'Ibiza', 'ST-123-UV'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33e6bf99-8b05-4fb2-89a2-cab3b5398fb3', '2026-02-12', '10:00', 'confirmed', 'Skoda', 'Fabia', 'WX-456-YZ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '46362563-2d4a-4e5b-8199-8de02591cb48', '2026-02-12', '10:30', 'pending', 'Volkswagen', 'Tiguan', 'AB-789-CD'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '496ec5c2-f7a3-420d-982d-006903b5765e', '2026-02-12', '11:00', 'confirmed', 'Audi', 'Q3', 'EF-012-GH'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'e7b1e15e-05d7-48f3-ac8a-fb09979dc9e4', '2026-02-12', '13:00', 'confirmed', 'Volkswagen', 'T-Roc', 'IJ-345-KL'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '83e3735a-65eb-46a0-8823-d207dcf9aa80', '2026-02-12', '14:00', 'confirmed', 'Seat', 'Ateca', 'MN-678-OP'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'ffdb2b7d-dcb6-4ee2-adab-62cfc3360b83', '2026-02-12', '15:00', 'pending', 'Skoda', 'Superb', 'QR-901-ST');

-- Garage Francais → 6 bookings (RED)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1510ad08-edaa-409e-a46f-8a542043cf3e', '2026-02-12', '09:00', 'confirmed', 'Peugeot', '3008', 'UV-234-WX'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c80ff34f-733b-4f6b-9667-51441d73174a', '2026-02-12', '09:30', 'confirmed', 'Renault', 'Captur', 'YZ-567-AB'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '5fb4d241-073d-463b-bc08-37122ab937f3', '2026-02-12', '10:30', 'confirmed', 'Citroën', 'C5', 'CD-890-EF'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '6a41ddbe-51b0-4ff9-8bf0-e8ca933fba79', '2026-02-12', '11:30', 'pending', 'Peugeot', '508', 'GH-123-IJ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '0cbbe13a-eda0-4b0e-a399-dbe920fbb41e', '2026-02-12', '13:30', 'confirmed', 'Renault', 'Scenic', 'KL-456-MN'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dd8dd96c-45fc-429a-a5b9-d3955933311f', '2026-02-12', '15:00', 'confirmed', 'Citroën', 'Berlingo', 'OP-789-QR');

-- Maas Detailing → 4 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '76bd6042-2776-4b55-837f-53ae8a3a383a', '2026-02-12', '09:00', 'confirmed', 'BMW', 'X5', 'ST-012-UV'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'fc00282b-5e55-48c0-8007-0ca3e7039fe7', '2026-02-12', '10:30', 'confirmed', 'Mercedes', 'E-Klasse', 'WX-345-YZ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '94c30727-4cc9-4e19-bd4e-34d892eeb544', '2026-02-12', '13:00', 'pending', 'Porsche', 'Macan', 'AB-678-CD'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f689a773-a1a0-43b1-a028-b5560bc521fb', '2026-02-12', '14:30', 'confirmed', 'Range Rover', 'Evoque', 'EF-901-GH');

-- Snelservice → 3 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '9aeb293d-d942-4491-925a-c376983116d0', '2026-02-12', '09:00', 'confirmed', 'Toyota', 'Corolla', 'IJ-234-KL'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'fb498854-1c6b-43bf-b904-d6c93e5f85aa', '2026-02-12', '11:00', 'confirmed', 'Honda', 'Jazz', 'MN-567-OP'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '92240d6f-6199-4a52-b4fd-56df42813656', '2026-02-12', '14:00', 'pending', 'Mazda', 'CX-3', 'QR-890-ST');

-- Garage de Maas → 2 bookings (GREEN)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '53fe64ef-3cbb-421d-99a4-6f46cf1d2e94', '2026-02-12', '09:00', 'confirmed', 'Nissan', 'Micra', 'UV-123-WX'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '3993ca1c-bcd7-4de2-9fb1-62e19305326f', '2026-02-12', '14:00', 'confirmed', 'Kia', 'Ceed', 'YZ-456-AB');


-- ============================================================
-- 2026-02-13 (Friday)
-- ============================================================

-- Diesel Centrum → 7 bookings (RED)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', '6e6f3bb6-3cdb-43d0-bddc-8f1233367043', '2026-02-13', '09:00', 'confirmed', 'Iveco', 'Daily', 'CD-789-EF'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', 'bf834676-5a6f-4066-94e8-59553b77a6f0', '2026-02-13', '09:30', 'confirmed', 'Mercedes', 'Sprinter', 'GH-012-IJ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', '254aa0bf-11ee-4bf1-a64e-b9d675c51127', '2026-02-13', '10:00', 'confirmed', 'Volvo', 'XC90 D5', 'KL-345-MN'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', '20ab25bd-5928-4c35-b998-679fc5527b30', '2026-02-13', '10:30', 'pending', 'Volkswagen', 'Crafter', 'OP-678-QR'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', '4c2ad9a3-cd1a-4c46-89c4-dd67ff97ff72', '2026-02-13', '13:00', 'confirmed', 'BMW', '530d', 'ST-901-UV'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', 'a77c7f57-fd12-40a1-a681-48ead641fa3c', '2026-02-13', '14:00', 'confirmed', 'Ford', 'Ranger', 'WX-234-YZ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'abababab-abab-abab-abab-abababababab', 'f8b41dcd-df56-4a67-82d4-4a0934a7d04b', '2026-02-13', '15:00', 'confirmed', 'Peugeot', 'Expert', 'AB-567-CD');

-- Snelservice → 6 bookings (RED)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '9aeb293d-d942-4491-925a-c376983116d0', '2026-02-13', '09:00', 'confirmed', 'Opel', 'Mokka', 'EF-890-GH'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'fb498854-1c6b-43bf-b904-d6c93e5f85aa', '2026-02-13', '09:30', 'confirmed', 'Ford', 'Puma', 'IJ-123-KL'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '92240d6f-6199-4a52-b4fd-56df42813656', '2026-02-13', '10:30', 'confirmed', 'Hyundai', 'Kona', 'MN-456-OP'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'be18124b-aa65-4bd2-8ed9-d763ec5b8efd', '2026-02-13', '11:30', 'pending', 'Kia', 'Stonic', 'QR-789-ST'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'd970e31a-ce3b-4b12-ad98-b518bdfc95af', '2026-02-13', '13:30', 'confirmed', 'Renault', 'Kadjar', 'UV-012-WX'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '1dc0d0d3-b672-42bd-af68-2d37e6b998ab', '2026-02-13', '15:00', 'confirmed', 'Dacia', 'Jogger', 'YZ-345-AB');

-- Garage de Maas → 5 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '53fe64ef-3cbb-421d-99a4-6f46cf1d2e94', '2026-02-13', '09:00', 'confirmed', 'Suzuki', 'Vitara', 'CD-678-EF'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', 'a7dd9518-4de5-4c6f-87aa-620694974b6b', '2026-02-13', '10:00', 'confirmed', 'Mazda', 'CX-5', 'GH-901-IJ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '7440eec8-b5d1-418e-b4c5-0755c2de384d', '2026-02-13', '11:00', 'pending', 'Fiat', 'Tipo', 'KL-234-MN'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '6072f669-ded9-4b4f-b669-194efbc9b9cd', '2026-02-13', '13:30', 'confirmed', 'Honda', 'CR-V', 'OP-567-QR'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '1b3979d1-2592-4080-bc9d-506a1c8ce8f4', '2026-02-13', '15:00', 'confirmed', 'Nissan', 'Juke', 'ST-890-UV');

-- VAG Specialist → 3 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '64f64ece-7d7a-4264-a923-fdfc026c5658', '2026-02-13', '09:00', 'confirmed', 'Volkswagen', 'Golf GTI', 'WX-123-YZ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '83e3735a-65eb-46a0-8823-d207dcf9aa80', '2026-02-13', '11:00', 'confirmed', 'Audi', 'TT', 'AB-456-CD'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'ffdb2b7d-dcb6-4ee2-adab-62cfc3360b83', '2026-02-13', '14:00', 'pending', 'Seat', 'Cupra', 'EF-789-GH');

-- MU Automotive → 4 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'd1810eb5-f0bb-4844-84cc-df0200e3b26c', 'c80885e6-a761-48e6-81a5-3a173ac214b0', '2026-02-13', '09:00', 'confirmed', 'Toyota', 'RAV4', 'IJ-012-KL'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'd1810eb5-f0bb-4844-84cc-df0200e3b26c', '2e06edb3-e763-484c-8ba4-1d8fb7f040fe', '2026-02-13', '10:30', 'confirmed', 'Mitsubishi', 'Outlander', 'MN-345-OP'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'd1810eb5-f0bb-4844-84cc-df0200e3b26c', 'f328ca44-4e70-4cd7-8d47-671e56d53e90', '2026-02-13', '13:00', 'pending', 'Subaru', 'XV', 'QR-678-ST'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'd1810eb5-f0bb-4844-84cc-df0200e3b26c', 'c80885e6-a761-48e6-81a5-3a173ac214b0', '2026-02-13', '14:30', 'confirmed', 'Lexus', 'NX', 'UV-901-WX');


-- ============================================================
-- 2026-02-14 (Saturday) - Most garages closed
-- ============================================================

-- Snelservice (open Saturday) → 4 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '9aeb293d-d942-4491-925a-c376983116d0', '2026-02-14', '09:00', 'confirmed', 'Volkswagen', 'ID.3', 'YZ-234-AB'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'fb498854-1c6b-43bf-b904-d6c93e5f85aa', '2026-02-14', '10:00', 'confirmed', 'Tesla', 'Model Y', 'CD-567-EF'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '92240d6f-6199-4a52-b4fd-56df42813656', '2026-02-14', '11:00', 'pending', 'Hyundai', 'Ioniq 5', 'GH-890-IJ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'be18124b-aa65-4bd2-8ed9-d763ec5b8efd', '2026-02-14', '12:00', 'confirmed', 'Kia', 'EV6', 'KL-123-MN');

-- Maas Detailing (open Saturday) → 3 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '76bd6042-2776-4b55-837f-53ae8a3a383a', '2026-02-14', '09:00', 'confirmed', 'Mercedes', 'AMG GT', 'OP-456-QR'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'fc00282b-5e55-48c0-8007-0ca3e7039fe7', '2026-02-14', '10:30', 'confirmed', 'BMW', 'M4', 'ST-789-UV'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'b56ece90-d4ba-497e-be7d-ae67c3d7818c', '2026-02-14', '13:00', 'confirmed', 'Audi', 'RS6', 'WX-012-YZ');


-- ============================================================
-- 2026-02-15 (Sunday) - Almost all closed
-- ============================================================

-- Snelservice (open Sunday) → 2 bookings (GREEN)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '9aeb293d-d942-4491-925a-c376983116d0', '2026-02-15', '10:00', 'confirmed', 'Toyota', 'GR86', 'AB-345-CD'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'fb498854-1c6b-43bf-b904-d6c93e5f85aa', '2026-02-15', '11:00', 'pending', 'Mazda', 'MX-5', 'EF-678-GH');


-- ============================================================
-- 2026-02-16 (Monday)
-- ============================================================

-- VAG Specialist → 7 bookings (RED)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '64f64ece-7d7a-4264-a923-fdfc026c5658', '2026-02-16', '09:00', 'confirmed', 'Volkswagen', 'Arteon', 'IJ-901-KL'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'f0684e72-3ac6-40aa-8e41-29d1b6986bee', '2026-02-16', '09:30', 'confirmed', 'Audi', 'A6', 'MN-234-OP'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33e6bf99-8b05-4fb2-89a2-cab3b5398fb3', '2026-02-16', '10:00', 'confirmed', 'Skoda', 'Kodiaq', 'QR-567-ST'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '46362563-2d4a-4e5b-8199-8de02591cb48', '2026-02-16', '10:30', 'pending', 'Seat', 'Tarraco', 'UV-890-WX'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '496ec5c2-f7a3-420d-982d-006903b5765e', '2026-02-16', '11:30', 'confirmed', 'Volkswagen', 'Touareg', 'YZ-123-AB'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'e7b1e15e-05d7-48f3-ac8a-fb09979dc9e4', '2026-02-16', '13:30', 'confirmed', 'Audi', 'Q7', 'CD-456-EF'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '83e3735a-65eb-46a0-8823-d207dcf9aa80', '2026-02-16', '15:00', 'confirmed', 'Skoda', 'Enyaq', 'GH-789-IJ');

-- Garage de Maas → 4 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '53fe64ef-3cbb-421d-99a4-6f46cf1d2e94', '2026-02-16', '09:00', 'confirmed', 'Opel', 'Grandland', 'KL-012-MN'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', 'a7dd9518-4de5-4c6f-87aa-620694974b6b', '2026-02-16', '10:30', 'confirmed', 'Ford', 'Kuga', 'OP-345-QR'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '3993ca1c-bcd7-4de2-9fb1-62e19305326f', '2026-02-16', '13:00', 'pending', 'Renault', 'Arkana', 'ST-678-UV'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '22222222-2222-2222-2222-222222222222', '7440eec8-b5d1-418e-b4c5-0755c2de384d', '2026-02-16', '14:30', 'confirmed', 'Peugeot', '2008', 'WX-901-YZ');

-- Snelservice → 5 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '9aeb293d-d942-4491-925a-c376983116d0', '2026-02-16', '09:00', 'confirmed', 'Dacia', 'Spring', 'AB-234-CD'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'fb498854-1c6b-43bf-b904-d6c93e5f85aa', '2026-02-16', '10:00', 'confirmed', 'Citroën', 'C3 Aircross', 'EF-567-GH'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '92240d6f-6199-4a52-b4fd-56df42813656', '2026-02-16', '11:00', 'pending', 'Fiat', 'Tipo Cross', 'IJ-890-KL'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'be18124b-aa65-4bd2-8ed9-d763ec5b8efd', '2026-02-16', '13:00', 'confirmed', 'Suzuki', 'S-Cross', 'MN-123-OP'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'd970e31a-ce3b-4b12-ad98-b518bdfc95af', '2026-02-16', '14:30', 'confirmed', 'Honda', 'HR-V', 'QR-456-ST');

-- Garage Francais → 3 bookings (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1510ad08-edaa-409e-a46f-8a542043cf3e', '2026-02-16', '09:00', 'confirmed', 'Peugeot', 'Rifter', 'UV-789-WX'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c80ff34f-733b-4f6b-9667-51441d73174a', '2026-02-16', '11:00', 'confirmed', 'Renault', 'Kangoo', 'YZ-012-AB'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '5fb4d241-073d-463b-bc08-37122ab937f3', '2026-02-16', '14:00', 'pending', 'Citroën', 'SpaceTourer', 'CD-345-EF');


-- ============================================================
-- Also add some bookings for non-Maastricht garages (visible when zooming out)
-- ============================================================

-- AutoPro Amsterdam → 5 bookings today (ORANGE)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '11111111-1111-1111-1111-111111111111', '3e439c79-5cad-4fd0-be62-97cae5220fc5', '2026-02-10', '09:00', 'confirmed', 'BMW', '1 Serie', 'GH-678-IJ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '11111111-1111-1111-1111-111111111111', '59202a59-ff75-4c17-9597-b0ac56b14329', '2026-02-10', '10:00', 'confirmed', 'BMW', 'X3', 'KL-901-MN'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '11111111-1111-1111-1111-111111111111', 'f67c35a8-9298-4a1b-a739-79be4314996d', '2026-02-10', '11:00', 'confirmed', 'BMW', '5 Serie', 'OP-234-QR'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '11111111-1111-1111-1111-111111111111', '21d40273-889a-4186-bc26-e9ae54bbfabd', '2026-02-10', '13:00', 'pending', 'BMW', 'X1', 'ST-567-UV'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '11111111-1111-1111-1111-111111111111', 'e7bc7314-bf93-4a52-8090-48729ca9b5b4', '2026-02-10', '14:30', 'confirmed', 'BMW', 'Z4', 'WX-890-YZ');

-- Speed Garage Breda → 7 bookings Friday (RED)
INSERT INTO bookings (user_id, garage_id, service_id, date, time_slot, status, car_brand, car_model, car_license_plate)
VALUES
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '99999999-9999-9999-9999-999999999999', '504a5771-f2ed-4f52-ad12-de09cbbed548', '2026-02-13', '09:00', 'confirmed', 'Ford', 'Mustang', 'AB-123-YZ'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '99999999-9999-9999-9999-999999999999', '0f042122-5f25-4b58-8b9b-e79e71ea2bdc', '2026-02-13', '09:30', 'confirmed', 'Honda', 'Civic Type R', 'CD-456-WX'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '99999999-9999-9999-9999-999999999999', '25c15ea4-46c0-4c95-b071-da99ab955040', '2026-02-13', '10:00', 'confirmed', 'Mazda', 'MX-5', 'EF-789-UV'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '99999999-9999-9999-9999-999999999999', '9f2a850e-b658-4c48-8416-745742ab8b58', '2026-02-13', '10:30', 'pending', 'BMW', 'M3', 'GH-012-ST'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '99999999-9999-9999-9999-999999999999', 'b724cd30-50d4-4bba-8e86-0155e749ba5d', '2026-02-13', '13:00', 'confirmed', 'Audi', 'RS3', 'IJ-345-QR'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '99999999-9999-9999-9999-999999999999', '8a97844e-e650-41dc-8821-4a5666675051', '2026-02-13', '14:00', 'confirmed', 'Porsche', '911', 'KL-678-OP'),
  ('a6ffad28-85fc-4106-9c52-cd29e07d2556', '99999999-9999-9999-9999-999999999999', '3f74ae37-aa04-4fc3-abce-620dae8f3499', '2026-02-13', '15:30', 'confirmed', 'Mercedes', 'AMG C63', 'MN-901-LM');
