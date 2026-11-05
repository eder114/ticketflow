// Lee las variables de entorno una sola vez y avisa si falta alguna.
import dotenv from "dotenv";

dotenv.config();

function obligatoria(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Copie .env.example como .env y complételo.`
    );
  }
  return valor;
}

function opcional(nombre: string, porDefecto: string): string {
  return process.env[nombre] || porDefecto;
}

export const entorno = {
  puerto: Number(opcional("PUERTO", "4000")),
  bd: {
    // En el computador se usan los cuatro datos sueltos. Los servicios que
    // publican la base de datos en internet entregan una sola cadena de
    // conexión, y entonces esa manda.
    url: process.env.BD_URL || null,
    host: opcional("BD_HOST", "localhost"),
    puerto: Number(opcional("BD_PUERTO", "5432")),
    nombre: opcional("BD_NOMBRE", "ticketflow"),
    usuario: opcional("BD_USUARIO", "postgres"),
    contrasena: process.env.BD_CONTRASENA ?? ""
  },
  jwt: {
    secreto: obligatoria("JWT_SECRETO"),
    horas: Number(opcional("JWT_HORAS", "8"))
  },
  // Correo saliente. Con Gmail: host smtp.gmail.com, puerto 465, el usuario es
  // la cuenta completa y la clave es una CONTRASENA DE APLICACION de 16
  // caracteres (Google no acepta la contrasena normal). Si se dejan vacias,
  // el servicio de correo queda apagado y solo anota en la consola.
  correo: {
    host: opcional("CORREO_HOST", "smtp.gmail.com"),
    puerto: Number(opcional("CORREO_PUERTO", "465")),
    usuario: (process.env.CORREO_USUARIO || "").trim(),
    // Google muestra la contrasena de aplicacion en cuatro grupos de cuatro,
    // y asi es como se pega. Los espacios no son parte de la clave.
    clave: (process.env.CORREO_CLAVE || "").replace(/\s+/g, ""),
    desde: opcional("CORREO_DESDE", process.env.CORREO_USUARIO || "TicketFlow")
  },
  recuperacion: {
    minutos: Number(opcional("RECUPERACION_MINUTOS", "15")),
    intentos: Number(opcional("RECUPERACION_INTENTOS", "5"))
  },
  origenPermitido: opcional("ORIGEN_PERMITIDO", "*")
};
