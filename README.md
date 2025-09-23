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

### 4. Configurar Variables de Entorno

Este es el paso más importante. Crea un archivo llamado `.env` en la raíz del proyecto. **Este archivo no debe ser subido a Git**.

```bash
# Puedes copiar la plantilla si existe
cp .env.example .env
```

Abre el archivo `.env` y complétalo con tus credenciales. Consulta la sección [Variables de Entorno](#variables-de-entorno) para más detalles.

### 5. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El servidor se iniciará y escuchará en el puerto que hayas definido (por defecto `http://localhost:3001`). Gracias a `ts-node-dev`, se reiniciará automáticamente cada vez que guardes un cambio.

## Variables de Entorno

El archivo `.env` es crucial para el funcionamiento de la aplicación. Estas son las variables que necesitas definir:

| Variable                  | Descripción                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `PORT`                    | El puerto en el que correrá el servidor (ej: `3001`).                                                         |
| `JWT_SECRET`              | Una cadena de texto larga y secreta para firmar los tokens JWT de la aplicación.                             |
| `FIREBASE_SERVICE_ACCOUNT`| El **objeto JSON completo** de tu cuenta de servicio de Firebase. Debe estar en una sola línea.                 |
| `GEMINI_API_KEY`          | (Opcional) Tu clave de API para usar las funcionalidades de IA Generativa de Google Gemini.                |

> **Importante:** La variable `FIREBASE_SERVICE_ACCOUNT` debe contener el JSON de las credenciales de tu proyecto de Firebase, que puedes obtener desde la consola de Firebase > Configuración del proyecto > Cuentas de servicio.

## Flujo de Autenticación

La autenticación es un proceso de dos fases que desacopla la validación de credenciales de la autorización en nuestra API.

1.  **Fase 1 (Cliente ↔️ Firebase):** El cliente (front-end) usa el SDK de Firebase para autenticar al usuario (con email/contraseña, link de email, etc.) y recibe un `idToken`.
2.  **Fase 2 (Cliente ↔️ Nuestra API):** El cliente envía ese `idToken` a nuestro endpoint `/api/auth/login`. Nuestro servidor verifica el token usando el SDK de Admin de Firebase y, si es válido, emite un JWT propio de la aplicación, que será usado para las siguientes peticiones.

Para más detalles, consulta la [Guía de Flujo de Autenticación](./wiki/Authentication-Flow.md).

## Estructura del Proyecto (Arquitectura Hexagonal)

La estructura de carpetas refleja la separación de responsabilidades:

```
src/
├── application/    # Lógica de orquestación (Servicios/Casos de Uso).
│
├── domain/         # El corazón del negocio. Contiene las entidades, y los puertos (interfaces).
│   └── ports/      # Interfaces que definen lo que la aplicación necesita del exterior.
│
├── infrastructure/ # Implementaciones concretas de los puertos y tecnologías externas.
│   ├── http/       # Controladores de Express.
│   └── persistence/ # Adaptadores de repositorios (ej: implementaciones para Firestore).
│
├── routes/         # Definición de las rutas de la API y su vinculación con los controladores.
├── middleware/     # Middlewares de Express (autenticación, errores, etc.).
├── config/         # Configuración global (Firebase, Inversify, Swagger, Winston).
│
└── index.ts        # Punto de entrada: inicializa y arranca el servidor.
```

Para una guía detallada sobre cómo añadir funcionalidades, consulta [Cómo Agregar un Nuevo Endpoint](./wiki/Agregar-Endpoint.md).

## Scripts Disponibles

-   `npm run dev`: Inicia el servidor en modo desarrollo con recarga automática.
-   `npm start`: Compila el código a JavaScript y lo inicia en modo producción.
-   `npm run build`: Solo compila el código TypeScript a la carpeta `dist/`.

## Documentación y Guías

La documentación es una parte fundamental de este proyecto y se mantiene en dos lugares principales:

-   **Documentación de la API (Swagger):** Una vez que el servidor está corriendo, puedes acceder a la documentación interactiva en `http://localhost:3001/api-docs`.
-   **Guías Internas (`/wiki`):** La carpeta `wiki` contiene documentos markdown con guías detalladas sobre la arquitectura y los flujos de trabajo del proyecto.
