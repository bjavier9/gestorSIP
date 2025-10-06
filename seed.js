const path = require('path');
const { existsSync } = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

const credentialsPath = process.env.SEED_FIREBASE_CREDENTIALS || path.join(__dirname, 'firebase-credentials.json');

if (!existsSync(credentialsPath)) {
  console.error(`Credential file not found: ${credentialsPath}`);
  process.exit(1);
}

const serviceAccount = require(credentialsPath);
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const auth = getAuth();

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'pass1234';
const now = () => new Date();

const companias = [
  {
    id: 'comp_001',
    nombre: 'SeguroPlus Corretaje',
    rif: 'J-500112233',
    correo: 'contacto@seguroplus.com',
    telefono: '+58-212-5550101',
    direccion: 'Av. Principal El Rosal, Torre Seguros, Caracas',
    activo: true,
    fechaCreacion: now(),
    fechaActualizacion: now(),
    modulos: ['polizas', 'gestiones', 'reportes'],
    monedasAceptadas: ['USD', 'VES'],
    monedaPorDefecto: 'USD',
    creada: { idente: 1001 },
    modificado: [],
  },
  {
    id: 'comp_002',
    nombre: 'Global Broker Partners',
    rif: 'J-400221199',
    correo: 'info@globalbrokers.com',
    telefono: '+58-241-5552222',
    direccion: 'Av. Bolivar Norte, Centro Empresarial, Valencia',
    activo: true,
    fechaCreacion: now(),
    fechaActualizacion: now(),
    modulos: ['polizas', 'gestiones'],
    monedasAceptadas: ['USD'],
    monedaPorDefecto: 'USD',
    creada: { idente: 2001 },
    modificado: [],
  },
];

const oficinas = [
  { id: '301', companiaCorretajeId: 'comp_001', nombre: 'Sede Caracas', direccion: 'Av. Principal El Rosal, Torre Seguros, Caracas', telefono: '+58-212-5550101', moneda: 'USD', activo: true },
  { id: '302', companiaCorretajeId: 'comp_001', nombre: 'Sucursal Maracaibo', direccion: 'Av. Delicias, Centro Financiero, Maracaibo', telefono: '+58-261-5554545', moneda: 'USD', activo: true },
  { id: '303', companiaCorretajeId: 'comp_001', nombre: 'Sucursal Puerto La Cruz', direccion: 'Av. Intercomunal, Torre Marina, Puerto La Cruz', telefono: '+58-281-5553030', moneda: 'USD', activo: true },
  { id: '401', companiaCorretajeId: 'comp_002', nombre: 'Sede Valencia', direccion: 'Av. Bolivar Norte, Centro Empresarial, Valencia', telefono: '+58-241-5552222', moneda: 'USD', activo: true },
  { id: '402', companiaCorretajeId: 'comp_002', nombre: 'Sucursal Barquisimeto', direccion: 'Av. Venezuela, Torre Financiera, Barquisimeto', telefono: '+58-251-5553030', moneda: 'USD', activo: true },
];

function defineEnte(id, companiaId, nombre, documento, correo, genero, profesion, creadoPor, tipo = 'Persona Natural', idReferido = null, idregion = 1) {
  return {
    id,
    companiaCorretajeId: companiaId,
    nombre,
    tipo,
    documento,
    tipo_documento: 'cedula',
    direccion: `Direccion ${nombre}`,
    telefono: '+58-4' + Math.floor(10000000 + Math.random() * 89999999),
    correo,
    idregion,
    idReferido,
    fechaCreacion: now(),
    fechaActualizacion: now(),
    activo: true,
    metadatos: {
      creadoPor,
      fechaNacimiento: new Date('1985-01-01'),
      genero,
      estadoCivil: 'casado',
      profesion,
      nacionalidad: 'VE',
      ultimaActualizacion: now(),
    },
  };
}

const entes = [
  defineEnte('1001', 'comp_001', 'Ana Maria Admin', 'V-13888999', 'ana.admin@seguroplus.com', 'F', 'Administrador', 'seed'),
  defineEnte('1002', 'comp_001', 'Carlos Supervisor', 'V-16999000', 'carlos.supervisor@seguroplus.com', 'M', 'Ing. Industrial', 'seed', 'Persona Natural', '1001'),
  defineEnte('1003', 'comp_001', 'Maria Agent', 'V-20123456', 'maria.agent@seguroplus.com', 'F', 'Asesor Comercial', 'seed', 'Persona Natural', '1002'),
  defineEnte('1004', 'comp_001', 'Jose Agent', 'V-20555111', 'jose.agent@seguroplus.com', 'M', 'Economista', 'seed', 'Persona Natural', '1002', 10),
  defineEnte('1005', 'comp_001', 'Cliente Renovacion 1', 'V-12345001', 'cliente1@clientes.com', 'F', 'Empresario', 'seed', 'Persona Natural', '1003', 5),
  defineEnte('1006', 'comp_001', 'Cliente Renovacion 2', 'V-12345002', 'cliente2@clientes.com', 'M', 'Contador', 'seed', 'Persona Natural', '1003', 5),
  defineEnte('1007', 'comp_001', 'Empresa Logistica Andes', 'J-400112200', 'logistica.andes@empresa.com', 'M', 'Gerente', 'seed', 'Persona Juridica', '1001', 3),
  defineEnte('1008', 'comp_001', 'Cliente Prospecto Oriente', 'V-19887766', 'prospecto.oriente@clientes.com', 'F', 'Ingeniero', 'seed', 'Persona Natural', '1004', 7),
  defineEnte('2001', 'comp_002', 'Laura Admin', 'V-15222333', 'laura.admin@globalbrokers.com', 'F', 'Abogado', 'seed', 'Persona Natural', null, 10),
  defineEnte('2002', 'comp_002', 'Luis Supervisor', 'V-18888777', 'luis.supervisor@globalbrokers.com', 'M', 'Administrador', 'seed', 'Persona Natural', '2001', 10),
  defineEnte('2003', 'comp_002', 'Patricia Agent', 'V-20999123', 'patricia.agent@globalbrokers.com', 'F', 'Contador', 'seed', 'Persona Natural', '2002', 9),
  defineEnte('2004', 'comp_002', 'Cliente Global 1', 'V-33322111', 'cliente.global1@clientes.com', 'F', 'Arquitecto', 'seed', 'Persona Natural', '2003', 9),
  defineEnte('2005', 'comp_002', 'Cliente Global 2', 'V-33322112', 'cliente.global2@clientes.com', 'M', 'Ingeniero', 'seed', 'Persona Natural', '2003', 9),
  defineEnte('2006', 'comp_002', 'Constructora Larense', 'J-50505050', 'constructora@empresa.com', 'M', 'Director', 'seed', 'Persona Juridica', '2001', 9),
  defineEnte('2007', 'comp_002', 'Cliente Prospecto Andes', 'V-37776655', 'prospecto.andes@clientes.com', 'F', 'Disenador', 'seed', 'Persona Natural', '2003', 9),
];

const aseguradoras = [
  { id: 'aseg_001', nombre: 'Aseguradora Nacional', codigo: 'AN23', direccion: 'Gran Boulevard 789, Caracas', telefono: '+58-212-5559012', correo: 'ventas@asegnacional.com', rating: 4.5, activo: true, fechaCreacion: now(), fechaActualizacion: now() },
  { id: 'aseg_002', nombre: 'Seguros Horizonte', codigo: 'SH01', direccion: 'Av. Principal, Torre Seguros, Valencia', telefono: '+58-241-5551234', correo: 'contacto@horizonte.com', rating: 4.2, activo: true, fechaCreacion: now(), fechaActualizacion: now() },
  { id: 'aseg_003', nombre: 'ProtecVida Internacional', codigo: 'PV88', direccion: 'Av. Fuerzas Armadas, Caracas', telefono: '+58-212-5554545', correo: 'info@protecviva.com', rating: 4.7, activo: true, fechaCreacion: now(), fechaActualizacion: now() },
];

const configurations = [
  {
    id: 'roles_permitidos',
    name: 'Roles disponibles en la plataforma',
    description: 'Roles asignables a los usuarios de compañías',
    items: [
      { rol: 'admin', descripcion: 'Administrador con control total', activo: true },
      { rol: 'supervisor', descripcion: 'Supervisor con permisos de supervisión y gestión', activo: true },
      { rol: 'agent', descripcion: 'Agente comercial con acceso a gestiones y pólizas propias', activo: true },
      { rol: 'viewer', descripcion: 'Visualizador con acceso solo lectura', activo: true },
    ],
  },
  {
    id: 'gestion_estados',
    name: 'Estados de gestión',
    description: 'Estados posibles para las gestiones comerciales',
    items: [
      { estado: 'borrador', activo: true },
      { estado: 'en_gestion', activo: true },
      { estado: 'en_tramite', activo: true },
      { estado: 'gestionado_exito', activo: true },
      { estado: 'desistido', activo: true },
    ],
  },
];

const usuarioPlantilla = [
  { email: 'ana.admin@seguroplus.com', displayName: 'Ana Maria Admin', rol: 'admin', companiaCorretajeId: 'comp_001', oficinaId: '301', enteId: '1001' },
  { email: 'carlos.supervisor@seguroplus.com', displayName: 'Carlos Supervisor', rol: 'supervisor', companiaCorretajeId: 'comp_001', oficinaId: '301', enteId: '1002' },
  { email: 'maria.agent@seguroplus.com', displayName: 'Maria Agent', rol: 'agent', companiaCorretajeId: 'comp_001', oficinaId: '302', enteId: '1003' },
  { email: 'jose.agent@seguroplus.com', displayName: 'Jose Agent', rol: 'agent', companiaCorretajeId: 'comp_001', oficinaId: '302', enteId: '1004' },
  { email: 'laura.admin@globalbrokers.com', displayName: 'Laura Admin', rol: 'admin', companiaCorretajeId: 'comp_002', oficinaId: '401', enteId: '2001' },
  { email: 'luis.supervisor@globalbrokers.com', displayName: 'Luis Supervisor', rol: 'supervisor', companiaCorretajeId: 'comp_002', oficinaId: '401', enteId: '2002' },
  { email: 'patricia.agent@globalbrokers.com', displayName: 'Patricia Agent', rol: 'agent', companiaCorretajeId: 'comp_002', oficinaId: '402', enteId: '2003' },
];

const leadTemplates = [
  { id: 'lead_comp1_001', companiaCorretajeId: 'comp_001', nombre: 'Juan Perez', correo: 'juan.perez@example.com', telefono: '+58-414-5556565', estado: 'nuevo', origen: 'web', agenteEmail: 'maria.agent@seguroplus.com' },
  { id: 'lead_comp1_002', companiaCorretajeId: 'comp_001', nombre: 'Maria Rojas', correo: 'maria.rojas@example.com', telefono: '+58-412-5552323', estado: 'contactado', origen: 'referido', agenteEmail: 'jose.agent@seguroplus.com' },
  { id: 'lead_comp2_001', companiaCorretajeId: 'comp_002', nombre: 'Carlos Laya', correo: 'carlos.laya@example.com', telefono: '+58-414-5551212', estado: 'calificado', origen: 'web', agenteEmail: 'patricia.agent@globalbrokers.com' },
  { id: 'lead_comp2_002', companiaCorretajeId: 'comp_002', nombre: 'Empresas Valle', correo: 'contacto@empresasvalle.com', telefono: '+58-241-5557878', estado: 'nuevo', origen: 'evento', agenteEmail: 'patricia.agent@globalbrokers.com' },
];

const polizaTemplates = [
  {
    id: 'poliza_001',
    numeroPoliza: 'SP-2025-0001',
    tipoPolizaId: 'AUTO',
    aseguradoraId: 'aseg_001',
    tomadorId: 1005,
    aseguradoId: 1005,
    companiaCorretajeId: 'comp_001',
    oficinaId: '301',
    agenteEmail: 'maria.agent@seguroplus.com',
    fechaInicio: new Date('2025-01-10'),
    fechaVencimiento: new Date('2026-01-09'),
    montoAsegurado: 35000,
    prima: 980,
    moneda: 'USD',
    estado: 'ACTIVA',
  },
  {
    id: 'poliza_002',
    numeroPoliza: 'SP-2025-0002',
    tipoPolizaId: 'SALUD',
    aseguradoraId: 'aseg_002',
    tomadorId: 1006,
    aseguradoId: 1006,
    companiaCorretajeId: 'comp_001',
    oficinaId: '302',
    agenteEmail: 'jose.agent@seguroplus.com',
    fechaInicio: new Date('2025-03-15'),
    fechaVencimiento: new Date('2026-03-14'),
    montoAsegurado: 18000,
    prima: 560,
    moneda: 'USD',
    estado: 'ACTIVA',
  },
  {
    id: 'poliza_003',
    numeroPoliza: 'GB-2025-0101',
    tipoPolizaId: 'HOGAR',
    aseguradoraId: 'aseg_003',
    tomadorId: 2004,
    aseguradoId: 2004,
    companiaCorretajeId: 'comp_002',
    oficinaId: '401',
    agenteEmail: 'patricia.agent@globalbrokers.com',
    fechaInicio: new Date('2025-02-01'),
    fechaVencimiento: new Date('2026-01-31'),
    montoAsegurado: 75000,
    prima: 1250,
    moneda: 'USD',
    estado: 'ACTIVA',
  },
  {
    id: 'poliza_004',
    numeroPoliza: 'GB-2025-0102',
    tipoPolizaId: 'VIDA',
    aseguradoraId: 'aseg_002',
    tomadorId: 2005,
    aseguradoId: 2005,
    companiaCorretajeId: 'comp_002',
    oficinaId: '402',
    agenteEmail: 'patricia.agent@globalbrokers.com',
    fechaInicio: new Date('2025-04-20'),
    fechaVencimiento: new Date('2026-04-19'),
    montoAsegurado: 50000,
    prima: 890,
    moneda: 'USD',
    estado: 'ACTIVA',
  },
];

const gestionTemplates = [
  {
    id: 'gestion_001',
    companiaCorretajeId: 'comp_001',
    agenteEmail: 'maria.agent@seguroplus.com',
    oficinaId: '301',
    polizaId: 'poliza_001',
    leadId: 'lead_comp1_001',
    tipo: 'nueva',
    estado: 'en_gestion',
    prioridad: 'alta',
    notas: 'Seguimiento semanal con el cliente Juan Perez.',
    fechaVencimiento: new Date('2025-07-30'),
  },
  {
    id: 'gestion_002',
    companiaCorretajeId: 'comp_001',
    agenteEmail: 'jose.agent@seguroplus.com',
    oficinaId: '302',
    polizaId: 'poliza_002',
    tipo: 'renovacion',
    estado: 'en_tramite',
    prioridad: 'media',
    notas: 'Renovación póliza salud Cliente Renovacion 2.',
    fechaVencimiento: new Date('2025-09-10'),
  },
  {
    id: 'gestion_003',
    companiaCorretajeId: 'comp_002',
    agenteEmail: 'patricia.agent@globalbrokers.com',
    oficinaId: '401',
    leadId: 'lead_comp2_002',
    tipo: 'nueva',
    estado: 'borrador',
    prioridad: 'alta',
    notas: 'Propuesta inicial para Empresas Valle.',
    fechaVencimiento: new Date('2025-06-01'),
  },
];

async function seedTopLevelCollection(collectionName, items) {
  if (!items.length) {
    return;
  }
  const batch = db.batch();
  items.forEach((item) => {
    const docRef = db.collection(collectionName).doc(String(item.id));
    batch.set(docRef, { ...item }, { merge: true });
  });
  await batch.commit();
  console.log(`Seeded ${items.length} documents into ${collectionName}`);
}

function groupBy(items, keyGetter) {
  return items.reduce((acc, item) => {
    const key = keyGetter(item);
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key).push(item);
    return acc;
  }, new Map());
}

async function seedCompaniasCorretaje() {
  await seedTopLevelCollection('companias_corretaje', companias);
}

async function seedOficinasSubcollections() {
  const grouped = groupBy(oficinas, (item) => item.companiaCorretajeId);
  for (const [companiaId, oficinasList] of grouped.entries()) {
    const batch = db.batch();
    const collectionRef = db.collection('companias_corretaje').doc(companiaId).collection('oficinas');
    oficinasList.forEach((oficina) => {
      const docRef = collectionRef.doc(String(oficina.id));
      batch.set(docRef, {
        ...oficina,
        fechaCreacion: oficina.fechaCreacion || now(),
        fechaActualizacion: oficina.fechaActualizacion || now(),
      }, { merge: true });
    });
    await batch.commit();
    console.log(`Seeded ${oficinasList.length} oficinas for compania ${companiaId}`);
  }
}

async function seedEntesCollection() {
  await seedTopLevelCollection('entes', entes);
}

async function ensureAuthUser(email, displayName) {
  try {
    return await auth.getUserByEmail(email);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return auth.createUser({
        email,
        password: DEFAULT_PASSWORD,
        displayName,
        emailVerified: true,
        disabled: false,
      });
    }
    throw error;
  }
}

async function seedUsuariosCompania() {
  const collection = db.collection('usuarios_companias');
  const userMap = new Map();

  for (const user of usuarioPlantilla) {
    const userRecord = await ensureAuthUser(user.email, user.displayName);
    const doc = {
      id: userRecord.uid,
      userId: userRecord.uid,
      email: user.email,
      companiaCorretajeId: user.companiaCorretajeId,
      rol: user.rol,
      activo: true,
      fechaCreacion: now(),
      enteId: user.enteId,
      ...(user.oficinaId ? { oficinaId: user.oficinaId } : {}),
    };
    await collection.doc(userRecord.uid).set(doc, { merge: true });
    userMap.set(user.email, { uid: userRecord.uid, companiaCorretajeId: user.companiaCorretajeId });
  }

  console.log('Usuarios de compania creados/asociados:', userMap.size);
  userMap.forEach((value, email) => {
    console.log(` - ${email} (${value.uid})`);
  });
  return userMap;
}

async function seedLeads(userMap) {
  if (!leadTemplates.length) return;
  const batch = db.batch();
  leadTemplates.forEach((lead) => {
    const agente = lead.agenteEmail ? userMap.get(lead.agenteEmail) : undefined;
    const docRef = db.collection('leads').doc(String(lead.id));
    batch.set(docRef, {
      id: lead.id,
      nombre: lead.nombre,
      correo: lead.correo,
      telefono: lead.telefono,
      companiaCorretajeId: lead.companiaCorretajeId,
      agenteId: agente ? agente.uid : null,
      fechaCreacion: now(),
      fechaActualizacion: now(),
      estado: lead.estado,
      origen: lead.origen,
    }, { merge: true });
  });
  await batch.commit();
  console.log(`Seeded ${leadTemplates.length} leads`);
}

async function seedPolizas(userMap) {
  if (!polizaTemplates.length) return;
  const batch = db.batch();
  polizaTemplates.forEach((template) => {
    const agente = template.agenteEmail ? userMap.get(template.agenteEmail) : undefined;
    const docRef = db.collection('polizas').doc(String(template.id));
    batch.set(docRef, {
      id: template.id,
      numeroPoliza: template.numeroPoliza,
      tipoPolizaId: template.tipoPolizaId,
      aseguradoraId: template.aseguradoraId,
      tomadorId: template.tomadorId,
      aseguradoId: template.aseguradoId,
      companiaCorretajeId: template.companiaCorretajeId,
      oficinaId: template.oficinaId,
      agenteId: agente ? agente.uid : null,
      fechaInicio: template.fechaInicio,
      fechaVencimiento: template.fechaVencimiento,
      montoAsegurado: template.montoAsegurado,
      prima: template.prima,
      moneda: template.moneda,
      estado: template.estado,
      fechaCreacion: now(),
      fechaActualizacion: now(),
    }, { merge: true });
  });
  await batch.commit();
  console.log(`Seeded ${polizaTemplates.length} polizas`);
}

async function seedGestiones(userMap) {
  if (!gestionTemplates.length) return;
  const batch = db.batch();
  gestionTemplates.forEach((template) => {
    const agente = template.agenteEmail ? userMap.get(template.agenteEmail) : undefined;
    const docRef = db.collection('gestiones').doc(String(template.id));
    batch.set(docRef, {
      id: template.id,
      companiaCorretajeId: template.companiaCorretajeId,
      agenteId: agente ? agente.uid : null,
      oficinaId: template.oficinaId || null,
      polizaId: template.polizaId || null,
      leadId: template.leadId || null,
      tipo: template.tipo,
      estado: template.estado,
      prioridad: template.prioridad || null,
      notas: template.notas || null,
      fechaCreacion: now(),
      fechaActualizacion: now(),
      fechaVencimiento: template.fechaVencimiento || null,
      activo: true,
    }, { merge: true });
  });
  await batch.commit();
  console.log(`Seeded ${gestionTemplates.length} gestiones`);
}

async function run() {
  try {
    console.log('--- Starting seed ---');
    await seedCompaniasCorretaje();
    await seedOficinasSubcollections();
    await seedEntesCollection();
    await seedTopLevelCollection('aseguradoras', aseguradoras);
    await seedTopLevelCollection('configurations', configurations);
    const userMap = await seedUsuariosCompania();
    await seedLeads(userMap);
    await seedPolizas(userMap);
    await seedGestiones(userMap);
    console.log('\nSeed completed successfully. Default password:', DEFAULT_PASSWORD, '\n');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  }
}

run();

