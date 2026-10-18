// Los reportes que pide el enunciado, agrupados como allí aparecen:
// registros del sistema, comerciales, cobertura y operación.
import { consultar, consultarUno } from "../datos/conexion";

const ANIO_POR_DEFECTO = 2026;

// Los meses se nombran aqui y no con TO_CHAR, porque TO_CHAR los escribe en el
// idioma que tenga configurado el servidor y la base publicada responde en
// ingles.
const NOMBRE_DEL_MES =
  `(ARRAY['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
          'septiembre','octubre','noviembre','diciembre'])[mes]`;

// ------------------------------------------- 1. reporte general de registros --

export interface ReporteGeneral {
  clientes: number;
  agentes: number;
  administradores: number;
  eventos: number;
  reservas: number;
  entradas_confirmadas: number;
  ingresos_confirmados: number;
}

export async function general(): Promise<ReporteGeneral> {
  const fila = await consultarUno<Record<string, string>>(
    `SELECT
       (SELECT COUNT(*) FROM cliente)        AS clientes,
       (SELECT COUNT(*) FROM agente)         AS agentes,
       (SELECT COUNT(*) FROM administrador)  AS administradores,
       (SELECT COUNT(*) FROM evento)         AS eventos,
       (SELECT COUNT(*) FROM reserva)        AS reservas,
       (SELECT COALESCE(SUM(numero_entradas), 0) FROM reserva WHERE estado = 'Confirmada')
         AS entradas_confirmadas,
       (SELECT COALESCE(SUM(valor_total), 0) FROM vista_reserva WHERE estado = 'Confirmada')
         AS ingresos_confirmados`
  );
  return {
    clientes: Number(fila!.clientes),
    agentes: Number(fila!.agentes),
    administradores: Number(fila!.administradores),
    eventos: Number(fila!.eventos),
    reservas: Number(fila!.reservas),
    entradas_confirmadas: Number(fila!.entradas_confirmadas),
    ingresos_confirmados: Number(fila!.ingresos_confirmados)
  };
}

// ------------------------------------------------------ 2. reportes comerciales --

/** Promedio de ingresos por agente: cuánto deja en promedio cada evento suyo. */
export const ingresosPorAgente = () =>
  consultar<{
    identificacion: string;
    agente: string;
    eventos: string;
    reservas_confirmadas: string;
    ingresos: string;
    promedio_por_evento: string;
    comision_estimada: string;
  }>(
    `SELECT
       a.identificacion,
       p.nombres || ' ' || p.apellidos AS agente,
       COUNT(DISTINCT e.codigo_evento)::text AS eventos,
       COUNT(r.id_reserva) FILTER (WHERE r.estado = 'Confirmada')::text AS reservas_confirmadas,
       COALESCE(SUM(r.valor_total) FILTER (WHERE r.estado = 'Confirmada'), 0)::text AS ingresos,
       ROUND(
         COALESCE(SUM(r.valor_total) FILTER (WHERE r.estado = 'Confirmada'), 0)
         / NULLIF(COUNT(DISTINCT e.codigo_evento), 0), 2
       )::text AS promedio_por_evento,
       ROUND(
         COALESCE(SUM(r.valor_total) FILTER (WHERE r.estado = 'Confirmada'), 0) * a.comision / 100, 2
       )::text AS comision_estimada
     FROM agente a
       JOIN persona p ON p.identificacion = a.identificacion
       LEFT JOIN evento e ON e.identificacion_agente = a.identificacion
       LEFT JOIN vista_reserva r ON r.codigo_evento = e.codigo_evento
     GROUP BY a.identificacion, a.comision, p.nombres, p.apellidos
     ORDER BY 5 DESC`
  );

/** Promedio de ingresos por cliente: cuánto gasta en promedio por reserva. */
export const ingresosPorCliente = () =>
  consultar<{
    identificacion: string;
    cliente: string;
    reservas: string;
    entradas: string;
    total_gastado: string;
    promedio_por_reserva: string;
    puntos: string;
  }>(
    `SELECT
       c.identificacion,
       p.nombres || ' ' || p.apellidos AS cliente,
       COUNT(r.id_reserva) FILTER (WHERE r.estado = 'Confirmada')::text AS reservas,
       COALESCE(SUM(r.numero_entradas) FILTER (WHERE r.estado = 'Confirmada'), 0)::text AS entradas,
       COALESCE(SUM(r.valor_total) FILTER (WHERE r.estado = 'Confirmada'), 0)::text AS total_gastado,
       ROUND(
         COALESCE(AVG(r.valor_total) FILTER (WHERE r.estado = 'Confirmada'), 0), 2
       )::text AS promedio_por_reserva,
       c.puntos::text
     FROM cliente c
       JOIN persona p ON p.identificacion = c.identificacion
       LEFT JOIN vista_reserva r ON r.identificacion_cliente = c.identificacion
     GROUP BY c.identificacion, c.puntos, p.nombres, p.apellidos
     ORDER BY 5 DESC`
  );

/** Ingresos totales de todos los eventos, mes a mes, para el año que se pida. */
export const ingresosPorMes = (anio = ANIO_POR_DEFECTO) =>
  consultar<{ mes: string; nombre_mes: string; reservas: string; entradas: string; ingresos: string }>(
    `SELECT
       mes::text,
       ${NOMBRE_DEL_MES} AS nombre_mes,
       COUNT(*)::text AS reservas,
       COALESCE(SUM(numero_entradas), 0)::text AS entradas,
       COALESCE(SUM(valor_total), 0)::text AS ingresos
     FROM (
       SELECT EXTRACT(MONTH FROM fecha_hora)::int AS mes, numero_entradas, valor_total
       FROM vista_reserva
       WHERE estado = 'Confirmada' AND EXTRACT(YEAR FROM fecha_hora) = $1
     ) r
     GROUP BY r.mes
     ORDER BY r.mes`,
    [anio]
  );

/** Número de reservas por evento y por mes. */
export const reservasPorEventoYMes = (anio = ANIO_POR_DEFECTO) =>
  consultar<{
    codigo_evento: string;
    evento: string;
    mes: string;
    nombre_mes: string;
    reservas: string;
    entradas: string;
  }>(
    `SELECT
       codigo_evento::text,
       evento,
       mes::text,
       ${NOMBRE_DEL_MES} AS nombre_mes,
       COUNT(*)::text AS reservas,
       COALESCE(SUM(numero_entradas), 0)::text AS entradas
     FROM (
       SELECT codigo_evento, evento, numero_entradas,
              EXTRACT(MONTH FROM fecha_hora)::int AS mes
       FROM vista_reserva
       WHERE EXTRACT(YEAR FROM fecha_hora) = $1
     ) r
     GROUP BY r.codigo_evento, r.evento, r.mes
     ORDER BY r.mes, r.evento`,
    [anio]
  );

/** Eventos creados por cada agente y por ciudad. */
export const eventosPorAgenteYCiudad = () =>
  consultar<{ agente: string; ciudad: string; departamento: string; eventos: string; capacidad: string }>(
    `SELECT
       agente,
       ciudad,
       departamento,
       COUNT(*)::text AS eventos,
       COALESCE(SUM(capacidad_total), 0)::text AS capacidad
     FROM vista_evento
     GROUP BY agente, ciudad, departamento
     ORDER BY agente, ciudad`
  );

// -------------------------------------------------------- 3. cobertura --

/** Eventos por país, departamento y ciudad de realización. */
export const eventosPorUbicacion = () =>
  consultar<{
    pais: string;
    departamento: string;
    ciudad: string;
    eventos: string;
    programados: string;
    cancelados: string;
  }>(
    `SELECT
       pais,
       departamento,
       ciudad,
       COUNT(*)::text AS eventos,
       COUNT(*) FILTER (WHERE estado IN ('Programado', 'En Boleteria'))::text AS programados,
       COUNT(*) FILTER (WHERE estado = 'Cancelado')::text AS cancelados
     FROM vista_evento
     GROUP BY pais, departamento, ciudad
     ORDER BY pais, departamento, ciudad`
  );

// ------------------------------------------- 4. reservas y operación --

/** Historial de reservas de un cliente. */
export const historialDeCliente = (identificacion: string) =>
  consultar(
    `SELECT id_reserva, fecha_hora, evento, fecha_evento, teatro, ciudad,
            numero_entradas, valor_total, estado, causa_cancelacion
     FROM vista_reserva
     WHERE identificacion_cliente = $1
     ORDER BY fecha_hora DESC`,
    [identificacion]
  );

/** Reservas canceladas y su causa. */
export const reservasCanceladas = () =>
  consultar(
    `SELECT id_reserva, fecha_hora, cliente, evento, numero_entradas, valor_total,
            causa_cancelacion
     FROM vista_reserva
     WHERE estado = 'Cancelada'
     ORDER BY fecha_hora DESC`
  );

/** Eventos cancelados y su causa. */
export const eventosCancelados = () =>
  consultar(
    `SELECT codigo_evento, nombre, fecha_hora_inicio, ciudad, teatro, agente,
            capacidad_total, causa_cancelacion,
            (SELECT COUNT(*) FROM reserva r WHERE r.codigo_evento = v.codigo_evento)::text
              AS reservas_afectadas
     FROM vista_evento v
     WHERE estado = 'Cancelado'
     ORDER BY fecha_hora_inicio DESC`
  );

/** Todo junto, para pintar el tablero del administrador de una sola llamada. */
export async function tablero(anio = ANIO_POR_DEFECTO) {
  const [
    resumen, porAgente, porCliente, porMes, porUbicacion, cancelados,
    porEventoYMes, porAgenteYCiudad, reservasSinEfecto
  ] = await Promise.all([
    general(),
    ingresosPorAgente(),
    ingresosPorCliente(),
    ingresosPorMes(anio),
    eventosPorUbicacion(),
    eventosCancelados(),
    reservasPorEventoYMes(anio),
    eventosPorAgenteYCiudad(),
    reservasCanceladas()
  ]);
  return {
    anio, resumen, porAgente, porCliente, porMes, porUbicacion, cancelados,
    porEventoYMes, porAgenteYCiudad, reservasCanceladas: reservasSinEfecto
  };
}
