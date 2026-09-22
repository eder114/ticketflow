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

  return {
    mostrarError: mostrarError,
    limpiarError: limpiarError,
    pintarMedidor: pintarMedidor,
    enfocar: enfocar,
    mostrarExito: mostrarExito
  };
})();
