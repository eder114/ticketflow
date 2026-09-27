# -*- coding: utf-8 -*-
"""
Genera el documento Word con el modelo relacional de TicketFlow:
los dos diagramas (entidad-relacion y relacional) y las tablas.

Salida: database/Modelo_Relacional_TicketFlow.docx
"""

import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, "Modelo_Relacional_TicketFlow.docx")

AZUL = RGBColor(0x49, 0x3E, 0xE5)
TINTA = RGBColor(0x19, 0x1C, 0x1E)
GRIS = RGBColor(0x5A, 0x58, 0x68)

doc = Document()
st = doc.styles["Normal"]
st.font.name = "Calibri"; st.font.size = Pt(11); st.font.color.rgb = TINTA
st._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
st.paragraph_format.space_after = Pt(8); st.paragraph_format.line_spacing = 1.3
for nivel, tam in ((1, 15), (2, 12.5)):
    h = doc.styles["Heading %d" % nivel]
    h.font.name = "Calibri"; h.font.size = Pt(tam); h.font.bold = True
    h.font.color.rgb = TINTA if nivel == 1 else AZUL
    h.paragraph_format.space_before = Pt(14); h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
for s in doc.sections:
    s.top_margin = s.bottom_margin = Cm(2.3)
    s.left_margin = s.right_margin = Cm(2.4)
ANCHO = 16.2


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


def sombra(celda, color):
    tc = celda._tc.get_or_add_tcPr(); sh = OxmlElement("w:shd")
    sh.set(qn("w:val"), "clear"); sh.set(qn("w:fill"), color); tc.append(sh)


def tabla(cab, filas, anchos, tam=10):
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
    for fila in t.rows:
        for i, a in enumerate(anchos):
            fila.cells[i].width = Cm(a)
    return t


def esquema(nombre, atributos):
    """NOMBRE (pk, atributo, fk) con la llave primaria subrayada."""
    par = doc.add_paragraph(); par.paragraph_format.left_indent = Cm(0.5)
    par.paragraph_format.space_after = Pt(4)

    def run(txt, **kw):
        r = par.add_run(txt)
        r.font.name = "Consolas"; r.font.size = Pt(10.5)
        r._element.rPr.rFonts.set(qn("w:eastAsia"), "Consolas")
        for k, v in kw.items():
            if k == "color":
                r.font.color.rgb = v
            else:
                setattr(r, k, v)
        return r

    run(nombre, bold=True)
    run(" (")
    for i, (txt, tipo) in enumerate(atributos):
        if i:
            run(", ")
        kw = {}
        if tipo in ("pk", "pkfk"):
            kw["underline"] = True; kw["bold"] = True
        if tipo in ("fk", "pkfk"):
            kw["color"] = AZUL
        run(txt, **kw)
        if tipo in ("fk", "pkfk"):
            run("*", color=AZUL)
    run(")")
    return par


def figura(ruta, pie):
    if not os.path.exists(ruta):
        return
    doc.add_picture(ruta, width=Cm(ANCHO))
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    p(pie, tam=9.5, cursiva=True, color=GRIS, centro=True, antes=3, despues=12)


def salto():
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)


# ============================================================ portada =====
for _ in range(5):
    doc.add_paragraph()
p("Modelo relacional de TicketFlow", tam=24, negrita=True, centro=True, despues=6)
p("Del diagrama entidad-relación a las tablas", tam=13, color=GRIS, centro=True, despues=34)
p("Bases de Datos y Programación en Ambiente Web I", tam=11.5, centro=True, despues=2)
p("Proyecto Integrador 2026-2", tam=11.5, color=GRIS, centro=True, despues=26)
for n in ("Eder Fabián Rodríguez Murillo", "Eduardo José Benítez Guevara",
          "Jorge Andrés Marín Díaz", "Samuel Uribe Naranjo"):
    p(n, tam=11.5, centro=True, despues=2)
p("Unidad Central del Valle del Cauca", tam=11, negrita=True, centro=True, antes=26, despues=2)
p("Tuluá · Septiembre de 2026", tam=11, color=GRIS, centro=True)
salto()

# ============================================================ 1 ===========
doc.add_heading("1. Lo que hicimos", level=1)
p("Para esta entrega pasamos el diagrama entidad-relación de nuestro proyecto al modelo "
  "relacional, siguiendo los pasos que vimos en clase.")
p("Primero hicimos el diagrama entidad-relación con los datos del enunciado. Ahí quedaron "
  "diez entidades y once relaciones. Después lo convertimos en tablas. Cada entidad se "
  "volvió una tabla, y cada relación de uno a muchos se volvió una llave foránea en la "
  "tabla del lado de los muchos.")
p("El teléfono fue el único caso distinto, porque una persona puede tener varios. Por eso "
  "quedó en su propia tabla, con una llave primaria formada por la identificación de la "
  "persona y el número.")
p("También separamos cliente, agente y administrador en tres tablas aparte. Las tres usan "
  "la misma identificación de la persona, que es su llave primaria y al mismo tiempo una "
  "llave foránea hacia la tabla persona. Lo hicimos así porque el enunciado pide poder "
  "registrar, modificar, eliminar y consultar cada uno por separado.")

# ============================================================ 2 ===========
doc.add_heading("2. Diagrama entidad-relación", level=1)
p("Este es el diagrama del que partimos. Está en notación de Chen: los rectángulos son las "
  "entidades, los rombos son las relaciones y las elipses son los atributos. El rectángulo "
  "doble es la entidad débil, o sea teléfono.")
figura(os.path.join(AQUI, "DER_Chen_TicketFlow.png"), "Figura 1. Diagrama entidad-relación de TicketFlow.")
salto()

# ============================================================ 3 ===========
doc.add_heading("3. Diagrama relacional", level=1)
p("Este es el resultado después de convertirlo. Quedaron diez tablas. En cada una se ve la "
  "llave primaria subrayada y las llaves foráneas marcadas con FK. Las flechas van desde la "
  "llave foránea hasta la tabla a la que apunta.")
figura(os.path.join(AQUI, "Diagrama_Relacional_TicketFlow.png"), "Figura 2. Modelo relacional de TicketFlow.")
salto()

# ============================================================ 4 ===========
doc.add_heading("4. Las tablas", level=1)
p("Escribimos las tablas también en texto, para que se vea mejor cuál es la llave primaria "
  "de cada una. La llave primaria va subrayada y las llaves foráneas van en azul con un "
  "asterisco.")
esquema("PAIS", [("id_pais", "pk"), ("nombre", "")])
esquema("DEPARTAMENTO", [("id_departamento", "pk"), ("nombre", ""), ("id_pais", "fk")])
esquema("CIUDAD", [("id_ciudad", "pk"), ("nombre", ""), ("id_departamento", "fk")])
esquema("PERSONA", [("identificacion", "pk"), ("nombres", ""), ("apellidos", ""), ("correo", ""),
                    ("direccion", ""), ("id_ciudad", "fk")])
esquema("TELEFONO", [("identificacion", "pkfk"), ("numero", "pk")])
esquema("CLIENTE", [("identificacion", "pkfk"), ("puntos", ""), ("ve_publicidad", "")])
esquema("AGENTE", [("identificacion", "pkfk"), ("comision", ""), ("experiencia", "")])
esquema("ADMINISTRADOR", [("identificacion", "pkfk"), ("salario", ""), ("horario", "")])
esquema("EVENTO", [("codigo_evento", "pk"), ("nombre", ""), ("descripcion", ""), ("teatro", ""),
                   ("fecha_hora_inicio", ""), ("fecha_hora_fin", ""), ("capacidad_total", ""),
                   ("precio_base", ""), ("observaciones", ""), ("estado", ""),
                   ("id_ciudad", "fk"), ("identificacion_agente", "fk")])
esquema("RESERVA", [("id_reserva", "pk"), ("fecha_hora", ""), ("numero_entradas", ""),
                    ("observaciones", ""), ("estado", ""), ("identificacion_cliente", "fk"),
                    ("codigo_evento", "fk")])

doc.add_heading("Llaves foráneas", level=2)
tabla(["Tabla", "Llave foránea", "Apunta a"],
      [["departamento", "id_pais", "pais (id_pais)"],
       ["ciudad", "id_departamento", "departamento (id_departamento)"],
       ["persona", "id_ciudad", "ciudad (id_ciudad)"],
       ["telefono", "identificacion", "persona (identificacion)"],
       ["cliente", "identificacion", "persona (identificacion)"],
       ["agente", "identificacion", "persona (identificacion)"],
       ["administrador", "identificacion", "persona (identificacion)"],
       ["evento", "id_ciudad", "ciudad (id_ciudad)"],
       ["evento", "identificacion_agente", "agente (identificacion)"],
       ["reserva", "identificacion_cliente", "cliente (identificacion)"],
       ["reserva", "codigo_evento", "evento (codigo_evento)"]],
      [4.6, 5.6, 6.0])

p("Hay dos datos que no pusimos como columnas: los cupos disponibles de un evento y el valor "
  "total de una reserva. Los dos se pueden calcular, el primero restándole a la capacidad las "
  "entradas ya reservadas, y el segundo multiplicando el número de entradas por el precio del "
  "evento. Si los guardáramos, podrían quedar desactualizados.", antes=10)

# ---------------------------------------------------- número de página ----
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
