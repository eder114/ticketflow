# -*- coding: utf-8 -*-
"""
Matriz de Vester · TicketFlow — mercado de boleteria en Colombia

Escala de causalidad (fila CAUSA a columna):
    0 = no lo causa
    1 = lo causa de forma debil o indirecta
    2 = lo causa de forma media
    3 = lo causa de forma directa y fuerte

Eje X = Influencia (suma de la fila): cuanto causa ese problema.
Eje Y = Dependencia (suma de la columna): cuanto lo causan los demas.

Los problemas salen del enunciado del Proyecto Integrador, del analisis
PESTEL del equipo y del benchmark de Tuboleta, Eventbrite, Ticketmaster
y Taquilla Live.
"""

PROBLEMAS = [
    ("P1",  "Desconfianza del comprador en las plataformas de boleteria"),
    ("P2",  "Precio final oculto hasta el checkout (cargos sorpresa)"),
    ("P3",  "Reventa y suplantacion de boletas"),
    ("P4",  "Sobreventa y descontrol del aforo por gestion manual"),
    ("P5",  "Reembolsos lentos o incumplidos (Ley 2439 de 2024)"),
    ("P6",  "Ausencia de un canal PQRS digital y trazable"),
    ("P7",  "Organizadores pequenos sin herramientas digitales"),
    ("P8",  "Caidas de la plataforma en picos de venta"),
    ("P9",  "Abandono de la compra antes de confirmar"),
    ("P10", "Baja recompra y poca fidelizacion del cliente"),
]

# M[causa][efecto]
M = {
    #        P1 P2 P3 P4 P5 P6 P7 P8 P9 P10
    "P1":  [ 0, 0, 0, 0, 0, 0, 0, 0, 3, 3],
    "P2":  [ 3, 0, 0, 0, 1, 0, 0, 0, 3, 2],
    "P3":  [ 3, 0, 0, 2, 1, 1, 0, 0, 1, 2],
    "P4":  [ 3, 0, 1, 0, 3, 2, 0, 0, 1, 3],
    "P5":  [ 3, 0, 0, 0, 0, 2, 0, 0, 1, 3],
    "P6":  [ 3, 0, 0, 0, 3, 0, 0, 0, 0, 2],
    "P7":  [ 2, 1, 3, 3, 2, 3, 0, 0, 2, 1],
    "P8":  [ 2, 0, 0, 2, 1, 1, 0, 0, 3, 2],
    "P9":  [ 0, 0, 0, 0, 0, 0, 1, 0, 0, 2],
    "P10": [ 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
}

CLAVES = [c for c, _ in PROBLEMAS]
NOMBRE = dict(PROBLEMAS)


def calcular():
    influencia = {c: sum(M[c]) for c in CLAVES}
    dependencia = {}
    for j, c in enumerate(CLAVES):
        dependencia[c] = sum(M[f][j] for f in CLAVES)
    return influencia, dependencia


def clasificar(influencia, dependencia):
    # El corte se pone en la mitad del rango de cada eje, que es el
    # criterio habitual de la matriz de Vester.
    cx = max(influencia.values()) / 2
    cy = max(dependencia.values()) / 2
    out = {}
    for c in CLAVES:
        x, y = influencia[c], dependencia[c]
        if x >= cx and y >= cy:
            out[c] = "CRITICO"
        elif x >= cx and y < cy:
            out[c] = "ACTIVO"
        elif x < cx and y >= cy:
            out[c] = "PASIVO"
        else:
            out[c] = "INDIFERENTE"
    return out, cx, cy


if __name__ == "__main__":
    inf, dep = calcular()
    cls, cx, cy = clasificar(inf, dep)

    # Comprobacion: la suma de filas debe igualar la de columnas
    assert sum(inf.values()) == sum(dep.values()), "las sumas no cuadran"

    print("Corte en X (influencia): %.1f   ·   Corte en Y (dependencia): %.1f\n" % (cx, cy))
    print("%-5s %-58s %4s %4s  %s" % ("", "PROBLEMA", "INF", "DEP", "TIPO"))
    print("-" * 88)
    for c in sorted(CLAVES, key=lambda k: (-inf[k], -dep[k])):
        print("%-5s %-58s %4d %4d  %s" % (c, NOMBRE[c][:58], inf[c], dep[c], cls[c]))

    print("\nTotal de la matriz: %d" % sum(inf.values()))
    print("\nPor cuadrante:")
    for tipo in ("CRITICO", "ACTIVO", "PASIVO", "INDIFERENTE"):
        d = [c for c in CLAVES if cls[c] == tipo]
        print("  %-12s %s" % (tipo, ", ".join(d) if d else "(ninguno)"))
