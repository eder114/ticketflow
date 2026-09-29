# -*- coding: utf-8 -*-
"""
Informe del taller de accesibilidad (a11y) de la Home Page de TicketFlow.

Arma el Word con la auditoría inicial y final de Lighthouse, la revisión de
contraste, las simulaciones de discapacidad visual, la prueba de teclado y la
matriz de pruebas manuales para firmar.

Uso: python informe_a11y.py <carpeta con las capturas e informes>
"""
import os, sys
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

AQUI = os.path.dirname(os.path.abspath(__file__))
EV = sys.argv[1] if len(sys.argv) > 1 else AQUI
SALIDA = os.path.join(AQUI, "Taller_Accesibilidad_TicketFlow.docx")

AZUL = RGBColor(0x49, 0x3E, 0xE5)
TINTA = RGBColor(0x19, 0x1C, 0x1E)
GRIS = RGBColor(0x5A, 0x58, 0x68)
VERDE = RGBColor(0x15, 0x80, 0x3D)
ROJO = RGBColor(0xB9, 0x1C, 0x1C)

doc = Document()
st = doc.styles["Normal"]
st.font.name = "Calibri"; st.font.size = Pt(11); st.font.color.rgb = TINTA
st._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
st.paragraph_format.space_after = Pt(8); st.paragraph_format.line_spacing = 1.25
for nivel, tam in ((1, 15), (2, 12.5)):
    h = doc.styles["Heading %d" % nivel]
    h.font.name = "Calibri"; h.font.size = Pt(tam); h.font.bold = True
    h.font.color.rgb = TINTA if nivel == 1 else AZUL
    h.paragraph_format.space_before = Pt(14); h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
for s in doc.sections:
    s.top_margin = s.bottom_margin = Cm(2.2)
    s.left_margin = s.right_margin = Cm(2.3)
ANCHO = 16.4


def p(t="", tam=None, negrita=False, cursiva=False, color=None, centro=False, antes=None, despues=None):
    par = doc.add_paragraph()
    if t:
        r = par.add_run(t); r.bold = negrita; r.italic = cursiva
        if tam: r.font.size = Pt(tam)
        if color: r.font.color.rgb = color
    if centro: par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if antes is not None: par.paragraph_format.space_before = Pt(antes)
    if despues is not None: par.paragraph_format.space_after = Pt(despues)
    return par


def vineta(texto, inicio=""):
    par = doc.add_paragraph(style="List Bullet")
    par.paragraph_format.space_after = Pt(3)
    if inicio:
        par.add_run(inicio).bold = True
    par.add_run(texto)
    return par


def sombra(celda, color):
    tc = celda._tc.get_or_add_tcPr(); sh = OxmlElement("w:shd")
    sh.set(qn("w:val"), "clear"); sh.set(qn("w:fill"), color); tc.append(sh)


def tabla(cab, filas, anchos, tam=9.5, colorear=None):
    t = doc.add_table(rows=1, cols=len(cab)); t.style = "Table Grid"; t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(cab):
        c = t.rows[0].cells[i]; c.text = ""
        r = c.paragraphs[0].add_run(h); r.bold = True; r.font.size = Pt(tam); r.font.color.rgb = GRIS
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER; sombra(c, "EDECFC")
    for fila in filas:
        cs = t.add_row().cells
        for i, v in enumerate(fila):
            cs[i].text = ""; par = cs[i].paragraphs[0]; par.paragraph_format.space_after = Pt(1)
            r = par.add_run(str(v)); r.font.size = Pt(tam)
            if colorear and i == colorear:
                if "PASA" in str(v) or "Cumple" in str(v): r.font.color.rgb = VERDE; r.bold = True
                elif "FALLA" in str(v) or "No cumple" in str(v): r.font.color.rgb = ROJO; r.bold = True
    for fila in t.rows:
        for i, a in enumerate(anchos):
            fila.cells[i].width = Cm(a)
    return t


def figura(archivo, pie, ancho=ANCHO):
    ruta = os.path.join(EV, archivo)
    if not os.path.exists(ruta):
        print("FALTA:", ruta); return
    doc.add_picture(ruta, width=Cm(ancho))
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    p(pie, tam=9, cursiva=True, color=GRIS, centro=True, antes=3, despues=12)


def salto():
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)


# ============================================================== portada ===
for _ in range(4):
    doc.add_paragraph()
p("Taller de accesibilidad web", tam=24, negrita=True, centro=True, despues=6)
p("Auditoría y refactorización de la Home Page de TicketFlow", tam=13, color=GRIS, centro=True, despues=30)
p("Ambiente Web I · Accesibilidad y estándares WCAG / ARIA", tam=11.5, centro=True, despues=2)
p("Proyecto Integrador 2026-2", tam=11.5, color=GRIS, centro=True, despues=24)
p("Integrantes", tam=10.5, negrita=True, centro=True, despues=4)
for n, cod in (("Eder Fabián Rodríguez Murillo", "230251029"),
               ("Alex Andrés Cruz Rueda", "230251088"),
               ("Jorge Andrés Marín Díaz", "230251073"),
               ("Samuel Uribe Naranjo", "230251048"),
               ("Eduardo José Benítez Guevara", "")):
    p(n + ("  ·  Código " + cod if cod else ""), tam=11.5, centro=True, despues=2)
p("Unidad Central del Valle del Cauca · Tuluá", tam=11, negrita=True, centro=True, antes=24, despues=2)
p("29 de septiembre de 2026", tam=11, color=GRIS, centro=True)
par = p("Página auditada: ", tam=10.5, centro=True, antes=14)
r = par.add_run("https://eder114.github.io/ticketflow/frontend/")
r.font.size = Pt(10.5); r.font.color.rgb = AZUL
salto()

# ============================================================ resumen =====
doc.add_heading("Resumen", level=1)
p("Auditamos la Home Page de TicketFlow con Lighthouse, revisamos el contraste de todos los "
  "colores del sistema de diseño, simulamos cuatro condiciones visuales, recorrimos la página "
  "solo con el teclado y revisamos cómo la anuncia un lector de pantalla. Después corregimos "
  "lo que encontramos.")
tabla(["", "Antes", "Después"],
      [["Puntaje de accesibilidad (Lighthouse)", "96 / 100", "100 / 100"],
       ["Auditorías aprobadas", "25", "25"],
       ["Auditorías fallidas", "1 (contraste de color)", "0"],
       ["Pares de color que no llegaban a 4.5:1", "5 de 15", "0 de 15"],
       ["Orden de tabulación completo desde el inicio", "No", "Sí"],
       ["Elementos con foco visible", "Parcial", "Todos"]],
      [8.4, 4.0, 4.0], colorear=2)
p("")
p("Los cambios están publicados y el código fuente está en el repositorio del equipo.", tam=10, color=GRIS)

# ============================================================== FASE 1 ====
salto()
doc.add_heading("Fase 1 · Auditoría automática con Lighthouse", level=1)
p("Ejecutamos Lighthouse sobre la Home Page publicada, seleccionando únicamente la categoría "
  "Accessibility. La auditoría inicial dio 96 sobre 100, con una sola auditoría fallida.")

doc.add_heading("Resultado inicial", level=2)
figura("lighthouse-inicial.png", "Figura 1. Auditoría inicial: 96 / 100.", 12)
p("El fallo fue color-contrast, en 6 elementos: el texto «COP · PRECIO FINAL» de las tarjetas "
  "de evento. El verde #16A34A sobre blanco da una relación de 3.29:1, y el nivel AA de WCAG "
  "exige 4.5:1 para texto normal.")

doc.add_heading("Resultado final", level=2)
figura("lighthouse-final.png", "Figura 2. Auditoría final: 100 / 100, sin fallos.", 12)

doc.add_heading("Evaluación bajo el acrónimo POUR", level=2)
tabla(["Principio", "Qué revisamos", "Resultado"],
      [["Perceptible", "Contraste de todos los colores, textos alternativos de las imágenes y que el color no sea el único medio para dar información.",
        "Se corrigieron 5 pares de color. Las 6 imágenes de la portada tienen alt descriptivo."],
       ["Operable", "Recorrido completo con Tab, foco siempre visible y enlace para saltar al contenido.",
        "Se corrigió el orden de tabulación y se agregó contorno de foco donde faltaba."],
       ["Comprensible", "Idioma declarado, etiquetas de formulario, mensajes de error claros y orden lógico de títulos.",
        "La página declara lang=\"es\". Cada campo tiene su etiqueta y su mensaje de error asociado."],
       ["Robusto", "HTML válido, uso de etiquetas semánticas y atributos ARIA correctos.",
        "Validador del W3C: 0 errores en HTML y en CSS."]],
      [3.0, 7.0, 6.4])

# ============================================================== FASE 2 ====
salto()
doc.add_heading("Fase 2 · Contraste y simulación visual", level=1)
doc.add_heading("Verificación de contraste (WCAG nivel AA)", level=2)
p("Calculamos la relación de contraste de los 15 pares de color del sistema de diseño. El "
  "mínimo para texto normal es 4.5:1. Cinco pares no lo cumplían y se corrigieron.")
tabla(["Uso", "Color antes", "Ratio", "Color ahora", "Ratio", "Estado"],
      [["Precio final en las tarjetas", "#16A34A", "3.30", "#15803D", "5.02", "Cumple"],
       ["Chip de estado Reservada", "#D97706", "2.86", "#96470A", "5.89", "Cumple"],
       ["Chip de estado Confirmada", "#16A34A", "3.00", "#15803D", "4.57", "Cumple"],
       ["Chip de estado Cancelada", "#DC2626", "3.95", "#B91C1C", "5.30", "Cumple"],
       ["Textos de ayuda de los formularios", "#94A3B8", "2.56", "#64748B", "4.76", "Cumple"],
       ["Texto general sobre blanco", "#111827", "17.74", "sin cambio", "17.74", "Cumple"],
       ["Párrafos secundarios", "#64748B", "4.76", "sin cambio", "4.76", "Cumple"],
       ["Enlaces", "#4238C9", "7.95", "sin cambio", "7.95", "Cumple"],
       ["Texto del hero sobre la foto", "#E2E8F0", "14.39", "sin cambio", "14.39", "Cumple"],
       ["Texto del botón primario", "#FFFFFF", "4.70", "sin cambio", "4.70", "Cumple"]],
      [5.2, 2.6, 1.8, 2.6, 1.8, 2.4], colorear=5)

doc.add_heading("La regla de oro: no depender del color", level=2)
p("Revisamos que ningún mensaje dependa solo del color:")
vineta("cada mensaje lleva un icono redondo con un signo de admiración y el texto explicativo, además del color rojo.", "Errores de formulario: ")
vineta("dicen Reservada, Confirmada o Cancelada con palabras, no solo con el color de fondo.", "Chips de estado: ")
vineta("la categoría de cada evento se lee como texto («Festival», «Concierto»), no por color.", "Categorías: ")

doc.add_heading("Simulación de discapacidades visuales", level=2)
p("Aplicamos sobre la Home las matrices de simulación de Machado, Oliveira y Fernandes (2009), "
  "que son las mismas que usa Color Oracle, más un desenfoque para simular cataratas.")
figura("simulaciones-visuales.png", "Figura 3. La Home Page bajo protanopia, deuteranopia, acromatopsia y visión borrosa.")
p("En las cuatro simulaciones se siguen distinguiendo el botón principal, los campos del "
  "buscador y las tarjetas de evento. En acromatopsia, que es el caso más exigente, la "
  "información sigue siendo legible porque el diseño se apoya en el contraste claro-oscuro y "
  "en el texto, no en el tono del color.")

# ============================================================== FASE 3 ====
salto()
doc.add_heading("Fase 3 · Navegación por teclado", level=1)
p("Recorrimos la Home Page sin mouse, solo con Tab y Shift + Tab, registrando qué elemento "
  "recibía el foco en cada paso y si el foco se veía.")

doc.add_heading("Lo que encontramos", level=2)
tabla(["Hallazgo", "Por qué es un problema", "Corrección"],
      [["Al cargar la página, el foco saltaba directo al título.",
        "El primer Tab se saltaba el enlace «Saltar al contenido» y todo el menú: un usuario de teclado no podía llegar a ellos.",
        "El foco ahora solo se mueve al título cuando se cambia de pantalla, no al cargar."],
       ["Los chips de ciudad, fecha y tipo solo cambiaban de color de fondo al recibir el foco.",
        "El cambio es muy sutil y no se distingue bien.",
        "Se les agregó un contorno de 3 px."],
       ["El campo de búsqueda dependía del resalte de la píldora que lo rodea.",
        "No quedaba claro qué elemento tenía el foco.",
        "Se le agregó contorno propio."]],
      [4.6, 6.2, 5.6])

doc.add_heading("Orden de tabulación comprobado", level=2)
p("Este es el recorrido real registrado después de las correcciones, desde el primer Tab:")
tabla(["#", "Elemento", "Foco visible"],
      [["1", "Enlace «Saltar al contenido»", "Contorno"],
       ["2", "Logo TicketFlow", "Contorno"],
       ["3", "Menú: Inicio", "Contorno"],
       ["4", "Menú: Eventos", "Contorno"],
       ["5", "Menú: Categorías", "Contorno"],
       ["6", "Menú: Cómo funciona", "Contorno"],
       ["7", "Botón Iniciar sesión", "Contorno"],
       ["8", "Botón Registrarse", "Contorno"],
       ["9", "Campo de búsqueda", "Contorno"],
       ["10", "Botón Buscar", "Contorno"],
       ["11 en adelante", "Chips de ciudad, fecha y tipo, categorías, tarjetas de evento y pie de página", "Contorno"]],
      [2.4, 10.0, 4.0])
p("No hay ningún elemento con tabindex positivo, así que el orden del foco es el mismo del "
  "documento. Tampoco se usa outline: none sin reemplazo: el estilo base define un contorno "
  "de 3 px para :focus-visible.", tam=10, color=GRIS)

# ============================================================== FASE 4 ====
doc.add_heading("Fase 4 · Lectores de pantalla", level=1)
p("Revisamos el árbol de accesibilidad de la página, que es la información que recibe un "
  "lector como NVDA, ChromeVox o VoiceOver.")
tabla(["Qué revisamos", "Resultado"],
      [["Idioma de la página", "lang=\"es\", así el lector usa la pronunciación en español"],
       ["Regiones (landmarks)", "header, nav («Navegación principal»), main, footer («Pie de página») y cuatro secciones con su título asociado"],
       ["Imágenes", "6 imágenes informativas, todas con alt descriptivo"],
       ["Botones de solo icono", "El botón del menú se anuncia «Abrir menú» y el de búsqueda «Buscar»"],
       ["Chips del buscador", "Se anuncian «Ciudad», «Fecha» y «Tipo» por su etiqueta asociada, más su estado abierto o cerrado"],
       ["Iconos decorativos", "26 elementos marcados con aria-hidden=\"true\" para que el lector los ignore"],
       ["Jerarquía de títulos", "Un solo h1, después h2 por sección y h3 en las tarjetas, sin saltos de nivel"],
       ["Mensajes dinámicos", "Los errores usan role=\"alert\" y los mensajes de éxito role=\"status\""]],
      [5.0, 11.4])

# ============================================================== FASE 5 ====
salto()
doc.add_heading("Fase 5 · Refactorización del código", level=1)
doc.add_heading("HTML semántico", level=2)
p("La Home Page ya estaba construida con etiquetas semánticas, así que no hubo «divitis» que "
  "corregir. La estructura es la siguiente:")
tabla(["Etiqueta", "Para qué se usa"],
      [["<header>", "Barra superior con el logo, el menú y los botones de sesión"],
       ["<nav>", "Menú principal, con su nombre accesible"],
       ["<main>", "Contenido de la pantalla"],
       ["<section>", "Hero, Categorías, Eventos destacados y Cómo funciona"],
       ["<article>", "Cada tarjeta de evento"],
       ["<form role=\"search\">", "Buscador del hero"],
       ["<footer>", "Pie de página"]],
      [4.4, 12.0])

doc.add_heading("Atributos ARIA agregados", level=2)
tabla(["Atributo", "Dónde", "Para qué"],
      [["aria-controls", "Botón del menú", "Dice qué elemento abre y cierra"],
       ["aria-expanded", "Botón del menú y chips del buscador", "Anuncia si está abierto o cerrado"],
       ["aria-labelledby", "Las cuatro secciones", "Cada región se anuncia con su propio título"],
       ["aria-current=\"page\"", "Enlace activo del menú", "Indica en qué pantalla está el usuario"],
       ["role=\"status\"", "Mensajes de éxito de los formularios", "El lector los anuncia al aparecer"],
       ["role=\"alert\"", "Mensajes de error", "Se anuncian de inmediato"],
       ["aria-label", "Pie de página, botones de icono y buscador", "Les da un nombre accesible"],
       ["aria-hidden=\"true\"", "Iconos decorativos", "El lector los ignora"],
       ["aria-describedby", "Campos de formulario", "Asocia el campo con su mensaje de error"]],
      [4.2, 6.0, 6.2])

p("Ejemplo del botón del menú, que solo tiene un icono:", antes=8)
par = doc.add_paragraph(); par.paragraph_format.left_indent = Cm(0.5)
r = par.add_run('<button class="menu-btn" type="button" aria-expanded="false"\n'
                '        aria-controls="nav-principal" aria-label="Abrir menú">☰</button>')
r.font.name = "Consolas"; r.font.size = Pt(9)
r._element.rPr.rFonts.set(qn("w:eastAsia"), "Consolas")

# ============================================================== MATRIZ ====
salto()
doc.add_heading("Matriz de pruebas manuales", level=1)
p("Pruebas hechas por el equipo sobre la Home Page publicada.")
tabla(["#", "Prueba", "Cómo se hizo", "Resultado", "Responsable"],
      [["1", "Recorrido completo con Tab", "Sin mouse, desde el primer Tab hasta el pie de página", "Correcto: 10 paradas en orden lógico", ""],
       ["2", "Regreso con Shift + Tab", "Recorrido inverso", "Correcto", ""],
       ["3", "Foco visible", "Se revisó el contorno en cada parada", "Todos los elementos lo muestran", ""],
       ["4", "Activación con Enter y Espacio", "En botones y enlaces del menú", "Correcto", ""],
       ["5", "Cierre con Escape", "En los paneles de ciudad, fecha y tipo", "Cierra y devuelve el foco al chip", ""],
       ["6", "Formulario sin llenar", "Se envió vacío el registro de cliente", "Muestra 6 errores con icono y texto", ""],
       ["7", "Contraste AA", "Cálculo de los 15 pares de color", "15 de 15 cumplen", ""],
       ["8", "Protanopia", "Simulación sobre la Home", "La interfaz sigue siendo legible", ""],
       ["9", "Deuteranopia", "Simulación sobre la Home", "La interfaz sigue siendo legible", ""],
       ["10", "Acromatopsia", "Simulación sobre la Home", "La interfaz sigue siendo legible", ""],
       ["11", "Visión borrosa", "Desenfoque sobre la Home", "Títulos y botones siguen distinguiéndose", ""],
       ["12", "Lector de pantalla", "Revisión del árbol de accesibilidad", "Regiones, imágenes y botones bien anunciados", ""],
       ["13", "Validación W3C", "Validadores de HTML y CSS", "0 errores", ""],
       ["14", "Lighthouse", "Categoría Accessibility", "100 / 100", ""]],
      [1.2, 3.6, 4.6, 4.4, 2.6])

p("Firmas del equipo", negrita=True, antes=20, despues=10)
tabla(["Integrante", "Código", "Firma"],
      [["Eder Fabián Rodríguez Murillo", "230251029", ""],
       ["Alex Andrés Cruz Rueda", "230251088", ""],
       ["Jorge Andrés Marín Díaz", "230251073", ""],
       ["Samuel Uribe Naranjo", "230251048", ""],
       ["Eduardo José Benítez Guevara", "", ""]],
      [7.0, 3.4, 6.0])
for fila in doc.tables[-1].rows[1:]:
    fila.height = Cm(1.1)

# --------------------------------------------------- número de página ----
par_pie = doc.sections[0].footer.paragraphs[0]
par_pie.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = par_pie.add_run(); run.font.size = Pt(9); run.font.color.rgb = GRIS
ini = OxmlElement("w:fldChar"); ini.set(qn("w:fldCharType"), "begin")
instr = OxmlElement("w:instrText"); instr.set(qn("xml:space"), "preserve"); instr.text = " PAGE "
fin = OxmlElement("w:fldChar"); fin.set(qn("w:fldCharType"), "end")
for nodo in (ini, instr, fin):
    run._r.append(nodo)

try:
    doc.save(SALIDA)
    print("Listo:", SALIDA, "%.1f KB" % (os.path.getsize(SALIDA) / 1024))
except PermissionError:
    print("OJO: el Word está abierto. Ciérrelo y vuelva a correr el script.")
