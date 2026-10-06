-- TicketFlow · esquema de la base de datos
-- PostgreSQL 14 o superior
--
-- Son las diez tablas del modelo relacional, en el mismo orden en que las
-- transformamos: primero la ubicacion, despues las personas con sus tres
-- especializaciones, y de ultimo los eventos y las reservas.
--
-- Para crearla:  psql -U postgres -f schema.sql

DROP TABLE IF EXISTS reserva CASCADE;
DROP TABLE IF EXISTS evento CASCADE;
DROP TABLE IF EXISTS administrador CASCADE;
DROP TABLE IF EXISTS agente CASCADE;
DROP TABLE IF EXISTS cliente CASCADE;
DROP TABLE IF EXISTS telefono CASCADE;
DROP TABLE IF EXISTS persona CASCADE;
DROP TABLE IF EXISTS ciudad CASCADE;
DROP TABLE IF EXISTS departamento CASCADE;
DROP TABLE IF EXISTS pais CASCADE;


-- ============================================================ UBICACION ====

CREATE TABLE pais (
  id_pais SERIAL PRIMARY KEY,
  nombre  VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE departamento (
  id_departamento SERIAL PRIMARY KEY,
  nombre          VARCHAR(80) NOT NULL,
  id_pais         INTEGER NOT NULL
    REFERENCES pais (id_pais) ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE (id_pais, nombre)
);

CREATE TABLE ciudad (
  id_ciudad       SERIAL PRIMARY KEY,
  nombre          VARCHAR(80) NOT NULL,
  id_departamento INTEGER NOT NULL
    REFERENCES departamento (id_departamento) ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE (id_departamento, nombre)
);


-- ============================================================= PERSONAS ====

-- La identificacion es la cedula o el pasaporte, por eso va como texto y no
-- como numero: un pasaporte puede traer letras.
CREATE TABLE persona (
  identificacion VARCHAR(20) PRIMARY KEY,
  nombres        VARCHAR(60)  NOT NULL,
  apellidos      VARCHAR(60)  NOT NULL,
  correo         VARCHAR(120) NOT NULL UNIQUE,
  contrasena     VARCHAR(100) NOT NULL,
  direccion      VARCHAR(150),
  id_ciudad      INTEGER NOT NULL
    REFERENCES ciudad (id_ciudad) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT correo_con_arroba CHECK (correo LIKE '%_@_%._%')
);

-- Entidad debil: el telefono no existe sin su persona y el numero solo
-- identifica dentro de ella, por eso la llave primaria es compuesta y el
-- borrado se propaga.
CREATE TABLE telefono (
  identificacion VARCHAR(20) NOT NULL
    REFERENCES persona (identificacion) ON UPDATE CASCADE ON DELETE CASCADE,
  numero         VARCHAR(20) NOT NULL,
  PRIMARY KEY (identificacion, numero)
);

CREATE TABLE cliente (
  identificacion VARCHAR(20) PRIMARY KEY
    REFERENCES persona (identificacion) ON UPDATE CASCADE ON DELETE CASCADE,
  puntos         INTEGER NOT NULL DEFAULT 0 CHECK (puntos >= 0),
  ve_publicidad  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE agente (
  identificacion VARCHAR(20) PRIMARY KEY
    REFERENCES persona (identificacion) ON UPDATE CASCADE ON DELETE CASCADE,
  comision       NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (comision BETWEEN 0 AND 100),
  experiencia    INTEGER NOT NULL DEFAULT 0 CHECK (experiencia >= 0)
);

CREATE TABLE administrador (
  identificacion VARCHAR(20) PRIMARY KEY
    REFERENCES persona (identificacion) ON UPDATE CASCADE ON DELETE CASCADE,
  salario        NUMERIC(12,2) NOT NULL CHECK (salario > 0),
  horario        VARCHAR(60) NOT NULL
);


-- =============================================== EVENTOS Y RESERVAS ====

CREATE TABLE evento (
  codigo_evento         SERIAL PRIMARY KEY,
  nombre                VARCHAR(120) NOT NULL,
  descripcion           TEXT,
  teatro                VARCHAR(120) NOT NULL,
  fecha_hora_inicio     TIMESTAMP NOT NULL,
  fecha_hora_fin        TIMESTAMP NOT NULL,
  capacidad_total       INTEGER NOT NULL CHECK (capacidad_total > 0),
  precio_base           NUMERIC(12,2) NOT NULL CHECK (precio_base >= 0),
  observaciones         TEXT,
  estado                VARCHAR(15) NOT NULL DEFAULT 'Programado',
  causa_cancelacion     TEXT,
  id_ciudad             INTEGER NOT NULL
    REFERENCES ciudad (id_ciudad) ON UPDATE CASCADE ON DELETE RESTRICT,
  identificacion_agente VARCHAR(20) NOT NULL
    REFERENCES agente (identificacion) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT estado_evento CHECK
    (estado IN ('Programado', 'En Boleteria', 'En Vivo', 'Finalizado', 'Cancelado')),
  CONSTRAINT fin_despues_del_inicio CHECK (fecha_hora_fin > fecha_hora_inicio),
  -- El enunciado pide reportar los eventos cancelados y su causa.
  CONSTRAINT cancelado_con_causa CHECK
    (estado <> 'Cancelado' OR causa_cancelacion IS NOT NULL)
);

CREATE TABLE reserva (
  id_reserva             SERIAL PRIMARY KEY,
  fecha_hora             TIMESTAMP NOT NULL DEFAULT NOW(),
  numero_entradas        INTEGER NOT NULL CHECK (numero_entradas > 0),
  observaciones          TEXT,
  estado                 VARCHAR(12) NOT NULL DEFAULT 'Reservada',
  causa_cancelacion      TEXT,
  identificacion_cliente VARCHAR(20) NOT NULL
    REFERENCES cliente (identificacion) ON UPDATE CASCADE ON DELETE RESTRICT,
  codigo_evento          INTEGER NOT NULL
    REFERENCES evento (codigo_evento) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT estado_reserva CHECK
    (estado IN ('Reservada', 'Confirmada', 'Cancelada')),
  CONSTRAINT reserva_cancelada_con_causa CHECK
    (estado <> 'Cancelada' OR causa_cancelacion IS NOT NULL)
);


-- ================================================================ INDICES ====
-- Los de las llaves primarias y los UNIQUE los crea PostgreSQL solo. Estos son
-- para las columnas por las que mas vamos a filtrar.

CREATE INDEX idx_departamento_pais     ON departamento (id_pais);
CREATE INDEX idx_ciudad_departamento   ON ciudad (id_departamento);
CREATE INDEX idx_persona_ciudad        ON persona (id_ciudad);
CREATE INDEX idx_evento_ciudad         ON evento (id_ciudad);
CREATE INDEX idx_evento_agente         ON evento (identificacion_agente);
CREATE INDEX idx_evento_estado         ON evento (estado);
CREATE INDEX idx_evento_inicio         ON evento (fecha_hora_inicio);
CREATE INDEX idx_reserva_cliente       ON reserva (identificacion_cliente);
CREATE INDEX idx_reserva_evento        ON reserva (codigo_evento);
CREATE INDEX idx_reserva_estado        ON reserva (estado);
