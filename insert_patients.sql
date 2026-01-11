-- Script para insertar todos los pacientes históricos
-- Este script se puede ejecutar de forma segura múltiples veces gracias a ON CONFLICT

-- Insertar todos los pacientes del CSV
INSERT INTO violeta_gest.patients (id, name, phone, email, first_visit_date, status, created_at, updated_at)
SELECT * FROM (VALUES
('4edf43b6-9f1a-43f5-acad-9c2041e53946', 'Aaron Perez Moreno', NULL, NULL, '2023-09-21'::DATE, 'active'::violeta_gest.patient_status, '2026-01-11T17:54:02.174579'::TIMESTAMPTZ, '2026-01-11T17:54:02.174709'::TIMESTAMPTZ),
('e24417e4-c22d-4726-b029-9a4b30f20f91', 'Adela Moreno Martínez', NULL, NULL, '2023-02-14'::DATE, 'active'::violeta_gest.patient_status, '2026-01-11T17:54:02.174579'::TIMESTAMPTZ, '2026-01-11T17:54:02.174709'::TIMESTAMPTZ),
('d7a4e4bf-5eb9-4670-bc0c-406ce0338620', 'Agripina Ruiz Román', NULL, NULL, '2022-12-01'::DATE, 'active'::violeta_gest.patient_status, '2026-01-11T17:54:02.174579'::TIMESTAMPTZ, '2026-01-11T17:54:02.174709'::TIMESTAMPTZ),
('484f9c1a-efcb-4385-bc2d-2975a0547de6', 'Agueda Sanchez Rodriguez', NULL, NULL, '2022-08-03'::DATE, 'active'::violeta_gest.patient_status, '2026-01-11T17:54:02.174579'::TIMESTAMPTZ, '2026-01-11T17:54:02.174709'::TIMESTAMPTZ),
('979fbc6a-0bdf-4071-8b32-ad131ebd0f39', 'Aitor Requena Jimenez', NULL, NULL, '2022-03-18'::DATE, 'active'::violeta_gest.patient_status, '2026-01-11T17:54:02.174579'::TIMESTAMPTZ, '2026-01-11T17:54:02.174709'::TIMESTAMPTZ)
) AS t(id, name, phone, email, first_visit_date, status, created_at, updated_at)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  first_visit_date = EXCLUDED.first_visit_date,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
