-- Agrega la foto propia del evento a una base que ya tiene datos.
--
-- La columna guarda la imagen como data URI (data:image/jpeg;base64,...), que
-- es lo que manda el formulario despues de reducirla en el navegador. Queda
-- en NULL para los eventos viejos: esos siguen mostrando la imagen de
-- referencia de su categoria, igual que antes.
--
--   cd backend
--   node aplicar_sql.js ../database/sql/migracion_imagen.sql
--   node aplicar_sql.js ../database/sql/vistas.sql
--
-- Las dos lineas son necesarias: la primera crea la columna y la segunda
-- vuelve a crear vista_evento para que la devuelva.

ALTER TABLE evento ADD COLUMN IF NOT EXISTS imagen TEXT;
