// Vista: las tablas de reportes del administrador.
//
// Todas se pintan igual: se recibe una lista de filas y, para cada una, qué
// celdas lleva. Así cada reporte queda en una línea.
var ReporteVista = (function () {
  "use strict";

  function pintarTabla(cuerpo, filas, celdasDe) {
    if (!cuerpo) return;
    cuerpo.textContent = "";

    if (!filas.length) {
      var fila = document.createElement("tr");
      var celda = document.createElement("td");
      celda.colSpan = 6;
      celda.className = "tabla-vacia";
      celda.textContent = "Todavía no hay datos para este reporte.";
      fila.appendChild(celda);
      cuerpo.appendChild(fila);
      return;
    }

    filas.forEach(function (datos) {
      var fila = document.createElement("tr");
      celdasDe(datos).forEach(function (texto, i) {
        var celda = document.createElement(i === 0 ? "th" : "td");
        if (i === 0) celda.scope = "row";
        celda.textContent = texto;
        fila.appendChild(celda);
      });
      cuerpo.appendChild(fila);
    });
  }

  function pintarTablero(tablero) {
    pintarTabla(document.querySelector("[data-rp-agentes]"), tablero.porAgente, function (f) {
      return [
        f.agente,
        FormatoModelo.numero(f.eventos),
        FormatoModelo.numero(f.reservas_confirmadas),
        FormatoModelo.pesos(f.ingresos),
        FormatoModelo.pesos(f.promedio_por_evento || 0),
        FormatoModelo.pesos(f.comision_estimada || 0)
      ];
    });

    pintarTabla(document.querySelector("[data-rp-clientes]"), tablero.porCliente, function (f) {
      return [
        f.cliente,
        FormatoModelo.numero(f.reservas),
        FormatoModelo.numero(f.entradas),
        FormatoModelo.pesos(f.total_gastado),
        FormatoModelo.pesos(f.promedio_por_reserva || 0),
        FormatoModelo.numero(f.puntos)
      ];
    });

    pintarTabla(document.querySelector("[data-rp-meses]"), tablero.porMes, function (f) {
      return [
        f.nombre_mes,
        FormatoModelo.numero(f.reservas),
        FormatoModelo.numero(f.entradas),
        FormatoModelo.pesos(f.ingresos)
      ];
    });

    pintarTabla(document.querySelector("[data-rp-ubicacion]"), tablero.porUbicacion, function (f) {
      return [
        f.pais,
        f.departamento,
        f.ciudad,
        FormatoModelo.numero(f.eventos),
        FormatoModelo.numero(f.programados),
        FormatoModelo.numero(f.cancelados)
      ];
    });

    pintarTabla(document.querySelector("[data-rp-cancelados]"), tablero.cancelados, function (f) {
      return [
        f.nombre,
        FormatoModelo.fechaCorta(f.fecha_hora_inicio),
        f.ciudad,
        FormatoModelo.numero(f.reservas_afectadas),
        f.causa_cancelacion
      ];
    });
  }

  return {
    pintarTablero: pintarTablero
  };
})();
