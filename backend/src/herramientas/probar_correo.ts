// Comprueba que las credenciales de correo del .env sirven.
//
//   npm run correo:probar                  solo revisa la conexión
//   npm run correo:probar -- tu@correo.com  además manda un mensaje de prueba
//
// No imprime la contraseña en ningún momento.
import { entorno } from "../configuracion/entorno";
import { enviar, hayCorreo, probarConexion } from "../servicios/correo";

function tapar(clave: string): string {
  if (!clave) return "(vacía)";
  return `${clave.length} caracteres`;
}

async function principal() {
  console.log("\nConfiguración de correo");
  console.log(`  host    : ${entorno.correo.host}:${entorno.correo.puerto}`);
  console.log(`  usuario : ${entorno.correo.usuario || "(vacío)"}`);
  console.log(`  clave   : ${tapar(entorno.correo.clave)}`);
  console.log(`  desde   : ${entorno.correo.desde}`);

  if (!hayCorreo()) {
    console.log("\nEl correo está APAGADO: falta CORREO_USUARIO o CORREO_CLAVE en el .env.");
    console.log("La aplicación sigue funcionando; los mensajes solo se anotan en la consola.\n");
    process.exit(1);
  }

  // Una contraseña de aplicación de Google son 16 caracteres, a veces escritos
  // en cuatro grupos de cuatro. La contraseña normal de la cuenta no sirve:
  // Google cerró ese camino para SMTP.
  const limpia = entorno.correo.clave.replace(/\s+/g, "");
  if (/gmail\.com$/i.test(entorno.correo.usuario) && limpia.length !== 16) {
    console.log(
      `\nAviso: con Gmail la clave debe ser una contraseña de aplicación de 16` +
        ` caracteres, y esta tiene ${limpia.length}. Lo más probable es que Google la rechace.`
    );
  }

  console.log("\nProbando la conexión...");
  const sirve = await probarConexion();
  if (!sirve) {
    console.log("\nEl servidor rechazó las credenciales. Revisa el mensaje de arriba.");
    console.log("Si usas Gmail: hace falta la verificación en dos pasos y una");
    console.log("contraseña de aplicación, no la contraseña de la cuenta.\n");
    process.exit(1);
  }
  console.log("  Conexión y credenciales correctas.");

  const destino = process.argv[2];
  if (!destino) {
    console.log("\nPara mandar un mensaje de prueba:");
    console.log("  npm run correo:probar -- tu@correo.com\n");
    return;
  }

  console.log(`\nMandando un mensaje de prueba a ${destino}...`);
  const salio = await enviar({
    para: destino,
    asunto: "TicketFlow: el correo quedó configurado",
    texto: "Si estás leyendo esto, TicketFlow ya puede mandar correos desde esta cuenta.",
    html:
      `<p style="font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:15px">` +
      `Si estás leyendo esto, <strong>TicketFlow ya puede mandar correos</strong> desde esta cuenta.</p>`
  });

  console.log(salio ? "  Mensaje enviado. Revisa la bandeja.\n" : "  No se pudo enviar.\n");
  if (!salio) process.exit(1);
}

principal().catch((error) => {
  console.error("\n" + (error instanceof Error ? error.message : String(error)) + "\n");
  process.exit(1);
});
