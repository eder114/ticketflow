// Prueba de la API de punta a punta.
//
// Recorre lo que entregamos en el Sprint 2: el inicio de sesion, los permisos
// por perfil, las listas de ubicacion y el CRUD de personas. No usa ninguna
// libreria: solo fetch, que ya viene en Node.
//
//   node prueba_api.js
//
// Hay que tener el servidor arriba (npm run dev) y la base de datos con los
// datos de prueba cargados.

const BASE = process.env.API || "http://localhost:4000/api";
const CLAVE = "Ticket2026*";

let pasadas = 0;
let falladas = 0;

function revisar(descripcion, condicion, detalle) {
  if (condicion) {
    pasadas++;
    console.log("  ok    " + descripcion);
  } else {
    falladas++;
    console.log("  FALLA " + descripcion + (detalle ? "  ->  " + detalle : ""));
  }
}

async function pedir(ruta, opciones = {}) {
  const { token, ...resto } = opciones;
  const cabeceras = { "Content-Type": "application/json", ...(resto.headers || {}) };
  if (token) cabeceras.Authorization = "Bearer " + token;

  const respuesta = await fetch(BASE + ruta, { ...resto, headers: cabeceras });
  const texto = await respuesta.text();
  let cuerpo = null;
  try { cuerpo = texto ? JSON.parse(texto) : null; } catch (e) { cuerpo = texto; }
  return { estado: respuesta.status, cuerpo };
}

const entrar = (correo) =>
  pedir("/sesion", { method: "POST", body: JSON.stringify({ correo, contrasena: CLAVE }) });

async function principal() {
  console.log("\nAPI:", BASE, "\n");

  // ---------------------------------------------------------- servidor ----
  console.log("Servidor");
  const salud = await pedir("/salud");
  revisar("responde que esta vivo", salud.estado === 200 && salud.cuerpo.estado === "ok");
  if (salud.estado !== 200) {
    console.log("\nEl servidor no responde. Levantelo con: npm run dev\n");
    process.exit(1);
  }

  // ----------------------------------------------------------- sesion ----
  console.log("\nInicio de sesion");
  const cliente = await entrar("laura.gonzalez@correo.com");
  revisar("el cliente entra con sus datos", cliente.estado === 200 && !!cliente.cuerpo.token);
  revisar("y queda con el perfil de cliente", cliente.cuerpo.usuario?.perfil === "cliente");

  const agente = await entrar("carolina.mejia@ticketflow.com");
  revisar("el agente entra con el perfil de agente", agente.cuerpo.usuario?.perfil === "agente");

  const admin = await entrar("hernan.ocampo@ticketflow.com");
  revisar("el administrador entra con el perfil de administrador",
          admin.cuerpo.usuario?.perfil === "administrador");

  const mala = await pedir("/sesion", {
    method: "POST",
    body: JSON.stringify({ correo: "laura.gonzalez@correo.com", contrasena: "equivocada" })
  });
  revisar("con la contrasena equivocada no deja entrar", mala.estado === 401);
  revisar("y no dice cual de los dos datos fallo",
          /correo o la contrase/i.test(mala.cuerpo?.error || ""), mala.cuerpo?.error);

  const inexistente = await pedir("/sesion", {
    method: "POST",
    body: JSON.stringify({ correo: "nadie@correo.com", contrasena: CLAVE })
  });
  revisar("con un correo que no existe responde igual que con la clave mala",
          inexistente.cuerpo?.error === mala.cuerpo?.error);

  const sesion = await pedir("/sesion", { token: cliente.cuerpo.token });
  revisar("devuelve quien es el usuario de la sesion",
          sesion.estado === 200 && sesion.cuerpo.usuario.correo === "laura.gonzalez@correo.com");

  const sinToken = await pedir("/sesion");
  revisar("sin token responde 401", sinToken.estado === 401);

  const tokenMalo = await pedir("/sesion", { token: "esto-no-es-un-token" });
  revisar("con un token invalido responde 401", tokenMalo.estado === 401);

  // -------------------------------------------------------- ubicacion ----
  console.log("\nUbicacion geografica");
  const paises = await pedir("/paises");
  revisar("lista los paises sin necesidad de sesion",
          paises.estado === 200 && paises.cuerpo.length >= 1);

  const deptos = await pedir("/departamentos?pais=1");
  revisar("filtra los departamentos por pais",
          deptos.estado === 200 && deptos.cuerpo.every((d) => d.id_pais === 1));

  const ciudades = await pedir("/ciudades?departamento=1");
  revisar("filtra las ciudades por departamento",
          ciudades.estado === 200 && ciudades.cuerpo.every((c) => c.id_departamento === 1));

  const conUbicacion = await pedir("/ciudades?conUbicacion=true");
  revisar("trae la ciudad con su departamento y su pais",
          conUbicacion.cuerpo[0]?.ciudad && conUbicacion.cuerpo[0]?.departamento &&
          conUbicacion.cuerpo[0]?.pais);

  // --------------------------------------------------------- permisos ----
  console.log("\nPermisos por perfil");
  revisar("un cliente no puede listar todas las personas",
          (await pedir("/personas", { token: cliente.cuerpo.token })).estado === 403);
  revisar("un agente tampoco",
          (await pedir("/personas", { token: agente.cuerpo.token })).estado === 403);
  revisar("el administrador si puede",
          (await pedir("/personas", { token: admin.cuerpo.token })).estado === 200);
  revisar("un agente si puede ver los clientes",
          (await pedir("/clientes", { token: agente.cuerpo.token })).estado === 200);
  revisar("un cliente no puede crear paises",
          (await pedir("/paises", { method: "POST", token: cliente.cuerpo.token,
                                    body: JSON.stringify({ nombre: "Prueba" }) })).estado === 403);
  revisar("sin sesion tampoco se puede crear un pais",
          (await pedir("/paises", { method: "POST",
                                    body: JSON.stringify({ nombre: "Prueba" }) })).estado === 401);

  // -------------------------------------------------------- validacion ----
  console.log("\nValidacion de la entrada");
  const correoMalo = await pedir("/registro/cliente", {
    method: "POST",
    body: JSON.stringify({ identificacion: "1111111111", nombres: "Ana", apellidos: "Gomez",
                           correo: "esto-no-es-un-correo", contrasena: "Clave2026", id_ciudad: 1 })
  });
  revisar("rechaza un correo con mal formato", correoMalo.estado === 400);
  revisar("y dice cual campo fallo", !!correoMalo.cuerpo?.detalles?.correo);

  const claveCorta = await pedir("/registro/cliente", {
    method: "POST",
    body: JSON.stringify({ identificacion: "1111111111", nombres: "Ana", apellidos: "Gomez",
                           correo: "ana.gomez@correo.com", contrasena: "123", id_ciudad: 1 })
  });
  revisar("rechaza una contrasena corta", claveCorta.estado === 400);

  const sinCiudad = await pedir("/registro/cliente", {
    method: "POST",
    body: JSON.stringify({ identificacion: "1111111111", nombres: "Ana", apellidos: "Gomez",
                           correo: "ana.gomez@correo.com", contrasena: "Clave2026" })
  });
  revisar("exige la ciudad", sinCiudad.estado === 400 && !!sinCiudad.cuerpo?.detalles?.id_ciudad);

  // ----------------------------------------------------------- registro ----
  console.log("\nRegistro de un cliente nuevo");
  const identificacion = "99" + Date.now().toString().slice(-8);
  const correo = "prueba" + Date.now().toString().slice(-6) + "@correo.com";

  const nuevo = await pedir("/registro/cliente", {
    method: "POST",
    body: JSON.stringify({ identificacion, nombres: "Ana Maria", apellidos: "Gomez Ruiz",
                           correo, contrasena: "Clave2026", direccion: "Calle 1 # 2-3",
                           id_ciudad: 1, telefonos: ["3001112233", "6021234567"] })
  });
  revisar("queda registrado y con sesion iniciada", nuevo.estado === 201 && !!nuevo.cuerpo.token);
  revisar("y entra como cliente", nuevo.cuerpo.usuario?.perfil === "cliente");

  const repetido = await pedir("/registro/cliente", {
    method: "POST",
    body: JSON.stringify({ identificacion: "88" + Date.now().toString().slice(-8),
                           nombres: "Otra", apellidos: "Persona", correo,
                           contrasena: "Clave2026", id_ciudad: 1 })
  });
  revisar("no deja repetir el correo", repetido.estado === 409);

  const leido = await pedir("/personas/" + identificacion, { token: nuevo.cuerpo.token });
  revisar("se puede consultar la persona recien creada", leido.estado === 200);
  revisar("con sus dos telefonos", leido.cuerpo?.telefonos?.length === 2);
  revisar("con su ciudad, departamento y pais",
          !!leido.cuerpo?.ciudad && !!leido.cuerpo?.departamento && !!leido.cuerpo?.pais);
  revisar("y con el perfil de cliente", leido.cuerpo?.perfiles?.includes("cliente"));
  revisar("la contrasena nunca sale en la respuesta",
          leido.cuerpo && !("contrasena" in leido.cuerpo));

  const entraNuevo = await pedir("/sesion", {
    method: "POST", body: JSON.stringify({ correo, contrasena: "Clave2026" })
  });
  revisar("el cliente nuevo puede iniciar sesion", entraNuevo.estado === 200);

  // -------------------------------------------------------- actualizar ----
  console.log("\nActualizacion y borrado");
  const actualizado = await pedir("/personas/" + identificacion, {
    method: "PUT", token: nuevo.cuerpo.token,
    body: JSON.stringify({ nombres: "Ana Maria", apellidos: "Gomez Ruiz", correo,
                           direccion: "Carrera 9 # 8-7", id_ciudad: 2, telefonos: ["3009998877"] })
  });
  revisar("se actualiza la direccion y la ciudad",
          actualizado.estado === 200 && actualizado.cuerpo.direccion === "Carrera 9 # 8-7");
  revisar("y queda con un solo telefono", actualizado.cuerpo?.telefonos?.length === 1);

  const noExiste = await pedir("/personas/00000000", { token: admin.cuerpo.token });
  revisar("una persona que no existe da 404", noExiste.estado === 404);

  const ciudadConGente = await pedir("/ciudades/1", { method: "DELETE", token: admin.cuerpo.token });
  revisar("no deja borrar una ciudad que tiene personas o eventos", ciudadConGente.estado === 409);

  const paisConHijos = await pedir("/paises/1", { method: "DELETE", token: admin.cuerpo.token });
  revisar("no deja borrar un pais que tiene departamentos", paisConHijos.estado === 409);

  // limpieza: se borra la persona de prueba
  const borrada = await pedir("/personas/" + identificacion, {
    method: "DELETE", token: admin.cuerpo.token
  });
  revisar("se borra la persona de prueba", borrada.estado === 204);

  // ------------------------------------------------------------ cierre ----
  console.log("\n" + "-".repeat(56));
  console.log("  pasaron " + pasadas + " de " + (pasadas + falladas) + " comprobaciones");
  console.log("-".repeat(56) + "\n");
  process.exit(falladas === 0 ? 0 : 1);
}

principal().catch((error) => {
  console.error("\nLa prueba se cayo:", error.message, "\n");
  process.exit(1);
});
