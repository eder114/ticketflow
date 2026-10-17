# Revisión de accesibilidad de las once pantallas

**Fecha:** 17 de octubre de 2026
**Herramienta:** axe-core 4.10.2 (el mismo motor que usa Lighthouse para la
categoría de accesibilidad), corriendo dentro del navegador sobre la página ya
conectada a la API.
**Reglas:** WCAG 2.0 A y AA, y WCAG 2.1 A y AA.
**Ancho de pantalla:** 375 px (celular), que es el caso más apretado.

El taller de accesibilidad (`Taller_Accesibilidad_TicketFlow.docx`) midió la
portada con Lighthouse: pasó de 96 a 100. Esta revisión es la que hicimos
después, cuando agregamos las pantallas que hablan con la base de datos
(mis reservas, el panel del organizador y los reportes), para comprobar que
esas tres no dañaron lo que ya estaba bien.

| Pantalla | Reglas que pasa | Problemas |
|---|---|---|
| Inicio | 23 | 0 |
| Catálogo | 24 | 0 |
| Detalle del evento | 27 | 0 |
| Iniciar sesión | 21 | 0 |
| Registro de cliente | 22 | 0 |
| Registro de organización | 22 | 0 |
| Alta de administrador | 21 | 0 |
| Mis reservas | 19 | 0 |
| Registrar evento | 20 | 0 |
| Panel del organizador | 27 | 0 |
| Reportes del administrador | 23 | 0 |

## Lo que se corrigió en esta revisión

Las tablas de reportes y de eventos ruedan de lado en celular, porque no caben
en 375 px. axe las marcó con `scrollable-region-focusable`: una zona que se
puede rodar pero a la que el teclado no llega deja por fuera a quien no usa
mouse. Se les puso `tabindex="0"`, `role="region"` y un `aria-label` con el
nombre de la tabla, y se les dejó un contorno visible cuando reciben el foco.
Después de eso las once pantallas quedaron sin ningún problema.

## Lo que esta revisión no cubre

Las herramientas automáticas no alcanzan a revisarlo todo. Lo que se probó a
mano quedó en el taller: el recorrido completo con el teclado, el contraste de
los colores y la lectura con lector de pantalla.
