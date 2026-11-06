INSERT INTO "hrms_leave_types" ("name", "annual_entitlement_days", "carry_forward_max_days", "encashable", "requires_approval", "active") VALUES
  ('Annual Leave', '10', '5', false, true, true),
  ('Sick Leave', '10', '0', false, true, true),
  ('Unpaid Leave', '0', '0', false, true, true),
  ('Maternity Leave', '84', '0', false, true, true),
  ('Paternity Leave', '5', '0', false, true, true),
  ('Compassionate Leave', '3', '0', false, true, true)
ON CONFLICT ("name") DO NOTHING;
