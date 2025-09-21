# GestorSIP - Backend API

Este proyecto es el backend para **GestorSIP**, una plataforma de gestión de seguros. La API está construida con Node.js, Express y TypeScript, siguiendo los principios de la **Arquitectura Hexagonal** para un diseño limpio, mantenible y escalable.

Además, integra capacidades de **IA generativa** con el SDK de Google Gemini para ofrecer funcionalidades avanzadas.

## Características Principales

-   **Arquitectura Limpia:** Separación clara de responsabilidades entre el dominio, la aplicación y la infraestructura (Puertos y Adaptadores).
-   **TypeScript:** Código robusto y mantenible gracias al tipado estático.
-   **Seguridad:** Autenticación basada en JWT, hashing de contraseñas con `bcryptjs` y cabeceras de seguridad con `helmet`.
-   **Inyección de Dependencias:** Uso de `Inversify` para gestionar las dependencias de forma desacoplada.
-   **IA Integrada:** Endpoint para generación de contenido dinámico utilizando `gemini-1.5-pro`.
-   **Documentación de API:** Generación automática de documentación con Swagger.
-   **Logging:** Registro de peticiones y errores con `Winston`.

## Scripts Principales

-   `npm run dev`: Inicia el servidor en modo de desarrollo con recarga automática (`nodemon`).
-   `npm start`: Inicia el servidor en modo de producción.
-   `npm run build`: Compila el código de TypeScript a JavaScript.
-   `npm test`: Ejecuta los tests de la aplicación.

## Primeros Pasos

### 1. Prerrequisitos

-   Node.js (v18 o superior)
-   npm

### 2. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd gestorSIP
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto. Puedes copiar `.env.example` como plantilla. Este archivo es **ignorado por git** para proteger la información sensible.

```bash
cp .env.example .env
```

Abre el archivo `.env` y añade tus credenciales para:

-   `PORT`: Puerto para el servidor (ej: 3000).
-   `JWT_SECRET`: Clave secreta para firmar los tokens JWT.
-   `GEMINI_API_KEY`: Tu clave de la API de Google Gemini.
-   `FIREBASE_SERVICE_ACCOUNT`: El objeto JSON de tu cuenta de servicio de Firebase (codificado en Base64 o como una ruta a un archivo).

### 5. Iniciar el Servidor

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000` (o el puerto que hayas configurado).

## Documentación

### API (Swagger)

La documentación interactiva de la API, generada con Swagger, está disponible una vez que el servidor está en funcionamiento.

-   **URL:** `http://localhost:3000/api-docs`

Desde esta interfaz puedes explorar y probar todos los endpoints de la API.

### Wiki / Guías

La carpeta `wiki/` contiene guías detalladas sobre la arquitectura y los procesos del proyecto.

-   **[Cómo Agregar un Nuevo Endpoint](./wiki/Agregar-Endpoint.md):** Guía paso a paso para añadir nuevas funcionalidades siguiendo la arquitectura hexagonal.

## Estructura del Proyecto

El proyecto utiliza una Arquitectura Hexagonal. La estructura de carpetas principal es:

```
src/
├── application/    # Lógica de orquestación de casos de uso (Servicios).
├── domain/         # El núcleo del negocio (Entidades, Puertos/Interfaces).
├── infrastructure/ # Implementaciones concretas (Controladores, Repositorios, etc.).
├── routes/         # Definición de las rutas de la API y su conexión con los controladores.
├── middleware/     # Middlewares de Express (autenticación, manejo de errores).
├── config/         # Configuración de la aplicación (Firebase, Inversify, Winston).
└── index.ts        # Punto de entrada de la aplicación.
```
