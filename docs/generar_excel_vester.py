# -*- coding: utf-8 -*-
"""
Genera el libro de Excel de la Matriz de Vester.

El libro no lleva valores calculados a mano: la influencia, la dependencia,
los cortes y el cuadrante de cada problema son formulas. Si alguien cambia
una casilla del cruce, todo se recalcula y los puntos del plano se mueven
de cuadrante solos.
"""

import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.chart import ScatterChart, Reference, Series
from openpyxl.chart.marker import Marker
from openpyxl.chart.data_source import NumDataSource, NumRef
from openpyxl.drawing.line import LineProperties
from openpyxl.chart.shapes import GraphicalProperties

from vester import PROBLEMAS, M, CLAVES, NOMBRE

ORIGEN = {
    "P1":  "Caso SIC vs. Tuboleta; analisis PESTEL (factor legal)",
    "P2":  "Benchmark: cargos por servicio de Eventbrite y Ticketmaster",
    "P3":  "Benchmark del sector (Tuboleta, Ticketmaster)",
    "P4":  "Enunciado: Evento.capacidad total de espectadores",
    "P5":  "Ley 2439 de 2024; analisis PESTEL (factor legal)",
    "P6":  "Caso SIC (cargo por fallas en PQRS); PESTEL legal",
    "P7":  "Enunciado: perfil Agente; PESTEL (factor tecnologico)",
    "P8":  "Analisis PESTEL (factor tecnologico)",
    "P9":  "Benchmark: abandono de carrito por cargos sorpresa",
    "P10": "Enunciado: campo Cliente.puntos",
}

# --- paleta -----------------------------------------------------------------
AZUL      = "493EE5"
AZUL_TEN  = "EDECFC"
GRIS_CAB  = "F3F3F7"
GRIS_TXT  = "5A5868"
TINTA     = "191C1E"
LINEA     = "D9D8E0"

C_CRIT = "B4232A"; F_CRIT = "FBEDEE"
C_ACT  = "B45309"; F_ACT  = "FCF2E5"
C_PAS  = "0F766E"; F_PAS  = "E7F4F2"
C_IND  = "6B7280"; F_IND  = "F1F1F4"

fino = Side(style="thin", color=LINEA)
BORDE = Border(left=fino, right=fino, top=fino, bottom=fino)

CENTRO = Alignment(horizontal="center", vertical="center")
IZQ    = Alignment(horizontal="left", vertical="center", wrap_text=True)


def titulo(ws, celda, texto, tam=15):
    ws[celda] = texto
    ws[celda].font = Font(name="Calibri", size=tam, bold=True, color=TINTA)


def subtitulo(ws, celda, texto):
    ws[celda] = texto
    ws[celda].font = Font(name="Calibri", size=10, italic=True, color=GRIS_TXT)
    ws[celda].alignment = IZQ


def cabecera(celda):
    celda.font = Font(name="Calibri", size=10, bold=True, color=GRIS_TXT)
    celda.fill = PatternFill("solid", fgColor=GRIS_CAB)
    celda.alignment = CENTRO
    celda.border = BORDE


wb = Workbook()

# ===========================================================================
# HOJA 1 · Los problemas
# ===========================================================================
h1 = wb.active
h1.title = "1. Problemas"
h1.sheet_view.showGridLines = False

titulo(h1, "A1", "Matriz de Vester · TicketFlow", 16)
subtitulo(h1, "A2", "Los diez problemas del mercado de boleteria en Colombia que entran al cruce. "
                    "Salen del enunciado del Proyecto Integrador, del analisis PESTEL del equipo y "
                    "del benchmark de Tuboleta, Eventbrite, Ticketmaster y Taquilla Live.")
h1.merge_cells("A2:C2")
h1.row_dimensions[2].height = 45

for i, txt in enumerate(["Codigo", "Problema", "De donde sale"]):
    c = h1.cell(row=4, column=i + 1, value=txt)
    cabecera(c)

for i, (cod, nom) in enumerate(PROBLEMAS):
    f = 5 + i
    a = h1.cell(row=f, column=1, value=cod)
    a.font = Font(name="Consolas", size=11, bold=True, color=AZUL)
    a.alignment = CENTRO
    b = h1.cell(row=f, column=2, value=nom)
    b.font = Font(name="Calibri", size=11, color=TINTA)
    b.alignment = IZQ
    c = h1.cell(row=f, column=3, value=ORIGEN[cod])
    c.font = Font(name="Calibri", size=10, color=GRIS_TXT)
    c.alignment = IZQ
    for col in (1, 2, 3):
        h1.cell(row=f, column=col).border = BORDE
    h1.row_dimensions[f].height = 30

h1.column_dimensions["A"].width = 9
h1.column_dimensions["B"].width = 55
h1.column_dimensions["C"].width = 52

subtitulo(h1, "A16", "Escala de causalidad usada en la hoja 2:   0 = no lo causa   ·   "
                     "1 = lo causa de forma debil o indirecta   ·   2 = lo causa de forma media   ·   "
                     "3 = lo causa de forma directa y fuerte")
h1.merge_cells("A16:C16")
h1.row_dimensions[16].height = 30

# ===========================================================================
# HOJA 2 · El cruce
# ===========================================================================
h2 = wb.create_sheet("2. Matriz")
h2.sheet_view.showGridLines = False

titulo(h2, "A1", "El cruce", 16)
subtitulo(h2, "A2", "Cada casilla responde: ¿cuanto causa el problema de la FILA al problema de la COLUMNA? "
                    "Solo se editan las casillas del cruce (B5:K14). La influencia, la dependencia y "
                    "los cortes son formulas.")
h2.merge_cells("A2:L2")
h2.row_dimensions[2].height = 32

FILA_CAB, FILA_INI = 4, 5
COL_INI = 2                       # B
COL_FIN = COL_INI + 9             # K
COL_INF = COL_FIN + 1             # L
FILA_DEP = FILA_INI + 10          # 15

c = h2.cell(row=FILA_CAB, column=1, value="causa ↓ / efecto →")
c.font = Font(name="Calibri", size=9, bold=True, color=GRIS_TXT)
c.alignment = CENTRO
c.fill = PatternFill("solid", fgColor=GRIS_CAB)
c.border = BORDE

for j, cod in enumerate(CLAVES):
    cabecera(h2.cell(row=FILA_CAB, column=COL_INI + j, value=cod))
cabecera(h2.cell(row=FILA_CAB, column=COL_INF, value="INFLUENCIA"))

for i, cod in enumerate(CLAVES):
    f = FILA_INI + i
    a = h2.cell(row=f, column=1, value=cod)
    a.font = Font(name="Consolas", size=11, bold=True, color=AZUL)
    a.fill = PatternFill("solid", fgColor=GRIS_CAB)
    a.alignment = CENTRO
    a.border = BORDE

    for j in range(10):
        col = COL_INI + j
        cel = h2.cell(row=f, column=col)
        cel.border = BORDE
        cel.alignment = CENTRO
        if i == j:                                  # diagonal
            cel.value = "—"
            cel.fill = PatternFill("solid", fgColor=GRIS_CAB)
            cel.font = Font(name="Consolas", size=11, color="A8A5B5")
        else:
            v = M[cod][j]
            cel.value = v
            if v == 3:
                cel.font = Font(name="Consolas", size=11, bold=True, color=AZUL)
                cel.fill = PatternFill("solid", fgColor=AZUL_TEN)
            elif v == 2:
                cel.font = Font(name="Consolas", size=11, color=TINTA)
            elif v == 1:
                cel.font = Font(name="Consolas", size=11, color=GRIS_TXT)
            else:
                cel.font = Font(name="Consolas", size=11, color="B8B5C4")

    L = get_column_letter(COL_INI)
    K = get_column_letter(COL_FIN)
    inf = h2.cell(row=f, column=COL_INF, value="=SUM(%s%d:%s%d)" % (L, f, K, f))
    inf.font = Font(name="Consolas", size=11, bold=True, color=TINTA)
    inf.fill = PatternFill("solid", fgColor=GRIS_CAB)
    inf.alignment = CENTRO
    inf.border = BORDE

d = h2.cell(row=FILA_DEP, column=1, value="DEPENDENCIA")
cabecera(d)
for j in range(10):
    col = COL_INI + j
    L = get_column_letter(col)
    cel = h2.cell(row=FILA_DEP, column=col,
                  value="=SUM(%s%d:%s%d)" % (L, FILA_INI, L, FILA_INI + 9))
    cel.font = Font(name="Consolas", size=11, bold=True, color=TINTA)
    cel.fill = PatternFill("solid", fgColor=GRIS_CAB)
    cel.alignment = CENTRO
    cel.border = BORDE

LI = get_column_letter(COL_INF)
tot = h2.cell(row=FILA_DEP, column=COL_INF,
              value="=SUM(%s%d:%s%d)" % (LI, FILA_INI, LI, FILA_INI + 9))
tot.font = Font(name="Consolas", size=11, bold=True, color=AZUL)
tot.fill = PatternFill("solid", fgColor=AZUL_TEN)
tot.alignment = CENTRO
tot.border = BORDE

h2.column_dimensions["A"].width = 19
for j in range(10):
    h2.column_dimensions[get_column_letter(COL_INI + j)].width = 6.5
h2.column_dimensions[LI].width = 13
h2.freeze_panes = "B5"

# --- cortes y comprobacion --------------------------------------------------
titulo(h2, "N4", "Cortes de los ejes", 11)
h2["N5"] = "Corte en X (influencia)"
h2["O5"] = "=MAX(%s%d:%s%d)/2" % (LI, FILA_INI, LI, FILA_INI + 9)
h2["N6"] = "Corte en Y (dependencia)"
h2["O6"] = "=MAX(%s%d:%s%d)/2" % (get_column_letter(COL_INI), FILA_DEP,
                                  get_column_letter(COL_FIN), FILA_DEP)
h2["N8"] = "Comprobacion"
h2["O8"] = ('=IF(SUM(%s%d:%s%d)=SUM(%s%d:%s%d),"Correcta: las filas y las columnas suman igual",'
            '"OJO: hay un error de captura")'
            % (LI, FILA_INI, LI, FILA_INI + 9,
               get_column_letter(COL_INI), FILA_DEP, get_column_letter(COL_FIN), FILA_DEP))

for cel in ("N5", "N6", "N8"):
    h2[cel].font = Font(name="Calibri", size=10, color=GRIS_TXT)
for cel in ("O5", "O6"):
    h2[cel].font = Font(name="Consolas", size=11, bold=True, color=AZUL)
    h2[cel].alignment = CENTRO
h2["O8"].font = Font(name="Calibri", size=10, bold=True, color=C_PAS)
h2.column_dimensions["N"].width = 24
h2.column_dimensions["O"].width = 46
subtitulo(h2, "N10", "El corte va en la mitad del rango de cada eje, que es el criterio "
                     "habitual de la matriz de Vester.")
h2.merge_cells("N10:O11")

# ===========================================================================
# HOJA 3 · Clasificacion
# ===========================================================================
h3 = wb.create_sheet("3. Clasificacion")
h3.sheet_view.showGridLines = False

titulo(h3, "A1", "Clasificacion por cuadrante", 16)
subtitulo(h3, "A2", "Todo en esta hoja son formulas que leen la hoja 2. El cuadrante se decide "
                    "comparando la influencia y la dependencia de cada problema contra los cortes.")
h3.merge_cells("A2:E2")
h3.row_dimensions[2].height = 30

for i, txt in enumerate(["Codigo", "Problema", "Influencia", "Dependencia", "Cuadrante"]):
    cabecera(h3.cell(row=4, column=i + 1, value=txt))

for i, cod in enumerate(CLAVES):
    f = 5 + i
    a = h3.cell(row=f, column=1, value=cod)
    a.font = Font(name="Consolas", size=11, bold=True, color=AZUL)
    a.alignment = CENTRO

    b = h3.cell(row=f, column=2, value="='1. Problemas'!B%d" % (5 + i))
    b.font = Font(name="Calibri", size=11, color=TINTA)
    b.alignment = IZQ

    c = h3.cell(row=f, column=3, value="='2. Matriz'!%s%d" % (LI, FILA_INI + i))
    c.font = Font(name="Consolas", size=11, color=TINTA)
    c.alignment = CENTRO

    d = h3.cell(row=f, column=4,
                value="=INDEX('2. Matriz'!$%s$%d:$%s$%d,%d)"
                      % (get_column_letter(COL_INI), FILA_DEP,
                         get_column_letter(COL_FIN), FILA_DEP, i + 1))
    d.font = Font(name="Consolas", size=11, color=TINTA)
    d.alignment = CENTRO

    e = h3.cell(row=f, column=5, value=(
        '=IF(AND(C{0}>=\'2. Matriz\'!$O$5,D{0}>=\'2. Matriz\'!$O$6),"Critico",'
        'IF(AND(C{0}>=\'2. Matriz\'!$O$5,D{0}<\'2. Matriz\'!$O$6),"Activo",'
        'IF(AND(C{0}<\'2. Matriz\'!$O$5,D{0}>=\'2. Matriz\'!$O$6),"Pasivo","Indiferente")))'
    ).format(f))
    e.font = Font(name="Calibri", size=10, bold=True, color=TINTA)
    e.alignment = CENTRO

    for col in range(1, 6):
        h3.cell(row=f, column=col).border = BORDE
    h3.row_dimensions[f].height = 26

h3.column_dimensions["A"].width = 9
h3.column_dimensions["B"].width = 52
h3.column_dimensions["C"].width = 12
h3.column_dimensions["D"].width = 13
h3.column_dimensions["E"].width = 15

# color del cuadrante segun el texto que devuelva la formula
from openpyxl.formatting.rule import CellIsRule
for txt, col_txt, col_fon in (("Critico", C_CRIT, F_CRIT), ("Activo", C_ACT, F_ACT),
                              ("Pasivo", C_PAS, F_PAS), ("Indiferente", C_IND, F_IND)):
    h3.conditional_formatting.add(
        "E5:E14",
        CellIsRule(operator="equal", formula=['"%s"' % txt],
                   font=Font(name="Calibri", size=10, bold=True, color=col_txt),
                   fill=PatternFill("solid", fgColor=col_fon)))

# --- como se lee -----------------------------------------------------------
titulo(h3, "A17", "Como se lee cada cuadrante", 12)
LECTURA = [
    ("ACTIVO", C_ACT, F_ACT,
     "Causa mucho y casi nadie lo causa. Son las raices del problema: es por aqui por donde hay que atacar."),
    ("CRITICO", C_CRIT, F_CRIT,
     "Causa y es causado a la vez. Es el punto donde el problema se realimenta; si no se resuelve, "
     "cualquier mejora aguas arriba se pierde."),
    ("PASIVO", C_PAS, F_PAS,
     "Casi pura consecuencia. No se ataca de frente: se arregla resolviendo los activos y los criticos."),
    ("INDIFERENTE", C_IND, F_IND,
     "Ni causa ni es causado de forma relevante. Baja prioridad, salvo que quede limitrofe con otro cuadrante."),
]
for i, (nom, ct, cf, desc) in enumerate(LECTURA):
    f = 19 + i
    a = h3.cell(row=f, column=1, value=nom)
    a.font = Font(name="Calibri", size=10, bold=True, color=ct)
    a.fill = PatternFill("solid", fgColor=cf)
    a.alignment = CENTRO
    a.border = BORDE
    b = h3.cell(row=f, column=2, value=desc)
    b.font = Font(name="Calibri", size=10, color=GRIS_TXT)
    b.alignment = IZQ
    b.border = BORDE
    h3.merge_cells(start_row=f, start_column=2, end_row=f, end_column=5)
    h3.row_dimensions[f].height = 30

# ===========================================================================
# HOJA 4 · Plano
# ===========================================================================
h4 = wb.create_sheet("4. Plano")
h4.sheet_view.showGridLines = False

titulo(h4, "A1", "Plano de causalidad", 16)
subtitulo(h4, "A2", "Cada problema se ubica segun cuanto causa (eje X) y cuanto lo causan (eje Y). "
                    "Las cuatro series separan los cuadrantes: si se cambia un valor en la hoja 2, "
                    "el punto cambia de serie y de color solo.")
h4.merge_cells("A2:H2")
h4.row_dimensions[2].height = 30

# Bloque auxiliar: una pareja de columnas X,Y por cuadrante, con NA() para
# los problemas que no pertenecen a ese cuadrante.
AUX_F = 30
h4.cell(row=AUX_F - 1, column=1, value="Datos del grafico (no borrar)").font = \
    Font(name="Calibri", size=10, bold=True, color=GRIS_TXT)

encab = ["Cod", "INF", "DEP", "Critico X", "Critico Y", "Activo X", "Activo Y",
         "Pasivo X", "Pasivo Y", "Indif. X", "Indif. Y"]
for j, t in enumerate(encab):
    c = h4.cell(row=AUX_F, column=1 + j, value=t)
    c.font = Font(name="Calibri", size=9, bold=True, color=GRIS_TXT)
    c.alignment = CENTRO

for i, cod in enumerate(CLAVES):
    f = AUX_F + 1 + i
    fc = 5 + i      # fila correspondiente en la hoja 3
    h4.cell(row=f, column=1, value=cod).font = Font(name="Consolas", size=9)
    h4.cell(row=f, column=2, value="='3. Clasificacion'!C%d" % fc)
    h4.cell(row=f, column=3, value="='3. Clasificacion'!D%d" % fc)
    for k, nom in enumerate(("Critico", "Activo", "Pasivo", "Indiferente")):
        cx = 4 + k * 2
        h4.cell(row=f, column=cx,
                value='=IF(\'3. Clasificacion\'!E%d="%s",B%d,NA())' % (fc, nom, f))
        h4.cell(row=f, column=cx + 1,
                value='=IF(\'3. Clasificacion\'!E%d="%s",C%d,NA())' % (fc, nom, f))
    for col in range(2, 12):
        h4.cell(row=f, column=col).font = Font(name="Consolas", size=9, color=GRIS_TXT)
        h4.cell(row=f, column=col).alignment = CENTRO

graf = ScatterChart()
graf.title = "Matriz de Vester · plano de causalidad"
graf.style = 2
graf.x_axis.title = "Influencia — cuanto causa"
graf.y_axis.title = "Dependencia — cuanto lo causan"
graf.x_axis.scaling.min = 0
graf.y_axis.scaling.min = 0
graf.height = 13
graf.width = 20
graf.legend.position = "b"

SERIES = [("Critico", 4, C_CRIT), ("Activo", 6, C_ACT),
          ("Pasivo", 8, C_PAS), ("Indiferente", 10, C_IND)]
for nom, col, color in SERIES:
    xs = Reference(h4, min_col=col,     min_row=AUX_F + 1, max_row=AUX_F + 10)
    ys = Reference(h4, min_col=col + 1, min_row=AUX_F + 1, max_row=AUX_F + 10)
    s = Series(ys, xs, title=nom)
    s.marker = Marker(symbol="circle", size=9)
    s.marker.graphicalProperties = GraphicalProperties(solidFill=color)
    s.marker.graphicalProperties.line = LineProperties(solidFill=color)
    s.graphicalProperties.line.noFill = True      # solo puntos, sin unir
    graf.series.append(s)

h4.add_chart(graf, "A4")

# ===========================================================================
os.makedirs("entregables", exist_ok=True)
ruta = os.path.join("entregables", "Matriz_Vester_TicketFlow.xlsx")
wb.save(ruta)
print("Listo:", ruta)
print("Hojas:", ", ".join(wb.sheetnames))
