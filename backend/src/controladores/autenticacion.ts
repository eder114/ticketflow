// Registro, inicio de sesión y consulta de la sesión actual.
import { Request, Response } from "express";
import { revisar } from "../middleware/validacion";
import { sinSesion } from "../middleware/errores";
import * as auth from "../servicios/autenticacion";
import { DatosAgente, DatosCliente } from "../servicios/personas";
import { leerDatosDePersona } from "./personas";

export async function iniciarSesion(pet: Request, res: Response) {
  const datos = revisar(pet.body)
    .correo("correo")
    .texto("contrasena", "La contraseña", { min: 1, max: 100 })
    .datos<{ correo: string; contrasena: string }>();

  res.json(await auth.iniciarSesion(datos.correo, datos.contrasena));
}

export async function registrarCliente(pet: Request, res: Response) {
  const persona = leerDatosDePersona(pet.body);
  const rol = revisar(pet.body).booleano("ve_publicidad", true).datos<{ ve_publicidad: boolean }>();
  const sesion = await auth.registrarCliente(persona, { puntos: 0, ve_publicidad: rol.ve_publicidad } as DatosCliente);
  res.status(201).json(sesion);
}

export async function registrarAgente(pet: Request, res: Response) {
  const persona = leerDatosDePersona(pet.body);
  const rol = revisar(pet.body)
    .decimal("comision", "La comisión", { min: 0, max: 100, obligatorio: false })
    .entero("experiencia", "Los años de experiencia", { min: 0, max: 60, obligatorio: false })
    .datos<Partial<DatosAgente>>();

  const sesion = await auth.registrarAgente(persona, {
    comision: rol.comision ?? 0,
    experiencia: rol.experiencia ?? 0
  });
  res.status(201).json(sesion);
}

/** El frontend la usa al cargar para saber si el token guardado sigue sirviendo. */
export async function sesionActual(pet: Request, res: Response) {
  if (!pet.usuario) throw sinSesion();
  res.json({ usuario: pet.usuario });
}
