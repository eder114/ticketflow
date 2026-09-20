# -*- coding: utf-8 -*-
"""
Dibuja el Modelo Canvas v2 de TicketFlow como imagen PNG.

Respeta la grilla original de Osterwalder: nueve bloques en la posicion que
les corresponde, con la propuesta de valor al centro y los dos bloques
financieros abajo. Cada vineta lleva la marca de donde sale el dato:
Pn = un problema de la matriz de Vester, PESTEL = el analisis del equipo,
ENUNCIADO = un requisito del proyecto integrador.

La altura de la imagen no se fija a mano. Primero se mide cuanto ocupa el
contenido de cada bloque y despues se arma la grilla, para que no queden
franjas vacias al pie de las columnas.
"""

import os
from PIL import Image, ImageDraw, ImageFont

F = "C:/Windows/Fonts/"
def fuente(archivo, tam):
    return ImageFont.truetype(F + archivo, tam)

# --- paleta -----------------------------------------------------------------
FONDO    = (250, 250, 252)
BLANCO   = (255, 255, 255)
TINTA    = (25, 28, 30)
TINTA2   = (90, 88, 104)
TINTA3   = (139, 136, 153)
LINEA    = (223, 222, 232)
AZUL     = (73, 62, 229)
AZUL_TEN = (237, 236, 252)
AZUL_BDE = (176, 170, 245)

# --- tipografia -------------------------------------------------------------
f_titulo  = fuente("georgiab.ttf", 62)
f_bajada  = fuente("segoeui.ttf", 27)
f_equipo  = fuente("segoeui.ttf", 22)
f_rotulo  = fuente("consolab.ttf", 20)
f_texto   = fuente("segoeui.ttf", 24)
f_texto_b = fuente("seguisb.ttf", 24)
f_chip    = fuente("consolab.ttf", 17)
f_pie     = fuente("segoeui.ttf", 21)

MG, GAP = 70, 12
W = 3400
ANCHO_G = W - 2 * MG
COL_W = (ANCHO_G - 4 * GAP) / 5.0
GY0 = 300          # donde arranca la grilla
PIE = 108          # franja del pie

PX = 26            # relleno lateral dentro del bloque
SALTO = 32         # alto de linea
ESPACIO = 42       # separacion entre vinetas
CAB = 82           # rotulo + regla + aire

_medidor = ImageDraw.Draw(Image.new("RGB", (10, 10)))


def ancho(txto, fnt):
    return _medidor.textlength(txto, font=fnt)


# ===========================================================================
# Contenido · (clave, rotulo, [(negrita, resto, [marcas]), ...])
# ===========================================================================
CONTENIDO = {
 "socios": ("SOCIOS CLAVE", [
    ("Productoras, teatros y salas independientes", "— los dueños del inventario", ["P7"]),
    ("Operadores de tours y ecoturismo", "con cupos limitados por salida", ["EQUIPO"]),
    ("Pasarelas de pago colombianas", "Nequi, Daviplata, PSE y Bre-B", ["PESTEL"]),
    ("Proveedor cloud", "con capacidad de escalar en picos de venta", ["P8"]),
    ("Ministerio de Cultura", "y alcaldías locales", []),
 ]),
 "actividades": ("ACTIVIDADES CLAVE", [
    ("Control de aforo en tiempo real", "la reserva descuenta cupo al confirmarse", ["P4"]),
    ("Motor de reembolsos", "con plazo máximo de 15 días", ["P5"]),
    ("Emisión y validación de entradas", "con código único por boleta", ["P3"]),
    ("Aprobación y acompañamiento", "de organizadores nuevos", ["P7"]),
    ("Operación del PQRS", "con número de radicado", ["P6"]),
 ]),
 "recursos": ("RECURSOS CLAVE", [
    ("Máquina de estados de la reserva", "Reservada → Confirmada → Cancelada: es el activo "
     "que impide la sobreventa", ["P4", "ENUNCIADO"]),
    ("Infraestructura elástica", "dimensionada para picos", ["P8"]),
    ("Base de datos", "de eventos, aforos y reservas", []),
    ("Equipo de desarrollo y soporte", "", []),
    ("Convenios firmados", "con organizadores", []),
 ]),
 "propuesta": ("PROPUESTA DE VALOR", [
    ("Para el organizador:", "deja de llevar el aforo en un cuaderno. El sistema no vende "
     "de más y muestra las reservas al instante", ["P7", "P4"]),
    ("Para el cliente:", "el precio que ve en la tarjeta es el que paga. Sin cargos que "
     "aparecen al final", ["P2"]),
    ("Reembolso cumplido:", "los 15 días son una promesa del producto, no un trámite",
     ["P5", "PESTEL"]),
    ("Cupo apartado al confirmar,", "no cuando alguien lea un mensaje", ["P9"]),
    ("Entrada con código único", "que se valida en la puerta", ["P3"]),
 ]),
 "relaciones": ("RELACIONES CON CLIENTES", [
    ("PQRS digital trazable", "con radicado visible para el cliente", ["P6"]),
    ("Cancelación autogestionada", "desde el panel, sin llamar a nadie", ["EQUIPO"]),
    ("Autoservicio 24/7", "en la plataforma", []),
    ("Programa de puntos", "por cada reserva confirmada", ["P10", "ENUNCIADO"]),
    ("Correos de confirmación", "y recordatorio del evento", []),
 ]),
 "canales": ("CANALES", [
    ("Plataforma web responsive", "canal principal de venta", []),
    ("Captación directa de organizadores", "no solo publicidad al comprador", ["P7"]),
    ("Correo transaccional", "confirmación y entrega de la entrada", []),
    ("Redes y WhatsApp Business", "para soporte", []),
    ("Alianzas con teatros", "y casas de cultura municipales", []),
 ]),
 "segmentos": ("SEGMENTOS DE CLIENTES", [
    ("Organizadores pequeños y medianos", "— segmento primario. Es donde está la causa "
     "raíz y por donde entra el inventario", ["P7"]),
    ("Clientes finales de 18 a 45 años", "en ciudades intermedias y grandes", []),
    ("Salas de cine alternativo", "y teatros municipales", ["EQUIPO"]),
    ("Operadores turísticos", "con cupos limitados por salida", ["EQUIPO"]),
    ("Foco inicial:", "Valle del Cauca, luego Bogotá y Medellín", []),
 ]),
 "costos": ("ESTRUCTURA DE COSTOS", [
    ("Reserva operativa para los reembolsos:", "cumplir los 15 días exige tener la plata "
     "disponible, no solo la intención", ["P5"]),
    ("Infraestructura cloud", "dimensionada para picos de venta", ["P8"]),
    ("Salarios", "de desarrollo, soporte y comercial", []),
    ("Comisiones", "de las pasarelas de pago", []),
    ("Cumplimiento:", "asesoría jurídica y protección de datos", ["PESTEL"]),
 ]),
 "ingresos": ("FUENTES DE INGRESOS", [
    ("Suscripción mensual del organizador", "por usar el panel de gestión. Se cobra por "
     "resolver P7, que es la causa raíz de toda la matriz", ["P7"]),
    ("Comisión por transacción", "sobre cada reserva confirmada", []),
    ("Servicios premium:", "promoción destacada y analítica, sobre el dashboard de "
     "reportes que ya exige el enunciado", ["ENUNCIADO", "EQUIPO"]),
    ("Publicidad", "para los clientes que la habilitan en su perfil", ["ENUNCIADO"]),
 ]),
}


def maquetar(vinetas, w, x=0, y=0, d=None, destacado=False):
    """Coloca las vinetas dentro de un ancho dado.

    Con d=None solo mide y devuelve el alto que ocupan; con un ImageDraw
    las dibuja. Asi la medida y el dibujo usan exactamente el mismo calculo
    y no se pueden desincronizar.
    """
    max_w = w - PX * 2 - 22
    tx = x + PX + 22
    col_cuerpo = TINTA if destacado else TINTA2
    cy = y

    for negrita, resto, marcas in vinetas:
        if d:
            d.ellipse([x + PX + 2, cy + 10, x + PX + 8, cy + 16],
                      fill=AZUL if destacado else TINTA3)
        lx, ly = tx, cy

        for palabra in negrita.split():
            wp = ancho(palabra + " ", f_texto_b)
            if lx + wp > tx + max_w:
                lx, ly = tx, ly + SALTO
            if d:
                d.text((lx, ly), palabra, font=f_texto_b, fill=TINTA)
            lx += wp
        for palabra in resto.split():
            wp = ancho(palabra + " ", f_texto)
            if lx + wp > tx + max_w:
                lx, ly = tx, ly + SALTO
            if d:
                d.text((lx, ly), palabra, font=f_texto, fill=col_cuerpo)
            lx += wp

        if marcas:
            total = sum(ancho(m, f_chip) + 18 + 7 for m in marcas)
            if lx + total > tx + max_w:
                lx, ly = tx, ly + SALTO + 2
            else:
                lx += 6
            for m in marcas:
                wch = ancho(m, f_chip) + 18
                if d:
                    d.rounded_rectangle([lx, ly + 3, lx + wch, ly + 28], radius=6,
                                        fill=BLANCO if destacado else AZUL_TEN,
                                        outline=AZUL_BDE if destacado else None,
                                        width=1 if destacado else 0)
                    d.text((lx + 9, ly + 6), m, font=f_chip, fill=AZUL)
                lx += wch + 7

        cy = ly + ESPACIO

    return cy - y - ESPACIO + SALTO + 22      # ultima linea + aire inferior


def alto_de(clave, n_cols):
    w = COL_W * n_cols + GAP * (n_cols - 1)
    return CAB + maquetar(CONTENIDO[clave][1], w)


# ===========================================================================
# Geometria · se deduce de lo que mide el contenido
# ===========================================================================
MEDIA_H = max(alto_de(k, 1) for k in ("actividades", "recursos", "relaciones", "canales"))
ARRIBA_H = max(2 * MEDIA_H + GAP,
               max(alto_de(k, 1) for k in ("socios", "propuesta", "segmentos")))
MEDIA_H = (ARRIBA_H - GAP) / 2.0
ABAJO_H = max(alto_de("costos", 2), alto_de("ingresos", 3))

H = int(GY0 + ARRIBA_H + GAP + ABAJO_H + PIE)
GY1 = H - PIE

img = Image.new("RGB", (W, H), FONDO)
d = ImageDraw.Draw(img)


def col_x(i):
    return MG + i * (COL_W + GAP)


# --- encabezado -------------------------------------------------------------
d.text((MG, 58), "MODELO CANVAS · TICKETFLOW", font=f_rotulo, fill=AZUL)
d.text((MG, 92), "Versión 2 — construida sobre la Matriz de Vester", font=f_titulo, fill=TINTA)
d.text((MG, 182),
       "Cada viñeta marca su origen:  Pn = problema de la matriz de Vester   ·   "
       "PESTEL = análisis del entorno   ·   ENUNCIADO = requisito explícito del enunciado   ·   "
       "EQUIPO = decisión propia del equipo",
       font=f_bajada, fill=TINTA2)
d.text((MG, 222),
       "Alex Andrés Cruz  ·  Eduardo José Benítez  ·  Jorge Andrés Marín  ·  "
       "Eder Fabián Rodríguez Murillo  ·  Samuel Uribe Naranjo",
       font=f_equipo, fill=TINTA3)
d.line([MG, 268, W - MG, 268], fill=TINTA, width=3)

# --- los nueve bloques, en la grilla de Osterwalder -------------------------
DISPOSICION = [
    ("socios",      col_x(0), GY0,                     COL_W,                   ARRIBA_H, False),
    ("actividades", col_x(1), GY0,                     COL_W,                   MEDIA_H,  False),
    ("recursos",    col_x(1), GY0 + MEDIA_H + GAP,     COL_W,                   MEDIA_H,  False),
    ("propuesta",   col_x(2), GY0,                     COL_W,                   ARRIBA_H, True),
    ("relaciones",  col_x(3), GY0,                     COL_W,                   MEDIA_H,  False),
    ("canales",     col_x(3), GY0 + MEDIA_H + GAP,     COL_W,                   MEDIA_H,  False),
    ("segmentos",   col_x(4), GY0,                     COL_W,                   ARRIBA_H, False),
    ("costos",      col_x(0), GY1 - ABAJO_H,           COL_W * 2 + GAP,         ABAJO_H,  False),
    ("ingresos",    col_x(2), GY1 - ABAJO_H,           COL_W * 3 + GAP * 2,     ABAJO_H,  False),
]

for clave, x, y, w, h, destacado in DISPOSICION:
    x, y, w, h = int(x), int(y), int(w), int(h)
    rotulo = CONTENIDO[clave][0]
    borde = AZUL_BDE if destacado else LINEA
    d.rounded_rectangle([x, y, x + w, y + h], radius=14,
                        fill=AZUL_TEN if destacado else BLANCO,
                        outline=borde, width=2 if destacado else 1)
    d.text((x + PX, y + 22), rotulo, font=f_rotulo, fill=AZUL if destacado else TINTA3)
    d.line([x + PX, y + 62, x + w - PX, y + 62], fill=borde, width=1)
    maquetar(CONTENIDO[clave][1], w, x, y + CAB, d, destacado)

# --- pie --------------------------------------------------------------------
d.line([MG, H - 86, W - MG, H - 86], fill=LINEA, width=1)
d.text((MG, H - 68),
       "Seminario · Proyecto Integrador · Unidad Central del Valle del Cauca · Tuluá",
       font=f_pie, fill=TINTA3)
der = "Canvas v2 · derivado de la Matriz de Vester de 10 problemas · septiembre de 2026"
d.text((W - MG - ancho(der, f_pie), H - 68), der, font=f_pie, fill=TINTA3)

os.makedirs("entregables", exist_ok=True)
ruta = os.path.join("entregables", "Canvas_TicketFlow_v2.png")
img.save(ruta, "PNG", optimize=True)
print("Listo:", ruta, img.size, "%.1f KB" % (os.path.getsize(ruta) / 1024))
