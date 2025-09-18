# Node.js & Express API con Arquitectura Hexagonal

Este proyecto es una plantilla para construir una API robusta y escalable con Node.js, Express y TypeScript, siguiendo los principios de la **Arquitectura Hexagonal** (también conocida como Puertos y Adaptadores).

## Primeros Pasos

El servidor debería iniciarse automáticamente al abrir el espacio de trabajo. Para ejecutarlo manualmente:

```sh
npm run dev
```

La documentación de la API (generada con Swagger) está disponible en `http://localhost:3000/api-docs`.

## Concepto Clave: Arquitectura Hexagonal

El objetivo principal de esta arquitectura es **aislar el núcleo de la lógica de tu aplicación** de las preocupaciones externas. Esto significa que la lógica de negocio (el "dominio") no sabe nada sobre la base de datos que usas, cómo se exponen las APIs o cualquier otro detalle de infraestructura.

Esto se logra a través de tres capas principales:

1.  **Dominio (`domain`):** El corazón de la aplicación. Contiene la lógica de negocio y las entidades puras. No tiene dependencias de ninguna otra capa.
2.  **Aplicación (`application`):** Orquesta el flujo de datos. Contiene los "casos de uso" (servicios de aplicación) que llaman a la lógica del dominio.
3.  **Infraestructura (`infrastructure`):** El mundo exterior. Contiene los "adaptadores" que interactúan con el núcleo de la aplicación, como controladores HTTP (Express), clientes de base de datos (Firebase), etc.

![Hexagonal Architecture Diagram](https://i.imgur.com/y3N0gRE.png)

## Estructura del Proyecto

```
src/
├── application/         # Orquesta los casos de uso (Capa de Aplicación)
│   └── auth.service.ts  # Lógica para registrar y loguear usuarios.
│
├── domain/              # El núcleo de tu negocio (Capa de Dominio)
│   ├── user.ts          # La definición de la entidad User.
│   └── ports/           # Los "puertos": contratos (interfaces) que el dominio necesita.
│       └── userRepository.port.ts
│
├── infrastructure/      # Implementaciones concretas (Capa de Infraestructura)
│   ├── http/            # Adaptadores de "entrada" (driving adapters)
│   │   ├── auth.controller.ts # Maneja las peticiones HTTP y llama a los servicios.
│   │   └── ...
│   └── persistence/     # Adaptadores de "salida" (driven adapters)
│       └── firebaseUserRepository.adapter.ts # Implementación del UserRepository con Firebase.
│
├── config/              # Configuración (Firebase, etc.)
├── middleware/          # Middlewares de Express (auth, errores).
├── routes/              # Define las rutas de Express y las conecta a los controladores.
├── utils/               # Funciones de utilidad.
└── index.ts             # Punto de entrada: une todo (inyección de dependencias).
```

## Ejemplo de Flujo: Registro de un Nuevo Usuario

Así es como una petición `POST /auth/register` fluye a través de las capas:

1.  **Entrada (`index.ts` -> `routes/auth.ts`)**
    *   Express recibe la petición y la dirige al `authController.register`.

2.  **Adaptador de Entrada (`infrastructure/http/auth.controller.ts`)**
    *   El `AuthController` extrae `email` y `password` del cuerpo de la petición.
    *   **No contiene lógica de negocio.** Simplemente llama al servicio de aplicación: `this.authService.register(email, password)`. Su trabajo es traducir de HTTP a una llamada de función.

3.  **Servicio de Aplicación (`application/auth.service.ts`)**
    *   Este servicio orquesta el caso de uso.
    *   Primero, usa el puerto de repositorio para ver si el usuario ya existe: `await this.userRepository.findByEmail(email)`. **Importante:** El servicio no sabe que está usando Firebase; solo conoce la interfaz `UserRepository`.
    *   Si el usuario no existe, hashea la contraseña y vuelve a usar el puerto: `await this.userRepository.save(newUser)`.
    *   Genera un token JWT y lo devuelve.

4.  **Puerto (`domain/ports/userRepository.port.ts`)**
    *   Es solo una `interface` de TypeScript. Define el contrato: "cualquier repositorio de usuarios debe tener un método `findByEmail` y un método `save`".

5.  **Adaptador de Salida (`infrastructure/persistence/firebaseUserRepository.adapter.ts`)**
    *   Esta es la implementación concreta del puerto que usa Firebase.
    *   El método `findByEmail` ejecuta `db.collection('users').where('email', '==', email).get()`.
    *   El método `save` ejecuta `db.collection('users').doc(user.email).set(userToSave)`.

6.  **Retorno del Flujo**
    *   El token JWT vuelve al `AuthController`, que lo empaqueta en una respuesta JSON estandarizada y la envía de vuelta al cliente con un estado `201 Created`.

Esta separación nos brinda una enorme flexibilidad para probar, mantener y escalar la aplicación de manera independiente.
