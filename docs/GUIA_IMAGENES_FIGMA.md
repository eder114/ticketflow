# Guía · Cómo poner las imágenes reales en Figma v4

**Por qué no lo hice yo directamente:** el API del plugin de Figma (a través de MCP) no permite `createImageAsync` desde URLs externas — está bloqueado. Es limitación de la plataforma, no falta de esfuerzo. Ya lo probé.

**La solución:** te dejé 14 imágenes reales descargadas y organizadas en tu computador. Solo tienes que arrastrarlas al Figma. Toma **~15 minutos totales** para las 8 pantallas ya construidas.

---

## Dónde están las imágenes

**Carpeta principal:** `C:\Users\ederf\Downloads\TicketFlow_Imagenes\`

Contiene:
- 13 **screenshots completos** de las pantallas de Stitch (referencia visual, no para usar en Figma)
- Subcarpeta `eventos/` con **14 imágenes individuales** listas para arrastrar

---

## Las 14 imágenes de la subcarpeta `eventos/`

| Archivo | Contenido | Para qué pantalla |
|---|---|---|
| `01_hero_festival_cordillera.jpg` | Multitud concierto atardecer con montañas | **Landing** — hero grande derecha (rectángulo terracota) |
| `02_karol_g.jpg` | Cantante mujer en escenario con luces rosadas | **Landing** — card 1 (Karol G) · **Catálogo** · **Reservas por evento** |
| `03_el_principito_teatro.jpg` | Escena de teatro dos personajes | **Landing** — card 2 (El Principito) · **Catálogo** |
| `04_millonarios_futbol.jpg` | Jugadores de fútbol partido | **Landing** — card 3 (Millonarios) · **Catálogo** |
| `05_estereo_picnic.jpg` | Escenario iluminado nocturno multitud | **Landing** — card 4 (Estéreo Picnic) · **Catálogo** |
| `06_hamilton_hero.jpg` | Actores en escenario Hamilton | **Detalle** — hero full-bleed grande arriba |
| `07_cast_lin_manuel.jpg` | Retrato Lin-Manuel Miranda como Hamilton | **Detalle** — círculo cast 1 |
| `08_cast_leslie.jpg` | Retrato Leslie Odom Jr como Aaron Burr | **Detalle** — círculo cast 2 |
| `09_cast_phillipa.jpg` | Retrato Phillipa Soo (mujer teatro) | **Detalle** — círculo cast 3 |
| `10_cast_jonathan.jpg` | Retrato Jonathan Groff como King George | **Detalle** — círculo cast 4 |
| `11_login_editorial.jpg` | Foto vertical editorial teatro | **Login** — poster grande izquierda |
| `12_registro_cliente.jpg` | Foto editorial reservación | **Registro Cliente** — opcional decorativo |
| `13_panel_hero.jpg` | Foto ambiental cliente | **Panel Cliente** — banner (cuando la construya) |
| `14_panel_ticket.jpg` | Foto de ticket/reserva | **Confirmación** — mini poster del ticket |

---

## Paso a paso · arrastrar una imagen en Figma

### Método 1 — arrastrar-y-soltar (más rápido, 10 segundos por rectángulo)

1. Abre el archivo de Figma: https://www.figma.com/design/Z9VgdAPCHmY9ssVf4j1jOJ
2. Ve a la página **🖼️ All Screens (14)**
3. En Windows, abre el explorador de archivos → navega a `C:\Users\ederf\Downloads\TicketFlow_Imagenes\eventos\`
4. **Selecciona en Figma** el rectángulo con gradiente terracota (por ejemplo, el hero del Landing)
5. **Arrastra la imagen** desde el explorador directo al canvas de Figma, encima del rectángulo seleccionado
6. Figma automáticamente reemplaza el fill con la imagen y mantiene el tamaño

### Método 2 — desde el panel derecho (más control)

1. Selecciona el rectángulo en Figma
2. En el panel derecho, sección **Fill** → click en el swatch de color actual
3. Se abre un dropdown → cambia el tipo de "Solid" a **"Image"**
4. Click "Choose image..." → navega a la carpeta `TicketFlow_Imagenes/eventos/` → selecciona
5. En el mismo modal cambia el modo a **"Fill"** (para que la imagen llene el rectángulo sin deformarse)

### Método 3 — múltiples imágenes de una vez (para el catálogo con 8 cards)

1. Selecciona las 8 tarjetas del catálogo con `Shift+click`
2. Abre el explorador con las imágenes
3. Selecciona las 8 imágenes con `Ctrl+A`
4. Arrastra todas juntas al Figma
5. Figma te pregunta si quieres asignar una imagen a cada rectángulo → click "Sí"

---

## Truco extra · el overlay oscuro se mantiene

En las pantallas v4 ya construidas, cada "poster" tiene:
1. Un rectángulo con gradiente terracota (el fill que reemplazas por la imagen)
2. Un overlay negro semi-transparente ENCIMA (para que los textos blancos se lean)
3. El emoji + textos overlay

Cuando arrastras la imagen, **solo se reemplaza el fill del rectángulo de fondo** — el overlay y los textos siguen ahí. Va a verse como en las capturas de Stitch: foto real de evento + oscurecido leve + texto blanco encima.

---

## Orden recomendado (empezar por lo más visible)

1. **Landing → hero derecha** (`01_hero_festival_cordillera.jpg`) — es lo primero que vas a ver
2. **Landing → 4 cards** (`02` a `05`) — es la sección "Eventos destacados"
3. **Detalle → hero full-bleed** (`06_hamilton_hero.jpg`) — más dramático
4. **Detalle → 4 cast circulares** (`07` a `10`) — Lin-Manuel, Leslie, Phillipa, Jonathan
5. **Login → poster grande izquierda** (`11_login_editorial.jpg`)
6. **Catálogo → 8 cards** (reusa `02`, `03`, `04`, `05` + 4 más de las que quieras)

Con esos 15 rectángulos reemplazados el diseño se ve terminado y profesional.

---

## Comparación

**Antes (ahora):** rectángulos con gradiente terracota + emoji superpuesto → "se ve el layout pero es genérico"

**Después:** fotos reales de conciertos, teatro y estadios → "se ve como app terminada de producción"

Es exactamente el mismo diseño de v4 (paleta editorial, tipografía Literata + Manrope, layout Stitch), solo que con las fotos reales encima de los placeholders.
