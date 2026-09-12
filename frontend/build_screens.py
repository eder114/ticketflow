# -*- coding: utf-8 -*-
"""
TicketFlow "" — generador de las 14 pantallas HTML
Cada archivo queda autocontenido (CSS + imágenes en base64) para importar
a Figma con el plugin html.to.design.
"""
import os, json, io

BASE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(BASE, "assets")
OUT = os.path.join(BASE, "screens")
os.makedirs(OUT, exist_ok=True)

CSS = open(os.path.join(ASSETS, "design-system.css"), encoding="utf-8").read()
IMG = json.load(open(os.path.join(ASSETS, "images.json"), encoding="utf-8"))

def img(key):
    return IMG.get(key, "")

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&'
         'family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">')

def page(title, body):
    return f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>{title}</title>{FONTS}
<style>{CSS}</style></head><body><div class="screen">{body}</div></body></html>"""

# ---------------------------------------------------------------- componentes
def nav(role="publico", active="Conciertos"):
    if role == "publico":
        links = ["Conciertos", "Teatro", "Deportes", "Familia"]
        actions = ('<a class="nav-link">Soy Agente</a>'
                   '<button class="btn btn-primary">INGRESAR</button>')
    else:
        links = ["Eventos", "Mis reservas", "Ayuda"]
        actions = (f'<span class="body-sm" style="color:var(--text-secondary)">{role}</span>'
                   '<div class="avatar"></div>')
    ls = "".join(
        f'<a class="nav-link{" active" if l==active else ""}">{l}</a>' for l in links)
    return f"""<div class="nav">
  <div class="nav-brand"><span class="nav-logo">◈</span>TicketFlow</div>
  <div class="nav-links">{ls}</div>
  <div class="nav-actions">{actions}</div>
</div>"""

def sidebar(active, sub="Panel de Control"):
    items = [("◱","Dashboard"),("▤","Eventos"),("◈","Ventas"),("◨","Reportes"),("⚙","Ajustes")]
    rows = "".join(
        f'<a class="side-item{" active" if n==active else ""}"><span>{i}</span>{n}</a>'
        for i, n in items)
    return f"""<div class="sidebar">
  <div class="sidebar-brand"><span class="nav-logo">◈</span>TicketFlow</div>
  <div class="sidebar-sub">{sub}</div>
  <button class="btn btn-primary btn-block" style="margin-bottom:20px">+ NUEVO EVENTO</button>
  {rows}
  <div style="flex:1"></div>
  <a class="side-item">◐ Ayuda</a>
  <a class="side-item">⏻ Cerrar sesión</a>
</div>"""

def field(label, placeholder, hint=None, error=None):
    cls = "input input-error" if error else "input"
    extra = ""
    if error: extra = f'<div class="field-error">⚠ {error}</div>'
    elif hint: extra = f'<div class="field-hint">{hint}</div>'
    return (f'<div class="field"><label class="field-label">{label}</label>'
            f'<input class="{cls}" placeholder="{placeholder}">{extra}</div>')

def event_card(key, cat, cat_cls, title, place, date, price, badge=None):
    b = (f'<div style="position:absolute;top:14px;left:14px" class="chip chip-solid">{badge}</div>'
         if badge else "")
    return f"""<div class="event-card" style="flex:1">
  <div style="position:relative">
    <img class="event-card-img" src="{img(key)}">{b}
  </div>
  <div class="event-card-body">
    <span class="chip {cat_cls}" style="align-self:flex-start">{cat}</span>
    <div class="event-card-title">{title}</div>
    <div class="event-meta">◉ {place}</div>
    <div class="event-meta">▦ {date}</div>
    <div class="divider" style="margin:4px 0"></div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
      <div class="event-price">{price}</div>
      <div class="price-label">✓ PRECIO FINAL</div>
    </div>
  </div>
</div>"""

def kpi(icon, label, value, delta, color="var(--indigo)", up=True):
    return f"""<div class="kpi">
  <div class="kpi-icon" style="background:{color}1F;color:{color}">{icon}</div>
  <div class="kpi-label">{label}</div>
  <div class="kpi-value">{value}</div>
  <div class="kpi-delta {'up' if up else 'down'}">{'↑' if up else '↓'} {delta}</div>
</div>"""

def footer():
    return """<div class="footer">
  <div style="flex:2">
    <div class="nav-brand" style="margin-bottom:12px">
      <span class="nav-logo">◈</span>TicketFlow</div>
    <div class="body-sm" style="color:rgba(255,255,255,.6);max-width:280px">
      Cultura y eventos en Colombia con transparencia total.
      Precio final garantizado desde la primera pantalla.</div>
    <div class="caption" style="margin-top:16px;color:rgba(255,255,255,.4)">
      © 2026 TicketFlow Colombia</div>
  </div>
  <div style="flex:1"><h4>Ciudades</h4>
    <a>Bogotá</a><a>Medellín</a><a>Cali</a><a>Barranquilla</a></div>
  <div style="flex:1"><h4>Explora</h4>
    <a>Conciertos</a><a>Teatro</a><a>Deportes</a><a>Familia</a></div>
  <div style="flex:1"><h4>Legal y ayuda</h4>
    <span class="footer-pqrs">Atención al Cliente (PQRS)</span>
    <a style="margin-top:12px">Términos y Condiciones</a>
    <a>Política de Privacidad</a></div>
</div>"""

SCREENS = {}

# ============================================================ 01 · LANDING
SCREENS["01_landing"] = page("01 · Landing", f"""
{nav()}
<div class="hero-dark" style="padding:72px 80px">
  <div class="hero-blob hero-blob-1"></div>
  <div class="hero-blob hero-blob-2"></div>
  <div class="hero-blob hero-blob-3"></div>
  <div class="hero-content" style="display:flex;gap:64px;align-items:center">
    <div style="flex:1;display:flex;flex-direction:column;gap:24px">
      <span class="chip" style="align-self:flex-start;background:rgba(255,255,255,.14);color:white">
        ✦ EVENTOS EN COLOMBIA · SIN SORPRESAS</span>
      <div class="display-xl" style="font-size:66px">
        Vive la<br><span style="background:var(--grad-neon);-webkit-background-clip:text;
        background-clip:text;-webkit-text-fill-color:transparent">cultura</span> en vivo</div>
      <div class="body-lg" style="color:rgba(255,255,255,.75);max-width:460px">
        Conciertos, teatro, deportes y festivales. Precio final desde la primera
        pantalla, sin cargos ocultos al pagar.</div>
      <div class="card card-pad" style="background:rgba(255,255,255,.07);
        border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(8px);box-shadow:none">
        <div style="display:flex;gap:14px;margin-bottom:14px">
          {field("Evento","¿Qué quieres ver?")}
          {field("Ciudad","Bogotá")}
          {field("Fecha","dd/mm/aaaa")}
        </div>
        <button class="btn btn-primary btn-lg btn-block">◎ BUSCAR EVENTOS</button>
      </div>
    </div>
    <div style="flex:1;position:relative">
      <img src="{img('01_hero_festival_cordillera')}" class="rounded img-cover"
        style="width:100%;height:440px;box-shadow:var(--shadow-xl)">
      <div class="card card-pad" style="position:absolute;bottom:24px;left:24px;
        padding:16px 20px;box-shadow:var(--glow-brand)">
        <div class="overline" style="color:var(--blue)">PRÓXIMO DESTACADO</div>
        <div style="font-family:'Space Grotesk';font-size:20px;font-weight:700;margin-top:4px">
          Festival Cordillera</div>
      </div>
    </div>
  </div>
</div>

<div class="container" style="padding-top:28px;padding-bottom:28px;
  display:flex;gap:12px;border-bottom:1px solid var(--border-subtle)">
  <span class="chip chip-solid">Todos</span>
  <span class="chip chip-outline">Conciertos</span>
  <span class="chip chip-outline">Teatro</span>
  <span class="chip chip-outline">Deportes</span>
  <span class="chip chip-outline">Familia</span>
  <span class="chip chip-outline">Festivales</span>
</div>

<div class="container" style="padding-top:56px;padding-bottom:64px">
  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:32px">
    <h1>Eventos destacados</h1>
    <a class="body-md" style="color:var(--indigo-600);font-weight:600">Ver todos →</a>
  </div>
  <div style="display:flex;gap:24px">
    {event_card('02_karol_g','FESTIVAL','chip-teatro','Medellín Music Fest','Medellín, Antioquia','10 Oct 2026 · 9:00 PM','$120.000','🔥 ALTA DEMANDA')}
    {event_card('03_el_principito_teatro','CULTURA','chip-familia','Festival de Jazz de Bogotá','Bogotá, Colombia','17 Oct 2026 · 7:30 PM','$120.000')}
    {event_card('04_millonarios_futbol','DEPORTE','chip-deporte','Clásico Vallecaucano','Estadio Pascual Guerrero · Cali','02 Oct 2026 · 4:00 PM','$85.000')}
    {event_card('05_estereo_picnic','MÚSICA','chip-concierto','Festival de Música Cali Vive','Cali, Valle del Cauca','24 Sep 2026','$85.000')}
  </div>
</div>

<div class="container" style="padding-bottom:64px">
  <div class="card" style="background:var(--grad-brand);border:none;padding:48px 56px;
    display:flex;justify-content:space-between;align-items:center;box-shadow:var(--glow-violet)">
    <div>
      <div class="display-lg" style="color:white;margin-bottom:10px">¿Organizas eventos?</div>
      <div class="body-lg" style="color:rgba(255,255,255,.85)">
        Publica en menos de 5 minutos y llega a miles de personas.</div>
    </div>
    <button class="btn btn-lg" style="background:white;color:var(--violet-700)">
      SER AGENTE TICKETFLOW →</button>
  </div>
</div>
{footer()}
""")

# ============================================================ 02 · LOGIN
SCREENS["02_login"] = page("02 · Login", f"""
<div style="display:flex;min-height:900px">
  <div style="flex:1;position:relative">
    <img src="{img('11_login_editorial')}" class="img-cover" style="width:100%;height:900px">
    <div class="overlay-dark"></div>
    <div style="position:absolute;top:40px;left:40px;z-index:2">
      <div class="nav-brand" style="color:white;-webkit-text-fill-color:white">
        <span class="nav-logo">◈</span>TicketFlow</div>
    </div>
    <div style="position:absolute;bottom:56px;left:48px;right:48px;z-index:2;color:white">
      <div class="display-lg" style="color:white;margin-bottom:12px">
        Donde la cultura<br>se vive y se siente.</div>
      <div class="body-lg" style="color:rgba(255,255,255,.8)">
        Más de 42.000 personas ya reservan sin sorpresas.</div>
    </div>
  </div>
  <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:80px;
    background:var(--bg-canvas)">
    <div style="width:100%;max-width:420px;display:flex;flex-direction:column;gap:22px">
      <span class="chip chip-brand" style="align-self:flex-start">BIENVENIDO DE VUELTA</span>
      <div class="display-lg">Ingresa a<br>tu cuenta</div>
      <div class="body-md" style="color:var(--text-secondary)">
        Consulta tus reservas y descarga tus entradas.</div>
      {field("Correo electrónico","tu@correo.com")}
      {field("Contraseña","••••••••",error="La contraseña no coincide con este correo. Intenta de nuevo o restablécela.")}
      <div style="display:flex;justify-content:space-between;align-items:center">
        <label class="body-sm" style="display:flex;gap:8px;align-items:center;color:var(--text-secondary)">
          <input type="checkbox" style="width:16px;height:16px"> Mantener sesión</label>
        <a class="body-sm" style="color:var(--indigo-600);font-weight:600">¿Olvidaste tu contraseña?</a>
      </div>
      <button class="btn btn-primary btn-lg btn-block">INGRESAR</button>
      <div style="display:flex;align-items:center;gap:14px">
        <div class="divider" style="flex:1"></div>
        <span class="caption">o</span><div class="divider" style="flex:1"></div>
      </div>
      <button class="btn btn-outline btn-lg btn-block">CONTINUAR COMO INVITADO</button>
      <div class="body-sm" style="text-align:center;color:var(--text-secondary)">
        ¿Nuevo en TicketFlow?
        <a style="color:var(--indigo-600);font-weight:600">Crea tu cuenta</a></div>
    </div>
  </div>
</div>
""")

# ============================================================ 03 · REG CLIENTE
SCREENS["03_registro_cliente"] = page("03 · Registro Cliente", f"""
{nav()}
<div style="display:flex;padding:56px 80px;gap:56px;align-items:flex-start;min-height:800px">
  <div style="flex:1;position:relative;border-radius:var(--r-xl);overflow:hidden;
    box-shadow:var(--shadow-xl)">
    <img src="{img('12_registro_cliente')}" class="img-cover" style="width:100%;height:620px">
    <div class="overlay-dark"></div>
    <div style="position:absolute;bottom:36px;left:36px;right:36px;color:white;z-index:2">
      <div class="display-lg" style="color:white;font-size:38px;margin-bottom:10px">
        Reserva en<br>menos de 1 minuto</div>
      <div class="body-md" style="color:rgba(255,255,255,.8)">
        Sin filas, sin llamadas, sin cargos ocultos.</div>
    </div>
  </div>
  <div class="card card-pad card-glow" style="flex:1;padding:44px;display:flex;
    flex-direction:column;gap:20px">
    <span class="chip chip-solid" style="align-self:flex-start">CLIENTE</span>
    <div class="display-lg" style="font-size:38px">Crea tu cuenta</div>
    <div class="body-md" style="color:var(--text-secondary)">
      Recibe tus entradas por correo y accede a tu historial cuando quieras.</div>
    <div style="display:flex;gap:14px">{field("Nombres","Eder Andrés")}{field("Apellidos","Rodríguez")}</div>
    <div style="display:flex;gap:14px">{field("Documento","CC · 1000000000")}{field("Celular","+57 300 000 0000")}</div>
    {field("Correo electrónico","tu@correo.com")}
    <div style="display:flex;gap:14px">
      {field("Contraseña","••••••••",hint="Mín. 8 caracteres · 1 mayúscula · 1 número")}
      {field("Confirmar","••••••••")}
    </div>
    <div style="display:flex;gap:14px">
      {field("País","Colombia")}{field("Departamento","Cundinamarca")}{field("Ciudad","Bogotá")}
    </div>
    <label class="body-sm" style="display:flex;gap:10px;align-items:flex-start;
      color:var(--text-secondary)">
      <input type="checkbox" style="width:18px;height:18px;margin-top:2px">
      Acepto los términos, la política de datos y conozco la ruta PQRS.</label>
    <button class="btn btn-primary btn-lg btn-block">CREAR MI CUENTA</button>
  </div>
</div>
{footer()}
""")

# ============================================================ 04 · REG AGENTE
def step(n, label, state):
    if state == "done":
        dot = ('<div style="width:36px;height:36px;border-radius:50%;background:var(--grad-brand);'
               'color:white;display:flex;align-items:center;justify-content:center;'
               'font-weight:700;box-shadow:var(--glow-violet)">✓</div>')
        col = "var(--text-primary)"
    elif state == "active":
        dot = ('<div style="width:36px;height:36px;border-radius:50%;background:var(--grad-brand);'
               'color:white;display:flex;align-items:center;justify-content:center;'
               f'font-weight:700;box-shadow:var(--glow-violet)">{n}</div>')
        col = "var(--indigo-600)"
    else:
        dot = ('<div style="width:36px;height:36px;border-radius:50%;background:var(--gray-200);'
               'color:var(--text-muted);display:flex;align-items:center;justify-content:center;'
               f'font-weight:700">{n}</div>')
        col = "var(--text-muted)"
    return (f'<div style="display:flex;align-items:center;gap:10px">{dot}'
            f'<span class="body-sm" style="font-weight:600;color:{col}">{label}</span></div>')

SCREENS["04_registro_agente"] = page("04 · Registro Agente", f"""
{nav()}
<div style="padding:56px 80px;display:flex;justify-content:center;min-height:800px">
  <div class="card card-pad card-glow" style="width:760px;padding:48px;
    display:flex;flex-direction:column;gap:22px">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px">
      {step(1,"Datos personales","done")}
      <div style="flex:1;height:2px;background:var(--grad-brand)"></div>
      {step(2,"Perfil profesional","active")}
      <div style="flex:1;height:2px;background:var(--gray-200)"></div>
      {step(3,"Verificación","pending")}
    </div>
    <span class="chip chip-cyan" style="align-self:flex-start">AGENTE · PASO 2 DE 3</span>
    <div class="display-lg" style="font-size:38px">Cuéntanos sobre<br>tu experiencia</div>
    <div class="body-md" style="color:var(--text-secondary)">
      Estos datos ayudan al administrador a asignarte eventos acordes a tu perfil.</div>
    <div style="display:flex;gap:14px">
      {field("Años de experiencia","5")}{field("Comisión esperada (%)","8")}
    </div>
    {field("Categorías de eventos","Conciertos, Festivales, Teatro")}
    {field("Empresa o promotora (opcional)","Ocesa Colombia")}
    {field("Portafolio o LinkedIn (opcional)","linkedin.com/in/…")}
    <div class="card" style="background:var(--violet-50);border-color:var(--violet-200);
      padding:18px 20px;box-shadow:none;display:flex;gap:14px;align-items:flex-start">
      <span style="font-size:22px">◈</span>
      <div><div class="body-sm" style="font-weight:600;margin-bottom:2px">
        Verificación en el paso 3</div>
        <div class="caption">Te pediremos RUT o cámara de comercio para validar tu identidad.</div></div>
    </div>
    <div style="display:flex;justify-content:space-between;gap:14px">
      <button class="btn btn-outline btn-lg">← ATRÁS</button>
      <button class="btn btn-primary btn-lg">CONTINUAR →</button>
    </div>
  </div>
</div>
{footer()}
""")

# ============================================================ 05 · CATÁLOGO
def filter_group(title, opts):
    rows = "".join(
        f'<label class="body-sm" style="display:flex;gap:10px;align-items:center;'
        f'color:var(--text-secondary)"><input type="checkbox" {"checked" if c else ""} '
        f'style="width:16px;height:16px">{l}</label>' for l, c in opts)
    return (f'<div style="display:flex;flex-direction:column;gap:10px">'
            f'<div class="field-label">{title}</div>{rows}</div>')

_cat_cards = "".join([
    event_card('02_karol_g','FESTIVAL','chip-teatro','Medellín Music Fest','Medellín, Antioquia','10 Oct · 9:00 PM','$120.000'),
    event_card('03_el_principito_teatro','CULTURA','chip-familia','Festival de Jazz de Bogotá','Bogotá, Colombia','17 Oct · 7:30 PM','$120.000'),
    event_card('04_millonarios_futbol','DEPORTE','chip-deporte','Clásico Vallecaucano','Estadio Pascual Guerrero','02 Oct · 4:00 PM','$85.000'),
])
_cat_cards2 = "".join([
    event_card('05_estereo_picnic','MÚSICA','chip-concierto','Festival de Música Cali Vive','Cali, Valle del Cauca','24 Sep · 7:00 PM','$85.000'),
    event_card('06_hamilton_hero','CULTURA','chip-familia','Carnaval Cultural de Barranquilla','Barranquilla, Atlántico','07 Nov · 8:00 PM','$120.000'),
    event_card('13_panel_hero','CONCIERTO','chip-concierto','Noche de Salsa Caleña','Medellín, Antioquia','14 Nov · 9:00 PM','$150.000'),
])

SCREENS["05_catalogo"] = page("05 · Catálogo", f"""
{nav(active="Conciertos")}
<div class="container" style="padding-top:48px;padding-bottom:24px">
  <span class="chip chip-brand">CATÁLOGO · BOGOTÁ</span>
  <div class="display-lg" style="margin:14px 0 8px">Descubre tu próximo plan</div>
  <div class="body-md" style="color:var(--text-secondary)">
    142 eventos disponibles · todos con precio final visible</div>
</div>
<div class="container" style="display:flex;gap:32px;padding-bottom:64px">
  <div class="card card-pad" style="width:260px;height:fit-content;display:flex;
    flex-direction:column;gap:24px">
    <h3>Filtros</h3>
    {filter_group("Categoría",[("Conciertos (42)",True),("Teatro (28)",False),("Deportes (18)",False),("Familia (12)",False)])}
    {filter_group("Ciudad",[("Bogotá",True),("Medellín",False),("Cali",False),("Barranquilla",False)])}
    {filter_group("Fecha",[("Este fin de semana",False),("Este mes",True),("Próximos 3 meses",False)])}
    <div style="display:flex;flex-direction:column;gap:10px">
      <div class="field-label">Precio final</div>
      <div class="bar-track"><div class="bar-fill" style="width:65%;background:var(--grad-brand)"></div></div>
      <div class="caption">$40.000 — $85.000</div>
    </div>
    <button class="btn btn-primary btn-block">APLICAR FILTROS</button>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;gap:24px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div class="body-sm" style="color:var(--text-secondary)">Mostrando 6 de 142</div>
      <div class="chip chip-outline">Ordenar: Recomendados ▾</div>
    </div>
    <div style="display:flex;gap:24px">{_cat_cards}</div>
    <div style="display:flex;gap:24px">{_cat_cards2}</div>
    <button class="btn btn-outline btn-lg" style="align-self:center;margin-top:12px">
      CARGAR MÁS EVENTOS</button>
  </div>
</div>
{footer()}
""")

# ============================================================ 06 · DETALLE
def cast(key, name, role):
    return f"""<div class="card" style="flex:1;padding:18px;display:flex;
      flex-direction:column;align-items:center;gap:10px;box-shadow:var(--shadow-sm)">
      <img src="{img(key)}" class="img-cover" style="width:76px;height:76px;border-radius:50%">
      <div class="body-sm" style="font-weight:700">{name}</div>
      <div class="caption">{role}</div></div>"""

SCREENS["06_detalle_evento"] = page("06 · Detalle Evento", f"""
{nav(active="Teatro")}
<div style="position:relative;height:440px">
  <img src="{img('06_hamilton_hero')}" class="img-cover" style="width:100%;height:440px">
  <div class="overlay-dark"></div>
  <div style="position:absolute;bottom:40px;left:80px;right:80px;z-index:2;color:white">
    <div style="display:flex;gap:10px;margin-bottom:14px">
      <span class="chip chip-familia">CULTURA</span>
      <span class="chip chip-solid">CARNAVAL</span>
    </div>
    <div class="display-xl" style="color:white;margin-bottom:12px">Carnaval Cultural de Barranquilla</div>
    <div class="body-lg" style="color:rgba(255,255,255,.85)">
      ▦ Del 5 al 9 de Noviembre, 2026 &nbsp;·&nbsp; ◉ Parque Cultural del Caribe, Barranquilla</div>
  </div>
</div>
<div class="container" style="display:flex;gap:40px;padding-top:40px;padding-bottom:72px">
  <div style="flex:1;display:flex;flex-direction:column;gap:32px">
    <div class="card card-pad" style="background:var(--grad-brand);border:none;
      color:white;box-shadow:var(--glow-brand)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-family:'Space Grotesk';font-size:22px;font-weight:700">🔥 Alta demanda</div>
        <div class="body-sm" style="color:rgba(255,255,255,.9)">Actualizado hace 2 min</div>
      </div>
      <div class="body-md" style="margin-bottom:12px">348 entradas de 1.500 restantes · 76,8% ocupado</div>
      <div class="progress" style="background:rgba(255,255,255,.25)">
        <div class="progress-fill" style="width:77%;background:white"></div></div>
    </div>
    <div>
      <h2 style="margin-bottom:16px">Cinco días de tradición, música y color del Caribe</h2>
      <div class="body-lg" style="color:var(--text-secondary);margin-bottom:14px">
        Declarado Patrimonio Oral e Inmaterial de la Humanidad por la UNESCO, el Carnaval de
        Barranquilla reúne cumbia, mapalé, garabato y son de negro en cinco días de fiesta
        que transforman por completo la capital del Atlántico.</div>
      <div class="body-md" style="color:var(--text-secondary)">
        Esta edición reúne más de 40 comparsas y 15 orquestas en vivo, e incluye acceso a
        la Batalla de Flores y a la Gran Parada de Tradición y Folclor.</div>
    </div>
    <div style="display:flex;gap:16px">
      {kpi("⏱","Duración","5 días","5 al 9 Nov","var(--indigo)")}
      {kpi("◈","Edad","+12","recomendado","var(--blue)")}
      {kpi("◉","Idioma","ES","subtítulos EN","var(--blue)")}
      {kpi("★","Rating","4.9","2.400 reseñas","var(--warn)")}
    </div>
    <div>
      <h2 style="margin-bottom:16px">Artistas principales</h2>
      <div style="display:flex;gap:16px">
        {cast('07_cast_lin_manuel','Grupo Niche','Salsa · Cali')}
        {cast('08_cast_leslie','Herencia de Timbiquí','Pacífico · Cali')}
        {cast('09_cast_phillipa','La 33','Salsa · Bogotá')}
        {cast('10_cast_jonathan','Cimarrón','Llanera · Meta')}
      </div>
    </div>
  </div>
  <div class="card card-pad card-glow" style="width:380px;height:fit-content;
    padding:32px;display:flex;flex-direction:column;gap:18px">
    <h3>Selecciona tus entradas</h3>
    {field("Zona","Platea VIP · $120.000")}
    {field("Función","Sáb, 19 Oct · 20:00")}
    {field("Cantidad","2")}
    <div class="divider"></div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end">
      <div><div class="body-sm" style="color:var(--text-secondary)">Total</div>
        <div class="caption">Impuestos incluidos</div></div>
      <div class="event-price" style="font-size:34px">$100.000</div>
    </div>
    <span class="chip chip-confirmed" style="align-self:flex-start">✓ PRECIO FINAL GARANTIZADO</span>
    <button class="btn btn-primary btn-lg btn-block">RESERVAR AHORA →</button>
    <div class="caption" style="text-align:center">
      🔒 Transacción 100% segura · Cancelación gratis hasta 48h antes</div>
  </div>
</div>
{footer()}
""")

# ============================================================ 07 · CHECKOUT
def pay_method(icon, name, sub, selected=False):
    style = ("border:2px solid var(--indigo);background:var(--violet-50)"
             if selected else "border:1.5px solid var(--border-default);background:white")
    dot = ('<div style="width:20px;height:20px;border-radius:50%;background:var(--grad-brand)">'
           '</div>' if selected else
           '<div style="width:20px;height:20px;border-radius:50%;border:2px solid var(--border-default)"></div>')
    return f"""<div style="{style};border-radius:var(--r-md);padding:16px 18px;
      display:flex;gap:14px;align-items:center">
      {dot}
      <div style="flex:1"><div class="body-md" style="font-weight:600">{name}</div>
        <div class="caption">{sub}</div></div>
      <span style="font-size:22px">{icon}</span></div>"""

SCREENS["07_checkout"] = page("07 · Pago y Reserva", f"""
<div class="nav">
  <div class="nav-brand"><span class="nav-logo">◈</span>TicketFlow</div>
  <div class="chip" style="background:var(--amber-100);color:var(--amber-600)">
    ⏱ 09:45 para completar tu compra</div>
</div>
<div class="container" style="display:flex;gap:32px;padding-top:40px;padding-bottom:64px">
  <div style="flex:1;display:flex;flex-direction:column;gap:24px">
    <div class="card card-pad" style="display:flex;flex-direction:column;gap:18px">
      <h3>◉ Datos del asistente</h3>
      <div style="display:flex;gap:14px">{field("Nombres","Juan Pérez")}{field("Apellidos","González")}</div>
      {field("Correo electrónico","juan@ejemplo.com","Aquí enviaremos tus entradas")}
      {field("Cédula de ciudadanía","1234567890")}
    </div>
    <div class="card card-pad" style="display:flex;flex-direction:column;gap:14px">
      <h3>◈ Método de pago</h3>
      {pay_method("🏦","PSE (Pagos Seguros en Línea)","Débito directo desde tu cuenta bancaria",True)}
      {pay_method("💳","Tarjeta de crédito / débito","Visa, Mastercard, American Express")}
      {pay_method("💵","Pago en efectivo (Efecty)","Genera un pin y paga en puntos físicos")}
    </div>
  </div>
  <div class="card card-pad card-glow" style="width:400px;height:fit-content;padding:28px;
    display:flex;flex-direction:column;gap:18px">
    <h3>Resumen de compra</h3>
    <div style="display:flex;gap:14px">
      <img src="{img('05_estereo_picnic')}" class="img-cover rounded-md" style="width:76px;height:76px">
      <div style="flex:1"><div class="body-md" style="font-weight:600;line-height:1.3">
        Festival de Música Cali Vive</div>
        <div class="caption" style="margin:4px 0">Entrada General · 3 días</div>
        <span class="chip chip-cyan">🎫 1 TICKET</span></div>
    </div>
    <div class="divider"></div>
    <div style="display:flex;justify-content:space-between"><span class="body-sm"
      style="color:var(--text-secondary)">Valor entrada</span><span class="body-sm">$100.000</span></div>
    <div style="display:flex;justify-content:space-between"><span class="body-sm"
      style="color:var(--text-secondary)">Cargo por servicio</span><span class="body-sm">$15.000</span></div>
    <div style="display:flex;justify-content:space-between"><span class="body-sm"
      style="color:var(--text-secondary)">IVA (19%)</span><span class="body-sm">$13.000</span></div>
    <div class="divider"></div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end">
      <div><div class="body-md" style="font-weight:700">Total final</div>
        <div class="caption">Sin cargos adicionales</div></div>
      <div class="event-price" style="font-size:32px">$128.000</div>
    </div>
    <button class="btn btn-primary btn-lg btn-block">🔒 PAGAR AHORA</button>
    <div class="caption" style="text-align:center">
      Pagos procesados de forma segura · Precio final garantizado</div>
  </div>
</div>
""")

# ============================================================ 08 · CONFIRMACIÓN
SCREENS["08_confirmacion"] = page("08 · Confirmación", f"""
{nav("Cliente · Eder R.", active="Mis reservas")}
<div style="padding:72px 80px;display:flex;flex-direction:column;align-items:center;gap:22px">
  <div style="width:88px;height:88px;border-radius:50%;background:var(--grad-brand);
    display:flex;align-items:center;justify-content:center;font-size:42px;color:white;
    box-shadow:var(--glow-violet)">✓</div>
  <div class="display-xl gradient-text" style="text-align:center">¡Tu reserva está lista!</div>
  <div class="body-lg" style="color:var(--text-secondary);text-align:center;max-width:560px">
    Enviamos la confirmación y las entradas a tu correo electrónico.
    Prepárate para una experiencia inolvidable.</div>

  <div class="card card-glow" style="width:760px;padding:0;margin-top:16px;overflow:hidden">
    <div style="display:flex">
      <img src="{img('06_hamilton_hero')}" class="img-cover" style="width:220px;height:230px">
      <div style="flex:1;padding:28px;display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="chip chip-confirmed">✓ CONFIRMADA</span>
          <span class="caption">Código: <b style="color:var(--text-primary)">TF-2026-A9F42B</b></span>
        </div>
        <div style="font-family:'Space Grotesk';font-size:26px;font-weight:700;line-height:1.2">
          Carnaval Cultural de Barranquilla</div>
        <div class="body-sm" style="color:var(--text-secondary)">
          ◉ Parque Cultural del Caribe, Barranquilla</div>
        <div class="divider" style="margin:4px 0"></div>
        <div style="display:flex;gap:32px">
          <div><div class="field-label">Fecha y hora</div>
            <div class="body-md" style="font-weight:600;margin-top:4px">Sáb, 07 Nov 2026 · 8:00 PM</div></div>
          <div><div class="field-label">Ubicación</div>
            <div class="body-md" style="font-weight:600;margin-top:4px">Platea VIP · Fila G · 12-13</div></div>
          <div><div class="field-label">Total pagado</div>
            <div class="body-md" style="font-weight:600;margin-top:4px;color:var(--indigo-600)">$100.000</div></div>
        </div>
      </div>
    </div>
  </div>

  <div style="display:flex;gap:14px;margin-top:12px">
    <button class="btn btn-primary btn-lg">⬇ DESCARGAR ENTRADAS (PDF)</button>
    <button class="btn btn-outline btn-lg">▦ AGREGAR AL CALENDARIO</button>
    <button class="btn btn-ghost btn-lg">VER MIS RESERVAS</button>
  </div>
  <div class="card" style="padding:16px 22px;background:var(--cyan-100);border:none;
    display:flex;gap:12px;align-items:center;margin-top:8px">
    <span style="font-size:20px">◐</span>
    <span class="body-sm" style="color:var(--cyan-700)">
      ¿Algo no cuadra? Radica una PQRS · respuesta en máx. 15 días hábiles (Ley 1755).</span>
  </div>
</div>
{footer()}
""")

# ============================================================ 09 · PANEL CLIENTE
def reserva_row(key, cat, cat_cls, title, place, date, zona, total, status, status_cls, actions):
    return f"""<div class="card" style="padding:20px;display:flex;gap:20px;align-items:center">
      <img src="{img(key)}" class="img-cover rounded-md" style="width:130px;height:130px">
      <div style="flex:1;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;gap:10px;align-items:center">
          <span class="chip {status_cls}">{status}</span>
          <span class="chip {cat_cls}">{cat}</span>
        </div>
        <div style="font-family:'Space Grotesk';font-size:21px;font-weight:700">{title}</div>
        <div class="body-sm" style="color:var(--text-secondary)">◉ {place} &nbsp;·&nbsp; ▦ {date}</div>
        <div class="caption">Zona: {zona}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
        <div class="event-price" style="font-size:24px">{total}</div>
        <div class="price-label" style="margin-bottom:6px">PRECIO FINAL</div>
        {actions}
      </div></div>"""

SCREENS["09_panel_cliente"] = page("09 · Panel Cliente", f"""
{nav("Cliente · Eder R.", active="Mis reservas")}
<div class="hero-dark" style="padding:48px 80px">
  <div class="hero-blob hero-blob-1" style="width:300px;height:300px;top:-100px;left:20%"></div>
  <div class="hero-blob hero-blob-2" style="width:240px;height:240px;bottom:-80px;right:15%"></div>
  <div class="hero-content">
    <span class="chip" style="background:rgba(255,255,255,.14);color:white">👋 HOLA, EDER</span>
    <div class="display-lg" style="color:white;margin:14px 0 8px">Mis reservas</div>
    <div class="body-lg" style="color:rgba(255,255,255,.75)">
      Gestiona tus entradas, revisa el estado de tus compras o radica una PQRS.</div>
    <div style="display:flex;gap:16px;margin-top:28px">
      {kpi("🎫","Próximas","3","eventos este mes","var(--violet-400)")}
      {kpi("★","Pasadas","12","asistidos","var(--blue)")}
      {kpi("◈","Invertido","$1.85M","total histórico","var(--blue)")}
      {kpi("🎁","Puntos","+120","TicketFlow rewards","var(--warn)")}
    </div>
  </div>
</div>
<div class="container" style="padding-top:40px;padding-bottom:64px">
  <div style="display:flex;gap:12px;margin-bottom:28px">
    <span class="chip chip-solid">Próximas (3)</span>
    <span class="chip chip-outline">Pasadas (12)</span>
    <span class="chip chip-outline">Canceladas (1)</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:16px">
    {reserva_row('06_hamilton_hero','CULTURA','chip-familia','Carnaval Cultural de Barranquilla','Barranquilla, Atlántico','07 Nov 2026 · 8:00 PM','Platea VIP × 2','$100.000','✓ CONFIRMADA','chip-confirmed','<button class="btn btn-primary">⬇ DESCARGAR</button><button class="btn btn-danger-ghost">Cancelar reserva</button>')}
    {reserva_row('02_karol_g','FESTIVAL','chip-teatro','Medellín Music Fest','Medellín, Antioquia','10 Oct 2026 · 9:00 PM','Platea General × 4','$240.000','⏱ RESERVADA','chip-reserved','<button class="btn btn-sunset">💳 PAGAR AHORA</button><button class="btn btn-danger-ghost">Cancelar reserva</button>')}
    {reserva_row('05_estereo_picnic','MÚSICA','chip-concierto','Festival de Música Cali Vive','Cali, Valle del Cauca','24 Sep 2026 · 7:00 PM','Pase 3 días × 1','$85.000','⏱ RESERVADA','chip-reserved','<button class="btn btn-sunset">💳 PAGAR AHORA</button><button class="btn btn-danger-ghost">Cancelar reserva</button>')}
  </div>
  <div class="card" style="margin-top:24px;padding:22px 26px;background:var(--grad-cyan);
    border:none;display:flex;justify-content:space-between;align-items:center;
    box-shadow:var(--glow-brand)">
    <div style="color:white">
      <div class="body-md" style="font-weight:700;margin-bottom:4px">
        ¿Tuviste un problema con alguna reserva?</div>
      <div class="body-sm" style="color:rgba(255,255,255,.85)">
        Radica una PQRS · respuesta en máximo 15 días hábiles (Ley 1755).</div>
    </div>
    <button class="btn btn-lg" style="background:white;color:var(--cyan-700)">ABRIR PQRS</button>
  </div>
</div>
{footer()}
""")

# ============================================================ 10 · PANEL AGENTE
def trow(cells, status=None, status_cls=None, action=None):
    tds = "".join(f'<div class="td{" td-strong" if i==1 else ""}">{c}</div>'
                  for i, c in enumerate(cells))
    st = f'<div class="td"><span class="chip {status_cls}">{status}</span></div>' if status else ""
    ac = f'<div class="td"><button class="btn btn-ghost">{action}</button></div>' if action else ""
    return f'<div class="trow">{tds}{st}{ac}</div>'

SCREENS["10_panel_agente"] = page("10 · Panel Agente", f"""
<div style="display:flex">
  {sidebar("Ventas","Perfil de Agente")}
  <div style="flex:1;padding:44px 48px;display:flex;flex-direction:column;gap:28px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div class="display-lg">Ventas</div>
        <div class="body-md" style="color:var(--text-secondary);margin-top:6px">
          Reservas por evento · comisión 8% · pago el 5 de cada mes</div></div>
      <div style="display:flex;gap:12px">
        <button class="btn btn-outline">▦ Últimos 30 días</button>
        <button class="btn btn-primary">⬇ EXPORTAR CSV</button></div>
    </div>
    <div style="display:flex;gap:16px">
      {kpi("👥","Clientes","24.5K","12% vs mes anterior","var(--indigo)")}
      {kpi("🎫","Reservas","89.2K","18% vs mes anterior","var(--blue)")}
      {kpi("◈","Ingresos","$1.24M","22% vs mes anterior","var(--blue)")}
      {kpi("💰","Comisión","$99.2M","15% vs mes anterior","var(--warn)")}
    </div>
    <div class="table">
      <div class="thead">
        <div class="th">Código</div><div class="th">Cliente</div><div class="th">Evento</div>
        <div class="th">Fecha</div><div class="th">Total</div><div class="th">Estado</div>
        <div class="th">Acción</div>
      </div>
      {trow(["TF-A9F42B","Eder Rodríguez","Carnaval Cultural de Barranquilla","19 Oct","$100.000"],"✓ CONFIRMADA","chip-confirmed","Ver")}
      {trow(["TF-B3D71E","Camila Ochoa","Medellín Music Fest","15 Nov","$240.000"],"⏱ RESERVADA","chip-reserved","Confirmar")}
      {trow(["TF-C88104","Juan D. Vera","Clásico Vallecaucano","10 Nov","$170.000"],"✓ CONFIRMADA","chip-confirmed","Ver")}
      {trow(["TF-D22990","Laura Peña","Festival de Música Cali Vive","21 Mar","$85.000"],"✕ CANCELADA","chip-cancelled","Ver")}
      {trow(["TF-E5A183","Andrés Mora","Festival de Jazz de Bogotá","02 Dic","$240.000"],"✓ CONFIRMADA","chip-confirmed","Ver")}
      {trow(["TF-F71230","Sofía Ríos","Noche de Salsa Caleña","24 Oct","$100.000"],"⏱ RESERVADA","chip-reserved","Confirmar")}
    </div>
  </div>
</div>
""")

# ============================================================ 11 · CREAR EVENTO
SCREENS["11_crear_evento"] = page("11 · Crear Evento", f"""
<div style="display:flex">
  {sidebar("Eventos","Perfil de Agente")}
  <div style="flex:1;padding:44px 48px;display:flex;flex-direction:column;gap:24px">
    <div><span class="chip chip-brand">NUEVO EVENTO</span>
      <div class="display-lg" style="margin:14px 0 6px">Crear nuevo evento</div>
      <div class="body-md" style="color:var(--text-secondary)">
        Completa los detalles para publicar en el catálogo.</div></div>
    <div style="display:flex;gap:32px">
      <div style="flex:1;display:flex;flex-direction:column;gap:20px">
        <div class="card card-pad" style="display:flex;flex-direction:column;gap:16px">
          <h3 class="gradient-text">1 · Información básica</h3>
          <div style="display:flex;gap:14px">
            {field("Nombre del evento","Ej: Concierto de Jazz en Vivo")}
            {field("Categoría","Conciertos")}
          </div>
          {field("Descripción breve","Describe brevemente de qué trata el evento…")}
          <div>
            <div class="field-label" style="margin-bottom:8px">Imagen de portada</div>
            <div style="border:2px dashed var(--violet-300);border-radius:var(--r-md);
              padding:32px;text-align:center;background:var(--violet-50)">
              <div style="font-size:32px;margin-bottom:8px">🖼</div>
              <div class="body-md" style="font-weight:600;color:var(--violet-700)">
                Arrastra una imagen o haz clic para subir</div>
              <div class="caption" style="margin-top:4px">Recomendado 1200×800px · JPG o PNG</div>
            </div>
          </div>
        </div>
        <div class="card card-pad" style="display:flex;flex-direction:column;gap:16px">
          <h3 class="gradient-text">2 · Lugar y fechas</h3>
          <div style="display:flex;gap:14px">{field("Fecha","dd/mm/aaaa")}{field("Hora","--:--")}</div>
          {field("Recinto / Lugar","Ej: Medellín, Antioquia, Bogotá")}
          <div style="display:flex;gap:14px">
            {field("País","Colombia")}{field("Departamento","Cundinamarca")}{field("Ciudad","Bogotá")}
          </div>
        </div>
        <div class="card card-pad" style="display:flex;flex-direction:column;gap:16px">
          <h3 class="gradient-text">3 · Capacidad y precios</h3>
          <div style="display:flex;gap:14px">
            {field("Capacidad total","Ej: 5000")}
            {field("Precio final (COP)","Ej: 150000","Debe incluir IVA + cargo por servicio")}
          </div>
        </div>
        <div style="display:flex;gap:14px;justify-content:flex-end">
          <button class="btn btn-outline btn-lg">CANCELAR</button>
          <button class="btn btn-primary btn-lg">PUBLICAR EVENTO</button>
        </div>
      </div>
      <div style="width:340px;display:flex;flex-direction:column;gap:16px">
        <h3>Vista previa</h3>
        <div class="event-card">
          <img class="event-card-img" src="{img('13_panel_hero')}">
          <div class="event-card-body">
            <span class="chip chip-concierto" style="align-self:flex-start">CATEGORÍA</span>
            <div class="event-card-title">Nombre del evento</div>
            <div class="event-meta">◉ Lugar por definir</div>
            <div class="event-meta">▦ Fecha por definir</div>
            <div class="divider" style="margin:4px 0"></div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
              <div class="event-price">$0</div>
              <div class="price-label">✓ PRECIO FINAL</div></div>
          </div>
        </div>
        <div class="card card-pad" style="background:var(--violet-50);border-color:var(--violet-200)">
          <div class="body-sm" style="font-weight:700;margin-bottom:6px">Estado inicial</div>
          <span class="chip chip-brand">PROGRAMADO</span>
          <div class="caption" style="margin-top:10px">
            Podrás cambiar a En Boletería, En Vivo, Finalizado o Cancelado desde el panel.</div>
        </div>
      </div>
    </div>
  </div>
</div>
""")

# ============================================================ 12 · RESERVAS EVENTO
SCREENS["12_reservas_evento"] = page("12 · Reservas por Evento", f"""
<div style="display:flex">
  {sidebar("Eventos","Perfil de Agente")}
  <div style="flex:1;padding:44px 48px;display:flex;flex-direction:column;gap:26px">
    <div>
      <a class="body-sm" style="color:var(--indigo-600);font-weight:600">← Volver a mis eventos</a>
      <div style="display:flex;gap:20px;align-items:center;margin-top:14px">
        <img src="{img('02_karol_g')}" class="img-cover rounded-md" style="width:90px;height:90px">
        <div><div class="display-lg" style="font-size:38px">Medellín Music Fest</div>
          <div class="body-md" style="color:var(--text-secondary);margin-top:6px">
            ◉ Medellín, Antioquia &nbsp;·&nbsp; ▦ Vie 10 Oct 2026 · 9:00 PM</div></div>
        <div style="flex:1"></div>
        <span class="chip chip-solid">EN BOLETERÍA</span>
      </div>
    </div>
    <div style="display:flex;gap:16px">
      {kpi("◉","Cupo ocupado","14.652","97.7% de 15.000","var(--indigo)")}
      {kpi("⏱","Reservadas","412","pendientes de pago","var(--warn)")}
      {kpi("✓","Confirmadas","14.240","pagadas","var(--success)")}
      {kpi("✕","Canceladas","86","2.1% del total","var(--error)",False)}
    </div>
    <div style="display:flex;gap:12px;align-items:center">
      <span class="chip chip-solid">Todas</span>
      <span class="chip chip-outline">Reservadas</span>
      <span class="chip chip-outline">Confirmadas</span>
      <span class="chip chip-outline">Canceladas</span>
      <div style="flex:1"></div>
      <button class="btn btn-primary">⬇ EXPORTAR CSV</button>
    </div>
    <div class="table">
      <div class="thead">
        <div class="th">Código</div><div class="th">Cliente</div><div class="th">Fecha reserva</div>
        <div class="th">Zona</div><div class="th">Total</div><div class="th">Estado</div>
        <div class="th">Acción</div>
      </div>
      {trow(["TF-A9F42B","Eder Rodríguez","21 Sep 14:22","Platea Gen. × 2","$560.000"],"✓ CONFIRMADA","chip-confirmed","Ver")}
      {trow(["TF-B3D71E","Camila Ochoa","21 Sep 15:08","VIP × 4","$240.000"],"⏱ RESERVADA","chip-reserved","Confirmar")}
      {trow(["TF-C88104","Juan D. Vera","20 Sep 09:41","Tribuna Alta × 2","$360.000"],"✓ CONFIRMADA","chip-confirmed","Ver")}
      {trow(["TF-D22990","Laura Peña","19 Sep 22:15","Platea Gen. × 1","$280.000"],"✕ CANCELADA","chip-cancelled","Ver")}
      {trow(["TF-E5A183","Andrés Mora","19 Sep 20:04","VIP × 2","$100.000"],"✓ CONFIRMADA","chip-confirmed","Ver")}
      {trow(["TF-F71230","Sofía Ríos","18 Sep 12:33","Tribuna Alta × 6","$1.080.000"],"⏱ RESERVADA","chip-reserved","Confirmar")}
    </div>
  </div>
</div>
""")

# ============================================================ 13 · DASHBOARD ADMIN
def chart_bars(data, maxv):
    cols = "".join(
        f'<div class="chart-col"><div class="chart-bar" style="height:{int(v/maxv*190)}px"></div>'
        f'<div class="chart-label">{m}</div></div>' for m, v in data)
    return f'<div class="chart">{cols}</div>'

def bar_row(name, pct, color):
    return f"""<div style="display:flex;flex-direction:column;gap:6px">
      <div style="display:flex;justify-content:space-between">
        <span class="body-sm">{name}</span>
        <span class="body-sm" style="font-weight:700">{pct}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:{pct}%;background:{color}"></div></div>
    </div>"""

SCREENS["13_dashboard_admin"] = page("13 · Dashboard Admin", f"""
<div style="display:flex">
  {sidebar("Dashboard","Administrador")}
  <div style="flex:1;padding:44px 48px;display:flex;flex-direction:column;gap:26px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div class="display-lg">Visión general</div>
        <div class="body-md" style="color:var(--text-secondary);margin-top:6px">
          Métricas de rendimiento y actividad reciente del sistema.</div></div>
      <div style="display:flex;gap:12px">
        <button class="btn btn-outline">▦ Este mes</button>
        <button class="btn btn-primary">⬇ EXPORTAR</button></div>
    </div>
    <div style="display:flex;gap:16px">
      {kpi("👥","Clientes","24.5K","12%","var(--indigo)")}
      {kpi("🎭","Agentes","342","5%","var(--blue)")}
      {kpi("🛡","Admins","12","sin cambios","var(--gray-400)")}
      {kpi("🎫","Eventos","1.204","18%","var(--blue)")}
      {kpi("◈","Reservas","89.2K","3%","var(--error)",False)}
    </div>
    <div style="display:flex;gap:16px">
      <div class="card card-pad" style="flex:2;display:flex;flex-direction:column;gap:18px">
        <div style="display:flex;justify-content:space-between;align-items:baseline">
          <div><h3>Recaudo mensual</h3>
            <div class="caption" style="margin-top:2px">2026 · millones COP</div></div>
          <span class="chip chip-confirmed">↑ $8.420M TOTAL</span>
        </div>
        {chart_bars([("Ene",120),("Feb",180),("Mar",260),("Abr",320),("May",380),("Jun",420),("Jul",380),("Ago",450)],450)}
      </div>
      <div class="card card-pad" style="width:400px;display:flex;flex-direction:column;gap:16px">
        <h3>Distribución por categoría</h3>
        <div style="display:flex;height:36px;border-radius:var(--r-full);overflow:hidden">
          <div style="width:45%;background:var(--cat-concierto)"></div>
          <div style="width:30%;background:var(--cat-teatro)"></div>
          <div style="width:15%;background:var(--cat-deporte)"></div>
          <div style="width:10%;background:var(--cat-familia)"></div>
        </div>
        {bar_row("Conciertos",45,"var(--cat-concierto)")}
        {bar_row("Teatro",30,"var(--cat-teatro)")}
        {bar_row("Deportes",15,"var(--cat-deporte)")}
        {bar_row("Familia",10,"var(--cat-familia)")}
      </div>
    </div>
    <div style="display:flex;gap:16px">
      <div class="card card-pad" style="flex:1;display:flex;flex-direction:column;gap:14px">
        <h3>🏆 Top 5 agentes</h3>
        {"".join(f'''<div style="display:flex;align-items:center;gap:14px;padding:10px 0;
          border-bottom:1px solid var(--border-subtle)">
          <div style="width:30px;height:30px;border-radius:50%;background:var(--grad-brand);
            color:white;display:flex;align-items:center;justify-content:center;
            font-size:13px;font-weight:700">{i+1}</div>
          <div style="flex:1"><div class="body-sm" style="font-weight:600">{n}</div>
            <div class="caption">{c}</div></div>
          <div class="body-sm" style="font-weight:700">{t}</div></div>'''
          for i,(n,c,t) in enumerate([("María Rodríguez","Bogotá","4.250"),("Carlos Gómez","Medellín","3.890"),("Ana Silva","Cali","2.950"),("Juan Pérez","Barranquilla","2.100"),("Laura Martínez","Bogotá","1.850")]))}
      </div>
      <div class="card card-pad" style="flex:1;display:flex;flex-direction:column;gap:16px">
        <h3>🌎 Cobertura geográfica</h3>
        {bar_row("Bogotá D.C.",45,"var(--indigo-600)")}
        {bar_row("Medellín",25,"var(--blue)")}
        {bar_row("Cali",15,"var(--blue)")}
        {bar_row("Barranquilla",10,"var(--warn)")}
        {bar_row("Otras",5,"var(--gray-400)")}
      </div>
    </div>
  </div>
</div>
""")

# ============================================================ 14 · REPORTES ADMIN
SCREENS["14_reportes_admin"] = page("14 · Reportes Admin", f"""
<div style="display:flex">
  {sidebar("Reportes","Administrador")}
  <div style="flex:1;padding:44px 48px;display:flex;flex-direction:column;gap:26px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div class="display-lg">Reportes analíticos</div>
        <div class="body-md" style="color:var(--text-secondary);margin-top:6px;max-width:600px">
          Métricas detalladas de rendimiento, ventas y operación para optimizar
          la toma de decisiones estratégicas.</div></div>
      <button class="btn btn-outline">▦ Últimos 30 días</button>
    </div>
    <div style="display:flex;gap:12px;border-bottom:1px solid var(--border-subtle);padding-bottom:14px">
      <span class="chip chip-solid">Comerciales</span>
      <span class="chip chip-outline">Cobertura</span>
      <span class="chip chip-outline">Operación</span>
      <span class="chip chip-outline">Cancelaciones</span>
    </div>
    <div style="display:flex;gap:16px">
      <div class="card card-pad" style="flex:1;display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div><h3>Ingresos generales</h3>
            <div class="caption" style="margin-top:2px">Ventas acumuladas por mes</div></div>
          <button class="btn btn-ghost">⬇</button>
        </div>
        <div style="display:flex;gap:12px;align-items:baseline">
          <div class="display-lg gradient-text" style="font-size:40px">$124.5M</div>
          <span class="chip chip-confirmed">↑ 12%</span>
        </div>
        {chart_bars([("Ene",60),("Feb",90),("Mar",130),("Abr",150),("May",200),("Jun",260)],260)}
      </div>
      <div class="card card-pad" style="flex:1;display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div><h3>Rendimiento por categoría</h3>
            <div class="caption" style="margin-top:2px">Distribución de boletos vendidos</div></div>
          <button class="btn btn-ghost">⬇</button>
        </div>
        {bar_row("Conciertos",45,"var(--cat-concierto)")}
        {bar_row("Teatro",30,"var(--cat-teatro)")}
        {bar_row("Deportes",15,"var(--cat-deporte)")}
        {bar_row("Familia",10,"var(--cat-familia)")}
        <div class="divider" style="margin-top:8px"></div>
        <div class="caption">Total: 89.240 boletos vendidos en el período</div>
      </div>
    </div>
    <div style="display:flex;gap:16px">
      <div class="card card-pad" style="flex:1;display:flex;flex-direction:column;gap:16px">
        <div><h3>Tasa de conversión</h3>
          <div class="caption" style="margin-top:2px">Visitantes vs compras finalizadas</div></div>
        <div style="display:flex;gap:12px;align-items:baseline">
          <div class="display-lg" style="font-size:40px">8.4%</div>
          <span class="chip chip-cancelled">↓ 0.5%</span>
        </div>
        <div style="height:120px;border-radius:var(--r-md);
          background:linear-gradient(180deg,rgba(6,182,212,.25),rgba(6,182,212,.02));
          border-bottom:3px solid var(--blue)"></div>
      </div>
      <div class="card card-pad" style="flex:1;display:flex;flex-direction:column;gap:16px">
        <div><h3>Reservas canceladas por causa</h3>
          <div class="caption" style="margin-top:2px">1.284 cancelaciones en 2026</div></div>
        {bar_row("Cliente no puede asistir",52,"var(--error)")}
        {bar_row("Cambio de fecha del evento",18,"var(--warn)")}
        {bar_row("Error en la reserva",12,"var(--gray-400)")}
        {bar_row("Fallo de pago",10,"var(--blue)")}
        {bar_row("Cancelación del organizador",8,"var(--indigo)")}
      </div>
    </div>
  </div>
</div>
""")

# ---------------------------------------------------------------- escribir
for name, html in SCREENS.items():
    p = os.path.join(OUT, name + ".html")
    with open(p, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"OK {name}.html  ({len(html)//1024} KB)")

# índice
links = "".join(
    f'<a href="{n}.html" style="display:block;padding:14px 18px;background:white;'
    f'border-radius:10px;border:1px solid #E8E8EF;margin-bottom:10px;text-decoration:none;'
    f'color:#16162A;font-weight:600">{n.replace("_"," ").title()}</a>'
    for n in SCREENS)
with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
    f.write(f"""<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<title>TicketFlow · Índice de pantallas</title>{FONTS}<style>{CSS}
body{{width:auto;padding:60px}}</style></head><body>
<div style="max-width:700px;margin:0 auto">
<div class="display-lg gradient-text" style="margin-bottom:8px">TicketFlow</div>
<div class="body-lg" style="color:#52526B;margin-bottom:32px">
  14 pantallas · Indigo #635BFF · Space Grotesk + Inter · listas para Figma</div>
{links}</div></body></html>""")
print(f"\nOK index.html\n\nTodo en: {OUT}")
