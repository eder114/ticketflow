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
  origenPermitido: opcional("ORIGEN_PERMITIDO", "*")
};
