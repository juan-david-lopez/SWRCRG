-- ============================================================
-- SWRCRG - Esquema inicial de base de datos
-- ============================================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)        NOT NULL,
  email       VARCHAR(150)        NOT NULL UNIQUE,
  password    VARCHAR(255)        NOT NULL,
  role        VARCHAR(20)         NOT NULL DEFAULT 'citizen'
                                  CHECK (role IN ('admin', 'citizen')),
  created_at  TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- Tabla de reportes
CREATE TABLE IF NOT EXISTS reports (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(150)        NOT NULL,
  description TEXT                NOT NULL,
  latitude    NUMERIC(9, 6)       NOT NULL,
  longitude   NUMERIC(9, 6)       NOT NULL,
  image_url   VARCHAR(500),
  status      VARCHAR(30)         NOT NULL DEFAULT 'pendiente'
                                  CHECK (status IN ('pendiente', 'en_proceso', 'resuelto')),
  user_id     INTEGER             NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP           NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP           NOT NULL DEFAULT NOW()
);
