# -*- coding: utf-8 -*-
"""
Genera el CSV para importar los sprints 2, 3 y 4 de TicketFlow a Jira (SDGE).

El Sprint 1 NO va aqui: sus 11 temas ya existen (SDGE-1 a SDGE-12) y solo hay
que renombrarlos. Su objetivo, fijado por el profesor, es:
    "construir la pagina de inicio y crear las interfaces de registro
     de cliente, agente y administrador"   ->  9 sep - 28 sep

Escala de puntos del profesor (salta el 2):
    XS=1  media jornada (<3 h)      L=8   una semana (35 h)
    S=3   un dia (7 h)              XL=13 dos a tres semanas
    M=5   dos a tres dias (18 h)    XXL=20 epica, hay que partirla
"""
import csv, io, os

SALIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "jira-backlog-SDGE.csv")

TALLA = {1: "XS", 3: "S", 5: "M", 8: "L", 13: "XL", 20: "XXL"}

# (resumen, sprint, puntos, responsable, area)
TAREAS = [
    # ---------- Sprint 2 · Base de datos y autenticacion real ----------
    ("Modelo entidad-relacion y diccionario de datos",   "SDGE Sprint 2", 5, "EG", "base-de-datos"),
    ("Esquema PostgreSQL: usuarios y roles",             "SDGE Sprint 2", 3, "EG", "base-de-datos"),
    ("Esquema PostgreSQL: eventos, categorias y lugares","SDGE Sprint 2", 5, "EG", "base-de-datos"),
    ("Esquema PostgreSQL: reservas, pagos y estados",    "SDGE Sprint 2", 5, "EG", "base-de-datos"),
    ("Datos de prueba: eventos, ciudades y categorias",  "SDGE Sprint 2", 3, "I5", "base-de-datos"),
    ("Backend de registro e inicio de sesion",           "SDGE Sprint 2", 8, "JD", "autenticacion"),
    ("Control de acceso por rol",                        "SDGE Sprint 2", 5, "JD", "autenticacion"),
    ("Aprobacion de agentes por el administrador",       "SDGE Sprint 2", 3, "JD", "autenticacion"),
    ("Panel del cliente: estructura y menu",             "SDGE Sprint 2", 5, "I4", "frontend"),

    # ---------- Sprint 3 · Catalogo y reservas ----------
    ("Listado de eventos con paginacion",                "SDGE Sprint 3", 5, "EM", "catalogo"),
    ("Filtros y buscador de eventos",                    "SDGE Sprint 3", 8, "EM", "catalogo"),
    ("Detalle del evento",                               "SDGE Sprint 3", 5, "I4", "catalogo"),
    ("Crear y editar eventos (agente)",                  "SDGE Sprint 3", 8, "EG", "gestion-de-eventos"),
    ("Carga de imagenes de eventos",                     "SDGE Sprint 3", 3, "EG", "gestion-de-eventos"),
    ("Control de capacidad y disponibilidad",            "SDGE Sprint 3", 5, "JD", "gestion-de-eventos"),
    ("Crear reserva y apartar cupo",                     "SDGE Sprint 3", 8, "JD", "reservas"),
    ("Pantalla de pago con resumen de compra",           "SDGE Sprint 3", 5, "EM", "reservas"),
    ("Confirmacion, codigo de reserva y QR",             "SDGE Sprint 3", 5, "I5", "reservas"),

    # ---------- Sprint 4 · Gestion, administracion y entrega ----------
    ("Mis reservas del cliente",                         "SDGE Sprint 4", 5, "I4", "reservas"),
    ("Cancelar reserva y liberar el cupo",               "SDGE Sprint 4", 5, "JD", "reservas"),
    ("Reservas por evento (vista del agente)",           "SDGE Sprint 4", 5, "EG", "gestion-de-eventos"),
    ("Panel del agente: indicadores y tabla",            "SDGE Sprint 4", 5, "I5", "gestion-de-eventos"),
    ("Dashboard del administrador",                      "SDGE Sprint 4", 5, "I4", "administracion"),
    ("Reportes: ventas por evento y por categoria",      "SDGE Sprint 4", 8, "EM", "administracion"),
    ("Pruebas del flujo completo",                       "SDGE Sprint 4", 5, "",   "entrega"),
    ("Despliegue",                                       "SDGE Sprint 4", 5, "JD", "entrega"),
    ("Manual de usuario y documentacion tecnica",        "SDGE Sprint 4", 5, "I5", "entrega"),
]

CABECERA = ["Summary", "Issue Type", "Description", "Sprint",
            "Story point estimate", "Labels", "Labels"]


def main():
    # utf-8-sig: asi Jira y Excel respetan las tildes
    with io.open(SALIDA, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(CABECERA)
        for resumen, sprint, puntos, quien, area in TAREAS:
            desc = "Talla %s (%s SP). %s" % (
                TALLA[puntos], puntos,
                ("Responsable sugerido: " + quien) if quien else "Tarea de todo el equipo",
            )
            w.writerow([resumen, "Tarea", desc, sprint, puntos, area, quien])

    print("OK -> " + SALIDA)
    print("   %d tareas\n" % len(TAREAS))
    for s in ["SDGE Sprint 2", "SDGE Sprint 3", "SDGE Sprint 4"]:
        n = sum(1 for t in TAREAS if t[1] == s)
        pts = sum(t[2] for t in TAREAS if t[1] == s)
        print("   %s: %2d tareas, %3d puntos" % (s, n, pts))
    print("\n   Sprint 1 (ya existe en Jira): 11 temas, 49 puntos")


if __name__ == "__main__":
    main()
