USE meil_esg;

INSERT INTO projects (id, name, code, description) VALUES
  (101, 'Project Alpha', 'ALPHA', 'North campus energy reporting'),
  (102, 'Project Beta', 'BETA', 'Central operations energy reporting'),
  (103, 'Project Gamma', 'GAMMA', 'Manufacturing site energy reporting'),
  (104, 'Project Delta', 'DELTA', 'Regional project energy reporting')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- Demo password for each account is 123456. This is a bcrypt hash, not a plaintext password.
INSERT INTO users (id, name, email, password_hash, role, project_id) VALUES
  (1, 'Project User', 'user@meil.com', '$2a$10$aLIXFGUkThOt/km4z1/PfuBXqBBMm9yfkSB0lJy3EUPOTyJmhgw6W', 'PROJECT_USER', 101),
  (2, 'ESG Reviewer', 'reviewer@meil.com', '$2a$10$aLIXFGUkThOt/km4z1/PfuBXqBBMm9yfkSB0lJy3EUPOTyJmhgw6W', 'REVIEWER', NULL),
  (3, 'MEIL Admin', 'admin@meil.com', '$2a$10$aLIXFGUkThOt/km4z1/PfuBXqBBMm9yfkSB0lJy3EUPOTyJmhgw6W', 'ADMIN', NULL),
  (4, 'Beta Project User', 'beta.user@meil.com', '$2a$10$aLIXFGUkThOt/km4z1/PfuBXqBBMm9yfkSB0lJy3EUPOTyJmhgw6W', 'PROJECT_USER', 102),
  (5, 'Gamma Project User', 'gamma.user@meil.com', '$2a$10$aLIXFGUkThOt/km4z1/PfuBXqBBMm9yfkSB0lJy3EUPOTyJmhgw6W', 'PROJECT_USER', 103),
  (6, 'Delta Project User', 'delta.user@meil.com', '$2a$10$aLIXFGUkThOt/km4z1/PfuBXqBBMm9yfkSB0lJy3EUPOTyJmhgw6W', 'PROJECT_USER', 104)
ON DUPLICATE KEY UPDATE
  name = VALUES(name), password_hash = VALUES(password_hash), role = VALUES(role), project_id = VALUES(project_id);

INSERT INTO submissions (id, project_id, reporting_year, category, sub_category, energy_value, unit, description, evidence_file_name, status, submitted_by, review_comment, created_at, updated_at) VALUES
  (1001, 101, 2026, 'ENVIRONMENTAL', 'ENERGY', 12500.000, 'kWh', 'Annual electricity consumption for the main office.', 'alpha-electricity-bill.pdf', 'PENDING', 1, NULL, '2026-02-10 09:15:00', '2026-02-10 09:15:00'),
  (1002, 101, 2026, 'ENVIRONMENTAL', 'ENERGY', 12200.000, 'kWh', 'Quarterly facility electricity usage.', 'alpha-q1-statement.pdf', 'UNDER_REVIEW', 1, 'Evidence is being reviewed.', '2026-03-14 11:20:00', '2026-03-15 08:45:00'),
  (1003, 101, 2026, 'ENVIRONMENTAL', 'ENERGY', 13400.000, 'kWh', 'Annual energy report for the project office.', 'alpha-annual-report.pdf', 'CORRECTION_REQUIRED', 1, 'Please attach the complete utility statement.', '2026-04-04 10:05:00', '2026-04-06 14:30:00'),
  (1004, 101, 2026, 'ENVIRONMENTAL', 'ENERGY', 11000.000, 'kWh', 'Verified electricity consumption for the reporting period.', 'alpha-verified-bill.pdf', 'APPROVED', 1, 'Evidence verified.', '2026-01-18 12:00:00', '2026-02-01 09:20:00'),
  (1005, 102, 2026, 'ENVIRONMENTAL', 'ENERGY', 8800.000, 'kWh', 'Project Beta electricity usage, first reporting period.', 'beta-electricity.pdf', 'PENDING', 4, NULL, '2026-02-12 08:35:00', '2026-02-12 08:35:00'),
  (1006, 102, 2026, 'ENVIRONMENTAL', 'ENERGY', 18000.000, 'kWh', 'Annual electricity consumption for Project Beta.', 'beta-annual-bill.pdf', 'APPROVED', 4, 'Approved after evidence review.', '2026-01-22 14:10:00', '2026-02-05 13:15:00'),
  (1007, 102, 2026, 'ENVIRONMENTAL', 'ENERGY', 9200.000, 'kWh', 'Electricity use for the Beta facility.', 'beta-facility-bill.pdf', 'UNDER_REVIEW', 4, 'Review in progress.', '2026-05-01 09:00:00', '2026-05-02 10:00:00'),
  (1008, 103, 2026, 'ENVIRONMENTAL', 'ENERGY', 7600.000, 'kWh', 'Gamma site electricity consumption.', 'gamma-utility-bill.pdf', 'APPROVED', 5, 'Approved.', '2026-02-02 10:45:00', '2026-02-13 15:00:00'),
  (1009, 103, 2026, 'ENVIRONMENTAL', 'ENERGY', 7500.000, 'kWh', 'Gamma production facility energy usage.', 'gamma-energy-summary.pdf', 'PENDING', 5, NULL, '2026-05-12 11:30:00', '2026-05-12 11:30:00'),
  (1010, 103, 2026, 'ENVIRONMENTAL', 'ENERGY', 8100.000, 'kWh', 'Gamma site annual consumption statement.', 'gamma-annual-statement.pdf', 'CORRECTION_REQUIRED', 5, 'Please confirm the reporting period on the evidence.', '2026-03-09 08:00:00', '2026-03-11 16:20:00'),
  (1011, 104, 2026, 'ENVIRONMENTAL', 'ENERGY', 11500.000, 'kWh', 'Delta project annual electricity usage.', 'delta-energy-bill.pdf', 'APPROVED', 6, 'Verified and approved.', '2026-01-25 09:30:00', '2026-02-08 10:10:00'),
  (1012, 104, 2026, 'ENVIRONMENTAL', 'ENERGY', 6400.000, 'kWh', 'Delta project electricity consumption.', 'delta-monthly-summary.pdf', 'PENDING', 6, NULL, '2026-06-15 12:00:00', '2026-06-15 12:00:00')
ON DUPLICATE KEY UPDATE
  project_id = VALUES(project_id), reporting_year = VALUES(reporting_year), category = VALUES(category),
  sub_category = VALUES(sub_category), energy_value = VALUES(energy_value), unit = VALUES(unit),
  description = VALUES(description), evidence_file_name = VALUES(evidence_file_name),
  status = VALUES(status), submitted_by = VALUES(submitted_by), review_comment = VALUES(review_comment),
  created_at = VALUES(created_at), updated_at = VALUES(updated_at);

INSERT INTO submission_history (submission_id, status, comment, changed_by, created_at)
SELECT s.id, s.status, COALESCE(s.review_comment, 'Submission created.'),
       CASE WHEN s.status = 'PENDING' THEN s.submitted_by ELSE 2 END, s.updated_at
FROM submissions s
WHERE s.id BETWEEN 1001 AND 1012
  AND NOT EXISTS (SELECT 1 FROM submission_history h WHERE h.submission_id = s.id);

INSERT INTO submission_reviews (submission_id, reviewer_id, decision, comment, created_at)
SELECT s.id, 2, s.status, s.review_comment, s.updated_at
FROM submissions s
WHERE s.status IN ('UNDER_REVIEW', 'CORRECTION_REQUIRED', 'APPROVED')
  AND s.id BETWEEN 1001 AND 1012
  AND NOT EXISTS (SELECT 1 FROM submission_reviews r WHERE r.submission_id = s.id);
