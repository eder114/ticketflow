// Controladores de país, departamento y ciudad: leen la petición, llaman al
// servicio y responden. Las reglas viven en el servicio, no aquí.
import { Request, Response } from "express";
import { revisar } from "../middleware/validacion";
import * as ubicacion from "../servicios/ubicacion";

const numero = (valor: unknown) => (valor === undefined ? undefined : Number(valor));

// ------------------------------------------------------------------ países --

export async function listarPaises(_pet: Request, res: Response) {
  res.json(await ubicacion.listarPaises());
}

export async function obtenerPais(pet: Request, res: Response) {
  res.json(await ubicacion.obtenerPais(Number(pet.params.id)));
}

export async function crearPais(pet: Request, res: Response) {
  const { nombre } = revisar(pet.body).texto("nombre", "El nombre del país", { max: 80 }).datos<{ nombre: string }>();
  res.status(201).json(await ubicacion.crearPais(nombre));
}

export async function actualizarPais(pet: Request, res: Response) {
  const { nombre } = revisar(pet.body).texto("nombre", "El nombre del país", { max: 80 }).datos<{ nombre: string }>();
  res.json(await ubicacion.actualizarPais(Number(pet.params.id), nombre));
}

export async function eliminarPais(pet: Request, res: Response) {
  await ubicacion.eliminarPais(Number(pet.params.id));
  res.status(204).send();
}

// ----------------------------------------------------------- departamentos --

export async function listarDepartamentos(pet: Request, res: Response) {
  res.json(await ubicacion.listarDepartamentos(numero(pet.query.pais)));
}

export async function obtenerDepartamento(pet: Request, res: Response) {
  res.json(await ubicacion.obtenerDepartamento(Number(pet.params.id)));
}

export async function crearDepartamento(pet: Request, res: Response) {
  const datos = revisar(pet.body)
    .texto("nombre", "El nombre del departamento", { max: 80 })
    .entero("id_pais", "El país", { min: 1 })
    .datos<{ nombre: string; id_pais: number }>();
  res.status(201).json(await ubicacion.crearDepartamento(datos.nombre, datos.id_pais));
}

export async function actualizarDepartamento(pet: Request, res: Response) {
  const datos = revisar(pet.body)
    .texto("nombre", "El nombre del departamento", { max: 80 })
    .entero("id_pais", "El país", { min: 1 })
    .datos<{ nombre: string; id_pais: number }>();
  res.json(await ubicacion.actualizarDepartamento(Number(pet.params.id), datos.nombre, datos.id_pais));
}

export async function eliminarDepartamento(pet: Request, res: Response) {
  await ubicacion.eliminarDepartamento(Number(pet.params.id));
  res.status(204).send();
}

// ---------------------------------------------------------------- ciudades --

export async function listarCiudades(pet: Request, res: Response) {
  if (pet.query.conUbicacion === "true") {
    res.json(await ubicacion.listarCiudadesConUbicacion());
    return;
  }
  res.json(await ubicacion.listarCiudades(numero(pet.query.departamento)));
}

export async function obtenerCiudad(pet: Request, res: Response) {
  res.json(await ubicacion.obtenerCiudad(Number(pet.params.id)));
}

export async function crearCiudad(pet: Request, res: Response) {
  const datos = revisar(pet.body)
    .texto("nombre", "El nombre de la ciudad", { max: 80 })
    .entero("id_departamento", "El departamento", { min: 1 })
    .datos<{ nombre: string; id_departamento: number }>();
  res.status(201).json(await ubicacion.crearCiudad(datos.nombre, datos.id_departamento));
}

export async function actualizarCiudad(pet: Request, res: Response) {
  const datos = revisar(pet.body)
    .texto("nombre", "El nombre de la ciudad", { max: 80 })
    .entero("id_departamento", "El departamento", { min: 1 })
    .datos<{ nombre: string; id_departamento: number }>();
  res.json(await ubicacion.actualizarCiudad(Number(pet.params.id), datos.nombre, datos.id_departamento));
}

export async function eliminarCiudad(pet: Request, res: Response) {
  await ubicacion.eliminarCiudad(Number(pet.params.id));
  res.status(204).send();
}
