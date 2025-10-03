# Endpoints de Gestiones

**Ruta base**: `/api/gestiones`

Las gestiones representan el ciclo de trabajo sobre una poliza, lead o ente. Todas las rutas usan `authMiddleware`; las mutaciones aplican `agentSupervisorMiddleware`. Las respuestas usan `handleSuccess`.

## GET /
- **Descripcion**: Lista todas las gestiones de la compania asociada al token.
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "status": 200,
    "data": [
      {
        "id": "ges_001",
        "tipo": "nueva",
        "estado": "en_gestion",
        "prioridad": "media",
        "agenteId": "uid-agent",
        "leadId": "lead_001"
      }
    ]
  }
  ```
- **Errores**: `400 BAD_REQUEST` si el token no incluye la compania.

## GET /:id
- **Descripcion**: Devuelve una gestion especifica.
- **Restricciones**: Debe pertenecer a la misma compania del token.
- **Errores**:
  - `403 FORBIDDEN`: compania distinta.
  - `404 NOT_FOUND`: gestion no encontrada.

## POST /
- **Descripcion**: Crea una gestion nueva.
- **Autenticacion**: JWT + `agentSupervisorMiddleware`.
- **Cuerpo** (resumen):
  ```json
  {
    "leadId": "lead_001",
    "enteId": null,
    "agenteId": "uid-agent",
    "oficinaId": "ofi_001",
    "tipo": "nueva",
    "estado": "en_gestion",
    "prioridad": "alta",
    "notas": "Cliente solicita cobertura extendida",
    "fechaVencimiento": "2025-12-31T00:00:00.000Z",
    "activo": true
  }
  ```
  - Si el rol del token es `agent`, el controlador fuerza `agenteId = uid`.
  - `fechaVencimiento` se parsea a `Date`; formato invalido genera `VALIDATION_INVALID_FIELD`.
- **Respuesta 201**: gestion creada.
- **Errores**:
  - `400 VALIDATION_MISSING_FIELD`: falta `tipo` o `agenteId`.
  - `400 VALIDATION_INVALID_FIELD`: `fechaVencimiento` invalida.
  - `403`: rol sin permiso o compania incorrecta.

## PUT /:id
- **Descripcion**: Actualiza una gestion.
- **Reglas especiales**:
  - Un agente solo puede modificar sus propias gestiones (`FORBIDDEN` si intenta editar otra).
  - Si un agente incluye `agenteId` distinto, se rechaza.
  - `fechaVencimiento` se convierte a `Date` o a `null` si se envia `null`.
- **Respuesta 200**: gestion actualizada.
- **Errores**: mismos codigos que el POST mas `404 NOT_FOUND` cuando la gestion no existe.

## DELETE /:id
- **Descripcion**: Elimina una gestion.
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "message": "Gestion eliminada"
    }
  }
  ```
- **Errores**: `403` si pertenece a otra compania o el agente no es dueno, `404` si no existe.
