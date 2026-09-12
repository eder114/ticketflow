# Contexto del Proyecto TicketFlow — Handoff para Claude Code

> **Cómo usar este documento:** este archivo contiene todo el contexto del proyecto acumulado hasta la fecha. Cuando abras el repo en Claude Code, indícale que lea primero este archivo para que tenga el panorama completo antes de empezar a trabajar.

---

## Prompt inicial sugerido para Claude Code

Copia y pega esto en tu primera interacción con Claude Code dentro del repo:

```
Estoy trabajando en el proyecto TicketFlow (Proyecto Integrador 2026-2 de la
universidad). Antes de empezar, lee estos archivos para tener el contexto completo:

1. README.md — descripción, stack y estructura
2. docs/CONTEXTO_PROYECTO.md — historial del proyecto, decisiones tomadas y próximos pasos

Después de leer, confírmame que entendiste el contexto y dime cuál es la
siguiente tarea prioritaria según el cronograma.
```

---

## 1. ¿Qué es TicketFlow?

Sistema web para la gestión de eventos, espectáculos y reservas, inspirado en plataformas como **Tuboleta, Taquilla Live, Eventbrite y Ticketmaster**. Es un proyecto académico del curso "Bases de Datos y Programación en Ambiente Web I".

**Alcance funcional resumido:**
- Registro/login de usuarios con 3 roles: Cliente, Agente, Administrador.
- CRUD de personas, clientes, agentes, administradores, eventos, reservas, países, departamentos y ciudades.
- Flujo de reserva de eventos por parte del cliente.
- Gestión de eventos y reservas por parte del agente.
- Dashboard de reportes para el administrador.

## 2. Stack técnico definido

| Capa | Tecnología |
|---|---|
| Frontend (patrón MVC) | HTML5, CSS3, Bootstrap, JavaScript, TypeScript |
| Backend | Node.js + Express + TypeScript |
| Base de Datos | PostgreSQL (obligatorio por el enunciado) |
| Control de versiones | Git + GitHub |

Repositorio: **https://github.com/eder114/ticketflow**

## 3. Deadline y estado actual (agosto 2026)

**Fecha límite del primer entregable: 31 de agosto de 2026.**

### Lo que YA está hecho ✅
- Repositorio GitHub creado y con estructura inicial subida.
- Investigación de benchmark UX sobre Tuboleta, Eventbrite, Ticketmaster, Taquilla Live.
- Documento maestro de requisitos funcionales derivado del benchmark.
- Plan de trabajo por fases.
- Estructura de carpetas: `frontend/`, `backend/`, `database/`, `docs/`.
- README.md y .gitignore configurados.

### Lo que sigue AHORA (antes del 31 de agosto) 🎯
**Diseño de interfaces en Figma** usando como referencia las 4 plataformas mencionadas. Ver sección 5 para el detalle.

## 4. Reglas de negocio y modelo de datos

### Entidades principales

**Jerarquía geográfica:**
- `Pais` (id, nombre) → 1:N `Departamento` (id, nombre, id_pais) → 1:N `Ciudad` (id, nombre, id_departamento)

**Personas y roles:**
- `Persona` (id, identificación, nombre_completo, correo, dirección, id_ciudad)
- `Telefono` (id, número, id_persona) — 1:N desde Persona
- `Cliente` (id_persona, puntos, ver_publicidad) — subtipo 1:1
- `Agente` (id_persona, comisión, experiencia) — subtipo 1:1
- `Administrador` (id_persona, salario, horario) — subtipo 1:1

**Núcleo del negocio:**
- `Evento` (código único, nombre, descripción, teatro, id_ciudad, fecha_inicio, fecha_fin_estimada, capacidad, precio_base, observaciones, estado, id_agente)
  - Estados: Programado, En Boletería, En Vivo, Finalizado, Cancelado
- `Reserva` (id, fecha_hora, valor_total, num_entradas, observaciones, estado, id_cliente, id_evento)
  - Estados: Reservada, Confirmada, Cancelada

### Acciones por rol

| Rol | Acciones principales |
|---|---|
| **Cliente** | Ver eventos, hacer reservas, ver historial con estado |
| **Agente** | Registrar eventos, ver eventos, administrar reservas y su estado |
| **Administrador** | Ver reportes (gráficas/tablas) |

### Reportes obligatorios del administrador
1. **Generales:** conteos de clientes, agentes, administradores, reservas, eventos.
2. **Comerciales:** ingreso promedio por agente/cliente, ingresos por mes (2026), reservas por evento/mes, eventos por agente/ciudad.
3. **Cobertura:** eventos por país/departamento/ciudad.
4. **Operación:** historial de reservas por cliente, reservas canceladas y su causa, eventos cancelados y su causa.

## 5. Tarea inmediata: Diseño de interfaces en Figma

Diseñar mockups de alta fidelidad en Figma para las pantallas clave, usando como referencia visual y funcional a **Tuboleta, Eventbrite, Ticketmaster y Taquilla Live**.

### Pantallas mínimas a diseñar antes del 31 de agosto

**Autenticación:**
- Landing/home con catálogo de eventos.
- Login (email + contraseña).
- Registro de Cliente.
- Registro de Agente (diferenciado del cliente).

**Flujo Cliente:**
- Catálogo/listado de eventos con filtros (ciudad, fecha).
- Detalle de evento (info + botón reservar).
- Flujo de reserva (selección de cantidad, checkout).
- Confirmación de reserva.
- Panel del cliente: historial de reservas con estado.

**Flujo Agente:**
- Panel del agente.
- Formulario de creación/edición de evento.
- Listado de reservas por evento con opción de cambiar estado.

**Flujo Administrador:**
- Dashboard con gráficas y KPIs.
- Vista de reportes (mínimo 2-3 de los listados en sección 4).

### Principios UX obligatorios (derivados del benchmark)

Aplicar SIEMPRE estos principios en cada pantalla — vienen del análisis de errores reales de las plataformas de referencia:

1. **Precio "todo incluido" desde la primera pantalla.** Mostrar el precio final desde la tarjeta del evento, no sumar cargos en el checkout (este error le costó a Eventbrite y Ticketmaster tasas altas de abandono y a Tuboleta una investigación de la SIC).
2. **Checkout como invitado.** No obligar a registrarse antes de explorar; pedir cuenta solo al confirmar la reserva.
3. **Onboarding diferenciado Cliente vs. Agente.** Nunca mezclar los dos formularios en el mismo flujo. El registro del Agente debe ser un wizard por pasos.
4. **Estados visuales claros de reserva.** Usar chips/badges de color para Reservada / Confirmada / Cancelada.
5. **Feedback de errores específico** (no genérico "credenciales inválidas").
6. **Mostrar cupo/aforo disponible en tiempo real** en el detalle del evento.
7. **Cancelación self-service** desde el panel del cliente, no obligar a contactar soporte.
8. **Ruta digital de PQRS** visible en el panel del cliente (requisito legal en Colombia — caso Tuboleta/SIC).

### Referencias visuales por plataforma

- **Tuboleta / Taquilla Live:** referentes locales (Colombia). Estudiar su catálogo, filtros y flujo de compra.
- **Eventbrite:** referente para el panel del organizador (Agente) — flujo de creación de eventos tipo plantilla.
- **Ticketmaster:** referente para selección interactiva de asientos y flujo de checkout (copiando lo bueno, evitando el drip pricing y los timeouts agresivos).

## 6. Fases posteriores al 31 de agosto (para contexto general)

- **Fase 1 (análisis y diseño)** — actual, cierra con los mockups de Figma y diagramas UML.
- **Fase 2 (backend + BD)** — crear PostgreSQL, autenticación, API CRUD.
- **Fase 3 (frontend MVC + integración)** — implementar los mockups con HTML/CSS/Bootstrap/TS.
- **Fase 4 (reportes, dashboard, cierre)** — dashboard del admin, pruebas, docs, sustentación.

## 7. Convenciones y buenas prácticas para el equipo

**Git:**
- Rama `main` protegida.
- Trabajo en ramas por feature: `feature/login`, `feature/crud-eventos`, etc.
- Convención de commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- Cada commit debe reflejar autoría clara (importante para la evaluación individual).

**Colaboradores en GitHub:** invitar a todos los integrantes desde Settings → Collaborators.

**Sustentación:** el enunciado indica que cada estudiante responde individualmente al docente por su parte, así que cada integrante debe conocer bien lo que hizo y por qué.

## 8. Archivos de referencia en la carpeta de outputs de Cowork

Estos archivos fueron generados en la conversación previa con Cowork y contienen investigación detallada. Si necesitas consultarlos, están en:

- `Benchmark_UX_Sistema_Reservas_Eventos.md` — análisis completo de las 4 plataformas de referencia.
- `Especificacion_Funcionalidades_Requisitos_Master.md` — lista maestra de requisitos.
- `Plan_de_Trabajo_Proyecto_Integrador.md` — plan por fases y desglose de módulos.

**Recomendación:** copiarlos a `docs/` del repo para que estén versionados junto al proyecto.

## 9. Pendientes del líder del proyecto (Eder)

- [ ] Invitar a los 3 integrantes restantes como colaboradores en GitHub.
- [ ] Completar la tabla de integrantes en el README.md.
- [ ] Confirmar con el docente las fechas exactas de los cortes 2 y 3 (además del 31 de agosto).
- [ ] Compartir este documento con el equipo antes de empezar Figma.

---

**Última actualización de este documento:** 4 de agosto de 2026.
