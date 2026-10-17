// Eventos: el catálogo que ve el cliente y la gestión que hace el agente.
// Las consultas de lectura salen de vista_evento, que ya trae la ubicación
// completa y los cupos disponibles.
import { consultar, consultarUno, enTransaccion } from "../datos/conexion";
import { enConflicto, noEncontrado, peticionInvalida, sinPermiso } from "../middleware/errores";
import { Evento, EventoCompleto, EstadoEvento, UsuarioEnSesion } from "../modelos/tipos";

export interface FiltrosEvento {
  ciudad?: number;
  departamento?: number;
  pais?: number;
  estado?: EstadoEvento;
  agente?: string;
  texto?: string;
  desde?: string;
  hasta?: string;
  soloConCupos?: boolean;
}

export interface DatosEvento {
  nombre: string;
  descripcion: string | null;
  teatro: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  capacidad_total: number;
  precio_base: number;
  observaciones: string | null;
  id_ciudad: number;
  identificacion_agente: string;
}

/** Catálogo con filtros. Cada filtro que llega agrega una condición. */
export function listar(filtros: FiltrosEvento = {}): Promise<EventoCompleto[]> {
  const condiciones: string[] = [];
  const valores: unknown[] = [];
  // Guarda el valor y devuelve su marcador ($1, $2, …): nunca se pega el valor
  // dentro del texto de la consulta.
  const marcador = (valor: unknown) => {
    valores.push(valor);
    return `$${valores.length}`;
  };

  if (filtros.ciudad) condiciones.push(`id_ciudad = ${marcador(filtros.ciudad)}`);
  if (filtros.departamento) condiciones.push(`id_departamento = ${marcador(filtros.departamento)}`);
  if (filtros.pais) condiciones.push(`id_pais = ${marcador(filtros.pais)}`);
  if (filtros.estado) condiciones.push(`estado = ${marcador(filtros.estado)}`);
  if (filtros.agente) condiciones.push(`identificacion_agente = ${marcador(filtros.agente)}`);
  if (filtros.texto) {
    const m = marcador(`%${filtros.texto}%`);
    condiciones.push(`(nombre ILIKE ${m} OR teatro ILIKE ${m})`);
  }
  if (filtros.desde) condiciones.push(`fecha_hora_inicio >= ${marcador(filtros.desde)}`);
  if (filtros.hasta) condiciones.push(`fecha_hora_inicio <= ${marcador(filtros.hasta)}`);
  if (filtros.soloConCupos) condiciones.push("cupos_disponibles > 0");

  const donde = condiciones.join(" AND ");

  return consultar<EventoCompleto>(
    `SELECT * FROM vista_evento ${donde ? "WHERE " + donde : ""} ORDER BY fecha_hora_inicio`,
    valores
  );
}

export async function obtener(codigo: number): Promise<EventoCompleto> {
  const fila = await consultarUno<EventoCompleto>(
    "SELECT * FROM vista_evento WHERE codigo_evento = $1",
    [codigo]
  );
  if (!fila) throw noEncontrado("El evento");
  return fila;
}

/** El agente solo puede tocar sus propios eventos; el administrador, todos. */
function revisarDuenio(evento: { identificacion_agente: string }, usuario: UsuarioEnSesion) {
  if (usuario.perfil === "administrador") return;
  if (evento.identificacion_agente !== usuario.identificacion) throw sinPermiso();
}

export async function crear(datos: DatosEvento): Promise<EventoCompleto> {
  const fila = await consultarUno<Evento>(
    `INSERT INTO evento
       (nombre, descripcion, teatro, fecha_hora_inicio, fecha_hora_fin,
        capacidad_total, precio_base, observaciones, id_ciudad, identificacion_agente)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING codigo_evento`,
    [
      datos.nombre, datos.descripcion, datos.teatro, datos.fecha_hora_inicio,
      datos.fecha_hora_fin, datos.capacidad_total, datos.precio_base,
      datos.observaciones, datos.id_ciudad, datos.identificacion_agente
    ]
  );
  return obtener(fila!.codigo_evento);
}

export async function actualizar(
  codigo: number,
  datos: DatosEvento,
  usuario: UsuarioEnSesion
): Promise<EventoCompleto> {
  const actual = await obtener(codigo);
  revisarDuenio(actual, usuario);

  // No se puede dejar la capacidad por debajo de lo ya reservado.
  const ocupadas = await entradasOcupadas(codigo);
  if (datos.capacidad_total < ocupadas) {
    throw enConflicto(
      `La capacidad no puede quedar por debajo de las ${ocupadas} entradas ya reservadas.`
    );
  }

  await consultar(
    `UPDATE evento SET
       nombre = $2, descripcion = $3, teatro = $4, fecha_hora_inicio = $5,
       fecha_hora_fin = $6, capacidad_total = $7, precio_base = $8,
       observaciones = $9, id_ciudad = $10, identificacion_agente = $11
     WHERE codigo_evento = $1`,
    [
      codigo, datos.nombre, datos.descripcion, datos.teatro, datos.fecha_hora_inicio,
      datos.fecha_hora_fin, datos.capacidad_total, datos.precio_base,
      datos.observaciones, datos.id_ciudad, datos.identificacion_agente
    ]
  );
  return obtener(codigo);
}

/** Entradas que ya están ocupando cupo: reservadas y confirmadas. */
export async function entradasOcupadas(codigo: number): Promise<number> {
  const fila = await consultarUno<{ total: string }>(
    `SELECT COALESCE(SUM(numero_entradas), 0)::text AS total
     FROM reserva WHERE codigo_evento = $1 AND estado IN ('Reservada', 'Confirmada')`,
    [codigo]
  );
  return Number(fila!.total);
}

/**
 * Cambia el estado del evento. Cancelar exige causa, y arrastra las reservas:
 * si el evento no se hace, las reservas tampoco quedan en pie.
 */
export async function cambiarEstado(
  codigo: number,
  estado: EstadoEvento,
  causa: string | null,
  usuario: UsuarioEnSesion
): Promise<EventoCompleto> {
  const actual = await obtener(codigo);
  revisarDuenio(actual, usuario);

  if (estado === "Cancelado" && !causa) {
    throw peticionInvalida("Hay datos que no son válidos.", {
      causa_cancelacion: "Hay que decir por qué se cancela el evento."
    });
  }

  await enTransaccion(async (cliente) => {
    await cliente.query(
      "UPDATE evento SET estado = $2, causa_cancelacion = $3 WHERE codigo_evento = $1",
      [codigo, estado, estado === "Cancelado" ? causa : null]
    );
    if (estado === "Cancelado") {
      await cliente.query(
        `UPDATE reserva
         SET estado = 'Cancelada',
             causa_cancelacion = $2
         WHERE codigo_evento = $1 AND estado <> 'Cancelada'`,
        [codigo, `El evento fue cancelado: ${causa}`]
      );
    }
  });

  return obtener(codigo);
}

export async function eliminar(codigo: number): Promise<void> {
  const reservas = await consultarUno<{ total: string }>(
    "SELECT COUNT(*)::text AS total FROM reserva WHERE codigo_evento = $1",
    [codigo]
  );
  if (Number(reservas!.total) > 0) {
    throw enConflicto(
      "No se puede eliminar un evento que ya tiene reservas. Lo que se hace en ese caso es cancelarlo."
    );
  }
  const borrado = await consultarUno<Evento>(
    "DELETE FROM evento WHERE codigo_evento = $1 RETURNING codigo_evento",
    [codigo]
  );
  if (!borrado) throw noEncontrado("El evento");
}
