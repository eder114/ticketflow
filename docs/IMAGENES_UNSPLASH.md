# Imágenes reales para TicketFlow (Unsplash)

Este documento contiene URLs de imágenes libres (Unsplash) para reemplazar los rectángulos/gradientes de placeholder en el diseño de Figma. Todas las imágenes son de uso libre — solo hay que dar créditos al fotógrafo si se van a publicar comercialmente (para el proyecto académico no es obligatorio, pero es buena práctica).

## Cómo arrastrar una imagen a Figma

1. Abre la URL de la imagen en el navegador (te abre la foto en grande).
2. **Click derecho → "Guardar imagen como…"** y descárgala.
3. En Figma, selecciona el rectángulo placeholder (por ejemplo, el hero de la Landing).
4. **Arrastra la imagen descargada desde tu explorador de archivos DIRECTAMENTE encima del rectángulo** — Figma la aplica como fill de la forma, manteniendo el tamaño y radios.
5. Si quieres que llene el rectángulo sin deformarse, en el panel derecho cambia "Fill" a **"Fill" mode** (no "Fit").

Alternativa aún más rápida: click derecho sobre el rectángulo → Fill → **Image** → seleccionar archivo.

---

## Imágenes por sección

### Hero de la Landing (paisajes de conciertos épicos)
- https://unsplash.com/photos/silhouette-photography-of-people-inside-building-during-concert-M0AWNxnLaMw (multitud con luces)
- https://unsplash.com/photos/people-in-concert-during-nighttime-lppFMhTdyEE (escenario con humo)
- https://unsplash.com/photos/silhouette-of-people-attending-a-concert-Zi8-E3qJ_RM (silueta atardecer)

### Karol G / conciertos de reggaetón/pop
- https://unsplash.com/photos/woman-singing-on-stage-9WBIL-QAJnk (cantante en escenario, luces rosas)
- https://unsplash.com/photos/people-gathered-outside-buildings-and-vehicles-Twt6uadYRZ0 (festival al aire libre)
- https://unsplash.com/photos/people-in-front-of-stage-jWVjSnwZ8Vg (multitud vista desde el escenario)

### Andrés Cepeda / música acústica
- https://unsplash.com/photos/man-playing-guitar-during-daytime-1SAnrIxw5OY (guitarrista solista)
- https://unsplash.com/photos/silhouette-of-man-playing-guitar-cQwPcpRQ8xI (guitarrista silueta)

### Hamilton / teatro musical
- https://unsplash.com/photos/red-theater-curtain-b7DPmMOxJmA (telón rojo clásico)
- https://unsplash.com/photos/theater-hall-QpP7cVQdIL8 (butacas de teatro rojas)
- https://unsplash.com/photos/theatre-stage-with-spotlight-N4mQmzVK6ec (escenario iluminado)

### Millonarios vs Nacional / fútbol / El Campín
- https://unsplash.com/photos/soccer-stadium-during-daytime-fWx7T61pFMs (estadio lleno de día)
- https://unsplash.com/photos/aerial-view-of-soccer-stadium-jz2LqFbMPQU (estadio aéreo con hinchada)
- https://unsplash.com/photos/soccer-ball-on-green-grass-field-during-daytime-h-XR4jJf3iM (balón)

### Festival Cordillera / festivales al aire libre
- https://unsplash.com/photos/people-partying-with-confetti-EQSPI11rf68 (confeti festival)
- https://unsplash.com/photos/people-attending-outdoor-festival-9x8g6mTn2GY (festival día)
- https://unsplash.com/photos/aerial-photo-of-people-in-concert-vhaqcSKgRxg (festival aéreo)

### Circo del Sol / familia / entretenimiento
- https://unsplash.com/photos/red-and-yellow-circus-tent-8m5EtVYqXag (carpa de circo)
- https://unsplash.com/photos/woman-in-red-dress-doing-acrobatics-3wPJxh-piRw (acróbata aérea)

### Silvestre Dangond / vallenato / música regional
- https://unsplash.com/photos/man-playing-accordion-XA51lo3wZBM (acordeonero)

### Stand up comedy / teatro cómico
- https://unsplash.com/photos/man-on-stage-with-microphone-BdOqjnk9tyM (comediante con micrófono)

### Fotos de agentes/organizadores (para avatares del panel Agente)
- https://unsplash.com/photos/woman-portrait-mEZ3PoFGs_k (mujer sonriendo profesional)
- https://unsplash.com/photos/man-portrait-professional-iFgRcqHznqg (hombre profesional)

---

## Trucos rápidos en Figma

**Reemplazar TODAS las imágenes de una vez:**
1. Selecciona todos los rectángulos placeholder (con `Shift+click` o arrastrando marquee).
2. En el panel derecho, elimina el fill actual y agrega uno nuevo → Image → selecciona archivo.
3. Figma aplica la misma imagen a todos — luego los cambias uno por uno.

**Poner una imagen como fondo con overlay oscuro (para heros con texto encima):**
1. Aplica la imagen al rectángulo.
2. Agrega un segundo fill encima → Solid → color negro con opacity 40-60%.
3. Reordena los fills si es necesario (arrástralos en el panel).

**Que la imagen "sangre" al borde del frame (full-bleed):**
1. Selecciona el rectángulo del hero.
2. Extiéndelo hasta que toque los bordes izquierdo y derecho del frame padre.
3. Si el frame padre tiene padding, quita el padding solo para ese hijo con "Absolute position" (Shift+A).

---

## Nota

Estas URLs pueden cambiar si Unsplash reorganiza su catálogo. Si alguna no funciona, ve a **unsplash.com** y busca con los términos: "concert lights", "stadium crowd", "theater stage", "circus tent", etc.
