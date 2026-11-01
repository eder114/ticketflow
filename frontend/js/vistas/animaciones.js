// Vista: las animaciones de toda la aplicación.
//
// Los efectos vienen del catálogo de React Bits (reactbits.dev), pero ahí son
// componentes de React con framer-motion, y este frontend es JavaScript puro
// sin compilador, así que están reescritos a mano: el movimiento es el mismo y
// no se toca ningún color ni ninguna librería. El CSS que acompaña a este
// archivo es assets/css/animaciones.css.
//
// Lo que hace, en orden:
//   1. marca los elementos de cada pantalla y los deja esperando;
//   2. un IntersectionObserver los suelta cuando asoman en la pantalla;
//   3. las cifras cuentan hasta su valor y las gráficas se dibujan solas;
//   4. el puntero inclina las tarjetas, ilumina su borde y mueve los botones;
//   5. cada clic deja unas chispas.
//
// Si el sistema pide menos movimiento, nada de esto se enciende y la página
// se ve quieta y completa.
var AnimacionesVista = (function () {
  "use strict";

  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Qué se anima en cada pantalla. "paso" es el retardo que se le suma a cada
  // hermano para que entren en fila, como el Animated List de React Bits.
  var REGLAS = [
    // Inicio. El hero no está aquí: su entrada la lleva anime.js, en
    // js/vistas/efectos.js, como una sola línea de tiempo.
    { sel: ".categoria",               efecto: "escala", paso: 70 },
    { sel: ".tarjeta-acceso",          efecto: "escala", paso: 90 },
    { sel: ".paso",                    efecto: "subir",  paso: 80 },
    { sel: "section > .contenedor > h2", efecto: "subir" },

    // Catálogo y detalle
    { sel: ".rejilla-eventos > .evento", efecto: "escala", paso: 55 },
    { sel: ".recomendado",             efecto: "escala", paso: 60 },
    { sel: ".filtros, .catalogo-cabeza", efecto: "aparecer" },

    // Paneles
    { sel: ".kpi",                     efecto: "escala", paso: 70 },
    { sel: ".panel-caja, .tarjeta-panel, .grafica-caja", efecto: "subir", paso: 80 },
    { sel: ".proximo",                 efecto: "escala" },
    { sel: ".actividad li",            efecto: "lado",  paso: 45 },
    { sel: ".tabla tbody tr",          efecto: "lado",  paso: 28 },
    { sel: ".ocupacion-fila",          efecto: "lado",  paso: 45 },

    // Formularios y compra
    { sel: ".tarjeta-form, .compra-caja, .confirmacion-caja", efecto: "escala" },
    { sel: ".resumen-fila",            efecto: "lado",  paso: 50 }
  ];

  // Tarjetas que se inclinan y se iluminan con el puntero. Las categorías
  // quedan fuera a propósito: ya tienen su propia rayita en ::after y el
  // brillo se la taparía.
  var TARJETAS = ".evento, .kpi, .tarjeta-acceso, .recomendado, .proximo";

  var observador = null;

  // --------------------------------------------------------- 1. preparar --

  function preparar(raiz) {
    if (quieto) return;
    var zona = raiz || document;

    REGLAS.forEach(function (regla) {
      var elementos = zona.querySelectorAll(regla.sel);
      var vistos = 0;

      elementos.forEach(function (elemento) {
        if (elemento.dataset.an) return;        // ya estaba marcado
        elemento.dataset.an = "1";

        elemento.classList.add("an-oculto");
        if (regla.efecto !== "subir") elemento.classList.add("an-efecto-" + regla.efecto);

        if (regla.paso) {
          elemento.style.setProperty("--an-retardo", (vistos * regla.paso) / 1000 + "s");
          vistos += 1;
          if (vistos > 12) vistos = 12;         // que nadie espere demasiado
        }
        mirar(elemento);
      });
    });

    zona.querySelectorAll(TARJETAS).forEach(function (tarjeta) {
      tarjeta.classList.add("an-foco", "an-inclinar");
    });

    zona.querySelectorAll(".btn-primario, .btn-secundario").forEach(function (boton) {
      boton.classList.add("an-iman");
    });

    // Las gráficas se dibujan cuando se ven, no al pintarse.
    zona.querySelectorAll(".grafica").forEach(function (svg) {
      if (svg.dataset.an) return;
      svg.dataset.an = "1";
      mirar(svg);
    });

    partirTitulo(zona);
  }

  // --------------------------------- 2. soltar cuando asoma en pantalla --

  function mirar(elemento) {
    if (!window.IntersectionObserver) { soltar(elemento); return; }

    if (!observador) {
      observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          observador.unobserve(entrada.target);
          soltar(entrada.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    }
    observador.observe(elemento);
  }

  function soltar(elemento) {
    elemento.classList.remove("an-oculto");
    elemento.classList.add("an-visible");

    // Al terminar hay que quitar la clase: una animación con "both" se queda
    // mandando sobre el transform del elemento y dejaría sin efecto la
    // inclinación del puntero y los :hover de siempre.
    elemento.addEventListener("animationend", function limpiar(evento) {
      if (evento.target !== elemento) return;
      elemento.removeEventListener("animationend", limpiar);
      elemento.classList.remove("an-visible", "an-efecto-aparecer",
                                "an-efecto-escala", "an-efecto-lado");
      elemento.style.removeProperty("--an-retardo");
    });

    if (elemento.classList.contains("grafica")) dibujarGrafica(elemento);
    contarCifras(elemento);
  }

  // Red de seguridad: si algo quedó marcado y nunca asomó (una pestaña en
  // segundo plano, un contenedor con scroll propio), se muestra igual.
  function rescatar() {
    document.querySelectorAll(".an-oculto").forEach(function (elemento) {
      var caja = elemento.getBoundingClientRect();
      if (caja.top < window.innerHeight * 1.4) soltar(elemento);
    });
  }

  // ------------------------------------------------------- Count Up --
  // Las cifras de los paneles cuentan hasta su valor sin perder su formato:
  // se respeta lo que tienen antes y después del número ("$ 1.250.000").

  var NUMERO = /(\d[\d.,]*)/;

  function contarCifras(raiz) {
    var cajas = [];
    if (raiz.matches && raiz.matches(".kpi-valor, .hero-dato strong")) cajas.push(raiz);
    raiz.querySelectorAll(".kpi-valor, .hero-dato strong").forEach(function (c) { cajas.push(c); });

    cajas.forEach(function (caja) {
      if (caja.dataset.anCuenta) return;
      caja.dataset.anCuenta = "1";

      var texto = caja.textContent;
      var encontrado = NUMERO.exec(texto);
      if (!encontrado) return;

      var crudo = encontrado[1];
      var decimales = /,\d+$/.test(crudo) ? crudo.split(",")[1].length : 0;
      var destino = parseFloat(crudo.replace(/\./g, "").replace(",", "."));
      if (!isFinite(destino) || destino === 0) return;

      var antes = texto.slice(0, encontrado.index);
      var despues = texto.slice(encontrado.index + crudo.length);
      caja.classList.add("an-contando");

      contar(caja, destino, decimales, antes, despues, crudo);
    });
  }

  function contar(caja, destino, decimales, antes, despues, original) {
    var DURACION = 1100;
    var inicio = null;

    function paso(ahora) {
      if (inicio === null) inicio = ahora;
      var avance = Math.min((ahora - inicio) / DURACION, 1);
      var suave = 1 - Math.pow(1 - avance, 3);       // frena al final
      var valor = destino * suave;

      caja.textContent = antes + (avance === 1 ? original : formatear(valor, decimales)) + despues;
      if (avance < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  function formatear(valor, decimales) {
    return valor.toLocaleString("es-CO", {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    });
  }

  // ------------------------------------------------------- Split Text --
  // El título del inicio se parte en palabras para que entren una tras otra.

  function partirTitulo(zona) {
    zona.querySelectorAll(".hero h1").forEach(function (titulo) {
      if (titulo.dataset.anPalabras) return;
      titulo.dataset.anPalabras = "1";

      var palabras = titulo.textContent.split(/(\s+)/);
      titulo.textContent = "";

      var cuenta = 0;
      palabras.forEach(function (palabra) {
        if (!palabra.trim()) { titulo.appendChild(document.createTextNode(palabra)); return; }

        var trozo = document.createElement("span");
        trozo.className = "an-palabra";
        trozo.style.setProperty("--an-retardo", (cuenta * 85) / 1000 + "s");
        trozo.textContent = palabra;
        titulo.appendChild(trozo);
        cuenta += 1;
      });
    });
  }

  // -------------------------------------------------- Scroll Reveal SVG --
  // Las gráficas están hechas a mano con SVG, así que se animan por partes:
  // las barras crecen, la línea se dibuja, los puntos aparecen y la dona da
  // la vuelta.

  function dibujarGrafica(svg) {
    if (svg.dataset.anDibujada) return;
    svg.dataset.anDibujada = "1";

    svg.querySelectorAll(".grafica-guia").forEach(function (guia) {
      guia.classList.add("an-guia");
    });

    // Barras: cada rect crece desde su base, una después de otra.
    svg.querySelectorAll("rect").forEach(function (barra, i) {
      barra.style.setProperty("--an-retardo", (i * 45) / 1000 + "s");
      barra.classList.add("an-barra");
    });

    // Línea: el camino con trazo se dibuja; el área de abajo solo aparece.
    svg.querySelectorAll("path").forEach(function (camino) {
      var trazo = camino.getAttribute("stroke");
      if (!trazo || trazo === "none") { camino.classList.add("an-area"); return; }

      var largo = 0;
      try { largo = camino.getTotalLength(); } catch (error) { largo = 0; }
      if (!largo) return;

      camino.style.setProperty("--an-largo", largo.toFixed(1));
      camino.classList.add("an-trazo");
    });

    // Puntos de la línea.
    svg.querySelectorAll("circle:not([stroke-dasharray]):not(.grafica-aro)").forEach(function (punto, i) {
      punto.style.setProperty("--an-retardo", (0.35 + i * 0.06) + "s");
      punto.classList.add("an-punto");
    });

    // Dona: cada trozo se llena desde cero conservando su sitio en el aro.
    var vuelta = 0;
    svg.querySelectorAll("circle[stroke-dasharray]").forEach(function (trozo, i) {
      var partes = (trozo.getAttribute("stroke-dasharray") || "").split(/[\s,]+/);
      if (partes.length < 2) return;

      var total = parseFloat(partes[0]) + parseFloat(partes[1]);
      if (!isFinite(total) || !trozo.animate) return;
      vuelta = total;

      try {
        trozo.animate(
          [{ strokeDasharray: "0 " + total }, { strokeDasharray: partes[0] + " " + partes[1] }],
          { duration: 760, delay: i * 180, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" }
        );
      } catch (error) { /* si el navegador no sabe animarlo, se queda quieta */ }
    });
    return vuelta;
  }

  // ------------------------------- 4. puntero: inclinar, iluminar, imán --

  function seguirPuntero(evento) {
    var tarjeta = evento.target.closest && evento.target.closest(TARJETAS);
    if (tarjeta) inclinar(tarjeta, evento);

    var boton = evento.target.closest && evento.target.closest(".an-iman");
    if (boton) imantar(boton, evento);
  }

  function inclinar(tarjeta, evento) {
    var caja = tarjeta.getBoundingClientRect();
    var x = (evento.clientX - caja.left) / caja.width;
    var y = (evento.clientY - caja.top) / caja.height;

    tarjeta.style.setProperty("--an-x", (x * 100).toFixed(1) + "%");
    tarjeta.style.setProperty("--an-y", (y * 100).toFixed(1) + "%");
    tarjeta.style.setProperty("--an-ry", ((x - 0.5) * 7).toFixed(2) + "deg");
    tarjeta.style.setProperty("--an-rx", ((0.5 - y) * 7).toFixed(2) + "deg");
  }

  function imantar(boton, evento) {
    var caja = boton.getBoundingClientRect();
    var x = (evento.clientX - caja.left) / caja.width - 0.5;
    var y = (evento.clientY - caja.top) / caja.height - 0.5;

    boton.style.setProperty("--an-mx", (x * 7).toFixed(2) + "px");
    boton.style.setProperty("--an-my", (y * 5).toFixed(2) + "px");
  }

  function soltarPuntero(evento) {
    var salio = evento.target.closest && evento.target.closest(TARJETAS + ", .an-iman");
    if (!salio) return;

    ["--an-rx", "--an-ry", "--an-mx", "--an-my"].forEach(function (variable) {
      salio.style.removeProperty(variable);
    });
  }

  // ------------------------------------------------------- Click Spark --

  var capa = null;

  function chispear(evento) {
    var disparo = evento.target.closest && evento.target.closest(".btn, .categoria, .evento a");
    if (!disparo) return;

    if (!capa) {
      capa = document.createElement("div");
      capa.className = "an-chispas";
      capa.setAttribute("aria-hidden", "true");
      document.body.appendChild(capa);
    }

    var nido = document.createElement("div");
    nido.style.position = "fixed";
    nido.style.left = evento.clientX + "px";
    nido.style.top = evento.clientY + "px";
    // Las chispas toman el color del texto del elemento pulsado, así que no
    // aparece ningún color nuevo en la pantalla.
    nido.style.color = getComputedStyle(disparo).color;

    for (var i = 0; i < 8; i += 1) {
      var chispa = document.createElement("span");
      chispa.className = "an-chispa";
      chispa.style.setProperty("--an-giro", (i * 45) + "deg");
      nido.appendChild(chispa);
    }

    capa.appendChild(nido);
    setTimeout(function () { if (nido.parentNode) nido.parentNode.removeChild(nido); }, 560);
  }

  // ------------------------------------------------------------ arranque --

  function iniciar() {
    if (quieto) return;
    document.documentElement.classList.add("con-animaciones");

    preparar(document);

    // Las pantallas se pintan solas (catálogo, paneles, tablas), así que hay
    // que volver a marcar lo nuevo cada vez que el DOM cambia.
    if (window.MutationObserver) {
      var pendiente = false;
      new MutationObserver(function (cambios) {
        // Las chispas también cambian el DOM; no hay nada que marcar en ellas.
        var propio = cambios.every(function (cambio) {
          return cambio.target.closest && cambio.target.closest(".an-chispas");
        });
        if (propio) return;

        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(function () {
          pendiente = false;
          preparar(document);
          rescatar();
        });
      }).observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener("ticketflow:pantalla", function () {
      requestAnimationFrame(function () { preparar(document); rescatar(); });
    });

    document.addEventListener("pointermove", seguirPuntero, { passive: true });
    document.addEventListener("pointerout", soltarPuntero, { passive: true });
    document.addEventListener("pointerdown", chispear, { passive: true });

    window.addEventListener("load", rescatar);
    setTimeout(rescatar, 1800);
  }

  return {
    iniciar: iniciar,
    preparar: preparar,
    rescatar: rescatar
  };
})();
