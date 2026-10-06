// Conexión a PostgreSQL. Un solo pool para toda la aplicación.
import { Pool, PoolClient, QueryResultRow } from "pg";
import { entorno } from "../configuracion/entorno";

const pool = new Pool({
  host: entorno.bd.host,
  port: entorno.bd.puerto,
  database: entorno.bd.nombre,
  user: entorno.bd.usuario,
  password: entorno.bd.contrasena,
  max: 10,
  idleTimeoutMillis: 30000
});

pool.on("error", (error) => {
  console.error("Error inesperado en el pool de PostgreSQL:", error.message);
});

// Todas las consultas pasan por aquí. El texto siempre lleva $1, $2, …: nunca
// se arma la consulta pegando valores, para no dejar lugar a inyección de SQL.
export async function consultar<T extends QueryResultRow>(
  texto: string,
  valores: unknown[] = []
): Promise<T[]> {
  const resultado = await pool.query<T>(texto, valores);
  return resultado.rows;
}

export async function consultarUno<T extends QueryResultRow>(
  texto: string,
  valores: unknown[] = []
): Promise<T | null> {
  const filas = await consultar<T>(texto, valores);
  return filas[0] ?? null;
}

// Para las operaciones que tocan varias tablas: o se guardan todas o ninguna.
// Ejemplo: crear la persona, sus teléfonos y su cliente en un solo paso.
export async function enTransaccion<T>(
  trabajo: (cliente: PoolClient) => Promise<T>
): Promise<T> {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    const resultado = await trabajo(cliente);
    await cliente.query("COMMIT");
    return resultado;
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
}

export async function probarConexion(): Promise<string> {
  const fila = await consultarUno<{ version: string }>("SELECT version()");
  return fila ? fila.version.split(",")[0] : "desconocida";
}

export async function cerrarConexion(): Promise<void> {
  await pool.end();
}
