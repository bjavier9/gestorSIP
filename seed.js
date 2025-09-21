const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// IMPORTANTE: Asegúrate de que tu clave de servicio exista como temp-firebase-credentials.json
const serviceAccount = require('./temp-firebase-credentials.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();


const randomNum = () => Math.floor(1000 + Math.random() * 9000);
// === Definición de Datos de Prueba ===

async function getSeedData() {
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
      creada: { idente: 1 },
      modificado: [
        {
          idente: 1,
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

  // 2. OFICINAS
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
      id: randomNum(),
      nombre: "Alicia Admin",
      tipo: "Persona Natural",
      documento: "8-892-12344",
      tipo_documento: "cedula",
      direccion: "Oficina Principal, Caracas",
      telefono: "+58-212-5550000",
      correo: "admin@seguroplus.com",
      idregion: 507,
      idReferido: null,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      activo: true,
      metadatos: { 
        creadoPor: "system_seed",
        fechaNacimiento: new Date("1985-05-15"),
        genero: "F",
        estadoCivil: "Soltera",
        profesion: "Administradora",
        nacionalidad: "Venezolana",
        ultimaActualizacion: new Date()
      }
    },
    {
      id: randomNum(),
      nombre: "Carlos Supervisor",
      tipo: "Persona Natural",
      documento: "8-892-12345",
      tipo_documento: "cedula",
      direccion: "Av. Libertador, Edif. Paris, Apto 5B",
      telefono: "+58-412-7654321",
      correo: "carlos.supervisor@seguroplus.com",
      idregion: 507,
      idReferido: 1,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      activo: true,
      metadatos: { 
        creadoPor: 1,
        fechaNacimiento: new Date("1980-08-22"),
        genero: "M",
        estadoCivil: "Casado",
        profesion: "Supervisor de Ventas",
        nacionalidad: "Venezolana",
        ultimaActualizacion: new Date()
      }
    },
    {
      id: randomNum(),
      nombre: "Maria Agente",
      tipo: "Persona Natural",
      documento: "8-892-12346",
      tipo_documento: "cedula",
      direccion: "Calle Comercio, Res. Las Flores, Apt 3A",
      telefono: "+58-414-9876543",
      correo: "maria.agente@seguroplus.com",
      idregion: 507,
      idReferido: 2,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      activo: true,
      metadatos: { 
        creadoPor: 2,
        fechaNacimiento: new Date("1990-03-10"),
        genero: "F",
        estadoCivil: "Soltera",
        profesion: "Agente de Seguros",
        nacionalidad: "Venezolana",
        hijos: 2,
        ultimaActualizacion: new Date()
      }
    },
    {
      id: randomNum(),
      nombre: "Juan Perez",
      tipo: "Persona Natural",
      documento: "8-892-12347",
      tipo_documento: "cedula",
      direccion: "Av. Libertador, Edif. Paris, Apto 5B",
      telefono: "+58-412-1234567",
      correo: "juan.perez@email.com",
      idregion: 507,
      idReferido: 3,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      activo: true,
      metadatos: { 
        creadoPor: 1,
        fechaNacimiento: new Date("1975-12-05"),
        genero: "M",
        estadoCivil: "Casado",
        profesion: "Ingeniero",
        nacionalidad: "Venezolana",
        hijos: 3,
        vehiculos: 2,
        ultimaActualizacion: new Date()
      }
    },
    {
      id: randomNum(),
      nombre: "Empresa XYZ, C.A.",
      tipo: "Persona Jurídica",
      documento: "J-123456789",
      tipo_documento: "rif",
      direccion: "Zona Industrial, Galpón 15, Maracay",
      telefono: "+58-243-5558899",
      correo: "compras@empresaxyz.com",
      idregion: 507,
      idReferido: 4,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      activo: true,
      metadatos: { 
        creadoPor: 1,
        fechaConstitucion: new Date("2010-05-20"),
        sector: "Manufactura",
        empleados: 45,
        facturacionAnual: "1-5 millones",
        ultimaActualizacion: new Date()
      }
    }
  ];

  // 6. USUARIOS COMPAÑÍAS (sin ID predefinido, se usará el UID de Firebase Auth como ID)
  const usuarios_companias_data = [
    {
      email: "admin@seguroplus.com",
      enteId: entes[0].id,
      companiaCorretajeId: "comp_001",
      oficinaId: "oficina_001",
      rol: "admin",
      fechaCreacion: new Date(),
      activo: true
    },
    {
      email: "supervisor@seguroplus.com",
      enteId: entes[1].id,
      companiaCorretajeId: "comp_001",
      oficinaId: "oficina_001",
      rol: "supervisor",
      fechaCreacion: new Date(),
      activo: true
    },
    {
      email: "agente@seguroplus.com",
      enteId: entes[2].id,
      companiaCorretajeId: "comp_001",
      oficinaId: "oficina_001",
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
      tomadorId: entes[3].id,
      aseguradoId: entes[3].id,
      companiaCorretajeId: "comp_001",
      oficinaId: "oficina_001",
      agenteId: "", // Se llenará después con el UID del agente
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
      tomadorId: entes[4].id,
      aseguradoId: entes[4].id,
      companiaCorretajeId: "comp_001",
      oficinaId: "oficina_001",
      agenteId: "", // Se llenará después con el UID del agente
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

  // 8. GESTIONES
  const gestiones = [
    {
      id: "ges_001",
      polizaId: "pol_00001",
      tipo: "renovacion",
      estado: "borrador",
      agenteId: "", // Se llenará después con el UID del agente
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
      agenteId: "", // Se llenará después con el UID del agente
      oficinaId: "oficina_001",
      companiaCorretajeId: "comp_001",
      fechaCreacion: new Date("2025-08-18T14:30:00Z"),
      fechaVencimiento: new Date("2025-09-15T23:59:59Z"),
      prioridad: "media",
      notas: "Cliente solicita modificación de cobertura",
      activo: true
    }
  ];

  // 9. CLIENTES_GESTION
  const clientes_gestion = [
    {
      id: "cligest_001",
      nombre: "Nuevo Cliente Potencial",
      tipo: "Persona Natural",
      telefono: "+58-426-5551122",
      correo: "nuevo.cliente@email.com",
      agenteId: "", // Se llenará después con el UID del agente
      oficinaId: "oficina_001",
      companiaCorretajeId: "comp_001",
      fechaCreacion: new Date("2025-08-22T09:15:00Z"),
      estado: "pendiente",
      notas: "Interesado en seguro de vida"
    }
  ];

  // 10. CONFIGURACIONES (con regiones añadidas)
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
    },
    regions: {
        name: 'Available Regions',
        description: 'Supported regions for clients and offices.',
        items: [
            { id: 507, name: 'Panamá', code: 'PA', activo: true },
            { id: 58, name: 'Venezuela', code: 'VE', activo: true },
            { id: 1, name: 'Estados Unidos', code: 'US', activo: true },
            { id: 34, name: 'España', code: 'ES', activo: true }
        ],
    }
  };

  // 11. AUDITORIA
  const auditoria = [
    {
      id: "audit_001",
      usuario: 1,
      accion: "crear_compania",
      fecha: new Date("2025-07-15T09:00:00Z"),
      detalle: "Creación de compañía Corretaje Seguro Plus",
      coleccion: "companias_corretaje",
      documentoId: "comp_001"
    },
    {
      id: "audit_002",
      usuario: 1,
      accion: "crear_usuario",
      fecha: new Date("2025-07-16T10:30:00Z"),
      detalle: "Creación de usuario supervisor Carlos Supervisor",
      coleccion: "usuarios_companias",
      documentoId: "" // Se llenará después con el UID del usuario
    }
  ];

  return { 
    companias_corretaje, 
    oficinas,
    aseguradoras, 
    tipos_polizas, 
    entes, 
    usuarios_companias_data, 
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
    const docRef = db.collection(collectionName).doc(docId.toString());
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

// Función para crear usuarios en Firebase Auth y obtener sus UIDs
async function createAuthUsers(usersData) {
  console.log('Creating Firebase Auth users...');
  const usersWithUid = [];
  
  for (const user of usersData) {
    try {
      const userRecord = await auth.createUser({
        email: user.email,
        password: "password123", // Contraseña por defecto
        emailVerified: true,
        disabled: false
      });
      
      // Crear objeto de usuario con UID como ID
      const userWithUid = {
        ...user,
        id: userRecord.uid // El ID del documento será el UID de Firebase Auth
      };
      
      usersWithUid.push(userWithUid);
      console.log(`Created Auth user: ${user.email} with UID: ${userRecord.uid}`);
    } catch (error) {
      console.error(`Error creating auth user ${user.email}:`, error);
    }
  }
  
  return usersWithUid;
}

// Función para actualizar referencias en otras colecciones
async function updateReferences(users, entes, polizas, gestiones, clientes_gestion, auditoria) {
  // Encontrar el UID del agente
  const agenteUser = users.find(user => user.email === "agente@seguroplus.com");
  const agenteUid = agenteUser ? agenteUser.id : "";
  
  // Encontrar el UID del supervisor
  const supervisorUser = users.find(user => user.email === "supervisor@seguroplus.com");
  const supervisorUid = supervisorUser ? supervisorUser.id : "";
  
  // Actualizar referencias en pólizas
  polizas.forEach(poliza => {
    poliza.agenteId = agenteUid;
  });
  
  // Actualizar referencias en gestiones
  gestiones.forEach(gestion => {
    gestion.agenteId = agenteUid;
  });
  
  // Actualizar referencias en clientes_gestion
  clientes_gestion.forEach(cliente => {
    cliente.agenteId = agenteUid;
  });
  
  // Actualizar referencias en auditoría
  auditoria.forEach(registro => {
    if (registro.accion === "crear_usuario") {
      registro.documentoId = supervisorUid;
    }
  });

  // Actualizar ID del ente en usuarios_companias_data para mantener las relaciones
  const enteAdminId = entes.find(e => e.nombre === "Alicia Admin")?.id;
  const enteSupervisorId = entes.find(e => e.nombre === "Carlos Supervisor")?.id;
  const enteAgenteId = entes.find(e => e.nombre === "Maria Agente")?.id;

  users.find(u => u.email === "admin@seguroplus.com").enteId = enteAdminId;
  users.find(u => u.email === "supervisor@seguroplus.com").enteId = enteSupervisorId;
  users.find(u => u.email === "agente@seguroplus.com").enteId = enteAgenteId;
  
  // Actualizar ID de referido en entes para mantener las relaciones
  const enteIds = entes.map(e => e.id);
  entes[1].idReferido = enteIds[0];
  entes[2].idReferido = enteIds[1];
  entes[3].idReferido = enteIds[2];
  entes[4].idReferido = enteIds[3];
  
  return { polizas, gestiones, clientes_gestion, auditoria, entes, users };
}

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    const data = await getSeedData();

    // Crear usuarios en Firebase Auth primero y obtener sus UIDs
    const usuarios_companias = await createAuthUsers(data.usuarios_companias_data);

    // Actualizar referencias en otras colecciones
    const updatedData = await updateReferences(
      usuarios_companias,
      data.entes, 
      data.polizas, 
      data.gestiones, 
      data.clientes_gestion, 
      data.auditoria
    );

    // El orden es importante por las relaciones entre colecciones
    await seedCollection('companias_corretaje', data.companias_corretaje);
    await seedCollection('oficinas', data.oficinas);
    await seedCollection('aseguradoras', data.aseguradoras);
    await seedCollection('tipos_polizas', data.tipos_polizas);
    await seedCollection('entes', updatedData.entes);
    await seedCollection('usuarios_companias', updatedData.users);
    await seedCollection('polizas', updatedData.polizas);
    await seedCollection('gestiones', updatedData.gestiones);
    await seedCollection('clientes_gestion', updatedData.clientes_gestion);
    await seedCollection('auditoria', updatedData.auditoria);
    
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
