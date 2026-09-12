# -*- coding: utf-8 -*-
"""Flujo cliente: Catalogo, Detalle, Checkout, Confirmacion, Panel."""
from gen import *
from s_publico import qr, step_dot

S = {}

# ================================================================ CATALOGO
def filter_group(title, opts):
    rows = "".join(
        f'<div style="display:flex;align-items:center;gap:9px">'
        f'<span style="width:16px;height:16px;border-radius:5px;flex-shrink:0;'
        f'{f"background:{C[chr(39)+chr(39)] if False else C[chr(39)+chr(39)]}" if False else ""}'
        f'{f"background:{C[str()] if False else C[str()]}" if False else ""}'
        f'{("background:" + C["indigo"] + ";border:1px solid " + C["indigo"]) if on else ("background:#fff;border:1px solid " + C["line2"])};'
        f'display:flex;align-items:center;justify-content:center;color:#fff">'
        f'{I["check"](11) if on else ""}</span>'
        f'<span style="font-size:13.5px;color:{C["navy"] if on else C["t2"]}">{lbl}</span></div>'
        for lbl, on in opts)
    return (f'<div style="display:flex;flex-direction:column;gap:11px">'
            f'<div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;'
            f'color:{C["t2"]}">{title}</div>{rows}</div>')

cat_events = [
    ("festival-noche.jpg", "MUSICA", C["indigo"], "Festival de Musica Cali Vive", "Cali, Valle del Cauca", "24 Sep 2026", "$85.000", "ALTA DEMANDA"),
    ("concierto-artista.jpg", "FESTIVAL", C["blue"], "Medellin Music Fest", "Medellin, Antioquia", "10 Oct 2026", "$120.000", None),
    ("teatro-epoca.jpg", "CULTURA", "#7C6BFF", "Festival de Jazz de Bogota", "Bogota, Colombia", "17 Oct 2026", "$65.000", None),
    ("festival-dia.jpg", "CULTURA", "#0EA5E9", "Carnaval de Barranquilla", "Barranquilla, Atlantico", "7 Nov 2026", "$50.000", None),
    ("futbol-seleccion.jpg", "DEPORTE", C["blue"], "Clasico Vallecaucano", "Estadio Pascual Guerrero", "2 Oct 2026", "$45.000", None),
    ("teatro-drama.jpg", "TEATRO", "#7C6BFF", "Noche de Teatro Palmira", "Teatro Materon, Palmira", "9 Oct 2026", "$35.000", None),
]
row1 = "".join(ev_card(*e) for e in cat_events[:3])
row2 = "".join(ev_card(*e) for e in cat_events[3:])

sidebar_filters = card(
    f'<div style="display:flex;flex-direction:column;gap:22px">'
    f'<h3 style="font-size:17px">Filtros</h3>'
    f'{filter_group("Categoria", [("Conciertos (42)", True), ("Teatro (28)", False), ("Deportes (18)", False), ("Familia (12)", False)])}'
    f'{filter_group("Ciudad", [("Bogota", True), ("Medellin", False), ("Cali", False), ("Barranquilla", False)])}'
    f'{filter_group("Fecha", [("Este fin de semana", False), ("Este mes", True), ("Proximos 3 meses", False)])}'
    f'<div style="display:flex;flex-direction:column;gap:11px">'
    f'<div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:{C["t2"]}">Precio final</div>'
    f'{bar(62)}'
    f'<div style="display:flex;justify-content:space-between;font-size:12.5px;color:{C["t2"]}">'
    f'<span>$30.000</span><span>$500.000</span></div></div>'
    f'{btn("Aplicar filtros", "outline", None, "md", full=True)}</div>', 22)

S["Catalogo"] = page(f"""
{nav("Eventos", "Cliente &middot; Eder R.")}
<div style="padding:44px 64px 22px">
  <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
    color:{C['indigo']};margin-bottom:9px">Catalogo &middot; Bogota</div>
  <h1 style="font-size:36px;margin-bottom:9px">Descubre tu proximo plan</h1>
  <div style="font-size:16px;color:{C['t2']}">142 eventos disponibles &middot; todos con precio final visible</div>
</div>
<div style="display:flex;gap:28px;padding:0 64px 56px;align-items:flex-start">
  <div style="width:264px;flex-shrink:0">{sidebar_filters}</div>
  <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:19px">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div style="font-size:14px;color:{C['t2']}">Mostrando 6 de 142</div>
      <div style="display:flex;align-items:center;gap:9px">
        <span style="font-size:13.5px;color:{C['t2']}">Ordenar por</span>
        <span style="padding:9px 14px;border:1px solid {C['line2']};border-radius:10px;background:#fff;
          font-size:13.5px;font-weight:500">Recomendados</span></div>
    </div>
    <div style="display:flex;gap:19px">{row1}</div>
    <div style="display:flex;gap:19px">{row2}</div>
    <div style="display:flex;justify-content:center;padding-top:12px">
      {btn("Cargar mas eventos", "outline", None, "lg")}</div>
  </div>
</div>
""", 1440, 1360)


# ================================================================ DETALLE EVENTO
artistas = "".join(
    f'<div style="flex:1;background:#fff;border:1px solid {C["line"]};border-radius:14px;padding:16px;'
    f'display:flex;flex-direction:column;align-items:center;gap:9px;text-align:center">'
    f'<img src="{im}" style="width:64px;height:64px;border-radius:999px;object-fit:cover;display:block">'
    f'<div style="font-family:\'Space Grotesk\',sans-serif;font-size:14px;font-weight:600">{n}</div>'
    f'<div style="font-size:12px;color:{C["t2"]}">{r}</div></div>'
    for im, n, r in [("retrato-1.jpg", "Grupo Niche", "Salsa &middot; Cali"),
                     ("retrato-2.jpg", "Herencia de Timbiqui", "Pacifico &middot; Cali"),
                     ("retrato-3.jpg", "La 33", "Salsa &middot; Bogota"),
                     ("retrato-4.jpg", "Cimarron", "Llanera &middot; Meta")])

zonas = "".join(
    f'<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px;'
    f'border-radius:12px;'
    f'{"background:"+C["indigo50"]+";border:2px solid "+C["indigo"] if sel else "background:#fff;border:1px solid "+C["line2"]}">'
    f'<div><div style="font-size:14.5px;font-weight:600">{n}</div>'
    f'<div style="font-size:12.5px;color:{C["t2"]};margin-top:2px">{d}</div></div>'
    f'<div style="font-family:\'Space Grotesk\',sans-serif;font-size:16px;font-weight:700">{p}</div></div>'
    for n, d, p, sel in [("Palco VIP", "12 disponibles", "$180.000", False),
                         ("Platea general", "340 disponibles", "$85.000", True),
                         ("Tribuna", "1.240 disponibles", "$45.000", False)])

reserva_panel = card(
    f'<div style="display:flex;flex-direction:column;gap:17px">'
    f'<h3 style="font-size:19px">Selecciona tus entradas</h3>'
    f'<div style="display:flex;flex-direction:column;gap:9px">{zonas}</div>'
    f'<div style="height:1px;background:{C["line"]}"></div>'
    f'<div style="display:flex;align-items:center;justify-content:space-between">'
    f'<span style="font-size:14px;font-weight:600">Cantidad</span>'
    f'<div style="display:flex;align-items:center;gap:15px;padding:7px 14px;border:1px solid {C["line2"]};'
    f'border-radius:999px"><span style="font-size:17px;color:{C["t2"]}">&minus;</span>'
    f'<span style="font-family:\'Space Grotesk\',sans-serif;font-size:15px;font-weight:700">2</span>'
    f'<span style="font-size:17px;color:{C["indigo"]}">+</span></div></div>'
    f'<div style="height:1px;background:{C["line"]}"></div>'
    f'<div style="display:flex;align-items:flex-end;justify-content:space-between">'
    f'<div><div style="font-size:13.5px;color:{C["t2"]}">Total (impuestos incluidos)</div>'
    f'<div style="font-size:11px;color:{C["ok600"]};font-weight:600;margin-top:3px">Precio final garantizado</div></div>'
    f'<div style="font-family:\'Space Grotesk\',sans-serif;font-size:29px;font-weight:700">$170.000</div></div>'
    f'{btn("Reservar ahora", "primary", I["arrow"](16), "lg", full=True)}'
    f'<div style="display:flex;align-items:center;justify-content:center;gap:7px;font-size:12.5px;'
    f'color:{C["t2"]}">{I["lock"](13)}Transaccion 100% segura</div></div>', 24)

S["DetalleEvento"] = page(f"""
{nav("Eventos", "Cliente &middot; Eder R.")}
<div style="position:relative;height:400px">
  <img src="festival-noche.jpg" style="width:100%;height:100%;object-fit:cover;display:block">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(17,24,39,.25) 0%,rgba(17,24,39,.88) 100%)"></div>
  <div style="position:absolute;left:64px;right:64px;bottom:38px;display:flex;flex-direction:column;gap:13px">
    <div style="display:flex;gap:9px">
      {chip_solid("MUSICA", C["indigo"])}{chip_solid("FESTIVAL", C["blue"])}
    </div>
    <h1 style="font-size:44px;color:#fff">Festival de Musica Cali Vive</h1>
    <div style="display:flex;gap:24px;color:rgba(255,255,255,.88);font-size:15.5px">
      <span style="display:flex;align-items:center;gap:8px">{I["cal"](16)}24 de septiembre de 2026 &middot; 7:00 PM</span>
      <span style="display:flex;align-items:center;gap:8px">{I["pin"](16)}Cali, Valle del Cauca</span>
    </div>
  </div>
</div>
<div style="display:flex;gap:34px;padding:38px 64px 64px;align-items:flex-start">
  <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:30px">
    <div style="background:{C['warn50']};border:1px solid #FDE9BE;border-radius:14px;padding:18px 20px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:11px">
        <span style="display:flex;align-items:center;gap:8px;font-size:14.5px;font-weight:600;color:{C['warn600']}">
          {I["clock"](16)}Alta demanda</span>
        <span style="font-size:14px;color:{C['t2']}">348 entradas de 1.500 restantes</span>
      </div>
      {bar(77, C["warn"])}
    </div>
    <div>
      <h2 style="font-size:27px;margin-bottom:14px">Tres dias de salsa, pacifico y sabor caleno</h2>
      <div style="font-size:16.5px;color:{C['t2']};line-height:1.65;margin-bottom:13px">
        El festival mas importante del suroccidente colombiano reune a las mejores orquestas
        de salsa, musica del Pacifico y ritmos tradicionales en tres escenarios simultaneos
        en el corazon de Cali.</div>
      <div style="font-size:15.5px;color:{C['t2']};line-height:1.65">
        Con mas de 25 agrupaciones en vivo, zona gastronomica con cocina vallecaucana y
        actividades culturales durante todo el dia.</div>
    </div>
    <div>
      <h3 style="font-size:19px;margin-bottom:15px">Artistas principales</h3>
      <div style="display:flex;gap:14px">{artistas}</div>
    </div>
    <div style="display:flex;gap:14px">
      {kpi("Duracion", "3 dias", "24 al 26 Sep", True, I["clock"](17), C["indigo"])}
      {kpi("Edad", "+16", "Con documento", True, I["user"](17), C["blue"])}
      {kpi("Apertura", "5:00 PM", "Puertas abiertas", True, I["ticket"](17), "#7C6BFF")}
    </div>
  </div>
  <div style="width:376px;flex-shrink:0">{reserva_panel}</div>
</div>
""", 1440, 1420)


# ================================================================ CHECKOUT
def pay_method(ic, name, sub, sel=False):
    box = (f"background:{C['indigo50']};border:2px solid {C['indigo']}" if sel
           else f"background:#fff;border:1px solid {C['line2']}")
    dot = (f'<span style="width:19px;height:19px;border-radius:999px;background:{C["indigo"]};'
           f'display:flex;align-items:center;justify-content:center;flex-shrink:0">'
           f'<span style="width:7px;height:7px;border-radius:999px;background:#fff"></span></span>' if sel
           else f'<span style="width:19px;height:19px;border-radius:999px;border:2px solid {C["line2"]};'
                f'flex-shrink:0;display:block"></span>')
    return (f'<div style="display:flex;align-items:center;gap:14px;padding:17px 18px;border-radius:12px;{box}">'
            f'{dot}<div style="flex:1"><div style="font-size:14.5px;font-weight:600">{name}</div>'
            f'<div style="font-size:12.5px;color:{C["t2"]};margin-top:2px">{sub}</div></div>'
            f'<span style="color:{C["t2"]}">{ic}</span></div>')

resumen = card(
    f'<div style="display:flex;flex-direction:column;gap:17px">'
    f'<h3 style="font-size:19px">Resumen de compra</h3>'
    f'<div style="display:flex;gap:14px">'
    f'<img src="festival-noche.jpg" style="width:70px;height:70px;border-radius:12px;object-fit:cover;'
    f'flex-shrink:0;display:block">'
    f'<div style="min-width:0"><div style="font-family:\'Space Grotesk\',sans-serif;font-size:15px;'
    f'font-weight:600;line-height:1.3;margin-bottom:5px">Festival de Musica Cali Vive</div>'
    f'<div style="font-size:12.5px;color:{C["t2"]};margin-bottom:6px">Platea general &middot; 24 Sep 2026</div>'
    f'{chip("2 tickets", "blue", I["ticket"](13))}</div></div>'
    f'<div style="height:1px;background:{C["line"]}"></div>'
    + "".join(
        f'<div style="display:flex;justify-content:space-between;font-size:14px">'
        f'<span style="color:{C["t2"]}">{l}</span><span style="font-weight:500">{v}</span></div>'
        for l, v in [("Valor entrada x2", "$170.000"), ("Cargo por servicio", "$15.000"), ("IVA (19%)", "$13.000")])
    + f'<div style="height:1px;background:{C["line"]}"></div>'
    f'<div style="display:flex;align-items:flex-end;justify-content:space-between">'
    f'<div><div style="font-size:15px;font-weight:600">Total final</div>'
    f'<div style="font-size:12px;color:{C["ok600"]};font-weight:600;margin-top:2px">Sin cargos adicionales</div></div>'
    f'<div style="font-family:\'Space Grotesk\',sans-serif;font-size:30px;font-weight:700;color:{C["indigo"]}">$198.000</div></div>'
    f'{btn("Pagar ahora", "primary", I["lock"](16), "lg", full=True)}'
    f'<div style="text-align:center;font-size:12.5px;color:{C["t2"]}">'
    f'Pagos procesados de forma segura</div></div>', 24)

S["Checkout"] = page(f"""
<div style="display:flex;align-items:center;justify-content:space-between;padding:15px 64px;
  background:#fff;border-bottom:1px solid {C['line']}">
  {brand()}
  <div style="display:flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;
    background:{C['warn50']};border:1px solid #FDE9BE;color:{C['warn600']};font-size:13.5px;font-weight:600">
    {I["clock"](15)}09:45 para completar tu compra</div>
</div>
<div style="padding:34px 64px 22px">
  <a href="#" style="display:inline-flex;align-items:center;gap:7px;font-size:14px;color:{C['t2']};
    margin-bottom:15px">{I["back"](15)}Volver al evento</a>
  <h1 style="font-size:33px;margin-bottom:7px">Finaliza tu reserva</h1>
  <div style="font-size:15.5px;color:{C['t2']}">Paso 2 de 2 &middot; datos del asistente y metodo de pago</div>
</div>
<div style="display:flex;gap:30px;padding:0 64px 64px;align-items:flex-start">
  <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:20px">
    {card(f'''<div style="display:flex;flex-direction:column;gap:17px">
      <div style="display:flex;align-items:center;gap:11px">
        <span style="width:34px;height:34px;border-radius:10px;background:{C["indigo50"]};color:{C["indigo"]};
          display:flex;align-items:center;justify-content:center">{I["user"](17)}</span>
        <h3 style="font-size:18px">Datos del asistente</h3></div>
      <div style="display:flex;gap:15px">{field("Nombres", "Juan", val=True)}{field("Apellidos", "Perez Gonzalez", val=True)}</div>
      {field("Correo electronico", "juan@ejemplo.com", hint="Aqui enviaremos tus entradas", val=True)}
      {field("Cedula de ciudadania", "1234567890", val=True)}
    </div>''', 24)}
    {card(f'''<div style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;align-items:center;gap:11px;margin-bottom:3px">
        <span style="width:34px;height:34px;border-radius:10px;background:{C["indigo50"]};color:{C["indigo"]};
          display:flex;align-items:center;justify-content:center">{I["card"](17)}</span>
        <h3 style="font-size:18px">Metodo de pago</h3></div>
      {pay_method(I["bank"](19), "PSE (Pagos Seguros en Linea)", "Debito directo desde tu cuenta bancaria", True)}
      {pay_method(I["card"](19), "Tarjeta de credito o debito", "Visa, Mastercard, American Express")}
      {pay_method(I["cash"](19), "Pago en efectivo (Efecty)", "Genera un PIN y paga en puntos fisicos")}
    </div>''', 24)}
  </div>
  <div style="width:376px;flex-shrink:0">{resumen}</div>
</div>
""", 1440, 1080)


# ================================================================ CONFIRMACION
ticket_grid = "".join(
    f'<div><div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;'
    f'color:{C["t2"]};margin-bottom:5px">{l}</div>'
    f'<div style="font-family:\'Space Grotesk\',sans-serif;font-size:15px;font-weight:600;color:#fff">{v}</div></div>'
    for l, v in [("Fecha", "24 SEP 2026"), ("Hora", "7:00 PM"),
                 ("Zona", "Platea general"), ("Entradas", "2 personas")])

S["Confirmacion"] = page(f"""
{nav("Mis Tickets", "Cliente &middot; Eder R.")}
<div style="display:flex;flex-direction:column;align-items:center;padding:64px 64px;gap:24px">
  <div style="width:72px;height:72px;border-radius:999px;background:{C['ok50']};color:{C['ok600']};
    display:flex;align-items:center;justify-content:center">{I["check"](34)}</div>
  <div style="text-align:center;display:flex;flex-direction:column;gap:11px;align-items:center">
    <h1 style="font-size:38px">&iexcl;Tu reserva esta lista!</h1>
    <div style="font-size:16.5px;color:{C['t2']};max-width:520px">
      Enviamos la confirmacion y las entradas a <strong style="color:{C['navy']}">juan@ejemplo.com</strong>.
      Preparate para una experiencia inolvidable.</div>
  </div>

  <div style="width:640px;background:{C['navy']};border-radius:20px;overflow:hidden;box-shadow:{SH['lg']};margin-top:8px">
    <div style="padding:20px 26px;background:{C['grad']};display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:9px;font-family:'Space Grotesk',sans-serif;
        font-weight:700;font-size:16px;color:#fff">{LOGO}TicketFlow</div>
      <span style="padding:5px 12px;border-radius:999px;background:rgba(255,255,255,.2);
        font-size:11px;font-weight:700;letter-spacing:.07em;color:#fff">CONFIRMADA</span>
    </div>
    <div style="padding:26px;display:flex;gap:22px">
      <img src="festival-noche.jpg" style="width:120px;height:120px;border-radius:14px;object-fit:cover;
        flex-shrink:0;display:block">
      <div style="flex:1;min-width:0">
        <h3 style="font-size:23px;color:#fff;margin-bottom:6px">Festival de Musica Cali Vive</h3>
        <div style="display:flex;align-items:center;gap:7px;font-size:13.5px;color:{C['muted']};margin-bottom:18px">
          {I["pin"](14)}Cali, Valle del Cauca</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px">{ticket_grid}</div>
      </div>
    </div>
    <div style="position:relative;height:24px">
      <div style="position:absolute;left:-12px;top:0;width:24px;height:24px;border-radius:50%;background:{C['bg']}"></div>
      <div style="position:absolute;right:-12px;top:0;width:24px;height:24px;border-radius:50%;background:{C['bg']}"></div>
      <div style="position:absolute;top:11px;left:26px;right:26px;height:2px;
        background:repeating-linear-gradient(90deg,rgba(255,255,255,.3) 0 7px,transparent 7px 14px)"></div>
    </div>
    <div style="padding:22px 26px;display:flex;align-items:center;justify-content:space-between;gap:20px">
      <div>
        <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
          color:{C['t2']};margin-bottom:5px">Codigo de reserva</div>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#fff;
          letter-spacing:.04em">TF-2026-A9F42B</div>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;color:#fff;
          margin-top:12px">$198.000<span style="font-family:'Inter',sans-serif;font-size:12px;
          font-weight:500;color:{C['t2']};margin-left:7px">COP &middot; precio final</span></div>
      </div>
      {qr(88)}
    </div>
  </div>

  <div style="display:flex;gap:13px;margin-top:8px">
    {btn("Descargar PDF", "primary", I["down"](16), "lg")}
    {btn("Agregar al calendario", "outline", I["cal"](16), "lg")}
    {btn("Ver mis reservas", "ghost", None, "lg")}
  </div>
</div>
""", 1440, 1000)


# ================================================================ PANEL CLIENTE
def reserva_row(img, cat, cat_bg, title, place, date, zona, total, estado, tone, acciones):
    return (f'<div style="display:flex;align-items:center;gap:20px;padding:19px;background:#fff;'
            f'border:1px solid {C["line"]};border-radius:16px;box-shadow:{SH["sm"]}">'
            f'<img src="{img}" style="width:104px;height:104px;border-radius:13px;object-fit:cover;'
            f'flex-shrink:0;display:block">'
            f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px">'
            f'<div style="display:flex;align-items:center;gap:9px">'
            f'{chip(estado, tone)}{chip_solid(cat, cat_bg)}</div>'
            f'<h3 style="font-size:18px">{title}</h3>'
            f'<div style="display:flex;gap:18px;color:{C["t2"]};font-size:13.5px">'
            f'<span style="display:flex;align-items:center;gap:6px">{I["pin"](14)}{place}</span>'
            f'<span style="display:flex;align-items:center;gap:6px">{I["cal"](14)}{date}</span></div>'
            f'<div style="font-size:12.5px;color:{C["muted"]}">{zona}</div></div>'
            f'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:11px;flex-shrink:0">'
            f'<div style="text-align:right">'
            f'<div style="font-family:\'Space Grotesk\',sans-serif;font-size:21px;font-weight:700">{total}</div>'
            f'<div style="font-size:11px;color:{C["t2"]}">Precio final</div></div>'
            f'<div style="display:flex;gap:9px">{acciones}</div></div></div>')

tabs = "".join(
    f'<div style="display:flex;align-items:center;gap:7px;padding:10px 17px;border-radius:999px;'
    f'{"background:"+C["grad"]+";color:#fff;font-weight:600" if on else "background:#fff;border:1px solid "+C["line2"]+";color:"+C["t2"]};'
    f'font-size:14px">{t}'
    f'<span style="padding:1px 7px;border-radius:999px;font-size:11.5px;font-weight:700;'
    f'{"background:rgba(255,255,255,.25);color:#fff" if on else "background:"+C["soft"]+";color:"+C["t2"]}">{n}</span></div>'
    for t, n, on in [("Proximas", "3", True), ("Pasadas", "12", False), ("Canceladas", "1", False)])

S["PanelCliente"] = page(f"""
{nav("Mis Tickets", "Cliente &middot; Eder R.")}
<div style="background:{C['navy']};padding:44px 64px 40px;position:relative;overflow:hidden">
  <div style="position:absolute;width:400px;height:400px;border-radius:50%;background:{C['indigo']};
    filter:blur(130px);opacity:.24;top:-160px;right:-60px"></div>
  <div style="position:relative">
    <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
      color:#A8A3FF;margin-bottom:10px">Hola, Eder</div>
    <h1 style="font-size:36px;color:#fff;margin-bottom:9px">Mis reservas</h1>
    <div style="font-size:16px;color:{C['muted']};max-width:560px">
      Gestiona tus entradas, revisa el estado de tus compras o radica una PQRS.</div>
    <div style="display:flex;gap:15px;margin-top:26px">
      {kpi("Proximas", "3", "eventos este mes", True, I["ticket"](17), C["indigo"])}
      {kpi("Pasadas", "12", "asistidos", True, I["star"](17), C["blue"])}
      {kpi("Invertido", "$1.85M", "total historico", True, I["money"](17), "#7C6BFF")}
      {kpi("Puntos", "+120", "TicketFlow rewards", True, I["gift"](17), "#0EA5E9")}
    </div>
  </div>
</div>
<div style="padding:30px 64px 56px;display:flex;flex-direction:column;gap:17px">
  <div style="display:flex;gap:11px">{tabs}</div>
  {reserva_row("festival-noche.jpg", "MUSICA", C["indigo"], "Festival de Musica Cali Vive",
               "Cali, Valle del Cauca", "24 Sep 2026 &middot; 7:00 PM", "Platea general &middot; 2 entradas",
               "$198.000", "Confirmada", "ok",
               btn("Descargar", "primary", I["down"](15)) + btn("Cancelar", "danger"))}
  {reserva_row("concierto-artista.jpg", "FESTIVAL", C["blue"], "Medellin Music Fest",
               "Medellin, Antioquia", "10 Oct 2026 &middot; 9:00 PM", "Palco VIP &middot; 4 entradas",
               "$480.000", "Reservada", "warn",
               btn("Pagar ahora", "primary", I["card"](15)) + btn("Cancelar", "danger"))}
  {reserva_row("teatro-epoca.jpg", "CULTURA", "#7C6BFF", "Festival de Jazz de Bogota",
               "Bogota, Colombia", "17 Oct 2026 &middot; 7:30 PM", "General &middot; 1 entrada",
               "$65.000", "Cancelada", "err",
               btn("Ver PQRS", "outline", I["shield"](15)))}
  <div style="display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px 24px;
    background:{C['blue50']};border:1px solid #D6E6FE;border-radius:16px">
    <div style="display:flex;align-items:center;gap:14px">
      <span style="width:42px;height:42px;border-radius:11px;background:#fff;color:{C['blue']};
        display:flex;align-items:center;justify-content:center;flex-shrink:0">{I["shield"](20)}</span>
      <div><div style="font-size:15px;font-weight:600;margin-bottom:2px">&iquest;Tuviste un problema con tu reserva?</div>
        <div style="font-size:13.5px;color:{C['t2']}">Radica una PQRS y te respondemos en maximo 15 dias habiles.</div></div>
    </div>
    {btn("Radicar PQRS", "outline")}
  </div>
</div>
""", 1440, 1240)
