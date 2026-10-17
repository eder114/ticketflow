// Aplica un archivo .sql en la base de datos que esta configurada en .env.
//
// Sirve cuando la base esta publicada en Neon y no tenemos psql a mano:
//
//   node aplicar_sql.js ../database/sql/vistas.sql
//
// Lee la misma configuracion que usa la API, asi que apunta a BD_URL si esta
// llena y, si no, a la base local.

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const archivo = process.argv[2];
if (!archivo) {
  console.log("Falta decir cual archivo. Ejemplo:");
  console.log("  node aplicar_sql.js ../database/sql/vistas.sql");
  process.exit(1);
}

const ruta = path.resolve(process.cwd(), archivo);
if (!fs.existsSync(ruta)) {
  console.log("No existe el archivo: " + ruta);
  process.exit(1);
}

const url = (process.env.BD_URL || "").trim();
const pool = new Pool(
  url
    ? { connectionString: url }
    : {
        host: process.env.BD_HOST || "localhost",
        port: Number(process.env.BD_PUERTO || 5432),
        database: process.env.BD_NOMBRE || "ticketflow",
        user: process.env.BD_USUARIO || "postgres",
        password: process.env.BD_CONTRASENA || ""
      }
);

async function principal() {
  const sql = fs.readFileSync(ruta, "utf8");
  console.log("Aplicando " + path.basename(ruta) + " en " + (url ? "la base publicada" : "la base local"));
  await pool.query(sql);
  console.log("Listo.");
  await pool.end();
}

principal().catch(async (error) => {
  console.log("Fallo: " + error.message);
  await pool.end();
  process.exit(1);
});
