# -*- coding: utf-8 -*-
"""
Unifica las 14 pantallas de Stitch en UNA sola pagina web.

- Fusiona los tailwind.config de cada pantalla en uno solo
- Concatena los bloques <style> sin duplicar
- Incrusta las 40 imagenes como data URI
- Anade una barra flotante para navegar entre pantallas

Uso:  python unir.py
Salida: ticketflow.html
"""
import base64, glob, json, os, re, io

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = r"C:\Users\ederf\Downloads\stitch_ticketflow_landing_page_design\stitch_ticketflow_landing_page_design"
IMGDIR = os.path.join(BASE, "img")
OUT = os.path.join(BASE, "ticketflow.html")
URLS = r"C:\Users\ederf\AppData\Local\Temp\urls2.txt"

# orden y titulos legibles
PANTALLAS = [
    ("ticketflow_landing_page",                            "Inicio",              "Publico"),
    ("inicio_de_sesi_n_ticketflow",                        "Iniciar sesion",      "Publico"),
    ("registro_de_cliente_ticketflow",                     "Registro cliente",    "Publico"),
    ("registro_de_agente_ticketflow",                      "Registro agente",     "Publico"),
    ("cat_logo_de_eventos_ticketflow",                     "Catalogo",            "Cliente"),
    ("detalle_del_evento_festival_de_m_sica_cali_vive",    "Detalle del evento",  "Cliente"),
    ("pago_y_reserva_ticketflow",                          "Pago y reserva",      "Cliente"),
    ("confirmaci_n_de_reserva_ticketflow",                 "Confirmacion",        "Cliente"),
    ("panel_de_cliente_ticketflow",                        "Mis reservas",        "Cliente"),
    ("panel_de_agente_ventas_ticketflow",                  "Panel del agente",    "Agente"),
    ("crear_editar_evento_ticketflow",                     "Crear evento",        "Agente"),
    ("reservas_por_evento_panel_organizador_ticketflow",   "Reservas por evento", "Agente"),
    ("panel_de_administraci_n_global_ticketflow",          "Dashboard",           "Admin"),
    ("reportes_anal_ticos_ticketflow_admin_1",             "Reportes",            "Admin"),
]

COLOR_ROL = {"Publico": "#64748B", "Cliente": "#635BFF", "Agente": "#0058BE", "Admin": "#0EA5E9"}


# ---------------------------------------------------------------- imagenes
def mapa_imagenes():
    """URL original -> data URI (usando las descargadas en img/)."""
    urls = [l.strip() for l in io.open(URLS, encoding="utf-8") if l.strip()]
    m = {}
    for i, u in enumerate(urls, 1):
        p = os.path.join(IMGDIR, f"img{i:02d}.jpg")
        if not os.path.exists(p):
            continue
        head = open(p, "rb").read(4)
        mime = "image/png" if head[:4] == b"\x89PNG" else "image/jpeg"
        with open(p, "rb") as f:
            m[u] = f"data:{mime};base64," + base64.b64encode(f.read()).decode()
    return m


# ---------------------------------------------------------------- parseo
def leer(slug):
    p = os.path.join(SRC, slug, "code.html")
    return io.open(p, encoding="utf-8").read()


def sacar_config(html):
    m = re.search(r"tailwind\.config\s*=\s*(\{.*?\})\s*</script>", html, re.S)
    if not m:
        return {}
    txt = m.group(1)
    # Stitch deja los keys externos sin comillas (darkMode:, theme:, extend:)
    txt = re.sub(r'([{,]\s*)([A-Za-z_$][\w$-]*)(\s*:)', r'\1"\2"\3', txt)
    # comas colgantes
    txt = re.sub(r",(\s*[}\]])", r"\1", txt)
    try:
        return json.loads(txt)
    except json.JSONDecodeError as e:
        print(f"  ! config no parseable: {e}")
        return {}


def sacar_estilos(html):
    return [m.group(1).strip() for m in re.finditer(r"<style[^>]*>(.*?)</style>", html, re.S)]


def sacar_body(html):
    """Devuelve (contenido, clases_del_body).

    Varias pantallas apoyan su layout en el propio <body> (flex, md:flex-row,
    pt-20...). Si solo copiamos el contenido, esos paneles se apilan en vez de
    quedar lado a lado, asi que hay que conservar esas clases.
    """
    m = re.search(r"<body([^>]*)>(.*)</body>", html, re.S)
    if not m:
        return "", ""
    attrs, contenido = m.group(1), m.group(2)
    mc = re.search(r'class\s*=\s*"([^"]*)"', attrs)
    clases = mc.group(1) if mc else ""
    # min-h-screen/h-full sobre el contenedor pelean con el apilado de pantallas
    clases = " ".join(c for c in clases.split() if c not in ("h-full",))
    return contenido, clases


def reparar_svg(body):
    """
    Stitch corta el ultimo segmento de algunas curvas: un comando C necesita
    3 pares de coordenadas y solo escribe 2, lo que invalida todo el path.
    Completamos el segmento interpolando el punto de control que falta.
    """
    arreglos = 0

    def fix(m):
        nonlocal arreglos
        d = m.group(1)
        # ultimo comando C del path
        mc = re.search(r"C\s*([\d.]+),([\d.]+)\s+([\d.]+),([\d.]+)\s*$", d)
        if not mc:
            return m.group(0)
        x1, y1, x2, y2 = (float(v) for v in mc.groups())
        # el segundo par era el destino: generamos un control intermedio
        cx, cy = (x1 + x2) / 2, (y1 + y2) / 2
        nuevo = re.sub(r"C\s*[\d.]+,[\d.]+\s+[\d.]+,[\d.]+\s*$",
                       f"C{x1:g},{y1:g} {cx:g},{cy:g} {x2:g},{y2:g}", d)
        arreglos += 1
        return f'd="{nuevo}"'

    body = re.sub(r'd="(M[^"]*C[^"]*)"', fix, body)
    return body, arreglos


TRADUCCIONES = [
    ("My Tickets", "Mis entradas"),
    ("My Bookings", "Mis reservas"),
    ("Favorites", "Favoritos"),
    ("History", "Historial"),
    ("Settings", "Ajustes"),
    ("Profile", "Perfil"),
    ("Dashboard", "Panel"),
    ("Home", "Inicio"),
]


def reparar_recortes(body):
    """
    La tarjeta del buscador cuelga del hero con bottom:-40px, pero su seccion
    tiene overflow:hidden y la recorta. Al apoyarla en el borde (bottom-0)
    queda completa sin tocar el recorte que contiene las manchas del fondo.
    """
    nuevo, n = re.subn(r"bottom-\[-\d+px\]", "bottom-0", body)
    return nuevo, n


def traducir(body):
    """El panel de cliente vino con el menu en ingles; el resto esta en espanol.
    Solo tocamos texto entre etiquetas, nunca atributos ni clases."""
    n = 0

    def cambia(m):
        nonlocal n
        txt = m.group(1)
        for en, es in TRADUCCIONES:
            nuevo = re.sub(rf"\b{re.escape(en)}\b", es, txt)
            if nuevo != txt:
                txt = nuevo
                n += 1
        return ">" + txt + "<"

    body = re.sub(r">([^<>]+)<", cambia, body)
    return body, n


def fusionar(a, b):
    """Deep merge de dos dicts; b gana en conflictos de hoja."""
    out = dict(a)
    for k, v in b.items():
        if k in out and isinstance(out[k], dict) and isinstance(v, dict):
            out[k] = fusionar(out[k], v)
        else:
            out[k] = v
    return out


def css_tipografia(config):
    """
    Stitch emite `font-display-lg` (solo familia) donde deberia emitir
    `text-display-lg` (tamano + interlineado + peso). Generamos las reglas
    que faltan a partir del propio fontSize del config, para las clases
    base y para las variantes md:.
    """
    fs = config.get("theme", {}).get("extend", {}).get("fontSize", {})
    if not fs:
        return ""
    base, md = [], []
    for nombre, val in fs.items():
        if not (isinstance(val, list) and val):
            continue
        size = val[0]
        extra = val[1] if len(val) > 1 and isinstance(val[1], dict) else {}
        decl = [f"font-size:{size}"]
        if extra.get("lineHeight"):
            decl.append(f"line-height:{extra['lineHeight']}")
        if extra.get("letterSpacing"):
            decl.append(f"letter-spacing:{extra['letterSpacing']}")
        if extra.get("fontWeight"):
            decl.append(f"font-weight:{extra['fontWeight']}")
        cuerpo = ";".join(decl)
        base.append(f".font-{nombre}{{{cuerpo}}}")
        md.append(f".md\\:font-{nombre}{{{cuerpo}}}")
    return ("/* --- tipografia: completa las clases font-* de Stitch --- */\n"
            + "\n".join(base)
            + "\n@media (min-width:768px){\n" + "\n".join(md) + "\n}")


# ---------------------------------------------------------------- rutas
# indices 0-based segun el orden de PANTALLAS
RUTAS_GLOBALES = {
    "ticketflow": 0, "inicio": 0, "volver al inicio": 0,
    "iniciar sesion": 1, "cerrar sesion": 1,
    "registrarme": 2, "crear una cuenta": 2, "crear mi cuenta": 2, "crear cuenta": 2,
    "eventos": 4, "categorias": 4, "explorar eventos": 4, "buscar eventos": 4,
    "buscar": 4, "ver todos": 4, "ver todo": 4,
    "conciertos": 4, "festivales": 4, "deportes": 4, "teatro": 4,
    "comedia": 4, "cultura": 4, "academicos": 4, "conferencias": 4,
    "comprar entradas": 6, "volver al evento": 5, "detalles del evento": 5,
    "mis tickets": 8, "mis entradas": 8, "my tickets": 8, "ver mis entradas": 8,
    "my bookings": 8, "ver entrada": 7,
    "crear evento": 10, "crear un evento": 10, "crear mi evento": 10,
}

RUTAS_POR_PANTALLA = {
    "p2":  {"iniciar sesion": 8, "crear una cuenta": 2, "olvidaste tu contrasena": 1},
    "p3":  {"crear mi cuenta": 8, "iniciar sesion": 1},
    "p4":  {"crear cuenta de agente": 9, "iniciar sesion": 1},
    "p6":  {"comprar entradas": 6, "seleccionar": 6},
    "p8":  {"ver mis entradas": 8, "descargar": 8, "volver al inicio": 0},
    "p9":  {"inicio": 8, "ver entrada": 7, "detalles del evento": 5,
            "mis entradas": 8, "mis reservas": 8, "favoritos": 8,
            "historial": 8, "perfil": 8, "ajustes": 8},
    "p10": {"inicio": 9, "ventas": 9, "entradas": 11, "eventos asignados": 11,
            "asistentes": 11, "gestionar inventario": 11, "notificaciones": 9,
            "ver historial completo": 11},
    "p11": {"inicio": 9, "mis eventos": 11, "crear evento": 10, "entradas": 11,
            "ventas": 9, "estadisticas": 9, "configuracion": 9,
            "vista previa": 5, "continuar a revision": 11},
    "p12": {"inicio": 9, "mis eventos": 11, "crear evento": 10, "reservas": 11,
            "entradas": 11, "ventas": 9, "estadisticas": 9, "asistentes": 11,
            "configuracion": 9, "nueva reserva": 11},
    "p13": {"inicio": 12, "estadisticas": 13, "usuarios": 12, "organizadores": 12,
            "agentes": 12, "eventos": 12, "ventas": 12, "reservas": 12,
            "entradas": 12, "asistentes": 12, "actividad": 12,
            "notificaciones": 12, "ajustes": 12, "revisar": 13,
            "ver alertas": 13, "ver todo el historial": 13, "ver todos": 13},
    "p14": {"inicio": 12, "estadisticas": 13, "usuarios": 12, "organizadores": 12,
            "agentes": 12, "eventos": 12, "ventas": 12, "reservas": 12,
            "entradas": 12, "asistentes": 12, "actividad": 12,
            "notificaciones": 12, "ajustes": 12,
            "ver desglose geografico": 13, "exportar datos": 13},
}

# texto que empieza por... -> destino
RUTAS_PREFIJO = {"pagar": 7, "continuar al pago": 7, "reservar": 6}


def js_rutas():
    return f"""
var RUTAS_G = {json.dumps(RUTAS_GLOBALES, ensure_ascii=False)};
var RUTAS_P = {json.dumps(RUTAS_POR_PANTALLA, ensure_ascii=False)};
var RUTAS_PRE = {json.dumps(RUTAS_PREFIJO, ensure_ascii=False)};

function tfNorm(s){{
  return (s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\\s+/g,' ').trim();
}}
function tfTexto(el){{
  var c = el.cloneNode(true);
  c.querySelectorAll('.material-symbols-outlined,.material-icons').forEach(function(n){{ n.remove(); }});
  return tfNorm(c.textContent);
}}
function tfDestino(pid, t){{
  if (!t) return null;
  var loc = RUTAS_P[pid];
  if (loc && loc[t] !== undefined) return loc[t];
  if (RUTAS_G[t] !== undefined) return RUTAS_G[t];
  for (var k in RUTAS_PRE) if (t.indexOf(k) === 0) return RUTAS_PRE[k];
  return null;
}}

function tfCablear(ir){{
  document.querySelectorAll('.tf-screen').forEach(function(sec){{
    var pid = sec.id;

    // 1) enlaces y botones por su texto
    sec.querySelectorAll('a,button').forEach(function(el){{
      if (el.closest('#tf-bar,#tf-menu')) return;
      var d = tfDestino(pid, tfTexto(el));
      if (d === null) return;
      el.style.cursor = 'pointer';
      el.setAttribute('data-tf-link', '');
      el.addEventListener('click', function(e){{ e.preventDefault(); e.stopPropagation(); ir(d); }});
    }});

    // 2) tarjetas de evento (llevan precio) -> detalle
    if (pid === 'p1' || pid === 'p5' || pid === 'p9') {{
      var destino = (pid === 'p9') ? 7 : 5;
      sec.querySelectorAll('div,article,li').forEach(function(card){{
        if (card.dataset.tfCard) return;
        var t = card.textContent || '';
        if (!/\\$\\s?\\d/.test(t)) return;
        if (t.length > 320) return;                    // solo la tarjeta, no el contenedor
        if (card.querySelector('div,article,li') && card.children.length > 6) return;
        card.dataset.tfCard = '1';
        card.style.cursor = 'pointer';
        card.addEventListener('click', function(e){{
          if (e.target.closest('a,button')) return;
          ir(destino);
        }});
      }});
    }}
  }});
}}
"""


# ---------------------------------------------------------------- chrome
def barra(pantallas):
    grupos = {}
    for i, (_, titulo, rol) in enumerate(pantallas):
        grupos.setdefault(rol, []).append((i, titulo))

    menu = []
    for rol, items in grupos.items():
        menu.append(
            f'<div style="font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;'
            f'color:#94A3B8;padding:12px 14px 6px">{rol}</div>')
        for i, titulo in items:
            menu.append(
                f'<button class="tf-item" data-go="{i}" style="display:flex;align-items:center;gap:10px;'
                f'width:100%;padding:9px 14px;border:0;background:none;cursor:pointer;text-align:left;'
                f'font-family:Inter,sans-serif;font-size:13.5px;color:#334155;border-radius:8px">'
                f'<span style="width:6px;height:6px;border-radius:99px;background:{COLOR_ROL[rol]};'
                f'flex-shrink:0"></span>{titulo}</button>')

    return f"""
<div id="tf-bar" style="position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:99999;
  display:flex;align-items:center;gap:4px;padding:6px;border-radius:999px;
  background:rgba(17,24,39,.92);backdrop-filter:blur(14px);
  box-shadow:0 12px 40px rgba(0,0,0,.3);font-family:Inter,system-ui,sans-serif">
  <button id="tf-back" title="Atras (Backspace)" style="width:34px;height:34px;border-radius:999px;border:0;
    background:rgba(255,255,255,.1);color:#fff;cursor:pointer;display:flex;align-items:center;
    justify-content:center;font-size:14px;opacity:.35">&#8592;</button>
  <span style="width:1px;height:18px;background:rgba(255,255,255,.15)"></span>
  <button id="tf-prev" title="Anterior" style="width:34px;height:34px;border-radius:999px;border:0;
    background:rgba(255,255,255,.1);color:#fff;cursor:pointer;display:flex;align-items:center;
    justify-content:center;font-size:15px">&#8249;</button>
  <button id="tf-toggle" style="display:flex;align-items:center;gap:9px;padding:0 16px;height:34px;
    border-radius:999px;border:0;background:none;color:#fff;cursor:pointer;
    font-family:Inter,sans-serif;font-size:13.5px;font-weight:600;white-space:nowrap">
    <span id="tf-num" style="font-size:11px;font-weight:700;color:#94A3B8;font-variant-numeric:tabular-nums">01/14</span>
    <span id="tf-title">Inicio</span>
    <span style="color:#94A3B8;font-size:10px">&#9650;</span>
  </button>
  <button id="tf-next" title="Siguiente" style="width:34px;height:34px;border-radius:999px;border:0;
    background:rgba(255,255,255,.1);color:#fff;cursor:pointer;display:flex;align-items:center;
    justify-content:center;font-size:15px">&#8250;</button>
</div>

<div id="tf-menu" style="position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:99999;
  width:280px;max-height:60vh;overflow-y:auto;padding:6px;border-radius:16px;background:#fff;
  box-shadow:0 20px 60px rgba(0,0,0,.22);border:1px solid #E2E8F0;display:none;
  font-family:Inter,system-ui,sans-serif">
  {''.join(menu)}
</div>

<script>
{js_rutas()}

(function(){{
  var TITULOS = {json.dumps([t for _, t, _ in pantallas], ensure_ascii=False)};
  var secs = document.querySelectorAll('.tf-screen');
  var bar = document.getElementById('tf-menu');
  var actual = -1;          // -1 fuerza el primer render
  var historial = [];

  function pintarBack(){{
    var b = document.getElementById('tf-back');
    b.style.opacity = historial.length ? '1' : '.35';
    b.style.cursor = historial.length ? 'pointer' : 'default';
  }}

  function atras(){{
    if (!historial.length) return;
    ir(historial.pop(), true);
  }}

  function ir(i, sinHistorial){{
    if (i < 0) i = secs.length - 1;
    if (i >= secs.length) i = 0;
    if (i === actual) return;
    if (!sinHistorial && actual >= 0) {{
      historial.push(actual);
      if (historial.length > 40) historial.shift();
    }}
    actual = i;
    // dejar vacio el display para que mande la clase de la pantalla (flex, block...)
    secs.forEach(function(s, k){{ s.style.display = (k === i) ? '' : 'none'; }});
    document.getElementById('tf-title').textContent = TITULOS[i];
    document.getElementById('tf-num').textContent =
      String(i + 1).padStart(2, '0') + '/' + String(secs.length).padStart(2, '0');
    document.querySelectorAll('.tf-item').forEach(function(b, k){{
      b.style.background = (k === i) ? '#F1F0FF' : 'none';
      b.style.color = (k === i) ? '#493EE5' : '#334155';
      b.style.fontWeight = (k === i) ? '600' : '400';
    }});
    bar.style.display = 'none';
    window.scrollTo(0, 0);
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
    secs.forEach(function(x){{ x.scrollTop = 0; }});
    location.hash = 'p' + (i + 1);
    pintarBack();
  }}

  document.getElementById('tf-toggle').onclick = function(e){{
    e.stopPropagation();
    bar.style.display = (bar.style.display === 'block') ? 'none' : 'block';
  }};
  document.getElementById('tf-back').onclick = atras;
  document.getElementById('tf-prev').onclick = function(){{ ir(actual - 1); }};
  document.getElementById('tf-next').onclick = function(){{ ir(actual + 1); }};
  document.querySelectorAll('.tf-item').forEach(function(b){{
    b.onclick = function(){{ ir(parseInt(b.dataset.go, 10)); }};
    b.onmouseenter = function(){{ if (parseInt(b.dataset.go,10) !== actual) b.style.background = '#F8FAFC'; }};
    b.onmouseleave = function(){{ if (parseInt(b.dataset.go,10) !== actual) b.style.background = 'none'; }};
  }});
  document.addEventListener('click', function(){{ bar.style.display = 'none'; }});
  document.addEventListener('keydown', function(e){{
    if (e.target.matches('input,textarea,select')) return;
    if (e.key === 'ArrowRight') ir(actual + 1);
    if (e.key === 'ArrowLeft')  ir(actual - 1);
    if (e.key === 'Backspace')  {{ e.preventDefault(); atras(); }}
    if (e.key === 'Escape')     bar.style.display = 'none';
  }});

  tfCablear(ir);

  var h = parseInt((location.hash || '').replace('#p', ''), 10);
  ir(h >= 1 && h <= secs.length ? h - 1 : 0);
}})();
</script>"""


# ---------------------------------------------------------------- main
def main():
    print("TicketFlow - unificando 14 pantallas\n")

    imgs = mapa_imagenes()
    print(f"  {len(imgs)} imagenes listas para incrustar")

    config = {}
    estilos = []
    secciones = []
    svg_reparados = {}

    for idx, (slug, titulo, rol) in enumerate(PANTALLAS):
        ruta = os.path.join(SRC, slug, "code.html")
        if not os.path.exists(ruta):
            print(f"  ! falta {slug}")
            continue
        html = leer(slug)
        config = fusionar(config, sacar_config(html))
        for s in sacar_estilos(html):
            if s not in estilos:
                estilos.append(s)

        body, clases_body = sacar_body(html)
        body, nsvg = reparar_svg(body)
        body, ntrad = traducir(body)
        body, nrec = reparar_recortes(body)
        if nrec:
            print(f"  * {nrec} elemento(s) descolgado(s) reencuadrado(s) en {titulo}")
        if nsvg:
            svg_reparados[titulo] = nsvg
        for url, uri in imgs.items():
            body = body.replace(url, uri)
        # por si alguna URL quedo con caracter extra
        body = re.sub(r'https://lh3\.googleusercontent\.com/[^"\')\s]*',
                      'data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 '
                      'width=%224%22 height=%223%22%3E%3Crect width=%224%22 height=%223%22 '
                      'fill=%22%23E2E8F0%22/%3E%3C/svg%3E', body)

        secciones.append(
            f'<div class="tf-screen {clases_body}" id="p{idx+1}" data-rol="{rol}" '
            f'style="display:none">{body}</div>')
        flex = "flex" in clases_body.split()
        print(f"  {idx+1:02d} {titulo}" + ("   [layout flex del body conservado]" if flex else ""))

    doc = f"""<!DOCTYPE html>
<html class="light" lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TicketFlow &mdash; Plataforma de eventos</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<script>
tailwind.config = {json.dumps(config, indent=2, ensure_ascii=False)};
</script>
<style>
{chr(10).join(estilos)}
{css_tipografia(config)}
/* --- chrome de navegacion --- */
#tf-menu::-webkit-scrollbar{{width:8px}}
#tf-menu::-webkit-scrollbar-thumb{{background:#CBD5E1;border-radius:99px}}
#tf-bar button:hover{{filter:brightness(1.15)}}
/* pista visual en lo que navega */
[data-tf-link]{{transition:opacity .15s}}
[data-tf-link]:hover{{opacity:.72}}
[data-tf-card]{{transition:transform .15s}}
[data-tf-card]:hover{{transform:translateY(-2px)}}
@media print{{#tf-bar,#tf-menu{{display:none !important}}}}
</style>
</head>
<body class="bg-background text-on-background font-body-md text-body-md antialiased">
{''.join(secciones)}
{barra(PANTALLAS)}
</body>
</html>"""

    io.open(OUT, "w", encoding="utf-8").write(doc)
    mb = os.path.getsize(OUT) / (1024 * 1024)
    print(f"\n  OK -> {OUT}")
    print(f"  {len(secciones)} pantallas &middot; {mb:.1f} MB")


if __name__ == "__main__":
    main()
