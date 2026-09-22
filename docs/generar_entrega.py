# -*- coding: utf-8 -*-
"""
Arma la carpeta de entrega para el profesor en Descargas:

  Entrega_TicketFlow_22-sep/
    1_Codigo_HTML5_CSS3/      la página: index.html, css/, js/, img/
    2_Informe_Jira_GitHub_Scrum.docx
    3_Scrum_Daily_Sprint1.xlsx
    4_Capturas/               la Home en celular, tablet y escritorio
    Repositorio_GitHub.url    acceso directo al repositorio

Uso:  python generar_entrega.py <carpeta con las capturas de Jira>
"""

import os, shutil, subprocess, sys
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
JIRA = sys.argv[1]
DESTINO = os.path.join(os.path.expanduser("~"), "Downloads", "Entrega_TicketFlow_22-sep")
REPO = "https://github.com/eder114/ticketflow"
PAGINA = "https://eder114.github.io/ticketflow/sprint1/"
CAPTURAS = os.path.join(AQUI, "capturas")

AZUL = RGBColor(0x49, 0x3E, 0xE5)
TINTA = RGBColor(0x19, 0x1C, 0x1E)
GRIS = RGBColor(0x5A, 0x58, 0x68)

PUNTOS = [
    ("1. Maquetación Web Responsiva",
     "Diseñar e implementar en HTML5 y CSS3 de la Home Page principal del Proyecto Integrador "
     "alineada con la maquetación Mobile-First."),
    ("2. Trazabilidad y Gestión en Jira",
     "Modelar el trabajo en Jira mediante Historias de Usuario, Tareas y Subtareas asociadas al "
     "maquetado de la interfaz."),
    ("3. Control de Versiones en GitHub",
     "Consolidar la estructura de carpetas y código fuente en un repositorio del equipo."),
    ("4. Seguimiento Ágil (Scrum Daily)",
     "Documentar la tabla de reuniones diarias integrando impedimentos, soluciones e indicadores "
     "de avance."),
]

# ============================================================== carpeta ==
# Se reemplaza cada parte por separado, sin borrar la carpeta entera: si el
# Word está abierto, lo demás igual queda actualizado.
os.makedirs(DESTINO, exist_ok=True)
codigo = os.path.join(DESTINO, "1_Codigo_HTML5_CSS3")
if os.path.exists(codigo):
    shutil.rmtree(codigo)
shutil.copytree(os.path.join(RAIZ, "sprint1"), codigo,
                ignore=shutil.ignore_patterns("_prueba*", "*.bak"))
with open(os.path.join(codigo, "LEEME.txt"), "w", encoding="utf-8") as f:
    f.write("""TicketFlow · Sprint 1 · Página de inicio Mobile-First
======================================================

Cómo abrirla: doble clic en index.html. Se abre en el navegador; no
necesita instalar nada ni conexión a un servidor.

Archivos:
  index.html        HTML5. Las 5 pantallas en una sola página: inicio,
                    inicio de sesión y registro de cliente, agente y
                    administrador.
  css/estilos.css   CSS3. Sistema de diseño escrito Mobile-First: los
                    estilos base son los del celular (360 px) y tablet y
                    escritorio se agregan con @media (min-width):
                    576, 768 y 1024 px.
  js/app.js         Navegación entre pantallas, validación de formularios,
                    menú del celular y buscador (listas y calendario).
  img/              Fotografías de los eventos.

Para ver los tamaños en el computador: abrir index.html en Chrome o
Edge, presionar F12 y luego Ctrl + Shift + M, y elegir el dispositivo
(iPhone, iPad, etc.) en la barra de arriba.

Validación W3C (validator.w3.org y jigsaw.w3.org/css-validator):
0 errores en HTML y 0 errores en CSS.

Página en línea: %s
Repositorio: %s
""" % (PAGINA, REPO))

caps = os.path.join(DESTINO, "4_Capturas")
os.makedirs(caps, exist_ok=True)
for nombre, dest in (("home-movil.png", "Home_celular_360px.png"),
                     ("home-tablet.png", "Home_tablet_768px.png"),
                     ("home-escritorio.png", "Home_escritorio_1440px.png"),
                     ("home-comparativa.png", "Home_comparativa_3_tamanos.png"),
                     ("qr-ticketflow.png", "QR_pagina_en_linea.png")):
    shutil.copy(os.path.join(CAPTURAS, nombre), os.path.join(caps, dest))

shutil.copy(os.path.join(AQUI, "entregables", "Scrum_Daily_Sprint1_TicketFlow.xlsx"),
            os.path.join(DESTINO, "3_Scrum_Daily_Sprint1.xlsx"))

with open(os.path.join(DESTINO, "Repositorio_GitHub.url"), "w", encoding="utf-8") as f:
    f.write("[InternetShortcut]\nURL=%s\n" % REPO)
with open(os.path.join(DESTINO, "Pagina_en_linea.url"), "w", encoding="utf-8") as f:
    f.write("[InternetShortcut]\nURL=%s\n" % PAGINA)

# ================================================================= Word ==
doc = Document()
st = doc.styles["Normal"]
st.font.name = "Calibri"; st.font.size = Pt(11); st.font.color.rgb = TINTA
st._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
st.paragraph_format.space_after = Pt(6); st.paragraph_format.line_spacing = 1.2
for nivel, tam in ((1, 16), (2, 13)):
    h = doc.styles["Heading %d" % nivel]
    h.font.name = "Cambria"; h.font.size = Pt(tam); h.font.bold = True
    h.font.color.rgb = TINTA if nivel == 1 else AZUL
    h.paragraph_format.space_before = Pt(16 if nivel == 1 else 10)
    h.paragraph_format.space_after = Pt(6); h.paragraph_format.keep_with_next = True
for s in doc.sections:
    s.top_margin = s.bottom_margin = Cm(2.2)
    s.left_margin = s.right_margin = Cm(2.3)
ANCHO = 16.4  # cm de texto


def p(texto="", tam=None, negrita=False, cursiva=False, color=None, centro=False, antes=None, despues=None):
    par = doc.add_paragraph()
    if texto:
        r = par.add_run(texto); r.bold = negrita; r.italic = cursiva
        if tam: r.font.size = Pt(tam)
        if color: r.font.color.rgb = color
    if centro: par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if antes is not None: par.paragraph_format.space_before = Pt(antes)
    if despues is not None: par.paragraph_format.space_after = Pt(despues)
    return par


def enlace(par, url, texto=None):
    rid = par.part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    h = OxmlElement("w:hyperlink"); h.set(qn("r:id"), rid)
    r = OxmlElement("w:r"); rpr = OxmlElement("w:rPr")
    c = OxmlElement("w:color"); c.set(qn("w:val"), "493EE5"); rpr.append(c)
    u = OxmlElement("w:u"); u.set(qn("w:val"), "single"); rpr.append(u)
    r.append(rpr); t = OxmlElement("w:t"); t.text = texto or url; r.append(t); h.append(r)
    par._p.append(h)


def sombra(celda, color):
    tc = celda._tc.get_or_add_tcPr(); sh = OxmlElement("w:shd")
    sh.set(qn("w:val"), "clear"); sh.set(qn("w:fill"), color); tc.append(sh)


def tabla(cab, filas, anchos, tam=9, centrar=()):
    t = doc.add_table(rows=1, cols=len(cab)); t.style = "Table Grid"; t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(cab):
        c = t.rows[0].cells[i]; c.text = ""; r = c.paragraphs[0].add_run(h)
        r.bold = True; r.font.size = Pt(tam); r.font.color.rgb = GRIS
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER; sombra(c, "EDECFC")
    for fila in filas:
        cs = t.add_row().cells
        for i, v in enumerate(fila):
            cs[i].text = ""; par = cs[i].paragraphs[0]; par.paragraph_format.space_after = Pt(1)
            r = par.add_run(str(v)); r.font.size = Pt(tam)
            if i in centrar: par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for fila in t.rows:
        for i, a in enumerate(anchos): fila.cells[i].width = Cm(a)
    return t


def figura(ruta, pie, ancho=ANCHO):
    doc.add_picture(ruta, width=Cm(ancho))
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    p(pie, tam=9, cursiva=True, color=GRIS, centro=True, antes=2, despues=12)


def salto():
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)


def requisito(i):
    """Recuadro con el texto exacto del punto que pidió el profesor."""
    doc.add_heading(PUNTOS[i][0], level=1)
    t = doc.add_table(rows=1, cols=1); t.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = t.rows[0].cells[0]; c.width = Cm(ANCHO); sombra(c, "F1F0FF")
    par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(2)
    r = par.add_run("Lo que pide el profesor: "); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = AZUL
    r = par.add_run(PUNTOS[i][1]); r.italic = True; r.font.size = Pt(10)
    p("", despues=2)
    doc.add_heading("Cómo lo cumplimos", level=2)


# --- portada -----------------------------------------------------------------
for _ in range(5): doc.add_paragraph()
p("TICKETFLOW", tam=30, negrita=True, color=AZUL, centro=True, despues=2)
p("Entrega de la actividad del 22 de septiembre", tam=16, negrita=True, centro=True, despues=4)
p("Maquetación web responsiva, Jira, GitHub y Scrum Daily",
  tam=12, color=GRIS, centro=True, despues=30)
p("Bases de Datos y Programación en Ambiente Web I · Proyecto Integrador 2026-2",
  tam=10.5, color=GRIS, centro=True, despues=26)
for n in ("Eder Fabián Rodríguez Murillo", "Eduardo José Benítez Guevara",
          "Jorge Andrés Marín Díaz", "Samuel Uribe Naranjo"):
    p(n, tam=11.5, centro=True, despues=2)
p("Unidad Central del Valle del Cauca — UCEVA · Tuluá", tam=11, negrita=True, centro=True, antes=30, despues=2)
p("22 de septiembre de 2026", tam=11, color=GRIS, centro=True)
par = p("Página en línea: ", tam=11, centro=True, antes=18); enlace(par, PAGINA)
par = p("Repositorio: ", tam=11, centro=True); enlace(par, REPO)
salto()

# --- 0. contenido de la entrega ----------------------------------------------
doc.add_heading("Resumen de la entrega", level=1)
tabla(["Punto", "Qué entregamos", "Dónde está"],
      [[PUNTOS[0][0], "Home Page en HTML5 y CSS3 escrita Mobile-First, publicada en línea, 0 errores en el validador W3C.",
        "1_Codigo_HTML5_CSS3/ · página en línea · sección 1"],
       [PUNTOS[1][0], "1 historia de usuario, 2 tareas y 28 subtareas en el proyecto SDGE, con puntos, duración, fechas y responsable.",
        "Sección 2 · capturas de Jira"],
       [PUNTOS[2][0], "Repositorio del equipo con la estructura de carpetas, el código y el historial de cambios.",
        "Sección 3 · Repositorio_GitHub.url"],
       [PUNTOS[3][0], "Tabla de reuniones diarias, burndown del sprint e impedimentos con su solución.",
        "3_Scrum_Daily_Sprint1.xlsx · sección 4"]],
      [4.2, 7.6, 4.6], tam=9)
p("")
doc.add_heading("Archivos de la carpeta", level=2)
tabla(["Archivo o carpeta", "Qué contiene"],
      [["1_Codigo_HTML5_CSS3/", "La página: index.html (HTML5), css/estilos.css (CSS3), js/app.js e img/. Se abre con doble clic en index.html."],
       ["2_Informe_Jira_GitHub_Scrum.docx", "Este documento: trazabilidad en Jira, control de versiones y Scrum Daily."],
       ["3_Scrum_Daily_Sprint1.xlsx", "Tabla de reuniones diarias, burndown del sprint e impedimentos."],
       ["4_Capturas/", "La página de inicio en celular (360 px), tablet (768 px) y escritorio (1440 px)."],
       ["Repositorio_GitHub.url", "Acceso directo a " + REPO],
       ["Pagina_en_linea.url", "Acceso directo a la página publicada: " + PAGINA]],
      [5.4, 11.0], tam=9.5)

# --- 1. maquetación ------------------------------------------------------------
requisito(0)
p("La página de inicio está construida en HTML5 semántico (header, nav, main, section, "
  "article, footer, form con role=\"search\") y CSS3. La hoja de estilos está escrita "
  "primero para celular: los estilos base de cada bloque corresponden a una pantalla de "
  "360 px, y tablet y escritorio se agregan encima solo con @media (min-width). No hay "
  "ninguna regla de maquetación con max-width.")
tabla(["Punto de corte", "Qué cambia"],
      [["Base · 360 px", "Menú desplegable; buscador en píldora con chips de ciudad, fecha y tipo; eventos en 1 columna; categorías de a 2."],
       ["min-width: 576px", "Eventos y formularios en 2 columnas; pie en 2 columnas."],
       ["min-width: 768px", "Categorías y pasos en fila; márgenes laterales de 40 px."],
       ["min-width: 1024px", "Barra de navegación completa; buscador en una sola barra; eventos en 3 columnas; pie en 4 columnas."],
       ["1280 px", "Ancho máximo del contenido."]],
      [3.6, 12.8], tam=9.5)
p("")
p("Verificación: sin desplazamiento horizontal a 360, 768, 1024 y 1440 px, y 0 errores en el "
  "validador del W3C tanto en HTML (validator.w3.org) como en CSS (jigsaw.w3.org/css-validator).")
figura(os.path.join(CAPTURAS, "home-comparativa.png"),
       "Figura 1. La página de inicio en celular, tablet y escritorio.")
par = p("La página está publicada con GitHub Pages y se abre desde cualquier celular, tablet o computador: ")
enlace(par, PAGINA)
doc.add_picture(os.path.join(CAPTURAS, "qr-ticketflow.png"), width=Cm(4.5))
doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
p("Código QR de la página.", tam=9, cursiva=True, color=GRIS, centro=True, despues=12)

# --- 2. jira -------------------------------------------------------------------
salto()
requisito(1)
p("El trabajo del maquetado se modeló en el proyecto SDGE de Jira, dentro del sprint en curso "
  "(9 al 28 de septiembre de 2026): una historia de usuario para la maquetación Mobile-First, "
  "una tarea para el repositorio y otra para el Scrum Daily, cada una con sus subtareas. "
  "Además se agregaron subtareas a las historias de la página de inicio que ya existían. Los puntos siguen la escala del curso: XS = 1 (menos de 3 horas), S = 3 (1 día), "
  "M = 5 (2 a 3 días), L = 8 (1 semana).")

doc.add_heading("Historia de usuario y tareas nuevas", level=2)
tabla(["Clave", "Tipo", "Actividad", "Responsable", "SP", "Talla · duración", "Inicio", "Fin", "Estado"],
      [["SDGE-14", "Historia", "Maquetación Mobile-First de la página de inicio", "Jorge Marín", "3", "S · 1 día (7 h)", "22/09", "22/09", "Finalizada"],
       ["SDGE-21", "Tarea", "Consolidar la estructura del repositorio en GitHub", "Eder Rodríguez", "1", "XS · menos de 3 h", "22/09", "22/09", "Por hacer"],
       ["SDGE-26", "Tarea", "Documentar el Scrum Daily del Sprint 1", "Eduardo Benítez", "3", "S · 1 día, repartido", "09/09", "28/09", "Por hacer"]],
      [1.5, 1.4, 4.0, 2.0, 0.8, 2.4, 1.2, 1.2, 1.9], tam=8.5, centrar=(4, 6, 7))

doc.add_heading("Subtareas", level=2)
SUB = [
    ("SDGE-14", [("SDGE-15", "Pasar los estilos base a celular (360 px)", "Finalizada"),
                 ("SDGE-16", "Reescribir las media queries con min-width", "Finalizada"),
                 ("SDGE-17", "Adaptar el encabezado y el menú móvil", "Finalizada"),
                 ("SDGE-18", "Adaptar el buscador y la grilla de eventos", "Finalizada"),
                 ("SDGE-19", "Probar en 360, 768, 1024 y 1440 px", "Finalizada"),
                 ("SDGE-20", "Validar HTML y CSS en el W3C", "Finalizada")]),
    ("SDGE-21", [("SDGE-22", "Revisar y ordenar la estructura de carpetas", "Finalizada"),
                 ("SDGE-23", "Actualizar el README", "Finalizada"),
                 ("SDGE-24", "Invitar a los colaboradores", "Por hacer"),
                 ("SDGE-25", "Subir la versión final a main", "Finalizada")]),
    ("SDGE-26", [("SDGE-27", "Crear la plantilla de la tabla", "Finalizada"),
                 ("SDGE-28", "Registrar las reuniones diarias", "Por hacer"),
                 ("SDGE-29", "Calcular el indicador de avance (burndown)", "Finalizada"),
                 ("SDGE-30", "Escribir el resumen de cierre", "Por hacer")]),
    ("SDGE-12 Hoja de estilos", [("SDGE-31", "Definir las variables de color de Figma", "Finalizada"),
                                 ("SDGE-32", "Definir la tipografía y los espaciados", "Finalizada"),
                                 ("SDGE-33", "Definir los radios y las sombras", "Finalizada")]),
    ("SDGE-3 Encabezado", [("SDGE-34", "Maquetar el logo y la navegación", "Finalizada"),
                           ("SDGE-35", "Botones de iniciar sesión y registrarse", "Finalizada"),
                           ("SDGE-36", "Estado activo del enlace", "Finalizada")]),
    ("SDGE-2 Página de inicio", [("SDGE-37", "Estructura semántica (header, main, footer)", "Finalizada"),
                                 ("SDGE-38", "Secciones de la página", "Finalizada"),
                                 ("SDGE-39", "Pie de página", "Finalizada")]),
    ("SDGE-4 Hero con buscador", [("SDGE-40", "Formulario de búsqueda con labels", "Finalizada"),
                                  ("SDGE-41", "Fotografía de fondo del hero", "Finalizada"),
                                  ("SDGE-42", "Botones de acción", "Finalizada")]),
    ("SDGE-11 Destacados y categorías", [("SDGE-43", "Componente de tarjeta de evento", "Finalizada"),
                                         ("SDGE-44", "Grilla de tarjetas", "Finalizada"),
                                         ("SDGE-45", "Filtros por categoría", "Finalizada")]),
]
filas = []
for padre, subs in SUB:
    for i, (k, t, e) in enumerate(subs):
        filas.append([padre if i == 0 else "", k, t, e])
tabla(["Pertenece a", "Clave", "Subtarea", "Estado"], filas, [4.2, 1.8, 7.6, 2.8], tam=8.5, centrar=(1,))
p("En Jira las subtareas no llevan puntos: los puntos van en la historia o tarea que las "
  "contiene.", tam=9.5, cursiva=True, color=GRIS, antes=4)

doc.add_heading("Puntos por integrante en el sprint", level=2)
tabla(["Responsable", "Puntos del Sprint 1"],
      [["Eder Fabián Rodríguez Murillo", "14 SP"], ["Eduardo José Benítez Guevara", "16 SP"],
       ["Jorge Andrés Marín Díaz", "13 SP"], ["Samuel Uribe Naranjo", "13 SP"],
       ["Total · 14 historias y tareas, 29 subtareas", "56 SP"]],
      [10.0, 6.4], tam=9.5, centrar=(1,))

doc.add_heading("Evidencia: capturas de Jira", level=2)
CAPJ = [("01-backlog-sprint1.jpg", "Figura 2. Backlog del Sprint 1: estado, fecha de vencimiento y puntos de cada actividad."),
        ("02-SDGE-14.jpg", "Figura 3. SDGE-14: descripción paso a paso, talla, puntos, duración, fechas y responsable."),
        ("03-SDGE-14-subtareas.jpg", "Figura 4. Las 6 subtareas de SDGE-14, todas finalizadas."),
        ("04-SDGE-21.jpg", "Figura 5. SDGE-21: consolidar la estructura del repositorio en GitHub."),
        ("05-SDGE-21-subtareas.jpg", "Figura 6. Subtareas de SDGE-21: queda pendiente invitar a los colaboradores."),
        ("06-SDGE-26.jpg", "Figura 7. SDGE-26: documentar el Scrum Daily del Sprint 1."),
        ("07-SDGE-26-subtareas.jpg", "Figura 8. Subtareas de SDGE-26: la plantilla y el burndown están listos.")]
for archivo, pie in CAPJ:
    figura(os.path.join(JIRA, archivo), pie)

# --- 3. github -----------------------------------------------------------------
salto()
requisito(2)
par = p("Repositorio del equipo: "); enlace(par, REPO)
p("Estructura de carpetas:")
estructura = ("ticketflow/\n"
              "├── sprint1/          Entrega actual: la página\n"
              "│   ├── index.html    las 5 pantallas en una sola página\n"
              "│   ├── css/          estilos.css, sistema de diseño Mobile-First\n"
              "│   ├── js/           app.js: navegación, validación y buscador\n"
              "│   └── img/          fotografías de los eventos\n"
              "├── docs/             documentación, capturas, Scrum Daily\n"
              "├── frontend/         prototipos anteriores de la interfaz\n"
              "├── unificado/        prototipo navegable con todas las pantallas\n"
              "├── backend/          API · Sprint 2\n"
              "└── database/         esquema PostgreSQL · Sprint 2")
par = doc.add_paragraph(); r = par.add_run(estructura); r.font.name = "Consolas"; r.font.size = Pt(9)
r._element.rPr.rFonts.set(qn("w:eastAsia"), "Consolas")

p("Commits de esta entrega:", antes=8)
log = subprocess.run(["git", "-C", RAIZ, "log", "--format=%h|%ad|%s", "--date=format:%d/%m/%Y %H:%M",
                      "--since=2026-09-22", "--", "sprint1", "README.md", "docs/capturas",
                      "docs/entregables/Scrum_Daily_Sprint1_TicketFlow.xlsx"],
                     capture_output=True, text=True, encoding="utf-8").stdout.strip().splitlines()
tabla(["Commit", "Fecha", "Descripción"], [l.split("|", 2) for l in log], [1.8, 3.0, 11.6], tam=9, centrar=(0,))

# --- 4. scrum ------------------------------------------------------------------
requisito(3)
p("La tabla completa está en 3_Scrum_Daily_Sprint1.xlsx, con cuatro hojas: el registro "
  "diario por integrante (14 días hábiles × 4 personas), el burndown, los impedimentos y "
  "un resumen. Los puntos terminados salen de la fecha en que cada historia pasó a "
  "Finalizada en Jira.")
doc.add_heading("Indicador de avance", level=2)
tabla(["Día", "Fecha", "Alcance", "Terminados", "Pendientes reales", "Pendientes ideales", "Avance"],
      [["1", "09/09", "49", "0", "49", "49,0", "0 %"], ["4", "14/09", "49", "14", "35", "37,7", "29 %"],
       ["8", "18/09", "49", "29", "20", "22,6", "59 %"], ["10", "22/09", "56", "47", "9", "15,1", "84 %"]],
      [1.2, 2.0, 2.0, 2.4, 3.0, 3.0, 2.8], tam=9, centrar=range(7))
p("El 22/09 el alcance subió de 49 a 56 SP al entrar SDGE-14, SDGE-21 y SDGE-26. A esa "
  "fecha el sprint va en 84 %, por delante de la línea ideal: quedan 9 SP (SDGE-10, SDGE-21 "
  "y SDGE-26).", antes=4)

doc.add_heading("Impedimentos y soluciones", level=2)
tabla(["Impedimento", "Solución", "Estado"],
      [["Samuel no aparecía en el proyecto de Jira y sus historias no tenían responsable.", "Se le invitó y se repartió el sprint entre los cuatro.", "Resuelto"],
       ["La pantalla de registro de administrador no existía en Figma.", "Se diseñó sobre el mismo sistema, con código de invitación.", "Resuelto"],
       ["GitHub rechazó el primer push por permisos de la cuenta.", "Se corrigió el acceso y se subió el Sprint 1.", "Resuelto"],
       ["El profesor señaló colores confusos y demasiado espacio en blanco.", "Se unificaron colores y se compactaron las secciones.", "Resuelto"],
       ["La hoja de estilos estaba escrita para escritorio (max-width).", "SDGE-14: se reescribió Mobile-First con min-width.", "Resuelto"],
       ["En celular, el menú abría los enlaces y botones uno encima del otro.", "El menú se despliega en el flujo, debajo del logo.", "Resuelto"],
       ["La tarjeta blanca del buscador tapaba la foto en celular.", "Buscador en píldora con chips (diseño B de Claude Design).", "Resuelto"],
       ["La lista de ciudades y el calendario del navegador no seguían el diseño.", "Se reemplazaron por paneles propios con el estilo de la página.", "Resuelto"],
       ["Los compañeros todavía no son colaboradores en GitHub.", "Invitarlos desde Settings → Collaborators (SDGE-24).", "Pendiente"]],
      [7.0, 7.0, 2.4], tam=8.5, centrar=(2,))

# número de página
par_pie = doc.sections[0].footer.paragraphs[0]; par_pie.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = par_pie.add_run(); run.font.size = Pt(9); run.font.color.rgb = GRIS
for tipo, texto in (("begin", None), (None, " PAGE "), ("end", None)):
    if tipo:
        e = OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"), tipo)
    else:
        e = OxmlElement("w:instrText"); e.set(qn("xml:space"), "preserve"); e.text = texto
    run._r.append(e)

ruta = os.path.join(DESTINO, "2_Informe_Jira_GitHub_Scrum.docx")
try:
    doc.save(ruta)
except PermissionError:
    print("OJO: el Word está abierto. Ciérrelo y vuelva a correr el script para actualizarlo.")
print("Carpeta:", DESTINO)
for base, _, archivos in os.walk(DESTINO):
    nivel = base.replace(DESTINO, "").count(os.sep)
    if nivel <= 1:
        print("  " * nivel + os.path.basename(base) + "/")
        for a in sorted(archivos):
            if nivel == 0 or base.endswith("4_Capturas") or base.endswith("HTML5_CSS3"):
                print("  " * (nivel + 1) + a)
