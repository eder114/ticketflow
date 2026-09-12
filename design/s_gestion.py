# -*- coding: utf-8 -*-
"""Agente y Admin: Panel, Crear evento, Reservas, Dashboard, Reportes."""
from gen import *

S = {}

def shell(active, sub, body, cta=True):
    return (f'<div style="display:flex;align-items:stretch;min-height:900px">'
            f'{sidebar(active, sub, cta)}'
            f'<div style="flex:1;min-width:0">{body}</div></div>')

def page_head(title, sub, right=None):
    r = f'<div style="display:flex;gap:11px">{right}</div>' if right else ""
    return (f'<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;'
            f'margin-bottom:26px"><div>'
            f'<h1 style="font-size:33px;margin-bottom:8px">{title}</h1>'
            f'<div style="font-size:15.5px;color:{C["t2"]};max-width:600px">{sub}</div></div>{r}</div>')


# ================================================================ PANEL AGENTE
ag_rows = "".join(
    trow([
        (f'<span style="font-family:\'Space Grotesk\',sans-serif;font-size:13px;color:{C["t2"]}">{cod}</span>', 1.2),
        (f'<span style="font-weight:600">{cli}</span>', 1.6),
        (evt, 2),
        (f'<span style="color:{C["t2"]}">{fec}</span>', 1.2),
        (f'<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700">{tot}</span>', 1.2),
        (chip(est, tone), 1.3),
    ], last=(i == 4))
    for i, (cod, cli, evt, fec, tot, est, tone) in enumerate([
        ("TF-A9F42B", "Eder Rodriguez", "Festival Cali Vive", "24 Sep", "$198.000", "Confirmada", "ok"),
        ("TF-B3D71E", "Camila Ochoa", "Medellin Music Fest", "10 Oct", "$480.000", "Reservada", "warn"),
        ("TF-C88104", "Juan D. Vera", "Clasico Vallecaucano", "2 Oct", "$90.000", "Confirmada", "ok"),
        ("TF-D22990", "Laura Pena", "Festival de Jazz", "17 Oct", "$65.000", "Cancelada", "err"),
        ("TF-E5A183", "Andres Mora", "Carnaval Barranquilla", "7 Nov", "$100.000", "Confirmada", "ok"),
    ]))

S["PanelAgente"] = page(shell("Ventas", "Perfil de agente", f"""
<div style="padding:40px 44px 56px">
  {page_head("Ventas", "Reservas de tus eventos activos &middot; comision del 8% sobre el valor final.",
             btn("Exportar CSV", "outline", I["down"](15)) + btn("Nueva venta", "primary", I["plus"](15)))}
  <div style="display:flex;gap:15px;margin-bottom:26px">
    {kpi("Clientes", "24.5K", "12% vs mes anterior", True, I["users"](17), C["indigo"])}
    {kpi("Reservas", "89.2K", "18% vs mes anterior", True, I["ticket"](17), C["blue"])}
    {kpi("Ingresos", "$1.2M", "22% vs mes anterior", True, I["money"](17), "#7C6BFF")}
    {kpi("Comision", "$99M", "15% vs mes anterior", True, I["trophy"](17), "#0EA5E9")}
  </div>
  <div style="background:#fff;border:1px solid {C['line']};border-radius:16px;overflow:hidden;
    box-shadow:{SH['sm']}">
    {thead([("Codigo", 1.2), ("Cliente", 1.6), ("Evento", 2), ("Fecha", 1.2), ("Total", 1.2), ("Estado", 1.3)])}
    {ag_rows}
  </div>
</div>
"""), 1440, 900)


# ================================================================ CREAR EVENTO
def form_card(num, title, inner):
    return card(
        f'<div style="display:flex;flex-direction:column;gap:17px">'
        f'<div style="display:flex;align-items:center;gap:11px">'
        f'<span style="width:30px;height:30px;border-radius:9px;background:{C["indigo50"]};color:{C["indigo"]};'
        f'display:flex;align-items:center;justify-content:center;font-family:\'Space Grotesk\',sans-serif;'
        f'font-size:13px;font-weight:700">{num}</span>'
        f'<h3 style="font-size:17.5px">{title}</h3></div>{inner}</div>', 24)

preview = card(
    f'<div style="display:flex;flex-direction:column;gap:13px">'
    f'<h4 style="font-size:15px">Vista previa del catalogo</h4>'
    f'<div style="border:1px solid {C["line"]};border-radius:14px;overflow:hidden">'
    f'<div style="height:132px;background:{C["soft"]};display:flex;align-items:center;justify-content:center;'
    f'color:{C["muted"]}">{I["img"](30)}</div>'
    f'<div style="padding:15px;display:flex;flex-direction:column;gap:8px">'
    f'<div style="align-self:flex-start">{chip_solid("CATEGORIA", C["muted"])}</div>'
    f'<div style="font-family:\'Space Grotesk\',sans-serif;font-size:15px;font-weight:700;color:{C["muted"]}">'
    f'Nombre del evento</div>'
    f'<div style="font-size:12.5px;color:{C["muted"]}">Descripcion breve del evento</div>'
    f'<div style="display:flex;align-items:center;justify-content:space-between;padding-top:9px;'
    f'border-top:1px solid {C["line"]}">'
    f'<span style="font-family:\'Space Grotesk\',sans-serif;font-size:17px;font-weight:700;color:{C["muted"]}">$0</span>'
    f'<span style="font-size:11px;color:{C["muted"]}">Precio final</span></div></div></div>'
    f'<div style="font-size:12.5px;color:{C["t2"]};line-height:1.5">'
    f'Asi vera tu evento la gente en el catalogo. Se actualiza mientras completas el formulario.</div>'
    f'</div>', 20)

estado_card = card(
    f'<div style="display:flex;flex-direction:column;gap:11px">'
    f'<h4 style="font-size:15px">Estado inicial</h4>'
    f'<div style="align-self:flex-start">{chip("Programado", "warn", I["clock"](13))}</div>'
    f'<div style="font-size:13px;color:{C["t2"]};line-height:1.55">'
    f'Podras cambiarlo a En boleteria, En vivo, Finalizado o Cancelado desde el panel.</div></div>', 20)

S["CrearEvento"] = page(shell("Eventos", "Perfil de agente", f"""
<div style="padding:40px 44px 56px">
  {page_head("Crear nuevo evento", "Completa los detalles para publicar tu evento en el catalogo.")}
  <div style="display:flex;gap:26px;align-items:flex-start">
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:19px">
      {form_card("1", "Informacion basica", f'''
        <div style="display:flex;gap:15px">{field("Nombre del evento", "Ej: Concierto de jazz en vivo")}
        {field("Categoria", "Conciertos", val=True)}</div>
        {field("Descripcion breve", "Describe de que trata el evento...")}
        <div style="display:flex;flex-direction:column;gap:7px">
          <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
            color:{C["t2"]}">Imagen de portada</div>
          <div style="border:2px dashed {C["line2"]};border-radius:12px;padding:30px;text-align:center;
            background:{C["bg"]};display:flex;flex-direction:column;align-items:center;gap:9px">
            <span style="color:{C["muted"]}">{I["img"](28)}</span>
            <div style="font-size:14px;font-weight:500">Arrastra una imagen o haz clic para subir</div>
            <div style="font-size:12.5px;color:{C["muted"]}">Recomendado 1200x800px &middot; JPG o PNG</div>
          </div></div>''')}
      {form_card("2", "Lugar y fechas", f'''
        <div style="display:flex;gap:15px">{field("Fecha", "dd/mm/aaaa")}{field("Hora", "--:--")}</div>
        {field("Recinto o lugar", "Ej: Movistar Arena, Bogota")}
        <div style="display:flex;gap:15px">{field("Pais", "Colombia", val=True)}
        {field("Departamento", "Valle del Cauca")}{field("Ciudad", "Cali")}</div>''')}
      {form_card("3", "Capacidad y precios", f'''
        <div style="display:flex;gap:15px">{field("Capacidad total", "Ej: 5000")}
        {field("Precio base COP", "Ej: 85000", hint="Debe ser el precio final, con impuestos incluidos")}</div>''')}
      <div style="display:flex;justify-content:flex-end;gap:13px">
        {btn("Cancelar", "outline", None, "lg")}{btn("Publicar evento", "primary", I["arrow"](16), "lg")}
      </div>
    </div>
    <div style="width:320px;flex-shrink:0;display:flex;flex-direction:column;gap:17px">
      {preview}{estado_card}
    </div>
  </div>
</div>
"""), 1440, 1420)


# ================================================================ RESERVAS POR EVENTO
res_rows = "".join(
    trow([
        (f'<span style="font-family:\'Space Grotesk\',sans-serif;font-size:13px;color:{C["t2"]}">{cod}</span>', 1.2),
        (f'<span style="font-weight:600">{cli}</span>', 1.6),
        (f'<span style="color:{C["t2"]}">{fec}</span>', 1.4),
        (f'<span style="color:{C["t2"]}">{zona}</span>', 1.4),
        (f'<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700">{tot}</span>', 1.2),
        (chip(est, tone), 1.3),
    ], last=(i == 5))
    for i, (cod, cli, fec, zona, tot, est, tone) in enumerate([
        ("TF-A9F42B", "Eder Rodriguez", "21 Sep 14:22", "Platea x2", "$198.000", "Confirmada", "ok"),
        ("TF-B3D71E", "Camila Ochoa", "21 Sep 15:08", "Palco VIP x4", "$720.000", "Reservada", "warn"),
        ("TF-C88104", "Juan D. Vera", "20 Sep 09:41", "Tribuna x2", "$90.000", "Confirmada", "ok"),
        ("TF-D22990", "Laura Pena", "19 Sep 22:15", "Platea x1", "$99.000", "Cancelada", "err"),
        ("TF-E5A183", "Andres Mora", "19 Sep 20:04", "Palco VIP x2", "$360.000", "Confirmada", "ok"),
        ("TF-F71230", "Sofia Rios", "18 Sep 12:33", "Tribuna x6", "$270.000", "Reservada", "warn"),
    ]))

filtros = "".join(
    f'<span style="padding:9px 16px;border-radius:999px;font-size:13.5px;'
    f'{"background:"+C["grad"]+";color:#fff;font-weight:600" if on else "background:#fff;border:1px solid "+C["line2"]+";color:"+C["t2"]}">{t}</span>'
    for t, on in [("Todas", True), ("Reservadas", False), ("Confirmadas", False), ("Canceladas", False)])

S["ReservasEvento"] = page(shell("Eventos", "Perfil de agente", f"""
<div style="padding:40px 44px 56px">
  <a href="#" style="display:inline-flex;align-items:center;gap:7px;font-size:14px;color:{C['t2']};
    margin-bottom:16px">{I["back"](15)}Volver a mis eventos</a>
  <div style="display:flex;align-items:center;gap:18px;margin-bottom:26px">
    <img src="festival-noche.jpg" style="width:76px;height:76px;border-radius:14px;object-fit:cover;
      flex-shrink:0;display:block">
    <div style="flex:1">
      <div style="display:flex;align-items:center;gap:11px;margin-bottom:7px">
        <h1 style="font-size:29px">Festival de Musica Cali Vive</h1>
        {chip("En boleteria", "ok", I["check"](13))}</div>
      <div style="display:flex;gap:20px;color:{C['t2']};font-size:14px">
        <span style="display:flex;align-items:center;gap:6px">{I["pin"](14)}Cali, Valle del Cauca</span>
        <span style="display:flex;align-items:center;gap:6px">{I["cal"](14)}24 Sep 2026 &middot; 7:00 PM</span>
      </div>
    </div>
    {btn("Exportar CSV", "outline", I["down"](15))}
  </div>
  <div style="display:flex;gap:15px;margin-bottom:24px">
    {kpi("Cupo ocupado", "1.152", "76,8% de 1.500", True, I["users"](17), C["indigo"])}
    {kpi("Confirmadas", "984", "pagadas", True, I["check"](17), C["blue"])}
    {kpi("Reservadas", "168", "pendientes de pago", True, I["clock"](17), "#7C6BFF")}
    {kpi("Canceladas", "36", "3,1% del total", False, I["warn"](17), "#0EA5E9")}
  </div>
  <div style="display:flex;align-items:center;gap:11px;margin-bottom:18px">{filtros}</div>
  <div style="background:#fff;border:1px solid {C['line']};border-radius:16px;overflow:hidden;
    box-shadow:{SH['sm']}">
    {thead([("Codigo", 1.2), ("Cliente", 1.6), ("Fecha reserva", 1.4), ("Zona", 1.4), ("Total", 1.2), ("Estado", 1.3)])}
    {res_rows}
  </div>
</div>
"""), 1440, 1080)


# ================================================================ DASHBOARD ADMIN
meses = [("Ene", 42), ("Feb", 58), ("Mar", 71), ("Abr", 65), ("May", 88), ("Jun", 100)]
chart = "".join(
    f'<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:9px;justify-content:flex-end">'
    f'<div style="width:100%;height:{int(v * 1.85)}px;background:{C["grad"]};border-radius:7px 7px 0 0"></div>'
    f'<div style="font-size:12.5px;color:{C["t2"]}">{m}</div></div>'
    for m, v in meses)

cats_dist = "".join(
    f'<div style="display:flex;flex-direction:column;gap:7px">'
    f'<div style="display:flex;justify-content:space-between;font-size:14px">'
    f'<span>{n}</span><span style="font-weight:600">{p}%</span></div>{bar(p, col)}</div>'
    for n, p, col in [("Conciertos", 45, C["indigo"]), ("Teatro", 30, "#7C6BFF"),
                      ("Deportes", 15, C["blue"]), ("Familia", 10, "#0EA5E9")])

top_agentes = "".join(
    f'<div style="display:flex;align-items:center;gap:13px;padding:13px 0;'
    f'{"border-bottom:1px solid " + C["line"] if i < 4 else ""}">'
    f'<span style="width:26px;height:26px;border-radius:999px;background:{C["indigo50"]};color:{C["indigo"]};'
    f'display:flex;align-items:center;justify-content:center;font-family:\'Space Grotesk\',sans-serif;'
    f'font-size:12px;font-weight:700;flex-shrink:0">{i+1}</span>'
    f'<div style="flex:1;min-width:0"><div style="font-size:14.5px;font-weight:600">{n}</div>'
    f'<div style="font-size:12.5px;color:{C["t2"]}">{c}</div></div>'
    f'<div style="text-align:right"><div style="font-family:\'Space Grotesk\',sans-serif;font-size:15px;'
    f'font-weight:700">{t}</div>'
    f'<div style="font-size:11.5px;color:{C["t2"]}">tickets</div></div></div>'
    for i, (n, c, t) in enumerate([("Maria Rodriguez", "Bogota", "4.250"), ("Carlos Gomez", "Medellin", "3.890"),
                                   ("Ana Silva", "Cali", "2.950"), ("Juan Perez", "Barranquilla", "2.100"),
                                   ("Laura Martinez", "Bogota", "1.850")]))

cobertura = "".join(
    f'<div style="display:flex;flex-direction:column;gap:7px">'
    f'<div style="display:flex;justify-content:space-between;font-size:14px">'
    f'<span style="font-weight:500">{n}</span><span style="color:{C["t2"]}">{p}%</span></div>{bar(p)}</div>'
    for n, p in [("Bogota D.C.", 45), ("Medellin", 25), ("Cali", 15), ("Barranquilla", 10), ("Otras", 5)])

S["DashboardAdmin"] = page(shell("Dashboard", "Administrador", f"""
<div style="padding:40px 44px 56px">
  {page_head("Vision general", "Metricas de rendimiento y actividad reciente del sistema.",
             btn("Este mes", "outline", I["cal"](15)) + btn("Exportar", "primary", I["down"](15)))}
  <div style="display:flex;gap:15px;margin-bottom:24px">
    {kpi("Clientes", "24.5K", "12%", True, I["users"](17), C["indigo"])}
    {kpi("Agentes", "342", "5%", True, I["shield"](17), C["blue"])}
    {kpi("Admins", "12", "sin cambios", True, I["gear"](17), "#7C6BFF")}
    {kpi("Eventos", "1.204", "18%", True, I["cal"](17), "#0EA5E9")}
    {kpi("Reservas", "89.2K", "3%", False, I["ticket"](17), C["indigo"])}
  </div>
  <div style="display:flex;gap:20px;margin-bottom:20px;align-items:stretch">
    <div style="flex:1.5">{card(f'''
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px">
        <div><h3 style="font-size:18px;margin-bottom:5px">Recaudo mensual</h3>
          <div style="font-size:13.5px;color:{C["t2"]}">2026 &middot; millones COP</div></div>
        {chip("$8.420M total", "ok", I["up"](13))}</div>
      <div style="display:flex;gap:16px;align-items:flex-end;height:200px">{chart}</div>''', 24)}</div>
    <div style="width:360px;flex-shrink:0">{card(f'''
      <h3 style="font-size:18px;margin-bottom:20px">Distribucion por categoria</h3>
      <div style="display:flex;flex-direction:column;gap:15px">{cats_dist}</div>''', 24)}</div>
  </div>
  <div style="display:flex;gap:20px;align-items:stretch">
    <div style="flex:1">{card(f'''
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="color:{C["indigo"]}">{I["trophy"](18)}</span>
        <h3 style="font-size:18px">Top 5 agentes</h3></div>
      {top_agentes}''', 24)}</div>
    <div style="flex:1">{card(f'''
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
        <span style="color:{C["indigo"]}">{I["globe"](18)}</span>
        <h3 style="font-size:18px">Cobertura geografica</h3></div>
      <div style="display:flex;flex-direction:column;gap:15px">{cobertura}</div>''', 24)}</div>
  </div>
</div>
"""), 1440, 1180)


# ================================================================ REPORTES ADMIN
rep_tabs = "".join(
    f'<div style="padding:11px 3px;font-size:14.5px;'
    f'{"color:"+C["indigo"]+";font-weight:600;border-bottom:2px solid "+C["indigo"] if on else "color:"+C["t2"]+";border-bottom:2px solid transparent"}">{t}</div>'
    for t, on in [("Comerciales", True), ("Cobertura", False), ("Operacion", False), ("Cancelaciones", False)])

ingresos_bars = "".join(
    f'<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;justify-content:flex-end">'
    f'<div style="width:100%;height:{int(v * 1.35)}px;background:{col};border-radius:6px 6px 0 0"></div>'
    f'<div style="font-size:12px;color:{C["t2"]}">{m}</div></div>'
    for m, v, col in [("Ene", 40, C["line2"]), ("Feb", 52, C["line2"]), ("Mar", 68, "#A8A3FF"),
                      ("Abr", 61, "#A8A3FF"), ("May", 84, C["indigo"]), ("Jun", 100, C["indigo"])])

rendimiento = "".join(
    f'<div style="display:flex;flex-direction:column;gap:7px">'
    f'<div style="display:flex;justify-content:space-between;font-size:14px">'
    f'<span>{n}</span><span style="font-weight:600">{p}%</span></div>{bar(p, col)}</div>'
    for n, p, col in [("Conciertos", 45, C["indigo"]), ("Teatro", 30, "#7C6BFF"),
                      ("Deportes", 15, C["blue"]), ("Familia", 10, "#0EA5E9")])

causas = "".join(
    f'<div style="display:flex;flex-direction:column;gap:7px">'
    f'<div style="display:flex;justify-content:space-between;font-size:14px">'
    f'<span>{n}</span><span style="font-weight:600">{p}%</span></div>{bar(p, col)}</div>'
    for n, p, col in [("Cliente no puede asistir", 52, C["err"]), ("Cambio de fecha del evento", 18, C["warn"]),
                      ("Error en la reserva", 12, C["blue"]), ("Fallo en el pago", 10, C["muted"]),
                      ("Cancelado por organizador", 8, "#7C6BFF")])

def rep_card(title, sub, inner):
    return card(
        f'<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px">'
        f'<div><h3 style="font-size:18px;margin-bottom:5px">{title}</h3>'
        f'<div style="font-size:13.5px;color:{C["t2"]}">{sub}</div></div>'
        f'<span style="color:{C["muted"]}">{I["down"](16)}</span></div>{inner}', 24)

S["ReportesAdmin"] = page(shell("Reportes", "Administrador", f"""
<div style="padding:40px 44px 56px">
  {page_head("Reportes analiticos",
             "Metricas detalladas de rendimiento, ventas y operacion para la toma de decisiones.",
             btn("Ultimos 30 dias", "outline", I["cal"](15)))}
  <div style="display:flex;gap:30px;border-bottom:1px solid {C['line']};margin-bottom:26px">{rep_tabs}</div>
  <div style="display:flex;flex-direction:column;gap:20px">
    <div style="display:flex;gap:20px;align-items:stretch">
      <div style="flex:1">{rep_card("Ingresos generales", "Ventas acumuladas por mes", f'''
        <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:22px">
          <span style="font-family:'Space Grotesk',sans-serif;font-size:34px;font-weight:700">$124.5M</span>
          {chip("12%", "ok", I["up"](12))}</div>
        <div style="display:flex;gap:13px;align-items:flex-end;height:150px">{ingresos_bars}</div>''')}</div>
      <div style="flex:1">{rep_card("Rendimiento por categoria", "Distribucion de boletos vendidos", f'''
        <div style="display:flex;flex-direction:column;gap:15px">{rendimiento}</div>
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid {C["line"]};
          font-size:13px;color:{C["t2"]}">Total: 89.240 boletos vendidos en el periodo</div>''')}</div>
    </div>
    <div style="display:flex;gap:20px;align-items:stretch">
      <div style="flex:1">{rep_card("Tasa de conversion", "Visitantes vs compras finalizadas", f'''
        <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:20px">
          <span style="font-family:'Space Grotesk',sans-serif;font-size:34px;font-weight:700">8.4%</span>
          {chip("0.5%", "err", I["dn"](12))}</div>
        <div style="display:flex;flex-direction:column;gap:14px">
          ''' + "".join(
            f'<div style="display:flex;flex-direction:column;gap:6px">'
            f'<div style="display:flex;justify-content:space-between;font-size:13.5px">'
            f'<span style="color:{C["t2"]}">{n}</span>'
            f'<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700">{v}</span></div>{bar(p)}</div>'
            for n, v, p in [("Visitantes", "1.062.400", 100), ("Vieron un evento", "412.800", 39),
                            ("Iniciaron compra", "148.100", 14), ("Compra finalizada", "89.240", 8)]) + '''
        </div>''')}</div>
      <div style="flex:1">{rep_card("Reservas canceladas por causa", "1.284 cancelaciones en 2026", f'''
        <div style="display:flex;flex-direction:column;gap:15px">{causas}</div>''')}</div>
    </div>
  </div>
</div>
"""), 1440, 1240)
