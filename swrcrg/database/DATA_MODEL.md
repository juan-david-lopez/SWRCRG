# Modelo de Datos — SWRCRG

## Tablas

### `users`

Almacena los usuarios del sistema. El rol determina los permisos de cada usuario.

| Columna      | Tipo           | Restricciones                          | Descripción                        |
|--------------|----------------|----------------------------------------|------------------------------------|
| `id`         | SERIAL         | PRIMARY KEY                            | Identificador único                |
| `name`       | VARCHAR(100)   | NOT NULL                               | Nombre del usuario                 |
| `email`      | VARCHAR(150)   | NOT NULL, UNIQUE                       | Correo electrónico                 |
| `password`   | VARCHAR(255)   | NOT NULL                               | Contraseña hasheada                |
| `role`       | VARCHAR(20)    | NOT NULL, DEFAULT `'citizen'`, CHECK   | Rol: `admin` o `citizen`           |
| `created_at` | TIMESTAMP      | NOT NULL, DEFAULT NOW()                | Fecha de creación                  |

---

### `reports`

Almacena los reportes ciudadanos geolocalizados. Cada reporte pertenece a un usuario.

| Columna       | Tipo           | Restricciones                          | Descripción                              |
|---------------|----------------|----------------------------------------|------------------------------------------|
| `id`          | SERIAL         | PRIMARY KEY                            | Identificador único                      |
| `title`       | VARCHAR(150)   | NOT NULL                               | Título del reporte                       |
| `description` | TEXT           | NOT NULL                               | Descripción detallada                    |
| `latitude`    | NUMERIC(9,6)   | NOT NULL                               | Latitud geográfica                       |
| `longitude`   | NUMERIC(9,6)   | NOT NULL                               | Longitud geográfica                      |
| `image_url`   | VARCHAR(500)   | NULLABLE                               | URL de imagen adjunta (opcional)         |
| `status`      | VARCHAR(30)    | NOT NULL, DEFAULT `'pendiente'`, CHECK | Estado: `pendiente`, `en_proceso`, `resuelto` |
| `user_id`     | INTEGER        | NOT NULL, FK → `users(id)` ON DELETE CASCADE | Usuario que creó el reporte       |
| `created_at`  | TIMESTAMP      | NOT NULL, DEFAULT NOW()                | Fecha de creación                        |
| `updated_at`  | TIMESTAMP      | NOT NULL, DEFAULT NOW()                | Fecha de última actualización            |

---

## Operaciones por modelo

### `user.model.js`

| Función           | Descripción                                              | Devuelve                          |
|-------------------|----------------------------------------------------------|-----------------------------------|
| `createUser`      | Inserta un nuevo usuario con rol `citizen` por defecto   | `{ id, name, email, role, created_at }` |
| `findUserByEmail` | Busca un usuario por email, incluye `password`           | Usuario o `null`                  |
| `findUserById`    | Busca un usuario por id, sin exponer `password`          | Usuario o `null`                  |

### `report.model.js`

| Función              | Descripción                                                        | Devuelve                        |
|----------------------|--------------------------------------------------------------------|---------------------------------|
| `createReport`       | Inserta un nuevo reporte con estado `pendiente` por defecto        | Reporte completo (`*`)          |
| `getAllReports`       | Obtiene todos los reportes ordenados por fecha, con `user_name`    | Array de reportes               |
| `getReportById`      | Obtiene un reporte por id, con `user_name` y `user_email`          | Reporte o `null`                |
| `updateReportStatus` | Actualiza el campo `status` de un reporte                          | Reporte actualizado o `null`    |

---

## Relaciones

```
users (1) ──────< reports (N)
  id                user_id
```

Un usuario puede tener múltiples reportes. Si el usuario es eliminado, sus reportes se eliminan en cascada.

---

## Triggers

### `trigger_reports_updated_at`

Actualiza automáticamente `reports.updated_at` antes de cada `UPDATE` en la tabla `reports`.

```sql
BEFORE UPDATE ON reports → set_updated_at()
```

---

## Roles de usuario

| Rol       | Descripción                                      |
|-----------|--------------------------------------------------|
| `citizen` | Usuario estándar. Puede crear y ver reportes.    |
| `admin`   | Administrador. Puede gestionar el estado de los reportes. |

> El rol no es una tabla separada, sino un atributo del usuario (`users.role`).
