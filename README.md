# Node.js & Express API con Arquitectura Hexagonal y IA

Este proyecto es una API robusta y escalable construida con Node.js, Express y TypeScript. Sigue los principios de la **Arquitectura Hexagonal** para un diseño limpio y mantenible, e integra capacidades de **IA generativa** con el SDK de Gemini.

## Características

*   **Arquitectura Limpia:** Separación clara entre el dominio, la aplicación y la infraestructura.
*   **TypeScript:** Tipado estático para un código más robusto y mantenible.
*   **Seguridad:** Autenticación con JWT y middleware para manejo de errores.
*   **IA Integrada:** Generación de contenido dinámico usando la API de Gemini.
*   **Documentación:** Documentación de API automatizada con Swagger.
*   **Configuración Fácil:** Gestión de la configuración a través de variables de entorno.

## Primeros Pasos

### 1. Prerrequisitos

*   Node.js (v18 o superior)
*   npm

### 2. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_DIRECTORIO>
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Configurar Variables de Entorno

Copia el archivo de ejemplo y completa los valores requeridos:

```bash
cp .env.example .env
```

Abre el archivo `.env` y añade tus credenciales para:
*   `JWT_SECRET`: Una clave secreta para firmar los tokens.
*   `GEMINI_API_KEY`: Tu clave de la API de Google Gemini.
*   `FIREBASE_SERVICE_ACCOUNT`: El JSON de tu cuenta de servicio de Firebase.

### 5. Iniciar el Servidor

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`.

## Documentación de la API

La documentación de la API, generada con Swagger, está disponible una vez que el servidor está en funcionamiento.

*   **URL:** `http://localhost:3000/api-docs`

Desde esta interfaz puedes explorar y probar todos los endpoints de la API de forma interactiva.

## Nueva Funcionalidad: Generación de Contenido con IA

Se ha añadido un nuevo endpoint para generar contenido utilizando el modelo `gemini-1.5-pro`.

*   **Endpoint:** `POST /api/content/generate`
*   **Autenticación:** Requiere token JWT.
*   **Cuerpo de la Petición:**
    ```json
    {
      "prompt": "Describe la arquitectura hexagonal en 3 párrafos."
    }
    ```

Este endpoint te permite enviar un `prompt` y recibir una respuesta generada por el modelo de IA, abriendo la puerta a la creación de contenido dinámico, chatbots, resúmenes automáticos y mucho más.

## Arquitectura del Proyecto

El proyecto sigue la Arquitectura Hexagonal, que aísla la lógica de negocio de los detalles de la infraestructura. A continuación, un ejemplo de la distribución de archivos:

```
src/
├── application/         # Orquesta los casos de uso (Capa de Aplicación)
│   ├── auth.service.ts  # Lógica para registrar y loguear usuarios.
│   └── ente.service.ts  # Lógica de negocio para operaciones sobre "Entes".
│
├── domain/              # El núcleo de tu negocio (Capa de Dominio)
│   ├── ente.ts          # Definición de la entidad Ente.
│   ├── user.ts          # Definición de la entidad User.
│   └── ports/           # "Puertos": Contratos (interfaces) que el dominio necesita.
│       ├── enteRepository.port.ts
│       └── userRepository.port.ts
│
├── infrastructure/      # Implementaciones concretas (Capa de Infraestructura)
│   ├── http/            # Adaptadores de "entrada" (driving adapters)
│   │   ├── auth.controller.ts # Maneja las peticiones HTTP para Auth.
│   │   └── ente.controller.ts # Maneja las peticiones HTTP para Entes.
│   └── persistence/     # Adaptadores de "salida" (driven adapters)
│       ├── firebaseEnteRepository.adapter.ts
│       └── firebaseUserRepository.adapter.ts
│
├── config/              # Configuración (Firebase, Logger, etc.)
├── middleware/          # Middlewares de Express (autenticación, errores)
├── routes/              # Define las rutas de Express y las conecta a los controladores
├── utils/               # Funciones de utilidad
└── index.ts             # Punto de entrada: Inyección de dependencias y arranque del servidor
```

Para una explicación más detallada del flujo, consulta el código fuente, que está documentado para reflejar esta estructura.
