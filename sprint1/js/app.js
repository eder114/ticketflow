(function () {
  "use strict";

  var VISTA_INICIAL = "inicio";

  function vistas() {
    return document.querySelectorAll(".vista");
  }

  function esRuta() {
    var h = window.location.hash;
    return h === "" || /^#\//.test(h);
  }

  function nombreDeRuta() {
    var h = window.location.hash.replace(/^#\/?/, "").trim();
    return h === "" ? VISTA_INICIAL : h;
  }

  function mostrar(nombre, opciones) {
    opciones = opciones || {};
    var destino = document.getElementById("vista-" + nombre);

    if (!destino) {
      destino = document.getElementById("vista-" + VISTA_INICIAL);
      nombre = VISTA_INICIAL;
    }

    Array.prototype.forEach.call(vistas(), function (v) {
      v.classList.toggle("activa", v === destino);
      v.hidden = v !== destino;
    });

    var enc = document.querySelector(".encabezado.abierto");
    if (enc) {
      enc.classList.remove("abierto");
      var b = enc.querySelector(".menu-btn");
      if (b) b.setAttribute("aria-expanded", "false");
    }

    if (!opciones.conservarScroll) window.scrollTo({ top: 0, behavior: "auto" });

    document.querySelectorAll(".nav a").forEach(function (a) {
      var suya = (a.getAttribute("href") || "").replace(/^#\/?/, "");
      a.classList.toggle("activo", suya === nombre);
    });

    var t = destino.dataset.titulo;
    document.title = t ? t + " · TicketFlow" : "TicketFlow · Entradas para los mejores eventos de Colombia";

    var h1 = destino.querySelector("h1");
    if (h1 && !opciones.conservarScroll) {
      h1.setAttribute("tabindex", "-1");
      h1.focus({ preventScroll: true });
    }
  }

  function arrancarEnrutador() {
    window.addEventListener("hashchange", function () {
      if (!esRuta()) return;
      mostrar(nombreDeRuta());
    });

    if (esRuta()) {
      mostrar(nombreDeRuta());
    } else {
      mostrar(VISTA_INICIAL, { conservarScroll: true });
      var destino = document.getElementById(window.location.hash.slice(1));
      if (destino) destino.scrollIntoView();
    }
  }

  // Reglas
  var reglas = {
    requerido: function (v) {
      return v.trim() === "" ? "Este campo es obligatorio." : null;
    },

    correo: function (v) {
      if (v.trim() === "") return null; // de eso se encarga "requerido"
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
      return ok ? null : "Escribe un correo válido, por ejemplo nombre@correo.com";
    },

    correoInstitucional: function (v) {
      if (v.trim() === "") return null;
      var base = reglas.correo(v);
      if (base) return base;
      return /@uceva\.edu\.co$/i.test(v.trim())
        ? null
        : "El administrador debe registrarse con su correo institucional @uceva.edu.co";
    },

    minimo: function (v, campo) {
      var n = parseInt(campo.dataset.minimo, 10);
      if (v.trim() === "") return null;
      return v.trim().length < n
        ? "Debe tener al menos " + n + " caracteres. Llevas " + v.trim().length + "."
        : null;
    },

    clave: function (v) {
      if (v === "") return null;
      if (v.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
      if (!/[A-Za-z]/.test(v)) return "La contraseña debe incluir al menos una letra.";
      if (!/[0-9]/.test(v)) return "La contraseña debe incluir al menos un número.";
      return null;
    },

    confirmar: function (v, campo) {
      var otro = document.getElementById(campo.dataset.confirmar);
      if (!otro || v === "") return null;
      return v !== otro.value ? "Las dos contraseñas no coinciden." : null;
    },

    telefono: function (v) {
      if (v.trim() === "") return null;
      var digitos = v.replace(/[\s()+-]/g, "");
      return /^[0-9]{7,12}$/.test(digitos)
        ? null
        : "Escribe un teléfono válido, entre 7 y 12 dígitos.";
    },

    nit: function (v) {
      if (v.trim() === "") return null;
      return /^[0-9]{9,10}(-[0-9])?$/.test(v.trim())
        ? null
        : "El NIT va con 9 o 10 dígitos, opcionalmente con guion y dígito de verificación.";
    },

    aceptar: function (v, campo) {
      return campo.checked ? null : "Debes aceptar los términos para continuar.";
    }
  };

  // Utilidades
  function cajaError(campo) {
    var id = campo.getAttribute("aria-describedby");
    return id ? document.getElementById(id) : null;
  }

  function mostrarError(campo, mensaje) {
    var caja = cajaError(campo);
    campo.setAttribute("aria-invalid", "true");
    if (caja) {
      caja.textContent = mensaje;
      caja.classList.add("visible");
    }
  }

  function limpiarError(campo) {
    var caja = cajaError(campo);
    campo.removeAttribute("aria-invalid");
    if (caja) {
      caja.textContent = "";
      caja.classList.remove("visible");
    }
  }

  function revisar(campo) {
    var lista = (campo.dataset.reglas || "").split(/\s+/).filter(Boolean);
    var valor = campo.type === "checkbox" ? String(campo.checked) : campo.value;

    for (var i = 0; i < lista.length; i++) {
      var regla = reglas[lista[i]];
      if (!regla) continue;
      var mensaje = regla(valor, campo);
      if (mensaje) return mensaje;
    }
    return null;
  }

  function validarCampo(campo) {
    var mensaje = revisar(campo);
    if (mensaje) {
      mostrarError(campo, mensaje);
      return false;
    }
    limpiarError(campo);
    return true;
  }

  // Medidor de fuerza de contraseña
  function nivelClave(v) {
    var n = 0;
    if (v.length >= 8) n++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) n++;
    if (/[0-9]/.test(v)) n++;
    if (/[^A-Za-z0-9]/.test(v) && v.length >= 12) n++;
    return n;
  }

  function conectarMedidor(campo) {
    var medidor = document.getElementById(campo.dataset.medidor);
    if (!medidor) return;
    campo.addEventListener("input", function () {
      medidor.dataset.nivel = campo.value === "" ? "0" : String(nivelClave(campo.value));
    });
  }

  // Arranque
  document.addEventListener("DOMContentLoaded", function () {
    arrancarEnrutador();

    var formularios = document.querySelectorAll("form[data-validar]");

    Array.prototype.forEach.call(formularios, function (form) {
      var campos = form.querySelectorAll("[data-reglas]");

      Array.prototype.forEach.call(campos, function (campo) {
        campo.addEventListener("blur", function () {
          validarCampo(campo);
        });

        campo.addEventListener("input", function () {
          if (campo.getAttribute("aria-invalid") === "true") validarCampo(campo);
        });

        if (campo.dataset.medidor) conectarMedidor(campo);
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var primerFallo = null;
        Array.prototype.forEach.call(campos, function (campo) {
          if (!validarCampo(campo) && !primerFallo) primerFallo = campo;
        });

        if (primerFallo) {
          primerFallo.focus();
          primerFallo.scrollIntoView({ block: "center", behavior: "smooth" });
          return;
        }

        var aviso = form.querySelector("[data-exito]");
        if (aviso) {
          aviso.hidden = false;
          aviso.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        form.querySelectorAll("button[type=submit]").forEach(function (b) {
          b.disabled = true;
          b.textContent = "Datos validados";
        });
      });
    });

    var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
                 "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    var DSEM = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"];
    var abierto = null;

    function cerrarPanel(devolverFoco) {
      if (!abierto) return;
      abierto.pop.hidden = true;
      abierto.chip.classList.remove("abierto");
      abierto.boton.setAttribute("aria-expanded", "false");
      if (devolverFoco) abierto.boton.focus();
      abierto = null;
    }

    function fijarValor(chip, valor, texto) {
      chip.querySelector("input[type=hidden]").value = valor;
      chip.querySelector(".bq-valor").textContent = texto || chip.getAttribute("data-vacio");
      chip.classList.toggle("tiene-valor", !!valor);
    }

    function iso(f) {
      return f.getFullYear() + "-" + String(f.getMonth() + 1).padStart(2, "0") + "-" + String(f.getDate()).padStart(2, "0");
    }

    function pintarCalendario(chip, pop, mes) {
      var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
      var elegido = chip.querySelector("input[type=hidden]").value;
      var primero = new Date(mes.getFullYear(), mes.getMonth(), 1);
      var diasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
      var esteMes = mes.getFullYear() === hoy.getFullYear() && mes.getMonth() === hoy.getMonth();

      var html = '<div class="bq-cal-cab"><span class="bq-cal-mes" aria-live="polite">' +
        MESES[mes.getMonth()].charAt(0).toUpperCase() + MESES[mes.getMonth()].slice(1) + " de " + mes.getFullYear() +
        '</span><span class="bq-cal-nav">' +
        '<button type="button" class="bq-circulo" data-mover="-1" aria-label="Mes anterior"' + (esteMes ? " disabled" : "") + '>' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>' +
        '<button type="button" class="bq-circulo" data-mover="1" aria-label="Mes siguiente">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>' +
        '</span></div><div class="bq-cal-grilla">';
      DSEM.forEach(function (d) { html += '<span class="bq-cal-dsem" aria-hidden="true">' + d + "</span>"; });
      for (var i = 0; i < primero.getDay(); i++) html += '<span class="bq-dia fuera"></span>';
      for (var d = 1; d <= diasMes; d++) {
        var f = new Date(mes.getFullYear(), mes.getMonth(), d);
        var clave = iso(f);
        html += '<button type="button" class="bq-dia' + (f.getTime() === hoy.getTime() ? " hoy" : "") +
          '" data-fecha="' + clave + '" aria-pressed="' + (clave === elegido) + '" aria-label="' +
          d + " de " + MESES[mes.getMonth()] + " de " + mes.getFullYear() + '"' +
          (f < hoy ? " disabled" : "") + ">" + d + "</button>";
      }
      html += '</div><div class="bq-cal-pie"><button type="button" class="bq-texto-btn" data-accion="borrar">Borrar</button>' +
        '<button type="button" class="bq-texto-btn" data-accion="hoy">Hoy</button></div>';
      pop.innerHTML = html;
      pop.mes = mes;
    }

    Array.prototype.forEach.call(document.querySelectorAll(".bq-chip"), function (chip) {
      var boton = chip.querySelector(".bq-abrir");
      var pop = chip.querySelector(".bq-pop");
      var esCalendario = pop.classList.contains("bq-cal");
      var formulario = chip.closest(".buscador");

      boton.addEventListener("click", function (e) {
        e.stopPropagation();
        if (abierto && abierto.chip === chip) { cerrarPanel(false); return; }
        cerrarPanel(false);
        if (esCalendario) {
          var v = chip.querySelector("input[type=hidden]").value;
          var base = v ? new Date(v + "T00:00:00") : new Date();
          pintarCalendario(chip, pop, new Date(base.getFullYear(), base.getMonth(), 1));
        }
        if (pop.parentNode !== (window.innerWidth >= 1024 ? chip : formulario)) {
          (window.innerWidth >= 1024 ? chip : formulario).appendChild(pop);
        }
        pop.hidden = false;
        chip.classList.add("abierto");
        boton.setAttribute("aria-expanded", "true");
        abierto = { chip: chip, pop: pop, boton: boton };
        var foco = pop.querySelector('[aria-pressed="true"]:not(:disabled)') ||
          pop.querySelector(".bq-dia.hoy:not(:disabled)") || pop.querySelector("button:not(:disabled)");
        if (foco) foco.focus();
      });

      pop.addEventListener("click", function (e) {
        e.stopPropagation();
        var b = e.target.closest("button");
        if (!b || b.disabled) return;
        if (b.classList.contains("bq-opcion")) {
          Array.prototype.forEach.call(pop.querySelectorAll(".bq-opcion"), function (o) {
            o.setAttribute("aria-pressed", String(o === b));
          });
          fijarValor(chip, b.getAttribute("data-valor"), b.getAttribute("data-valor"));
          cerrarPanel(true);
        } else if (b.hasAttribute("data-mover")) {
          var m = pop.mes;
          pintarCalendario(chip, pop, new Date(m.getFullYear(), m.getMonth() + parseInt(b.getAttribute("data-mover"), 10), 1));
          var otra = pop.querySelector('[data-mover="' + b.getAttribute("data-mover") + '"]:not(:disabled)');
          if (otra) otra.focus();
        } else if (b.hasAttribute("data-fecha")) {
          var p = b.getAttribute("data-fecha").split("-");
          fijarValor(chip, b.getAttribute("data-fecha"), parseInt(p[2], 10) + " " + MESES[parseInt(p[1], 10) - 1].slice(0, 3));
          cerrarPanel(true);
        } else if (b.getAttribute("data-accion") === "borrar") {
          fijarValor(chip, "", "");
          cerrarPanel(true);
        } else if (b.getAttribute("data-accion") === "hoy") {
          var h = new Date();
          fijarValor(chip, iso(h), h.getDate() + " " + MESES[h.getMonth()].slice(0, 3));
          cerrarPanel(true);
        }
      });
    });

    document.addEventListener("click", function () { cerrarPanel(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && abierto) cerrarPanel(true);
    });
    window.addEventListener("resize", function () { cerrarPanel(false); });

    var buscador = document.querySelector(".buscador");
    if (buscador) {
      buscador.addEventListener("submit", function (e) {
        e.preventDefault();
        var destino = document.getElementById("eventos");
        if (destino) destino.scrollIntoView({ behavior: "smooth" });
      });
    }

    var menu = document.querySelector(".menu-btn");
    if (menu) {
      menu.addEventListener("click", function () {
        var enc = menu.closest(".encabezado");
        var abierto = enc.classList.toggle("abierto");
        menu.setAttribute("aria-expanded", String(abierto));
      });
    }
  });
})();
