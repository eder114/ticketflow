-- TicketFlow · vistas de los atributos derivados
--
-- En el modelo entidad-relacion marcamos dos atributos como derivados: los
-- cupos disponibles de un evento y el valor total de una reserva. No los
-- guardamos como columnas porque se pueden quedar desactualizados; se calculan
-- aqui, una sola vez, para que la API no tenga que repetir la cuenta.
--
-- Para crearlas:  psql -U postgres -d ticketflow -f vistas.sql

DROP VIEW IF EXISTS vista_reserva;
DROP VIEW IF EXISTS vista_evento;


-- Evento con su ubicacion completa, el agente que lo registro y los cupos que
-- le quedan. Solo descuentan las reservas confirmadas: una reserva cancelada
-- devuelve el cupo.
CREATE VIEW vista_evento AS
SELECT
  e.codigo_evento,
  e.nombre,
  e.descripcion,
  e.teatro,
  e.fecha_hora_inicio,
  e.fecha_hora_fin,
  e.capacidad_total,
  e.precio_base,
  e.observaciones,
  e.estado,
  e.causa_cancelacion,
  e.id_ciudad,
  c.nombre  AS ciudad,
  d.id_departamento,
  d.nombre  AS departamento,
  pa.id_pais,
  pa.nombre AS pais,
  e.identificacion_agente,
  pe.nombres || ' ' || pe.apellidos AS agente,
  e.capacidad_total - COALESCE(r.entradas_confirmadas, 0) AS cupos_disponibles
FROM evento e
  JOIN ciudad       c  ON c.id_ciudad = e.id_ciudad
  JOIN departamento d  ON d.id_departamento = c.id_departamento
  JOIN pais         pa ON pa.id_pais = d.id_pais
  JOIN persona      pe ON pe.identificacion = e.identificacion_agente
  LEFT JOIN (
    SELECT codigo_evento, SUM(numero_entradas) AS entradas_confirmadas
    FROM reserva
    WHERE estado = 'Confirmada'
    GROUP BY codigo_evento
  ) r ON r.codigo_evento = e.codigo_evento;


-- Reserva con el nombre del cliente, los datos del evento y el valor total,
-- que es el numero de entradas por el precio base del evento.
CREATE VIEW vista_reserva AS
SELECT
  r.id_reserva,
  r.fecha_hora,
  r.numero_entradas,
  r.observaciones,
  r.estado,
  r.causa_cancelacion,
  r.identificacion_cliente,
  pc.nombres || ' ' || pc.apellidos AS cliente,
  pc.correo AS correo_cliente,
  r.codigo_evento,
  e.nombre            AS evento,
  e.fecha_hora_inicio AS fecha_evento,
  e.teatro,
  c.nombre            AS ciudad,
  e.precio_base,
  e.identificacion_agente,
  r.numero_entradas * e.precio_base AS valor_total
FROM reserva r
  JOIN persona pc ON pc.identificacion = r.identificacion_cliente
  JOIN evento  e  ON e.codigo_evento = r.codigo_evento
  JOIN ciudad  c  ON c.id_ciudad = e.id_ciudad;
