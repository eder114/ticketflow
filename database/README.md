# Base de datos

Esquema en PostgreSQL · Sprint 2.

## Entidades del enunciado

| Tabla | Datos |
|---|---|
| `pais` | id, nombre |
| `departamento` | id, nombre, pais |
| `ciudad` | id, nombre, departamento |
| `persona` | identificación (cédula o pasaporte), nombre completo, correo, dirección, ciudad |
| `telefono` | número, persona (una persona puede tener varios) |
| `cliente` | persona, puntos, visualización de publicidad |
| `agente` | persona, comisión, experiencia |
| `administrador` | persona, salario, horario |
| `evento` | código, nombre, descripción, teatro, ciudad, inicio, fin estimado, capacidad, precio base, observaciones, estado |
| `reserva` | id, cliente, evento, fecha y hora, valor total, número de entradas, observaciones, estado |

## Estados

- **Evento:** Programado, En Boletería, En Vivo, Finalizado, Cancelado
- **Reserva:** Reservada, Confirmada, Cancelada
