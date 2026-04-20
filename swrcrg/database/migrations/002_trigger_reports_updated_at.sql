



-- ============================================================
-- Migración 002: trigger para actualizar updated_at en reports
-- ============================================================

-- Paso 1: función reutilizable que actualiza updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Paso 2: trigger que llama a la función antes de cada UPDATE en reports
DROP TRIGGER IF EXISTS trigger_reports_updated_at ON reports;

CREATE TRIGGER trigger_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
