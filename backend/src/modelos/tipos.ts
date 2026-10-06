// Los tipos del dominio. Son los mismos nombres de las tablas del modelo
// relacional, para no tener que traducir mentalmente entre el SQL y el código.

export type Perfil = "cliente" | "agente" | "administrador";

export const ESTADOS_EVENTO = [
  "Programado",
  "En Boleteria",
  "En Vivo",
  "Finalizado",
  "Cancelado"
] as const;

export const ESTADOS_RESERVA = ["Reservada", "Confirmada", "Cancelada"] as const;

export type EstadoEvento = (typeof ESTADOS_EVENTO)[number];
export type EstadoReserva = (typeof ESTADOS_RESERVA)[number];

export interface Pais {
  id_pais: number;
  nombre: string;
}

export interface Departamento {
  id_departamento: number;
  nombre: string;
  id_pais: number;
}

export interface Ciudad {
  id_ciudad: number;
  nombre: string;
  id_departamento: number;
}

export interface Persona {
  identificacion: string;
  nombres: string;
  apellidos: string;
  correo: string;
  direccion: string | null;
  id_ciudad: number;
}

/** Lo que guarda la base de datos, con la contraseña cifrada. Nunca sale de los servicios. */
export interface PersonaConContrasena extends Persona {
  contrasena: string;
}

export interface Cliente {
  identificacion: string;
  puntos: number;
  ve_publicidad: boolean;
}

export interface Agente {
  identificacion: string;
  comision: number;
  experiencia: number;
}

export interface Administrador {
  identificacion: string;
  salario: number;
  horario: string;
}

export interface Evento {
  codigo_evento: number;
  nombre: string;
  descripcion: string | null;
  teatro: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  capacidad_total: number;
  precio_base: number;
  observaciones: string | null;
  estado: EstadoEvento;
  causa_cancelacion: string | null;
  id_ciudad: number;
  identificacion_agente: string;
}

/** Lo que devuelve la vista vista_evento: el evento con su ubicación y sus cupos. */
export interface EventoCompleto extends Evento {
  ciudad: string;
  departamento: string;
  pais: string;
  id_departamento: number;
  id_pais: number;
  agente: string;
  cupos_disponibles: number;
}

export interface Reserva {
  id_reserva: number;
  fecha_hora: string;
  numero_entradas: number;
  observaciones: string | null;
  estado: EstadoReserva;
  causa_cancelacion: string | null;
  identificacion_cliente: string;
  codigo_evento: number;
}

/** Lo que devuelve la vista vista_reserva: la reserva con su valor total. */
export interface ReservaCompleta extends Reserva {
  cliente: string;
  correo_cliente: string;
  evento: string;
  fecha_evento: string;
  teatro: string;
  ciudad: string;
  precio_base: number;
  identificacion_agente: string;
  valor_total: number;
}

export interface UsuarioEnSesion {
  identificacion: string;
  nombre: string;
  correo: string;
  perfil: Perfil;
}
