import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { getSetInfo } from './bricklinkApi.js';

const app = express();
const PORT = 4000;

let allowedOrigins;

if (process.env.CORS_ORIGIN){
  allowedOrigins = process.env.CORS_ORIGIN.split(',');
  } else {
    allowedOrigins = [
      'http://localhost:5173',
    ];
  }

// Middleware
app.use(cors({
 origin: function (origin, callback){
  if (!origin) return callback(null, true);
  if(allowedOrigins.indexOf(origin) === -1){
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  }
  return callback(null, true);
 },
 methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
 allowedHeaders: ['Content-Type', 'Authorization'],
 credentials: true
}));

app.use(express.json());
// Abrir base de datos SQLite (archivo lego.db)
const db = new sqlite3.Database("./lego.db", (err) => {
  if (err) {
    console.error("Error al abrir DB:", err.message);
    return;
  }
  console.log("Conectado a la base de datos SQLite.");

  // Crear tabla sets si no existe
  db.run(`
    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      numero TEXT,
      piezas INTEGER,
      ano INTEGER,
      tema TEXT,
      estado TEXT DEFAULT 'nuevo',
      deseado INTEGER DEFAULT 0,
      precioCompra REAL,    
      fechaCompra TEXT,     
      imagen TEXT,          
      setId TEXT           
    )
  `, (err) => {
    if (err) {
      console.error("Error creando tabla sets:", err.message);
      return;
    }
    console.log("Tabla 'sets' lista");

  // Verificar y agregar columnas nuevas si no existen
  db.all("PRAGMA table_info(sets)", (err, columns) => {
    if (err) {
      console.error("Error obteniendo información de la tabla:", err.message);
      return;
      }

    const colNames = columns.map(col => col.name);

    if (!colNames.includes("tema")) { db.run(`ALTER TABLE sets ADD COLUMN tema TEXT`);}
    if (!colNames.includes("estado")) { db.run(`ALTER TABLE sets ADD COLUMN estado TEXT DEFAULT 'nuevo'`); }
    if (!colNames.includes("deseado")) { db.run(`ALTER TABLE sets ADD COLUMN deseado INTEGER DEFAULT 0`); }
    if (!colNames.includes("precioCompra")) { db.run(`ALTER TABLE sets ADD COLUMN precioCompra REAL`); }
    if (!colNames.includes("fechaCompra")) { db.run(`ALTER TABLE sets ADD COLUMN fechaCompra TEXT`); }
    if (!colNames.includes("imagen")) { db.run(`ALTER TABLE sets ADD COLUMN imagen TEXT`); }
    if (!colNames.includes("setId")) { db.run(`ALTER TABLE sets ADD COLUMN setId TEXT`); }
    });
  });
});

// Endpoint para obtener todos los sets
app.get("/api/collection/all", (req, res) => {
  db.all("SELECT * FROM sets ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Endpoint para agregar un set
app.post("/api/collection", (req, res) => {
  const { nombre, numero, piezas, ano, tema, estado, deseado, precioCompra, fechaCompra, imagen, setId } = req.body;
  const sql = `
    INSERT INTO sets (nombre, numero, piezas, ano, tema, estado, deseado, precioCompra, fechaCompra, imagen, setId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [nombre, numero, piezas, ano, tema, estado, deseado ? 1 : 0, precioCompra, fechaCompra, imagen, setId], function (err) {
    if (err) {
      console.error("Error al insertar en DB:", err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    db.get("SELECT * FROM sets WHERE id = ?", [this.lastID], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json(row); // 201 Created
    });
  });
});

// Endpoint para obtener sets con búsqueda opcional en tu colección
app.get("/api/collection", (req, res) => { // Cambiado a /api/collection
  const q = req.query.q ? `%${req.query.q}%` : "%";

  const sql = `
    SELECT * FROM sets
    WHERE nombre LIKE ? OR numero LIKE ?
    ORDER BY id DESC
  `;

  db.all(sql, [q, q], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});


// Endpoint para eliminar un set de la colección
app.delete("/api/collection/:id", (req, res) => { // Cambiado a /api/collection/:id
  const id = req.params.id;
  db.run("DELETE FROM sets WHERE id = ?", id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Set no encontrado." });
    } else {
      res.json({ message: "Set eliminado exitosamente.", deletedID: id });
    }
  });
});

// Endpoint para obtener información de un set desde la API de Bricklink
app.get("/api/bricklink/set/:setNumber", async (req, res) => { // ¡Añadido /api/ para consistencia!
  const setNumber = req.params.setNumber;

  try {
    console.log(`Backend: Buscando información del set para número base: ${setNumber}`);
    const setInfo = await getSetInfo(setNumber); // Ahora getSetInfo lanza errores específicos
    // --- AÑADE ESTO ---
  //console.log("Backend: Datos a enviar al frontend:", setInfo);
  // --- FIN AÑADE ESTO ---
    res.json(setInfo); // Si todo va bien, setInfo ya es la data.data de BrickLink
  } catch (error) {
    //console.error("Error en el endpoint /api/bricklink/set:", error); // Loguea el error completo

    const statusCode = error.statusCode || 500; // Usa el statusCode del error personalizado
    const message = error.message || "Error al obtener información de BrickLink";
    const details = error.bricklinkDetails || null; // Incluye detalles de BrickLink si existen

    res.status(statusCode).json({ message, details });
  }
});

// Ruta de prueba para la raíz del backend
app.get('/', (req, res) => {
  res.send('Servidor Backend de 0TeBrick funcionando. Accede a las APIs en /api/...');
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});