# Verificación contra el enunciado

**Fecha:** 18 de octubre de 2026
**Documento revisado:** `Enunciado_Proyecto_Integrador_2026_2_Final.docx`
**Cómo se comprobó:** revisando el código del repositorio, las rutas de la API
(`backend/src/rutas/index.ts`), las pantallas de `frontend/index.html` y
corriendo `backend/prueba_api.js`, que pasa **90 de 90 comprobaciones** contra
la base de datos publicada en Neon.

---

## 1. Objetivos específicos

| Lo que pide | Dónde está | Estado |
|---|---|---|
| Modelado UML | `uml/`: casos de uso, clases y secuencia de la reserva | Cumple |
| Patrón MVC en el frontend | `frontend/js/modelos`, `vistas`, `controladores` | Cumple |
| HTML5, CSS y JavaScript / TypeScript | HTML y CSS propios, JavaScript en el frontend, TypeScript en el backend | Cumple |
| Base de datos relacional con un backend que consulta, registra, actualiza y elimina | PostgreSQL en Neon; `backend/src/servicios` | Cumple |
| Un modelo de comunicación entre la aplicación y la base | API REST sobre HTTP (JSON), consumida con `fetch` | Cumple |
| Repositorio en GitHub con el seguimiento del equipo | `github.com/eder114/ticketflow` | Cumple |

> Nota: el enunciado menciona Bootstrap como una de las tecnologías del curso.
> No se usó: los estilos están escritos a mano en `assets/css/estilos.css`,
> Mobile-First. La lista del enunciado dice «como HTML5, CSS, Bootstrap,
> JavaScript y Typescript», es decir, son ejemplos de las tecnologías vistas.

## 2. Lo que el sistema debe permitir

| Lo que pide | Dónde está | Estado |
|---|---|---|
| Iniciar sesión con un método sencillo | `#/iniciar-sesion`, correo y contraseña, token de sesión | Cumple |
| Registrar clientes y agentes | `#/registro-cliente` y `#/registro-agente` | Cumple |
| Administrar eventos y reservas | Panel del organizador (`#/panel-agente`) y `#/crear-evento` | Cumple |
| Administrar el estado de eventos y reservas | Desplegable de estado en la tabla de eventos; confirmar y cancelar reservas | Cumple |
| Consultar la información de eventos y reservas | Catálogo, detalle del evento, «Mis reservas», panel del organizador | Cumple |
| Vistas personalizadas para cada tipo de usuario | El menú y las pantallas cambian según el perfil; el enrutador devuelve a quien entre donde no le toca | Cumple |
| Dashboard de reportes solo para administradores | `#/panel-admin`, protegido por perfil en el frontend y por `soloAdmin` en la API | Cumple |

## 3. Estructura de datos y reglas de negocio

| Lo que pide | Cómo quedó | Estado |
|---|---|---|
| País, departamento y ciudad por separado, con identificador y nombre | Tres tablas con sus llaves foráneas | Cumple |
| Persona: identificación, nombre completo, correo, dirección, ciudad y varios teléfonos | Tabla `persona` + tabla `telefono` (llave compuesta) | Cumple |
| Cliente: puntos y visualización de publicidad | `cliente.puntos`, `cliente.ve_publicidad` | Cumple |
| Agente: comisión y experiencia | `agente.comision`, `agente.experiencia` | Cumple |
| Administrador: salario y horario | `administrador.salario`, `administrador.horario` | Cumple |
| Evento: código, nombre, descripción, teatro, ciudad, inicio, fin, capacidad, precio base, observaciones y estado | Tabla `evento` con los once campos y el CHECK de los cinco estados | Cumple |
| Reserva: identificador, fecha y hora, valor total, número de entradas, observaciones y estado | Tabla `reserva`; el valor total es derivado y sale de `vista_reserva` | Cumple |
| Un cliente puede hacer muchas reservas; una reserva es de un solo evento | Llaves foráneas 1:N | Cumple |

## 4. Perfiles de usuario

| Perfil | Lo que pide | Estado |
|---|---|---|
| Cliente | Ver todos los eventos disponibles | Cumple (catálogo con filtros) |
| Cliente | Hacer reservas | Cumple (`#/reservar/:codigo` y confirmación con código) |
| Cliente | Ver todas sus reservas con el estado actual | Cumple (`#/mis-reservas`) |
| Agente | Registrar eventos | Cumple (`#/crear-evento`) |
| Agente | Ver todos los eventos registrados | Cumple (catálogo y tabla «Mis eventos») |
| Agente | Administrar reservas: verlas y actualizar el estado | Cumple (tabla de reservas con confirmar y cancelar) |
| Administrador | Ver los reportes del sistema con gráficas o tablas | Cumple (tarjetas, gráfica de línea, dona, barras y seis tablas) |

## 5. Gestión de datos (CRUD)

Las nueve operaciones que pide el enunciado existen en la API y se pueden
hacer desde la página:

| Entidad | API | En pantalla |
|---|---|---|
| Personas | `GET/POST/PUT/DELETE /personas` | `#/gestion` |
| Clientes | `GET/POST/PUT/DELETE /clientes` | Registro público y edición de puntos y publicidad en `#/gestion` |
| Agentes | `GET/POST/PUT/DELETE /agentes` | Registro público y edición de comisión y experiencia en `#/gestion` |
| Administradores | `GET/POST/PUT/DELETE /administradores` | `#/registro-admin` y edición de salario y horario en `#/gestion` |
| Eventos | `GET/POST/PUT/PATCH/DELETE /eventos` | Crear, editar, cambiar estado y eliminar desde el panel del organizador |
| Reservas | `GET/POST/PATCH/DELETE /reservas` | Crear desde el detalle; cambiar estado desde los paneles |
| Países | `GET/POST/PUT/DELETE /paises` | `#/gestion` |
| Departamentos | `GET/POST/PUT/DELETE /departamentos` | `#/gestion` |
| Ciudades | `GET/POST/PUT/DELETE /ciudades` | `#/gestion` |

## 6. Reportes

| Reporte que pide el enunciado | Ruta | Dónde se ve |
|---|---|---|
| Número de clientes, agentes y administradores registrados | `/reportes/general` | Tarjetas del panel y dona «Usuarios por tipo» |
| Número de reservas y de eventos registrados | `/reportes/general` | Tarjetas del panel |
| Promedio de ingresos por agente | `/reportes/ingresos-por-agente` | Tabla «Ingresos por agente» |
| Promedio de ingresos por cliente | `/reportes/ingresos-por-cliente` | Tabla «Promedio de gasto por cliente» |
| Ingresos totales por meses en 2026 | `/reportes/ingresos-por-mes` | Gráfica de línea y tabla |
| Número de reservas por evento y por mes en 2026 | `/reportes/reservas-por-evento` | Tabla «Reservas por evento y por mes» |
| Eventos creados por cada agente y por ciudad | `/reportes/eventos-por-agente` | Tabla «Eventos por agente y por ciudad» |
| Eventos por país, departamento y ciudad | `/reportes/eventos-por-ubicacion` | Tabla «Cobertura» y gráfica de barras |
| Historial de reservas por cliente | `/reportes/historial/:identificacion` | Tabla «Historial de reservas por cliente», con su selector |
| Reservas canceladas y su causa | `/reportes/reservas-canceladas` | Tabla «Reservas canceladas y su causa» |
| Eventos cancelados y su causa | `/reportes/eventos-cancelados` | Tabla «Eventos cancelados y su causa» |

Los once reportes del enunciado se ven en el panel del administrador, con sus
tablas y sus gráficas.

## 7. Reglas generales

| Regla | Estado |
|---|---|
| Máximo cuatro estudiantes | **No se cumple:** el equipo es de cinco. Hay que hablarlo con el profesor. |
| La base de datos en PostgreSQL | Cumple (PostgreSQL 18 en Neon) |
| Sin copia entre grupos | El repositorio tiene el historial completo de quién hizo qué |

## 8. Lo que falta

1. El equipo es de cinco y el enunciado habla de cuatro: hay que hablarlo con
   el profesor.
2. Sincronizar el tablero de Jira con lo que ya está hecho.
