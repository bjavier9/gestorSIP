
const TYPES = {
    // Application Services
    AuthService: Symbol.for('AuthService'),
    EnteService: Symbol.for('EnteService'),

    // Repositories (Ports)
    UserRepository: Symbol.for('UserRepository'),
    EnteRepository: Symbol.for('EnteRepository'),
    UsuarioCompaniaRepository: Symbol.for('UsuarioCompaniaRepository'),

    // Controllers (HTTP Adapters)
    AuthController: Symbol.for('AuthController'),
    EnteController: Symbol.for('EnteController'),
};

export { TYPES };
