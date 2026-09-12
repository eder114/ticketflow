# GSAP Animations · TicketFlow

Guía de animaciones para el frontend de TicketFlow, aprendidas del repo oficial [greensock/gsap-skills](https://github.com/greensock/gsap-skills) y adaptadas a nuestro stack **TypeScript + HTML + Bootstrap** (patrón MVC, sin React).

## Instalación

```bash
cd frontend
npm install gsap
```

Import base (en `frontend/src/lib/animations.ts` o similar):

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
```

> **Nota:** SplitText y Flip son plugins del **Club GreenSock** (gratis desde 2024). Si tu `npm install gsap` no los trae, revisa `https://gsap.com/docs/v3/Installation`.

---

## Convenciones del proyecto

- Todas las animaciones se agrupan en `frontend/src/animations/` por pantalla
- Cada archivo exporta una función `init<NombreDePantalla>Animations()` que se llama al cargar la vista
- Duraciones estándar: `0.4s` (micro), `0.8s` (macro), `1.2s` (hero)
- Easing por defecto: `power2.out` para entradas, `power2.inOut` para transiciones, `back.out(1.7)` para bounces sutiles
- Todos los `stagger` usan `{ each: 0.08, from: "start" }` como base
- **Regla de accesibilidad:** envolver todo en `if (!prefersReducedMotion())` — respetar `prefers-reduced-motion: reduce`

```ts
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

---

## 1 · Landing / Home — Hero reveal + parallax + scroll cards

Aplica al frame **01v2 · Landing / Home (Vibrant)** del Figma.

### Hero — título letra por letra con SplitText

```ts
export function initLandingHero() {
  if (prefersReducedMotion()) return;

  const split = SplitText.create(".hero-title", { type: "chars,words" });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(".hero-kicker", { opacity: 0, y: 12, duration: 0.5 })
    .from(split.chars, {
      opacity: 0,
      y: 40,
      rotationX: -60,
      stagger: 0.02,
      duration: 0.8,
    }, "-=0.2")
    .from(".hero-subtitle", { opacity: 0, y: 16, duration: 0.6 }, "-=0.4")
    .from(".hero-search", { opacity: 0, y: 20, scale: 0.96, duration: 0.7, ease: "back.out(1.4)" }, "-=0.3")
    .from(".hero-chip", { opacity: 0, y: 12, stagger: 0.06, duration: 0.4 }, "-=0.2");
}
```

### Círculos decorativos flotantes

```ts
export function initFloatingShapes() {
  gsap.to(".hero-decor-1", { y: -30, x: 20, duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".hero-decor-2", { y: 40, x: -25, duration: 8, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.5 });
  gsap.to(".hero-decor-3", { y: -20, x: 15, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1 });
}
```

### Cards de eventos — stagger on scroll con batch

```ts
export function initEventCardsScroll() {
  gsap.set(".event-card", { opacity: 0, y: 40 });

  ScrollTrigger.batch(".event-card", {
    onEnter: (els) => {
      gsap.to(els, {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: "power2.out",
      });
    },
    start: "top 85%",
  });
}
```

### Categorías — tiles con hover levantándose

```ts
export function initCategoryHover() {
  document.querySelectorAll(".cat-tile").forEach((tile) => {
    tile.addEventListener("mouseenter", () => {
      gsap.to(tile, { y: -8, scale: 1.03, duration: 0.35, ease: "power2.out" });
    });
    tile.addEventListener("mouseleave", () => {
      gsap.to(tile, { y: 0, scale: 1, duration: 0.35, ease: "power2.out" });
    });
  });
}
```

---

## 2 · Detalle de evento — parallax hero + reserva sticky reveal

Aplica al frame **06v2 · Detalle de evento (Vibrant)**.

### Parallax del hero image al hacer scroll

```ts
export function initEventDetailParallax() {
  gsap.to(".event-hero-img", {
    yPercent: 30,
    ease: "none",
    scrollTrigger: {
      trigger: ".event-hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.to(".event-hero-title", {
    yPercent: -20,
    opacity: 0.4,
    ease: "none",
    scrollTrigger: {
      trigger: ".event-hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}
```

### Barra de disponibilidad animada al entrar

```ts
export function initAvailabilityBar() {
  const bar = document.querySelector<HTMLElement>(".availability-fill");
  if (!bar) return;

  const percent = parseFloat(bar.dataset.percent || "0");

  gsap.fromTo(bar,
    { width: "0%" },
    {
      width: `${percent}%`,
      duration: 1.4,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".availability-card",
        start: "top 80%",
        toggleActions: "play none none reset",
      },
    }
  );
}
```

### Zone selector — pulso al seleccionar

```ts
export function initZoneSelector() {
  document.querySelectorAll<HTMLElement>(".zone-option").forEach((zone) => {
    zone.addEventListener("click", () => {
      document.querySelectorAll(".zone-option").forEach(z => z.classList.remove("is-selected"));
      zone.classList.add("is-selected");
      gsap.fromTo(zone,
        { scale: 0.97 },
        { scale: 1, duration: 0.4, ease: "back.out(2)" }
      );
    });
  });
}
```

### Total dinámico — count-up

```ts
export function animateTotal(el: HTMLElement, from: number, to: number) {
  const obj = { val: from };
  gsap.to(obj, {
    val: to,
    duration: 0.6,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = "$" + Math.round(obj.val).toLocaleString("es-CO");
    },
  });
}
```

---

## 3 · Reserva confirmada — Flip + celebración

Aplica al frame **08 · Confirmación de reserva**.

### Success mark con dibujo animado + bounce

```ts
export function initConfirmationAnim() {
  const tl = gsap.timeline();

  tl.from(".success-icon", {
      scale: 0,
      rotation: -180,
      duration: 0.8,
      ease: "back.out(1.7)",
    })
    .from(".success-title", { opacity: 0, y: 20, duration: 0.6 }, "-=0.3")
    .from(".success-sub", { opacity: 0, y: 12, duration: 0.5 }, "-=0.3")
    .from(".ticket-card", { opacity: 0, y: 40, duration: 0.7, ease: "power2.out" }, "-=0.2")
    .from(".confirmation-actions button", { opacity: 0, y: 16, stagger: 0.08, duration: 0.5 }, "-=0.3");
}
```

### Confeti pop (usando shapes CSS o partículas)

```ts
export function popConfetti(targetEl: HTMLElement) {
  const colors = ["#3B4CFA","#EC4899","#F5A524","#00B8D4","#7C3AED"];
  for (let i = 0; i < 24; i++) {
    const dot = document.createElement("div");
    dot.className = "confetti-dot";
    dot.style.backgroundColor = colors[i % colors.length];
    targetEl.appendChild(dot);

    gsap.fromTo(dot,
      { x: 0, y: 0, scale: 0, opacity: 1 },
      {
        x: gsap.utils.random(-200, 200),
        y: gsap.utils.random(-300, -100),
        rotation: gsap.utils.random(-180, 180),
        scale: gsap.utils.random(0.5, 1.4),
        opacity: 0,
        duration: gsap.utils.random(0.8, 1.4),
        ease: "power2.out",
        onComplete: () => dot.remove(),
      }
    );
  }
}
```

---

## 4 · Panel Cliente — Flip para tabs + row hover

Aplica al frame **09v2 · Panel Cliente · Mis reservas (Vibrant)**.

### Tabs con Flip — cambio suave de contenido

```ts
export function initReservationTabs() {
  document.querySelectorAll<HTMLElement>(".tab-pill").forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.dataset.tab; // "proximas" | "pasadas" | "canceladas"
      const items = gsap.utils.toArray<HTMLElement>(".reservation-card");

      // Capture positions BEFORE change
      const state = Flip.getState(items);

      // Toggle visibility based on filter
      items.forEach((item) => {
        item.style.display = item.dataset.status === filter ? "" : "none";
      });

      document.querySelectorAll(".tab-pill").forEach(t => t.classList.remove("is-active"));
      tab.classList.add("is-active");

      // Animate from captured state to new positions
      Flip.from(state, {
        duration: 0.6,
        ease: "power2.inOut",
        stagger: 0.03,
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.3 }),
      });
    });
  });
}
```

### Cards de reserva — hover con lift + shadow

```ts
export function initReservationHover() {
  document.querySelectorAll(".reservation-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -4,
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        duration: 0.3,
        ease: "power2.out",
      });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        duration: 0.3,
        ease: "power2.out",
      });
    });
  });
}
```

---

## 5 · Dashboard Admin — KPIs count-up + charts entrance

Aplica al frame **13v2 · Admin Dashboard (Vibrant)**.

### Count-up de KPIs

```ts
export function initKpiCountUp() {
  document.querySelectorAll<HTMLElement>(".kpi-value").forEach((el) => {
    const to = parseFloat(el.dataset.value || "0");
    const format = el.dataset.format || "int"; // "int" | "currency" | "percent"
    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: to,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => {
            if (format === "currency") el.textContent = "$" + Math.round(obj.val).toLocaleString("es-CO");
            else if (format === "percent") el.textContent = obj.val.toFixed(1) + "%";
            else el.textContent = Math.round(obj.val).toLocaleString("es-CO");
          },
        });
      },
    });
  });
}
```

### Barras del chart — crecimiento animado

```ts
export function initChartBars() {
  gsap.from(".chart-bar", {
    scaleY: 0,
    transformOrigin: "bottom center",
    duration: 1,
    stagger: 0.08,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".revenue-chart",
      start: "top 80%",
      once: true,
    },
  });
}
```

### Ranking rows — fade in stagger

```ts
export function initRankingRows() {
  gsap.from(".ranking-row", {
    opacity: 0,
    x: -30,
    stagger: 0.1,
    duration: 0.6,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".ranking-card",
      start: "top 80%",
      once: true,
    },
  });
}
```

---

## 6 · Navigation — smooth scroll global

```ts
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);

export function initSmoothScroll() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      e.preventDefault();
      gsap.to(window, {
        duration: 1,
        scrollTo: { y: targetId, offsetY: 80 },
        ease: "power2.inOut",
      });
    });
  });
}
```

---

## 7 · Page transitions — fade + slide entre vistas MVC

Como el proyecto es MVC clásico con navegación entre `.html`, se pueden animar las transiciones con un overlay:

```ts
export function pageEnter() {
  gsap.from("main", { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" });
}

export function pageLeave(href: string) {
  gsap.to("main", {
    opacity: 0,
    y: -20,
    duration: 0.4,
    ease: "power2.in",
    onComplete: () => { window.location.href = href; },
  });
}
```

Uso:
```ts
document.querySelectorAll<HTMLAnchorElement>('a[data-page-nav]').forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    pageLeave(a.href);
  });
});

window.addEventListener("DOMContentLoaded", pageEnter);
```

---

## 8 · Init global — bootstrap único por página

```ts
// frontend/src/animations/index.ts
export function initAnimations(page: string) {
  initSmoothScroll();

  switch (page) {
    case "landing":
      initLandingHero();
      initFloatingShapes();
      initEventCardsScroll();
      initCategoryHover();
      break;
    case "event-detail":
      initEventDetailParallax();
      initAvailabilityBar();
      initZoneSelector();
      break;
    case "confirmation":
      initConfirmationAnim();
      break;
    case "client-panel":
      initReservationTabs();
      initReservationHover();
      break;
    case "admin-dashboard":
      initKpiCountUp();
      initChartBars();
      initRankingRows();
      break;
  }
}

// En cada .html:
// <script type="module">
//   import { initAnimations } from "/dist/animations/index.js";
//   initAnimations("landing");
// </script>
```

---

## 9 · Clases y `data-*` esperados en el HTML

Para que estos snippets funcionen sin modificarlos, el HTML debe usar estas clases:

| Pantalla | Clase / data-attr | Elemento |
|---|---|---|
| Landing | `.hero-title` | H1 del hero |
| Landing | `.hero-kicker`, `.hero-subtitle`, `.hero-search`, `.hero-chip` | Partes del hero |
| Landing | `.hero-decor-1/2/3` | Círculos decorativos |
| Landing | `.event-card` | Cada tarjeta de evento |
| Landing | `.cat-tile` | Cada tile de categoría |
| Detalle | `.event-hero`, `.event-hero-img`, `.event-hero-title` | Hero del evento |
| Detalle | `.availability-card`, `.availability-fill` con `data-percent="97.7"` | Barra de cupo |
| Detalle | `.zone-option` con `data-zone-id` | Cada opción de zona |
| Confirmación | `.success-icon`, `.success-title`, `.success-sub`, `.ticket-card`, `.confirmation-actions` | Bloque de éxito |
| Panel Cliente | `.tab-pill` con `data-tab="proximas/pasadas/canceladas"` | Tabs |
| Panel Cliente | `.reservation-card` con `data-status` | Cada card |
| Dashboard | `.kpi-value` con `data-value` y `data-format` | Cada KPI |
| Dashboard | `.chart-bar` | Cada barra del chart |
| Dashboard | `.revenue-chart`, `.ranking-card`, `.ranking-row` | Contenedores |

---

## 10 · Performance — reglas del skill `gsap-performance`

Aprendidas del repo oficial:

- **Prefiere transforms** (`x`, `y`, `scale`, `rotation`) sobre `top/left/width/height` — corren en la GPU
- Usa `will-change: transform` en CSS solo mientras la animación corre, quítalo después
- Para animar muchos elementos de una lista: `ScrollTrigger.batch()` es más eficiente que N ScrollTriggers individuales
- Nunca animes dentro de `for` loops sincronizados — GSAP ya batchea internamente
- `gsap.set()` para estado inicial es preferido sobre CSS inicial + `gsap.from()` cuando el estado inicial es visualmente feo (evita FOUC — flash of unstyled content)

---

## 11 · Cleanup entre pantallas (importante en MVC / SPA)

```ts
export function killAllAnimations() {
  ScrollTrigger.getAll().forEach(t => t.kill());
  gsap.killTweensOf("*");
}

// Llamar antes de cambiar de vista
window.addEventListener("beforeunload", killAllAnimations);
```

---

## Referencias

- Repo maestro: https://github.com/greensock/gsap-skills
- Docs GSAP: https://gsap.com/docs/v3/
- Ease visualizer: https://gsap.com/docs/v3/Eases
- ScrollTrigger docs: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
