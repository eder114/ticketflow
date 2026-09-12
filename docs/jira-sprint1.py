# -*- coding: utf-8 -*-
"""
Sprint 1 de TicketFlow (SDGE) repartido entre 4 personas.

Genera dos archivos:
  1) jira-sprint1-fechas.csv  -> se IMPORTA a Jira y actualiza los 11 temas
     que ya existen (responsable + fecha de inicio + fecha de vencimiento).
     Al llevar la columna "Issue key", Jira ACTUALIZA en vez de crear.
     No toca la descripcion, asi que no borra lo que el equipo ya escribio.
  2) jira-sprint1-descripciones.txt -> los 11 bloques para pegar a mano.

Escala del profesor: XS=1 (media jornada, <3 h) · S=3 (1 dia, 7 h)
M=5 (2-3 dias, ±18 h) · L=8 (1 semana, 35 h) · XL=13 · XXL=20
"""
import csv, io, os

BASE = os.path.dirname(os.path.abspath(__file__))
CSV_OUT = os.path.join(BASE, "jira-sprint1-fechas.csv")
TXT_OUT = os.path.join(BASE, "jira-sprint1-descripciones.txt")

TALLA = {1: "XS - Muy simple", 3: "S - Complejidad simple", 5: "M - Complejidad media",
         8: "L - Compleja", 13: "XL - Muy compleja", 20: "XXL - Epica"}
TIEMPO = {1: "Media jornada (menos de 3 horas)", 3: "1 dia (7 horas)",
          5: "2 a 3 dias (unas 18 horas)", 8: "1 semana (35 horas)",
          13: "2 a 3 semanas (unas 122 horas)", 20: "Mas de 3 semanas"}

# Nombres tal como aparecen en Jira
PERSONAS = {
    "EM": "EDER FABIAN RODRIGUEZ MURILLO",
    "EG": "EDUARDO JOSE BENITEZ GUEVARA",
    "JD": "Jorge andres marin diaz",
    # Samuel todavia no esta en el proyecto: se deja vacio para que la
    # importacion no falle. Sus 3 historias se le asignan cuando lo inviten.
    "SM": "",
}

# (clave, titulo, puntos, quien, inicio, vencimiento, nota)
HISTORIAS = [
    ("SDGE-12", "Hoja de estilos del sistema de diseno", 5, "JD", "09/09/2026", "11/09/2026",
     "Variables CSS de color, tipografia, espaciado y radios. Es la base de la que "
     "dependen todas las demas historias, por eso arranca el primer dia."),

    ("SDGE-3", "Encabezado con navegacion y botones de sesion", 3, "EM", "09/09/2026", "10/09/2026",
     "Barra superior con el logo, los enlaces de navegacion y los botones de "
     "iniciar sesion y registrarse."),

    ("SDGE-1", "Interfaz de inicio de sesion", 3, "EG", "09/09/2026", "10/09/2026",
     "Pantalla unica de acceso para los tres roles. El rol guardado del usuario "
     "decide a donde entra despues."),

    ("SDGE-6", "Interfaz de registro de administrador", 3, "SM", "09/09/2026", "10/09/2026",
     "OJO: esta pantalla no existe en Figma. Hay que disenarla o resolverla como "
     "variante del registro de agente antes de programarla."),

    ("SDGE-2", "Maquetacion de la pagina de inicio", 5, "EM", "11/09/2026", "16/09/2026",
     "Estructura completa de la portada: rejilla de 12 columnas, secciones y pie de pagina."),

    ("SDGE-7", "Interfaz de registro de cliente", 5, "EG", "11/09/2026", "16/09/2026",
     "Formulario corto: nombre, correo, contrasena y ciudad."),

    ("SDGE-11", "Seccion de eventos destacados y categorias", 5, "SM", "11/09/2026", "16/09/2026",
     "Rejilla de tarjetas de evento con imagen, categoria, ciudad, fecha y precio desde."),

    ("SDGE-4", "Seccion hero con buscador de eventos", 5, "EM", "17/09/2026", "21/09/2026",
     "Bloque principal de la portada con el buscador de evento, ciudad y fecha."),

    ("SDGE-9", "Interfaz de registro de agente", 5, "EG", "17/09/2026", "21/09/2026",
     "Ademas de los datos personales pide la organizacion. La cuenta queda pendiente "
     "de aprobacion del administrador."),

    ("SDGE-8", "Validacion de formularios en el navegador", 5, "SM", "17/09/2026", "21/09/2026",
     "Cubre los cuatro formularios: login y los tres registros. Campos obligatorios, "
     "formato de correo y fuerza de contrasena."),

    ("SDGE-10", "Ajuste responsive de inicio y registros", 5, "JD", "22/09/2026", "25/09/2026",
     "Va de ultimo porque necesita las demas pantallas hechas. 12 columnas en "
     "escritorio y 4 en movil; margenes de 16 px en movil y 40 px en escritorio; "
     "contenido tope a 1280 px."),
]


def bloque(puntos, quien, inicio, fin, nota):
    return (
        "Talla: %s\n"
        "Puntos de historia: %s SP\n"
        "Estimacion: %s\n"
        "Fechas: %s al %s\n"
        "Responsable: %s\n"
        "\n%s"
    ) % (TALLA[puntos], puntos, TIEMPO[puntos], inicio, fin,
         PERSONAS[quien] or "Samuel (pendiente de invitar al proyecto)", nota)


def main():
    # ---------- CSV para importar ----------
    with io.open(CSV_OUT, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Issue key", "Assignee", "Start date", "Due date", "Story point estimate"])
        for clave, _, puntos, quien, ini, fin, _ in HISTORIAS:
            w.writerow([clave, PERSONAS[quien], ini, fin, puntos])

    # ---------- TXT con las descripciones ----------
    lineas = [
        "SPRINT 1 - TICKETFLOW (SDGE)   9 sep - 28 sep 2026",
        "Objetivo: construir la pagina de inicio y crear las interfaces de",
        "registro de cliente, agente y administrador.",
        "",
        "Pega cada bloque en: la historia -> Descripcion -> Editar descripcion -> Guardar.",
        "Las historias que YA tienen texto: pega el bloque ARRIBA, sin borrar lo que hay.",
        "=" * 70, "",
    ]
    for clave, titulo, puntos, quien, ini, fin, nota in HISTORIAS:
        lineas.append("%s  ·  %s" % (clave, titulo))
        lineas.append("-" * 70)
        lineas.append(bloque(puntos, quien, ini, fin, nota))
        lineas.append("")
        lineas.append("")

    carga = {}
    for _, _, puntos, quien, _, _, _ in HISTORIAS:
        carga[quien] = carga.get(quien, 0) + puntos
    lineas.append("=" * 70)
    lineas.append("CARGA POR PERSONA")
    for quien in ("EM", "EG", "SM", "JD"):
        n = sum(1 for h in HISTORIAS if h[3] == quien)
        lineas.append("  %-4s %2d SP   %d historias   %s" % (
            quien, carga[quien], n,
            PERSONAS[quien] or "Samuel (pendiente de invitar al proyecto)"))
    lineas.append("  %-4s %2d SP   %d historias   TOTAL" % ("", sum(carga.values()), len(HISTORIAS)))

    io.open(TXT_OUT, "w", encoding="utf-8").write("\n".join(lineas))

    print("OK -> " + CSV_OUT)
    print("OK -> " + TXT_OUT)
    print("")
    for quien in ("EM", "EG", "SM", "JD"):
        n = sum(1 for h in HISTORIAS if h[3] == quien)
        print("  %-3s %2d SP  (%d historias)" % (quien, carga[quien], n))
    print("  ---")
    print("  TOTAL %d SP en %d historias" % (sum(carga.values()), len(HISTORIAS)))


if __name__ == "__main__":
    main()
