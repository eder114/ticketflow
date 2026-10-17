// Controladores de eventos: leen la petición, llaman al servicio y responden.
import { Request, Response } from "express";
import { revisar } from "../middleware/validacion";
import { peticionInvalida, sinPermiso } from "../middleware/errores";
import * as eventos from "../servicios/eventos";
import { ESTADOS_EVENTO, EstadoEvento, UsuarioEnSesion } from "../modelos/tipos";

const numero = (valor: unknown) => (valor === undefined ? undefined : Number(valor));
const texto = (valor: unknown) => (valor === undefined ? undefined : String(valor));

export async function listar(pet: Request, res: Response) {
  res.json(
    await eventos.listar({
      ciudad: numero(pet.query.ciudad),
      departamento: numero(pet.query.departamento),
      pais: numero(pet.query.pais),
      estado: texto(pet.query.estado) as EstadoEvento | undefined,
      agente: texto(pet.query.agente),
      texto: texto(pet.query.texto),
      desde: texto(pet.query.desde),
      hasta: texto(pet.query.hasta),
      soloConCupos: pet.query.conCupos === "true"
    })
  );
}

/** Los eventos del agente que tiene la sesión abierta. */
export async function listarMios(pet: Request, res: Response) {
  const usuario = pet.usuario as UsuarioEnSesion;
  res.json(
    await eventos.listar(
      usuario.perfil === "agente" ? { agente: usuario.identificacion } : {}
    )
  );
}

export async function obtener(pet: Request, res: Response) {
  res.json(await eventos.obtener(Number(pet.params.codigo)));
}

function leerDatos(pet: Request) {
  const datos = revisar(pet.body)
    .texto("nombre", "El nombre del evento", { max: 120 })
    .texto("descripcion", "La descripción", { max: 2000, obligatorio: false })
    .texto("teatro", "El teatro o escenario", { max: 120 })
    .fecha("fecha_hora_inicio", "La fecha de inicio")
    .fecha("fecha_hora_fin", "La fecha de finalización")
    .entero("capacidad_total", "La capacidad", { min: 1, max: 500000 })
    .decimal("precio_base", "El precio base", { min: 0 })
    .texto("observaciones", "Las observaciones", { max: 2000, obligatorio: false })
    .entero("id_ciudad", "La ciudad", { min: 1 })
    .datos<eventos.DatosEvento>();

  if (new Date(datos.fecha_hora_fin) <= new Date(datos.fecha_hora_inicio)) {
    throw peticionInvalida("Hay datos que no son válidos.", {
      fecha_hora_fin: "La finalización tiene que ser después del inicio."
    });
  }
  return datos;
}

/** El agente registra a su nombre; el administrador puede registrar a nombre de otro. */
function agenteDe(pet: Request): string {
  const usuario = pet.usuario as UsuarioEnSesion;
  if (usuario.perfil === "agente") return usuario.identificacion;
  const { identificacion_agente } = revisar(pet.body)
    .texto("identificacion_agente", "El agente responsable", { max: 20 })
    .datos<{ identificacion_agente: string }>();
  return identificacion_agente;
}

export async function crear(pet: Request, res: Response) {
  const datos = leerDatos(pet);
  datos.identificacion_agente = agenteDe(pet);
  res.status(201).json(await eventos.crear(datos));
}

export async function actualizar(pet: Request, res: Response) {
  const datos = leerDatos(pet);
  datos.identificacion_agente = agenteDe(pet);
  res.json(await eventos.actualizar(Number(pet.params.codigo), datos, pet.usuario as UsuarioEnSesion));
}

export async function cambiarEstado(pet: Request, res: Response) {
  const datos = revisar(pet.body)
    .unoDe("estado", "El estado", ESTADOS_EVENTO)
    .texto("causa_cancelacion", "La causa de la cancelación", { max: 500, obligatorio: false })
    .datos<{ estado: EstadoEvento; causa_cancelacion: string | null }>();

  res.json(
    await eventos.cambiarEstado(
      Number(pet.params.codigo),
      datos.estado,
      datos.causa_cancelacion,
      pet.usuario as UsuarioEnSesion
    )
  );
}

export async function eliminar(pet: Request, res: Response) {
  const usuario = pet.usuario as UsuarioEnSesion;
  if (usuario.perfil !== "administrador") throw sinPermiso();
  await eventos.eliminar(Number(pet.params.codigo));
  res.status(204).send();
}
