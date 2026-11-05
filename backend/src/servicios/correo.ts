// Envío de correo.
//
// Sobre "la API de Gmail": la API REST de Gmail obliga a montar un proyecto en
// Google Cloud, una pantalla de consentimiento y un refresh token OAuth2 que
// hay que renovar. Para mandar avisos desde un servidor, Gmail ofrece el
// camino corto: SMTP con una contraseña de aplicación. Es la misma cuenta de
// Gmail, se configura en cinco minutos y aquí solo cambia una variable de
// entorno. Nodemailer habla ese SMTP, y si mañana quieren cambiarse a otro
// proveedor solo se tocan las variables, no el código.
//
// Si no hay credenciales configuradas, el servicio no se cae: anota el correo
// en la consola y sigue. Así el proyecto corre en el computador de cualquiera
// y las pruebas automáticas no dependen de tener una cuenta.
import nodemailer, { Transporter } from "nodemailer";
import { entorno } from "../configuracion/entorno";
import { ReservaCompleta } from "../modelos/tipos";

export interface Mensaje {
  para: string;
  asunto: string;
  html: string;
  texto: string;
}

let transporte: Transporter | null = null;

export function hayCorreo(): boolean {
  return Boolean(entorno.correo.usuario && entorno.correo.clave);
}

function obtenerTransporte(): Transporter {
  if (!transporte) {
    transporte = nodemailer.createTransport({
      host: entorno.correo.host,
      port: entorno.correo.puerto,
      secure: entorno.correo.puerto === 465,
      auth: { user: entorno.correo.usuario, pass: entorno.correo.clave }
    });
  }
  return transporte;
}

/**
 * Manda el mensaje. Nunca lanza: quien la llama está en mitad de una reserva o
 * de un registro, y que el servidor de correo esté caído no puede tumbar la
 * operación que el usuario sí completó. Devuelve si salió o no.
 */
export async function enviar(mensaje: Mensaje): Promise<boolean> {
  if (!hayCorreo()) {
    console.log(`[correo apagado] Para ${mensaje.para}: ${mensaje.asunto}`);
    return false;
  }
  try {
    await obtenerTransporte().sendMail({
      from: entorno.correo.desde,
      to: mensaje.para,
      subject: mensaje.asunto,
      text: mensaje.texto,
      html: mensaje.html
    });
    return true;
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error);
    console.error(`No se pudo enviar el correo a ${mensaje.para}: ${detalle}`);
    return false;
  }
}

/** Comprueba las credenciales contra el servidor, sin mandar nada. */
export async function probarConexion(): Promise<boolean> {
  if (!hayCorreo()) return false;
  try {
    await obtenerTransporte().verify();
    return true;
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error);
    console.error(`El servidor de correo rechazó las credenciales: ${detalle}`);
    return false;
  }
}

// ------------------------------------------------------------ plantillas ---
// Correo en HTML con su versión en texto plano: hay clientes que no muestran
// HTML, y un correo que llega vacío es peor que no mandarlo.

const PESOS = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

const FECHA = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "America/Bogota"
});

function pesos(valor: number | string): string {
  return PESOS.format(Number(valor));
}

function fecha(valor: string): string {
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? String(valor) : FECHA.format(d);
}

/** Escapa lo que venga de la base de datos antes de meterlo en el HTML. */
function limpio(valor: unknown): string {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const MARCA = "#635BFF";
const TINTA = "#141A22";
const SUAVE = "#64748B";
const LINEA = "#E2E8F0";

function envoltura(titulo: string, cuerpo: string): string {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${limpio(titulo)}</title></head>
<body style="margin:0;padding:24px 12px;background:#F6F7F9;
             font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TINTA}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="max-width:560px;background:#fff;border:1px solid ${LINEA};border-radius:12px">
        <tr><td style="padding:22px 28px;border-bottom:1px solid ${LINEA}">
          <span style="font-size:18px;font-weight:700;letter-spacing:-.01em">
            <span style="color:${MARCA}">&#9670;</span> TicketFlow
          </span>
        </td></tr>
        <tr><td style="padding:28px">${cuerpo}</td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid ${LINEA};
                       font-size:12px;color:${SUAVE};line-height:1.5">
          Este correo se envió automáticamente desde TicketFlow. No hace falta responderlo.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function fila(etiqueta: string, valor: string): string {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid ${LINEA};font-size:14px;color:${SUAVE}">${limpio(etiqueta)}</td>
    <td style="padding:9px 0;border-bottom:1px solid ${LINEA};font-size:14px;font-weight:600;text-align:right">${limpio(valor)}</td>
  </tr>`;
}

/** El comprobante que recibe el cliente apenas queda hecha la reserva. */
export function correoDeReserva(reserva: ReservaCompleta): Mensaje {
  const codigo = `TF-2026-${String(reserva.id_reserva).padStart(4, "0")}`;
  const lugar = `${reserva.teatro}, ${reserva.ciudad}`;

  const cuerpo = `
    <h1 style="margin:0 0 6px;font-size:21px;line-height:1.25">Tu reserva quedó hecha</h1>
    <p style="margin:0 0 20px;font-size:15px;color:${SUAVE};line-height:1.55">
      Hola ${limpio(reserva.cliente)}, guardamos tus entradas para
      <strong style="color:${TINTA}">${limpio(reserva.evento)}</strong>.
      Queda en estado <strong style="color:${TINTA}">${limpio(reserva.estado)}</strong>
      hasta que el organizador la revise.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="border-collapse:collapse;margin-bottom:20px">
      ${fila("Código de la reserva", codigo)}
      ${fila("Evento", String(reserva.evento))}
      ${fila("Fecha y hora", fecha(reserva.fecha_evento))}
      ${fila("Lugar", lugar)}
      ${fila("Entradas", String(reserva.numero_entradas))}
      ${fila("Precio por entrada", pesos(reserva.precio_base))}
      <tr>
        <td style="padding:12px 0;font-size:15px;font-weight:700">Total</td>
        <td style="padding:12px 0;font-size:17px;font-weight:700;text-align:right;color:${MARCA}">
          ${limpio(pesos(reserva.valor_total))}
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13.5px;color:${SUAVE};line-height:1.55">
      Si ya no puedes asistir, cancélala desde <em>Mis reservas</em> para que el cupo
      vuelva a quedar libre para otra persona.
    </p>`;

  const texto = [
    `Hola ${reserva.cliente}, tu reserva quedó hecha.`,
    ``,
    `Código: ${codigo}`,
    `Evento: ${reserva.evento}`,
    `Fecha: ${fecha(reserva.fecha_evento)}`,
    `Lugar: ${lugar}`,
    `Entradas: ${reserva.numero_entradas}`,
    `Precio por entrada: ${pesos(reserva.precio_base)}`,
    `Total: ${pesos(reserva.valor_total)}`,
    `Estado: ${reserva.estado}`,
    ``,
    `Si ya no puedes asistir, cancélala desde Mis reservas.`
  ].join("\n");

  return {
    para: reserva.correo_cliente,
    asunto: `Reserva ${codigo} · ${reserva.evento}`,
    html: envoltura("Tu reserva quedó hecha", cuerpo),
    texto
  };
}

/** El código de seis dígitos para volver a entrar. */
export function correoDeCodigo(para: string, nombre: string, codigo: string, minutos: number): Mensaje {
  const cuerpo = `
    <h1 style="margin:0 0 6px;font-size:21px;line-height:1.25">Tu código para cambiar la contraseña</h1>
    <p style="margin:0 0 22px;font-size:15px;color:${SUAVE};line-height:1.55">
      Hola ${limpio(nombre)}, escribe este código en TicketFlow para poner una contraseña nueva.
    </p>

    <div style="margin:0 0 22px;padding:18px;text-align:center;background:#F1F5F9;
                border:1px solid ${LINEA};border-radius:10px">
      <span style="font-family:'Courier New',monospace;font-size:34px;font-weight:700;
                   letter-spacing:.32em;color:${MARCA}">${limpio(codigo)}</span>
    </div>

    <p style="margin:0 0 10px;font-size:14px;line-height:1.55">
      El código sirve <strong>una sola vez</strong> y vence en <strong>${minutos} minutos</strong>.
    </p>
    <p style="margin:0;font-size:13.5px;color:${SUAVE};line-height:1.55">
      Si no fuiste tú quien lo pidió, no tienes que hacer nada: sin el código,
      tu contraseña sigue igual.
    </p>`;

  const texto = [
    `Hola ${nombre},`,
    ``,
    `Tu código para cambiar la contraseña es: ${codigo}`,
    ``,
    `Sirve una sola vez y vence en ${minutos} minutos.`,
    `Si no fuiste tú quien lo pidió, tu contraseña sigue igual.`
  ].join("\n");

  return {
    para,
    asunto: `${codigo} es tu código de TicketFlow`,
    html: envoltura("Tu código para cambiar la contraseña", cuerpo),
    texto
  };
}
