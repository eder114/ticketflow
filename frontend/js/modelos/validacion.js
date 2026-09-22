// Modelo: reglas de validación de los formularios
var ValidacionModelo = (function () {
  "use strict";

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

  // Devuelve el primer error del campo, o null si está bien
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

  // Fuerza de la contraseña de 0 a 4
  function nivelClave(v) {
    var n = 0;
    if (v.length >= 8) n++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) n++;
    if (/[0-9]/.test(v)) n++;
    if (/[^A-Za-z0-9]/.test(v) && v.length >= 12) n++;
    return n;
  }

  return {
    reglas: reglas,
    revisar: revisar,
    nivelClave: nivelClave
  };
})();
