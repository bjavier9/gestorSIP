const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcryptjs');

// IMPORTANTE: Asegúrate de que tu clave de servicio exista como temp-firebase-credentials.json
const serviceAccount = require('./temp-firebase-credentials.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// === Definición de Datos de Prueba ===

async function getSeedData() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("password123", salt);

  // 1. COMPAÑÍAS DE CORRETAJE
  const companias_corretaje = [
    {
      id: "comp_001",
      nombre: "Corretaje Seguro Plus",
      rif: "J-123456789",
      direccion: "Calle Falsa 456, Edif. Central, Caracas",
      telefono: "+58-212-5555678",
      correo: "info@seguroplus.com",
      fechaCreacion: new Date("2025-07-15T09:00:00Z"),
      fechaActualizacion: new Date("2025-08-10T14:15:00Z"),
      activo: true,
      creada: { idente: "admin_user_001" },
      modificado: [
        {
          idente: "admin_user_001",
          fechaActualizacion: new Date("2025-08-10T14:15:00Z")
        }
      ],
      monedasAceptadas: ["USD", "EUR", "VES"],
      monedaPorDefecto: "USD",
      modulos: [
        "gestion_poliza",
        "campana_masivas",
        "correo_cumpleano",
        "reporteria"
      ]
    }
  ];

  // 2. OFICINAS (Nueva colección)
  const oficinas = [
    {
      id: "oficina_001",
      companiaCorretajeId: "comp_001",
      nombre: "Oficina Principal Caracas",
      direccion: "Calle Falsa 456, Edif. Central, Caracas",
      telefono: "+58-212-5555678",
      moneda: "USD",
      activo: true,
      fechaCreacion: new Date("2025-07-15T09:00:00Z"),
      fechaActualizacion: new Date("2025-08-10T14:15:00Z")
    },
    {
      id: "oficina_002",
      companiaCorretajeId: "comp_001",
      nombre: "Sucursal Valencia",
      direccion: "Av. Bolívar, Centro Comercial Galerías, Valencia",
      telefono: "+58-241-5559876",
      moneda: "USD",
      activo: true,
      fechaCreacion: new Date("2025-07-20T10:00:00Z"),
      fechaActualizacion: new Date("2025-08-05T11:30:00Z")
    }
  ];

  // 3. ASEGURADORAS
  const aseguradoras = [
    {
      id: "aseg_001",
      nombre: "Aseguradora Nacional",
      codigo: "AN23",
      direccion: "Gran Boulevard 789, Piso 5, Caracas",
      telefono: "+58-212-5559012",
      correo: "ventas@asegnacional.com",
      rating: 4.5,
      fechaCreacion: new Date("2025-01-01T00:00:00Z"),
      fechaActualizacion: new Date("2025-06-10T11:00:00Z"),
      activo: true
    },
    {
      id: "aseg_002",
      nombre: "Seguros Horizonte",
      codigo: "SH01",
      direccion: "Av. Principal, Torre Seguros, Valencia",
      telefono: "+58-241-5551234",
      correo: "contacto@horizonte.com",
      rating: 4.2,
      fechaCreacion: new Date("2024-11-10T00:00:00Z"),
      fechaActualizacion: new Date("2025-05-20T16:00:00Z"),
      activo: true
    }
  ];

  // 4. TIPOS DE PÓLIZAS
  const tipos_polizas = [
    { id: "tipo_001", nombre: "Automotriz", descripcion: "Póliza para vehículos automotores.", vigenciaMaxMeses: 12, activo: true },
    { id: "tipo_002", nombre: "Salud", descripcion: "Póliza de seguro médico.", vigenciaMaxMeses: 12, activo: true },
    { id: "tipo_003", nombre: "Hogar", descripcion: "Póliza de seguro para viviendas.", vigenciaMaxMeses: 24, activo: true },
  ];

  // 5. ENTES (Clientes y usuarios)
  const entes = [
    {
      id: "admin_user_001",
      nombre: "Alicia Admin",
      tipo: "Persona Natural",
      direccion: "Oficina Principal, Caracas",
      telefono: "+58-212-5550000",
      correo: "admin@seguroplus.com",
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      activo: true,
      metadatos: { creadoPor: "system_seed" }
    },
    {
      id: "supervisor_001",
      nombre: "Carlos Supervisor",
      tipo: "Persona Natural",
      direccion: "Av. Libertador, Edif. Paris, Apto 5B",
      telefono: "+58-412-7654321",
      correo: "carlos.supervisor@seguroplus.com",
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      activo: true,
      metadatos: { creadoPor: "admin_user_001" }
    },
    {
      id: "agente_001",
      nombre: "Maria Agente",
      tipo: "Persona Natural",
      direccion: "Calle Comercio, Res. Las Flores, Apt 3A",
      telefono: "+58-414-9876543",
      correo: "maria.agente@seguroplus.com",
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      activo: true,
      metadatos: { creadoPor: "supervisor_001" }
    },
    {
      id: "cliente_001",
      nombre: "Juan Perez",
      tipo: "Persona Natural",
      direccion: "Av. Libertador, Edif. Paris, Apto 5B",
      telefono: "+58-412-1234567",
      correo: "juan.perez@email.com",
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      activo: true,
      metadatos: { creadoPor: "admin_user_001" }
    },
    {
      id: "cliente_002",
      nombre: "Empresa XYZ, C.A.",
      tipo: "Persona Jurídica",
      direccion: "Zona Industrial, Galpón 15, Maracay",
      telefono: "+58-243-5558899",
      correo: "compras@empresaxyz.com",
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      activo: true,
      metadatos: { creadoPor: "admin_user_001" }
    }
  ];

  // 6. USUARIOS COMPAÑÍAS (con roles y oficinas)
  const usuarios_companias = [
    {
      id: "user_admin_001",
      email: "admin@seguroplus.com",
      password: hashedPassword,
      enteId: "admin_user_001",
      companiaCorretajeId: "comp_001",
      oficinaId: "oficina_001",
      rol: "admin",
      fechaCreacion: new Date(),
      activo: true
    },
    {
      id: "user_super_001",
      email: "supervisor@seguroplus.com",
      password: hashedPassword,
      enteId: "supervisor_001",
      companiaCorretajeId: "comp_001",
      oficinaId: "oficina_001",
      rol: "supervisor",
      fechaCreacion: new Date(),
      activo: true
    },
    {
      id: "user_agent_001",
      email: "agente@seguroplus.com",
      password: hashedPassword,
      enteId: "agente_001",
      companiaCorretajeId: "comp_001",
      oficinaId: "oficina_001",
      rol: "agent",
      fechaCreacion: new Date(),
      activo: true
    },
    {
      id: "user_agent_002",
      email: "agente2@seguroplus.com",
      password: hashedPassword,
      enteId: "agente_002",
      companiaCorretajeId: "comp_001",
      oficinaId: "oficina_002",
      rol: "agent",
      fechaCreacion: new Date(),
      activo: true
    }
  ];

  // 7. PÓLIZAS
  const polizas = [
    {
      id: "pol_00001",
      numeroPoliza: "AUTO-2025-00001",
      tipoPolizaId: "tipo_001",
      aseguradoraId: "aseg_001",
      tomadorId: "cliente_001",
      aseguradoId: "cliente_001",
      companiaCorretajeId: "comp_001",
      oficinaId: "oficina_001",
      agenteId: "user_agent_001",
      fechaInicio: new Date("2025-08-15"),
      fechaVencimiento: new Date("2026-08-15"),
      montoAsegurado: 25000.00,
      prima: 1200.00,
      moneda: "USD",
      estado: "ACTIVA",
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    },
    {
      id: "pol_00002",
      numeroPoliza: "HOGAR-2025-00002",
      tipoPolizaId: "tipo_003",
      aseguradoraId: "aseg_002",
      tomadorId: "cliente_002",
      aseguradoId: "cliente_002",
      companiaCorretajeId: "comp_001",
      oficinaId: "oficina_001",
      agenteId: "user_agent_001",
      fechaInicio: new Date("2025-09-01"),
      fechaVencimiento: new Date("2027-09-01"),
      montoAsegurado: 150000.00,
      prima: 3500.00,
      moneda: "USD",
      estado: "PENDIENTE_PAGO",
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    }
  ];

  // 8. GESTIONES (Nueva colección)
  const gestiones = [
    {
      id: "ges_001",
      polizaId: "pol_00001",
      tipo: "renovacion",
      estado: "borrador",
      agenteId: "user_agent_001",
      oficinaId: "oficina_001",
      companiaCorretajeId: "comp_001",
      fechaCreacion: new Date("2025-08-20T10:00:00Z"),
      fechaVencimiento: new Date("2026-08-15T23:59:59Z"),
      prioridad: "alta",
      notas: "Renovación automática generada por sistema",
      activo: true
    },
    {
      id: "ges_002",
      polizaId: "pol_00002",
      tipo: "nueva",
      estado: "en_gestion",
      agenteId: "user_agent_001",
      oficinaId: "oficina_001",
      companiaCorretajeId: "comp_001",
      fechaCreacion: new Date("2025-08-18T14:30:00Z"),
      fechaVencimiento: new Date("2025-09-15T23:59:59Z"),
      prioridad: "media",
      notas: "Cliente solicita modificación de cobertura",
      activo: true
    }
  ];

  // 9. CLIENTES_GESTION (Nueva colección)
  const clientes_gestion = [
    {
      id: "cligest_001",
      nombre: "Nuevo Cliente Potencial",
      tipo: "Persona Natural",
      telefono: "+58-426-5551122",
      correo: "nuevo.cliente@email.com",
      agenteId: "user_agent_001",
      oficinaId: "oficina_001",
      companiaCorretajeId: "comp_001",
      fechaCreacion: new Date("2025-08-22T09:15:00Z"),
      estado: "pendiente",
      notas: "Interesado en seguro de vida"
    }
  ];

  // 10. CONFIGURACIONES
  const configurations = {
    roles: {
        name: 'User Roles',
        description: 'Defines the roles available for users in the system.',
        items: [
            { name: 'admin', label: 'Administrador', activo: true },
            { name: 'supervisor', label: 'Supervisor', activo: true },
            { name: 'agent', label: 'Agente', activo: true },
            { name: 'viewer', label: 'Visualizador', activo: false },
        ],
    },
    management_status: {
        name: 'Management Statuses',
        description: 'Standardized statuses for the lifecycle of a management task.',
        items: [
            { name: 'borrador', label: 'Borrador', activo: true },
            { name: 'en_gestion', label: 'En Gestión', activo: true },
            { name: 'en_tramite', label: 'En Trámite', activo: true },
            { name: 'gestionado_exito', label: 'Gestionado con Éxito', activo: true },
            { name: 'desistido', label: 'Desistido', activo: true },
        ],
    },
    policy_status: {
        name: 'Policy Statuses',
        description: 'Standardized statuses for policies.',
        items: [
            { name: 'ACTIVA', label: 'Activa', activo: true },
            { name: 'PENDIENTE_PAGO', label: 'Pendiente de Pago', activo: true },
            { name: 'VENCIDA', label: 'Vencida', activo: true },
            { name: 'CANCELADA', label: 'Cancelada', activo: true },
        ],
    },
    currencies: {
        name: 'Available Currencies',
        description: 'Supported currencies for operations across different offices.',
        items: [
            { code: 'USD', name: 'Dólar Americano', symbol: '$', activo: true },
            { code: 'EUR', name: 'Euro', symbol: '€', activo: true },
            { code: 'VES', name: 'Bolívar Soberano', symbol: 'Bs', activo: true }
        ],
    }
  };

  // 11. AUDITORIA (Nueva colección)
  const auditoria = [
    {
      id: "audit_001",
      usuario: "admin_user_001",
      accion: "crear_compania",
      fecha: new Date("2025-07-15T09:00:00Z"),
      detalle: "Creación de compañía Corretaje Seguro Plus",
      coleccion: "companias_corretaje",
      documentoId: "comp_001"
    },
    {
      id: "audit_002",
      usuario: "admin_user_001",
      accion: "crear_usuario",
      fecha: new Date("2025-07-16T10:30:00Z"),
      detalle: "Creación de usuario supervisor Carlos Supervisor",
      coleccion: "usuarios_companias",
      documentoId: "user_super_001"
    }
  ];

  return { 
    companias_corretaje, 
    oficinas,
    aseguradoras, 
    tipos_polizas, 
    entes, 
    usuarios_companias, 
    polizas, 
    gestiones,
    clientes_gestion,
    configurations,
    auditoria
  };
}

// === Funciones de carga ===

async function seedCollection(collectionName, data) {
  if (!data || data.length === 0) {
    console.log(`Skipping ${collectionName}, no data provided.`);
    return;
  }
  console.log(`Seeding ${collectionName}...`);
  const batch = db.batch();
  data.forEach(item => {
    const docId = item.id;
    if (!docId) {
      console.warn(`Skipping item in ${collectionName} due to missing id:`, item);
      return;
    }
    const docRef = db.collection(collectionName).doc(docId);
    batch.set(docRef, item);
  });
  await batch.commit();
  console.log(`${collectionName} seeded successfully!`);
}

async function seedConfigurations(configData) {
    console.log('Seeding configurations...');
    const batch = db.batch();
    for (const [key, value] of Object.entries(configData)) {
        const docRef = db.collection('configurations').doc(key);
        batch.set(docRef, value);
    }
    await batch.commit();
    console.log('Configurations seeded successfully!');
}

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    const data = await getSeedData();

    // El orden es importante por las relaciones entre colecciones
    await seedCollection('companias_corretaje', data.companias_corretaje);
    await seedCollection('oficinas', data.oficinas);
    await seedCollection('aseguradoras', data.aseguradoras);
    await seedCollection('tipos_polizas', data.tipos_polizas);
    await seedCollection('entes', data.entes);
    await seedCollection('usuarios_companias', data.usuarios_companias);
    await seedCollection('polizas', data.polizas);
    await seedCollection('gestiones', data.gestiones);
    await seedCollection('clientes_gestion', data.clientes_gestion);
    await seedCollection('auditoria', data.auditoria);
    
    await seedConfigurations(data.configurations);

    console.log('\nDatabase seeding completed successfully!\n');
    console.log('Available login accounts:');
    console.log('Super Admin: admin@seguroplus.com / password123');
    console.log('Supervisor: supervisor@seguroplus.com / password123');
    console.log('Agente: agente@seguroplus.com / password123');
    console.log('\nIMPORTANT: You can now delete seed.js and temp-firebase-credentials.json for security.\n');

  } catch (error) {
    console.error('FATAL: Error seeding database:', error);
  }
}

seedDatabase();