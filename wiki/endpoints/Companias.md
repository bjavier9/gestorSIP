# Endpoints de Companias de Corretaje

**Ruta base**: `/api/companias`

Solo el superadmin (correo configurado en `SUPERADMIN_EMAIL`) puede acceder al modulo. Todas las rutas usan `authMiddleware` + `superAdminMiddleware`.

## POST /
- **Descripcion**: Crea una compania de corretaje.
- **Autenticacion**: JWT con rol `superadmin`.
- **Cuerpo**:
  ```json
  {
    "nombre": "Corretaje Demo",
    "rif": "J-123456789",
    "direccion": "Av Principal",
    "telefono": "+58-212-5551122",
    "correo": "contacto@demo.com",
    "monedasAceptadas": ["USD", "EUR"],
    "monedaPorDefecto": "USD",
    "modulos": ["gestion_poliza", "reporteria"]
  }
  ```
  El repositorio agrega `creada`, `modificado`, `fechaCreacion` y `fechaActualizacion`.
- **Respuesta 201**:
  ```json
  {
    "success": true,
    "status": 201,
    "data": {
      "id": "cia_001",
      "nombre": "Corretaje Demo",
      "activo": true,
      "monedasAceptadas": ["USD", "EUR"],
      "monedaPorDefecto": "USD"
    }
  }
  ```
- **Errores**:
  - `400 VALIDATION_MISSING_FIELD`: faltan `nombre` o `rif`.
  - `401`/`403`: token invalido o sin permisos.
  - `409`: RIF duplicado.
  - `500 CONFIG_ERROR`: variables del superadmin faltantes.

## PUT /:id
- **Descripcion**: Actualiza campos mutables.
- **Autenticacion**: superadmin.
- **Cuerpo**: `Partial<CompaniaCorretaje>` (sin `id`).
  ```json
  {
    "telefono": "+58-212-5550090",
    "direccion": "Avenida Norte",
    "activo": true
  }
  ```
- **Respuesta 200**: compania actualizada.
- **Errores**:
  - `400`: falta `id`.
  - `404`: compania no encontrada.
  - `409`: conflicto de RIF.

## PATCH /:id/activar
- **Descripcion**: Marca `activo = true`.
- **Respuesta 200**: compania actualizada.
- **Errores**: `400` id faltante, `404` no encontrada.

## PATCH /:id/desactivar
- **Descripcion**: Marca `activo = false`.
- **Respuesta 200**: compania actualizada.
- **Errores**: `400` id faltante, `404` no encontrada.
