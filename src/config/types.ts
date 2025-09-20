const TYPES = {
    // Application Services
    AuthService: Symbol.for('AuthService'),
    EnteService: Symbol.for('EnteService'),

    // Repositories (Ports)
    UserRepository: Symbol.for('UserRepository'),
    EnteRepository: Symbol.for('EnteRepository'),

    // Controllers (HTTP Adapters)
    AuthController: Symbol.for('AuthController'),
    EnteController: Symbol.for('EnteController'),
};

export { TYPES };
