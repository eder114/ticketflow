// Controlador: trae el catálogo de la API, lo filtra, lo ordena y lo reparte
// en páginas.
var CatalogoControlador = (function () {
  "use strict";

  var POR_PAGINA = 8;

  var todos = [];      // lo que devolvió la API
  var pagina = 1;
  var cargado = false;

  function form() {
    return document.querySelector("[data-filtros]");
  }

  function filtroActual() {
    var f = form();
    if (!f) return {};

    function valor(nombre) {
      return f.elements[nombre] ? f.elements[nombre].value : "";
    }
    return {
      texto: valor("texto"),
      ciudad: valor("ciudad"),
      categoria: valor("categoria"),
      desde: valor("desde"),
      precio: valor("precio"),
      disponibilidad: valor("disponibilidad")
    };
  }

  // Los eventos que pasan los filtros, ya ordenados. Las reglas están en el
  // modelo; aquí solo se le pasan los valores del formulario.
  function filtrados() {
    return ordenar(CatalogoModelo.filtrar(todos, filtroActual()));
  }

  function ordenar(lista) {
    var campo = document.getElementById("f-orden");
    return CatalogoModelo.ordenar(lista, campo ? campo.value : "fecha");
  }

  function pintar() {
    var lista = filtrados();
    var paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    if (pagina > paginas) pagina = paginas;

    var desde = (pagina - 1) * POR_PAGINA;
    CatalogoVista.pintar(lista.slice(desde, desde + POR_PAGINA));
    CatalogoVista.mostrar(lista);
    CatalogoVista.pintarPaginas(pagina, paginas);
  }

  function volverAEmpezar() {
    pagina = 1;
    pintar();
  }

  // Las tarjetas de categoría de la portada llevan al catálogo ya filtrado.
  function conectarCategorias() {
    document.addEventListener("click", function (e) {
      var tarjeta = e.target.closest("[data-ir-categoria]");
      if (!tarjeta) return;

      var f = form();
      if (f && f.elements.categoria) {
        f.elements.categoria.value = tarjeta.dataset.irCategoria;
        f.elements.categoria.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }

  // Los eventos salen de la base de datos. Si no hay API levantada, la lista
  // se queda vacía y se avisa.
  function cargar() {
    if (cargado || !ApiModelo.hayApi()) return;
    cargado = true;

    ApiModelo.eventos().then(function (eventos) {
      todos = eventos.filter(CatalogoModelo.enCartelera);

      CatalogoVista.pintarCiudades(todos);
      CatalogoVista.pintarTotal(todos.length);
      CatalogoVista.pintarDestacados(ordenar(todos).slice(0, 3));
      CatalogoVista.pintarRecomendados(ordenar(todos).slice(0, 3));
      SelectorControlador.montarTodos();
      pintar();
    }).catch(function () {
      cargado = false;
      CatalogoVista.pintarTotal(0);
      CatalogoVista.mensaje("No se pudo conectar con el servidor. Intenta de nuevo en un momento.");
      CatalogoVista.mostrar([]);
    });
  }

  function iniciar() {
    var f = form();
    if (!f) return;

    conectarCategorias();

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      volverAEmpezar();
    });

    f.addEventListener("change", volverAEmpezar);

    // El campo de texto filtra mientras se escribe.
    f.addEventListener("input", function (e) {
      if (e.target.name === "texto") volverAEmpezar();
    });

    f.addEventListener("reset", function () {
      // El reset del navegador corre después del evento.
      window.setTimeout(function () {
        SelectorControlador.montarTodos();
        volverAEmpezar();
      }, 0);
    });

    var orden = document.getElementById("f-orden");
    if (orden) orden.addEventListener("change", volverAEmpezar);

    var mas = document.querySelector("[data-mas-filtros]");
    var extra = document.getElementById("filtros-extra");
    if (mas && extra) {
      mas.addEventListener("click", function () {
        var abierto = extra.hidden;
        extra.hidden = !abierto;
        mas.setAttribute("aria-expanded", String(abierto));
      });
    }

    var anterior = document.querySelector("[data-cat-anterior]");
    if (anterior) {
      anterior.addEventListener("click", function () {
        pagina = Math.max(1, pagina - 1);
        pintar();
        document.getElementById("titulo-resultados").scrollIntoView({ behavior: "smooth" });
      });
    }

    var siguiente = document.querySelector("[data-cat-siguiente]");
    if (siguiente) {
      siguiente.addEventListener("click", function () {
        pagina = pagina + 1;
        pintar();
        document.getElementById("titulo-resultados").scrollIntoView({ behavior: "smooth" });
      });
    }

    cargar();
  }

  return { iniciar: iniciar };
})();
