// Vista: las piezas que comparten los tres paneles (cliente, organizador y
// administrador): la barra lateral, las tarjetas de cifras de arriba y la
// tarjeta del próximo evento del cliente.
var TableroVista = (function () {
  "use strict";

  // Las iniciales que van en el círculo de la barra lateral.
  function iniciales(nombre) {
    return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map(function (parte) {
      return parte.charAt(0).toUpperCase();
    }).join("");
  }

  function pintarUsuario() {
    var usuario = SesionModelo.usuario();

    document.querySelectorAll("[data-usuario-sesion]").forEach(function (caja) {
      caja.textContent = "";
      if (!usuario) return;

      var circulo = document.createElement("span");
      circulo.className = "tablero-avatar";
      circulo.setAttribute("aria-hidden", "true");
      circulo.textContent = iniciales(usuario.nombre);

      var datos = document.createElement("span");
      datos.className = "tablero-usuario-datos";

      var nombre = document.createElement("span");
      nombre.className = "tablero-usuario-nombre";
      nombre.textContent = usuario.nombre;

      var perfil = document.createElement("span");
      perfil.className = "tablero-usuario-perfil";
      perfil.textContent = perfilEnLetras(usuario.perfil);

      datos.appendChild(nombre);
      datos.appendChild(perfil);
      caja.appendChild(circulo);
      caja.appendChild(datos);
    });
  }

  var NOMBRES = {
    cliente: "Cliente",
    agente: "Organizador",
    administrador: "Administrador"
  };

  function perfilEnLetras(perfil) {
    return NOMBRES[perfil] || perfil;
  }

  // ------------------------------------------------- tarjetas de cifras --

  function tarjeta(dato) {
    var caja = document.createElement("article");
    caja.className = "kpi";

    if (dato.destacada) caja.classList.add("kpi-destacada");

    var icono = document.createElement("span");
    icono.className = "kpi-icono";
    icono.setAttribute("aria-hidden", "true");
    icono.textContent = dato.icono || "•";

    var titulo = document.createElement("p");
    titulo.className = "kpi-titulo";
    titulo.textContent = dato.titulo;

    var valor = document.createElement("p");
    valor.className = "kpi-valor";
    valor.textContent = dato.valor;

    caja.appendChild(icono);
    caja.appendChild(titulo);
    caja.appendChild(valor);

    if (dato.nota) {
      var nota = document.createElement("p");
      nota.className = "kpi-nota";
      nota.textContent = dato.nota;
      caja.appendChild(nota);
    }
    return caja;
  }

  function pintarCifras(selector, datos) {
    var caja = document.querySelector(selector);
    if (!caja) return;

    caja.textContent = "";
    datos.forEach(function (dato) {
      caja.appendChild(tarjeta(dato));
    });
  }

  // -------------------------------------------- próximo evento (cliente) --

  function pintarProximo(selector, reserva) {
    var caja = document.querySelector(selector);
    if (!caja) return;

    caja.textContent = "";

    if (!reserva) {
      var vacio = document.createElement("p");
      vacio.className = "vacio";
      vacio.textContent = "No tienes eventos próximos. Mira el catálogo y aparta tus entradas.";
      caja.appendChild(vacio);
      return;
    }

    var tarjetaEvento = document.createElement("article");
    tarjetaEvento.className = "proximo";

    var foto = document.createElement("div");
    foto.className = "proximo-foto";
    var img = document.createElement("img");
    var categoria = CatalogoModelo.categoriaDe({ nombre: reserva.evento, teatro: reserva.teatro });
    img.src = CatalogoModelo.imagenDe(categoria);
    img.alt = "Imagen de referencia de la categoría " + categoria;
    var nombre = document.createElement("h3");
    nombre.textContent = reserva.evento;
    var chip = document.createElement("span");
    chip.className = "evento-cat";
    chip.textContent = categoria;
    foto.appendChild(img);
    foto.appendChild(chip);
    foto.appendChild(nombre);

    var datos = document.createElement("dl");
    datos.className = "proximo-datos";

    function fila(titulo, valor) {
      var grupo = document.createElement("div");
      var dt = document.createElement("dt");
      dt.textContent = titulo;
      var dd = document.createElement("dd");
      dd.textContent = valor;
      grupo.appendChild(dt);
      grupo.appendChild(dd);
      datos.appendChild(grupo);
    }

    fila("Fecha y hora", FormatoModelo.fechaLarga(reserva.fecha_evento));
    fila("Ubicación", reserva.teatro + ", " + reserva.ciudad);
    fila("Tus entradas", FormatoModelo.numero(reserva.numero_entradas) +
         (Number(reserva.numero_entradas) === 1 ? " entrada" : " entradas") +
         " · " + FormatoModelo.pesos(reserva.valor_total));
    fila("Estado", reserva.estado);

    var acciones = document.createElement("div");
    acciones.className = "proximo-acciones";
    var ver = document.createElement("a");
    ver.href = "#/evento/" + reserva.codigo_evento;
    ver.className = "btn btn-primario btn-bloque";
    ver.textContent = "Ver el evento";
    acciones.appendChild(ver);

    var lado = document.createElement("div");
    lado.className = "proximo-lado";
    lado.appendChild(datos);
    lado.appendChild(acciones);

    tarjetaEvento.appendChild(foto);
    tarjetaEvento.appendChild(lado);
    caja.appendChild(tarjetaEvento);
  }

  // ------------------------------------------------- actividad reciente --
  // Es la misma lista en los tres paneles: qué pasó y cuándo.

  function pintarActividad(selector, items) {
    var caja = document.querySelector(selector);
    if (!caja) return;

    caja.textContent = "";

    if (!items.length) {
      var vacio = document.createElement("p");
      vacio.className = "grafica-vacia";
      vacio.textContent = "Todavía no hay movimientos.";
      caja.appendChild(vacio);
      return;
    }

    var lista = document.createElement("ol");
    lista.className = "actividad";

    items.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "actividad-item";

      var punto = document.createElement("span");
      punto.className = "actividad-punto " + (item.clase || "");
      punto.setAttribute("aria-hidden", "true");

      var cuerpo = document.createElement("div");
      var titulo = document.createElement("p");
      titulo.className = "actividad-titulo";
      titulo.textContent = item.titulo;
      var detalle = document.createElement("p");
      detalle.className = "actividad-detalle";
      detalle.textContent = item.detalle;
      var cuando = document.createElement("p");
      cuando.className = "actividad-cuando";
      cuando.textContent = item.cuando;

      cuerpo.appendChild(titulo);
      cuerpo.appendChild(detalle);
      cuerpo.appendChild(cuando);

      li.appendChild(punto);
      li.appendChild(cuerpo);
      lista.appendChild(li);
    });

    caja.appendChild(lista);
  }

  return {
    pintarUsuario: pintarUsuario,
    perfilEnLetras: perfilEnLetras,
    pintarCifras: pintarCifras,
    pintarProximo: pintarProximo,
    pintarActividad: pintarActividad
  };
})();
