# Flujo de Autenticación en la Aplicación

Este documento explica el proceso de autenticación de dos fases, clarificando el rol del cliente, el servidor y las diferentes credenciales de Firebase. Nuestra API está diseñada para ser agnóstica al método de autenticación del cliente; solo requiere un `idToken` de Firebase válido.

---

## Fase 1: Obtención del `idToken` (El Cliente habla con Google)

En esta fase, el cliente (sea una aplicación web, móvil o un script) se comunica **directamente con los servidores de autenticación de Google**. El objetivo es que el usuario demuestre su identidad a Google por cualquier medio soportado y reciba a cambio un **`idToken`**.

La `FIREBASE_API_KEY` (una clave pública) se usa en este proceso para identificar a qué proyecto de Firebase pertenece el usuario.

### Método A: Email y Contraseña (Flujo Tradicional)

1.  **Actor**: El cliente.
2.  **Acción**: El usuario introduce su email y contraseña.
3.  **Lógica del Cliente**: Usando el SDK de Firebase para cliente, se llama a la función `signInWithEmailAndPassword(auth, email, password)`.
4.  **Destino**: La petición va a un endpoint de Google como `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=...`.
5.  **Resultado**: Si las credenciales son correctas, Google devuelve un `idToken`.

### Método B: Vínculo de Correo Electrónico (Acceso sin Contraseña)

Este es un flujo más complejo orquestado completamente por el cliente. El back-end no participa hasta la Fase 2.

1.  **Actor**: El cliente.
2.  **Acción Inicial**: El usuario introduce su dirección de correo electrónico.
3.  **Lógica del Cliente (Paso 1 - Enviar enlace)**:
    -   Se define un `ActionCodeSettings` que incluye la `url` a la que el usuario será redirigido tras hacer clic en el enlace desde su correo (ej: `https://miapp.com/finish-login`).
    -   Se llama a la función `sendSignInLinkToEmail(auth, email, actionCodeSettings)` del SDK de cliente.
4.  **Destino**: La petición va a los servidores de Google para generar y enviar el correo.
5.  **Acción del Usuario**: El usuario abre su correo y hace clic en el enlace de inicio de sesión.
6.  **Lógica del Cliente (Paso 2 - Confirmar enlace y obtener token)**:
    -   La aplicación cliente, en la URL de redirección (ej: `/finish-login`), comprueba si la URL actual es un enlace de inicio de sesión con `isSignInWithEmailLink(auth, window.location.href)`.
    -   Si es `true`, se extrae el email (que debe ser almacenado previamente por el cliente, por ejemplo en `localStorage`).
    -   Se llama a `signInWithEmailLink(auth, email, window.location.href)`.
7.  **Resultado Final**: Si el enlace es válido, esta última función devuelve el **`idToken`**.

---

## Fase 2: Autorización en nuestra API (El Cliente habla con nuestro Servidor)

Esta fase es **idéntica para todos los métodos de autenticación**.

Una vez que el cliente tiene el `idToken` (obtenido por el Método A, B o cualquier otro como Google Sign-In), puede usarlo para autenticarse en nuestra propia API.

1.  **El Actor:** El cliente, que ahora posee un `idToken` válido.
2.  **El Destino:** Nuestra API, específicamente el endpoint `/api/auth/login`.
3.  **El Propósito del `idToken`:**
    -   El cliente envía el `idToken` en el cuerpo de la petición. Ya no se usan email/contraseña.
4.  **La Lógica del Servidor (Back-end):**
    -   Nuestro servidor recibe la petición y extrae el `idToken`.
    -   Utilizando el **SDK de `firebase-admin`**, verifica la validez y firma del `idToken`.
5.  **El Resultado Final:**
    -   Si la verificación es exitosa, nuestro servidor confía en la identidad del usuario.
    -   Genera su **propio JWT de aplicación**, que contiene roles y permisos, y lo devuelve al cliente.
    -   Este JWT de la aplicación es el que se usará como `Bearer Token` para las siguientes peticiones a nuestra API.
