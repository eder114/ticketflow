// Vista: el cargador de la marca y el chulo de confirmación.
//
// Son las dos animaciones que la gente ya reconoce de otras páginas:
//
//   · mientras la aplicación arranca, el rombo de TicketFlow late dentro de
//     un aro que da vueltas, y se va cuando ya hay algo que mostrar;
//   · cuando una reserva queda hecha, se dibuja un círculo y después el
//     chulo, como en las aplicaciones de pedidos.
//
// El cargador es CSS puro (está en assets/css/animaciones.css) para que se
// vea desde el primer instante, antes de que corra el JavaScript. El chulo lo
// dibuja anime.js si está cargado; si no, se ve completo y quieto, que es lo
// que importa.
var CargaVista = (function () {
  "use strict";

  var SVG = "http://www.w3.org/2000/svg";
  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function hayAnime() {
    return typeof window.anime === "object" && typeof window.anime.animate === "function";
  }

  function crear(etiqueta, atributos) {
    var nodo = document.createElementNS(SVG, etiqueta);
    Object.keys(atributos || {}).forEach(function (llave) {
      nodo.setAttribute(llave, atributos[llave]);
    });
    return nodo;
  }

  // ------------------------------------------------------- el cargador --

  var minimo = Date.now();     // para que no parpadee si todo carga volando

  function listo() {
    var caja = document.querySelector("[data-cargador]");
    if (!caja || caja.hidden) return;

    // Se queda al menos medio segundo: un cargador que aparece y desaparece
    // en dos cuadros se ve peor que no tener ninguno.
    var espera = Math.max(0, 500 - (Date.now() - minimo));

    window.setTimeout(function () {
      caja.classList.add("se-va");
      window.setTimeout(function () { caja.hidden = true; }, 420);
    }, espera);
  }

  // --------------------------------------------------- el chulo que se dibuja --
  // Pinta dentro de la caja que se le pase un círculo y un chulo, y los
  // dibuja en ese orden.

  function chulo(caja) {
    if (!caja) return;
    if (caja.dataset.chulo === "1") return;
    caja.dataset.chulo = "1";

    caja.textContent = "";

    var svg = crear("svg", { viewBox: "0 0 52 52", class: "chulo", "aria-hidden": "true" });
    var aro = crear("circle", { cx: 26, cy: 26, r: 23, class: "chulo-aro" });
    var marca = crear("path", { d: "M15 27.5 L22.5 35 L38 18", class: "chulo-marca" });

    svg.appendChild(aro);
    svg.appendChild(marca);
    caja.appendChild(svg);

    var onda = document.createElement("span");
    onda.className = "chulo-onda";
    caja.appendChild(onda);

    if (quieto || !hayAnime()) return;      // se queda dibujado, sin moverse

    dibujar(aro, 0, 620);
    dibujar(marca, 420, 420);
  }

  function dibujar(trazo, espera, cuanto) {
    var largo;
    try { largo = trazo.getTotalLength(); } catch (error) { return; }
    if (!largo) return;

    trazo.style.strokeDasharray = largo;
    trazo.style.strokeDashoffset = largo;

    anime.animate(trazo, {
      strokeDashoffset: [largo, 0],
      duration: cuanto,
      delay: espera,
      ease: "outQuart"
    });
  }

  // --------------------------------------------------- botones trabajando --
  // Mientras se guarda algo, el botón muestra su propio girito. Se guarda el
  // texto original para poder devolverlo si la cosa falla.

  function boton(nodo, trabajando, texto) {
    if (!nodo) return;

    if (!trabajando) {
      nodo.classList.remove("btn-cargando");
      nodo.disabled = false;
      if (nodo.dataset.textoOriginal) {
        nodo.textContent = nodo.dataset.textoOriginal;
        delete nodo.dataset.textoOriginal;
      }
      return;
    }

    if (!nodo.dataset.textoOriginal) nodo.dataset.textoOriginal = nodo.textContent;

    nodo.classList.add("btn-cargando");
    nodo.disabled = true;
    nodo.textContent = "";

    var girito = document.createElement("span");
    girito.className = "btn-girito";
    girito.setAttribute("aria-hidden", "true");

    nodo.appendChild(girito);
    nodo.appendChild(document.createTextNode(texto || "Guardando…"));
  }

  return {
    listo: listo,
    chulo: chulo,
    boton: boton
  };
})();
