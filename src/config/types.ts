
const TYPES = {
    // Application Services
    AuthService: Symbol.for('AuthService'),
    EnteService: Symbol.for('EnteService'),
    CompaniaCorretajeService: Symbol.for('CompaniaCorretajeService'),

    // Repositories (Ports)
    UserRepository: Symbol.for('UserRepository'),
    EnteRepository: Symbol.for('EnteRepository'),
    UsuarioCompaniaRepository: Symbol.for('UsuarioCompaniaRepository'),
    CompaniaCorretajeRepository: Symbol.for('CompaniaCorretajeRepository'),

    // Controllers (HTTP Adapters)
    AuthController: Symbol.for('AuthController'),
    EnteController: Symbol.for('EnteController'),
    CompaniaCorretajeController: Symbol.for('CompaniaCorretajeController'),
};

export { TYPES };
