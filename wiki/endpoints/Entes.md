# Endpoints de Entes

**Ruta base**: `/api/entes`

El router aplica `authMiddleware` a todas las rutas. El controlador responde con JSON plano (sin `handleSuccess`). Un ente puede ser persona natural o juridica.

## GET /
- **Descripcion**: Lista todos los entes accesibles para la compania del usuario autenticado.
- **Autenticacion**: JWT valido.
- **Respuesta 200**:
  ```json
  [
    {
      "id": "ente_001",
      "nombre": "Juan Perez",
      "tipo": "Persona Natural",
      "documento": "V-12345678",
      "telefono": "+58-412-5550011",
      "activo": true
    }
  ]
  ```
- **Errores**: `401` sin token.

## GET /:id
- **Descripcion**: Recupera un ente especifico.
- **Respuesta 200**: objeto `Ente` completo.
- **Errores**:
  - `401` sin token.
  - `404 ENTE_NOT_FOUND`: id inexistente.

## POST /
- **Descripcion**: Crea un ente.
- **Autenticacion**: JWT valido.
- **Cuerpo** (modelo base):
  ```json
  {
    "nombre": "Maria Gomez",
    "tipo": "Persona Natural",
    "documento": "V-87654321",
    "tipo_documento": "V",
    "direccion": "Av 1",
    "telefono": "+58-412-5557788",
    "correo": "maria@example.com",
    "idregion": 10,
    "idReferido": null,
    "activo": true,
    "metadatos": {
      "creadoPor": "uid-admin",
      "fechaNacimiento": "1990-05-01T00:00:00.000Z",
      "genero": "F",
      "estadoCivil": "Soltera",
      "profesion": "Abogado",
      "nacionalidad": "VE",
      "ultimaActualizacion": "2024-02-01T00:00:00.000Z"
    }
  }
  ```
- **Respuesta 201**: ente creado (incluye id y fechas).
- **Errores**:
  - `409 ENTE_ALREADY_EXISTS`: documento duplicado.
  - `400`: validaciones extra.

## PUT /:id
- **Descripcion**: Actualiza un ente.
- **Cuerpo**: `Partial<Ente>`.
- **Respuesta 200**: ente actualizado.
- **Errores**: `404 ENTE_NOT_FOUND`.

## DELETE /:id
- **Descripcion**: Elimina un ente.
- **Respuesta 204**: sin contenido.
- **Errores**: `404 ENTE_NOT_FOUND`.
