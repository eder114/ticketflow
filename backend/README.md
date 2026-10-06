# Backend

API REST de TicketFlow · Node.js + Express + TypeScript + PostgreSQL.

## Cómo levantarlo

```bash
# 1. Crear la base de datos (una sola vez)
createdb -U postgres ticketflow
psql -U postgres -d ticketflow -f ../database/sql/schema.sql
psql -U postgres -d ticketflow -f ../database/sql/vistas.sql
psql -U postgres -d ticketflow -f ../database/sql/seed.sql

# 2. Configurar el entorno
cp .env.example .env     # y escribir la contraseña de PostgreSQL

# 3. Instalar y arrancar
npm install
npm run dev
```

Queda escuchando en `http://localhost:4000/api`. Para comprobar que está vivo:
`GET http://localhost:4000/api/salud`.

Para verificar que todo responde bien hay una prueba que recorre la API de
punta a punta:

```bash
node prueba_api.js
```

## Estructura

```
src/
├── configuracion/   Lee las variables de entorno
├── datos/           Conexión a PostgreSQL, consultas y transacciones
├── modelos/         Los tipos del dominio
├── servicios/       Las reglas del negocio
├── controladores/   Leen la petición y arman la respuesta
├── rutas/           El mapa de rutas y quién puede llamarlas
├── middleware/      Errores, validación y sesión
└── servidor.ts      Arranque
```

Es la misma separación del frontend: el controlador no sabe SQL y el servicio
no sabe que existe HTTP.

## Rutas

Todas cuelgan de `/api`. Las marcadas con candado piden la cabecera
`Authorization: Bearer <token>`.

### Autenticación

| Método | Ruta | Quién | Qué hace |
|---|---|---|---|
| POST | `/sesion` | público | Inicia sesión con correo y contraseña |
| GET | `/sesion` | 🔒 cualquiera | Devuelve el usuario de la sesión actual |
| POST | `/registro/cliente` | público | Registra un cliente y lo deja con sesión iniciada |
| POST | `/registro/agente` | público | Registra un agente y lo deja con sesión iniciada |

### Ubicación geográfica

| Método | Ruta | Quién |
|---|---|---|
| GET | `/paises`, `/departamentos`, `/ciudades` | público |
| GET | `/departamentos?pais=1` | público |
| GET | `/ciudades?departamento=1` | público |
| GET | `/ciudades?conUbicacion=true` | público |
| POST, PUT, DELETE | `/paises/:id`, `/departamentos/:id`, `/ciudades/:id` | 🔒 administrador |

### Personas y sus roles

| Método | Ruta | Quién |
|---|---|---|
| GET | `/personas` | 🔒 administrador |
| GET | `/personas/:identificacion` | 🔒 cualquiera |
| POST, DELETE | `/personas` | 🔒 administrador |
| PUT | `/personas/:identificacion` | 🔒 cualquiera |
| GET | `/clientes` | 🔒 administrador o agente |
| GET | `/agentes`, `/administradores` | 🔒 administrador |
| POST, PUT, DELETE | `/clientes`, `/agentes`, `/administradores` | 🔒 administrador |

## Cómo responde

Todo sale en JSON. Los errores siempre tienen la misma forma:

```json
{ "error": "Hay datos que no son válidos.",
  "detalles": { "correo": "El correo no tiene un formato válido." } }
```

| Código | Cuándo |
|---|---|
| 400 | Falta un dato o viene mal |
| 401 | No hay sesión, o el correo o la contraseña no son correctos |
| 403 | Hay sesión pero el perfil no tiene permiso |
| 404 | No existe |
| 409 | Ya existe, o el registro está relacionado con otros |
| 500 | Error del servidor |

Ningún error muestra detalles internos de la base de datos: los códigos de
PostgreSQL se traducen a mensajes que el usuario pueda entender, y lo demás
queda solo en el log del servidor.

## Datos de prueba

`seed.sql` deja cargados cuatro clientes, tres agentes y un administrador.
Todos entran con la contraseña **Ticket2026\***.

| Correo | Perfil |
|---|---|
| `laura.gonzalez@correo.com` | Cliente |
| `carolina.mejia@ticketflow.com` | Agente |
| `hernan.ocampo@ticketflow.com` | Administrador |

## Lo que falta

Los CRUD de eventos y reservas y los reportes entran en el Sprint 3.
