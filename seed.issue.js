
/**
 * Script para poblar la colección "issues" en Firestore
 * Ejecutar con: node seed.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📂 Ruta del archivo de credenciales
const credentialsPath =
  process.env.SEED_FIREBASE_CREDENTIALS ||
  path.join(__dirname, "firebase-credentials.json");

if (!fs.existsSync(credentialsPath)) {
  console.error("❌ Archivo de credenciales no encontrado en:", credentialsPath);
  process.exit(1);
}

// 📜 Carga las credenciales
const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));

// 🚀 Inicializa Firebase Admin con las credenciales
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function seedIssues() {
  const issuesData = [
    {
      titulo: "Error al crear lead en Firestore",
      descripcion:
        "El formulario de registro no guarda los datos cuando el campo 'oficina' está vacío.",
      tipo: "bug",
      prioridad: "alta",
      estado: "en progreso",
      reportado_por: "admin@seguroplus.com",
      asignado_a: "dev.maria@seguroplus.com",
      equipo: "frontend",
      proyecto_id: "corretaje-seguro-plus",
      companiaCorretajeId: "compania_001",
      userId: "user_admin_001",
      etiquetas: ["Firestore", "Validación", "React"],
      comentarios: [
        {
          usuario: "juan.perez",
          mensaje: "Ya se revisó la validación del campo oficina.",
          fecha: Timestamp.now(),
        },
      ],
      historial_estados: [
        {
          estado: "abierto",
          cambiado_por: "admin@seguroplus.com",
          fecha: Timestamp.now(),
        },
        {
          estado: "en progreso",
          cambiado_por: "dev.maria@seguroplus.com",
          fecha: Timestamp.now(),
        },
      ],
      imagenes: [
        "https://firebasestorage.googleapis.com/v0/b/seguroplus.appspot.com/o/issues%2Fbug1.png?alt=media",
      ],
      fecha_creacion: Timestamp.now(),
      fecha_actualizacion: Timestamp.now(),
      version_app: "v2.3.1",
      entorno: "producción",
      impacto: "Afecta a todos los agentes que registran leads",
      reproducible: true,
    },
    {
      titulo: "Mejora: agregar filtro de pólizas expiradas",
      descripcion:
        "Solicitan un filtro adicional para listar pólizas próximas a vencer dentro de 30 días.",
      tipo: "mejora",
      prioridad: "media",
      estado: "abierto",
      reportado_por: "soporte@seguroplus.com",
      asignado_a: "dev.juan@seguroplus.com",
      equipo: "backend",
      proyecto_id: "corretaje-seguro-plus",
      companiaCorretajeId: "compania_002",
      userId: "user_supervisor_002",
      etiquetas: ["API", "Filtro", "Backend"],
      comentarios: [],
      historial_estados: [
        {
          estado: "abierto",
          cambiado_por: "soporte@seguroplus.com",
          fecha: Timestamp.now(),
        },
      ],
      imagenes: [],
      fecha_creacion: Timestamp.now(),
      fecha_actualizacion: Timestamp.now(),
      version_app: "v2.3.2",
      entorno: "staging",
      impacto: "Facilita el seguimiento preventivo de pólizas",
      reproducible: false,
    },
    {
      titulo: "Incidente: API de autenticación no responde",
      descripcion:
        "Durante 10 minutos la API de login devolvió error 503 en producción.",
      tipo: "incidente",
      prioridad: "crítica",
      estado: "resuelto",
      reportado_por: "monitor@seguroplus.com",
      asignado_a: "dev.ops@seguroplus.com",
      equipo: "infraestructura",
      proyecto_id: "seguroplus-auth",
      companiaCorretajeId: "compania_001",
      userId: "user_devops_003",
      etiquetas: ["Infraestructura", "Auth", "Downtime"],
      comentarios: [
        {
          usuario: "dev.ops@seguroplus.com",
          mensaje: "El servicio fue restablecido. Se aplicó reinicio del pod.",
          fecha: Timestamp.now(),
        },
      ],
      historial_estados: [
        {
          estado: "abierto",
          cambiado_por: "monitor@seguroplus.com",
          fecha: Timestamp.now(),
        },
        {
          estado: "resuelto",
          cambiado_por: "dev.ops@seguroplus.com",
          fecha: Timestamp.now(),
        },
      ],
      imagenes: [
        "https://firebasestorage.googleapis.com/v0/b/seguroplus.appspot.com/o/issues%2Fincident.png?alt=media",
      ],
      fecha_creacion: Timestamp.now(),
      fecha_actualizacion: Timestamp.now(),
      fecha_resolucion: Timestamp.now(),
      version_app: "v2.3.3",
      entorno: "producción",
      impacto: "Interrumpe inicio de sesión de todos los usuarios",
      reproducible: false,
    },
  ];

  console.log("🌱 Iniciando inserción de issues...");

  for (const issue of issuesData) {
    const ref = await db.collection("issues").add(issue);
    console.log(`✅ Issue agregado: ${issue.titulo} (ID: ${ref.id})`);
  }

  console.log("🎉 Seed de issues completado correctamente.");
}

seedIssues().catch((err) => {
  console.error("❌ Error al insertar issues:", err);
});
