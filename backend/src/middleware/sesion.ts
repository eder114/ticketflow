// Quién está pidiendo y si puede pedirlo.
import { NextFunction, Request, Response } from "express";
import { sinPermiso, sinSesion } from "./errores";
import { Perfil, UsuarioEnSesion } from "../modelos/tipos";
import { leerToken } from "../servicios/autenticacion";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: UsuarioEnSesion;
    }
  }
}

function tokenDe(pet: Request): string | null {
  const cabecera = pet.header("Authorization");
  if (!cabecera || !cabecera.startsWith("Bearer ")) return null;
  return cabecera.slice(7).trim() || null;
}

/** Exige sesión iniciada. */
export function conSesion(pet: Request, _res: Response, sig: NextFunction) {
  const token = tokenDe(pet);
  if (!token) return sig(sinSesion());
  try {
    pet.usuario = leerToken(token);
    sig();
  } catch (error) {
    sig(error);
  }
}

/** Exige sesión iniciada y uno de los perfiles indicados. */
export function conPerfil(...permitidos: Perfil[]) {
  return (pet: Request, res: Response, sig: NextFunction) => {
    conSesion(pet, res, (error?: unknown) => {
      if (error) return sig(error);
      if (!pet.usuario || !permitidos.includes(pet.usuario.perfil)) return sig(sinPermiso());
      sig();
    });
  };
}

/** Lee la sesión si viene, pero no la exige. Para las pantallas públicas. */
export function sesionOpcional(pet: Request, _res: Response, sig: NextFunction) {
  const token = tokenDe(pet);
  if (token) {
    try {
      pet.usuario = leerToken(token);
    } catch {
      // Un token vencido en una ruta pública no es un error: se ignora.
    }
  }
  sig();
}
