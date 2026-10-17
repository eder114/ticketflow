// Controladores de reservas.
import { Request, Response } from "express";
import { revisar } from "../middleware/validacion";
import { sinPermiso } from "../middleware/errores";
import * as reservas from "../servicios/reservas";
import { ESTADOS_RESERVA, EstadoReserva, UsuarioEnSesion } from "../modelos/tipos";

const numero = (valor: unknown) => (valor === undefined ? undefined : Number(valor));
const texto = (valor: unknown) => (valor === undefined ? undefined : String(valor));

export async function listar(pet: Request, res: Response) {
  res.json(
    await reservas.listarSegunPerfil(pet.usuario as UsuarioEnSesion, {
      evento: numero(pet.query.evento),
      cliente: texto(pet.query.cliente),
      estado: texto(pet.query.estado) as EstadoReserva | undefined
    })
  );
}

export async function obtener(pet: Request, res: Response) {
  res.json(await reservas.obtenerConPermiso(Number(pet.params.id), pet.usuario as UsuarioEnSesion));
}

/** Reservar es cosa del cliente: es quien queda como dueño de la reserva. */
export async function crear(pet: Request, res: Response) {
  const usuario = pet.usuario as UsuarioEnSesion;
  if (usuario.perfil !== "cliente") throw sinPermiso();

  const datos = revisar(pet.body)
    .entero("codigo_evento", "El evento", { min: 1 })
    .entero("numero_entradas", "El número de entradas", { min: 1, max: 10 })
    .texto("observaciones", "Las observaciones", { max: 500, obligatorio: false })
    .datos<{ codigo_evento: number; numero_entradas: number; observaciones: string | null }>();

  res.status(201).json(
    await reservas.crear({ ...datos, identificacion_cliente: usuario.identificacion })
  );
}

export async function cambiarEstado(pet: Request, res: Response) {
  const datos = revisar(pet.body)
    .unoDe("estado", "El estado", ESTADOS_RESERVA)
    .texto("causa_cancelacion", "La causa de la cancelación", { max: 500, obligatorio: false })
    .datos<{ estado: EstadoReserva; causa_cancelacion: string | null }>();

  res.json(
    await reservas.cambiarEstado(
      Number(pet.params.id),
      datos.estado,
      datos.causa_cancelacion,
      pet.usuario as UsuarioEnSesion
    )
  );
}

export async function eliminar(pet: Request, res: Response) {
  await reservas.eliminar(Number(pet.params.id));
  res.status(204).send();
}
