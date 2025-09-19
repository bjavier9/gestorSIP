
// --- APPLICATION ---
import { AuthService } from '../application/auth.service';
import { EnteService } from '../application/ente.service';

// --- INFRASTRUCTURE ---
// Persistence Adapters
import { FirebaseUserRepository } from '../infrastructure/persistence/firebaseUserRepository.adapter';
import { FirebaseEnteRepository } from '../infrastructure/persistence/firebaseEnteRepository.adapter';

// HTTP Adapters (Controllers)
import { AuthController } from '../infrastructure/http/auth.controller';
import { EnteController } from '../infrastructure/http/ente.controller';

/**
 * =============================================================================
 * --- DEPENDENCY INJECTION CONTAINER ---
 * =============================================================================
 * Este es el "Composition Root" de la aplicación.
 * Aquí se construyen e inyectan todas las dependencias, siguiendo el patrón de Inyección de Dependencias.
 * Esto desacopla las capas y hace que la aplicación sea más modular y fácil de probar.
 */

// CAPA DE INFRAESTRUCTURA (ADAPTADORES DE PERSISTENCIA)
// Estos adaptadores implementan los puertos definidos en el dominio.
const userRepository = new FirebaseUserRepository();
const enteRepository = new FirebaseEnteRepository();

// CAPA DE APLICACIÓN (SERVICIOS)
// Estos servicios orquestan los casos de uso y dependen de los puertos (inyectados como adaptadores).
const authService = new AuthService(userRepository, enteRepository);
const enteService = new EnteService(enteRepository);

// CAPA DE INFRAESTRUCTURA (ADAPTADORES DE ENTRADA / CONTROLADORES)
// Los controladores exponen los casos de uso a través de HTTP y dependen de los servicios de aplicación.
export const authController = new AuthController(authService);
export const enteController = new EnteController(enteService);
