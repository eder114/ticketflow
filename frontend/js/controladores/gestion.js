// Controlador: gestión de datos del administrador.
//
// Es el CRUD que pide el enunciado para personas y para la ubicación
// geográfica. Los eventos y las reservas tienen sus propias pantallas.
var GestionControlador = (function () {
  "use strict";

  var ciudades = [];

  // Las tres listas de ubicación se manejan igual; lo único que cambia es el
  // nombre de la llave que usa cada una.
  var UBICACION = {
    paises: { llave: "id_pais", nombre: "El país" },
    departamentos: { llave: "id_departamento", nombre: "El departamento" },
    ciudades: { llave: "id_ciudad", nombre: "La ciudad" }
  };

  function cargar() {
    if (!ApiModelo.hayApi()) {
      GestionVista.mensaje("No hay conexión con el servidor.", true);
      return;
    }

    Promise.all([
      ApiModelo.personas(),
      ApiModelo.ciudades(),
      ApiModelo.paises(),
      ApiModelo.departamentos()
    ]).then(function (respuestas) {
      var personas = respuestas[0];
      ciudades = respuestas[1];
      var paises = respuestas[2];
      var departamentos = respuestas[3];

      GestionVista.pintarPersonas(personas, ciudades);

      var listaPaises = paises.map(function (p) {
        return { id: p.id_pais, nombre: p.nombre, detalle: null };
      });
      var listaDepartamentos = departamentos.map(function (d) {
        return { id: d.id_departamento, nombre: d.nombre, detalle: nombreDePais(paises, d.id_pais) };
      });
      var listaCiudades = ciudades.map(function (c) {
        return { id: c.id_ciudad, nombre: c.ciudad, detalle: c.departamento };
      });

      GestionVista.pintarLista("[data-ge-paises]", listaPaises, "paises");
      GestionVista.pintarLista("[data-ge-departamentos]", listaDepartamentos, "departamentos");
      GestionVista.pintarLista("[data-ge-ciudades]", listaCiudades, "ciudades");

      GestionVista.pintarSelect("[data-ge-select-paises]", listaPaises);
      GestionVista.pintarSelect("[data-ge-select-departamentos]", listaDepartamentos);

      var buscar = document.getElementById("ge-buscar");
      if (buscar && buscar.value) GestionVista.filtrarPersonas(buscar.value);
    }).catch(function (error) {
      GestionVista.mensaje(error.message, true);
    });
  }

  function nombreDePais(paises, id) {
    var pais = paises.filter(function (p) { return p.id_pais === id; })[0];
    return pais ? pais.nombre : "";
  }

  // ---------------------------------------------------------- personas --

  function guardarPersona(form) {
    var identificacion = form.dataset.guardarPersona;
    var telefonos = form.elements.telefonos.value
      .split(",")
      .map(function (t) { return t.trim(); })
      .filter(Boolean);

    GestionVista.mensaje("");

    ApiModelo.actualizarPersona(identificacion, {
      nombres: form.elements.nombres.value.trim(),
      apellidos: form.elements.apellidos.value.trim(),
      correo: form.elements.correo.value.trim(),
      direccion: form.elements.direccion.value.trim() || null,
      id_ciudad: Number(form.elements.id_ciudad.value),
      telefonos: telefonos
    }).then(function (persona) {
      GestionVista.mensaje("Quedaron guardados los datos de " + persona.nombres + " " +
                           persona.apellidos + ".");
      cargar();
    }).catch(function (error) {
      GestionVista.mensaje(primerDetalle(error) || error.message, true);
    });
  }

  // El backend dice cuál campo falló; se muestra ese mensaje, que es más útil
  // que el general.
  function primerDetalle(error) {
    var detalles = error.detalles || {};
    var llaves = Object.keys(detalles);
    return llaves.length ? detalles[llaves[0]] : null;
  }

  function borrarPersona(identificacion) {
    var fila = document.querySelector('[data-persona="' + identificacion + '"]');
    var nombre = fila ? fila.querySelector("th").textContent : identificacion;

    if (!window.confirm("¿Eliminar a " + nombre + "? Se borra también su perfil.")) return;

    GestionVista.mensaje("");
    ApiModelo.eliminarPersona(identificacion).then(function () {
      GestionVista.mensaje("Se eliminó a " + nombre + ".");
      cargar();
    }).catch(function (error) {
      GestionVista.mensaje(error.message, true);
    });
  }

  // --------------------------------------------------------- ubicación --

  function crearUbicacion(form) {
    var tipo = form.dataset.geNuevo;
    var datos = { nombre: form.elements.nombre.value.trim() };

    if (tipo === "departamentos") datos.id_pais = Number(form.elements.id_pais.value);
    if (tipo === "ciudades") datos.id_departamento = Number(form.elements.id_departamento.value);

    // Los desplegables se llenan desde la base; si todavía no hay a quién
    // asignarle el registro, no se manda nada.
    if (tipo === "departamentos" && !datos.id_pais) {
      GestionVista.mensaje("Primero hay que registrar un país.", true);
      return;
    }
    if (tipo === "ciudades" && !datos.id_departamento) {
      GestionVista.mensaje("Primero hay que registrar un departamento.", true);
      return;
    }

    GestionVista.mensaje("");
    ApiModelo.crearUbicacion(tipo, datos).then(function () {
      GestionVista.mensaje("Quedó registrado " + datos.nombre + ".");
      form.reset();
      cargar();
    }).catch(function (error) {
      GestionVista.mensaje(primerDetalle(error) || error.message, true);
    });
  }

  function renombrar(form) {
    var tipo = form.dataset.renombrarDe;
    var id = Number(form.dataset.id);
    var datos = { nombre: form.elements.nombre.value.trim() };

    // Al cambiar el nombre hay que mandar también a quién pertenece.
    if (tipo === "departamentos") datos.id_pais = superiorDe(tipo, id);
    if (tipo === "ciudades") datos.id_departamento = superiorDe(tipo, id);

    GestionVista.mensaje("");
    ApiModelo.actualizarUbicacion(tipo, id, datos).then(function () {
      GestionVista.mensaje("Quedó con el nombre " + datos.nombre + ".");
      cargar();
    }).catch(function (error) {
      GestionVista.mensaje(primerDetalle(error) || error.message, true);
    });
  }

  // De qué país es el departamento, o de qué departamento es la ciudad. Sale
  // de la lista de ciudades, que ya viene con los tres niveles.
  function superiorDe(tipo, id) {
    if (tipo === "ciudades") {
      var ciudad = ciudades.filter(function (c) { return c.id_ciudad === id; })[0];
      return ciudad ? ciudad.id_departamento : null;
    }
    var deLaCiudad = ciudades.filter(function (c) { return c.id_departamento === id; })[0];
    return deLaCiudad ? deLaCiudad.id_pais : null;
  }

  function borrarUbicacion(tipo, id) {
    if (!window.confirm("¿Eliminar este registro?")) return;

    GestionVista.mensaje("");
    ApiModelo.eliminarUbicacion(tipo, id).then(function () {
      GestionVista.mensaje(UBICACION[tipo].nombre + " quedó eliminado.");
      cargar();
    }).catch(function (error) {
      GestionVista.mensaje(error.message, true);
    });
  }

  // ------------------------------------------------------------ enlaces --

  function conectar() {
    document.addEventListener("click", function (e) {
      var editar = e.target.closest("[data-editar-persona]");
      if (editar) { GestionVista.mostrarEdicion(editar.dataset.editarPersona, true); return; }

      var cerrar = e.target.closest("[data-cerrar-edicion]");
      if (cerrar) { GestionVista.mostrarEdicion(cerrar.dataset.cerrarEdicion, false); return; }

      var borrar = e.target.closest("[data-borrar-persona]");
      if (borrar) { borrarPersona(borrar.dataset.borrarPersona); return; }

      var cambiar = e.target.closest("[data-renombrar]");
      if (cambiar) { GestionVista.mostrarRenombrar(cambiar, true); return; }

      var dejarlo = e.target.closest("[data-cerrar-renombrar]");
      if (dejarlo) { GestionVista.mostrarRenombrar(dejarlo, false); return; }

      var quitar = e.target.closest("[data-borrar-ubicacion]");
      if (quitar) borrarUbicacion(quitar.dataset.borrarUbicacion, quitar.dataset.id);
    });

    document.addEventListener("submit", function (e) {
      var nuevo = e.target.closest("[data-ge-nuevo]");
      if (nuevo) { e.preventDefault(); crearUbicacion(nuevo); return; }

      var persona = e.target.closest("[data-guardar-persona]");
      if (persona) { e.preventDefault(); guardarPersona(persona); return; }

      var nombre = e.target.closest("[data-renombrar-de]");
      if (nombre) { e.preventDefault(); renombrar(nombre); }
    });

    var buscar = document.getElementById("ge-buscar");
    if (buscar) {
      buscar.addEventListener("input", function () {
        GestionVista.filtrarPersonas(buscar.value);
      });
    }
  }

  function iniciar() {
    if (!document.querySelector("[data-ge-personas]")) return;

    conectar();
    document.addEventListener("ticketflow:pantalla", function (e) {
      if (e.detail.pantalla === "gestion") {
        GestionVista.mensaje("");
        cargar();
      }
    });
  }

  return { iniciar: iniciar };
})();
