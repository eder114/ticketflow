// Vista: errores, medidor de contraseña y mensaje de éxito de los formularios
var FormularioVista = (function () {
  "use strict";

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

  function pintarMedidor(medidor, nivel) {
    medidor.dataset.nivel = nivel;
  }

  function enfocar(campo) {
    campo.focus();
    campo.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function mostrarExito(form) {
    var aviso = form.querySelector("[data-exito]");
    if (aviso) {
      aviso.hidden = false;
      aviso.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    form.querySelectorAll("button[type=submit]").forEach(function (b) {
      b.disabled = true;
      b.textContent = "Datos validados";
    });
  }

  // Mensaje general del formulario, para lo que no corresponde a un campo:
  // por ejemplo que el correo y la contrasena no coincidan.
  function mostrarMensaje(form, texto) {
    var caja = form.querySelector("[data-mensaje]");
    if (!caja) {
      caja = document.createElement("p");
      caja.className = "aviso aviso-error";
      caja.setAttribute("role", "alert");
      caja.dataset.mensaje = "";
      var boton = form.querySelector("button[type=submit]");
      form.insertBefore(caja, boton);
    }
    caja.textContent = texto;
    caja.hidden = false;
    caja.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function limpiarMensaje(form) {
    var caja = form.querySelector("[data-mensaje]");
    if (caja) caja.hidden = true;
  }

  // Mientras la peticion esta en camino el boton queda bloqueado, para que no
  // se envie dos veces.
  function ocupado(form, si) {
    form.querySelectorAll("button[type=submit]").forEach(function (b) {
      if (si) {
        b.dataset.textoOriginal = b.dataset.textoOriginal || b.textContent;
        b.disabled = true;
        b.textContent = "Enviando...";
      } else {
        b.disabled = false;
        if (b.dataset.textoOriginal) b.textContent = b.dataset.textoOriginal;
      }
    });
  }

  return {
    mostrarMensaje: mostrarMensaje,
    limpiarMensaje: limpiarMensaje,
    ocupado: ocupado,
    mostrarError: mostrarError,
    limpiarError: limpiarError,
    pintarMedidor: pintarMedidor,
    enfocar: enfocar,
    mostrarExito: mostrarExito
  };
})();
