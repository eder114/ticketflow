// Vista: las gráficas de los paneles.
//
// Están dibujadas con SVG hecho a mano, sin ninguna librería: son tres formas
// (barras, línea y dona) y todas reciben los datos ya calculados. Cada gráfica
// sale con su descripción para los lectores de pantalla y, al lado, la misma
// información en texto, porque un dibujo solo no sirve si no se ve.
var GraficaVista = (function () {
  "use strict";

  var SVG = "http://www.w3.org/2000/svg";

  function crear(etiqueta, atributos) {
    var nodo = document.createElementNS(SVG, etiqueta);
    Object.keys(atributos || {}).forEach(function (llave) {
      nodo.setAttribute(llave, atributos[llave]);
    });
    return nodo;
  }

  function lienzo(ancho, alto, descripcion) {
    var svg = crear("svg", {
      viewBox: "0 0 " + ancho + " " + alto,
      class: "grafica",
      role: "img",
      "aria-label": descripcion
    });
    svg.appendChild(crear("title", {})).textContent = descripcion;
    return svg;
  }

  function texto(x, y, contenido, clase, ancla) {
    var nodo = crear("text", {
      x: x, y: y, class: clase || "grafica-etiqueta",
      "text-anchor": ancla || "middle"
    });
    nodo.textContent = contenido;
    return nodo;
  }

  function maximo(valores) {
    var alto = Math.max.apply(null, valores.concat([0]));
    return alto === 0 ? 1 : alto;
  }

  // ------------------------------------------------------------ barras --
  // datos: [{ etiqueta: "octubre", valores: [12, 4] }]
  // series: [{ nombre: "Confirmadas", color: "..." }]

  function barras(datos, series, descripcion) {
    var ANCHO = 640, ALTO = 260;
    var IZQ = 8, DER = 8, ARRIBA = 16, ABAJO = 34;
    var svg = lienzo(ANCHO, ALTO, descripcion);

    var tope = maximo(datos.reduce(function (todos, d) { return todos.concat(d.valores); }, []));
    var utilAlto = ALTO - ARRIBA - ABAJO;

    // Con pocos meses las barras no se estiran de lado a lado: se les deja un
    // ancho cómodo y el grupo queda centrado.
    var util = ANCHO - IZQ - DER;
    var paso = Math.min(util / Math.max(datos.length, 1), 150);
    var margen = IZQ + (util - paso * datos.length) / 2;
    var grosor = Math.min(26, (paso - 14) / series.length);

    // Las tres rayas de fondo ayudan a leer la altura de las barras.
    [0, 0.5, 1].forEach(function (parte) {
      var y = ARRIBA + utilAlto * parte;
      svg.appendChild(crear("line", {
        x1: IZQ, y1: y, x2: ANCHO - DER, y2: y, class: "grafica-guia"
      }));
    });

    datos.forEach(function (dato, i) {
      var centro = margen + paso * i + paso / 2;
      var anchoGrupo = grosor * series.length + 4 * (series.length - 1);

      dato.valores.forEach(function (valor, j) {
        var altura = Math.max((valor / tope) * utilAlto, valor > 0 ? 3 : 0);
        var x = centro - anchoGrupo / 2 + j * (grosor + 4);
        svg.appendChild(crear("rect", {
          x: x, y: ARRIBA + utilAlto - altura,
          width: grosor, height: altura, rx: 5,
          fill: series[j].color
        }));
      });

      svg.appendChild(texto(centro, ALTO - 12, dato.etiqueta));
    });

    return svg;
  }

  // ------------------------------------------------------------- línea --
  // datos: [{ etiqueta: "octubre", valor: 1250000 }]

  function linea(datos, color, descripcion) {
    var ANCHO = 640, ALTO = 260;
    var IZQ = 10, DER = 10, ARRIBA = 18, ABAJO = 34;
    var svg = lienzo(ANCHO, ALTO, descripcion);

    var tope = maximo(datos.map(function (d) { return d.valor; }));
    var utilAlto = ALTO - ARRIBA - ABAJO;
    var paso = datos.length > 1 ? (ANCHO - IZQ - DER) / (datos.length - 1) : 0;

    [0, 0.5, 1].forEach(function (parte) {
      var y = ARRIBA + utilAlto * parte;
      svg.appendChild(crear("line", {
        x1: IZQ, y1: y, x2: ANCHO - DER, y2: y, class: "grafica-guia"
      }));
    });

    var puntos = datos.map(function (dato, i) {
      var x = datos.length > 1 ? IZQ + paso * i : ANCHO / 2;
      var y = ARRIBA + utilAlto - (dato.valor / tope) * utilAlto;
      return { x: x, y: y, dato: dato };
    });

    if (puntos.length) {
      var camino = puntos.map(function (p, i) {
        return (i === 0 ? "M" : "L") + p.x.toFixed(1) + " " + p.y.toFixed(1);
      }).join(" ");

      // El área de abajo es el mismo camino, cerrado contra la base.
      var area = camino + " L" + puntos[puntos.length - 1].x.toFixed(1) + " " +
                 (ARRIBA + utilAlto) + " L" + puntos[0].x.toFixed(1) + " " +
                 (ARRIBA + utilAlto) + " Z";

      svg.appendChild(crear("path", { d: area, fill: color, "fill-opacity": "0.14" }));
      svg.appendChild(crear("path", {
        d: camino, fill: "none", stroke: color, "stroke-width": "3",
        "stroke-linecap": "round", "stroke-linejoin": "round"
      }));

      puntos.forEach(function (p) {
        svg.appendChild(crear("circle", { cx: p.x, cy: p.y, r: 4.5, fill: color }));
        svg.appendChild(texto(p.x, ALTO - 12, p.dato.etiqueta));
      });
    }

    return svg;
  }

  // -------------------------------------------------------------- dona --
  // segmentos: [{ nombre: "Confirmadas", valor: 7, color: "..." }]

  function dona(segmentos, centroArriba, centroAbajo, descripcion) {
    var LADO = 220, R = 82, GROSOR = 26;
    var svg = lienzo(LADO, LADO, descripcion);
    var centro = LADO / 2;

    var total = segmentos.reduce(function (suma, s) { return suma + s.valor; }, 0);
    var vuelta = 2 * Math.PI * R;
    var recorrido = 0;

    svg.appendChild(crear("circle", {
      cx: centro, cy: centro, r: R, fill: "none",
      "stroke-width": GROSOR, class: "grafica-aro"
    }));

    if (total > 0) {
      segmentos.forEach(function (segmento) {
        if (!segmento.valor) return;

        var trozo = (segmento.valor / total) * vuelta;
        svg.appendChild(crear("circle", {
          cx: centro, cy: centro, r: R, fill: "none",
          stroke: segmento.color, "stroke-width": GROSOR,
          "stroke-dasharray": trozo.toFixed(2) + " " + (vuelta - trozo).toFixed(2),
          "stroke-dashoffset": (-recorrido).toFixed(2),
          transform: "rotate(-90 " + centro + " " + centro + ")"
        }));
        recorrido += trozo;
      });
    }

    svg.appendChild(texto(centro, centro - 2, centroArriba, "grafica-centro"));
    svg.appendChild(texto(centro, centro + 20, centroAbajo, "grafica-centro-nota"));
    return svg;
  }

  // ------------------------------------------------------------ leyenda --

  function leyenda(items) {
    var lista = document.createElement("ul");
    lista.className = "grafica-leyenda";

    items.forEach(function (item) {
      var li = document.createElement("li");

      var punto = document.createElement("span");
      punto.className = "grafica-punto";
      punto.style.background = item.color;
      punto.setAttribute("aria-hidden", "true");

      var nombre = document.createElement("span");
      nombre.className = "grafica-leyenda-nombre";
      nombre.textContent = item.nombre;

      var valor = document.createElement("span");
      valor.className = "grafica-leyenda-valor";
      valor.textContent = item.texto;

      li.appendChild(punto);
      li.appendChild(nombre);
      li.appendChild(valor);
      lista.appendChild(li);
    });

    return lista;
  }

  // Deja la gráfica y su leyenda dentro del contenedor que se le pase.
  function pintar(selector, grafica, items) {
    var caja = document.querySelector(selector);
    if (!caja) return;

    caja.textContent = "";
    caja.appendChild(grafica);
    if (items && items.length) caja.appendChild(leyenda(items));
  }

  function vacia(selector, texto) {
    var caja = document.querySelector(selector);
    if (!caja) return;

    caja.textContent = "";
    var aviso = document.createElement("p");
    aviso.className = "grafica-vacia";
    aviso.textContent = texto;
    caja.appendChild(aviso);
  }

  return {
    barras: barras,
    linea: linea,
    dona: dona,
    leyenda: leyenda,
    pintar: pintar,
    vacia: vacia
  };
})();
