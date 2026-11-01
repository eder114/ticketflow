// Vista: los efectos hechos con anime.js (animejs.com).
//
// El proyecto no usa compilador, así que anime.js entra como script normal
// desde un CDN y queda en la variable global "anime" (versión 4.5.0 UMD). Si
// por lo que sea no carga, aquí no se cae nada: cada efecto comprueba antes
// de usarlo y la página se queda igual, solo sin ese movimiento.
//
// Lo que hace anime.js aquí, que es lo que el CSS no hace bien:
//
//   · la entrada del hero, como una sola línea de tiempo coordinada;
//   · las barras de aforo de las tarjetas, que se llenan al verse;
//   · la cinta de eventos que se desliza sin parar bajo el hero;
//   · el latido de la cuenta regresiva cuando cambia el número;
//   · las luces que flotan en el fondo del hero (lienzo propio).
//
// Lo demás —entradas al asomar, tarjetas que se inclinan, gráficas que se
// dibujan— sigue en js/vistas/animaciones.js, que no usa librerías.
var EfectosVista = (function () {
  "use strict";

  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function hayAnime() {
    return typeof window.anime === "object" && typeof window.anime.animate === "function";
  }

  // ------------------------------------------------- entrada del hero --
  // Una sola línea de tiempo para el sello, el párrafo, el buscador y las
  // cifras. El título lo parte en palabras animaciones.js, así que aquí no
  // se toca.

  function entradaDelHero() {
    if (quieto || !hayAnime()) return;

    var hero = document.querySelector("#vista-inicio .hero");
    if (!hero || hero.dataset.efectos) return;
    hero.dataset.efectos = "1";

    var piezas = [
      hero.querySelector(".overline"),
      hero.querySelector("p:not(.overline)"),
      hero.querySelector(".buscador"),
      hero.querySelector(".hero-datos")
    ].filter(Boolean);

    anime.animate(piezas, {
      opacity: [0, 1],
      translateY: [18, 0],
      filter: ["blur(6px)", "blur(0px)"],
      duration: 760,
      delay: anime.stagger(110, { start: 180 }),
      ease: "outQuart"
    });
  }

  // --------------------------------------------------- barras de aforo --
  // Cada barra se llena desde cero cuando la tarjeta entra en pantalla.

  var vigia = null;

  function barrasDeAforo(raiz) {
    var barras = (raiz || document).querySelectorAll(".aforo:not([data-efectos])");

    barras.forEach(function (caja) {
      caja.dataset.efectos = "1";
      var relleno = caja.querySelector(".aforo-relleno");
      if (!relleno) return;

      var hasta = (Number(caja.dataset.libre) || 0) + "%";
      if (quieto || !hayAnime() || !window.IntersectionObserver) {
        relleno.style.width = hasta;
        return;
      }

      relleno.style.width = "0%";
      if (!vigia) {
        vigia = new IntersectionObserver(function (entradas) {
          entradas.forEach(function (entrada) {
            if (!entrada.isIntersecting) return;
            vigia.unobserve(entrada.target);
            llenar(entrada.target);
          });
        }, { threshold: 0.2 });
      }
      vigia.observe(caja);
    });
  }

  function llenar(caja) {
    var relleno = caja.querySelector(".aforo-relleno");
    if (!relleno) return;

    anime.animate(relleno, {
      width: ["0%", (Number(caja.dataset.libre) || 0) + "%"],
      duration: 900,
      ease: "outCubic"
    });
  }

  // ------------------------------------------------- cinta de eventos --
  // La pista tiene la lista dos veces; se corre media pista y vuelve a
  // empezar, así el giro no se nota. Con el puntero encima se detiene para
  // poder leerla.

  var cinta = null;
  var firmaCinta = "";

  function cintaCorriendo() {
    var pista = document.querySelector("[data-cinta-pista]");
    if (!pista || !pista.children.length) return;
    if (quieto || !hayAnime()) return;

    // Solo se vuelve a armar si la lista cambió; si no, la cinta se
    // reiniciaría a cada rato y se vería dando saltos.
    var firma = pista.children.length + ":" + Math.round(pista.scrollWidth);
    if (firma === firmaCinta) return;
    firmaCinta = firma;

    if (cinta) { cinta.cancel(); cinta = null; }
    pista.style.transform = "";

    var mitad = pista.scrollWidth / 2;
    if (mitad < 10) return;

    cinta = anime.animate(pista, {
      translateX: [0, -mitad],
      duration: mitad * 26,          // velocidad pareja, no importa cuántos haya
      ease: "linear",
      loop: true
    });

    var caja = pista.parentNode;
    caja.addEventListener("pointerenter", function () { if (cinta) cinta.pause(); });
    caja.addEventListener("pointerleave", function () { if (cinta) cinta.play(); });
  }

  // --------------------------------------------------- cuenta regresiva --
  // Los chips de "Faltan 23 días" se vuelven a calcular cada medio minuto;
  // cuando el texto cambia, el chip da un saltito.

  function relojes() {
    document.querySelectorAll("[data-cuenta]").forEach(function (chip) {
      var cuenta = FormatoModelo.faltan(chip.dataset.cuenta);
      if (!cuenta) return;

      var texto = "⏳ " + cuenta.texto;
      if (chip.textContent === texto) return;

      chip.textContent = texto;
      chip.classList.remove("urgente", "hoy");
      if (cuenta.urgencia) chip.classList.add(cuenta.urgencia);

      if (quieto || !hayAnime()) return;
      anime.animate(chip, { scale: [1, 1.12, 1], duration: 520, ease: "outBack" });
    });
  }

  // ------------------------------------------------- luces del hero --
  // Puntos de luz que suben despacio por detrás del texto. Está en un canvas
  // propio para no meterle más capas al HTML, y usa los mismos tres colores
  // de la marca que ya estaban en la paleta.

  var COLORES = ["rgba(99,91,255,", "rgba(59,130,246,", "rgba(168,163,255,"];
  var luces = [];
  var lienzo = null;
  var pincel = null;
  var corriendo = false;

  function lucesDelHero() {
    lienzo = document.querySelector("[data-hero-lienzo]");
    if (!lienzo || quieto || corriendo) return;

    pincel = lienzo.getContext && lienzo.getContext("2d");
    if (!pincel) return;

    medir();
    window.addEventListener("resize", medir);

    corriendo = true;
    requestAnimationFrame(pintarLuces);

    // Si la pestaña se va al fondo, el dibujo se detiene solo.
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && corriendo) requestAnimationFrame(pintarLuces);
    });
  }

  function medir() {
    if (!lienzo) return;
    var caja = lienzo.getBoundingClientRect();
    var densidad = Math.min(window.devicePixelRatio || 1, 2);

    lienzo.width = Math.max(Math.round(caja.width * densidad), 1);
    lienzo.height = Math.max(Math.round(caja.height * densidad), 1);
    pincel.setTransform(densidad, 0, 0, densidad, 0, 0);

    var cuantas = caja.width < 640 ? 18 : 34;
    luces = [];
    for (var i = 0; i < cuantas; i += 1) luces.push(nueva(caja, true));
  }

  function nueva(caja, enCualquierParte) {
    return {
      x: Math.random() * caja.width,
      y: enCualquierParte ? Math.random() * caja.height : caja.height + 10,
      r: 1 + Math.random() * 2.6,
      sube: 0.18 + Math.random() * 0.45,
      lado: (Math.random() - 0.5) * 0.25,
      alfa: 0.12 + Math.random() * 0.3,
      color: COLORES[Math.floor(Math.random() * COLORES.length)]
    };
  }

  function pintarLuces() {
    if (!corriendo || !lienzo || document.hidden) return;

    var caja = lienzo.getBoundingClientRect();
    pincel.clearRect(0, 0, caja.width, caja.height);

    luces.forEach(function (luz, i) {
      luz.y -= luz.sube;
      luz.x += luz.lado;
      if (luz.y < -10) luces[i] = nueva(caja, false);

      pincel.beginPath();
      pincel.arc(luz.x, luz.y, luz.r, 0, Math.PI * 2);
      pincel.fillStyle = luz.color + luz.alfa + ")";
      pincel.fill();
    });

    requestAnimationFrame(pintarLuces);
  }

  // ------------------------------------------------------------ arranque --

  function iniciar() {
    entradaDelHero();
    lucesDelHero();
    barrasDeAforo(document);
    relojes();

    // Las tarjetas y la cinta se pintan cuando llega la respuesta de la API,
    // así que hay que volver a mirar cuando el DOM cambia.
    if (window.MutationObserver) {
      var pendiente = false;
      new MutationObserver(function () {
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(function () {
          pendiente = false;
          entradaDelHero();
          barrasDeAforo(document);
          relojes();
          cintaCorriendo();
        });
      }).observe(document.body, { childList: true, subtree: true });
    }

    // Al cambiar de pantalla el hero puede pasar de oculto a visible, y un
    // lienzo medido mientras estaba oculto se queda en cero.
    document.addEventListener("ticketflow:pantalla", function () {
      requestAnimationFrame(function () {
        if (!lienzo) { lucesDelHero(); return; }
        if (lienzo.getBoundingClientRect().width > 0) medir();
      });
    });

    window.setInterval(relojes, 30000);
  }

  return {
    iniciar: iniciar,
    relojes: relojes,
    barrasDeAforo: barrasDeAforo,
    cintaCorriendo: cintaCorriendo
  };
})();
