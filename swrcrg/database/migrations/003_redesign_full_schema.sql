-- ============================================================
-- Migración 003: Rediseño completo del esquema
-- ============================================================

-- 1. Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(50)  NOT NULL UNIQUE,
  descripcion TEXT
);

-- Roles iniciales
INSERT INTO roles (nombre, descripcion) VALUES
  ('ciudadano',      'Usuario estándar que puede crear y ver reportes'),
  ('administrador',  'Administrador con acceso total al panel de gestión')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Tabla de estados de reporte
CREATE TABLE IF NOT EXISTS estados_reporte (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(50)  NOT NULL UNIQUE,
  descripcion TEXT
);

-- Estados iniciales
INSERT INTO estados_reporte (nombre, descripcion) VALUES
  ('pendiente',   'Reporte recibido, pendiente de revisión'),
  ('en_proceso',  'Reporte en proceso de atención'),
  ('resuelto',    'Reporte atendido y resuelto')
ON CONFLICT (nombre) DO NOTHING;

-- 3. Recrear tabla usuarios con nueva estructura
-- Primero eliminar dependencias
DROP TABLE IF EXISTS report_images CASCADE;
DROP TABLE IF EXISTS reports       CASCADE;
DROP TABLE IF EXISTS users         CASCADE;

CREATE TABLE users (
  id                  SERIAL PRIMARY KEY,
  nombre              VARCHAR(100)  NOT NULL,
  apellido            VARCHAR(100)  NOT NULL,
  correo              VARCHAR(150)  NOT NULL UNIQUE,
  contrasena          VARCHAR(255)  NOT NULL,
  telefono            VARCHAR(20),
  rol_id              INTEGER       NOT NULL REFERENCES roles(id),
  activo              BOOLEAN       NOT NULL DEFAULT TRUE,
  fecha_creacion      TIMESTAMP     NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- 4. Tabla de reportes rediseñada
CREATE TABLE reports (
  id                  SERIAL PRIMARY KEY,
  titulo              VARCHAR(150)  NOT NULL,
  descripcion         TEXT          NOT NULL,
  direccion_referencia VARCHAR(255),
  latitud             NUMERIC(9,6)  NOT NULL,
  longitud            NUMERIC(9,6)  NOT NULL,
  usuario_id          INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  estado_id           INTEGER       NOT NULL REFERENCES estados_reporte(id),
  fecha_reporte       TIMESTAMP     NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- 5. Tabla de imágenes de reporte
CREATE TABLE report_images (
  id              SERIAL PRIMARY KEY,
  reporte_id      INTEGER       NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  url_imagen      VARCHAR(500)  NOT NULL,
  nombre_archivo  VARCHAR(255)  NOT NULL,
  tipo_archivo    VARCHAR(100),
  tamano_archivo  INTEGER,
  fecha_subida    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- 6. Triggers updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at    ON users;
DROP TRIGGER IF EXISTS trigger_reports_updated_at  ON reports;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
