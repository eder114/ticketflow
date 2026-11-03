// Vista: el detalle del evento, el total de la reserva y la tabla de eventos
// del agente.
var EventoVista = (function () {
  "use strict";

  function pesos(valor) {
    return FormatoModelo.pesos(valor);
  }

  function pintarTotal(precioUnitario, cantidad) {
    var destino = document.querySelector("[data-total]");
    if (destino) destino.textContent = pesos(precioUnitario * cantidad);
  }

  // La causa de cancelación solo tiene sentido cuando el estado es Cancelado,
  // y ahí sí es obligatoria: el reporte de eventos cancelados la necesita.
  function alternarCausa(estado) {
    var caja = document.querySelector("[data-campo-causa]");
    if (!caja) return;

    var cancelado = estado === "Cancelado";
    caja.hidden = !cancelado;

    var campo = caja.querySelector("textarea");
    if (!campo) return;
    if (cancelado) {
      campo.dataset.reglas = "requerido";
    } else {
      delete campo.dataset.reglas;
      campo.value = "";
      campo.removeAttribute("aria-invalid");
      var error = caja.querySelector(".error");
      if (error) error.textContent = "";
    }
  }

  function escribir(selector, texto) {
    var destino = document.querySelector(selector);
    if (destino) destino.textContent = texto;
  }

  // Pinta el detalle con lo que vino de la base de datos.
  function pintarDetalle(evento) {
    var categoria = CatalogoModelo.categoriaDe(evento);

    escribir("[data-ev-miga]", evento.nombre);
    escribir("[data-ev-categoria]", categoria);
    escribir("[data-ev-cuando]", FormatoModelo.fechaLarga(evento.fecha_hora_inicio));
    escribir("[data-ev-donde]", evento.ciudad + ", " + evento.departamento);
    escribir("[data-ev-nombre]", evento.nombre);
    escribir("[data-ev-teatro]", evento.teatro);
    escribir("[data-ev-ciudad]", evento.ciudad + ", " + evento.departamento);
    escribir("[data-ev-inicio]", FormatoModelo.fechaLarga(evento.fecha_hora_inicio));
    escribir("[data-ev-fin]", FormatoModelo.fechaLarga(evento.fecha_hora_fin));
    escribir("[data-ev-capacidad]", FormatoModelo.numero(evento.capacidad_total) + " personas");
    escribir("[data-ev-agente]", evento.agente);
    escribir("[data-ev-precio]", pesos(evento.precio_base));
    sincronizarBarra();
    escribir("[data-ev-descripcion]",
             evento.descripcion || "El organizador no dejó una descripción de este evento.");

    var foto = document.querySelector("[data-ev-foto]");
    if (foto) {
      // La que subió el organizador manda; si no subió ninguna, queda la de
      // referencia de la categoría.
      foto.src = evento.imagen || CatalogoModelo.imagenDe(categoria);
      foto.alt = evento.imagen
        ? "Imagen del evento " + evento.nombre
        : "Imagen de referencia de la categoría " + categoria;
    }

    var chip = document.querySelector("[data-ev-estado]");
    if (chip) {
      chip.className = "estado-chip " + FormatoModelo.claseDeEstado(evento.estado);
      chip.textContent = FormatoModelo.textoDeEstado(evento.estado);
    }

    var cupos = document.querySelector("[data-ev-cupos]");
    if (cupos) {
      cupos.textContent = Number(evento.cupos_disponibles) > 0
        ? "Quedan " + FormatoModelo.numero(evento.cupos_disponibles) +
          " cupos de " + FormatoModelo.numero(evento.capacidad_total)
        : "Este evento ya no tiene cupos disponibles.";
    }

    document.title = evento.nombre + " · TicketFlow";
  }

  // El máximo de entradas: diez por reserva, o lo que quede si queda menos.
  function limitarEntradas(evento) {
    var campo = document.getElementById("ev-entradas");
    if (!campo) return;

    var tope = Math.min(10, Number(evento.cupos_disponibles) || 0);
    campo.max = String(Math.max(tope, 1));
    campo.disabled = tope < 1;
    if (Number(campo.value) > tope) campo.value = String(Math.max(tope, 1));

    var ayuda = document.getElementById("ayuda-entradas");
    if (ayuda) {
      ayuda.textContent = tope < 1
        ? "No hay cupos para reservar."
        : "Máximo " + tope + (tope === 1 ? " entrada" : " entradas") + " por reserva.";
    }
  }

  // Lo que se ve donde va el botón cambia según quién esté mirando.
  function pintarAccion(contenido) {
    var caja = document.querySelector("[data-ev-accion]");
    if (!caja) return;

    caja.textContent = "";
    caja.appendChild(contenido);
    sincronizarBarra();
  }

  // ------------------------------------------ barra fija de reserva --
  // En celular la tarjeta de compra queda al final de la página, así que la
  // barra de abajo repite el precio y el mismo botón. No inventa nada: copia
  // lo que diga el control de verdad, y si no hay ninguno, se esconde.

  function controlDeAccion() {
    var caja = document.querySelector("[data-ev-accion]");
    return caja ? caja.querySelector("a, button") : null;
  }

  function sincronizarBarra() {
    var barra = document.querySelector("[data-barra-reserva]");
    if (!barra) return;

    var control = controlDeAccion();
    var boton = barra.querySelector("[data-barra-accion]");
    var precio = document.querySelector("[data-ev-precio]");
    var destino = barra.querySelector("[data-barra-precio]");

    if (!control || !boton) { barra.hidden = true; return; }

    barra.hidden = false;
    if (precio && destino) destino.textContent = precio.textContent;

    boton.textContent = control.textContent.trim() || "Reservar";
    boton.disabled = control.disabled === true;
    boton.setAttribute("aria-label",
      boton.textContent + (destino ? ", " + destino.textContent + " por entrada" : ""));
  }

  // Le pasa el clic al control de verdad de la tarjeta de compra.
  function pulsarAccion() {
    var control = controlDeAccion();
    if (control) control.click();
  }

  function boton(texto) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn-primario btn-lg btn-bloque";
    b.dataset.reservar = "";
    b.textContent = texto;
    return b;
  }

  // "volver" es a dónde hay que llevar a la persona después de iniciar
  // sesión: si entró por el botón de reservar, vuelve a la reserva de este
  // evento y no al catálogo.
  function enlace(texto, ruta, volver) {
    var a = document.createElement("a");
    a.href = ruta;
    a.className = "btn btn-primario btn-lg btn-bloque";
    a.textContent = texto;
    if (volver) a.dataset.volverA = volver;
    return a;
  }

  function ayuda(texto) {
    var p = document.createElement("p");
    p.className = "ayuda";
    p.style.textAlign = "center";
    p.textContent = texto;
    return p;
  }

  function envolver(partes) {
    var caja = document.createDocumentFragment();
    partes.forEach(function (parte) { caja.appendChild(parte); });
    return caja;
  }

  function mensaje(texto, esError) {
    var caja = document.querySelector("[data-ev-mensaje]");
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

  // ------------------------------------------------- la foto del evento --
  // El agente elige una imagen suya y queda guardada como data URI: se manda
  // dentro del mismo JSON del evento, sin tener que montar un servidor de
  // archivos aparte. Antes de mandarla se reduce aquí en el navegador, porque
  // una foto de celular pesa varios megas y no tiene sentido guardarla así.

  var ANCHO_MAXIMO = 1280;
  var CALIDAD = 0.82;
  var fotoElegida = null;          // lo que se va a guardar, o null

  /** Reduce la imagen y la devuelve como data URI JPEG. */
  function reducir(archivo) {
    return new Promise(function (listo, falla) {
      var lector = new FileReader();

      lector.onerror = function () { falla(new Error("No se pudo leer la imagen.")); };
      lector.onload = function () {
        var img = new Image();

        img.onerror = function () { falla(new Error("Ese archivo no es una imagen válida.")); };
        img.onload = function () {
          var escala = Math.min(1, ANCHO_MAXIMO / img.naturalWidth);
          var lienzo = document.createElement("canvas");
          lienzo.width = Math.round(img.naturalWidth * escala);
          lienzo.height = Math.round(img.naturalHeight * escala);

          var pincel = lienzo.getContext("2d");
          // Fondo blanco: un PNG con transparencia pasado a JPEG se vuelve negro.
          pincel.fillStyle = "#fff";
          pincel.fillRect(0, 0, lienzo.width, lienzo.height);
          pincel.drawImage(img, 0, 0, lienzo.width, lienzo.height);

          listo(lienzo.toDataURL("image/jpeg", CALIDAD));
        };
        img.src = lector.result;
      };
      lector.readAsDataURL(archivo);
    });
  }

  // Un punto transparente: deja el <img> válido cuando no hay foto, sin
  // disparar una petición a una dirección vacía.
  var PUNTO = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  /** Pone (o quita) la foto en la caja de vista previa. */
  function mostrarFoto(dataUri) {
    fotoElegida = dataUri || null;

    var caja = document.querySelector("[data-subir-foto]");
    if (!caja) return;

    var previa = caja.querySelector("[data-foto-previa]");
    var vacia = caja.querySelector("[data-foto-vacia]");
    var quitar = caja.querySelector("[data-quitar-foto]");

    caja.classList.toggle("tiene-foto", !!fotoElegida);
    if (previa) {
      previa.hidden = !fotoElegida;
      previa.src = fotoElegida || PUNTO;
      previa.alt = fotoElegida ? "Vista previa de la imagen del evento" : "";
    }
    if (vacia) vacia.hidden = !!fotoElegida;
    if (quitar) quitar.hidden = !fotoElegida;
  }

  function laFoto() {
    return fotoElegida;
  }

  // El mismo formulario sirve para registrar y para editar: cuando se edita,
  // se llena con lo que ya tiene el evento.
  function llenarFormulario(evento) {
    var form = document.querySelector("#vista-crear-evento form");
    if (!form) return;

    form.elements.nombre.value = evento.nombre;
    form.elements.descripcion.value = evento.descripcion || "";
    form.elements.teatro.value = evento.teatro;
    form.elements.ciudad.value = String(evento.id_ciudad);
    form.elements.inicio.value = String(evento.fecha_hora_inicio).slice(0, 16);
    form.elements.fin.value = String(evento.fecha_hora_fin).slice(0, 16);
    form.elements.capacidad.value = String(evento.capacidad_total);
    form.elements.precio.value = String(Number(evento.precio_base));
    form.elements.observaciones.value = evento.observaciones || "";
    form.elements.estado.value = evento.estado;
    if (form.elements.causa) form.elements.causa.value = evento.causa_cancelacion || "";
    if (form.elements.imagen) form.elements.imagen.value = "";
    mostrarFoto(evento.imagen || null);
    alternarCausa(evento.estado);
  }

  function limpiarFormulario() {
    var form = document.querySelector("#vista-crear-evento form");
    if (!form) return;
    form.reset();
    mostrarFoto(null);
    alternarCausa("Programado");
  }

  // El título y el botón dicen si se está registrando o editando.
  function modoDelFormulario(editando) {
    var titulo = document.querySelector("[data-titulo-evento]");
    if (titulo) titulo.textContent = editando ? "Editar el evento" : "Registrar un evento";

    var boton = document.querySelector("#vista-crear-evento button[type=submit]");
    if (boton) {
      boton.textContent = editando ? "Guardar los cambios" : "Guardar evento";
      boton.dataset.textoOriginal = boton.textContent;
    }
  }

  // ------------------------------------------------- tabla del agente --

  function celda(fila, texto) {
    var td = document.createElement("td");
    td.textContent = texto;
    fila.appendChild(td);
    return td;
  }

  var ESTADOS = ["Programado", "En Boleteria", "En Vivo", "Finalizado", "Cancelado"];

  function selectorDeEstado(evento) {
    var select = document.createElement("select");
    select.dataset.estadoDe = String(evento.codigo_evento);
    select.dataset.estadoAnterior = evento.estado;
    select.setAttribute("aria-label", "Estado de " + evento.nombre);

    ESTADOS.forEach(function (estado) {
      var opcion = document.createElement("option");
      opcion.value = estado;
      opcion.textContent = FormatoModelo.textoDeEstado(estado);
      if (estado === evento.estado) opcion.selected = true;
      select.appendChild(opcion);
    });

    // Un evento cancelado ya no se mueve de ahí: las reservas quedaron
    // canceladas con su causa.
    select.disabled = evento.estado === "Cancelado";
    return select;
  }

  // Cancelar un evento pide la causa, y se pide aquí mismo, en una fila que
  // se abre debajo del evento.
  function filaDeCausa(evento) {
    var fila = document.createElement("tr");
    fila.className = "fila-causa";
    fila.dataset.filaCausa = String(evento.codigo_evento);
    fila.hidden = true;

    var celdaAncha = document.createElement("td");
    celdaAncha.colSpan = 7;

    var form = document.createElement("form");
    form.className = "form-causa";
    form.dataset.causaEvento = String(evento.codigo_evento);

    var id = "causa-evento-" + evento.codigo_evento;
    var etiqueta = document.createElement("label");
    etiqueta.setAttribute("for", id);
    etiqueta.textContent = "¿Por qué se cancela " + evento.nombre + "?";

    var campo = document.createElement("textarea");
    campo.id = id;
    campo.rows = 2;
    campo.maxLength = 500;
    campo.placeholder = "La causa queda en el reporte y en las reservas canceladas.";

    var error = document.createElement("p");
    error.className = "error";
    error.setAttribute("role", "alert");

    var acciones = document.createElement("div");
    acciones.className = "form-causa-pie";
    var confirmar = document.createElement("button");
    confirmar.type = "submit";
    confirmar.className = "btn btn-primario";
    confirmar.textContent = "Cancelar el evento";
    var volver = document.createElement("button");
    volver.type = "button";
    volver.className = "btn btn-secundario";
    volver.dataset.cerrarCausaEvento = String(evento.codigo_evento);
    volver.textContent = "Dejarlo como está";
    acciones.appendChild(confirmar);
    acciones.appendChild(volver);

    form.appendChild(etiqueta);
    form.appendChild(campo);
    form.appendChild(error);
    form.appendChild(acciones);
    celdaAncha.appendChild(form);
    fila.appendChild(celdaAncha);
    return fila;
  }

  function mostrarCausaDeEvento(codigo, abierta) {
    var fila = document.querySelector('[data-fila-causa="' + codigo + '"]');
    if (!fila) return;

    fila.hidden = !abierta;
    if (abierta) fila.querySelector("textarea").focus();
  }

  function pintarMisEventos(cuerpo, eventos) {
    if (!cuerpo) return;
    cuerpo.textContent = "";

    eventos.forEach(function (evento) {
      var fila = document.createElement("tr");

      var th = document.createElement("th");
      th.scope = "row";
      var ver = document.createElement("a");
      ver.href = "#/evento/" + evento.codigo_evento;
      ver.textContent = evento.nombre;
      th.appendChild(ver);
      fila.appendChild(th);

      celda(fila, FormatoModelo.fechaCorta(evento.fecha_hora_inicio));
      celda(fila, evento.ciudad);
      celda(fila, FormatoModelo.numero(evento.cupos_disponibles) + " de " +
                  FormatoModelo.numero(evento.capacidad_total));

      var estado = document.createElement("td");
      var chip = document.createElement("span");
      chip.className = "estado-chip " + FormatoModelo.claseDeEstado(evento.estado);
      chip.textContent = FormatoModelo.textoDeEstado(evento.estado);
      estado.appendChild(chip);
      fila.appendChild(estado);

      var cambio = document.createElement("td");
      cambio.appendChild(selectorDeEstado(evento));
      fila.appendChild(cambio);

      var acciones = document.createElement("td");
      acciones.className = "celda-acciones";

      var editar = document.createElement("a");
      editar.href = "#/crear-evento/" + evento.codigo_evento;
      editar.className = "btn btn-chico btn-secundario";
      editar.textContent = "Editar";
      acciones.appendChild(editar);

      // Borrar un evento es cosa del administrador; el agente lo cancela,
      // que es lo que deja rastro de por que no se hizo.
      if (SesionModelo.perfil() === "administrador") {
        var borrar = document.createElement("button");
        borrar.type = "button";
        borrar.className = "btn btn-chico btn-peligro";
        borrar.dataset.borrarEvento = String(evento.codigo_evento);
        borrar.dataset.nombre = evento.nombre;
        borrar.textContent = "Eliminar";
        acciones.appendChild(borrar);
      }

      fila.appendChild(acciones);
      cuerpo.appendChild(fila);
      if (evento.estado !== "Cancelado") cuerpo.appendChild(filaDeCausa(evento));
    });
  }

  return {
    pesos: pesos,
    pintarTotal: pintarTotal,
    alternarCausa: alternarCausa,
    reducir: reducir,
    mostrarFoto: mostrarFoto,
    laFoto: laFoto,
    pintarDetalle: pintarDetalle,
    limitarEntradas: limitarEntradas,
    pintarAccion: pintarAccion,
    sincronizarBarra: sincronizarBarra,
    pulsarAccion: pulsarAccion,
    boton: boton,
    enlace: enlace,
    ayuda: ayuda,
    envolver: envolver,
    mensaje: mensaje,
    llenarFormulario: llenarFormulario,
    limpiarFormulario: limpiarFormulario,
    modoDelFormulario: modoDelFormulario,
    pintarMisEventos: pintarMisEventos,
    mostrarCausaDeEvento: mostrarCausaDeEvento
  };
})();
