// Controlador: el panel de reportes del administrador.
//
// El backend devuelve todos los reportes en una sola llamada (`/reportes/
// tablero`), así que la pantalla los pide al abrirse y con eso pinta las
// cifras de arriba, las gráficas y las tablas.
var ReporteControlador = (function () {
  "use strict";

  var COLORES = {
    ingresos: "#635BFF",
    clientes: "#635BFF",
    agentes: "#2170E4",
    administradores: "#555B6D",
    cartelera: "#15803D",
    cancelados: "#B91C1C"
  };

  function aviso(texto, esError) {
    var caja = document.querySelector("[data-rp-mensaje]");
    if (!caja) return;

    if (!texto) {
      caja.hidden = true;
      caja.textContent = "";
      return;
    }
    caja.hidden = false;
    caja.className = esError ? "aviso aviso-error" : "aviso";
    caja.textContent = texto;
  }

  function pintarCifras(resumen) {
    TableroVista.pintarCifras("[data-rp-cifras]", [
      { icono: "👥", titulo: "Usuarios registrados",
        valor: FormatoModelo.numero(resumen.clientes + resumen.agentes + resumen.administradores),
        nota: resumen.clientes + " clientes · " + resumen.agentes + " agentes" },
      { icono: "🎭", titulo: "Eventos publicados", valor: FormatoModelo.numero(resumen.eventos) },
      { icono: "🎟", titulo: "Entradas vendidas",
        valor: FormatoModelo.numero(resumen.entradas_confirmadas),
        nota: resumen.reservas + " reservas en total" },
      { icono: "$", titulo: "Ingresos confirmados",
        valor: FormatoModelo.pesos(resumen.ingresos_confirmados), destacada: true }
    ]);
  }

  // Línea: cómo van los ingresos mes a mes.
  function pintarIngresos(porMes) {
    if (!porMes.length) {
      GraficaVista.vacia("[data-rp-linea]", "Todavía no hay reservas confirmadas en el año.");
      return;
    }

    var datos = porMes.map(function (f) {
      return { etiqueta: f.nombre_mes.slice(0, 3), valor: Number(f.ingresos) };
    });
    var total = datos.reduce(function (suma, d) { return suma + d.valor; }, 0);

    GraficaVista.pintar(
      "[data-rp-linea]",
      GraficaVista.linea(datos, COLORES.ingresos,
        "Ingresos por mes: " + porMes.map(function (f) {
          return f.nombre_mes + ", " + FormatoModelo.pesos(f.ingresos);
        }).join("; ")),
      porMes.map(function (f) {
        return { nombre: f.nombre_mes, color: COLORES.ingresos, texto: FormatoModelo.pesos(f.ingresos) };
      }).concat([{ nombre: "Total del año", color: COLORES.ingresos, texto: FormatoModelo.pesos(total) }])
    );
  }

  // Dona: cuántos usuarios hay de cada tipo.
  function pintarUsuarios(resumen) {
    var segmentos = [
      { nombre: "Clientes", valor: resumen.clientes, color: COLORES.clientes },
      { nombre: "Agentes", valor: resumen.agentes, color: COLORES.agentes },
      { nombre: "Administradores", valor: resumen.administradores, color: COLORES.administradores }
    ];
    var total = resumen.clientes + resumen.agentes + resumen.administradores;

    GraficaVista.pintar(
      "[data-rp-dona]",
      GraficaVista.dona(segmentos, FormatoModelo.numero(total), "TOTAL",
        "Usuarios por tipo: " + segmentos.map(function (s) {
          return s.valor + " " + s.nombre.toLowerCase();
        }).join(", ")),
      segmentos.map(function (s) {
        return { nombre: s.nombre, color: s.color, texto: FormatoModelo.numero(s.valor) };
      })
    );
  }

  // Barras: en cada ciudad, cuántos eventos están en cartelera y cuántos se
  // cancelaron.
  function pintarEstados(porUbicacion) {
    if (!porUbicacion.length) {
      GraficaVista.vacia("[data-rp-estados]", "Todavía no hay eventos registrados.");
      return;
    }

    // Primero las ciudades con más movimiento; en la gráfica caben siete.
    var ciudades = porUbicacion.slice().sort(function (a, b) {
      return Number(b.eventos) - Number(a.eventos);
    }).slice(0, 7);
    var enCartelera = ciudades.reduce(function (s, c) { return s + Number(c.programados); }, 0);
    var cancelados = ciudades.reduce(function (s, c) { return s + Number(c.cancelados); }, 0);

    GraficaVista.pintar(
      "[data-rp-estados]",
      GraficaVista.barras(
        ciudades.map(function (c) {
          return { etiqueta: c.ciudad, valores: [Number(c.programados), Number(c.cancelados)] };
        }),
        [{ nombre: "En cartelera", color: COLORES.cartelera },
         { nombre: "Cancelados", color: COLORES.cancelados }],
        "Eventos por ciudad: " + ciudades.map(function (c) {
          return c.ciudad + ", " + c.programados + " en cartelera y " + c.cancelados + " cancelados";
        }).join("; ")
      ),
      [{ nombre: "En cartelera", color: COLORES.cartelera, texto: FormatoModelo.numero(enCartelera) },
       { nombre: "Cancelados", color: COLORES.cancelados, texto: FormatoModelo.numero(cancelados) }]
    );
  }

  // La lista de la derecha: las últimas reservas que entraron al sistema.
  function pintarUltimas() {
    ApiModelo.reservas().then(function (reservas) {
      var ultimas = reservas.slice().sort(function (a, b) {
        return new Date(b.fecha_hora) - new Date(a.fecha_hora);
      }).slice(0, 6);

      TableroVista.pintarActividad("[data-rp-actividad]", ultimas.map(function (r) {
        var clase = r.estado === "Confirmada" ? "es-confirmada"
                  : r.estado === "Cancelada" ? "es-cancelada" : "";
        return {
          clase: clase,
          titulo: r.cliente + " · " + FormatoModelo.pesos(r.valor_total),
          detalle: r.evento + " · " + r.estado.toLowerCase(),
          cuando: FormatoModelo.fechaCorta(r.fecha_hora)
        };
      }));
    }).catch(function () {
      TableroVista.pintarActividad("[data-rp-actividad]", []);
    });
  }

  function cargar() {
    if (!ApiModelo.hayApi()) {
      aviso("No hay conexión con el servidor, así que no se pueden calcular los reportes.", true);
      return;
    }

    aviso("Consultando la base de datos...");

    ApiModelo.tablero().then(function (tablero) {
      ReporteVista.pintarTablero(tablero);
      pintarCifras(tablero.resumen);
      pintarIngresos(tablero.porMes);
      pintarUsuarios(tablero.resumen);
      pintarEstados(tablero.porUbicacion);
      pintarUltimas();
      aviso("");
    }).catch(function (error) {
      aviso(error.message, true);
    });
  }

  function iniciar() {
    if (!document.querySelector("[data-rp-cifras]")) return;

    document.addEventListener("ticketflow:pantalla", function (e) {
      if (e.detail.pantalla === "panel-admin") cargar();
    });
  }

  return { iniciar: iniciar };
})();
