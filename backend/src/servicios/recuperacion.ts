// Recuperación de contraseña con un código que llega al correo.
//
// El recorrido son dos pasos:
//   1. pedir()     → genera un código de seis dígitos y lo manda al correo.
//   2. cambiar()   → recibe el código y la contraseña nueva, y la guarda.
//
// Tres decisiones que vale la pena sustentar:
//
//   · Pedir un código NUNCA dice si el correo existe. Si respondiera distinto,
//     cualquiera podría averiguar qué correos están registrados probándolos
//     uno por uno. Es la misma razón por la que el inicio de sesión no dice
//     cuál de los dos datos falló.
//   · De la base solo sale el hash del código, nunca el código. Quien lea la
//     tabla no puede usar los que estén vivos.
//   · El código vence, sirve una sola vez, aguanta un número limitado de
//     intentos, y pedir uno nuevo invalida el anterior.
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { consultar, consultarUno, enTransaccion } from "../datos/conexion";
import { entorno } from "../configuracion/entorno";
import { peticionInvalida } from "../middleware/errores";
import { buscarPorCorreo } from "./personas";
import { correoDeCodigo, enviar } from "./correo";

const LARGO = 6;

/** Seis dígitos al azar, con ceros a la izquierda si hacen falta. */
function generarCodigo(): string {
  // randomInt viene de crypto: Math.random no sirve para nada que proteja algo.
  return String(randomInt(0, 10 ** LARGO)).padStart(LARGO, "0");
}

/**
 * Paso 1. Siempre termina bien, haya o no cuenta con ese correo.
 * Devuelve a dónde se mandó, enmascarado, para que la pantalla pueda decir
 * "te lo mandamos a la***@correo.com" sin revelar la dirección completa.
 */
export async function pedir(correo: string): Promise<{ destino: string }> {
  const persona = await buscarPorCorreo(correo);

  if (persona) {
    const codigo = generarCodigo();
    const hash = await bcrypt.hash(codigo, 10);

    await enTransaccion(async (cliente) => {
      // Un código nuevo deja sin efecto los anteriores de esa persona.
      await cliente.query(
        `UPDATE recuperacion_contrasena SET usado_en = NOW()
         WHERE identificacion = $1 AND usado_en IS NULL`,
        [persona.identificacion]
      );
      // El vencimiento lo calcula la base, no Node. Si lo mandáramos hecho
      // desde aquí, la hora del computador (Colombia, UTC-5) se compararía
      // contra el NOW() del servidor (UTC) y el código nacería vencido.
      await cliente.query(
        `INSERT INTO recuperacion_contrasena (identificacion, codigo_hash, expira_en)
         VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval)`,
        [persona.identificacion, hash, String(entorno.recuperacion.minutos)]
      );
    });

    await enviar(
      correoDeCodigo(
        persona.correo,
        persona.nombres,
        codigo,
        entorno.recuperacion.minutos
      )
    );
  }

  return { destino: enmascarar(correo) };
}

/** la***@correo.com — suficiente para reconocerlo, no para adivinarlo. */
function enmascarar(correo: string): string {
  const partes = String(correo).trim().toLowerCase().split("@");
  if (partes.length !== 2) return "tu correo";
  const [nombre, dominio] = partes;
  const visible = nombre.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(nombre.length - 2, 1))}@${dominio}`;
}

interface FilaCodigo {
  id_recuperacion: number;
  identificacion: string;
  codigo_hash: string;
  intentos: number;
}

/**
 * Paso 2. Comprueba el código y guarda la contraseña nueva.
 * El mensaje de error es el mismo para un código equivocado y para uno
 * vencido: decir cuál de los dos pasó tampoco aporta nada bueno.
 */
export async function cambiar(
  correo: string,
  codigo: string,
  contrasena: string
): Promise<void> {
  const noSirve = peticionInvalida("El código no es correcto o ya venció.", {
    codigo: "El código no es correcto o ya venció. Pide uno nuevo."
  });

  const persona = await buscarPorCorreo(correo);
  if (!persona) throw noSirve;

  const fila = await consultarUno<FilaCodigo>(
    `SELECT id_recuperacion, identificacion, codigo_hash, intentos
     FROM recuperacion_contrasena
     WHERE identificacion = $1 AND usado_en IS NULL AND expira_en > NOW()
     ORDER BY creado_en DESC
     LIMIT 1`,
    [persona.identificacion]
  );
  if (!fila) throw noSirve;

  if (fila.intentos >= entorno.recuperacion.intentos) {
    // Se quema el código: a partir de aquí hay que pedir otro.
    await consultar(
      "UPDATE recuperacion_contrasena SET usado_en = NOW() WHERE id_recuperacion = $1",
      [fila.id_recuperacion]
    );
    throw peticionInvalida("Se agotaron los intentos de ese código.", {
      codigo: "Se agotaron los intentos. Pide un código nuevo."
    });
  }

  const coincide = await bcrypt.compare(String(codigo).trim(), fila.codigo_hash);
  if (!coincide) {
    await consultar(
      "UPDATE recuperacion_contrasena SET intentos = intentos + 1 WHERE id_recuperacion = $1",
      [fila.id_recuperacion]
    );
    throw noSirve;
  }

  const nueva = await bcrypt.hash(contrasena, 10);
  await enTransaccion(async (cliente) => {
    await cliente.query("UPDATE persona SET contrasena = $2 WHERE identificacion = $1", [
      fila.identificacion,
      nueva
    ]);
    // Se marca usado dentro de la misma transacción: si la contraseña no
    // alcanza a guardarse, el código tampoco se gasta.
    await cliente.query(
      "UPDATE recuperacion_contrasena SET usado_en = NOW() WHERE id_recuperacion = $1",
      [fila.id_recuperacion]
    );
  });
}
