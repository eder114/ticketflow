// Mapa de rutas de la API. Cada línea dice quién puede llamarla.
import { Router } from "express";
import { atrapar } from "../middleware/errores";
import { conPerfil, conSesion } from "../middleware/sesion";
import * as autenticacion from "../controladores/autenticacion";
import * as personas from "../controladores/personas";
import * as ubicacion from "../controladores/ubicacion";
import * as eventos from "../controladores/eventos";
import * as reservas from "../controladores/reservas";
import * as reportes from "../controladores/reportes";

const rutas = Router();

const soloAdmin = conPerfil("administrador");
const adminOAgente = conPerfil("administrador", "agente");
const soloCliente = conPerfil("cliente");

// ---------------------------------------------------------- autenticación --

rutas.post("/sesion", atrapar(autenticacion.iniciarSesion));
rutas.get("/sesion", conSesion, atrapar(autenticacion.sesionActual));
rutas.post("/registro/cliente", atrapar(autenticacion.registrarCliente));
rutas.post("/registro/agente", atrapar(autenticacion.registrarAgente));

// -------------------------------------------------------------- ubicación --
// Leer es público: los formularios de registro necesitan las listas antes de
// que el usuario tenga sesión. Modificar es solo del administrador.

rutas.get("/paises", atrapar(ubicacion.listarPaises));
rutas.get("/paises/:id", atrapar(ubicacion.obtenerPais));
rutas.post("/paises", soloAdmin, atrapar(ubicacion.crearPais));
rutas.put("/paises/:id", soloAdmin, atrapar(ubicacion.actualizarPais));
rutas.delete("/paises/:id", soloAdmin, atrapar(ubicacion.eliminarPais));

rutas.get("/departamentos", atrapar(ubicacion.listarDepartamentos));
rutas.get("/departamentos/:id", atrapar(ubicacion.obtenerDepartamento));
rutas.post("/departamentos", soloAdmin, atrapar(ubicacion.crearDepartamento));
rutas.put("/departamentos/:id", soloAdmin, atrapar(ubicacion.actualizarDepartamento));
rutas.delete("/departamentos/:id", soloAdmin, atrapar(ubicacion.eliminarDepartamento));

rutas.get("/ciudades", atrapar(ubicacion.listarCiudades));
rutas.get("/ciudades/:id", atrapar(ubicacion.obtenerCiudad));
rutas.post("/ciudades", soloAdmin, atrapar(ubicacion.crearCiudad));
rutas.put("/ciudades/:id", soloAdmin, atrapar(ubicacion.actualizarCiudad));
rutas.delete("/ciudades/:id", soloAdmin, atrapar(ubicacion.eliminarCiudad));

// --------------------------------------------------------------- personas --

rutas.get("/personas", soloAdmin, atrapar(personas.listar));
rutas.get("/personas/:identificacion", conSesion, atrapar(personas.obtener));
rutas.post("/personas", soloAdmin, atrapar(personas.crear));
rutas.put("/personas/:identificacion", conSesion, atrapar(personas.actualizar));
rutas.delete("/personas/:identificacion", soloAdmin, atrapar(personas.eliminar));

rutas.get("/clientes", adminOAgente, atrapar(personas.listarClientes));
rutas.get("/clientes/:identificacion", conSesion, atrapar(personas.obtenerCliente));
rutas.post("/clientes", soloAdmin, atrapar(personas.crearCliente));
rutas.put("/clientes/:identificacion", conSesion, atrapar(personas.actualizarCliente));
rutas.delete("/clientes/:identificacion", soloAdmin, atrapar(personas.eliminarCliente));

rutas.get("/agentes", soloAdmin, atrapar(personas.listarAgentes));
rutas.get("/agentes/:identificacion", conSesion, atrapar(personas.obtenerAgente));
rutas.post("/agentes", soloAdmin, atrapar(personas.crearAgente));
rutas.put("/agentes/:identificacion", conSesion, atrapar(personas.actualizarAgente));
rutas.delete("/agentes/:identificacion", soloAdmin, atrapar(personas.eliminarAgente));

rutas.get("/administradores", soloAdmin, atrapar(personas.listarAdministradores));
rutas.get("/administradores/:identificacion", soloAdmin, atrapar(personas.obtenerAdministrador));
rutas.post("/administradores", soloAdmin, atrapar(personas.crearAdministrador));
rutas.put("/administradores/:identificacion", soloAdmin, atrapar(personas.actualizarAdministrador));
rutas.delete("/administradores/:identificacion", soloAdmin, atrapar(personas.eliminarAdministrador));

// ---------------------------------------------------------------- eventos --
// El catálogo es público. Crear y modificar es del agente (los suyos) y del
// administrador (todos).

rutas.get("/eventos", atrapar(eventos.listar));
rutas.get("/eventos/mios", adminOAgente, atrapar(eventos.listarMios));
rutas.get("/eventos/:codigo", atrapar(eventos.obtener));
rutas.post("/eventos", adminOAgente, atrapar(eventos.crear));
rutas.put("/eventos/:codigo", adminOAgente, atrapar(eventos.actualizar));
rutas.patch("/eventos/:codigo/estado", adminOAgente, atrapar(eventos.cambiarEstado));
rutas.delete("/eventos/:codigo", soloAdmin, atrapar(eventos.eliminar));

// --------------------------------------------------------------- reservas --
// Cada perfil ve lo suyo: el cliente sus reservas, el agente las de sus
// eventos y el administrador todas.

rutas.get("/reservas", conSesion, atrapar(reservas.listar));
rutas.get("/reservas/:id", conSesion, atrapar(reservas.obtener));
rutas.post("/reservas", soloCliente, atrapar(reservas.crear));
rutas.patch("/reservas/:id/estado", conSesion, atrapar(reservas.cambiarEstado));
rutas.delete("/reservas/:id", soloAdmin, atrapar(reservas.eliminar));

// --------------------------------------------------------------- reportes --
// Son los del enunciado y los ve solo el administrador.

rutas.get("/reportes/tablero", soloAdmin, atrapar(reportes.tablero));
rutas.get("/reportes/general", soloAdmin, atrapar(reportes.general));
rutas.get("/reportes/ingresos-por-agente", soloAdmin, atrapar(reportes.ingresosPorAgente));
rutas.get("/reportes/ingresos-por-cliente", soloAdmin, atrapar(reportes.ingresosPorCliente));
rutas.get("/reportes/ingresos-por-mes", soloAdmin, atrapar(reportes.ingresosPorMes));
rutas.get("/reportes/reservas-por-evento", soloAdmin, atrapar(reportes.reservasPorEventoYMes));
rutas.get("/reportes/eventos-por-agente", soloAdmin, atrapar(reportes.eventosPorAgenteYCiudad));
rutas.get("/reportes/eventos-por-ubicacion", soloAdmin, atrapar(reportes.eventosPorUbicacion));
rutas.get("/reportes/historial/:identificacion", soloAdmin, atrapar(reportes.historialDeCliente));
rutas.get("/reportes/reservas-canceladas", soloAdmin, atrapar(reportes.reservasCanceladas));
rutas.get("/reportes/eventos-cancelados", soloAdmin, atrapar(reportes.eventosCancelados));

export default rutas;
