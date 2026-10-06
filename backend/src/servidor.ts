// Arranque del servidor.
import cors from "cors";
import express from "express";
import { entorno } from "./configuracion/entorno";
import { cerrarConexion, probarConexion } from "./datos/conexion";
import { manejadorDeErrores, rutaNoEncontrada } from "./middleware/errores";
import rutas from "./rutas";

const app = express();

app.use(cors({ origin: entorno.origenPermitido === "*" ? true : entorno.origenPermitido.split(",") }));
app.use(express.json({ limit: "1mb" }));

// Para comprobar de un vistazo que el servidor está vivo.
app.get("/api/salud", (_pet, res) => {
  res.json({ estado: "ok", hora: new Date().toISOString() });
});

app.use("/api", rutas);

app.use(rutaNoEncontrada);
app.use(manejadorDeErrores);

async function arrancar() {
  try {
    const version = await probarConexion();
    console.log(`Conectado a ${version}`);
  } catch (error) {
    console.error("No se pudo conectar a PostgreSQL:", (error as Error).message);
    console.error("Revise los datos de conexión en el archivo .env");
    process.exit(1);
  }

  const servidor = app.listen(entorno.puerto, () => {
    console.log(`API de TicketFlow escuchando en http://localhost:${entorno.puerto}/api`);
  });

  const apagar = async () => {
    servidor.close();
    await cerrarConexion();
    process.exit(0);
  };
  process.on("SIGINT", apagar);
  process.on("SIGTERM", apagar);
}

if (require.main === module) {
  arrancar();
}

export default app;
