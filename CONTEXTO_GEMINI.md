
# Reglas y Contexto para la Asistencia de IA (Gemini)

Este documento proporciona el contexto esencial y las reglas de codificación para el proyecto `gestorinsurance`. Seguir estas directrices es crucial para evitar errores comunes y mantener la coherencia del código.

## 1. Principio Arquitectónico CRÍTICO: Inicialización de Firebase y Dependencias

Este es el punto más importante a tener en cuenta durante el desarrollo.

**EL PROBLEMA:** La aplicación utiliza **InversifyJS** para la inyección de dependencias y **Firebase** como backend. InversifyJS instancia los objetos (como los adaptadores de persistencia) de forma síncrona al inicio de la aplicación. Sin embargo, la conexión a Firebase (`initializeApp()`) se realiza de forma **asíncrona**.

Esto crea una **condición de carrera**: los adaptadores intentan acceder a la instancia de Firestore (`getFirestore()`) en sus constructores **antes** de que la conexión a Firebase se haya completado, provocando el error: `The default Firebase app does not exist` o `Cannot read properties of undefined (reading 'collection')`.

**LA SOLUCIÓN OBLIGATORIA:**

Todos los adaptadores de la capa de infraestructura que interactúan con Firebase **DEBEN** utilizar un patrón de inicialización "perezosa" (lazy initialization). **NUNCA** se debe acceder a `getFirestore()` o `getAuth()` en el constructor de una clase inyectable.

**Ejemplo de Implementación CORRECTA:**

```typescript
import { injectable } from 'inversify';
import { getFirestore, CollectionReference } from 'firebase-admin/firestore';
// ... otros imports

@injectable()
export class MiAdaptadorDeFirebase implements IMiRepositorio {

    // ¡CORRECTO! Se usa un getter.
    // getFirestore() solo se llama cuando se accede a `this.collection`,
    // momento en el cual la app ya se ha inicializado.
    private get collection(): CollectionReference {
        return getFirestore().collection('mi-coleccion');
    }

    // ¡CORRECTO! El constructor está vacío o no interactúa con Firebase.
    constructor() {}

    async miMetodo() {
        // Ahora es seguro usar la colección.
        const snapshot = await this.collection.get();
        // ...
    }
}
```

**Ejemplo de Implementación INCORRECTA (A EVITAR):**

```typescript
@injectable()
export class MiAdaptadorDeFirebaseErroneo {
    private collection: CollectionReference;

    // ¡INCORRECTO! Esto causa el error porque getFirestore()
    // se llama antes de que initializeApp() termine.
    constructor() {
        this.collection = getFirestore().collection('mi-coleccion');
    }
}
```

## 2. Arquitectura General del Proyecto

El proyecto sigue una **Arquitectura Hexagonal (Puertos y Adaptadores)**:

- **`src/domain`**: Contiene la lógica de negocio pura, las entidades (ej: `Ente`, `Poliza`) y los "puertos" (interfaces de repositorios, ej: `EnteRepository`). No debe tener dependencias de frameworks o bases de datos.
- **`src/application`**: Contiene los "casos de uso" o servicios que orquestan la lógica de dominio.
- **`src/infrastructure`**: Contiene los "adaptadores". Aquí es donde se implementan los puertos.
    - `persistence`: Implementaciones de los repositorios (ej: `FirebaseEnteRepositoryAdapter`).
    - `http`: Controladores de Express que exponen la API.

## 3. Reglas de Negocio Clave

Extraídas de `funcionamiento.txt`:

- **Auditoría Obligatoria**: Toda acción crítica (crear, eliminar, reasignar) debe registrarse en la colección `auditoria`. Campos mínimos: `usuario`, `accion`, `fecha`, `detalle`.
- **Super Admin Inmutable**: El usuario Super Admin (`SUPERADMIN_EMAIL` en las variables de entorno) no puede ser modificado ni eliminado a través de la API.
- **Prohibida la Autogestión**: Un agente no puede tramitar pólizas donde él mismo sea tomador, asegurado o beneficiario.
- **Trazabilidad de Gestiones**: Siempre se debe crear un registro en la colección `gestiones` para cada nueva póliza o renovación.

## 4. Estándares de Código y Seguridad

- **Manejo de Errores**: Utilizar la clase `ApiError` para generar errores controlados en la API.
- **Rutas Asíncronas**: Envolver los manejadores de ruta de Express con la utilidad `asyncHandler` para capturar errores en promesas.
- **Autenticación**: Todas las rutas de la API deben estar protegidas. El `idToken` de Firebase se envía en el header `Authorization: Bearer <token>`.
- **Autorización**: Utilizar middlewares (`authMiddleware`, `superAdminMiddleware`, etc.) para verificar roles y permisos después de la autenticación.
