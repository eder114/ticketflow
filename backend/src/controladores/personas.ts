// Controladores de persona, cliente, agente y administrador.
import { Request, Response } from "express";
import { revisar } from "../middleware/validacion";
import * as personas from "../servicios/personas";

/** Los datos de persona son los mismos en los tres registros, por eso van aparte. */
export function leerDatosDePersona(cuerpo: unknown, conContrasena = true): personas.DatosPersona {
  const revision = revisar(cuerpo)
    .texto("identificacion", "La identificación", { min: 5, max: 20 })
    .texto("nombres", "Los nombres", { min: 2, max: 60 })
    .texto("apellidos", "Los apellidos", { min: 2, max: 60 })
    .correo("correo")
    .texto("direccion", "La dirección", { max: 150, obligatorio: false })
    .entero("id_ciudad", "La ciudad", { min: 1 })
    .listaDeTextos("telefonos", "Los teléfonos", 5);

  if (conContrasena) revision.contrasena();

  return revision.datos<personas.DatosPersona>();
}

// ---------------------------------------------------------------- personas --

export async function listar(_pet: Request, res: Response) {
  res.json(await personas.listarPersonas());
}

export async function obtener(pet: Request, res: Response) {
  res.json(await personas.obtenerPersona(pet.params.identificacion));
}

export async function crear(pet: Request, res: Response) {
  res.status(201).json(await personas.crearPersona(leerDatosDePersona(pet.body)));
}

export async function actualizar(pet: Request, res: Response) {
  const datos = leerDatosDePersona({ ...(pet.body as object), identificacion: pet.params.identificacion }, false);
  res.json(await personas.actualizarPersona(pet.params.identificacion, datos));
}

export async function eliminar(pet: Request, res: Response) {
  await personas.eliminarPersona(pet.params.identificacion);
  res.status(204).send();
}

// ---------------------------------------------------------------- clientes --

export async function listarClientes(_pet: Request, res: Response) {
  res.json(await personas.listarClientes());
}

export async function obtenerCliente(pet: Request, res: Response) {
  res.json(await personas.obtenerCliente(pet.params.identificacion));
}

export async function crearCliente(pet: Request, res: Response) {
  const persona = leerDatosDePersona(pet.body);
  const rol = revisar(pet.body)
    .entero("puntos", "Los puntos", { min: 0, obligatorio: false })
    .booleano("ve_publicidad", true)
    .datos<personas.DatosCliente>();
  res.status(201).json(await personas.crearCliente(persona, { puntos: rol.puntos ?? 0, ve_publicidad: rol.ve_publicidad }));
}

export async function actualizarCliente(pet: Request, res: Response) {
  const rol = revisar(pet.body)
    .entero("puntos", "Los puntos", { min: 0 })
    .booleano("ve_publicidad", true)
    .datos<personas.DatosCliente>();
  res.json(await personas.actualizarCliente(pet.params.identificacion, rol));
}

export async function eliminarCliente(pet: Request, res: Response) {
  await personas.eliminarRol("cliente", pet.params.identificacion);
  res.status(204).send();
}

// ----------------------------------------------------------------- agentes --

export async function listarAgentes(_pet: Request, res: Response) {
  res.json(await personas.listarAgentes());
}

export async function obtenerAgente(pet: Request, res: Response) {
  res.json(await personas.obtenerAgente(pet.params.identificacion));
}

export async function crearAgente(pet: Request, res: Response) {
  const persona = leerDatosDePersona(pet.body);
  const rol = revisar(pet.body)
    .decimal("comision", "La comisión", { min: 0, max: 100 })
    .entero("experiencia", "Los años de experiencia", { min: 0, max: 60 })
    .datos<personas.DatosAgente>();
  res.status(201).json(await personas.crearAgente(persona, rol));
}

export async function actualizarAgente(pet: Request, res: Response) {
  const rol = revisar(pet.body)
    .decimal("comision", "La comisión", { min: 0, max: 100 })
    .entero("experiencia", "Los años de experiencia", { min: 0, max: 60 })
    .datos<personas.DatosAgente>();
  res.json(await personas.actualizarAgente(pet.params.identificacion, rol));
}

export async function eliminarAgente(pet: Request, res: Response) {
  await personas.eliminarRol("agente", pet.params.identificacion);
  res.status(204).send();
}

// ---------------------------------------------------------- administradores --

export async function listarAdministradores(_pet: Request, res: Response) {
  res.json(await personas.listarAdministradores());
}

export async function obtenerAdministrador(pet: Request, res: Response) {
  res.json(await personas.obtenerAdministrador(pet.params.identificacion));
}

export async function crearAdministrador(pet: Request, res: Response) {
  const persona = leerDatosDePersona(pet.body);
  const rol = revisar(pet.body)
    .decimal("salario", "El salario", { min: 1 })
    .texto("horario", "El horario", { max: 60 })
    .datos<personas.DatosAdministrador>();
  res.status(201).json(await personas.crearAdministrador(persona, rol));
}

export async function actualizarAdministrador(pet: Request, res: Response) {
  const rol = revisar(pet.body)
    .decimal("salario", "El salario", { min: 1 })
    .texto("horario", "El horario", { max: 60 })
    .datos<personas.DatosAdministrador>();
  res.json(await personas.actualizarAdministrador(pet.params.identificacion, rol));
}

export async function eliminarAdministrador(pet: Request, res: Response) {
  await personas.eliminarRol("administrador", pet.params.identificacion);
  res.status(204).send();
}
