# Modelado UML

Los tres diagramas UML del sistema. Responden al primer objetivo específico
del enunciado: representar la estructura, el comportamiento y el alcance de
TicketFlow.

| Diagrama | Qué representa | Archivos |
|---|---|---|
| **Casos de uso** | El alcance: los tres actores y lo que puede hacer cada uno | `Casos_de_Uso_TicketFlow.png` · `.svg` |
| **Clases** | La estructura: las clases del dominio, sus atributos, sus métodos y cómo se relacionan | `Diagrama_Clases_TicketFlow.png` · `.svg` |
| **Secuencia** | El comportamiento: el recorrido completo de una reserva de entradas | `Diagrama_Secuencia_Reserva_TicketFlow.png` · `.svg` |

Cada diagrama se genera con su propio script de Python:

```bash
python casos_uso.py
python diagrama_clases.py
python diagrama_secuencia.py
```

Cada uno escribe un `.svg` (vectorial, no se pixela al ampliarlo) y, si hay
Chrome instalado, también un `.png` para pegar en los documentos de entrega.
`comun.py` tiene los colores y la conversión a PNG que comparten los tres.

## Casos de uso

Trece casos de uso repartidos entre Cliente, Agente y Administrador, tal como
los define el enunciado en los perfiles de usuario.

Las relaciones entre casos de uso son de dos tipos:

- **«include»**: el caso base siempre ejecuta al incluido. Reservar entradas
  siempre pasa por iniciar sesión y por verificar los cupos disponibles.
- **«extend»**: el caso extendido solo pasa en ciertas condiciones. Registrar
  la causa de la cancelación solo ocurre cuando se cancela un evento o una
  reserva.

## Clases

Doce clases: las diez del modelo relacional más las dos enumeraciones de
estado. Las relaciones siguen las mismas cardinalidades del modelo
entidad-relación, para que los dos documentos digan lo mismo.

Dos detalles que vale la pena mirar:

- `Cliente`, `Agente` y `Administrador` heredan de `Persona`. Por eso en la
  base de datos las tres tablas comparten la identificación.
- `cuposDisponibles` y `valorTotal` van marcados con una barra (`/`): son
  atributos derivados, se calculan y no se guardan. En la base de datos
  corresponden a las vistas de `database/sql/vistas.sql`.

## Secuencia

El caso de uso de reservar entradas, desde que el cliente escoge cuántas
quiere hasta que la reserva queda guardada. Pasa por las tres capas del
frontend (vista y controlador), la API y la base de datos.

El marco `alt` separa los dos finales posibles: que el evento tenga cupos
suficientes, o que ya no queden y la reserva se rechace.
