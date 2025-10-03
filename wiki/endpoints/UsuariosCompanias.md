# Endpoints de Usuarios-Companias

**Ruta base**: `/api/usuarios-companias`

Gestiona la relacion entre un usuario de Firebase y una compania de corretaje. Todas las rutas usan `authMiddleware` y `adminSupervisorOrSuperadminMiddleware`, habilitando a `admin`, `supervisor` y `superadmin`.

## POST /
- **Descripcion**: Crea un usuario en Firebase Auth y su documento `usuarios_companias` con el mismo UID.
- **Autenticacion**: JWT con rol permitido.
- **Cuerpo**:
  ```json
  {
    "email": "nuevo.usuario@example.com",
    "password": "Password123!",
    "companiaCorretajeId": "cia_001",
    "rol": "admin",
    "enteId": 42,
    "oficinaId": "ofi_001"
  }
  ```
  - `rol` debe estar en `{ "admin", "supervisor", "agent", "viewer" }`.
  - `enteId` y `oficinaId` son opcionales.
- **Respuesta 201** (`handleSuccess`):
  ```json
  {
    "success": true,
    "status": 201,
    "data": {
      "id": "firebase-uid",
      "email": "nuevo.usuario@example.com",
      "companiaCorretajeId": "cia_001",
      "rol": "admin",
      "activo": true,
      "fechaCreacion": "2024-02-01T00:00:00.000Z"
    }
  }
  ```
- **Errores**:
  - `400 VALIDATION_MISSING_FIELDS`: falta algun campo requerido.
  - `400 VALIDATION_INVALID_ROLE`: rol invalido.
  - `400 AUTH_USER_CREATION_FAILED`: Firebase rechazo la creacion.

## PATCH /:id/inhabilitar
- **Descripcion**: Deshabilita al usuario en Firebase y marca el registro como inactivo.
- **Autenticacion**: JWT con rol permitido.
- **Respuesta 200**: objeto `UsuarioCompania` con `activo: false`.
- **Errores**:
  - `400 VALIDATION_MISSING_FIELD`: falta el id.
  - `404 NOT_FOUND`: registro inexistente.
  - `400 AUTH_USER_UPDATE_FAILED`: error al actualizar en Firebase.

## PATCH /:id/habilitar
- **Descripcion**: Rehabilita al usuario (`activo: true`).
- **Respuesta 200**: objeto actualizado.
- **Errores**: mismos codigos que `/:id/inhabilitar`.
