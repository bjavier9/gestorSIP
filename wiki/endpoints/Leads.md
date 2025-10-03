# Endpoints de Leads

**Ruta base**: `/api/leads`

Todas las rutas usan `authMiddleware`. Las mutaciones (POST, PUT, DELETE) agregan `agentSupervisorMiddleware`, asi que solo `agent`, `supervisor` o `superadmin` pueden escribir. El controlador responde con `handleSuccess`.

## GET /
- **Descripcion**: Lista los leads de la compania asociada al token.
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "status": 200,
    "data": [
      {
        "id": "lead_001",
        "nombre": "Carlos Lopez",
        "correo": "carlos@example.com",
        "telefono": "+58-412-5550022",
        "estado": "nuevo",
        "origen": "web"
      }
    ]
  }
  ```
- **Errores**:
  - `400 BAD_REQUEST`: token sin `companiaCorretajeId`.
  - `401`: sin JWT.

## GET /:id
- **Descripcion**: Recupera un lead especifico (debe pertenecer a la misma compania).
- **Respuesta 200**: objeto `Lead`.
- **Errores**:
  - `403 FORBIDDEN`: compania distinta.
  - `404 NOT_FOUND`: id inexistente.

## POST /
- **Descripcion**: Crea un lead en la compania actual.
- **Autenticacion**: JWT + `agentSupervisorMiddleware`.
- **Cuerpo**:
  ```json
  {
    "nombre": "Luis Rojas",
    "correo": "luis@example.com",
    "telefono": "+58-412-5558899",
    "origen": "referido",
    "estado": "nuevo"
  }
  ```
  `estado` es opcional; el servicio aplica `nuevo` por defecto.
- **Respuesta 201**: lead creado.
- **Errores**:
  - `400 VALIDATION_MISSING_FIELDS`: faltan campos obligatorios.
  - `401`/`403`: sin permisos.

## PUT /:id
- **Descripcion**: Actualiza un lead.
- **Cuerpo**: `Partial<Lead>`.
- **Respuesta 200**: lead actualizado.
- **Errores**:
  - `403 FORBIDDEN`: compania o rol invalido.
  - `404 NOT_FOUND`: lead no encontrado.

## DELETE /:id
- **Descripcion**: Elimina un lead.
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "message": "Lead eliminado"
    }
  }
  ```
- **Errores**: mismos casos que `PUT`.
