// Controlador: validación de los formularios de acceso y registro
var FormularioControlador = (function () {
  "use strict";

  function validarCampo(campo) {
    var mensaje = ValidacionModelo.revisar(campo);
    if (mensaje) {
      FormularioVista.mostrarError(campo, mensaje);
      return false;
    }
    FormularioVista.limpiarError(campo);
    return true;
  }

  function conectarMedidor(campo) {
    var medidor = document.getElementById(campo.dataset.medidor);
    if (!medidor) return;
    campo.addEventListener("input", function () {
      var nivel = campo.value === "" ? "0" : String(ValidacionModelo.nivelClave(campo.value));
      FormularioVista.pintarMedidor(medidor, nivel);
    });
  }

  function iniciar() {
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
          FormularioVista.enfocar(primerFallo);
          return;
        }
        FormularioVista.mostrarExito(form);
      });
    });
  }

  return { iniciar: iniciar };
})();
