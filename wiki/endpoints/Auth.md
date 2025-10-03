# Endpoints de Auth

**Ruta base**: `/api/auth`

El modulo de autenticacion emite JWT internos a partir de tokens de Firebase o de las credenciales del superadmin. Los controladores se encuentran en `AuthController` y dependen de `AuthService`.

## POST /login/superadmin
- **Descripcion**: Autentica al super admin configurado via variables de entorno y retorna un JWT con rol `superadmin`.
- **Autenticacion**: No requiere JWT previo; valida `SUPERADMIN_EMAIL` y `SUPERADMIN_PASSWORD`.
- **Cuerpo** (`application/json`):
  ```json
  {
    "email": "superadmin@example.com",
    "password": "SuperSecret123"
  }
  ```
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "token": "<jwt>"
    }
  }
  ```
- **Errores frecuentes**:
  - `400 AUTH_MISSING_CREDENTIALS`: falta email o password.
  - `401 AUTH_INVALID_CREDENTIALS`: credenciales incorrectas.
  - `500 CONFIG_ERROR`: variables del superadmin ausentes.

## POST /login
- **Descripcion**: Intercambia un Firebase ID token por el JWT propio de GestorSIP e indica si el usuario debe elegir compania.
- **Autenticacion**: No requiere JWT; solo el `idToken` en el cuerpo.
- **Cuerpo**:
  ```json
  {
    "idToken": "<firebase-id-token>"
  }
  ```
- **Respuesta 200** (sin seleccion adicional):
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "token": "<jwt>",
      "companias": [
        {
          "id": "uid",
          "companiaCorretajeId": "cia_001",
          "rol": "admin",
          "activo": true
        }
      ],
      "needsSelection": false
    }
  }
  ```
- **Respuesta 200** (cuando `needsSelection` es true): incluye el token temporal con `pendienteCia` y la lista de asociaciones disponibles.
- **Errores**:
  - `400 AUTH_MISSING_ID_TOKEN`: falta `idToken`.
  - `401 AUTH_INVALID_FIREBASE_TOKEN`: token no valido o expirado.
  - `403 AUTH_NO_COMPANIES_ASSIGNED`: user sin companias vinculadas.
  - `500 AUTH_NO_COMPANIES_AVAILABLE`: no hay companias para autoasignar (caso especial de admin@seguroplus.com).

## POST /select-compania
- **Descripcion**: Completa el login seleccionando una compania y genera el JWT definitivo.
- **Autenticacion**: Requiere JWT temporal (`pendienteCia: true`).
- **Cuerpo**:
  ```json
  {
    "companiaId": "cia_001"
  }
  ```
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "token": "<jwt-definitivo>"
    }
  }
  ```
- **Errores**:
  - `400 AUTH_COMPANY_ALREADY_SELECTED`: el token ya es definitivo.
  - `400 VALIDATION_MISSING_FIELD`: falta `companiaId`.
  - `401 AUTH_INVALID_TOKEN`: token invalido o ausente.
  - `403 AUTH_INVALID_COMPANY_SELECTION`: el usuario no pertenece a esa compania.

## GET /info
- **Descripcion**: Devuelve informacion basica del proyecto Firebase para diagnostico.
- **Autenticacion**: Requiere JWT valido.
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "projectId": "gestorsip-dev"
    }
  }
  ```
- **Errores**:
  - `401 AUTH_INVALID_TOKEN`: sin JWT o invalido.
  - `500 CONFIG_ERROR`: falta `FIREBASE_PROJECT_ID` en el servidor.

## POST /test-token
- **Descripcion**: Solo para desarrollo. Genera un JWT de prueba sin pasar por Firebase.
- **Autenticacion**: No requiere JWT, pero valida un `secret` contra `TEST_SECRET`.
- **Cuerpo**:
  ```json
  {
    "secret": "super_dev_secret"
  }
  ```
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "token": "<jwt-admin>"
    }
  }
  ```
- **Errores**:
  - `400 AUTH_MISSING_SECRET`: falta `secret`.
  - `401 AUTH_INVALID_SECRET`: secreto incorrecto.
  - `500 CONFIG_ERROR`: `TEST_SECRET` no esta configurado.
