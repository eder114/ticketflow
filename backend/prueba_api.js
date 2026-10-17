// Prueba de la API de punta a punta.
//
// Recorre todo lo que entregamos: el inicio de sesion, los permisos por
// perfil, las listas de ubicacion, el CRUD de personas, el catalogo de
// eventos, las reservas con su control de aforo y los reportes. No usa
// ninguna libreria: solo fetch, que ya viene en Node.
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

  // ----------------------------------------------------------- eventos ----
  console.log("\nCatalogo de eventos");
  const catalogo = await pedir("/eventos");
  revisar("el catalogo se ve sin necesidad de sesion",
          catalogo.estado === 200 && catalogo.cuerpo.length >= 12);
  revisar("cada evento trae su ciudad, su agente y los cupos que le quedan",
          !!catalogo.cuerpo[0]?.ciudad && !!catalogo.cuerpo[0]?.agente &&
          catalogo.cuerpo[0]?.cupos_disponibles !== undefined);

  const porCiudad = await pedir("/eventos?ciudad=1");
  revisar("filtra los eventos por ciudad",
          porCiudad.estado === 200 && porCiudad.cuerpo.every((e) => e.id_ciudad === 1));

  const porTexto = await pedir("/eventos?texto=salsa");
  revisar("busca por nombre del evento o del teatro",
          porTexto.estado === 200 && porTexto.cuerpo.length >= 1);

  const conCupos = await pedir("/eventos?conCupos=true");
  revisar("puede dejar solo los que todavia tienen cupos",
          conCupos.cuerpo.every((e) => Number(e.cupos_disponibles) > 0));

  const eventoNoExiste = await pedir("/eventos/999999");
  revisar("un evento que no existe da 404", eventoNoExiste.estado === 404);

  // Se crea un evento chiquito, de cinco puestos, para probar el aforo.
  const nuevoEvento = await pedir("/eventos", {
    method: "POST", token: agente.cuerpo.token,
    body: JSON.stringify({
      nombre: "Evento de prueba automatica",
      descripcion: "Lo crea la prueba y lo borra al final.",
      teatro: "Sala de pruebas",
      fecha_hora_inicio: "2027-06-10 19:00",
      fecha_hora_fin: "2027-06-10 22:00",
      capacidad_total: 5, precio_base: 20000, id_ciudad: 1
    })
  });
  revisar("el agente registra un evento nuevo", nuevoEvento.estado === 201, nuevoEvento.cuerpo?.error);
  const codigo = nuevoEvento.cuerpo?.codigo_evento;
  revisar("queda a nombre del agente que lo creo",
          nuevoEvento.cuerpo?.identificacion_agente === "94567123");
  revisar("y arranca con todos los cupos libres",
          Number(nuevoEvento.cuerpo?.cupos_disponibles) === 5);

  const fechasAlReves = await pedir("/eventos", {
    method: "POST", token: agente.cuerpo.token,
    body: JSON.stringify({
      nombre: "Fechas al reves", teatro: "Sala de pruebas",
      fecha_hora_inicio: "2027-06-10 22:00", fecha_hora_fin: "2027-06-10 19:00",
      capacidad_total: 10, precio_base: 1000, id_ciudad: 1
    })
  });
  revisar("no deja que el evento termine antes de empezar",
          fechasAlReves.estado === 400 && !!fechasAlReves.cuerpo?.detalles?.fecha_hora_fin);

  revisar("un cliente no puede crear eventos",
          (await pedir("/eventos", { method: "POST", token: cliente.cuerpo.token,
                                     body: JSON.stringify({ nombre: "No" }) })).estado === 403);

  const mios = await pedir("/eventos/mios", { token: agente.cuerpo.token });
  revisar("el agente solo ve los eventos suyos",
          mios.estado === 200 && mios.cuerpo.every((e) => e.identificacion_agente === "94567123"));

  // ---------------------------------------------------------- reservas ----
  console.log("\nReservas y control de aforo");
  const reserva = await pedir("/reservas", {
    method: "POST", token: cliente.cuerpo.token,
    body: JSON.stringify({ codigo_evento: codigo, numero_entradas: 2,
                           observaciones: "Prueba automatica." })
  });
  revisar("el cliente reserva dos entradas", reserva.estado === 201, reserva.cuerpo?.error);
  revisar("el valor total es las entradas por el precio base",
          Number(reserva.cuerpo?.valor_total) === 40000);
  revisar("y la reserva nace en estado Reservada", reserva.cuerpo?.estado === "Reservada");

  const idReserva = reserva.cuerpo?.id_reserva;

  const trasReservar = await pedir("/eventos/" + codigo);
  revisar("los cupos del evento bajan de una vez",
          Number(trasReservar.cuerpo?.cupos_disponibles) === 3);

  const sinCupo = await pedir("/reservas", {
    method: "POST", token: cliente.cuerpo.token,
    body: JSON.stringify({ codigo_evento: codigo, numero_entradas: 4 })
  });
  revisar("no vende mas entradas de las que caben", sinCupo.estado === 409);
  revisar("y dice cuantas quedan", /quedan 3/.test(sinCupo.cuerpo?.error || ""), sinCupo.cuerpo?.error);

  revisar("un agente no puede reservar a nombre propio",
          (await pedir("/reservas", { method: "POST", token: agente.cuerpo.token,
                                      body: JSON.stringify({ codigo_evento: codigo, numero_entradas: 1 })
                                    })).estado === 403);

  // Los codigos del catalogo cambian segun la base, asi que se buscan por estado.
  const unoCancelado = catalogo.cuerpo.find((e) => e.estado === "Cancelado");
  const eventoCancelado = await pedir("/reservas", {
    method: "POST", token: cliente.cuerpo.token,
    body: JSON.stringify({ codigo_evento: unoCancelado.codigo_evento, numero_entradas: 1 })
  });
  revisar("no se reserva en un evento cancelado", eventoCancelado.estado === 409);

  const unoFinalizado = catalogo.cuerpo.find((e) => e.estado === "Finalizado");
  const eventoViejo = await pedir("/reservas", {
    method: "POST", token: cliente.cuerpo.token,
    body: JSON.stringify({ codigo_evento: unoFinalizado.codigo_evento, numero_entradas: 1 })
  });
  revisar("ni en uno que ya paso", eventoViejo.estado === 409);

  const mias = await pedir("/reservas", { token: cliente.cuerpo.token });
  revisar("el cliente solo ve sus reservas",
          mias.estado === 200 &&
          mias.cuerpo.every((r) => r.identificacion_cliente === "1115789021"));

  const delAgente = await pedir("/reservas", { token: agente.cuerpo.token });
  revisar("el agente ve las de sus eventos",
          delAgente.estado === 200 &&
          delAgente.cuerpo.every((r) => r.identificacion_agente === "94567123"));

  revisar("un cliente no puede confirmar su propia reserva",
          (await pedir("/reservas/" + idReserva + "/estado", {
            method: "PATCH", token: cliente.cuerpo.token,
            body: JSON.stringify({ estado: "Confirmada" })
          })).estado === 403);

  const sinCausa = await pedir("/reservas/" + idReserva + "/estado", {
    method: "PATCH", token: cliente.cuerpo.token,
    body: JSON.stringify({ estado: "Cancelada" })
  });
  revisar("para cancelar hay que decir la causa",
          sinCausa.estado === 400 && !!sinCausa.cuerpo?.detalles?.causa_cancelacion);

  const antes = await pedir("/clientes/1115789021", { token: agente.cuerpo.token });
  const confirmada = await pedir("/reservas/" + idReserva + "/estado", {
    method: "PATCH", token: agente.cuerpo.token,
    body: JSON.stringify({ estado: "Confirmada" })
  });
  revisar("el agente confirma la reserva",
          confirmada.estado === 200 && confirmada.cuerpo.estado === "Confirmada");
  const despues = await pedir("/clientes/1115789021", { token: agente.cuerpo.token });
  revisar("al confirmar, el cliente gana un punto por entrada",
          Number(despues.cuerpo?.puntos) === Number(antes.cuerpo?.puntos) + 2);

  const cancelada = await pedir("/reservas/" + idReserva + "/estado", {
    method: "PATCH", token: cliente.cuerpo.token,
    body: JSON.stringify({ estado: "Cancelada", causa_cancelacion: "Prueba de cancelacion." })
  });
  revisar("el cliente si puede cancelar lo suyo",
          cancelada.estado === 200 && cancelada.cuerpo.estado === "Cancelada");
  revisar("y queda guardada la causa",
          cancelada.cuerpo?.causa_cancelacion === "Prueba de cancelacion.");

  const devueltos = await pedir("/eventos/" + codigo);
  revisar("la reserva cancelada devuelve los cupos",
          Number(devueltos.cuerpo?.cupos_disponibles) === 5);

  revisar("una reserva cancelada ya no se puede volver a mover",
          (await pedir("/reservas/" + idReserva + "/estado", {
            method: "PATCH", token: agente.cuerpo.token,
            body: JSON.stringify({ estado: "Confirmada" })
          })).estado === 409);

  // ------------------------------------------- cancelar un evento entero ----
  console.log("\nCancelacion de un evento");
  const otra = await pedir("/reservas", {
    method: "POST", token: cliente.cuerpo.token,
    body: JSON.stringify({ codigo_evento: codigo, numero_entradas: 1 })
  });
  revisar("se hace otra reserva para probar la cancelacion", otra.estado === 201);

  const estadoSinCausa = await pedir("/eventos/" + codigo + "/estado", {
    method: "PATCH", token: agente.cuerpo.token,
    body: JSON.stringify({ estado: "Cancelado" })
  });
  revisar("cancelar un evento tambien exige la causa",
          estadoSinCausa.estado === 400 && !!estadoSinCausa.cuerpo?.detalles?.causa_cancelacion);

  const eventoCanceladoOk = await pedir("/eventos/" + codigo + "/estado", {
    method: "PATCH", token: agente.cuerpo.token,
    body: JSON.stringify({ estado: "Cancelado", causa_cancelacion: "Prueba automatica." })
  });
  revisar("el agente cancela su evento con la causa",
          eventoCanceladoOk.estado === 200 && eventoCanceladoOk.cuerpo.estado === "Cancelado");

  const arrastradas = await pedir("/reservas?evento=" + codigo, { token: agente.cuerpo.token });
  revisar("al cancelar el evento se cancelan sus reservas",
          arrastradas.cuerpo.every((r) => r.estado === "Cancelada"));
  revisar("y la causa de la reserva explica que fue por el evento",
          /El evento fue cancelado/.test(
            arrastradas.cuerpo.find((r) => r.id_reserva === otra.cuerpo.id_reserva)?.causa_cancelacion || ""
          ));

  // ---------------------------------------------------------- reportes ----
  console.log("\nReportes del administrador");
  revisar("un cliente no puede ver los reportes",
          (await pedir("/reportes/general", { token: cliente.cuerpo.token })).estado === 403);
  revisar("un agente tampoco",
          (await pedir("/reportes/general", { token: agente.cuerpo.token })).estado === 403);

  const general = await pedir("/reportes/general", { token: admin.cuerpo.token });
  revisar("el reporte general cuenta los registros del sistema",
          general.estado === 200 && general.cuerpo.clientes >= 4 && general.cuerpo.eventos >= 12);

  const ingAgente = await pedir("/reportes/ingresos-por-agente", { token: admin.cuerpo.token });
  revisar("hay ingresos y promedio por agente",
          ingAgente.estado === 200 &&
          ingAgente.cuerpo.some((f) => f.identificacion === "94567123" &&
                                       f.promedio_por_evento !== undefined));

  const ingCliente = await pedir("/reportes/ingresos-por-cliente", { token: admin.cuerpo.token });
  revisar("y promedio de gasto por cliente",
          ingCliente.estado === 200 && ingCliente.cuerpo.length >= 4);

  const porMes = await pedir("/reportes/ingresos-por-mes?anio=2026", { token: admin.cuerpo.token });
  revisar("los ingresos salen mes a mes",
          porMes.estado === 200 && porMes.cuerpo.every((f) => Number(f.mes) >= 1 && Number(f.mes) <= 12));

  const reservasMes = await pedir("/reportes/reservas-por-evento", { token: admin.cuerpo.token });
  revisar("se cuentan las reservas por evento y por mes", reservasMes.estado === 200);

  const porAgenteCiudad = await pedir("/reportes/eventos-por-agente", { token: admin.cuerpo.token });
  revisar("los eventos se agrupan por agente y ciudad",
          porAgenteCiudad.estado === 200 && porAgenteCiudad.cuerpo.length >= 1);

  const porUbicacion = await pedir("/reportes/eventos-por-ubicacion", { token: admin.cuerpo.token });
  revisar("y por pais, departamento y ciudad",
          porUbicacion.estado === 200 && !!porUbicacion.cuerpo[0]?.pais);

  const historial = await pedir("/reportes/historial/1115789021", { token: admin.cuerpo.token });
  revisar("se puede ver el historial de un cliente",
          historial.estado === 200 && historial.cuerpo.length >= 1);

  const canceladas = await pedir("/reportes/reservas-canceladas", { token: admin.cuerpo.token });
  revisar("las reservas canceladas salen con su causa",
          canceladas.estado === 200 && canceladas.cuerpo.every((r) => !!r.causa_cancelacion));

  const eventosCancelados = await pedir("/reportes/eventos-cancelados", { token: admin.cuerpo.token });
  revisar("los eventos cancelados tambien",
          eventosCancelados.estado === 200 &&
          eventosCancelados.cuerpo.every((e) => !!e.causa_cancelacion));

  const tablero = await pedir("/reportes/tablero", { token: admin.cuerpo.token });
  revisar("el tablero trae todo junto en una sola llamada",
          tablero.estado === 200 && !!tablero.cuerpo.resumen && Array.isArray(tablero.cuerpo.porAgente));

  // limpieza: se borran las reservas y el evento de prueba
  for (const r of arrastradas.cuerpo) {
    await pedir("/reservas/" + r.id_reserva, { method: "DELETE", token: admin.cuerpo.token });
  }
  const eventoBorrado = await pedir("/eventos/" + codigo, {
    method: "DELETE", token: admin.cuerpo.token
  });
  revisar("se borra el evento de prueba", eventoBorrado.estado === 204, eventoBorrado.cuerpo?.error);

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
