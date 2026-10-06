// Comprobaciones de lo que llega en cada petición, antes de tocar la base de
// datos. Son las mismas reglas que ya valida el formulario en el navegador:
// la del navegador es para ayudar al usuario, esta es la que de verdad protege.
import { peticionInvalida } from "./errores";

type Cuerpo = Record<string, unknown>;

export class Revision {
  private readonly errores: Record<string, string> = {};
  private readonly limpio: Cuerpo = {};

  constructor(private readonly cuerpo: Cuerpo) {}

  private valor(campo: string): unknown {
    return this.cuerpo?.[campo];
  }

  texto(campo: string, etiqueta: string, opciones: { min?: number; max?: number; obligatorio?: boolean } = {}) {
    const { min = 1, max = 255, obligatorio = true } = opciones;
    const bruto = this.valor(campo);

    if (bruto === undefined || bruto === null || bruto === "") {
      if (obligatorio) this.errores[campo] = `${etiqueta} es obligatorio.`;
      else this.limpio[campo] = null;
      return this;
    }
    const texto = String(bruto).trim();
    if (texto.length < min) this.errores[campo] = `${etiqueta} debe tener al menos ${min} caracteres.`;
    else if (texto.length > max) this.errores[campo] = `${etiqueta} no puede pasar de ${max} caracteres.`;
    else this.limpio[campo] = texto;
    return this;
  }

  correo(campo: string, etiqueta = "El correo") {
    const bruto = this.valor(campo);
    if (!bruto) {
      this.errores[campo] = `${etiqueta} es obligatorio.`;
      return this;
    }
    const texto = String(bruto).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto)) {
      this.errores[campo] = `${etiqueta} no tiene un formato válido.`;
    } else {
      this.limpio[campo] = texto;
    }
    return this;
  }

  // Las mismas cuatro reglas del medidor de contraseña del frontend.
  contrasena(campo = "contrasena") {
    const bruto = this.valor(campo);
    if (!bruto) {
      this.errores[campo] = "La contraseña es obligatoria.";
      return this;
    }
    const texto = String(bruto);
    if (texto.length < 8) this.errores[campo] = "La contraseña debe tener al menos 8 caracteres.";
    else if (!/[A-Za-z]/.test(texto) || !/[0-9]/.test(texto)) {
      this.errores[campo] = "La contraseña debe combinar letras y números.";
    } else {
      this.limpio[campo] = texto;
    }
    return this;
  }

  entero(campo: string, etiqueta: string, opciones: { min?: number; max?: number; obligatorio?: boolean } = {}) {
    const { min = 0, max = Number.MAX_SAFE_INTEGER, obligatorio = true } = opciones;
    const bruto = this.valor(campo);
    if (bruto === undefined || bruto === null || bruto === "") {
      if (obligatorio) this.errores[campo] = `${etiqueta} es obligatorio.`;
      return this;
    }
    const numero = Number(bruto);
    if (!Number.isInteger(numero)) this.errores[campo] = `${etiqueta} debe ser un número entero.`;
    else if (numero < min || numero > max) this.errores[campo] = `${etiqueta} debe estar entre ${min} y ${max}.`;
    else this.limpio[campo] = numero;
    return this;
  }

  decimal(campo: string, etiqueta: string, opciones: { min?: number; max?: number; obligatorio?: boolean } = {}) {
    const { min = 0, max = Number.MAX_SAFE_INTEGER, obligatorio = true } = opciones;
    const bruto = this.valor(campo);
    if (bruto === undefined || bruto === null || bruto === "") {
      if (obligatorio) this.errores[campo] = `${etiqueta} es obligatorio.`;
      return this;
    }
    const numero = Number(bruto);
    if (Number.isNaN(numero)) this.errores[campo] = `${etiqueta} debe ser un número.`;
    else if (numero < min || numero > max) this.errores[campo] = `${etiqueta} debe estar entre ${min} y ${max}.`;
    else this.limpio[campo] = numero;
    return this;
  }

  booleano(campo: string, porDefecto = false) {
    const bruto = this.valor(campo);
    this.limpio[campo] = bruto === undefined ? porDefecto : Boolean(bruto);
    return this;
  }

  fecha(campo: string, etiqueta: string, obligatorio = true) {
    const bruto = this.valor(campo);
    if (!bruto) {
      if (obligatorio) this.errores[campo] = `${etiqueta} es obligatoria.`;
      return this;
    }
    const fecha = new Date(String(bruto));
    if (Number.isNaN(fecha.getTime())) this.errores[campo] = `${etiqueta} no es una fecha válida.`;
    else this.limpio[campo] = fecha.toISOString();
    return this;
  }

  unoDe(campo: string, etiqueta: string, permitidos: readonly string[], obligatorio = true) {
    const bruto = this.valor(campo);
    if (bruto === undefined || bruto === null || bruto === "") {
      if (obligatorio) this.errores[campo] = `${etiqueta} es obligatorio.`;
      return this;
    }
    const texto = String(bruto);
    if (!permitidos.includes(texto)) {
      this.errores[campo] = `${etiqueta} solo puede ser: ${permitidos.join(", ")}.`;
    } else {
      this.limpio[campo] = texto;
    }
    return this;
  }

  listaDeTextos(campo: string, etiqueta: string, max = 5) {
    const bruto = this.valor(campo);
    if (bruto === undefined || bruto === null) {
      this.limpio[campo] = [];
      return this;
    }
    if (!Array.isArray(bruto)) {
      this.errores[campo] = `${etiqueta} debe ser una lista.`;
      return this;
    }
    if (bruto.length > max) {
      this.errores[campo] = `${etiqueta} no puede tener más de ${max} elementos.`;
      return this;
    }
    this.limpio[campo] = bruto.map((x) => String(x).trim()).filter((x) => x.length > 0);
    return this;
  }

  // Devuelve los datos ya limpios, o lanza el error con el detalle de cada campo.
  datos<T>(): T {
    if (Object.keys(this.errores).length > 0) {
      throw peticionInvalida("Hay datos que no son válidos.", this.errores);
    }
    return this.limpio as T;
  }
}

export const revisar = (cuerpo: unknown) => new Revision((cuerpo ?? {}) as Cuerpo);
