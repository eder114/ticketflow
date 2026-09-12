# Resumen — Estructura del archivo PESTEL_TicketFlow.xlsx

Documento de análisis PESTEL del proyecto **TicketFlow**, enfocado al mercado colombiano de eventos y ticketing.

---

## 1. Contenido general

El libro tiene **9 hojas** organizadas en 4 bloques:

| Bloque | Hojas | Función |
|---|---|---|
| Introducción | `Instructivo`, `Áreas` | Explica cómo leer el archivo y lista los 6 factores PESTEL |
| Análisis por factor | `F_Pol`, `F_Eco`, `F_Soc`, `F_Tec`, `F_Amb`, `F_Leg` | Una hoja por factor con 3 aspectos evaluados |
| Consolidado | `Matriz PESTEL` | Vista resumen con Top 3 aspectos por factor y puntaje global |
| Análisis relativo | `Rel_PESTEL` | Peso porcentual de cada factor + interpretación estratégica |

---

## 2. Hoja por hoja

### Instructivo
Explica el proyecto, el mercado analizado (Colombia), las escalas de puntuación (Importancia, Intensidad, Tendencia — todas de 1 a 5) y la fórmula:

> **Puntuación = Importancia × Intensidad × Tendencia**

También incluye la escala de interpretación (bajo/moderado/alto/crítico) y lista todas las fuentes consultadas.

### Áreas
Lista simple de los 6 factores: Políticos, Económicos, Sociales, Tecnológicos, Ambientales, Legales.

### F_Pol, F_Eco, F_Soc, F_Tec, F_Amb, F_Leg (una por factor)
Cada hoja de factor tiene la misma estructura:

- Título del factor.
- Tabla con **3 aspectos** evaluados.
- Para cada aspecto se registra: descripción, impacto en TicketFlow, importancia, marco temporal, intensidad, tipo de tendencia y puntuación.
- La puntuación se calcula con **fórmula dinámica** (no un valor fijo), así que si se cambia cualquier categoría, el puntaje se recalcula automáticamente.
- Al final: puntuación global del factor y fuentes de información.

### Matriz PESTEL
Vista consolidada de los 6 factores en una sola pantalla:
- Los 3 aspectos de cada factor con su puntuación.
- Puntuación total por factor.
- **Puntuación global PESTEL** del proyecto (suma de todos los factores).

### Rel_PESTEL
Análisis del peso relativo de cada factor sobre el total:
- Peso porcentual (%) por factor.
- Puntuación por factor.
- **Interpretación estratégica** con las 5 conclusiones principales del análisis.

---

## 3. Resultado del análisis

| Factor | Puntaje | Peso |
|---|---|---|
| Tecnológico | 305 | 21.7% |
| Económico | 290 | 20.6% |
| Social | 289 | 20.6% |
| Político | 228 | 16.2% |
| Legal | 210 | 14.9% |
| Ambiental | 84 | 6.0% |
| **TOTAL PESTEL** | **1406** | 100% |

**Conclusiones clave:**
1. Los factores **Tecnológico, Económico y Social** concentran ~63% del análisis — son las principales oportunidades a capitalizar.
2. El sector de entretenimiento en Colombia es el motor económico más dinámico (+11,5% en 2025 según DANE).
3. El factor **Legal** es la amenaza más crítica: la Ley 2439/2024 y el caso SIC vs. Tuboleta obligan a cumplir con reembolsos en 15 días y PQRS trazable desde el primer día.
4. El factor **Ambiental** tiene bajo peso, pero incluye el riesgo de cancelaciones por clima.

---

## 4. Cómo modificar el archivo

- Todos los puntajes se calculan con fórmulas — solo hay que cambiar la categoría (ej. "Importante" → "Muy importante") y el número se actualiza solo.
- Para agregar más aspectos por factor: replicar la fila y ajustar el rango `SUM(I4:I6)` de la fila total en cada hoja de factor y en la Matriz PESTEL / Rel_PESTEL.
- El archivo es compatible con Excel y LibreOffice.

---

*Última actualización: 6 de agosto de 2026.*
