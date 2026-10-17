// Controlador: trae el catálogo de la API y escucha los filtros
var CatalogoControlador = (function () {
  "use strict";

  var cargado = false;

  function filtroActual(form) {
    return {
      ciudad: form.elements.ciudad ? form.elements.ciudad.value : "",
      categoria: form.elements.categoria ? form.elements.categoria.value : "",
      precio: form.elements.precio ? form.elements.precio.value : "",
      desde: form.elements.desde ? form.elements.desde.value : "",
      texto: form.elements.texto ? form.elements.texto.value : ""
    };
  }

  function aplicar(form) {
    var visibles = CatalogoModelo.filtrar(CatalogoVista.tarjetas(), filtroActual(form));
    CatalogoVista.mostrar(visibles);
  }

  // Las tarjetas de categoría de la portada llevan al catálogo ya filtrado.
  function conectarCategorias(form) {
    document.addEventListener("click", function (e) {
      var tarjeta = e.target.closest("[data-ir-categoria]");
      if (!tarjeta || !form.elements.categoria) return;
      form.elements.categoria.value = tarjeta.dataset.irCategoria;
      form.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  // Los eventos salen de la base de datos. Si no hay API levantada se quedan
  // las tarjetas de ejemplo que ya trae el HTML, que fue como entregamos la
  // maquetación.
  function cargar(form) {
    if (cargado || !ApiModelo.hayApi()) return;
    cargado = true;

    ApiModelo.eventos().then(function (eventos) {
      var cartelera = eventos.filter(CatalogoModelo.enCartelera);
      CatalogoVista.pintar(cartelera);
      CatalogoVista.pintarCiudades(cartelera);
      CatalogoVista.pintarDestacados(cartelera.slice(0, 3));
      aplicar(form);
    }).catch(function () {
      cargado = false;
      CatalogoVista.mensaje("No se pudo conectar con el servidor. Estos son eventos de ejemplo.");
    });
  }

  function iniciar() {
    var form = document.querySelector("[data-filtros]");
    if (!form) return;

    conectarCategorias(form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      aplicar(form);
    });

    // Filtrar al cambiar cualquier campo, sin esperar al botón.
    form.addEventListener("change", function () {
      aplicar(form);
    });

    // El campo de texto filtra mientras se escribe.
    form.addEventListener("input", function (e) {
      if (e.target.name === "texto") aplicar(form);
    });

    form.addEventListener("reset", function () {
      // El reset del navegador corre después del evento.
      window.setTimeout(function () { aplicar(form); }, 0);
    });

    aplicar(form);
    cargar(form);
  }

  return { iniciar: iniciar };
})();
