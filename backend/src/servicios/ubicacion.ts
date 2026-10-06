// País, departamento y ciudad. Es lo que alimenta las listas desplegables de
// los formularios de registro y de creación de eventos.
import { consultar, consultarUno } from "../datos/conexion";
import { enConflicto, noEncontrado } from "../middleware/errores";
import { Ciudad, Departamento, Pais } from "../modelos/tipos";

// ------------------------------------------------------------------ países --

export const listarPaises = () =>
  consultar<Pais>("SELECT id_pais, nombre FROM pais ORDER BY nombre");

export async function obtenerPais(id: number): Promise<Pais> {
  const pais = await consultarUno<Pais>(
    "SELECT id_pais, nombre FROM pais WHERE id_pais = $1",
    [id]
  );
  if (!pais) throw noEncontrado("El país");
  return pais;
}

export async function crearPais(nombre: string): Promise<Pais> {
  const fila = await consultarUno<Pais>(
    "INSERT INTO pais (nombre) VALUES ($1) RETURNING id_pais, nombre",
    [nombre]
  );
  return fila!;
}

export async function actualizarPais(id: number, nombre: string): Promise<Pais> {
  const fila = await consultarUno<Pais>(
    "UPDATE pais SET nombre = $2 WHERE id_pais = $1 RETURNING id_pais, nombre",
    [id, nombre]
  );
  if (!fila) throw noEncontrado("El país");
  return fila;
}

export async function eliminarPais(id: number): Promise<void> {
  const hijos = await consultarUno<{ total: string }>(
    "SELECT COUNT(*)::text AS total FROM departamento WHERE id_pais = $1",
    [id]
  );
  if (Number(hijos!.total) > 0) {
    throw enConflicto("No se puede eliminar un país que tiene departamentos.");
  }
  const borrado = await consultarUno<Pais>(
    "DELETE FROM pais WHERE id_pais = $1 RETURNING id_pais, nombre",
    [id]
  );
  if (!borrado) throw noEncontrado("El país");
}

// ----------------------------------------------------------- departamentos --

export const listarDepartamentos = (idPais?: number) =>
  idPais
    ? consultar<Departamento>(
        "SELECT id_departamento, nombre, id_pais FROM departamento WHERE id_pais = $1 ORDER BY nombre",
        [idPais]
      )
    : consultar<Departamento>(
        "SELECT id_departamento, nombre, id_pais FROM departamento ORDER BY nombre"
      );

export async function obtenerDepartamento(id: number): Promise<Departamento> {
  const fila = await consultarUno<Departamento>(
    "SELECT id_departamento, nombre, id_pais FROM departamento WHERE id_departamento = $1",
    [id]
  );
  if (!fila) throw noEncontrado("El departamento");
  return fila;
}

export async function crearDepartamento(nombre: string, idPais: number): Promise<Departamento> {
  await obtenerPais(idPais);
  const fila = await consultarUno<Departamento>(
    `INSERT INTO departamento (nombre, id_pais) VALUES ($1, $2)
     RETURNING id_departamento, nombre, id_pais`,
    [nombre, idPais]
  );
  return fila!;
}

export async function actualizarDepartamento(
  id: number,
  nombre: string,
  idPais: number
): Promise<Departamento> {
  await obtenerPais(idPais);
  const fila = await consultarUno<Departamento>(
    `UPDATE departamento SET nombre = $2, id_pais = $3 WHERE id_departamento = $1
     RETURNING id_departamento, nombre, id_pais`,
    [id, nombre, idPais]
  );
  if (!fila) throw noEncontrado("El departamento");
  return fila;
}

export async function eliminarDepartamento(id: number): Promise<void> {
  const hijos = await consultarUno<{ total: string }>(
    "SELECT COUNT(*)::text AS total FROM ciudad WHERE id_departamento = $1",
    [id]
  );
  if (Number(hijos!.total) > 0) {
    throw enConflicto("No se puede eliminar un departamento que tiene ciudades.");
  }
  const borrado = await consultarUno<Departamento>(
    "DELETE FROM departamento WHERE id_departamento = $1 RETURNING id_departamento, nombre, id_pais",
    [id]
  );
  if (!borrado) throw noEncontrado("El departamento");
}

// ----------------------------------------------------------------- ciudades --

export const listarCiudades = (idDepartamento?: number) =>
  idDepartamento
    ? consultar<Ciudad>(
        "SELECT id_ciudad, nombre, id_departamento FROM ciudad WHERE id_departamento = $1 ORDER BY nombre",
        [idDepartamento]
      )
    : consultar<Ciudad>(
        "SELECT id_ciudad, nombre, id_departamento FROM ciudad ORDER BY nombre"
      );

/** Para las listas desplegables: ciudad, departamento y país en una sola fila. */
export const listarCiudadesConUbicacion = () =>
  consultar<{ id_ciudad: number; ciudad: string; departamento: string; pais: string }>(
    `SELECT c.id_ciudad, c.nombre AS ciudad, d.nombre AS departamento, p.nombre AS pais
     FROM ciudad c
       JOIN departamento d ON d.id_departamento = c.id_departamento
       JOIN pais p ON p.id_pais = d.id_pais
     ORDER BY p.nombre, d.nombre, c.nombre`
  );

export async function obtenerCiudad(id: number): Promise<Ciudad> {
  const fila = await consultarUno<Ciudad>(
    "SELECT id_ciudad, nombre, id_departamento FROM ciudad WHERE id_ciudad = $1",
    [id]
  );
  if (!fila) throw noEncontrado("La ciudad");
  return fila;
}

export async function crearCiudad(nombre: string, idDepartamento: number): Promise<Ciudad> {
  await obtenerDepartamento(idDepartamento);
  const fila = await consultarUno<Ciudad>(
    `INSERT INTO ciudad (nombre, id_departamento) VALUES ($1, $2)
     RETURNING id_ciudad, nombre, id_departamento`,
    [nombre, idDepartamento]
  );
  return fila!;
}

export async function actualizarCiudad(
  id: number,
  nombre: string,
  idDepartamento: number
): Promise<Ciudad> {
  await obtenerDepartamento(idDepartamento);
  const fila = await consultarUno<Ciudad>(
    `UPDATE ciudad SET nombre = $2, id_departamento = $3 WHERE id_ciudad = $1
     RETURNING id_ciudad, nombre, id_departamento`,
    [id, nombre, idDepartamento]
  );
  if (!fila) throw noEncontrado("La ciudad");
  return fila;
}

export async function eliminarCiudad(id: number): Promise<void> {
  const usos = await consultarUno<{ total: string }>(
    `SELECT (
       (SELECT COUNT(*) FROM persona WHERE id_ciudad = $1) +
       (SELECT COUNT(*) FROM evento  WHERE id_ciudad = $1)
     )::text AS total`,
    [id]
  );
  if (Number(usos!.total) > 0) {
    throw enConflicto("No se puede eliminar una ciudad que tiene personas o eventos.");
  }
  const borrado = await consultarUno<Ciudad>(
    "DELETE FROM ciudad WHERE id_ciudad = $1 RETURNING id_ciudad, nombre, id_departamento",
    [id]
  );
  if (!borrado) throw noEncontrado("La ciudad");
}
