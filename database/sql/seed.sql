-- TicketFlow · datos de prueba
--
-- Sirve para probar la aplicacion sin tener que registrar todo a mano.
-- Todas las personas de prueba tienen la misma contrasena: Ticket2026*
-- (guardada cifrada con bcrypt, igual que las que crea la aplicacion).
--
-- Para cargarlos:  psql -U postgres -d ticketflow -f seed.sql

TRUNCATE reserva, evento, administrador, agente, cliente, telefono, persona,
         ciudad, departamento, pais RESTART IDENTITY CASCADE;


-- ============================================================ UBICACION ====

INSERT INTO pais (nombre) VALUES ('Colombia');

INSERT INTO departamento (nombre, id_pais) VALUES
  ('Valle del Cauca', 1), ('Cundinamarca', 1), ('Antioquia', 1),
  ('Atlantico', 1), ('Santander', 1), ('Bolivar', 1);

INSERT INTO ciudad (nombre, id_departamento) VALUES
  ('Cali', 1), ('Tulua', 1), ('Palmira', 1), ('Buga', 1),
  ('Bogota', 2),
  ('Medellin', 3), ('Envigado', 3),
  ('Barranquilla', 4),
  ('Bucaramanga', 5),
  ('Cartagena', 6);


-- ============================================================= PERSONAS ====

INSERT INTO persona (identificacion, nombres, apellidos, correo, contrasena, direccion, id_ciudad) VALUES
  ('1115789021', 'Laura Sofia',   'Gonzalez Rios',   'laura.gonzalez@correo.com',     '$2b$10$DDhnNr45wv86gLwDcUKCL.Az2ggDrjQnQZY1njKjN6PoYfpyUyzGy', 'Calle 25 # 14-32',     2),
  ('1144027853', 'Andres Felipe', 'Moreno Castro',   'andres.moreno@correo.com',      '$2b$10$DDhnNr45wv86gLwDcUKCL.Az2ggDrjQnQZY1njKjN6PoYfpyUyzGy', 'Carrera 66 # 11-45',   1),
  ('1006523410', 'Valentina',     'Quintero Ospina', 'valentina.quintero@correo.com', '$2b$10$DDhnNr45wv86gLwDcUKCL.Az2ggDrjQnQZY1njKjN6PoYfpyUyzGy', 'Avenida 6N # 23-10',   5),
  ('1130998742', 'Juan Pablo',    'Restrepo Lema',   'juanpablo.restrepo@correo.com', '$2b$10$DDhnNr45wv86gLwDcUKCL.Az2ggDrjQnQZY1njKjN6PoYfpyUyzGy', 'Calle 10 # 40-21',     6),
  ('94567123',   'Carolina',      'Mejia Arango',    'carolina.mejia@ticketflow.com', '$2b$10$DDhnNr45wv86gLwDcUKCL.Az2ggDrjQnQZY1njKjN6PoYfpyUyzGy', 'Carrera 100 # 5-169',  1),
  ('79845612',   'Ricardo',       'Salazar Pineda',  'ricardo.salazar@ticketflow.com','$2b$10$DDhnNr45wv86gLwDcUKCL.Az2ggDrjQnQZY1njKjN6PoYfpyUyzGy', 'Calle 72 # 10-34',     5),
  ('1098234561', 'Daniela',       'Vargas Londono',  'daniela.vargas@ticketflow.com', '$2b$10$DDhnNr45wv86gLwDcUKCL.Az2ggDrjQnQZY1njKjN6PoYfpyUyzGy', 'Carrera 27 # 36-18',   9),
  ('16789234',   'Hernan',        'Ocampo Giraldo',  'hernan.ocampo@ticketflow.com',  '$2b$10$DDhnNr45wv86gLwDcUKCL.Az2ggDrjQnQZY1njKjN6PoYfpyUyzGy', 'Avenida 4N # 15-80',   1);

INSERT INTO telefono (identificacion, numero) VALUES
  ('1115789021', '3152048877'), ('1115789021', '6022457788'),
  ('1144027853', '3004129966'),
  ('1006523410', '3119874523'),
  ('1130998742', '3217745120'),
  ('94567123',   '3186542301'), ('94567123', '6025551020'),
  ('79845612',   '3012398745'),
  ('1098234561', '3145569870'),
  ('16789234',   '3160045512');

-- Cuatro clientes
INSERT INTO cliente (identificacion, puntos, ve_publicidad) VALUES
  ('1115789021', 120, TRUE),
  ('1144027853',  45, FALSE),
  ('1006523410',   0, TRUE),
  ('1130998742', 310, TRUE);

-- Tres agentes
INSERT INTO agente (identificacion, comision, experiencia) VALUES
  ('94567123',   8.50, 6),
  ('79845612',   6.00, 3),
  ('1098234561', 7.25, 2);

-- Un administrador
INSERT INTO administrador (identificacion, salario, horario) VALUES
  ('16789234', 4800000.00, 'Lunes a viernes 8:00 a 18:00');


-- ============================================================== EVENTOS ====
-- Doce eventos repartidos en varias ciudades y en los cinco estados.

INSERT INTO evento (nombre, descripcion, teatro, fecha_hora_inicio, fecha_hora_fin,
                    capacidad_total, precio_base, observaciones, estado, causa_cancelacion,
                    id_ciudad, identificacion_agente) VALUES
  ('Festival de Musica Cali Vive',
   'Tres escenarios con artistas nacionales de salsa, rock y musica urbana.',
   'Estadio Pascual Guerrero', '2026-11-14 18:00', '2026-11-15 02:00',
   25000, 120000, NULL, 'En Boleteria', NULL, 1, '94567123'),

  ('Noche de Salsa Brava',
   'Las orquestas clasicas de la salsa calena en una sola noche.',
   'Teatro Jorge Isaacs', '2026-11-28 20:00', '2026-11-29 01:00',
   900, 85000, NULL, 'En Boleteria', NULL, 1, '94567123'),

  ('Tulua Rock Fest',
   'Bandas emergentes del Valle del Cauca.',
   'Coliseo Cubierto de Tulua', '2026-12-05 16:00', '2026-12-05 23:00',
   3500, 60000, 'Entrada libre para menores de 10 anos.', 'Programado', NULL, 2, '79845612'),

  ('Sinfonica del Valle - Temporada de Navidad',
   'Repertorio navideno clasico y colombiano.',
   'Teatro Municipal Enrique Buenaventura', '2026-12-18 19:30', '2026-12-18 21:30',
   700, 45000, NULL, 'Programado', NULL, 1, '94567123'),

  ('Comedia en Vivo - Especial de Fin de Ano',
   'Monologos de comediantes colombianos.',
   'Teatro Nacional Fanny Mikey', '2026-12-20 20:00', '2026-12-20 22:00',
   1200, 95000, NULL, 'Programado', NULL, 5, '1098234561'),

  ('Clasico Paisa - Nacional vs Medellin',
   'Partido de la fecha 18 de la liga.',
   'Estadio Atanasio Girardot', '2026-11-22 17:00', '2026-11-22 19:00',
   44000, 70000, NULL, 'En Boleteria', NULL, 6, '79845612'),

  ('Carnaval Electronico Barranquilla',
   'Doce horas de musica electronica frente al mar.',
   'Parque Distrital Puerta de Oro', '2026-11-21 14:00', '2026-11-22 02:00',
   15000, 180000, NULL, 'En Vivo', NULL, 8, '1098234561'),

  ('Festival Internacional de Teatro',
   'Quince obras de seis paises.',
   'Teatro Santander', '2026-10-10 15:00', '2026-10-18 22:00',
   2000, 50000, NULL, 'Finalizado', NULL, 9, '1098234561'),

  ('Hay Festival Cartagena - Noche inaugural',
   'Conversatorio de apertura con autores invitados.',
   'Teatro Adolfo Mejia', '2027-01-28 19:00', '2027-01-28 21:00',
   650, 110000, NULL, 'Programado', NULL, 10, '79845612'),

  ('Concierto Sinfonico al Parque',
   'Concierto gratuito al aire libre.',
   'Parque Simon Bolivar', '2026-11-08 16:00', '2026-11-08 19:00',
   30000, 0, 'Evento gratuito, requiere reserva.', 'Finalizado', NULL, 5, '1098234561'),

  ('Expo Gastronomica del Pacifico',
   'Muestra de cocina tradicional del litoral.',
   'Centro de Eventos Valle del Pacifico', '2026-11-29 11:00', '2026-11-29 20:00',
   5000, 35000, NULL, 'Cancelado',
   'El centro de eventos cancelo la reserva del recinto por obras de mantenimiento.', 3, '94567123'),

  ('Torneo Nacional de Voleibol',
   'Fase final del torneo interclubes.',
   'Coliseo del Pueblo', '2026-12-12 09:00', '2026-12-13 18:00',
   4000, 25000, NULL, 'Cancelado',
   'No se alcanzo el numero minimo de equipos inscritos.', 1, '79845612');


-- ============================================================= RESERVAS ====
-- Reservas en los tres estados, repartidas entre los cuatro clientes.

INSERT INTO reserva (fecha_hora, numero_entradas, observaciones, estado, causa_cancelacion,
                     identificacion_cliente, codigo_evento) VALUES
  ('2026-10-02 10:15', 2, NULL,                'Confirmada', NULL, '1115789021',  1),
  ('2026-10-03 19:40', 4, 'Pedir sillas juntas.', 'Confirmada', NULL, '1130998742',  1),
  ('2026-10-05 08:05', 1, NULL,                'Reservada',  NULL, '1144027853',  1),
  ('2026-10-06 21:10', 2, NULL,                'Confirmada', NULL, '1006523410',  2),
  ('2026-10-07 14:30', 3, NULL,                'Reservada',  NULL, '1115789021',  3),
  ('2026-09-28 09:00', 2, NULL,                'Confirmada', NULL, '1130998742',  6),
  ('2026-09-30 17:45', 5, NULL,                'Confirmada', NULL, '1144027853',  7),
  ('2026-10-01 11:20', 1, NULL,                'Cancelada',  'El cliente ya no puede asistir.', '1006523410', 7),
  ('2026-09-15 16:00', 2, NULL,                'Confirmada', NULL, '1115789021',  8),
  ('2026-10-04 13:25', 6, 'Grupo familiar.',   'Reservada',  NULL, '1130998742',  5),
  ('2026-10-08 10:50', 2, NULL,                'Cancelada',  'Se cancelo el evento.', '1144027853', 11),
  ('2026-11-01 12:00', 4, NULL,                'Confirmada', NULL, '1006523410', 10);
