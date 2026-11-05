// Controladores de la recuperación de contraseña.
import { Request, Response } from "express";
import { revisar } from "../middleware/validacion";
import * as recuperacion from "../servicios/recuperacion";

/** Paso 1: pedir el código. Responde igual exista o no el correo. */
export async function pedir(pet: Request, res: Response) {
  const datos = revisar(pet.body)
    .correo("correo")
    .datos<{ correo: string }>();

  const { destino } = await recuperacion.pedir(datos.correo);

  res.json({
    mensaje: `Si hay una cuenta con ese correo, el código ya va en camino a ${destino}.`,
    destino
  });
}

/** Paso 2: con el código, poner la contraseña nueva. */
export async function cambiar(pet: Request, res: Response) {
  const datos = revisar(pet.body)
    .correo("correo")
    .texto("codigo", "El código", { min: 6, max: 6 })
    .contrasena("contrasena")
    .datos<{ correo: string; codigo: string; contrasena: string }>();

  await recuperacion.cambiar(datos.correo, datos.codigo, datos.contrasena);

  res.json({ mensaje: "La contraseña quedó cambiada. Ya puedes entrar con la nueva." });
}
