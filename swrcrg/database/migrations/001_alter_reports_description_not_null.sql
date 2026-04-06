-- ============================================================
-- Migración 001: description en reports pasa a NOT NULL
-- ============================================================

-- Paso 1: rellenar registros existentes que tengan description NULL
UPDATE reports
SET description = 'Sin descripción'
WHERE description IS NULL;

-- Paso 2: aplicar la restricción NOT NULL
ALTER TABLE reports
  ALTER COLUMN description SET NOT NULL;
