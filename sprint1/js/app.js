/* ==========================================================================
   TicketFlow · Aplicación de una sola página
   Sprint 1 · 9 – 28 de septiembre de 2026

   Dos piezas:
     1. ENRUTADOR  — todas las pantallas viven en index.html. Al hacer clic
                     en "Iniciar sesión" no se recarga nada: se esconde una
                     vista y se muestra otra. (SDGE-3)
     2. VALIDACIÓN — cubre los cuatro formularios: inicio de sesión y los
                     tres registros. Corre al salir del campo, no solo al
                     enviar, para que el usuario no descubra todos los
                     errores de golpe al final. (SDGE-8)

   Las reglas se declaran en el HTML con atributos data-*, así que agregar
   un campo nuevo no obliga a tocar este archivo.
   ========================================================================== */
(function () {
  "use strict";

  /* ======================================================================
     1. ENRUTADOR
     ====================================================================== */
  var VISTA_INICIAL = "inicio";

  function vistas() {
    return document.querySelectorAll(".vista");
  }

  // Se distinguen dos tipos de fragmento:
  //   #/registro-cliente  -> RUTA, cambia de pantalla
  //   #eventos            -> ANCLA, baja a una sección de la pantalla actual
  // Sin esta distinción el enrutador se robaría los clics del menú y
  // saltaría al inicio en vez de desplazarse a la sección.
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

    // Ruta desconocida: se vuelve al inicio en vez de dejar la página en blanco.
    if (!destino) {
      destino = document.getElementById("vista-" + VISTA_INICIAL);
      nombre = VISTA_INICIAL;
    }

    Array.prototype.forEach.call(vistas(), function (v) {
      v.classList.toggle("activa", v === destino);
      v.hidden = v !== destino;
    });

    // El encabezado móvil se cierra al cambiar de pantalla.
    var enc = document.querySelector(".encabezado.abierto");
    if (enc) {
      enc.classList.remove("abierto");
      var b = enc.querySelector(".menu-btn");
      if (b) b.setAttribute("aria-expanded", "false");
    }

    // Cada pantalla empieza arriba, como si fuera una página nueva.
    // Se omite cuando la URL trae un ancla, para no pisar su desplazamiento.
    if (!opciones.conservarScroll) window.scrollTo({ top: 0, behavior: "auto" });

    // Se marca el enlace activo del menú.
    document.querySelectorAll(".nav a").forEach(function (a) {
      var suya = (a.getAttribute("href") || "").replace(/^#\/?/, "");
      a.classList.toggle("activo", suya === nombre);
    });

    // El título de la pestaña acompaña a la pantalla.
    var t = destino.dataset.titulo;
    document.title = t ? t + " · TicketFlow" : "TicketFlow · Entradas para los mejores eventos de Colombia";

    // Accesibilidad: el lector de pantalla anuncia la pantalla nueva.
    var h1 = destino.querySelector("h1");
    if (h1 && !opciones.conservarScroll) {
      h1.setAttribute("tabindex", "-1");
      h1.focus({ preventScroll: true });
    }
  }

  function arrancarEnrutador() {
    window.addEventListener("hashchange", function () {
      // Un ancla (#eventos) no cambia de pantalla: la maneja el navegador.
      if (!esRuta()) return;
      mostrar(nombreDeRuta());
    });

    // Si alguien llega con un ancla directa (.../#eventos), se muestra el
    // inicio sin tocar el scroll y el navegador se encarga del resto.
    if (esRuta()) {
      mostrar(nombreDeRuta());
    } else {
      mostrar(VISTA_INICIAL, { conservarScroll: true });
      var destino = document.getElementById(window.location.hash.slice(1));
      if (destino) destino.scrollIntoView();
    }
  }

  /* ======================================================================
     2. VALIDACIÓN
     ====================================================================== */

  /* ---------- Reglas ---------- */
  // Cada regla recibe (valor, campo) y devuelve null si pasa,
  // o el mensaje de error si falla. El mensaje dice qué pasó y cómo se arregla.
  var reglas = {
    requerido: function (v) {
      return v.trim() === "" ? "Este campo es obligatorio." : null;
    },

    correo: function (v) {
      if (v.trim() === "") return null; // de eso se encarga "requerido"
      // Validación pragmática: algo@algo.algo, sin espacios.
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

  /* ---------- Utilidades ---------- */
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

  // Devuelve el primer mensaje de error del campo, o null si está bien.
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

  /* ---------- Medidor de fuerza de contraseña ---------- */
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

  /* ---------- Arranque ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    arrancarEnrutador();

    var formularios = document.querySelectorAll("form[data-validar]");

    Array.prototype.forEach.call(formularios, function (form) {
      var campos = form.querySelectorAll("[data-reglas]");

      Array.prototype.forEach.call(campos, function (campo) {
        // Al salir del campo: se valida.
        campo.addEventListener("blur", function () {
          validarCampo(campo);
        });

        // Mientras escribe: solo se limpia el error ya mostrado,
        // para no regañarlo en cada tecla.
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

        // Sprint 1 entrega la interfaz; la persistencia llega en el Sprint 2.
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

    /* Buscador del hero: cada chip muestra lo que se eligió en su control.
       La fecha abre el calendario nativo al tocar cualquier parte del chip. */
    var MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    Array.prototype.forEach.call(document.querySelectorAll(".bq-chip"), function (chip) {
      var control = chip.querySelector(".bq-control");
      var valor = chip.querySelector(".bq-valor");
      function pintar() {
        var v = control.value;
        if (v && control.type === "date") {
          var p = v.split("-");
          v = parseInt(p[2], 10) + " " + MESES[parseInt(p[1], 10) - 1];
        }
        chip.classList.toggle("tiene-valor", !!v);
        valor.textContent = v || chip.getAttribute("data-vacio");
      }
      control.addEventListener("change", pintar);
      if (control.type === "date") {
        control.addEventListener("click", function () {
          try { control.showPicker(); } catch (e) { /* el navegador lo abre solo */ }
        });
      }
      pintar();
    });

    var buscador = document.querySelector(".buscador");
    if (buscador) {
      // Todavía no hay base de datos que filtrar (Sprint 2): la búsqueda
      // lleva a los eventos destacados en vez de recargar la página.
      buscador.addEventListener("submit", function (e) {
        e.preventDefault();
        var destino = document.getElementById("eventos");
        if (destino) destino.scrollIntoView({ behavior: "smooth" });
      });
    }

    /* Menú del encabezado en móvil · SDGE-3 + SDGE-10 */
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
