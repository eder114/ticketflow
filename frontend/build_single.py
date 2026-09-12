# -*- coding: utf-8 -*-
"""
TicketFlow - build_single.py
Combina las 14 pantallas en UN solo archivo HTML autocontenido,
con navegador lateral para saltar entre pantallas.

Uso:  python build_single.py
Salida: ticketflow-completo.html
"""
import io, os, re, sys

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "ticketflow-completo.html")

# Ejecuta build_screens.py para obtener el diccionario SCREENS ya construido
sys.path.insert(0, BASE)
import build_screens as bs

CSS = bs.CSS
FONTS = bs.FONTS

TITULOS = {
    "01_landing":          ("01", "Landing / Home",        "Publico"),
    "02_login":            ("02", "Login",                 "Publico"),
    "03_registro_cliente": ("03", "Registro Cliente",      "Publico"),
    "04_registro_agente":  ("04", "Registro Agente",       "Publico"),
    "05_catalogo":         ("05", "Catalogo de eventos",   "Cliente"),
    "06_detalle_evento":   ("06", "Detalle del evento",    "Cliente"),
    "07_checkout":         ("07", "Pago y reserva",        "Cliente"),
    "08_confirmacion":     ("08", "Confirmacion",          "Cliente"),
    "09_panel_cliente":    ("09", "Mis reservas",          "Cliente"),
    "10_panel_agente":     ("10", "Panel del agente",      "Agente"),
    "11_crear_evento":     ("11", "Crear / editar evento", "Agente"),
    "12_reservas_evento":  ("12", "Reservas por evento",   "Agente"),
    "13_dashboard_admin":  ("13", "Dashboard general",     "Admin"),
    "14_reportes_admin":   ("14", "Reportes analiticos",   "Admin"),
}

ORDEN = list(TITULOS.keys())

COLOR_ROL = {
    "Publico": "var(--text-2)",
    "Cliente": "var(--indigo)",
    "Agente":  "var(--blue)",
    "Admin":   "#0EA5E9",
}


def cuerpo(html_completo):
    """Extrae el contenido de <body>...</body>."""
    m = re.search(r"<body[^>]*>(.*)</body>", html_completo, re.S)
    return m.group(1) if m else html_completo


def landing_externo():
    """Usa index.html (landing del brief) si existe."""
    p = os.path.join(BASE, "index.html")
    if not os.path.exists(p):
        return None
    src = io.open(p, encoding="utf-8").read()
    body = cuerpo(src)
    m = re.search(r"<style>(.*?)</style>", src, re.S)
    css_extra = m.group(1) if m else ""
    return body, css_extra


# ---------------------------------------------------------------- navegador
def nav_lateral():
    items = []
    rol_actual = None
    for key in ORDEN:
        num, nombre, rol = TITULOS[key]
        if rol != rol_actual:
            items.append(f'<div class="idx-rol">{rol}</div>')
            rol_actual = rol
        items.append(
            f'<a class="idx-link" href="#{key}" data-target="{key}">'
            f'<span class="idx-num">{num}</span>{nombre}</a>'
        )
    return "\n".join(items)


CSS_SHELL = """
/* ===== Shell del documento combinado ===== */
html{scroll-behavior:smooth}
body.tf-doc{width:auto;background:#0B1120;margin:0}
.tf-layout{display:flex;align-items:flex-start}
.tf-side{
  position:sticky;top:0;width:280px;height:100vh;flex-shrink:0;
  background:#0B1120;border-right:1px solid rgba(255,255,255,.08);
  padding:28px 20px;overflow-y:auto;font-family:'Inter',sans-serif;
}
.tf-side h1{
  font-family:'Space Grotesk',sans-serif;font-size:22px;color:#fff;
  margin:0 0 4px;letter-spacing:-.02em;display:flex;align-items:center;gap:10px;
}
.tf-logo{
  width:32px;height:32px;border-radius:9px;
  background:linear-gradient(135deg,#635BFF,#3B82F6);
  display:flex;align-items:center;justify-content:center;
}
.tf-side .sub{font-size:12px;color:#64748B;margin-bottom:26px;line-height:1.5}
.idx-rol{
  font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:#475569;margin:20px 0 8px;padding-left:10px;
}
.idx-link{
  display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:9px;
  color:#94A3B8;font-size:13.5px;text-decoration:none;margin-bottom:2px;
}
.idx-link:hover{background:rgba(255,255,255,.05);color:#E2E8F0}
.idx-link.on{background:linear-gradient(135deg,#635BFF,#3B82F6);color:#fff;font-weight:600}
.idx-num{
  font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;
  opacity:.65;min-width:18px;
}
.tf-main{flex:1;min-width:0;padding:32px 32px 80px;display:flex;flex-direction:column;gap:44px}
.tf-screen{scroll-margin-top:24px}
.tf-head{display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap}
.tf-head .n{
  font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;
  color:#fff;background:rgba(255,255,255,.10);padding:5px 11px;border-radius:7px;
}
.tf-head .t{font-family:'Space Grotesk',sans-serif;font-size:19px;font-weight:600;color:#fff}
.tf-head .r{
  font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
  padding:5px 11px;border-radius:999px;color:#fff;
}
.tf-frame{
  border-radius:14px;overflow:hidden;background:#F8FAFC;
  box-shadow:0 20px 60px rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.10);
}
.tf-frame > *{width:1440px}
@media print{.tf-side{display:none}.tf-main{padding:0}}
"""

JS_SCROLLSPY = """
<script>
(function(){
  var links=[].slice.call(document.querySelectorAll('.idx-link'));
  var secs=links.map(function(a){return document.getElementById(a.dataset.target);});
  function marcar(){
    var y=window.scrollY+140,i=0;
    secs.forEach(function(s,k){ if(s && s.offsetTop<=y) i=k; });
    links.forEach(function(a,k){ a.classList.toggle('on',k===i); });
  }
  window.addEventListener('scroll',marcar,{passive:true});
  marcar();
})();
</script>
"""


def main():
    print("TicketFlow - archivo unico\n")

    ext = landing_externo()
    css_extra = ""
    bodies = {}

    for key in ORDEN:
        if key == "01_landing" and ext:
            body, css_extra = ext
            bodies[key] = f'<div class="screen">{body}</div>'
            print("  01_landing  (desde index.html del brief)")
        else:
            bodies[key] = cuerpo(bs.SCREENS[key])
            print(f"  {key}")

    partes = []
    for key in ORDEN:
        num, nombre, rol = TITULOS[key]
        partes.append(f"""
<section class="tf-screen" id="{key}">
  <div class="tf-head">
    <span class="n">{num}</span>
    <span class="t">{nombre}</span>
    <span class="r" style="background:{COLOR_ROL[rol]}">{rol}</span>
  </div>
  <div class="tf-frame">{bodies[key]}</div>
</section>""")

    doc = f"""<!DOCTYPE html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TicketFlow - 14 pantallas</title>
{FONTS}
<style>
{CSS}
{css_extra}
{CSS_SHELL}
</style>
</head>
<body class="tf-doc">
<div class="tf-layout">
  <aside class="tf-side">
    <h1>
      <span class="tf-logo">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.5a2.5 2.5 0 0 0 0 5V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5a2.5 2.5 0 0 0 0-5V8Z"
                stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/>
        </svg>
      </span>
      TicketFlow
    </h1>
    <div class="sub">14 pantallas &middot; Indigo #635BFF<br>Space Grotesk + Inter</div>
    {nav_lateral()}
  </aside>
  <main class="tf-main">
    {''.join(partes)}
  </main>
</div>
{JS_SCROLLSPY}
</body>
</html>"""

    io.open(OUT, "w", encoding="utf-8").write(doc)
    mb = os.path.getsize(OUT) / (1024 * 1024)
    print(f"\n  OK -> {OUT}")
    print(f"  Tamano: {mb:.1f} MB (14 pantallas, CSS e imagenes incluidas)")


if __name__ == "__main__":
    main()
