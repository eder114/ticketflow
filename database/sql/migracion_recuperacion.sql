-- Tabla para recuperar la contrasena con un codigo que llega al correo.
--
--   cd backend
--   node aplicar_sql.js ../database/sql/migracion_recuperacion.sql
--
-- No se guarda el codigo, se guarda su hash: si alguien llegara a leer la
-- tabla, no podria usar los codigos que esten vivos. Es la misma razon por la
-- que la columna contrasena de persona tampoco guarda el texto.

CREATE TABLE IF NOT EXISTS recuperacion_contrasena (
  id_recuperacion SERIAL PRIMARY KEY,
  identificacion  VARCHAR(20) NOT NULL
    REFERENCES persona (identificacion) ON UPDATE CASCADE ON DELETE CASCADE,
  codigo_hash     VARCHAR(100) NOT NULL,
  creado_en       TIMESTAMP NOT NULL DEFAULT NOW(),
  expira_en       TIMESTAMP NOT NULL,
  usado_en        TIMESTAMP,
  intentos        SMALLINT NOT NULL DEFAULT 0,
  CONSTRAINT expira_despues_de_crearse CHECK (expira_en > creado_en)
);

-- Se busca siempre el ultimo codigo vivo de una persona.
CREATE INDEX IF NOT EXISTS idx_recuperacion_persona
  ON recuperacion_contrasena (identificacion, creado_en DESC);
