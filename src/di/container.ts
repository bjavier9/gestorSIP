// Dependency Injection
import { Container } from 'inversify';
import { TYPES } from './types';

// Auth
import { AuthService } from '../application/auth.service';
import { AuthController } from '../infrastructure/http/auth.controller';

// UsuarioCompania
import { UsuarioCompaniaService } from '../application/usuarioCompania.service';
import { UsuarioCompaniaController } from '../infrastructure/http/usuarioCompania.controller';
import { UsuarioCompaniaRepository } from '../domain/ports/usuarioCompaniaRepository.port';
import { FirebaseUsuarioCompaniaAdapter } from '../infrastructure/persistence/firebaseUsuarioCompania.adapter';

// CompaniaCorretaje
import { CompaniaCorretajeService } from '../application/companiaCorretaje.service';
import { CompaniaCorretajeController } from '../infrastructure/http/companiaCorretaje.controller';
import { CompaniaCorretajeRepository } from '../domain/ports/companiaCorretajeRepository.port';
import { FirebaseCompaniaCorretajeAdapter } from '../infrastructure/persistence/firebaseCompaniaCorretaje.adapter';

// Oficina
import { OficinaService } from '../application/oficina.service';
import { OficinaController } from '../infrastructure/http/oficina.controller';
import { OficinaRepository } from '../domain/ports/oficinaRepository.port';
import { FirebaseOficinaAdapter } from '../infrastructure/persistence/firebaseOficina.adapter';

// Aseguradora
import { AseguradoraService } from '../application/aseguradora.service';
import { AseguradoraController } from '../infrastructure/http/aseguradora.controller';
import { AseguradoraRepository } from '../domain/ports/aseguradoraRepository.port';
import { FirebaseAseguradoraAdapter } from '../infrastructure/persistence/firebaseAseguradora.adapter';

// Ente
import { EnteService } from '../application/ente.service';
import { EnteController } from '../infrastructure/http/ente.controller';
import { EnteRepository } from '../domain/ports/enteRepository.port';
import { FirebaseEnteRepositoryAdapter } from '../infrastructure/persistence/firebaseEnteRepository.adapter';

// Configuration
import { ConfigurationService } from '../application/configuration.service';
import { ConfigurationController } from '../infrastructure/http/configuration.controller';
import { ConfigurationRepository } from '../domain/ports/configurationRepository.port';
import { FirebaseConfigurationAdapter } from '../infrastructure/persistence/firebaseConfiguration.adapter';

// Lead
import { LeadService } from '../application/lead.service';
import { LeadController } from '../infrastructure/http/lead.controller';
import { LeadRepository } from '../domain/ports/leadRepository.port';
import { FirebaseLeadAdapter } from '../infrastructure/persistence/firebaseLead.adapter';

// Gestion
import { GestionService } from '../application/gestion.service';
import { GestionController } from '../infrastructure/http/gestion.controller';
import { GestionRepository } from '../domain/ports/gestionRepository.port';
import { FirebaseGestionAdapter } from '../infrastructure/persistence/firebaseGestion.adapter';

// Poliza
import { PolizaService } from '../application/poliza.service';
import { PolizaController } from '../infrastructure/http/poliza.controller';
import { PolizaRepository } from '../domain/ports/polizaRepository.port';
import { FirebasePolizaAdapter } from '../infrastructure/persistence/firebasePoliza.adapter';


// issue 
import { IssueRepository } from '../domain/ports/issueRepository.port';
import { FirebaseIssueRepository } from '../infrastructure/persistence/firebaseIssueRepository.adapter';
import { IssueService } from '../application/issue.service';
import { IssueController } from '../infrastructure/http/issue.controller';

export const container = new Container();

export const configureContainer = () => {
    // Auth bindings
    container.bind<AuthService>(TYPES.AuthService).to(AuthService);
    container.bind<AuthController>(TYPES.AuthController).to(AuthController);

    // UsuarioCompania bindings
    container.bind<UsuarioCompaniaRepository>(TYPES.UsuarioCompaniaRepository).to(FirebaseUsuarioCompaniaAdapter);
    container.bind<UsuarioCompaniaService>(TYPES.UsuarioCompaniaService).to(UsuarioCompaniaService);
    container.bind<UsuarioCompaniaController>(TYPES.UsuarioCompaniaController).to(UsuarioCompaniaController);

    // CompaniaCorretaje bindings
    container.bind<CompaniaCorretajeRepository>(TYPES.CompaniaCorretajeRepository).to(FirebaseCompaniaCorretajeAdapter);
    container.bind<CompaniaCorretajeService>(TYPES.CompaniaCorretajeService).to(CompaniaCorretajeService);
    container.bind<CompaniaCorretajeController>(TYPES.CompaniaCorretajeController).to(CompaniaCorretajeController);

    // Oficina bindings
    container.bind<OficinaRepository>(TYPES.OficinaRepository).to(FirebaseOficinaAdapter);
    container.bind<OficinaService>(TYPES.OficinaService).to(OficinaService);
    container.bind<OficinaController>(TYPES.OficinaController).to(OficinaController);

    // Aseguradora bindings
    container.bind<AseguradoraRepository>(TYPES.AseguradoraRepository).to(FirebaseAseguradoraAdapter);
    container.bind<AseguradoraService>(TYPES.AseguradoraService).to(AseguradoraService);
    container.bind<AseguradoraController>(TYPES.AseguradoraController).to(AseguradoraController);

    // Ente bindings
    container.bind<EnteRepository>(TYPES.EnteRepository).to(FirebaseEnteRepositoryAdapter);
    container.bind<EnteService>(TYPES.EnteService).to(EnteService);
    container.bind<EnteController>(TYPES.EnteController).to(EnteController);

    // Configuration bindings
    container.bind<ConfigurationRepository>(TYPES.ConfigurationRepository).to(FirebaseConfigurationAdapter);
    container.bind<ConfigurationService>(TYPES.ConfigurationService).to(ConfigurationService);
    container.bind<ConfigurationController>(TYPES.ConfigurationController).to(ConfigurationController);

    // Lead bindings
    container.bind<LeadRepository>(TYPES.LeadRepository).to(FirebaseLeadAdapter);
    container.bind<LeadService>(TYPES.LeadService).to(LeadService);
    container.bind<LeadController>(TYPES.LeadController).to(LeadController);

    // Gestion bindings
    container.bind<GestionRepository>(TYPES.GestionRepository).to(FirebaseGestionAdapter);
    container.bind<GestionService>(TYPES.GestionService).to(GestionService);
    container.bind<GestionController>(TYPES.GestionController).to(GestionController);

    // Poliza bindings
    container.bind<PolizaRepository>(TYPES.PolizaRepository).to(FirebasePolizaAdapter);
    container.bind<PolizaService>(TYPES.PolizaService).to(PolizaService);
    container.bind<PolizaController>(TYPES.PolizaController).to(PolizaController);

    // issue
    container.bind<IssueRepository>(TYPES.IssueRepository).to(FirebaseIssueRepository);
    container.bind<IssueService>(TYPES.IssueService).to(IssueService);
    container.bind<IssueController>(TYPES.IssueController).to(IssueController);
};