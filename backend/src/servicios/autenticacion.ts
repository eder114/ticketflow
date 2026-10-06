// Autenticación: registro, inicio de sesión y el token que identifica al
// usuario mientras navega.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { entorno } from "../configuracion/entorno";
import { ErrorApi } from "../middleware/errores";
import { Perfil, UsuarioEnSesion } from "../modelos/tipos";
import {
  DatosAgente,
  DatosCliente,
  DatosPersona,
  buscarPorCorreo,
  crearAgente,
  crearCliente,
  perfilesDe
} from "./personas";

export interface SesionIniciada {
  token: string;
  usuario: UsuarioEnSesion;
  expiraEn: string;
}

function firmar(usuario: UsuarioEnSesion): SesionIniciada {
  const expiraEn = new Date(Date.now() + entorno.jwt.horas * 3600 * 1000).toISOString();
  const token = jwt.sign(usuario, entorno.jwt.secreto, { expiresIn: `${entorno.jwt.horas}h` });
  return { token, usuario, expiraEn };
}

/**
 * El mensaje es el mismo si el correo no existe o si la contraseña está mal.
 * Decir cuál de los dos falló le serviría a alguien que esté probando correos
 * para saber cuáles están registrados.
 */
export async function iniciarSesion(correo: string, contrasena: string): Promise<SesionIniciada> {
  const credencialesInvalidas = new ErrorApi(401, "El correo o la contraseña no son correctos.");

  const persona = await buscarPorCorreo(correo);
  if (!persona) throw credencialesInvalidas;

  const coincide = await bcrypt.compare(contrasena, persona.contrasena);
  if (!coincide) throw credencialesInvalidas;

  const perfiles = await perfilesDe(persona.identificacion);
  if (perfiles.length === 0) {
    throw new ErrorApi(403, "La cuenta no tiene ningún perfil asignado.");
  }

  // Si alguien tiene varios perfiles entra con el de mayor alcance.
  const orden: Perfil[] = ["administrador", "agente", "cliente"];
  const perfil = orden.find((p) => perfiles.includes(p))!;

  return firmar({
    identificacion: persona.identificacion,
    nombre: `${persona.nombres} ${persona.apellidos}`,
    correo: persona.correo,
    perfil
  });
}

export async function registrarCliente(
  persona: DatosPersona,
  rol: DatosCliente
): Promise<SesionIniciada> {
  await crearCliente(persona, rol);
  return iniciarSesion(persona.correo, persona.contrasena);
}

export async function registrarAgente(
  persona: DatosPersona,
  rol: DatosAgente
): Promise<SesionIniciada> {
  await crearAgente(persona, rol);
  return iniciarSesion(persona.correo, persona.contrasena);
}

export function leerToken(token: string): UsuarioEnSesion {
  try {
    const datos = jwt.verify(token, entorno.jwt.secreto) as jwt.JwtPayload & UsuarioEnSesion;
    return {
      identificacion: datos.identificacion,
      nombre: datos.nombre,
      correo: datos.correo,
      perfil: datos.perfil
    };
  } catch {
    throw new ErrorApi(401, "La sesión expiró o el token no es válido.");
  }
}
