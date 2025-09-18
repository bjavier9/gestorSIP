const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcryptjs');

// IMPORTANTE: Asegúrate de que tu clave de servicio exista como serviceAccountKey.json
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// === Definición de Datos de Prueba ===

async function getSeedData() {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

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
            activo: true
        }
    ];

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

    const tipos_polizas = [
        { id: "tipo_001", nombre: "Automotriz", descripcion: "Póliza para vehículos automotores.", vigenciaMaxMeses: 12, activo: true },
        { id: "tipo_002", nombre: "Salud", descripcion: "Póliza de seguro médico.", vigenciaMaxMeses: 12, activo: true },
        { id: "tipo_003", nombre: "Hogar", descripcion: "Póliza de seguro para viviendas.", vigenciaMaxMeses: 24, activo: true },
    ];

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

    const users = [
        {
            id: "user_admin_001", // Este ID sería el UID de Firebase Auth en un caso real
            email: "admin@seguroplus.com",
            password: hashedPassword, // Contraseña: "password123"
            enteId: "admin_user_001" // Vínculo al ente correspondiente
        }
    ];

    const entes_companias = [
        {
            id: "admin_user_001_comp_001",
            enteId: "admin_user_001",
            companiaCorretajeId: "comp_001",
            rol: "ADMIN",
            fechaCreacion: new Date(),
            activo: true
        }
    ];

    const polizas = [
        {
            id: "pol_00001",
            numeroPoliza: "AUTO-2025-00001",
            tipoPolizaId: "tipo_001",
            aseguradoraId: "aseg_001",
            tomadorId: "cliente_001",
            aseguradoId: "cliente_001",
            companiaCorretajeId: "comp_001",
            fechaInicio: new Date("2025-08-15"),
            fechaVencimiento: new Date("2026-08-15"),
            montoAsegurado: 25000.00,
            prima: 1200.00,
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
            fechaInicio: new Date("2025-09-01"),
            fechaVencimiento: new Date("2027-09-01"),
            montoAsegurado: 150000.00,
            prima: 3500.00,
            estado: "PENDIENTE_PAGO",
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
        }
    ];

    return { companias_corretaje, aseguradoras, tipos_polizas, entes, users, entes_companias, polizas };
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

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    const data = await getSeedData();
    
    // El orden puede ser importante si hay relaciones
    await seedCollection('companias_corretaje', data.companias_corretaje);
    await seedCollection('aseguradoras', data.aseguradoras);
    await seedCollection('tipos_polizas', data.tipos_polizas);
    await seedCollection('entes', data.entes);
    await seedCollection('users', data.users); // Cargar usuarios
    await seedCollection('entes_companias', data.entes_companias);
    await seedCollection('polizas', data.polizas); // Cargar pólizas

    console.log('\nDatabase seeding completed successfully!\n');
    console.log('You can now log in with:');
    console.log('Email: admin@seguroplus.com');
    console.log('Password: password123');
    console.log('\nIMPORTANT: You can now delete seed.js and serviceAccountKey.json for security.\n');

  } catch (error) {
    console.error('FATAL: Error seeding database:', error);
  }
}

seedDatabase();
