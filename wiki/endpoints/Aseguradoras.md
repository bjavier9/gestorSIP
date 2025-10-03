# Endpoints de Aseguradoras

**Ruta base**: `/api/aseguradoras`

Todas las rutas estan protegidas por `authMiddleware`. Las operaciones de escritura ademas usan `adminSupervisorOrSuperadminMiddleware`, por lo que solo `admin`, `supervisor` o `superadmin` pueden crear o actualizar registros.

## GET /
- **Descripcion**: Lista todas las aseguradoras visibles para la compania actual.
- **Autenticacion**: JWT valido.
- **Respuesta 200** (la respuesta es un arreglo sin wrapper personalizado):
  ```json
  [
    {
      "id": "aseg_001",
      "nombre": "Aseguradora Uno",
      "codigo": "A1",
      "direccion": "Av Principal",
      "telefono": "+58-212-5550000",
      "correo": "contacto@aseguradorauno.com",
      "rating": 4.7,
      "activo": true,
      "fechaCreacion": "2024-01-01T00:00:00.000Z",
      "fechaActualizacion": "2024-01-05T12:34:56.000Z"
    }
  ]
  ```
- **Errores comunes**: `401` si falta o expira el token.

## GET /:id
- **Descripcion**: Recupera una aseguradora por su identificador.
- **Autenticacion**: JWT valido.
- **Respuesta 200**: objeto `Aseguradora`.
- **Errores**:
  - `401` no autorizado.
  - `404 NOT_FOUND`: aseguradora inexistente.

## POST /
- **Descripcion**: Crea una aseguradora.
- **Autenticacion**: JWT + rol `admin`, `supervisor` o `superadmin`.
- **Cuerpo** (`application/json`):
  ```json
  {
    "nombre": "Aseguradora Dos",
    "codigo": "A2",
    "direccion": "Calle 10",
    "telefono": "+58-212-5559999",
    "correo": "info@aseguradorados.com",
    "rating": 4.5,
    "activo": true
  }
  ```
  Campos como `id`, `fechaCreacion` y `fechaActualizacion` los define el repositorio.
- **Respuesta 201**: objeto creado.
- **Errores**:
  - `401` sin token.
  - `403` rol insuficiente.
  - `400` validaciones adicionales segun el servicio.

## PUT /:id
- **Descripcion**: Actualiza una aseguradora existente.
- **Autenticacion**: JWT + rol `admin`, `supervisor` o `superadmin`.
- **Cuerpo**: permite `Partial<Aseguradora>` (sin `id` ni fechas).
  ```json
  {
    "telefono": "+58-212-5558888",
    "rating": 4.9,
    "activo": false
  }
  ```
- **Respuesta 200**: objeto actualizado.
- **Errores**:
  - `401` o `403`: permisos insuficientes.
  - `404 NOT_FOUND`: id inexistente.
