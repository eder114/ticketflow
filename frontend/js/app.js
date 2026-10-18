// Arranque de TicketFlow
document.addEventListener("DOMContentLoaded", function () {
  SesionControlador.iniciar();
  EnrutadorControlador.iniciar();
  FormularioControlador.iniciar();
  BuscadorControlador.iniciar();
  MenuControlador.iniciar();
  CatalogoControlador.iniciar();
  EventoControlador.iniciar();
  AccesoControlador.iniciar();
  ReservaControlador.iniciar();
  ReporteControlador.iniciar();
  GestionControlador.iniciar();
  SelectorControlador.iniciar();
  ReservaPantallaControlador.iniciar();

  // El enrutador avisa de la pantalla apenas arranca, cuando los demás
  // controladores todavía no estaban escuchando; por eso se repite el aviso
  // una vez que ya están todos listos.
  document.dispatchEvent(new CustomEvent("ticketflow:pantalla", {
    detail: { pantalla: RutasModelo.actual(), parametro: RutasModelo.parametro() }
  }));
});
