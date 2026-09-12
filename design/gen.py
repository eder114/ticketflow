# -*- coding: utf-8 -*-
"""
Genera los 14 artboards .dc.html de TicketFlow + canvas.json
para el lienzo de Claude Design.
"""
import io, json, os, shutil

BASE = os.path.dirname(os.path.abspath(__file__))
SRC_ASSETS = os.path.join(os.path.dirname(BASE), "frontend", "assets")

# ---------------------------------------------------------------- tokens
C = {
    "indigo": "#635BFF", "blue": "#3B82F6", "navy": "#111827", "bg": "#F8FAFC",
    "t2": "#64748B", "ok": "#22C55E", "err": "#EF4444",
    "line": "#E8EDF3", "line2": "#DDE4ED", "white": "#fff",
    "muted": "#94A3B8", "soft": "#F1F5F9",
    "indigo50": "#F2F1FF", "indigo100": "#E5E3FF",
    "blue50": "#EFF6FF", "ok50": "#F0FDF4", "ok600": "#16A34A",
    "warn": "#F59E0B", "warn50": "#FFFBEB", "warn600": "#B45309",
    "err50": "#FEF2F2", "err600": "#DC2626",
    "grad": "linear-gradient(135deg,#635BFF 0%,#3B82F6 100%)",
}
SH = {
    "sm": "0 1px 2px rgba(17,24,39,.05)",
    "md": "0 4px 16px rgba(17,24,39,.06)",
    "lg": "0 12px 32px rgba(17,24,39,.08)",
    "cta": "0 4px 14px rgba(99,91,255,.28)",
}

# ---------------------------------------------------------------- iconos SVG
def _svg(d, size=16, sw=1.7, fill="none"):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="{fill}" '
            f'stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" '
            f'stroke-linejoin="round" style="flex-shrink:0">{d}</svg>')

I = {
    "pin":   lambda s=15: _svg('<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>', s),
    "cal":   lambda s=15: _svg('<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3.5v3M16 3.5v3"/>', s),
    "search":lambda s=16: _svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>', s),
    "clock": lambda s=15: _svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>', s),
    "check": lambda s=15: _svg('<path d="M20 6.5 9.5 17 4 11.5"/>', s, 2.2),
    "arrow": lambda s=16: _svg('<path d="M5 12h13M12.5 6.5 19 12l-6.5 5.5"/>', s),
    "back":  lambda s=16: _svg('<path d="M19 12H6M11.5 6.5 5 12l6.5 5.5"/>', s),
    "down":  lambda s=15: _svg('<path d="M12 4.5v11M7.5 11l4.5 4.5L16.5 11M5 19.5h14"/>', s),
    "up":    lambda s=13: _svg('<path d="M12 19V6M6.5 11.5 12 6l5.5 5.5"/>', s, 2.2),
    "dn":    lambda s=13: _svg('<path d="M12 5v13M6.5 12.5 12 18l5.5-5.5"/>', s, 2.2),
    "ticket":lambda s=16: _svg('<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.4a2.6 2.6 0 0 0 0 5.2V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.4a2.6 2.6 0 0 0 0-5.2V8Z"/>', s),
    "user":  lambda s=15: _svg('<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/>', s),
    "users": lambda s=15: _svg('<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5a6 6 0 0 1 12 0M16 5.4a3.2 3.2 0 0 1 0 5.2M17.5 19.5a6 6 0 0 0-2-4.5"/>', s),
    "chart": lambda s=15: _svg('<path d="M4 19.5h16M7.5 16V9.5M12 16V5M16.5 16v-4"/>', s),
    "grid":  lambda s=15: _svg('<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>', s),
    "money": lambda s=15: _svg('<rect x="3" y="6" width="18" height="12" rx="2.4"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 12h.01M17.5 12h.01"/>', s),
    "gear":  lambda s=15: _svg('<circle cx="12" cy="12" r="3.2"/><path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M18 6l-1.4 1.4M7.4 16.6 6 18M18 18l-1.4-1.4M7.4 7.4 6 6"/>', s),
    "plus":  lambda s=16: _svg('<path d="M12 5.5v13M5.5 12h13"/>', s, 2),
    "img":   lambda s=26: _svg('<rect x="3" y="5" width="18" height="14" rx="2.4"/><circle cx="8.5" cy="10" r="1.6"/><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"/>', s, 1.5),
    "shield":lambda s=15: _svg('<path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.6-7 9-4.1-1.4-7-4.7-7-9V6l7-2.5Z"/>', s),
    "lock":  lambda s=15: _svg('<rect x="5" y="10.5" width="14" height="9.5" rx="2.2"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/>', s),
    "warn":  lambda s=15: _svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 8v4.5M12 15.8h.01"/>', s),
    "bank":  lambda s=17: _svg('<path d="M4 10.5h16M5.5 10.5V18M10 10.5V18M14 10.5V18M18.5 10.5V18M3.5 20.5h17M12 3.5l8 5.5H4l8-5.5Z"/>', s),
    "card":  lambda s=17: _svg('<rect x="3" y="6" width="18" height="12" rx="2.4"/><path d="M3 10h18M6.5 14.5h3"/>', s),
    "cash":  lambda s=17: _svg('<rect x="3" y="7" width="18" height="10" rx="2"/><circle cx="12" cy="12" r="2.4"/>', s),
    "star":  lambda s=15: _svg('<path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8L12 4Z"/>', s),
    "gift":  lambda s=15: _svg('<rect x="3.5" y="9" width="17" height="11" rx="2"/><path d="M3.5 13.5h17M12 9v11M12 9c-2.5 0-4-1-4-2.5S9.5 4 12 9Zm0 0c2.5 0 4-1 4-2.5S14.5 4 12 9Z"/>', s),
    "globe": lambda s=15: _svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.2 2.4 3.4 5.4 3.4 8.5s-1.2 6.1-3.4 8.5c-2.2-2.4-3.4-5.4-3.4-8.5S9.8 5.9 12 3.5Z"/>', s),
    "trophy":lambda s=15: _svg('<path d="M8 4.5h8v4.2a4 4 0 0 1-8 0V4.5ZM8 6H5.5v1.2A2.8 2.8 0 0 0 8 10M16 6h2.5v1.2A2.8 2.8 0 0 1 16 10M10 12.9V16M14 12.9V16M8 19.5h8"/>', s),
    "flow":  lambda s=15: _svg('<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H14a4 4 0 0 1 0 8H10a4 4 0 0 0 0 8h.5"/>', s),
}

LOGO = ('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" '
        'stroke-width="1.7" stroke-linejoin="round">'
        '<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.4a2.6 2.6 0 0 0 0 5.2V16a2 2 0 0 1-2 2H6'
        'a2 2 0 0 1-2-2v-1.4a2.6 2.6 0 0 0 0-5.2V8Z"/>'
        '<path d="M14 7v10" stroke-dasharray="2 2.5" stroke-linecap="round"/></svg>')

# ---------------------------------------------------------------- helmet
HELMET = f"""<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap">
  <style>
    *{{box-sizing:border-box;margin:0;padding:0}}
    body{{font-family:'Inter',system-ui,sans-serif;background:{C['bg']};color:{C['navy']};
      line-height:1.5;-webkit-font-smoothing:antialiased}}
    h1,h2,h3,h4{{font-family:'Space Grotesk','Inter',system-ui,sans-serif;
      font-weight:700;letter-spacing:-.022em;line-height:1.14}}
    a{{color:{C['indigo']};text-decoration:none}}
    a:hover{{color:#4F46D6}}
    svg{{display:block}}
  </style>
</helmet>"""

def page(body, w=1440, h=900):
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
{HELMET}
<div style="width:{w}px;min-height:{h}px;background:{C['bg']};font-family:'Inter',system-ui,sans-serif">
{body}
</div>
</x-dc>
<script data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{}}
</script>
</body>
</html>"""

# ---------------------------------------------------------------- componentes
def brand(dark=False, size=21):
    col = "#fff" if dark else C["navy"]
    return (f'<div style="display:flex;align-items:center;gap:10px;font-family:\'Space Grotesk\',sans-serif;'
            f'font-weight:700;font-size:{size}px;letter-spacing:-.022em;color:{col}">'
            f'<span style="width:34px;height:34px;border-radius:9px;background:{C["grad"]};'
            f'display:flex;align-items:center;justify-content:center">{LOGO}</span>TicketFlow</div>')

def btn(txt, kind="primary", icon=None, size="md", full=False):
    pad = "14px 26px" if size == "lg" else "11px 20px"
    fs = "15px" if size == "lg" else "14px"
    st = {
        "primary": f"background:{C['grad']};color:#fff;box-shadow:{SH['cta']};border:1px solid transparent",
        "solid":   f"background:{C['indigo']};color:#fff;border:1px solid transparent",
        "outline": f"background:#fff;color:{C['navy']};border:1px solid {C['line2']}",
        "ghost":   f"background:transparent;color:{C['navy']};border:1px solid transparent",
        "danger":  f"background:transparent;color:{C['err']};border:1px solid transparent",
        "dark":    f"background:{C['navy']};color:#fff;border:1px solid transparent",
    }[kind]
    ic = f'{icon}' if icon else ""
    wid = "width:100%;" if full else ""
    return (f'<button style="{wid}display:inline-flex;align-items:center;justify-content:center;gap:8px;'
            f'padding:{pad};border-radius:10px;font-family:\'Inter\',sans-serif;font-size:{fs};'
            f'font-weight:600;cursor:pointer;{st}">{ic}{txt}</button>')

def chip(txt, tone="brand", ic=None):
    m = {
        "brand": (C["indigo50"], "#4F46D6"), "ok": (C["ok50"], C["ok600"]),
        "warn": (C["warn50"], C["warn600"]), "err": (C["err50"], C["err600"]),
        "blue": (C["blue50"], "#1D4ED8"), "neutral": (C["soft"], C["t2"]),
    }[tone]
    icd = ic if ic else ""
    return (f'<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 11px;'
            f'border-radius:999px;background:{m[0]};color:{m[1]};font-size:12px;font-weight:600;'
            f'letter-spacing:.02em">{icd}{txt}</span>')

def chip_solid(txt, bg):
    return (f'<span style="display:inline-flex;align-items:center;padding:5px 11px;border-radius:999px;'
            f'background:{bg};color:#fff;font-size:11px;font-weight:700;letter-spacing:.06em">{txt}</span>')

def nav(active="Inicio", rol=None):
    links = ["Inicio", "Eventos", "Categorías", "Mis Tickets", "Crear Evento"]
    ls = []
    for l in links:
        on = l == active
        ls.append(f'<a href="#" style="font-size:14.5px;font-weight:{"600" if on else "500"};'
                  f'color:{C["navy"] if on else C["t2"]};padding-bottom:3px;'
                  f'border-bottom:2px solid {C["indigo"] if on else "transparent"}">{l}</a>')
    if rol:
        right = (f'<div style="display:flex;align-items:center;gap:11px">'
                 f'<span style="font-size:14px;color:{C["t2"]};font-weight:500">{rol}</span>'
                 f'<span style="width:38px;height:38px;border-radius:999px;background:{C["grad"]}"></span></div>')
    else:
        right = (f'<div style="display:flex;align-items:center;gap:12px">'
                 f'<span style="display:flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;'
                 f'background:{C["bg"]};border:1px solid {C["line"]};color:{C["t2"]};font-size:13.5px">'
                 f'{I["search"](15)}Buscar</span>'
                 f'{btn("Iniciar sesión","ghost")}{btn("Registrarme","primary")}</div>')
    return (f'<div style="display:flex;align-items:center;justify-content:space-between;gap:32px;'
            f'padding:15px 64px;background:#fff;border-bottom:1px solid {C["line"]}">'
            f'{brand()}<div style="display:flex;gap:30px;align-items:center">{"".join(ls)}</div>{right}</div>')

def sidebar(active, sub, cta=True):
    items = [("Dashboard", I["grid"]()), ("Eventos", I["cal"]()), ("Ventas", I["money"]()),
             ("Reportes", I["chart"]()), ("Ajustes", I["gear"]())]
    out = []
    for name, ic in items:
        on = name == active
        bg = f"background:{C['grad']};color:#fff;font-weight:600;box-shadow:{SH['cta']};" if on else "color:rgba(255,255,255,.62);"
        out.append(f'<div style="display:flex;align-items:center;gap:11px;padding:11px 14px;'
                   f'border-radius:10px;font-size:14.5px;{bg}">{ic}{name}</div>')
    cta_html = (f'<div style="margin-bottom:22px">{btn("Nuevo evento","primary",I["plus"](15),full=True)}</div>'
                if cta else "")
    return (f'<div style="width:248px;flex-shrink:0;background:{C["navy"]};padding:26px 18px;'
            f'display:flex;flex-direction:column;gap:5px;align-self:stretch">'
            f'<div style="margin-bottom:4px">{brand(dark=True,size=20)}</div>'
            f'<div style="font-size:12px;color:{C["muted"]};margin-bottom:22px;padding-left:2px">{sub}</div>'
            f'{cta_html}{"".join(out)}</div>')

def field(label, ph, hint=None, err=None, val=False):
    bd = C["err"] if err else C["line2"]
    txt = C["navy"] if val else C["muted"]
    ex = ""
    if hint:
        ex = f'<div style="font-size:12px;color:{C["muted"]}">{hint}</div>'
    if err:
        ex = (f'<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:{C["err600"]}">'
              f'{I["warn"](13)}{err}</div>')
    return (f'<div style="display:flex;flex-direction:column;gap:7px;flex:1;min-width:0">'
            f'<div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;'
            f'color:{C["t2"]}">{label}</div>'
            f'<div style="padding:13px 15px;border:1px solid {bd};border-radius:10px;background:#fff;'
            f'font-size:15px;color:{txt}">{ph}</div>{ex}</div>')

def card(inner, pad=26, extra=""):
    return (f'<div style="background:#fff;border:1px solid {C["line"]};border-radius:18px;'
            f'box-shadow:{SH["md"]};padding:{pad}px;{extra}">{inner}</div>')

def kpi(label, val, delta, up=True, ic=None, tint=None):
    tint = tint or C["indigo"]
    arrow = I["up"]() if up else I["dn"]()
    col = C["ok600"] if up else C["err"]
    icon = (f'<div style="width:38px;height:38px;border-radius:10px;background:{tint}14;color:{tint};'
            f'display:flex;align-items:center;justify-content:center">{ic}</div>') if ic else ""
    return (f'<div style="flex:1;background:#fff;border:1px solid {C["line"]};border-radius:16px;'
            f'padding:20px;box-shadow:{SH["sm"]};display:flex;flex-direction:column;gap:9px">'
            f'{icon}<div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;'
            f'color:{C["muted"]}">{label}</div>'
            f'<div style="font-family:\'Space Grotesk\',sans-serif;font-size:31px;font-weight:700;'
            f'line-height:1">{val}</div>'
            f'<div style="display:flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:{col}">'
            f'{arrow}{delta}</div></div>')

def ev_card(img, cat, cat_bg, title, place, date, price, badge=None):
    bd = (f'<div style="position:absolute;top:13px;left:13px">{chip_solid(badge, C["indigo"])}</div>'
          if badge else "")
    return (f'<div style="flex:1;min-width:0;background:#fff;border:1px solid {C["line"]};border-radius:18px;'
            f'overflow:hidden;box-shadow:{SH["md"]};display:flex;flex-direction:column">'
            f'<div style="position:relative;height:172px">'
            f'<img src="{img}" style="width:100%;height:100%;object-fit:cover;display:block">{bd}'
            f'<div style="position:absolute;top:13px;right:13px">{chip_solid(cat, cat_bg)}</div></div>'
            f'<div style="padding:19px;display:flex;flex-direction:column;gap:11px;flex:1">'
            f'<h3 style="font-size:17.5px">{title}</h3>'
            f'<div style="display:flex;flex-direction:column;gap:6px;color:{C["t2"]};font-size:13.5px">'
            f'<div style="display:flex;align-items:center;gap:7px">{I["pin"](14)}{place}</div>'
            f'<div style="display:flex;align-items:center;gap:7px">{I["cal"](14)}{date}</div></div>'
            f'<div style="margin-top:auto;padding-top:14px;border-top:1px solid {C["line"]};'
            f'display:flex;align-items:flex-end;justify-content:space-between;gap:10px">'
            f'<div><div style="font-family:\'Space Grotesk\',sans-serif;font-size:22px;font-weight:700">{price}</div>'
            f'<div style="font-size:11px;color:{C["ok600"]};font-weight:600;letter-spacing:.02em">'
            f'Precio final</div></div>{btn("Ver evento","solid")}</div></div></div>')

def trow(cells, last=False):
    tds = "".join(f'<div style="flex:{c[1]};font-size:14px;{c[2] if len(c)>2 else ""}">{c[0]}</div>'
                  for c in cells)
    bt = "" if last else f"border-bottom:1px solid {C['line']};"
    return f'<div style="display:flex;gap:16px;align-items:center;padding:15px 22px;{bt}">{tds}</div>'

def thead(cols):
    ths = "".join(f'<div style="flex:{c[1]};font-size:11px;font-weight:700;letter-spacing:.1em;'
                  f'text-transform:uppercase;color:{C["muted"]}">{c[0]}</div>' for c in cols)
    return (f'<div style="display:flex;gap:16px;padding:13px 22px;background:{C["soft"]};'
            f'border-bottom:1px solid {C["line"]}">{ths}</div>')

def bar(pct, col=None):
    col = col or C["indigo"]
    return (f'<div style="height:7px;background:{C["line"]};border-radius:999px;overflow:hidden">'
            f'<div style="height:100%;width:{pct}%;background:{col};border-radius:999px"></div></div>')

def sec_head(eyebrow, title, sub=None, right=None):
    sb = f'<div style="font-size:16px;color:{C["t2"]};max-width:560px">{sub}</div>' if sub else ""
    r = f'<div>{right}</div>' if right else ""
    return (f'<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;'
            f'margin-bottom:26px"><div style="display:flex;flex-direction:column;gap:9px">'
            f'<div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;'
            f'color:{C["indigo"]}">{eyebrow}</div>'
            f'<h2 style="font-size:32px">{title}</h2>{sb}</div>{r}</div>')

SCREENS = {}
