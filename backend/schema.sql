CREATE DATABASE IF NOT EXISTS dhl_incident CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dhl_incident;

CREATE TABLE IF NOT EXISTS users (
  id       VARCHAR(20)  NOT NULL PRIMARY KEY,
  username VARCHAR(60)  NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role     VARCHAR(20)  NOT NULL,
  name     VARCHAR(120) NOT NULL,
  email    VARCHAR(180) NOT NULL
);

-- Common fields are real columns (filterable/indexable); the full incident object
-- (notes, sources, ai, attachments, ...) lives in `data`.
CREATE TABLE IF NOT EXISTS incidents (
  id              VARCHAR(20)  NOT NULL PRIMARY KEY,
  tracking_number VARCHAR(40)  NOT NULL,
  status          VARCHAR(30)  NOT NULL,
  priority        VARCHAR(10)  NOT NULL,
  category        VARCHAR(40)  NOT NULL,
  assigned_to     VARCHAR(60)  NULL,
  created_at      DATETIME(3)  NOT NULL,
  data            JSON         NOT NULL,
  INDEX idx_incidents_tracking (tracking_number),
  INDEX idx_incidents_status (status),
  INDEX idx_incidents_created (created_at)
);
