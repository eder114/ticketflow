# -*- coding: utf-8 -*-
"""Pantallas publicas: Landing, Login, Registro Cliente, Registro Agente."""
from gen import *

S = {}

# ================================================================ LANDING
_cats = [("Conciertos", "1.240", I["ticket"](19), C["indigo"]),
         ("Deportes", "480", I["trophy"](19), C["blue"]),
         ("Teatro", "320", I["star"](19), "#7C6BFF"),
         ("Comedia", "210", I["users"](19), "#0EA5E9"),
         ("Cultura", "560", I["globe"](19), C["indigo"]),
         ("Festivales", "180", I["flow"](19), C["blue"]),
         ("Academicos", "95", I["chart"](19), "#7C6BFF"),
         ("Conferencias", "140", I["money"](19), "#0EA5E9")]

cat_html = "".join(
    f'<div style="background:#fff;border:1px solid {C["line"]};border-radius:16px;padding:20px;'
    f'display:flex;flex-direction:column;gap:11px;box-shadow:{SH["sm"]}">'
    f'<div style="width:42px;height:42px;border-radius:11px;background:{col}14;color:{col};'
    f'display:flex;align-items:center;justify-content:center">{ic}</div>'
    f'<h4 style="font-size:15.5px">{n}</h4>'
    f'<div style="font-size:13px;color:{C["t2"]}">{c} eventos</div></div>'
    for n, c, ic, col in _cats)

steps = "".join(
    f'<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:13px;text-align:center">'
    f'<div style="width:64px;height:64px;border-radius:999px;background:#fff;border:2px solid {C["indigo"]};'
    f'display:flex;align-items:center;justify-content:center;font-family:\'Space Grotesk\',sans-serif;'
    f'font-size:20px;font-weight:700;color:{C["indigo"]};box-shadow:0 6px 18px rgba(99,91,255,.16)">{n}</div>'
    f'<h4 style="font-size:19px">{t}</h4>'
    f'<div style="font-size:14.5px;color:{C["t2"]};max-width:250px">{d}</div></div>'
    for n, t, d in [("01", "Descubre", "Encuentra eventos que se adapten a tus intereses, ciudad y fechas."),
                    ("02", "Compra", "Selecciona tus entradas y paga de forma sencilla y segura."),
                    ("03", "Disfruta", "Recibe tu ticket digital al instante y vive el evento.")])

bens = "".join(
    f'<div style="display:flex;gap:15px;padding:19px;border-radius:14px;background:rgba(255,255,255,.05);'
    f'border:1px solid rgba(255,255,255,.09)">'
    f'<div style="width:42px;height:42px;border-radius:11px;background:{C["grad"]};color:#fff;flex-shrink:0;'
    f'display:flex;align-items:center;justify-content:center">{ic}</div><div>'
    f'<h4 style="font-size:15.5px;color:#fff;margin-bottom:4px">{t}</h4>'
    f'<div style="font-size:14px;color:{C["muted"]}">{d}</div></div></div>'
    for ic, t, d in [(I["ticket"](19), "Venta de entradas", "Administra tickets, precios y aforo en tiempo real."),
                     (I["chart"](19), "Estadisticas", "Conoce el rendimiento de tu evento con metricas claras."),
                     (I["users"](19), "Gestion de asistentes", "Organiza y controla el ingreso con check-in digital.")])

stats = "".join(
    f'<div style="flex:1;text-align:center;background:#fff;border:1px solid {C["line"]};border-radius:16px;'
    f'padding:28px 18px;box-shadow:{SH["sm"]}">'
    f'<div style="font-family:\'Space Grotesk\',sans-serif;font-size:40px;font-weight:700;color:{C["indigo"]};'
    f'margin-bottom:5px">{n}</div>'
    f'<div style="font-size:13.5px;color:{C["t2"]};font-weight:500">{l}</div></div>'
    for n, l in [("10K+", "Eventos publicados"), ("500+", "Organizadores"),
                 ("50K+", "Tickets vendidos"), ("20+", "Ciudades")])

_QR_CELLS = [(0,0),(0,1),(0,2),(0,3),(0,4),(0,5),(0,6),(0,14),(0,15),(0,16),(0,17),(0,18),(0,19),(0,20),
 (1,0),(1,6),(1,14),(1,20),(2,0),(2,2),(2,3),(2,4),(2,6),(2,9),(2,11),(2,14),(2,16),(2,17),(2,18),(2,20),
 (3,0),(3,2),(3,3),(3,4),(3,6),(3,10),(3,14),(3,16),(3,17),(3,18),(3,20),
 (4,0),(4,2),(4,3),(4,4),(4,6),(4,8),(4,12),(4,14),(4,16),(4,17),(4,18),(4,20),
 (5,0),(5,6),(5,9),(5,11),(5,14),(5,20),(6,0),(6,1),(6,2),(6,3),(6,4),(6,5),(6,6),
 (6,8),(6,10),(6,12),(6,14),(6,15),(6,16),(6,17),(6,18),(6,19),(6,20),
 (8,1),(8,3),(8,5),(8,8),(8,9),(8,11),(8,13),(8,16),(8,18),(8,20),
 (9,0),(9,2),(9,6),(9,9),(9,12),(9,15),(9,17),(9,19),
 (10,1),(10,4),(10,7),(10,10),(10,11),(10,14),(10,16),(10,20),
 (11,0),(11,3),(11,5),(11,8),(11,12),(11,15),(11,18),(11,19),
 (12,2),(12,4),(12,6),(12,9),(12,11),(12,13),(12,17),(12,20),
 (14,0),(14,1),(14,2),(14,3),(14,4),(14,5),(14,6),(14,9),(14,12),(14,15),(14,18),(14,20),
 (15,0),(15,6),(15,8),(15,11),(15,14),(15,17),(15,19),
 (16,0),(16,2),(16,3),(16,4),(16,6),(16,10),(16,13),(16,16),(16,20),
 (17,0),(17,2),(17,3),(17,4),(17,6),(17,9),(17,12),(17,15),(17,18),
 (18,0),(18,2),(18,3),(18,4),(18,6),(18,8),(18,11),(18,14),(18,17),(18,20),
 (19,0),(19,6),(19,10),(19,13),(19,16),(19,19),
 (20,0),(20,1),(20,2),(20,3),(20,4),(20,5),(20,6),(20,9),(20,12),(20,15),(20,18),(20,20)]

def qr(px=76):
    cells = "".join(f'<rect x="{c}" y="{r}" width="1" height="1"/>' for r, c in _QR_CELLS)
    return (f'<svg viewBox="0 0 21 21" style="width:{px}px;height:{px}px;background:#fff;border-radius:8px;'
            f'padding:5px;flex-shrink:0" shape-rendering="crispEdges" fill="#111827">{cells}</svg>')

def photo_tile(src, label, area):
    return (f'<div style="grid-area:{area};position:relative;border-radius:18px;overflow:hidden">'
            f'<img src="{src}" style="width:100%;height:100%;object-fit:cover;display:block">'
            f'<div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 42%,rgba(17,24,39,.75))"></div>'
            f'<div style="position:absolute;left:14px;bottom:12px;font-size:12.5px;font-weight:600;color:#fff">{label}</div></div>')

near = "".join(
    f'<div style="display:flex;gap:13px;padding:13px;border:1px solid {C["line"]};border-radius:14px;'
    f'align-items:center;background:{C["bg"]}">'
    f'<img src="{im}" style="width:62px;height:62px;border-radius:11px;object-fit:cover;flex-shrink:0;display:block">'
    f'<div style="min-width:0"><div style="font-family:\'Space Grotesk\',sans-serif;font-size:14.5px;'
    f'font-weight:600;margin-bottom:3px">{t}</div>'
    f'<div style="font-size:12.5px;color:{C["t2"]};margin-bottom:4px">{m}</div>'
    f'<div style="font-family:\'Space Grotesk\',sans-serif;font-size:14px;font-weight:700;color:{C["indigo"]}">{p}</div>'
    f'</div></div>'
    for im, t, m, p in [("festival-noche.jpg", "Festival Cali Vive", "24 Sep &middot; Cali", "$85.000"),
                        ("futbol-seleccion.jpg", "Clasico Vallecaucano", "2 Oct &middot; Pascual Guerrero", "$45.000"),
                        ("teatro-drama.jpg", "Noche de Teatro", "9 Oct &middot; Teatro Materon", "$35.000")])

ticket_cells = "".join(
    f'<div><div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;'
    f'color:{C["t2"]};margin-bottom:4px">{l}</div>'
    f'<div style="font-family:\'Space Grotesk\',sans-serif;font-size:15px;font-weight:600;color:#fff">{v}</div></div>'
    for l, v in [("Fecha", "24 SEP 2026"), ("Hora", "7:00 PM"),
                 ("Ubicacion", "Cali, Colombia"), ("Codigo", "TF-9F42B")])

checks = "".join(
    f'<div style="display:flex;align-items:center;gap:10px;font-size:15px">'
    f'<span style="color:{C["ok600"]};display:flex">{I["check"](16)}</span>{t}</div>'
    for t in ["Codigo QR unico e intransferible", "Llega a tu correo al instante",
              "Funciona sin conexion el dia del evento"])

socials = "".join(
    f'<span style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.07);'
    f'border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;'
    f'color:{C["muted"]}">{ic}</span>' for ic in [I["globe"](15), I["users"](15), I["star"](15)])

foot_cols = "".join(
    f'<div><h4 style="font-family:\'Inter\',sans-serif;font-size:11.5px;font-weight:700;letter-spacing:.11em;'
    f'text-transform:uppercase;color:#fff;margin-bottom:15px">{t}</h4>' +
    "".join(f'<div style="font-size:14px;color:{C["muted"]};margin-bottom:9px">{l}</div>' for l in ls) + '</div>'
    for t, ls in [("Explorar", ["Eventos", "Categorias", "Ciudades", "Eventos destacados"]),
                  ("Organizadores", ["Crear evento", "Administrar eventos", "Estadisticas", "Ayuda"]),
                  ("Compania", ["Sobre nosotros", "Contacto", "Terminos", "Privacidad"])])

search_card = card(
    f'<h3 style="font-size:18px;margin-bottom:17px">&iquest;Que evento estas buscando?</h3>'
    f'<div style="display:grid;grid-template-columns:1.6fr 1fr 1fr auto;gap:13px;align-items:end">'
    f'{field("Buscar", "Eventos, artistas, lugares...")}'
    f'{field("Ciudad", "Bogota", val=True)}'
    f'{field("Fecha", "Cualquier fecha")}'
    f'<div style="padding-bottom:1px">{btn("Buscar eventos", "primary", I["search"](16), "lg")}</div></div>')

near_card = card(
    f'<div style="display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:22px">'
    f'<div style="display:flex;align-items:center;gap:13px">'
    f'<div style="width:44px;height:44px;border-radius:12px;background:{C["indigo50"]};color:{C["indigo"]};'
    f'display:flex;align-items:center;justify-content:center">{I["pin"](20)}</div>'
    f'<div><h4 style="font-size:18px">Eventos cerca de ti</h4>'
    f'<div style="font-size:13.5px;color:{C["t2"]}">Mostrando resultados en '
    f'<span style="color:{C["navy"]};font-weight:600">Cali, Valle del Cauca</span> y alrededores</div></div></div>'
    f'{btn("Cambiar ubicacion", "outline")}</div>'
    f'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px">{near}</div>')

S["Main"] = page(f"""
{nav("Inicio")}

<div style="position:relative;background:{C['navy']};overflow:hidden;padding:76px 64px 92px">
  <div style="position:absolute;width:480px;height:480px;border-radius:50%;background:{C['indigo']};
    filter:blur(130px);opacity:.30;top:-150px;left:-110px"></div>
  <div style="position:absolute;width:380px;height:380px;border-radius:50%;background:{C['blue']};
    filter:blur(130px);opacity:.22;bottom:-160px;right:9%"></div>
  <div style="position:relative;display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center">
    <div style="display:flex;flex-direction:column;gap:22px;align-items:flex-start">
      <span style="padding:7px 15px;border-radius:999px;background:rgba(99,91,255,.17);
        border:1px solid rgba(99,91,255,.34);font-size:11.5px;font-weight:600;letter-spacing:.1em;
        color:#C7C3FF">EVENTOS EN COLOMBIA</span>
      <h1 style="font-size:54px;color:#fff;line-height:1.06">Tu proximo evento<br>comienza
        <span style="color:{C['indigo']}">aqui</span>.</h1>
      <div style="font-size:18px;color:{C['muted']};max-width:490px;line-height:1.6">
        Descubre, reserva y disfruta los mejores eventos de Colombia desde un solo lugar.</div>
      <div style="display:flex;gap:13px">
        {btn("Explorar eventos", "primary", None, "lg")}
        <button style="display:inline-flex;align-items:center;gap:8px;padding:14px 26px;border-radius:10px;
          background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:#fff;
          font-family:'Inter',sans-serif;font-size:15px;font-weight:600;cursor:pointer">Crear un evento</button>
      </div>
      <div style="display:flex;gap:34px;margin-top:14px">
        <div><div style="font-family:'Space Grotesk',sans-serif;font-size:21px;font-weight:700;color:#fff">10K+</div>
          <div style="font-size:12px;color:{C['t2']}">Eventos</div></div>
        <div><div style="font-family:'Space Grotesk',sans-serif;font-size:21px;font-weight:700;color:#fff">20+</div>
          <div style="font-size:12px;color:{C['t2']}">Ciudades</div></div>
        <div><div style="font-family:'Space Grotesk',sans-serif;font-size:21px;font-weight:700;color:#fff">50K+</div>
          <div style="font-size:12px;color:{C['t2']}">Tickets vendidos</div></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:180px 140px 180px;gap:13px;
      grid-template-areas:'a b' 'a c' 'd c'">
      {photo_tile("festival-dia.jpg", "Festivales", "a")}
      {photo_tile("concierto-artista.jpg", "Conciertos", "b")}
      {photo_tile("teatro-epoca.jpg", "Teatro y cultura", "c")}
      {photo_tile("futbol-seleccion.jpg", "Deportes", "d")}
    </div>
  </div>
</div>

<div style="padding:0 64px;margin-top:-52px;position:relative;z-index:5">{search_card}</div>

<div style="padding:66px 64px 0">
  {sec_head("Categorias", "Encuentra algo que te guste", "Explora por tipo de experiencia y descubre que esta pasando cerca de ti.")}
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:15px">{cat_html}</div>
</div>

<div style="padding:66px 64px 0">
  {sec_head("Lo mas buscado", "Eventos destacados", "Los eventos con mayor demanda esta temporada.", btn("Ver todos", "outline"))}
  <div style="display:flex;gap:20px">
    {ev_card("festival-noche.jpg", "MUSICA", C["indigo"], "Festival de Musica Cali Vive", "Cali, Valle del Cauca", "24 de septiembre de 2026", "$85.000", "ALTA DEMANDA")}
    {ev_card("concierto-artista.jpg", "FESTIVAL", C["blue"], "Medellin Music Fest", "Medellin, Antioquia", "10 de octubre de 2026", "$120.000")}
    {ev_card("teatro-epoca.jpg", "CULTURA", "#7C6BFF", "Festival de Jazz de Bogota", "Bogota, Colombia", "17 de octubre de 2026", "$65.000")}
    {ev_card("festival-dia.jpg", "CULTURA", "#0EA5E9", "Carnaval Cultural de Barranquilla", "Barranquilla, Atlantico", "7 de noviembre de 2026", "$50.000")}
  </div>
</div>

<div style="padding:66px 64px 0">{near_card}</div>

<div style="padding:66px 64px 0">
  <div style="position:relative;background:{C['navy']};border-radius:22px;padding:56px;overflow:hidden">
    <div style="position:absolute;width:380px;height:380px;border-radius:50%;background:{C['indigo']};
      filter:blur(130px);opacity:.24;top:-140px;right:-70px"></div>
    <div style="position:relative;display:grid;grid-template-columns:1fr 1.1fr;gap:56px;align-items:center">
      <div style="display:flex;flex-direction:column;gap:18px;align-items:flex-start">
        <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#A8A3FF">
          Para organizadores</div>
        <h2 style="font-size:34px;color:#fff">&iquest;Tienes un evento?<br>Haz que suceda.</h2>
        <div style="font-size:16.5px;color:{C['muted']};max-width:400px">
          Publica tu evento, administra tus entradas y conecta con tu audiencia desde TicketFlow.</div>
        {btn("Crear mi evento", "primary", None, "lg")}
      </div>
      <div style="display:flex;flex-direction:column;gap:13px">{bens}</div>
    </div>
  </div>
</div>

<div style="padding:66px 64px 0">
  <div style="display:flex;flex-direction:column;align-items:center;gap:9px;margin-bottom:34px;text-align:center">
    <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:{C['indigo']}">
      Como funciona</div>
    <h2 style="font-size:32px">Organizar nunca fue tan facil</h2>
    <div style="font-size:16px;color:{C['t2']}">Tres pasos para pasar de la busqueda al evento.</div>
  </div>
  <div style="position:relative;display:flex;gap:26px">
    <div style="position:absolute;top:32px;left:16%;right:16%;height:2px;background:{C['grad']};opacity:.3"></div>
    {steps}
  </div>
</div>

<div style="padding:66px 64px 0">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center">
    <div style="display:flex;flex-direction:column;gap:18px;align-items:flex-start">
      <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:{C['indigo']}">
        Ticket digital</div>
      <h2 style="font-size:32px">Tu entrada, siempre<br>en tu bolsillo</h2>
      <div style="font-size:16.5px;color:{C['t2']};max-width:420px">
        Al confirmar tu compra recibes un ticket digital con codigo QR unico.
        Sin filas, sin impresiones, sin perder la entrada.</div>
      <div style="display:flex;flex-direction:column;gap:11px">{checks}</div>
    </div>
    <div style="display:flex;justify-content:center">
      <div style="width:378px;background:{C['navy']};border-radius:18px;overflow:hidden;box-shadow:{SH['lg']}">
        <div style="padding:19px 24px;background:{C['grad']};display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:9px;font-family:'Space Grotesk',sans-serif;
            font-weight:700;font-size:16px;color:#fff">{LOGO}TicketFlow</div>
          <span style="font-size:10.5px;font-weight:700;letter-spacing:.09em;color:rgba(255,255,255,.92)">
            ENTRADA GENERAL</span>
        </div>
        <div style="padding:24px">
          <h3 style="font-size:22px;color:#fff;margin-bottom:17px">Festival de Musica<br>Cali Vive</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">{ticket_cells}</div>
        </div>
        <div style="position:relative;height:22px">
          <div style="position:absolute;left:-11px;top:0;width:22px;height:22px;border-radius:50%;background:{C['bg']}"></div>
          <div style="position:absolute;right:-11px;top:0;width:22px;height:22px;border-radius:50%;background:{C['bg']}"></div>
          <div style="position:absolute;top:10px;left:24px;right:24px;height:2px;
            background:repeating-linear-gradient(90deg,rgba(255,255,255,.3) 0 7px,transparent 7px 14px)"></div>
        </div>
        <div style="padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px">
          <div><div style="font-family:'Space Grotesk',sans-serif;font-size:25px;font-weight:700;color:#fff">$85.000</div>
            <div style="font-size:11px;color:{C['t2']};margin-top:2px">COP &middot; Precio final</div></div>
          {qr()}
        </div>
      </div>
    </div>
  </div>
</div>

<div style="padding:66px 64px 0"><div style="display:flex;gap:20px">{stats}</div></div>

<div style="margin-top:70px;background:{C['navy']};padding:56px 64px 26px">
  <div style="display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:48px;margin-bottom:40px">
    <div>{brand(dark=True)}
      <div style="font-size:14.5px;color:{C['muted']};max-width:270px;margin:13px 0 18px">
        Conectamos personas con experiencias.</div>
      <div style="display:flex;gap:9px">{socials}</div>
    </div>
    {foot_cols}
  </div>
  <div style="border-top:1px solid rgba(255,255,255,.09);padding-top:22px;display:flex;
    align-items:center;justify-content:space-between;font-size:13px;color:{C['muted']}">
    <span>&copy; 2026 TicketFlow. Todos los derechos reservados.</span>
    <span>Hecho para Colombia</span>
  </div>
</div>
""", 1440, 4380)


# ================================================================ LOGIN
S["Login"] = page(f"""
<div style="display:flex;min-height:900px">
  <div style="width:620px;flex-shrink:0;position:relative">
    <img src="teatro-sala.jpg" style="width:100%;height:100%;object-fit:cover;display:block">
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(17,24,39,.5) 0%,rgba(17,24,39,.9) 100%)"></div>
    <div style="position:absolute;top:34px;left:38px">{brand(dark=True)}</div>
    <div style="position:absolute;left:38px;right:38px;bottom:44px">
      <h2 style="font-size:31px;color:#fff;margin-bottom:11px">Donde la cultura<br>se vive y se siente.</h2>
      <div style="font-size:15px;color:{C['muted']}">Mas de 42.000 personas ya reservan sin sorpresas.</div>
    </div>
  </div>
  <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:64px">
    <div style="width:100%;max-width:420px;display:flex;flex-direction:column;gap:19px">
      <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:{C['indigo']}">
        Bienvenido de vuelta</div>
      <h1 style="font-size:35px">Ingresa a<br>tu cuenta</h1>
      <div style="font-size:15.5px;color:{C['t2']}">Consulta tus reservas y descarga tus entradas.</div>
      {field("Correo electronico", "tu@correo.com")}
      {field("Contrasena", "&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;", err="La contrasena no coincide con este correo.", val=True)}
      <div style="display:flex;align-items:center;justify-content:space-between;gap:14px">
        <div style="display:flex;align-items:center;gap:9px">
          <span style="width:17px;height:17px;border:1px solid {C['line2']};border-radius:5px;display:block"></span>
          <span style="font-size:14px;color:{C['t2']}">Mantener sesion</span>
        </div>
        <a href="#" style="font-size:13.5px;font-weight:600">&iquest;Olvidaste tu contrasena?</a>
      </div>
      {btn("Ingresar", "primary", None, "lg", full=True)}
      <div style="display:flex;align-items:center;gap:13px">
        <div style="flex:1;height:1px;background:{C['line']}"></div>
        <span style="font-size:12.5px;color:{C['muted']}">o</span>
        <div style="flex:1;height:1px;background:{C['line']}"></div>
      </div>
      {btn("Continuar como invitado", "outline", None, "lg", full=True)}
      <div style="text-align:center;font-size:14px;color:{C['t2']}">
        &iquest;Nuevo en TicketFlow? <a href="#" style="font-weight:600">Crea tu cuenta</a></div>
    </div>
  </div>
</div>
""", 1440, 900)


# ================================================================ REGISTRO CLIENTE
S["RegistroCliente"] = page(f"""
{nav("Inicio")}
<div style="display:flex;justify-content:center;padding:56px 64px">
  <div style="width:100%;max-width:660px">
    {card(f'''<div style="display:flex;flex-direction:column;gap:20px">
      <div style="align-self:flex-start">{chip("Cliente", "brand", I["user"](14))}</div>
      <h1 style="font-size:33px">Crea tu cuenta<br>y reserva en segundos.</h1>
      <div style="font-size:15.5px;color:{C["t2"]}">
        Recibe tus entradas por correo y accede a tu historial cuando quieras.</div>
      <div style="display:flex;gap:15px">{field("Nombres", "Eder Andres")}{field("Apellidos", "Rodriguez")}</div>
      <div style="display:flex;gap:15px">{field("Documento", "CC 1000000000")}{field("Celular", "+57 300 000 0000")}</div>
      {field("Correo electronico", "tu@correo.com")}
      <div style="display:flex;gap:15px">
        {field("Contrasena", "&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;", hint="Minimo 8 caracteres, 1 mayuscula y 1 numero")}
        {field("Confirmar contrasena", "&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;")}
      </div>
      <div style="display:flex;gap:15px">{field("Pais", "Colombia", val=True)}{field("Departamento", "Cundinamarca")}{field("Ciudad", "Bogota")}</div>
      <div style="display:flex;align-items:center;gap:11px">
        <span style="width:18px;height:18px;border:1px solid {C["line2"]};border-radius:5px;display:block;flex-shrink:0"></span>
        <span style="font-size:14px;color:{C["t2"]}">Acepto los terminos, la politica de datos y la ruta PQRS.</span>
      </div>
      {btn("Crear mi cuenta", "primary", None, "lg", full=True)}
    </div>''', 34)}
  </div>
</div>
""", 1440, 1080)


# ================================================================ REGISTRO AGENTE
def step_dot(n, label, state):
    if state == "done":
        circ = f'background:{C["indigo"]};color:#fff;border:2px solid {C["indigo"]}'
        inner = I["check"](15)
    elif state == "active":
        circ = f'background:{C["indigo"]};color:#fff;border:2px solid {C["indigo"]}'
        inner = n
    else:
        circ = f'background:#fff;color:{C["muted"]};border:2px solid {C["line2"]}'
        inner = n
    lab_col = C["navy"] if state != "pending" else C["muted"]
    return (f'<div style="display:flex;flex-direction:column;align-items:center;gap:9px;flex:1">'
            f'<div style="width:38px;height:38px;border-radius:999px;{circ};display:flex;'
            f'align-items:center;justify-content:center;font-family:\'Space Grotesk\',sans-serif;'
            f'font-size:14px;font-weight:700">{inner}</div>'
            f'<div style="font-size:13px;font-weight:600;color:{lab_col};text-align:center">{label}</div></div>')

def step_line(done):
    col = C["indigo"] if done else C["line2"]
    return f'<div style="flex:1;height:2px;background:{col};margin-top:19px"></div>'

S["RegistroAgente"] = page(f"""
{nav("Crear Evento")}
<div style="display:flex;justify-content:center;padding:56px 64px">
  <div style="width:100%;max-width:720px">
    {card(f'''<div style="display:flex;flex-direction:column;gap:22px">
      <div style="display:flex;align-items:flex-start">
        {step_dot("1", "Datos personales", "done")}{step_line(True)}
        {step_dot("2", "Perfil profesional", "active")}{step_line(False)}
        {step_dot("3", "Verificacion", "pending")}
      </div>
      <div style="height:1px;background:{C["line"]}"></div>
      <div style="align-self:flex-start">{chip("Agente", "blue", I["shield"](14))}</div>
      <h1 style="font-size:31px">Cuentanos sobre<br>tu experiencia.</h1>
      <div style="font-size:15.5px;color:{C["t2"]}">
        Estos datos ayudan al administrador a asignarte eventos acordes a tu perfil.</div>
      <div style="display:flex;gap:15px">{field("Anos de experiencia", "5")}{field("Comision esperada (%)", "8")}</div>
      {field("Categorias de eventos", "Conciertos, Festivales, Teatro")}
      {field("Empresa o promotora", "Opcional")}
      {field("Portafolio o LinkedIn", "Opcional")}
      <div style="display:flex;justify-content:space-between;gap:15px;padding-top:4px">
        {btn("Atras", "outline", I["back"](16), "lg")}{btn("Continuar", "primary", I["arrow"](16), "lg")}
      </div>
    </div>''', 34)}
  </div>
</div>
""", 1440, 1000)
