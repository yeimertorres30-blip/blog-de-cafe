/**
 * Backend de BlogDeCafé
 * ----------------------
 * Servidor Express que recibe las inscripciones a los cursos desde el
 * formulario del sitio y las guarda de forma persistente en un archivo
 * JSON local (backend/data/inscripciones.json).
 *
 * Cómo correrlo en VSCode:
 *   1. cd backend
 *   2. npm install
 *   3. cp .env.example .env   (o copia manualmente el archivo en Windows)
 *   4. npm start
 *
 * El servidor queda escuchando en http://localhost:3000 (o el puerto
 * configurado en .env).
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "inscripciones.json");

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^\+?[\d\s\-()]{7,20}$/;

const app = express();
app.use(cors());
app.use(express.json());

/** Garantiza que exista la carpeta/archivo de datos antes de operar. */
function asegurarAlmacenamiento() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, "[]", "utf-8");
    }
}

function leerInscripciones() {
    asegurarAlmacenamiento();
    const contenido = fs.readFileSync(DATA_FILE, "utf-8");
    try {
        return JSON.parse(contenido);
    } catch (error) {
        console.error("No se pudo leer el archivo de datos, se reinicia vacío:", error.message);
        return [];
    }
}

function guardarInscripciones(inscripciones) {
    asegurarAlmacenamiento();
    fs.writeFileSync(DATA_FILE, JSON.stringify(inscripciones, null, 2), "utf-8");
}

function contarDigitos(valor) {
    return (valor.match(/\d/g) || []).length;
}

/** Health check simple para verificar que el servidor está arriba. */
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

/** Lista todas las inscripciones guardadas (uso administrativo/local). */
app.get("/api/inscripciones", (req, res) => {
    const inscripciones = leerInscripciones();
    res.json(inscripciones);
});

/** Registra una nueva inscripción a un curso. */
app.post("/api/inscripciones", (req, res) => {
    const { curso, email, telefono } = req.body || {};

    if (!curso || typeof curso !== "string" || !curso.trim()) {
        return res.status(400).json({ error: "El nombre del curso es obligatorio." });
    }
    if (!email || !REGEX_EMAIL.test(String(email).trim())) {
        return res.status(400).json({ error: "El correo electrónico no es válido." });
    }
    if (!telefono || !REGEX_TELEFONO.test(String(telefono).trim()) || contarDigitos(String(telefono)) < 7) {
        return res.status(400).json({ error: "El número de teléfono no es válido." });
    }

    const nuevaInscripcion = {
        id: crypto.randomUUID(),
        curso: curso.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono.trim(),
        fecha: new Date().toISOString()
    };

    const inscripciones = leerInscripciones();
    inscripciones.push(nuevaInscripcion);
    guardarInscripciones(inscripciones);

    res.status(201).json(nuevaInscripcion);
});

app.listen(PORT, () => {
    asegurarAlmacenamiento();
    console.log(`Servidor de BlogDeCafé escuchando en http://localhost:${PORT}`);
});
