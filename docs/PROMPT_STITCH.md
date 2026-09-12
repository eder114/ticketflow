# Prompt para Stitch — Alternativa visual de TicketFlow

Este archivo contiene el prompt maestro para pegar en **Stitch** (stitch.withgoogle.com) y generar una **segunda propuesta visual** de la interfaz de TicketFlow, para compararla con la ya construida en Figma.

Uso: pega el bloque "PROMPT MAESTRO" en Stitch tal cual. Después, si quieres iterar pantalla por pantalla, usa los prompts de la sección "Refinamientos por pantalla".

---

## PROMPT MAESTRO (copiar y pegar en Stitch)

```
Design a modern, warm and human ticketing web application called "TicketFlow" for the Colombian market. It competes with Tuboleta, Eventbrite and Ticketmaster but positions itself as more trustworthy and less corporate — the vibe should feel like an editorial magazine crossed with a friendly local venue, not a generic SaaS dashboard.

CONTEXT
- Product: web platform to browse concerts, theater, sports and family events across Colombia, reserve tickets, and manage bookings.
- Users: 3 roles — Cliente (buyer), Agente (event organizer), Administrador (analytics).
- Market: Bogotá, Medellín, Cali, Barranquilla. Spanish (es-CO), prices in COP (Colombian pesos, format "$120.000").
- Legal: PQRS route must be visible (Colombian consumer-rights law — this differentiates from Tuboleta which got sanctioned by SIC).

VISUAL DIRECTION (this is what makes it feel human, not generic)
- Editorial layout with generous whitespace, asymmetric hero sections, and large event photography that dominates the frame.
- Warm earthy palette: deep terracotta or burnt orange as accent, cream/off-white backgrounds (not pure white), charcoal (not black) for text, muted sage or dusty teal for secondary accents. Avoid the typical "purple/indigo SaaS" look.
- Typography with personality: pair a serif display font (like Fraunces, Playfair Display, or Instrument Serif) for event titles and hero headlines, with a clean sans-serif (Inter or Manrope) for UI and body text. Serif brings the "cultural, artistic" feeling.
- Rounded but not overly playful: 8-12px card radii, generous 20-24px padding inside cards.
- Subtle textures or grain overlays on hero images to feel more magazine-like.
- Micro-details: ticket-stub perforation lines on booking confirmation cards, small illustrated icons instead of generic Material icons.

CORE UX PRINCIPLES (mandatory — do not skip)
1. "All-inclusive" pricing shown from the first card. Never surprise the user with fees at checkout.
2. Guest checkout allowed — do not force account creation before browsing.
3. Clearly separate onboarding for Cliente (fast, single form) vs Agente (multi-step wizard).
4. Reservation states use color chips: Reservada (warm amber), Confirmada (calm green), Cancelada (muted red).
5. Real-time seat availability on event detail (e.g. "348 entradas de 15.000 restantes").
6. Self-service cancellation from the client panel (up to 48h before the event).
7. Visible PQRS entry point in every client-facing screen footer.
8. Error messages must be specific ("La contraseña no coincide con este correo") not generic ("Invalid credentials").

SCREENS TO GENERATE (14 total)
Public / Auth:
1. Landing page — hero with rotating event photo, search bar (event/city/date), category chips, "Featured events" 4-column grid, footer with PQRS link.
2. Login — split screen with editorial photo on left, form on right, guest-checkout button below the primary CTA.
3. Registro Cliente — single form, minimal fields, warm illustration.
4. Registro Agente — multi-step wizard (3 steps: personal data → professional profile → verification), with a visible stepper.

Cliente flow:
5. Event catalog — sidebar with filters (category, city, date, price), main grid of event cards with large photos, sort dropdown.
6. Event detail — full-bleed hero image, editorial-style event title in serif, description, real-time availability bar, sticky reservation panel on the right with zone selector and quantity stepper.
7. Checkout — 2-column: form on left (attendee data + payment method radio group), order summary card on the right with itemized "all-inclusive" total.
8. Reservation confirmation — celebratory but calm, big success mark, ticket-stub-shaped card with booking code, event info, and download/calendar buttons.
9. Client panel — "Mis reservas" with tabs (Próximas / Pasadas / Canceladas), each reservation as a horizontal card with status chip, actions (Download / Cancel / PQRS).

Agente flow:
10. Agent dashboard — "Mis eventos" with 4 KPI tiles (active events, reservations this month, revenue, commission earned) and a table of events with status chips (Programado, En Boletería, En Vivo, Finalizado, Cancelado).
11. Create/Edit event form — 3-section stacked form (basic info, venue & dates, capacity & pricing) with a live preview card on the right.
12. Reservations per event — event header with 4 KPIs (occupancy, reserved, confirmed, cancelled), filter chips, and a data table of bookings with per-row actions.

Admin:
13. Admin dashboard — top KPI row (clients, agents, admins, events, reservations), then a 2-column chart row (monthly revenue bar chart + category breakdown), then top-5 agents leaderboard + geographic coverage bars.
14. Admin reports — filter tabs (Comerciales / Cobertura / Operación / Cancelaciones), then a 2x2 grid of report cards, each with a horizontal-bar visualization and an "Export" action.

SAMPLE DATA (use these to feel realistic, don't invent English placeholder text)
- Events: "Karol G — Mañana Será Bonito Tour", "Andrés Cepeda — Trece Tour", "Hamilton — Musical", "Millonarios vs Nacional", "Festival Cordillera", "Circo del Sol — Bazzar", "Silvestre Dangond".
- Venues: "Movistar Arena · Bogotá", "Teatro Colón · Bogotá", "Teatro Mayor · Bogotá", "El Campín · Bogotá", "Simón Bolívar · Bogotá", "Ágora · Bogotá".
- Prices: "$45.000", "$120.000", "$180.000", "$280.000", "$450.000".
- User names: Eder Rodríguez, Ana Torres, Camila Ochoa, Juan D. Vera, Laura Peña.
- Booking codes: "TF-2026-A9F42B", "TF-2026-B3D71E".

DELIVERABLES
- Desktop 1440px width for all screens.
- Fully in Spanish (es-CO), never mix English.
- Include realistic microcopy — no lorem ipsum.
- Every clickable element must have an obvious hover/active state suggested visually.

DO NOT
- Do not use pure white (#FFFFFF) backgrounds — use cream (#FBF8F3 or similar).
- Do not use generic Material Design icons — use custom line icons.
- Do not center-align long paragraphs.
- Do not put "Buy tickets" in English anywhere.
- Do not hide the total price behind a "See total" link — show it upfront.
```

---

## Refinamientos por pantalla (opcional — pega uno a uno si quieres iterar)

Si Stitch te pide más detalle sobre alguna pantalla específica, usa estos prompts complementarios:

### Landing
> Redesign the TicketFlow landing hero as an editorial magazine cover: large full-width photo of a concert crowd, serif title "Vive el evento del año" overlaid, search bar floating over the image, category chips beneath. Below, a masonry-style grid of 6 featured events with alternating card sizes (not uniform).

### Detalle evento
> The event detail hero should be full-bleed (edge to edge), with the event title in a serif font layered on top of a slightly darkened photo. Below the hero, a two-column layout: left column has event description, real-time availability with a progress bar in warm amber, and a "Meet the artists" section with small circular photos. Right column has a sticky reservation card with zone options as radio-tiles (not dropdown), quantity stepper, and a large "Reservar $280.000" primary button.

### Panel Cliente
> Design "Mis reservas" as a warm, personal experience — not a corporate dashboard. Tabs at the top (Próximas / Pasadas / Canceladas) with count badges. Each reservation is a horizontal card styled like an actual ticket stub, with a perforated dashed line separating the event info from the actions (Download, Cancel). Include a friendly empty state illustration for the "Canceladas" tab.

### Dashboard Admin
> Admin dashboard should feel calm, not overwhelming. Top row: 5 KPI tiles with large numbers and small delta indicators (green up-arrow for positive). Middle: a wide line chart of monthly revenue with a soft area fill in terracotta. Bottom row: a horizontal bar chart of top 5 agents on the left, a Colombia map with dots sized by event count on the right. All chart labels in Spanish.

---

## Después de generar en Stitch

1. Toma screenshots o exporta los PNG/Figma de las 3-4 pantallas más representativas (Landing, Detalle, Checkout, Dashboard).
2. Compártelas con el equipo junto al link del Figma actual: https://www.figma.com/design/xsB4IUD1ZzH9pxtCsx43OX
3. Decidan en grupo cuál dirección visual llevar a la sustentación (o si mezclan lo mejor de cada una).
