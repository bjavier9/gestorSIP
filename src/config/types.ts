
const TYPES = {
    // UsuarioCompania
    UsuarioCompaniaRepository: Symbol.for("UsuarioCompaniaRepository"),
    UsuarioCompaniaService: Symbol.for("UsuarioCompaniaService"),
    UsuarioCompaniaController: Symbol.for("UsuarioCompaniaController"),
    // CompaniaCorretaje
    CompaniaCorretajeRepository: Symbol.for("CompaniaCorretajeRepository"),
    CompaniaCorretajeService: Symbol.for("CompaniaCorretajeService"),
    CompaniaCorretajeController: Symbol.for("CompaniaCorretajeController"),
    // Oficina
    OficinaRepository: Symbol.for("OficinaRepository"),
    OficinaService: Symbol.for("OficinaService"),
    OficinaController: Symbol.for("OficinaController"),
    // Aseguradora
    AseguradoraRepository: Symbol.for("AseguradoraRepository"),
    AseguradoraService: Symbol.for("AseguradoraService"),
    AseguradoraController: Symbol.for("AseguradoraController"),
    // Leads
    LeadRepository: Symbol.for('LeadRepository'),
    LeadService: Symbol.for('LeadService'),
    LeadController: Symbol.for('LeadController'),
};

export { TYPES };
