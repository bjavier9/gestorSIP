
import { Container } from 'inversify';
import { AuthService } from '../application/auth.service';
import { EnteService } from '../application/ente.service';
import { EnteController } from '../infrastructure/http/ente.controller';
import { AuthController } from '../infrastructure/http/auth.controller';
import { FirebaseEnteRepository } from '../infrastructure/persistence/firebaseEnteRepository.adapter';
import { FirebaseUserRepository } from '../infrastructure/persistence/firebaseUserRepository.adapter';
import { FirebaseUsuarioCompaniaAdapter } from '../infrastructure/persistence/firebaseUsuarioCompania.adapter';
import { EnteRepository } from '../domain/ports/enteRepository.port';
import { UserRepository } from '../domain/ports/userRepository.port';
import { UsuarioCompaniaRepository } from '../domain/ports/usuarioCompaniaRepository.port';
import { TYPES } from './types';

const container = new Container();

// INFRASTRUCTURE - PERSISTENCE ADAPTERS
container.bind<UserRepository>(TYPES.UserRepository).to(FirebaseUserRepository);
container.bind<EnteRepository>(TYPES.EnteRepository).to(FirebaseEnteRepository);
container.bind<UsuarioCompaniaRepository>(TYPES.UsuarioCompaniaRepository).to(FirebaseUsuarioCompaniaAdapter);

// APPLICATION - SERVICES
container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container.bind<EnteService>(TYPES.EnteService).to(EnteService);

// INFRASTRUCTURE - HTTP CONTROLLERS
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<EnteController>(TYPES.EnteController).to(EnteController);

export default container;
