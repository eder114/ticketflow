// Dónde está la API.
//
// Si queda en null, la aplicación decide sola: en localhost busca el backend
// en el puerto 4000, y en cualquier otro lado (por ejemplo GitHub Pages) se
// queda con los datos de ejemplo.
//
// Cuando la API esté publicada en internet, se escribe aquí su dirección y
// con eso la página de GitHub queda hablando con la base de datos de verdad:
//
//   window.TICKETFLOW_API = "https://ticketflow-api.onrender.com/api";
//
// La API está publicada en Render y la base de datos en Neon. En el
// computador conviene dejarla en null para trabajar contra el backend local.

window.TICKETFLOW_API = "https://ticketflow-api-vafd.onrender.com/api";
