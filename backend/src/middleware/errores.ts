// Un solo lugar para los errores: todas las respuestas salen con la misma
// forma y ningún detalle interno de la base de datos llega al navegador.
import { NextFunction, Request, Response } from "express";

export class ErrorApi extends Error {
  constructor(
    public readonly codigo: number,
    mensaje: string,
    public readonly detalles?: Record<string, string>
  ) {
    super(mensaje);
  }
}

export const noEncontrado = (que: string) => new ErrorApi(404, `${que} no existe.`);
export const peticionInvalida = (mensaje: string, detalles?: Record<string, string>) =>
  new ErrorApi(400, mensaje, detalles);
export const sinSesion = () => new ErrorApi(401, "Hay que iniciar sesión.");
export const sinPermiso = () => new ErrorApi(403, "No tiene permiso para hacer esto.");
export const enConflicto = (mensaje: string) => new ErrorApi(409, mensaje);

// Envuelve los controladores para no repetir try/catch en cada uno.
export function atrapar(
  manejador: (pet: Request, res: Response, sig: NextFunction) => Promise<unknown>
) {
  return (pet: Request, res: Response, sig: NextFunction) => {
    manejador(pet, res, sig).catch(sig);
  };
}

export function rutaNoEncontrada(pet: Request, _res: Response, sig: NextFunction) {
  sig(new ErrorApi(404, `La ruta ${pet.method} ${pet.path} no existe.`));
}

// Códigos de PostgreSQL que sí sabemos traducir a algo que el usuario entienda.
const POSTGRES: Record<string, { codigo: number; mensaje: string }> = {
  "23505": { codigo: 409, mensaje: "Ese dato ya está registrado." },
  "23503": { codigo: 409, mensaje: "El registro está relacionado con otros y no se puede usar así." },
  "23514": { codigo: 400, mensaje: "Alguno de los datos no cumple las reglas del sistema." },
  "23502": { codigo: 400, mensaje: "Falta un dato obligatorio." },
  "22P02": { codigo: 400, mensaje: "Alguno de los datos tiene un formato que no corresponde." }
};

export function manejadorDeErrores(
  error: unknown,
  _pet: Request,
  res: Response,
  _sig: NextFunction
) {
  if (error instanceof ErrorApi) {
    res.status(error.codigo).json({ error: error.message, detalles: error.detalles });
    return;
  }

  const codigoPg = (error as { code?: string }).code;
  if (codigoPg && POSTGRES[codigoPg]) {
    const { codigo, mensaje } = POSTGRES[codigoPg];
    res.status(codigo).json({ error: mensaje });
    return;
  }

  // Cualquier otra cosa queda en el log del servidor, no en la respuesta.
  console.error("Error no controlado:", error);
  res.status(500).json({ error: "Ocurrió un error en el servidor." });
}
