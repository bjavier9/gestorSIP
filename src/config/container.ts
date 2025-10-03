
import { Container } from 'inversify';
import "reflect-metadata";
import { TYPES } from './types';

// Services
import { AuthService } from '../application/auth.service';
import { CompaniaCorretajeService } from '../application/companiaCorretaje.service';
import { OficinaService } from '../application/oficina.service';
import { UsuarioCompaniaService } from '../application/usuarioCompania.service';
import { EnteService } from '../application/ente.service';
import { ConfigurationService } from '../application/configuration.service';
import { AseguradoraService } from '../application/aseguradora.service';

// Repositories
import { UserRepository } from '../domain/ports/userRepository.port';
import { CompaniaCorretajeRepository } from '../domain/ports/companiaCorretajeRepository.port';
import { OficinaRepository } from '../domain/ports/oficinaRepository.port';
import { UsuarioCompaniaRepository } from '../domain/ports/usuarioCompaniaRepository.port';
import { EnteRepository } from '../domain/ports/enteRepository.port';
import { ConfigurationRepository } from '../domain/ports/configurationRepository.port';
import { AseguradoraRepository } from '../domain/ports/aseguradoraRepository.port';

// Adapters
import { FirebaseUserRepositoryAdapter } from '../infrastructure/persistence/firebaseUserRepository.adapter';
import { FirebaseCompaniaCorretajeAdapter } from '../infrastructure/persistence/firebaseCompaniaCorretaje.adapter';
import { FirebaseOficinaAdapter } from '../infrastructure/persistence/firebaseOficina.adapter';
import { FirebaseUsuarioCompaniaAdapter } from '../infrastructure/persistence/firebaseUsuarioCompania.adapter';
import { FirebaseEnteRepositoryAdapter } from '../infrastructure/persistence/firebaseEnteRepository.adapter';
import { FirebaseConfigurationAdapter } from '../infrastructure/persistence/firebaseConfiguration.adapter';
import { FirebaseAseguradoraAdapter } from '../infrastructure/persistence/firebaseAseguradora.adapter';


// Controllers
import { AuthController } from '../infrastructure/http/auth.controller';
import { CompaniaCorretajeController } from '../infrastructure/http/companiaCorretaje.controller';
import { OficinaController } from '../infrastructure/http/oficina.controller';
import { UsuarioCompaniaController } from '../infrastructure/http/usuarioCompania.controller';
import { EnteController } from '../infrastructure/http/ente.controller';
import { ConfigurationController } from '../infrastructure/http/configuration.controller';
import { AseguradoraController } from '../infrastructure/http/aseguradora.controller';

const container = new Container();

// Services
container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container.bind<CompaniaCorretajeService>(TYPES.CompaniaCorretajeService).to(CompaniaCorretajeService);
container.bind<OficinaService>(TYPES.OficinaService).to(OficinaService);
container.bind<UsuarioCompaniaService>(TYPES.UsuarioCompaniaService).to(UsuarioCompaniaService);
container.bind<EnteService>(TYPES.EnteService).to(EnteService);
container.bind<ConfigurationService>(TYPES.ConfigurationService).to(ConfigurationService);
container.bind<AseguradoraService>(TYPES.AseguradoraService).to(AseguradoraService);

// Repositories
container.bind<UserRepository>(TYPES.UserRepository).to(FirebaseUserRepositoryAdapter);
container.bind<CompaniaCorretajeRepository>(TYPES.CompaniaCorretajeRepository).to(FirebaseCompaniaCorretajeAdapter);
container.bind<OficinaRepository>(TYPES.OficinaRepository).to(FirebaseOficinaAdapter);
container.bind<UsuarioCompaniaRepository>(TYPES.UsuarioCompaniaRepository).to(FirebaseUsuarioCompaniaAdapter);
container.bind<EnteRepository>(TYPES.EnteRepository).to(FirebaseEnteRepositoryAdapter);
container.bind<ConfigurationRepository>(TYPES.ConfigurationRepository).to(FirebaseConfigurationAdapter);
container.bind<AseguradoraRepository>(TYPES.AseguradoraRepository).to(FirebaseAseguradoraAdapter);


// Controllers
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<CompaniaCorretajeController>(TYPES.CompaniaCorretajeController).to(CompaniaCorretajeController);
container.bind<OficinaController>(TYPES.OficinaController).to(OficinaController);
container.bind<UsuarioCompaniaController>(TYPES.UsuarioCompaniaController).to(UsuarioCompaniaController);
container.bind<EnteController>(TYPES.EnteController).to(EnteController);
container.bind<ConfigurationController>(TYPES.ConfigurationController).to(ConfigurationController);
container.bind<AseguradoraController>(TYPES.AseguradoraController).to(AseguradoraController);


export default container;
