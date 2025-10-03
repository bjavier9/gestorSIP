# Endpoints de Configurations

**Ruta base**: `/api/configurations`

El controlador expone catalogos de configuracion (roles, monedas, etc.). `authMiddleware` protege todas las rutas; las mutaciones requieren tambien `superAdminMiddleware`.

## GET /
- **Descripcion**: Devuelve todas las configuraciones almacenadas.
- **Autenticacion**: JWT valido.
- **Respuesta 200**:
  ```json
  [
    {
      "id": "roles",
      "name": "Roles disponibles",
      "description": "Roles permitidos en la plataforma",
      "items": [
        { "value": "admin", "activo": true },
        { "value": "supervisor", "activo": true }
      ]
    }
  ]
  ```
- **Errores**: `401` si falta el token.

## GET /:id
- **Descripcion**: Obtiene una configuracion por su id.
- **Respuesta 200**: objeto `Configuration`.
- **Errores**:
  - `401` sin token.
  - `404 CONFIGURATION_NOT_FOUND`: id inexistente.

## POST /
- **Descripcion**: Crea una configuracion (solo superadmin).
- **Autenticacion**: JWT con rol superadmin.
- **Cuerpo**:
  ```json
  {
    "id": "currencies",
    "name": "Monedas soportadas",
    "description": "Listado de monedas validas",
    "items": [
      { "value": "USD", "activo": true },
      { "value": "EUR", "activo": true }
    ]
  }
  ```
- **Respuesta 201**: configuracion creada.
- **Errores**:
  - `401`/`403`: permisos insuficientes.
  - `409`: id ya existente.
  - `400`: payload invalido.

## PUT /:id
- **Descripcion**: Actualiza una configuracion existente (solo superadmin).
- **Cuerpo**: `Partial<Configuration>` (actualiza `name`, `description` o `items`).
- **Respuesta 200**: configuracion actualizada.
- **Errores**: `404` si el id no existe, `400` por datos invalidos, `401`/`403` por permisos.
