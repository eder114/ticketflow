// Vista: la pantalla de gestión de datos del administrador.
//
// Pinta la tabla de personas y las tres listas de la ubicación geográfica.
var GestionVista = (function () {
  "use strict";

  function boton(texto, clase, datos) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn-chico " + clase;
    b.textContent = texto;
    Object.keys(datos).forEach(function (llave) {
      b.dataset[llave] = datos[llave];
    });
    return b;
  }

  // ---------------------------------------------------------- personas --

  function filaDePersona(persona) {
    var fila = document.createElement("tr");
    fila.dataset.persona = persona.identificacion;

    var nombre = document.createElement("th");
    nombre.scope = "row";
    nombre.textContent = persona.nombres + " " + persona.apellidos;
    fila.appendChild(nombre);

    [persona.identificacion, persona.correo, persona.ciudad || "—",
     persona.perfiles.join(", ") || "sin perfil"].forEach(function (texto) {
      var celda = document.createElement("td");
      celda.textContent = texto;
      fila.appendChild(celda);
    });

    var acciones = document.createElement("td");
    acciones.className = "celda-acciones";
    acciones.appendChild(boton("Editar", "btn-secundario", { editarPersona: persona.identificacion }));
    acciones.appendChild(boton("Eliminar", "btn-peligro", { borrarPersona: persona.identificacion }));
    fila.appendChild(acciones);

    return fila;
  }

  // El formulario de edición se abre en una fila debajo de la persona.
  function filaDeEdicion(persona, ciudades) {
    var fila = document.createElement("tr");
    fila.className = "fila-causa";
    fila.dataset.edicionDe = persona.identificacion;
    fila.hidden = true;

    var celda = document.createElement("td");
    celda.colSpan = 6;

    var form = document.createElement("form");
    form.className = "form-simple form-ancho";
    form.dataset.guardarPersona = persona.identificacion;

    function campo(nombre, etiqueta, valor, tipo) {
      var caja = document.createElement("div");
      caja.className = "campo";
      var id = "ge-" + nombre + "-" + persona.identificacion;
      var lab = document.createElement("label");
      lab.setAttribute("for", id);
      lab.textContent = etiqueta;
      var entrada = document.createElement("input");
      entrada.type = tipo || "text";
      entrada.id = id;
      entrada.name = nombre;
      entrada.value = valor === null || valor === undefined ? "" : valor;
      caja.appendChild(lab);
      caja.appendChild(entrada);
      form.appendChild(caja);
      return entrada;
    }

    campo("nombres", "Nombres", persona.nombres).required = true;
    campo("apellidos", "Apellidos", persona.apellidos).required = true;
    campo("correo", "Correo", persona.correo, "email").required = true;
    campo("direccion", "Dirección", persona.direccion);
    campo("telefonos", "Teléfonos (separados por coma)", (persona.telefonos || []).join(", "));

    var cajaCiudad = document.createElement("div");
    cajaCiudad.className = "campo";
    var idCiudad = "ge-ciudad-" + persona.identificacion;
    var etiqueta = document.createElement("label");
    etiqueta.setAttribute("for", idCiudad);
    etiqueta.textContent = "Ciudad";
    var select = document.createElement("select");
    select.id = idCiudad;
    select.name = "id_ciudad";
    ciudades.forEach(function (c) {
      var opcion = document.createElement("option");
      opcion.value = String(c.id_ciudad);
      opcion.textContent = c.ciudad + " · " + c.departamento;
      if (c.id_ciudad === persona.id_ciudad) opcion.selected = true;
      select.appendChild(opcion);
    });
    cajaCiudad.appendChild(etiqueta);
    cajaCiudad.appendChild(select);
    form.appendChild(cajaCiudad);

    var pie = document.createElement("div");
    pie.className = "form-causa-pie";
    var guardar = document.createElement("button");
    guardar.type = "submit";
    guardar.className = "btn btn-primario";
    guardar.textContent = "Guardar cambios";
    var volver = document.createElement("button");
    volver.type = "button";
    volver.className = "btn btn-secundario";
    volver.dataset.cerrarEdicion = persona.identificacion;
    volver.textContent = "Dejarlo como está";
    pie.appendChild(guardar);
    pie.appendChild(volver);
    form.appendChild(pie);

    celda.appendChild(form);
    fila.appendChild(celda);
    return fila;
  }

  function pintarPersonas(personas, ciudades) {
    var cuerpo = document.querySelector("[data-ge-personas]");
    if (!cuerpo) return;

    cuerpo.textContent = "";
    personas.forEach(function (persona) {
      cuerpo.appendChild(filaDePersona(persona));
      cuerpo.appendChild(filaDeEdicion(persona, ciudades));
    });
  }

  function filtrarPersonas(texto) {
    var buscado = CatalogoModelo.llano(texto);
    document.querySelectorAll("[data-ge-personas] [data-persona]").forEach(function (fila) {
      var coincide = !buscado || CatalogoModelo.llano(fila.textContent).indexOf(buscado) !== -1;
      fila.hidden = !coincide;

      var edicion = document.querySelector('[data-edicion-de="' + fila.dataset.persona + '"]');
      if (edicion && !coincide) edicion.hidden = true;
    });
  }

  function mostrarEdicion(identificacion, abierta) {
    var fila = document.querySelector('[data-edicion-de="' + identificacion + '"]');
    if (!fila) return;
    fila.hidden = !abierta;
    if (abierta) fila.querySelector("input").focus();
  }

  // -------------------------------------------------------- ubicación --

  function formularioDeNombre(item, tipo) {
    var form = document.createElement("form");
    form.className = "form-simple";
    form.dataset.renombrarDe = tipo;
    form.dataset.id = String(item.id);
    form.hidden = true;

    var id = "ge-nombre-" + tipo + "-" + item.id;
    var etiqueta = document.createElement("label");
    etiqueta.setAttribute("for", id);
    etiqueta.textContent = "Nuevo nombre";

    var entrada = document.createElement("input");
    entrada.type = "text";
    entrada.id = id;
    entrada.name = "nombre";
    entrada.value = item.nombre;
    entrada.maxLength = 60;
    entrada.required = true;

    var pie = document.createElement("div");
    pie.className = "form-causa-pie";
    var guardar = document.createElement("button");
    guardar.type = "submit";
    guardar.className = "btn btn-chico btn-primario";
    guardar.textContent = "Guardar";
    var volver = document.createElement("button");
    volver.type = "button";
    volver.className = "btn btn-chico btn-secundario";
    volver.dataset.cerrarRenombrar = "";
    volver.textContent = "Cancelar";
    pie.appendChild(guardar);
    pie.appendChild(volver);

    form.appendChild(etiqueta);
    form.appendChild(entrada);
    form.appendChild(pie);
    return form;
  }

  function elemento(item, tipo, nombre, detalle) {
    var li = document.createElement("li");

    var texto = document.createElement("span");
    texto.className = "lista-simple-nombre";
    texto.textContent = detalle ? nombre + " · " + detalle : nombre;

    var acciones = document.createElement("span");
    acciones.className = "lista-simple-acciones";
    acciones.appendChild(boton("Renombrar", "btn-secundario",
      { renombrar: tipo, id: String(item.id) }));
    acciones.appendChild(boton("Eliminar", "btn-peligro",
      { borrarUbicacion: tipo, id: String(item.id) }));

    li.appendChild(texto);
    li.appendChild(acciones);
    li.appendChild(formularioDeNombre(item, tipo));
    return li;
  }

  function mostrarRenombrar(boton, abierto) {
    var li = boton.closest("li");
    if (!li) return;

    li.querySelector("form").hidden = !abierto;
    li.querySelector(".lista-simple-acciones").hidden = abierto;
    if (abierto) li.querySelector("input").focus();
  }

  function pintarLista(selector, items, tipo) {
    var lista = document.querySelector(selector);
    if (!lista) return;

    lista.textContent = "";
    if (!items.length) {
      var vacio = document.createElement("li");
      vacio.className = "lista-simple-vacia";
      vacio.textContent = "Todavía no hay registros.";
      lista.appendChild(vacio);
      return;
    }
    items.forEach(function (item) {
      lista.appendChild(elemento(item, tipo, item.nombre, item.detalle));
    });
  }

  function pintarSelect(selector, items) {
    document.querySelectorAll(selector).forEach(function (select) {
      var elegido = select.value;
      select.textContent = "";
      items.forEach(function (item) {
        var opcion = document.createElement("option");
        opcion.value = String(item.id);
        opcion.textContent = item.detalle ? item.nombre + " · " + item.detalle : item.nombre;
        select.appendChild(opcion);
      });
      if (elegido) select.value = elegido;
    });
  }

  function mensaje(texto, esError) {
    var caja = document.querySelector("[data-ge-mensaje]");
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

  return {
    pintarPersonas: pintarPersonas,
    filtrarPersonas: filtrarPersonas,
    mostrarEdicion: mostrarEdicion,
    mostrarRenombrar: mostrarRenombrar,
    pintarLista: pintarLista,
    pintarSelect: pintarSelect,
    mensaje: mensaje
  };
})();
