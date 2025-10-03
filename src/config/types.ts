
export const TYPES = {
    // Services
    AuthService: Symbol.for('AuthService'),
    CompaniaCorretajeService: Symbol.for('CompaniaCorretajeService'),
    OficinaService: Symbol.for('OficinaService'),
    UsuarioCompaniaService: Symbol.for('UsuarioCompaniaService'),
    EnteService: Symbol.for('EnteService'),
    ConfigurationService: Symbol.for('ConfigurationService'),
    AseguradoraService: Symbol.for('AseguradoraService'), // Added

    // Repositories
    UserRepository: Symbol.for('UserRepository'),
    CompaniaCorretajeRepository: Symbol.for('CompaniaCorretajeRepository'),
    OficinaRepository: Symbol.for('OficinaRepository'),
    UsuarioCompaniaRepository: Symbol.for('UsuarioCompaniaRepository'),
    EnteRepository: Symbol.for('EnteRepository'),
    ConfigurationRepository: Symbol.for('ConfigurationRepository'),
    AseguradoraRepository: Symbol.for('AseguradoraRepository'), // Added

    // Controllers
    AuthController: Symbol.for('AuthController'),
    CompaniaCorretajeController: Symbol.for('CompaniaCorretajeController'),
    OficinaController: Symbol.for('OficinaController'),
    UsuarioCompaniaController: Symbol.for('UsuarioCompaniaController'),
    EnteController: Symbol.for('EnteController'),
    ConfigurationController: Symbol.for('ConfigurationController'),
    AseguradoraController: Symbol.for('AseguradoraController'), // Added
};
