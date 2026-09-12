#!/usr/bin/env python3
"""
TicketFlow · build.py
Genera index.html autocontenido: inyecta imagenes como data URI + secciones dinamicas.
Uso:  python build.py
"""
import base64, json, os, random, hashlib

BASE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(BASE, "assets")
TPL = os.path.join(BASE, "index.template.html")
OUT = os.path.join(BASE, "index.html")


def data_uri(filename):
    """Lee un jpg de assets/ y lo devuelve como data URI base64."""
    p = os.path.join(ASSETS, filename)
    if not os.path.exists(p):
        print(f"  ! falta {filename} - se usa placeholder gris")
        return ("data:image/svg+xml;utf8,"
                "%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='3'%3E"
                "%3Crect width='4' height='3' fill='%23E2E8F0'/%3E%3C/svg%3E")
    with open(p, "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode()


# ---------------------------------------------------------------- QR
def make_qr(text="TF-2026-9F42B", n=21):
    """QR decorativo determinista (patron estable, con finder patterns reales)."""
    seed = int(hashlib.md5(text.encode()).hexdigest()[:8], 16)
    rnd = random.Random(seed)
    grid = [[0] * n for _ in range(n)]

    def finder(r0, c0):
        for r in range(7):
            for c in range(7):
                edge = r in (0, 6) or c in (0, 6)
                core = 2 <= r <= 4 and 2 <= c <= 4
                grid[r0 + r][c0 + c] = 1 if (edge or core) else 0

    finder(0, 0); finder(0, n - 7); finder(n - 7, 0)

    def in_finder(r, c):
        return ((r < 8 and c < 8) or (r < 8 and c >= n - 8) or (r >= n - 8 and c < 8))

    for r in range(n):
        for c in range(n):
            if not in_finder(r, c):
                grid[r][c] = 1 if rnd.random() < 0.46 else 0
    # timing patterns
    for i in range(8, n - 8):
        grid[6][i] = i % 2 == 0
        grid[i][6] = i % 2 == 0

    rects = "".join(
        f'<rect x="{c}" y="{r}" width="1" height="1"/>'
        for r in range(n) for c in range(n) if grid[r][c]
    )
    return (f'<svg viewBox="0 0 {n} {n}" xmlns="http://www.w3.org/2000/svg" '
            f'shape-rendering="crispEdges" fill="#111827">{rects}</svg>')


# ---------------------------------------------------------------- categorias
CATEGORIAS = [
    ("Conciertos",  "\U0001F3B5", "1.240 eventos", "#635BFF"),
    ("Deportes",    "⚽",     "480 eventos",   "#3B82F6"),
    ("Teatro",      "\U0001F3AD", "320 eventos",   "#8B5CF6"),
    ("Comedia",     "\U0001F602", "210 eventos",   "#06B6D4"),
    ("Cultura",     "\U0001F3A8", "560 eventos",   "#F59E0B"),
    ("Festivales",  "\U0001F389", "180 eventos",   "#EC4899"),
    ("Academicos",  "\U0001F393", "95 eventos",    "#22C55E"),
    ("Conferencias","\U0001F4BC", "140 eventos",   "#64748B"),
]

def build_cats():
    out = []
    for nombre, icono, conteo, color in CATEGORIAS:
        out.append(f'''      <a href="#" class="cat">
        <div class="cat-ic" style="background:{color}1A;color:{color}">{icono}</div>
        <h4>{nombre}</h4>
        <p>{conteo}</p>
      </a>''')
    return "\n".join(out)


# ---------------------------------------------------------------- eventos
EVENTOS = [
    {
        "titulo": "Festival de Musica Cali Vive",
        "cat": "Musica",
        "ciudad": "Cali, Valle del Cauca",
        "fecha": "24 de septiembre de 2026",
        "precio": "$85.000",
        "img": "festival-noche.jpg",
    },
    {
        "titulo": "Medellin Music Fest",
        "cat": "Festival",
        "ciudad": "Medellin, Antioquia",
        "fecha": "10 de octubre de 2026",
        "precio": "$120.000",
        "img": "concierto-artista.jpg",
    },
    {
        "titulo": "Festival de Jazz de Bogota",
        "cat": "Cultura",
        "ciudad": "Bogota, Colombia",
        "fecha": "17 de octubre de 2026",
        "precio": "$65.000",
        "img": "teatro-epoca.jpg",
    },
    {
        "titulo": "Carnaval Cultural de Barranquilla",
        "cat": "Cultura",
        "ciudad": "Barranquilla, Atlantico",
        "fecha": "7 de noviembre de 2026",
        "precio": "$50.000",
        "img": "festival-dia.jpg",
    },
]

PIN = ('<svg width="14" height="14" viewBox="0 0 24 24" fill="none">'
       '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" stroke="currentColor" '
       'stroke-width="2" stroke-linejoin="round"/>'
       '<circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="2"/></svg>')
CAL = ('<svg width="14" height="14" viewBox="0 0 24 24" fill="none">'
       '<rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" stroke-width="2"/>'
       '<path d="M3.5 10h17M8 3.5v3M16 3.5v3" stroke="currentColor" stroke-width="2" '
       'stroke-linecap="round"/></svg>')


def build_eventos():
    out = []
    for e in EVENTOS:
        out.append(f'''      <article class="ev">
        <div class="ev-img">
          <img src="{data_uri(e["img"])}" alt="{e["titulo"]}">
          <span class="ev-cat">{e["cat"]}</span>
        </div>
        <div class="ev-body">
          <h3>{e["titulo"]}</h3>
          <div class="ev-meta">
            <div>{PIN} {e["ciudad"]}</div>
            <div>{CAL} {e["fecha"]}</div>
          </div>
          <div class="ev-foot">
            <div class="ev-price">{e["precio"]}<small>COP - Precio final</small></div>
            <a href="#" class="btn btn-primary">Ver evento</a>
          </div>
        </div>
      </article>''')
    return "\n".join(out)


# ---------------------------------------------------------------- cerca de ti
CERCA = [
    ("Festival de Musica Cali Vive", "24 Sep - Cali",       "$85.000",  "festival-noche.jpg"),
    ("Clasico Vallecaucano",         "2 Oct - Estadio Pascual", "$45.000", "futbol-seleccion.jpg"),
    ("Noche de Teatro - Palmira",    "9 Oct - Teatro Materon",  "$35.000", "teatro-drama.jpg"),
]


def build_cerca():
    out = []
    for titulo, meta, precio, img in CERCA:
        out.append(f'''        <div class="near-item">
          <div class="near-thumb"><img src="{data_uri(img)}" alt="{titulo}"></div>
          <div class="near-info">
            <strong>{titulo}</strong>
            <span>{meta}</span>
            <span class="near-price">{precio} COP</span>
          </div>
        </div>''')
    return "\n".join(out)


# ---------------------------------------------------------------- main
def main():
    print("TicketFlow - build\n")
    with open(TPL, encoding="utf-8") as f:
        html = f.read()

    print("  Inyectando imagenes del hero...")
    repl = {
        "{{IMG_FEST}}":      data_uri("festival-dia.jpg"),
        "{{IMG_CONCIERTO}}": data_uri("concierto-artista.jpg"),
        "{{IMG_TEATRO}}":    data_uri("teatro-epoca.jpg"),
        "{{IMG_DEPORTE}}":   data_uri("futbol-seleccion.jpg"),
        "{{CATS}}":          build_cats(),
        "{{EVENTOS}}":       build_eventos(),
        "{{CERCA}}":         build_cerca(),
        "{{QR}}":            make_qr(),
    }
    print("  Construyendo categorias, eventos y seccion cercana...")
    for k, v in repl.items():
        html = html.replace(k, v)

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)

    kb = os.path.getsize(OUT) // 1024
    print(f"\n  OK -> {OUT}")
    print(f"  Tamano: {kb} KB (autocontenido, imagenes incluidas)")
    print("\n  Abrelo con doble clic o importalo a Figma con html.to.design")


if __name__ == "__main__":
    main()
