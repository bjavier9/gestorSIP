# Node.js & Express API con Arquitectura Hexagonal

Este proyecto es una API robusta y escalable construida con Node.js, Express y TypeScript, siguiendo los principios de la **Arquitectura Hexagonal** (también conocida como Puertos y Adaptadores).

## Primeros Pasos

El servidor debería iniciarse automáticamente al abrir el espacio de trabajo. Para ejecutarlo manualmente:

```sh
npm run dev
```

La documentación de la API (generada con Swagger) está disponible en `http://localhost:3000/api-docs`.

## Concepto Clave: Arquitectura Hexagonal

El objetivo principal de esta arquitectura es **aislar el núcleo de la lógica de tu aplicación** de las preocupaciones externas. Esto significa que la lógica de negocio (el "dominio") no sabe nada sobre la base de datos que usas, cómo se exponen las APIs o cualquier otro detalle de infraestructura.

Esto se logra a través de tres capas principales:

1.  **Dominio (`domain`):** El corazón de la aplicación. Contiene la lógica de negocio, las entidades (`User`, `Ente`) y los "puertos" (interfaces que definen los contratos que la infraestructura debe cumplir).
2.  **Aplicación (`application`):** Orquesta los casos de uso. Contiene los servicios de aplicación (`AuthService`, `EnteService`) que utilizan los puertos para ejecutar la lógica del dominio.
3.  **Infraestructura (`infrastructure`):** El mundo exterior. Contiene los "adaptadores" que implementan los puertos y se comunican con el núcleo de la aplicación. Incluye controladores HTTP (Express), clientes de base de datos (Firebase), etc.

![Hexagonal Architecture Diagram](https://i.imgur.com/y3N0gRE.png)

## Estructura del Proyecto

A continuación se muestra la estructura actual, reflejando la separación de responsabilidades.

```
src/
├── application/         # Orquesta los casos de uso (Capa de Aplicación)
│   ├── auth.service.ts  # Lógica para registrar/loguear usuarios, crear Entes y vincularlos a compañías.
│   └── ente.service.ts  # Lógica de negocio para operaciones sobre los "Entes".
│
├── domain/              # El núcleo de tu negocio (Capa de Dominio)
│   ├── ente.ts          # La definición de la entidad Ente.
│   ├── user.ts          # La definición de la entidad User.
│   └── ports/           # Los "puertos": contratos (interfaces) que el dominio necesita.
│       ├── enteRepository.port.ts
│       └── userRepository.port.ts
│
├── infrastructure/      # Implementaciones concretas (Capa de Infraestructura)
│   ├── firebase/        # Adaptadores específicos de Firebase que no son repositorios directos.
│   │   └── enteCompania.repository.ts # Lógica para manejar la relación N:M entre Entes y Compañías.
│   ├── http/            # Adaptadores de "entrada" (driving adapters)
│   │   ├── auth.controller.ts # Maneja las peticiones HTTP para Auth.
│   │   └── ente.controller.ts # Maneja las peticiones HTTP para Entes.
│   └── persistence/     # Adaptadores de "salida" (driven adapters)
│       ├── firebaseEnteRepository.adapter.ts  # Implementación del EnteRepository con Firebase.
│       └── firebaseUserRepository.adapter.ts # Implementación del UserRepository con Firebase.
│
├── config/              # Configuración (Firebase, Logger).
├── middleware/          # Middlewares de Express (auth, errores).
├── routes/              # Define las rutas de Express y las conecta a los controladores.
│   ├── auth.ts
│   ├── entes.ts
│   └── content.ts
├── utils/               # Funciones de utilidad.
└── index.ts             # Punto de entrada: une todo (inyección de dependencias).
```

## Flujo Actualizado: Registro de un Nuevo Usuario

Así es como una petición `POST /auth/register` fluye a través de las capas con la lógica implementada:

1.  **Entrada (`index.ts` -> `routes/auth.ts`)**
    *   Express recibe la petición y la dirige al `authController.register`.

2.  **Adaptador de Entrada (`infrastructure/http/auth.controller.ts`)**
    *   El `AuthController` extrae los datos del cuerpo de la petición (`email`, `password`, `nombre`, `companiaCorretajeId`, etc.).
    *   Traduce la petición HTTP a una llamada de función, invocando al servicio de aplicación: `this.authService.register(data)`.

3.  **Servicio de Aplicación (`application/auth.service.ts`)**
    *   Este servicio orquesta el caso de uso completo de registro:
    *   Usa el `userRepository` para verificar que el email no exista.
    *   Usa el `enteRepository` para crear una nueva entidad `Ente` con el `nombre`, `telefono`, etc.
    *   Crea un objeto `User` con el `email`, la contraseña y el `enteId` del `Ente` recién creado.
    *   Usa el `userRepository` para guardar el nuevo `User`.
    *   **Paso clave:** Usa el `enteCompaniaRepository` para crear la vinculación entre el nuevo `Ente` y la `CompaniaCorretaje` en la base de datos, asignándole un rol (ej: 'agente').
    *   Genera un token JWT y lo devuelve.

4.  **Puertos (`domain/ports/`)**
    *   Las interfaces (`UserRepository`, `EnteRepository`) definen los métodos que el `AuthService` necesita, sin conocer la implementación subyacente.

5.  **Adaptadores de Salida (`infrastructure/persistence/` y `infrastructure/firebase/`)**
    *   Las clases como `FirebaseUserRepository`, `FirebaseEnteRepository` y `EnteCompaniaRepository` implementan los puertos.
    *   Ejecutan las operaciones específicas de Firestore para buscar usuarios, guardar entes y crear el documento de relación en la colección `entes_companias`.

6.  **Retorno del Flujo**
    *   El token y los datos del usuario vuelven al `AuthController`, que los envía de vuelta al cliente en una respuesta JSON.

Esta separación nos brinda una enorme flexibilidad para probar, mantener y escalar cada parte de la aplicación de manera independiente.
