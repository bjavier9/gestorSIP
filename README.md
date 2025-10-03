# GestorSIP - API de Gestión de Seguros

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

Bienvenido al backend de **GestorSIP**, una plataforma robusta para la administración de pólizas de seguros, clientes (entes) y contenido relacionado. Este sistema está construido siguiendo las mejores prácticas de la industria, con un enfoque en la escalabilidad, mantenibilidad y seguridad.

---

## Tabla de Contenidos

1.  [Características Principales](#características-principales)
2.  [Guía de Inicio Rápido](#guía-de-inicio-rápido)
3.  [Variables de Entorno](#variables-de-entorno)
4.  [Flujo de Autenticación](#flujo-de-autenticación)
5.  [Estructura del Proyecto (Arquitectura Hexagonal)](#estructura-del-proyecto-arquitectura-hexagonal)
6.  [Scripts Disponibles](#scripts-disponibles)
7.  [Documentación y Guías](#documentación-y-guías)

---

## Características Principales

-   **Arquitectura Limpia**: El proyecto implementa la **Arquitectura Hexagonal (Puertos y Adaptadores)**, garantizando una separación clara entre la lógica de negocio y las tecnologías externas.
-   **TypeScript y Node.js**: Código fuertemente tipado para reducir errores en tiempo de ejecución y mejorar la mantenibilidad.
-   **Inyección de Dependencias**: Uso de **InversifyJS** para desacoplar los componentes y facilitar las pruebas.
-   **Autenticación Segura con Firebase**: Soporte para múltiples métodos de autenticación (Email/Contraseña, Email Link) gestionados por Firebase Authentication.
-   **Base de Datos Firestore**: Persistencia de datos utilizando Cloud Firestore, una base de datos NoSQL flexible y escalable.
-   **Documentación de API Automatizada**: Endpoint `/api-docs` con **Swagger/OpenAPI** para explorar y probar la API de forma interactiva.
-   **Seguridad por Defecto**: Middleware `helmet` para proteger contra vulnerabilidades web comunes y `authMiddleware` para proteger rutas.

## Guía de Inicio Rápido

Sigue estos pasos para tener el entorno de desarrollo funcionando localmente.

### 1. Prerrequisitos

-   Node.js (se recomienda v18 o superior)
-   npm (o yarn)

### 2. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd gestor-sip-backend # O el nombre del directorio
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Configurar Credenciales de Firebase

La aplicación necesita credenciales para comunicarse de forma segura con los servicios de Firebase. Tienes dos métodos para configurarlas:

#### Método 1: Archivo de Credenciales (Recomendado para Desarrollo)

1.  **Obtén tu archivo de credenciales:** Ve a la [Consola de Firebase](https://console.firebase.google.com/), selecciona tu proyecto, haz clic en el ícono de engranaje (Configuración del proyecto) y ve a la pestaña "Cuentas de servicio". Haz clic en "Generar nueva clave privada" y guarda el archivo JSON que se descarga.
2.  **Guarda el archivo:** Renombra el archivo a `firebase-credentials.json` y colócalo en la **raíz de tu proyecto**.
3.  **Importante:** El archivo `.gitignore` ya está configurado para ignorar `firebase-credentials.json`, por lo que no se subirá a tu repositorio.

La aplicación detectará y usará este archivo automáticamente.

#### Método 2: Variable de Entorno (Recomendado para Producción)

Como alternativa, puedes configurar las credenciales a través de una variable de entorno. Esto es ideal para entornos de despliegue como Docker, Vercel o Heroku.

1.  Abre el archivo JSON de credenciales que descargaste.
2.  Copia todo el contenido del archivo.
3.  Crea una variable de entorno llamada `FIREBASE_SERVICE_ACCOUNT` y pega el contenido JSON como su valor. Asegúrate de que el JSON esté en una sola línea y correctamente escapado si es necesario.

### 5. Configurar Otras Variables de Entorno

Crea un archivo llamado `.env` en la raíz del proyecto. Aquí puedes configurar otras variables que la aplicación necesita.

```bash
# Puedes copiar la plantilla si existe
cp .env.example .env
```

Abre el archivo `.env` y complétalo. Consulta la sección [Variables de Entorno](#variables-de-entorno) para más detalles.

### 6. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El servidor se iniciará y escuchará en el puerto que hayas definido (por defecto `http://localhost:3000`). Gracias a `ts-node-dev`, se reiniciará automáticamente cada vez que guardes un cambio.

## Variables de Entorno

| Variable                  | Descripción                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `PORT`                    | El puerto en el que correrá el servidor (ej: `3000`).                                                         |
| `JWT_SECRET`              | Una cadena de texto larga y secreta para firmar los tokens JWT de la aplicación.                             |
| `FIREBASE_SERVICE_ACCOUNT`| (Opcional si usas el archivo) El **objeto JSON completo** de tu cuenta de servicio de Firebase en una sola línea. |
| `GEMINI_API_KEY`          | (Opcional) Tu clave de API para usar las funcionalidades de IA Generativa de Google Gemini.                |

## Flujo de Autenticación

La autenticación es un proceso de dos fases que desacopla la validación de credenciales de la autorización en nuestra API.

1.  **Fase 1 (Cliente ↔️ Firebase):** El cliente (front-end) usa el SDK de Firebase para autenticar al usuario y recibe un `idToken`.
2.  **Fase 2 (Cliente ↔️ Nuestra API):** El cliente envía ese `idToken` a nuestro endpoint `/api/auth/login`. Nuestro servidor verifica el token y emite un JWT propio, que se usará para las siguientes peticiones.

## Estructura del Proyecto (Arquitectura Hexagonal)

```
src/
├── application/    # Lógica de orquestación (Servicios/Casos de Uso).
├── domain/         # El corazón del negocio (entidades, puertos/interfaces).
├── infrastructure/ # Implementaciones concretas (controladores, repositorios).
├── routes/         # Definición de las rutas de la API.
├── middleware/     # Middlewares de Express.
├── config/         # Configuración global (Firebase, Inversify, etc.).
└── index.ts        # Punto de entrada de la aplicación.
```

## Scripts Disponibles

-   `npm run dev`: Inicia el servidor en modo desarrollo con recarga automática.
-   `npm start`: Compila el código a JavaScript y lo inicia en modo producción.
-   `npm run build`: Solo compila el código TypeScript a la carpeta `dist/`.

## Documentación y Guías

-   **Documentación de la API (Swagger):** Accede a `http://localhost:3000/api-docs` cuando el servidor esté corriendo.
-   **Guías Internas (`/wiki`):** La carpeta `wiki` contiene guías detalladas sobre la arquitectura y flujos de trabajo.
