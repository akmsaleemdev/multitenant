-- Row-Level Security policies
-- Assumption: application sets `app.current_organization_id` per request (see lib/db.ts).
-- In Supabase production, replace with auth.jwt() claim from app_metadata.

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION current_org_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_organization_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;

-- Organizations: users see only their org
CREATE POLICY org_select_own ON organizations
  FOR SELECT USING (id = current_org_id());

-- Users: same organization only
CREATE POLICY users_select_org ON users
  FOR SELECT USING (organization_id = current_org_id());

-- Properties
CREATE POLICY properties_select_org ON properties
  FOR SELECT USING (organization_id = current_org_id());

CREATE POLICY properties_insert_org ON properties
  FOR INSERT WITH CHECK (organization_id = current_org_id());

CREATE POLICY properties_update_org ON properties
  FOR UPDATE USING (organization_id = current_org_id());

-- Tenants
CREATE POLICY tenants_select_org ON tenants
  FOR SELECT USING (organization_id = current_org_id());

-- Invoices
CREATE POLICY invoices_select_org ON invoices
  FOR SELECT USING (organization_id = current_org_id());

-- Demo: allow app role to bypass RLS when using service connection without setting.
-- Production: use a restricted DB role and always set org context.
