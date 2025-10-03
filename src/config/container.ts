
import { Container } from 'inversify';
import { TYPES } from './types';

// User
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

// Lead
import { LeadService } from '../application/lead.service';
import { LeadController } from '../infrastructure/http/lead.controller';
import { LeadRepository } from '../domain/ports/leadRepository.port';
import { FirebaseLeadAdapter } from '../infrastructure/persistence/firebaseLead.adapter'; 

const container = new Container();

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

// Lead bindings
container.bind<LeadRepository>(TYPES.LeadRepository).to(FirebaseLeadAdapter);
container.bind<LeadService>(TYPES.LeadService).to(LeadService);
container.bind<LeadController>(TYPES.LeadController).to(LeadController);

export default container;
