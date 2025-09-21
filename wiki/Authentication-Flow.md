# Flujo de Autenticación en la Aplicación

Este documento explica el proceso de autenticación de dos fases que utiliza la aplicación, clarificando el rol del cliente, del servidor y de las diferentes credenciales de Firebase.

## La Diferencia Clave: API Key vs. ID Token

A menudo hay confusión sobre por qué se necesita una `FIREBASE_API_KEY` en el lado del cliente y cómo interactúa con el back-end. El proceso se divide en dos destinos diferentes con propósitos distintos.

### Fase 1: Autenticación del Usuario (El Cliente habla con Google)

En esta fase, el cliente (sea un script de prueba, una aplicación web o una app móvil) se comunica **directamente con los servidores de autenticación de Google**, no con nuestra API.

1.  **El Actor:** Un cliente que necesita probar la identidad de un usuario.
2.  **El Destino:** Un endpoint público de la API de Google, por ejemplo:
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=...`
3.  **El Propósito de la `FIREBASE_API_KEY`:**
    -   La `FIREBASE_API_KEY` **identifica públicamente tu proyecto de Firebase** ante Google. No es una credencial secreta.
    -   Le dice a Google: "El usuario que intenta iniciar sesión con este email y contraseña pertenece a este proyecto específico". Sin ella, Google no sabría en qué base de datos de usuarios buscar.
4.  **El Resultado:**
    -   Si las credenciales (email/contraseña) son correctas para ese proyecto, el servidor de autenticación de Google genera y devuelve un **`idToken`** (JSON Web Token).
    -   Este `idToken` es una **prueba criptográfica** firmada por Google que certifica que el usuario es quien dice ser.

### Fase 2: Autorización en nuestra API (El Cliente habla con nuestro Servidor)

Una vez que el cliente tiene el `idToken`, puede usarlo para autenticarse en nuestra propia API.

1.  **El Actor:** El cliente, que ahora posee un `idToken` válido.
2.  **El Destino:** Nuestra API, específicamente el endpoint de login (ej: `http://localhost:3001/auth/login`).
3.  **El Propósito del `idToken`:**
    -   El cliente envía el `idToken` a nuestra API (en el cuerpo de la petición, según el diseño de esta aplicación).
    -   Ya no se envían el email y la contraseña. El `idToken` es la única prueba de identidad que necesita nuestro servidor.
4.  **La Lógica del Servidor (Back-end):**
    -   Nuestro servidor recibe la petición y extrae el `idToken`.
    -   Utilizando el **SDK de `firebase-admin`** (que se inicializa con credenciales de administrador secretas, como el archivo `.json`), verifica la validez del `idToken`.
    -   Esta verificación confirma que el token fue emitido por Google para nuestro proyecto y que no ha expirado.
5.  **El Resultado Final:**
    -   Si la verificación es exitosa, nuestro servidor confía en la identidad del usuario.
    -   Genera su **propio JWT de aplicación**, que contiene los roles, permisos y otros datos necesarios para que el usuario opere dentro de nuestra plataforma.
    -   Este JWT de la aplicación es el que el cliente usará para las siguientes peticiones a nuestra API.

## Resumen del Flujo

1.  **Cliente → Google:** Envía `email`, `password` y `FIREBASE_API_KEY`.
2.  **Google → Cliente:** Valida y devuelve un `idToken`.
3.  **Cliente → Nuestra API:** Envía el `idToken` al endpoint `/auth/login`.
4.  **Nuestra API → Google (usando Admin SDK):** Verifica que el `idToken` sea válido.
5.  **Nuestra API → Cliente:** Si es válido, crea y devuelve un JWT propio de la aplicación para la sesión del usuario.
