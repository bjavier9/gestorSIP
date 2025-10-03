
import { Container } from 'inversify';
import { AuthService } from '../application/auth.service';
import { EnteService } from '../application/ente.service';
import { CompaniaCorretajeService } from '../application/companiaCorretaje.service';
import { EnteController } from '../infrastructure/http/ente.controller';
import { AuthController } from '../infrastructure/http/auth.controller';
import { CompaniaCorretajeController } from '../infrastructure/http/companiaCorretaje.controller';
import { UsuarioCompaniaController } from '../infrastructure/http/usuarioCompania.controller';
import { FirebaseEnteRepository } from '../infrastructure/persistence/firebaseEnteRepository.adapter';
import { FirebaseUserRepository } from '../infrastructure/persistence/firebaseUserRepository.adapter';
import { FirebaseUsuarioCompaniaAdapter } from '../infrastructure/persistence/firebaseUsuarioCompania.adapter';
import { FirebaseCompaniaCorretajeAdapter } from '../infrastructure/persistence/firebaseCompaniaCorretaje.adapter';
import { EnteRepository } from '../domain/ports/enteRepository.port';
import { UserRepository } from '../domain/ports/userRepository.port';
import { UsuarioCompaniaRepository } from '../domain/ports/usuarioCompaniaRepository.port';
import { CompaniaCorretajeRepository } from '../domain/ports/companiaCorretajeRepository.port';
import { TYPES } from './types';
import { UsuarioCompaniaService } from '../application/usuarioCompania.service';

const container = new Container();

// INFRASTRUCTURE - PERSISTENCE ADAPTERS
container.bind<UserRepository>(TYPES.UserRepository).to(FirebaseUserRepository);
container.bind<EnteRepository>(TYPES.EnteRepository).to(FirebaseEnteRepository);
container.bind<UsuarioCompaniaRepository>(TYPES.UsuarioCompaniaRepository).to(FirebaseUsuarioCompaniaAdapter);
container.bind<CompaniaCorretajeRepository>(TYPES.CompaniaCorretajeRepository).to(FirebaseCompaniaCorretajeAdapter);

// APPLICATION - SERVICES
container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container.bind<EnteService>(TYPES.EnteService).to(EnteService);
container.bind<CompaniaCorretajeService>(TYPES.CompaniaCorretajeService).to(CompaniaCorretajeService);
container.bind<UsuarioCompaniaService>(TYPES.UsuarioCompaniaService).to(UsuarioCompaniaService);

// INFRASTRUCTURE - HTTP CONTROLLERS
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<EnteController>(TYPES.EnteController).to(EnteController);
container.bind<CompaniaCorretajeController>(TYPES.CompaniaCorretajeController).to(CompaniaCorretajeController);
container.bind<UsuarioCompaniaController>(TYPES.UsuarioCompaniaController).to(UsuarioCompaniaController);

export default container;
