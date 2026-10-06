// Personas y sus tres especializaciones. Cliente, agente y administrador
// comparten la identificación de la persona, así que crear uno de ellos es
// siempre dos pasos: la persona y su fila de rol. Por eso casi todo va dentro
// de una transacción.
import bcrypt from "bcryptjs";
import { PoolClient } from "pg";
import { consultar, consultarUno, enTransaccion } from "../datos/conexion";
import { enConflicto, noEncontrado } from "../middleware/errores";
import {
  Administrador,
  Agente,
  Cliente,
  Perfil,
  Persona,
  PersonaConContrasena
} from "../modelos/tipos";

const CAMPOS_PERSONA =
  "identificacion, nombres, apellidos, correo, direccion, id_ciudad";

export interface DatosPersona {
  identificacion: string;
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  direccion: string | null;
  id_ciudad: number;
  telefonos: string[];
}

// ------------------------------------------------------------------ lectura --

export interface PersonaConDetalle extends Persona {
  ciudad: string;
  departamento: string;
  pais: string;
  telefonos: string[];
  perfiles: Perfil[];
}

const CONSULTA_DETALLE = `
  SELECT p.identificacion, p.nombres, p.apellidos, p.correo, p.direccion, p.id_ciudad,
         c.nombre AS ciudad, d.nombre AS departamento, pa.nombre AS pais,
         COALESCE(t.telefonos, ARRAY[]::text[]) AS telefonos,
         ARRAY_REMOVE(ARRAY[
           CASE WHEN cl.identificacion IS NOT NULL THEN 'cliente' END,
           CASE WHEN ag.identificacion IS NOT NULL THEN 'agente' END,
           CASE WHEN ad.identificacion IS NOT NULL THEN 'administrador' END
         ], NULL) AS perfiles
  FROM persona p
    JOIN ciudad c        ON c.id_ciudad = p.id_ciudad
    JOIN departamento d  ON d.id_departamento = c.id_departamento
    JOIN pais pa         ON pa.id_pais = d.id_pais
    LEFT JOIN (
      SELECT identificacion, ARRAY_AGG(numero ORDER BY numero) AS telefonos
      FROM telefono GROUP BY identificacion
    ) t ON t.identificacion = p.identificacion
    LEFT JOIN cliente       cl ON cl.identificacion = p.identificacion
    LEFT JOIN agente        ag ON ag.identificacion = p.identificacion
    LEFT JOIN administrador ad ON ad.identificacion = p.identificacion
`;

export const listarPersonas = () =>
  consultar<PersonaConDetalle>(CONSULTA_DETALLE + " ORDER BY p.apellidos, p.nombres");

export async function obtenerPersona(identificacion: string): Promise<PersonaConDetalle> {
  const fila = await consultarUno<PersonaConDetalle>(
    CONSULTA_DETALLE + " WHERE p.identificacion = $1",
    [identificacion]
  );
  if (!fila) throw noEncontrado("La persona");
  return fila;
}

export const buscarPorCorreo = (correo: string) =>
  consultarUno<PersonaConContrasena>(
    `SELECT ${CAMPOS_PERSONA}, contrasena FROM persona WHERE correo = $1`,
    [correo.toLowerCase()]
  );

export async function perfilesDe(identificacion: string): Promise<Perfil[]> {
  const fila = await consultarUno<{ perfiles: Perfil[] }>(
    `SELECT ARRAY_REMOVE(ARRAY[
       (SELECT 'cliente'       FROM cliente       WHERE identificacion = $1),
       (SELECT 'agente'        FROM agente        WHERE identificacion = $1),
       (SELECT 'administrador' FROM administrador WHERE identificacion = $1)
     ], NULL) AS perfiles`,
    [identificacion]
  );
  return fila?.perfiles ?? [];
}

// ---------------------------------------------------------------- escritura --

async function insertarPersona(cliente: PoolClient, datos: DatosPersona): Promise<Persona> {
  const yaEsta = await cliente.query(
    "SELECT identificacion FROM persona WHERE correo = $1 OR identificacion = $2",
    [datos.correo, datos.identificacion]
  );
  if (yaEsta.rowCount) {
    throw enConflicto("Ya hay una persona registrada con ese correo o esa identificación.");
  }

  const cifrada = await bcrypt.hash(datos.contrasena, 10);
  const fila = await cliente.query<Persona>(
    `INSERT INTO persona (identificacion, nombres, apellidos, correo, contrasena, direccion, id_ciudad)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${CAMPOS_PERSONA}`,
    [
      datos.identificacion,
      datos.nombres,
      datos.apellidos,
      datos.correo,
      cifrada,
      datos.direccion,
      datos.id_ciudad
    ]
  );

  await guardarTelefonos(cliente, datos.identificacion, datos.telefonos);
  return fila.rows[0];
}

async function guardarTelefonos(cliente: PoolClient, identificacion: string, telefonos: string[]) {
  await cliente.query("DELETE FROM telefono WHERE identificacion = $1", [identificacion]);
  for (const numero of new Set(telefonos)) {
    await cliente.query(
      "INSERT INTO telefono (identificacion, numero) VALUES ($1, $2)",
      [identificacion, numero]
    );
  }
}

/** Si la persona ya existe se reutiliza; si no, se crea. */
async function personaExistenteONueva(cliente: PoolClient, datos: DatosPersona) {
  const existente = await cliente.query(
    "SELECT identificacion FROM persona WHERE identificacion = $1",
    [datos.identificacion]
  );
  if (existente.rowCount) {
    await guardarTelefonos(cliente, datos.identificacion, datos.telefonos);
    return;
  }
  await insertarPersona(cliente, datos);
}

export const crearPersona = (datos: DatosPersona) =>
  enTransaccion((cliente) => insertarPersona(cliente, datos));

export async function actualizarPersona(
  identificacion: string,
  datos: Omit<DatosPersona, "contrasena" | "identificacion">
): Promise<PersonaConDetalle> {
  await enTransaccion(async (cliente) => {
    const fila = await cliente.query(
      `UPDATE persona SET nombres = $2, apellidos = $3, correo = $4, direccion = $5, id_ciudad = $6
       WHERE identificacion = $1`,
      [identificacion, datos.nombres, datos.apellidos, datos.correo, datos.direccion, datos.id_ciudad]
    );
    if (!fila.rowCount) throw noEncontrado("La persona");
    await guardarTelefonos(cliente, identificacion, datos.telefonos);
  });
  return obtenerPersona(identificacion);
}

export async function eliminarPersona(identificacion: string): Promise<void> {
  const conReservas = await consultarUno<{ total: string }>(
    `SELECT (
       (SELECT COUNT(*) FROM reserva WHERE identificacion_cliente = $1) +
       (SELECT COUNT(*) FROM evento  WHERE identificacion_agente  = $1)
     )::text AS total`,
    [identificacion]
  );
  if (Number(conReservas!.total) > 0) {
    throw enConflicto("No se puede eliminar una persona que tiene eventos o reservas.");
  }
  const borrada = await consultarUno<{ identificacion: string }>(
    "DELETE FROM persona WHERE identificacion = $1 RETURNING identificacion",
    [identificacion]
  );
  if (!borrada) throw noEncontrado("La persona");
}

// ------------------------------------------------------------------- roles --

export interface DatosCliente { puntos: number; ve_publicidad: boolean }
export interface DatosAgente { comision: number; experiencia: number }
export interface DatosAdministrador { salario: number; horario: string }

export const crearCliente = (persona: DatosPersona, rol: DatosCliente) =>
  enTransaccion(async (cliente) => {
    await personaExistenteONueva(cliente, persona);
    const fila = await cliente.query<Cliente>(
      `INSERT INTO cliente (identificacion, puntos, ve_publicidad) VALUES ($1, $2, $3)
       RETURNING identificacion, puntos, ve_publicidad`,
      [persona.identificacion, rol.puntos, rol.ve_publicidad]
    );
    return fila.rows[0];
  });

export const crearAgente = (persona: DatosPersona, rol: DatosAgente) =>
  enTransaccion(async (cliente) => {
    await personaExistenteONueva(cliente, persona);
    const fila = await cliente.query<Agente>(
      `INSERT INTO agente (identificacion, comision, experiencia) VALUES ($1, $2, $3)
       RETURNING identificacion, comision, experiencia`,
      [persona.identificacion, rol.comision, rol.experiencia]
    );
    return fila.rows[0];
  });

export const crearAdministrador = (persona: DatosPersona, rol: DatosAdministrador) =>
  enTransaccion(async (cliente) => {
    await personaExistenteONueva(cliente, persona);
    const fila = await cliente.query<Administrador>(
      `INSERT INTO administrador (identificacion, salario, horario) VALUES ($1, $2, $3)
       RETURNING identificacion, salario, horario`,
      [persona.identificacion, rol.salario, rol.horario]
    );
    return fila.rows[0];
  });

const CONSULTA_ROL = (tabla: string, columnas: string) => `
  SELECT r.${columnas}, p.nombres, p.apellidos, p.correo, p.direccion, p.id_ciudad, c.nombre AS ciudad
  FROM ${tabla} r
    JOIN persona p ON p.identificacion = r.identificacion
    JOIN ciudad  c ON c.id_ciudad = p.id_ciudad
`;

export const listarClientes = () =>
  consultar(CONSULTA_ROL("cliente", "identificacion, puntos, ve_publicidad") + " ORDER BY p.apellidos");
export const listarAgentes = () =>
  consultar(CONSULTA_ROL("agente", "identificacion, comision, experiencia") + " ORDER BY p.apellidos");
export const listarAdministradores = () =>
  consultar(CONSULTA_ROL("administrador", "identificacion, salario, horario") + " ORDER BY p.apellidos");

export async function obtenerCliente(identificacion: string) {
  const fila = await consultarUno(
    CONSULTA_ROL("cliente", "identificacion, puntos, ve_publicidad") + " WHERE r.identificacion = $1",
    [identificacion]
  );
  if (!fila) throw noEncontrado("El cliente");
  return fila;
}

export async function obtenerAgente(identificacion: string) {
  const fila = await consultarUno(
    CONSULTA_ROL("agente", "identificacion, comision, experiencia") + " WHERE r.identificacion = $1",
    [identificacion]
  );
  if (!fila) throw noEncontrado("El agente");
  return fila;
}

export async function obtenerAdministrador(identificacion: string) {
  const fila = await consultarUno(
    CONSULTA_ROL("administrador", "identificacion, salario, horario") + " WHERE r.identificacion = $1",
    [identificacion]
  );
  if (!fila) throw noEncontrado("El administrador");
  return fila;
}

export async function actualizarCliente(identificacion: string, rol: DatosCliente) {
  const fila = await consultarUno<Cliente>(
    `UPDATE cliente SET puntos = $2, ve_publicidad = $3 WHERE identificacion = $1
     RETURNING identificacion, puntos, ve_publicidad`,
    [identificacion, rol.puntos, rol.ve_publicidad]
  );
  if (!fila) throw noEncontrado("El cliente");
  return fila;
}

export async function actualizarAgente(identificacion: string, rol: DatosAgente) {
  const fila = await consultarUno<Agente>(
    `UPDATE agente SET comision = $2, experiencia = $3 WHERE identificacion = $1
     RETURNING identificacion, comision, experiencia`,
    [identificacion, rol.comision, rol.experiencia]
  );
  if (!fila) throw noEncontrado("El agente");
  return fila;
}

export async function actualizarAdministrador(identificacion: string, rol: DatosAdministrador) {
  const fila = await consultarUno<Administrador>(
    `UPDATE administrador SET salario = $2, horario = $3 WHERE identificacion = $1
     RETURNING identificacion, salario, horario`,
    [identificacion, rol.salario, rol.horario]
  );
  if (!fila) throw noEncontrado("El administrador");
  return fila;
}

/** Quita el rol, pero deja la persona: puede seguir siendo cliente aunque deje de ser agente. */
export async function eliminarRol(tabla: "cliente" | "agente" | "administrador", identificacion: string) {
  const borrado = await consultarUno<{ identificacion: string }>(
    `DELETE FROM ${tabla} WHERE identificacion = $1 RETURNING identificacion`,
    [identificacion]
  );
  if (!borrado) throw noEncontrado(`El ${tabla}`);
}
