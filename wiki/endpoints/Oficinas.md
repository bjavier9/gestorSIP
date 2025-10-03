# Endpoints de Oficinas

**Ruta base**: `/api/companias/:companiaId/oficinas`

El router usa `Router({ mergeParams: true })`, por lo que `companiaId` se toma del path padre. Todas las rutas requieren `authMiddleware` y el helper `authorizeCompaniaAccess(['admin', 'supervisor'])`, lo que habilita a `admin`, `supervisor` y `superadmin`.

## POST /
- **Descripcion**: Crea una oficina asociada a la compania del path.
- **Autenticacion**: JWT con rol permitido.
- **Cuerpo**:
  ```json
  {
    "nombre": "Oficina Caracas",
    "direccion": "Av Libertador",
    "telefono": "+58-212-5555511",
    "moneda": "USD",
    "activo": true
  }
  ```
- **Respuesta 201** (`responseHandler`):
  ```json
  {
    "success": true,
    "status": 201,
    "message": "Oficina creada exitosamente.",
    "data": {
      "id": "ofi_001",
      "companiaCorretajeId": "cia_001",
      "nombre": "Oficina Caracas",
      "moneda": "USD",
      "activo": true
    }
  }
  ```
- **Errores**:
  - `400 VALIDATION_ERROR`: falta `nombre` o `companiaCorretajeId`.
  - `401`/`403`: token invalido o rol no permitido.

## GET /
- **Descripcion**: Lista las oficinas de la compania.
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Oficinas recuperadas exitosamente.",
    "data": [
      {
        "id": "ofi_001",
        "nombre": "Oficina Caracas",
        "moneda": "USD",
        "activo": true
      }
    ]
  }
  ```

## GET /:oficinaId
- **Descripcion**: Obtiene una oficina especifica.
- **Respuesta 200**: objeto individual con mismo formato del listado.
- **Errores**: `404 NOT_FOUND` si el repositorio no encuentra el registro.

## PUT /:oficinaId
- **Descripcion**: Actualiza los datos de una oficina.
- **Cuerpo**: `Partial<Oficina>` sin `id` ni `companiaCorretajeId`.
  ```json
  {
    "telefono": "+58-212-5557799",
    "moneda": "VES"
  }
  ```
- **Respuesta 200**: objeto actualizado (`responseHandler`).
- **Errores**: `404 NOT_FOUND` para identificadores invalidos.

## DELETE /:oficinaId
- **Descripcion**: Elimina la oficina.
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Oficina eliminada exitosamente."
  }
  ```
- **Errores**: `404 NOT_FOUND` si la oficina no existe.
