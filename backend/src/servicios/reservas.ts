// Reservas. Aquí vive la regla más importante del sistema: nunca se venden
// más entradas que la capacidad del evento.
import { consultar, consultarUno, enTransaccion } from "../datos/conexion";
import { enConflicto, noEncontrado, peticionInvalida, sinPermiso } from "../middleware/errores";
import { EstadoReserva, Reserva, ReservaCompleta, UsuarioEnSesion } from "../modelos/tipos";

/** Un evento solo recibe reservas mientras no haya empezado ni se haya cancelado. */
const ESTADOS_QUE_ACEPTAN_RESERVAS = ["Programado", "En Boleteria"];

export interface FiltrosReserva {
  evento?: number;
  cliente?: string;
  agente?: string;
  estado?: EstadoReserva;
}

export function listar(filtros: FiltrosReserva = {}): Promise<ReservaCompleta[]> {
  const condiciones: string[] = [];
  const valores: unknown[] = [];
  const marcador = (valor: unknown) => {
    valores.push(valor);
    return `$${valores.length}`;
  };

  if (filtros.evento) condiciones.push(`codigo_evento = ${marcador(filtros.evento)}`);
  if (filtros.cliente) condiciones.push(`identificacion_cliente = ${marcador(filtros.cliente)}`);
  if (filtros.agente) condiciones.push(`identificacion_agente = ${marcador(filtros.agente)}`);
  if (filtros.estado) condiciones.push(`estado = ${marcador(filtros.estado)}`);

  const donde = condiciones.join(" AND ");
  return consultar<ReservaCompleta>(
    `SELECT * FROM vista_reserva ${donde ? "WHERE " + donde : ""} ORDER BY fecha_hora DESC`,
    valores
  );
}

/** Cada perfil ve lo suyo: el cliente sus reservas, el agente las de sus eventos. */
export function listarSegunPerfil(
  usuario: UsuarioEnSesion,
  filtros: FiltrosReserva = {}
): Promise<ReservaCompleta[]> {
  if (usuario.perfil === "cliente") {
    return listar({ ...filtros, cliente: usuario.identificacion, agente: undefined });
  }
  if (usuario.perfil === "agente") {
    return listar({ ...filtros, agente: usuario.identificacion });
  }
  return listar(filtros);
}

export async function obtener(id: number): Promise<ReservaCompleta> {
  const fila = await consultarUno<ReservaCompleta>(
    "SELECT * FROM vista_reserva WHERE id_reserva = $1",
    [id]
  );
  if (!fila) throw noEncontrado("La reserva");
  return fila;
}

/** El cliente ve la suya, el agente las de sus eventos, el administrador todas. */
function revisarAcceso(reserva: ReservaCompleta, usuario: UsuarioEnSesion) {
  if (usuario.perfil === "administrador") return;
  if (usuario.perfil === "cliente" && reserva.identificacion_cliente === usuario.identificacion) return;
  if (usuario.perfil === "agente" && reserva.identificacion_agente === usuario.identificacion) return;
  throw sinPermiso();
}

export async function obtenerConPermiso(id: number, usuario: UsuarioEnSesion): Promise<ReservaCompleta> {
  const reserva = await obtener(id);
  revisarAcceso(reserva, usuario);
  return reserva;
}

/**
 * Crea la reserva dentro de una transacción. El evento se bloquea mientras se
 * cuenta el cupo, para que dos personas que reserven al tiempo no se lleven
 * las mismas entradas.
 */
export async function crear(datos: {
  codigo_evento: number;
  numero_entradas: number;
  observaciones: string | null;
  identificacion_cliente: string;
}): Promise<ReservaCompleta> {
  const id = await enTransaccion(async (cliente) => {
    const evento = await cliente.query<{
      capacidad_total: number;
      estado: string;
      fecha_hora_inicio: string;
    }>(
      `SELECT capacidad_total, estado, fecha_hora_inicio
       FROM evento WHERE codigo_evento = $1 FOR UPDATE`,
      [datos.codigo_evento]
    );
    if (evento.rowCount === 0) throw noEncontrado("El evento");
    const { capacidad_total, estado, fecha_hora_inicio } = evento.rows[0];

    if (!ESTADOS_QUE_ACEPTAN_RESERVAS.includes(estado)) {
      throw enConflicto(`El evento está en estado ${estado} y ya no recibe reservas.`);
    }
    if (new Date(fecha_hora_inicio).getTime() < Date.now()) {
      throw enConflicto("El evento ya empezó y no recibe más reservas.");
    }

    const ocupadas = await cliente.query<{ total: string }>(
      `SELECT COALESCE(SUM(numero_entradas), 0)::text AS total
       FROM reserva WHERE codigo_evento = $1 AND estado IN ('Reservada', 'Confirmada')`,
      [datos.codigo_evento]
    );
    const disponibles = capacidad_total - Number(ocupadas.rows[0].total);
    if (datos.numero_entradas > disponibles) {
      throw enConflicto(
        disponibles > 0
          ? `Solo quedan ${disponibles} entradas disponibles para este evento.`
          : "Este evento ya no tiene cupos disponibles."
      );
    }

    const creada = await cliente.query<{ id_reserva: number }>(
      `INSERT INTO reserva (numero_entradas, observaciones, identificacion_cliente, codigo_evento)
       VALUES ($1, $2, $3, $4) RETURNING id_reserva`,
      [datos.numero_entradas, datos.observaciones, datos.identificacion_cliente, datos.codigo_evento]
    );
    return creada.rows[0].id_reserva;
  });

  return obtener(id);
}

/**
 * Confirmar vuelve a comprobar el cupo: entre que se reservó y se confirma
 * pudieron cambiar la capacidad del evento. Cancelar siempre pide causa,
 * porque el enunciado pide reportar las reservas canceladas y por qué.
 */
export async function cambiarEstado(
  id: number,
  estado: EstadoReserva,
  causa: string | null,
  usuario: UsuarioEnSesion
): Promise<ReservaCompleta> {
  const reserva = await obtener(id);
  revisarAcceso(reserva, usuario);

  // El cliente solo puede cancelar lo suyo; confirmar es del agente o del administrador.
  if (usuario.perfil === "cliente" && estado !== "Cancelada") {
    throw sinPermiso();
  }
  if (estado === "Cancelada" && !causa) {
    throw peticionInvalida("Hay datos que no son válidos.", {
      causa_cancelacion: "Hay que decir por qué se cancela la reserva."
    });
  }
  if (reserva.estado === estado) return reserva;
  if (reserva.estado === "Cancelada") {
    throw enConflicto("La reserva ya está cancelada y no se puede volver a cambiar.");
  }

  await enTransaccion(async (cliente) => {
    if (estado === "Confirmada") {
      const evento = await cliente.query<{ capacidad_total: number }>(
        "SELECT capacidad_total FROM evento WHERE codigo_evento = $1 FOR UPDATE",
        [reserva.codigo_evento]
      );
      const ocupadas = await cliente.query<{ total: string }>(
        `SELECT COALESCE(SUM(numero_entradas), 0)::text AS total
         FROM reserva
         WHERE codigo_evento = $1 AND estado IN ('Reservada', 'Confirmada') AND id_reserva <> $2`,
        [reserva.codigo_evento, id]
      );
      const disponibles = evento.rows[0].capacidad_total - Number(ocupadas.rows[0].total);
      if (reserva.numero_entradas > disponibles) {
        throw enConflicto("Ya no hay cupos suficientes para confirmar esta reserva.");
      }
      // Los puntos del cliente: uno por entrada confirmada.
      await cliente.query(
        "UPDATE cliente SET puntos = puntos + $2 WHERE identificacion = $1",
        [reserva.identificacion_cliente, reserva.numero_entradas]
      );
    }

    await cliente.query(
      "UPDATE reserva SET estado = $2, causa_cancelacion = $3 WHERE id_reserva = $1",
      [id, estado, estado === "Cancelada" ? causa : null]
    );
  });

  return obtener(id);
}

export async function eliminar(id: number): Promise<void> {
  const borrada = await consultarUno<Reserva>(
    "DELETE FROM reserva WHERE id_reserva = $1 RETURNING id_reserva",
    [id]
  );
  if (!borrada) throw noEncontrado("La reserva");
}
