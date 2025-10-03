# Flujo de Autenticacion en la Aplicacion

Este documento describe el proceso de autenticacion de dos fases. Se detalla la responsabilidad del cliente, del servidor y el uso de los distintos credenciales de Firebase. La API es agnostica del metodo de autenticacion del cliente: solo necesita un `idToken` valido emitido por Firebase.

---

## Fase 1: Obtener el `idToken` (cliente contra Google)

En esta fase la aplicacion cliente (web, movil o script) se comunica **directamente** con los servicios de autenticacion de Google. El usuario demuestra su identidad y recibe un **`idToken`** firmado.

La variable `FIREBASE_API_KEY` se usa para indicar a que proyecto Firebase pertenece la solicitud.

### Metodo A: Email y contrasena
1. **Actor**: la aplicacion cliente.
2. **Accion**: el usuario ingresa email y contrasena.
3. **Logica del cliente**: se llama `signInWithEmailAndPassword(auth, email, password)` desde el SDK de Firebase.
4. **Destino**: Google recibe la peticion en un endpoint como `https://identitytoolkit.googleapis.com/...`.
5. **Resultado**: Google responde con un `idToken` si las credenciales son validas.

### Metodo B: Enlace magico por correo (passwordless)
1. **Actor**: la aplicacion cliente.
2. **Inicio**: el usuario escribe su correo.
3. **Logica paso 1**:
   - Se arma un `ActionCodeSettings` con la `url` de redireccion (ej. `https://miapp.com/finish-login`).
   - Se invoca `sendSignInLinkToEmail(auth, email, actionCodeSettings)`.
4. **Destino**: Google genera y envia el correo con el enlace.
5. **Accion del usuario**: hace clic en el enlace recibido.
6. **Logica paso 2**:
   - En la pagina de redireccion el cliente valida `isSignInWithEmailLink(auth, window.location.href)`.
   - Recupera el email (guardado previamente, por ejemplo en `localStorage`).
   - Llama `signInWithEmailLink(auth, email, window.location.href)`.
7. **Resultado**: la llamada devuelve el `idToken` si el enlace es valido.

> Otros metodos (Google Sign-In, Apple, telefono, etc.) siguen la misma idea: el cliente consigue un `idToken` directamente de Google.

---

## Fase 2: Autorizar en nuestra API (cliente contra GestorSIP)

Una vez que el cliente posee un `idToken` valido, lo intercambia por el JWT propio de la plataforma.

1. **Actor**: el cliente con `idToken` en mano.
2. **Destino**: endpoint `POST /api/auth/login`.
3. **Pedido**: el cliente envia `{ idToken: "..." }` en el cuerpo.
4. **Logica del servidor**:
   - Usa `firebase-admin` para verificar firma y vigencia del `idToken`.
   - Busca asociaciones `UsuarioCompania` vinculadas al `uid`.
5. **Respuesta**:
   - Si es superadmin y las credenciales coinciden, genera un JWT con rol `superadmin`.
   - Para el resto de usuarios, devuelve un JWT con rol, compania, oficina y demas datos necesarios.
   - Si el usuario pertenece a varias companias y ninguna es de rol supervisor, marca `needsSelection: true` y exige llamar a `/api/auth/select-compania`.

El JWT emitido por GestorSIP se utiliza como `Bearer Token` en las rutas protegidas. Al expirar, el cliente debe repetir la Fase 1 y 2.

---

## Resumen rapido
- Google autentica usuarios finales y entrega `idToken`.
- GestorSIP valida ese token, aplica reglas de negocio y entrega su propio JWT.
- El JWT interno encapsula permisos particulares de la plataforma.
