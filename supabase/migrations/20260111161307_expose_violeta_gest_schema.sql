/*
  # Expose violeta_gest schema to REST API
  
  1. Changes
    - Grant usage on violeta_gest schema to anon and authenticated roles
    - Grant select, insert, update, delete on all tables in violeta_gest to anon and authenticated roles
    - Update default privileges for future tables
  
  2. Security
    - RLS is already enabled on all tables
    - This only grants basic access, RLS policies will still control data access
*/

-- Grant schema usage to anon and authenticated roles
GRANT USAGE ON SCHEMA violeta_gest TO anon, authenticated;

-- Grant table access to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA violeta_gest TO anon, authenticated;

-- Grant sequence usage for auto-incrementing IDs (if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA violeta_gest TO anon, authenticated;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA violeta_gest GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA violeta_gest GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;
