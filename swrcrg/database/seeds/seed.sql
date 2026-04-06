-- ============================================================
-- SWRCRG - Semilla inicial
-- Contraseña: admin1234 (bcrypt hash de ejemplo, reemplazar en producción)
-- ============================================================

INSERT INTO users (name, email, password, role)
VALUES (
  'Administrador',
  'admin@swrcrg.com',
  '$2b$10$examplehashreplacethiswitharealbcrypthash000000000000000',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
