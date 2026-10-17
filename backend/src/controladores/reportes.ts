// Controladores de los reportes del administrador.
import { Request, Response } from "express";
import * as reportes from "../servicios/reportes";

const anioDe = (pet: Request) => {
  const anio = Number(pet.query.anio);
  return Number.isInteger(anio) && anio > 2000 ? anio : undefined;
};

export async function general(_pet: Request, res: Response) {
  res.json(await reportes.general());
}

export async function ingresosPorAgente(_pet: Request, res: Response) {
  res.json(await reportes.ingresosPorAgente());
}

export async function ingresosPorCliente(_pet: Request, res: Response) {
  res.json(await reportes.ingresosPorCliente());
}

export async function ingresosPorMes(pet: Request, res: Response) {
  res.json(await reportes.ingresosPorMes(anioDe(pet)));
}

export async function reservasPorEventoYMes(pet: Request, res: Response) {
  res.json(await reportes.reservasPorEventoYMes(anioDe(pet)));
}

export async function eventosPorAgenteYCiudad(_pet: Request, res: Response) {
  res.json(await reportes.eventosPorAgenteYCiudad());
}

export async function eventosPorUbicacion(_pet: Request, res: Response) {
  res.json(await reportes.eventosPorUbicacion());
}

export async function historialDeCliente(pet: Request, res: Response) {
  res.json(await reportes.historialDeCliente(pet.params.identificacion));
}

export async function reservasCanceladas(_pet: Request, res: Response) {
  res.json(await reportes.reservasCanceladas());
}

export async function eventosCancelados(_pet: Request, res: Response) {
  res.json(await reportes.eventosCancelados());
}

export async function tablero(pet: Request, res: Response) {
  res.json(await reportes.tablero(anioDe(pet)));
}
