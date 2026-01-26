# Plan de Acción - Athlete Cookbook v0.3

## Análisis del Feedback

El feedback recibido es sólido y viene de alguien que entiende marketing de productos digitales. Sin embargo, no todo aplica igual ni tiene la misma urgencia. Aquí está mi análisis crítico:

---

## 🔴 CAMBIOS URGENTES/NECESARIOS

Estos son cambios que **sí o sí** deberían implementarse porque afectan directamente la credibilidad, usabilidad y/o aspectos legales del producto.

### 1. Disclaimer Legal (PRIORIDAD MÁXIMA)

**Por qué es urgente:** Protección legal real. Vender un producto de nutrición sin disclaimer es un riesgo innecesario.

**Implementación:**
- Agregar una página de disclaimer al inicio del libro
- Texto claro: no es consejo médico, consultar profesional, cada cuerpo es diferente
- Esto NO requiere que escribas contenido personal extenso

**Ubicación técnica:** Nueva sección en el JSON, renderizada como página 2 del PDF

```json
{
  "section": "disclaimer",
  "content": {
    "title": "Important Disclaimer",
    "text": "..."
  }
}
```

### 2. Quick Reference Card - Completar información faltante

**Por qué es urgente:** El feedback menciona información técnica faltante que es objetivamente útil:
- Carreras de 120+ min: consumir 60-90g carbs/hora durante
- Ventana de recuperación de 30 min

**Implementación:** Agregar estos datos a la Quick Reference Card existente.

### 3. Troubleshooting Guide - Vincular recetas específicas

**Por qué es necesario:** Ya tienes la estructura, solo falta conectar problemas → recetas específicas. Esto mejora la usabilidad sin esfuerzo de contenido nuevo.

**Implementación:**
- En cada problema del troubleshooting, agregar: "Try these recipes: X, Y, Z"
- Usar los recipe IDs que ya tienes

---

## 🟡 BUENAS IDEAS (Implementar si hay tiempo/recursos)

Estos son cambios que **mejorarían** el producto pero no son críticos para el lanzamiento.

### 4. "Coach Notes" en recetas clave (10-15 recetas)

**Mi análisis:** Esta es una MUY buena idea. Agrega diferenciación sin requerir una historia de vida completa.

**Implementación sugerida:**
- Elegir 10-15 recetas que uses regularmente
- Agregar un campo `coachNote` al JSON de cada receta
- El PDF ya debería poder renderizar esto

**Ejemplo de estructura:**
```json
{
  "recipe": "Oat and Banana Pancakes",
  "coachNote": {
    "text": "My go-to before 60-min runs. Light but fueling.",
    "context": "I eat this 2-3x per week before tempo runs."
  }
}
```

**Prioridad:** Media-Alta. Buen ROI de esfuerzo vs impacto.

### 5. Sección "How to Use This Book by Goal"

**Mi análisis:** Útil pero parcialmente ya cubierto por la Quick Reference Card y Nutrition by Training Phase.

**Implementación sugerida:**
- Crear una página que agrupe recetas por objetivo:
  - "Losing weight while running"
  - "Improving speed/performance"
  - "Digestive issues"
- Esto es básicamente un índice cruzado

**Prioridad:** Media. Mejora navegación pero no es crítico.

### 6. "Mistakes I Made" Section

**Mi análisis:** Buena idea para diferenciación. Es contenido corto (5-7 puntos) con alto impacto.

**Implementación:**
- Una página simple con lista de errores comunes
- No requiere historia personal extensa
- Puede ser genérico pero presentado como experiencia

**Prioridad:** Media. Fácil de implementar, buen valor.

### 7. "WHY THIS WORKS" en recetas

**Mi análisis:** Esto ya lo tienes parcialmente con el enrichment que hicimos. Revisa si ya existe un campo `nutritionalBenefits` o similar.

**Implementación:**
- Si ya existe en el JSON enriquecido, asegurarse de que se renderice
- Si no existe, agregar para recetas clave

**Prioridad:** Media. Depende de lo que ya tengamos.

---

## 🟠 PARA CONSIDERAR (No urgente / Requiere decisión personal)

Estos son cambios que dependen de **tu comfort level** y visión del producto.

### 8. Tu Historia Personal / "About the Author"

**Mi análisis honesto:**

El feedback dice que esto es "CRÍTICO" pero yo matizo:

**Pros:**
- Diferenciación real
- Conexión emocional con el comprador
- Justifica precio premium

**Contras/Consideraciones:**
- Requiere que te sientas cómodo compartiendo detalles personales
- No es estrictamente necesario para un cookbook funcional
- Puedes agregar esto en v1.0 o v1.1

**Mi recomendación:**
- Para v0.3: Agregar una versión CORTA y genérica
- Si te sientes cómodo, expande en futuras versiones

**Alternativa minimalista:**
```
About the Author:
Amateur runner and nutrition enthusiast. This cookbook is the
result of years of experimentation to find what fuels MY runs.
Use it as a guide, not gospel. Your body knows best.
```

### 9. Weekly Meal Plan con ejemplo real

**Mi análisis:** El feedback pide tu semana real de comidas. Esto es trabajo intensivo.

**Consideración:**
- Requiere que documentes una semana real
- Alto esfuerzo, impacto medio
- Puede ser v1.0

**Alternativa:** Crear un template/ejemplo genérico que sea útil sin ser 100% personal.

---

## ⛔ COSAS QUE NO HARÍA (O postponería)

### 10. Sobre-personalización de TODAS las recetas

El feedback sugiere agregar experiencia personal a muchas recetas. Esto puede:
- Sonar forzado si no es auténtico
- Requerir mucho tiempo
- Hacer el libro muy largo

**Mi recomendación:** Coach Notes solo en 10-15 recetas favoritas, no en todas.

### 11. Comunidad/Actualizaciones para justificar $47-67

El feedback menciona esto como opción de precio. Sin embargo:
- Crear comunidad es un producto separado
- Requiere soporte continuo
- No es necesario para v0.3

**Postponer hasta validar demanda.**

---

## 📋 PLAN DE IMPLEMENTACIÓN PASO A PASO

### FASE 1: Cambios Urgentes (Esta iteración) ✅ COMPLETADO

- [x] **1.1** Crear template de disclaimer (`templates/athlete-cookbook/disclaimer.hbs`)
- [x] **1.2** Actualizar servicio para renderizar disclaimer después de la cover
- [x] **1.3** Completar Quick Reference Card:
  - Actualizado 60-90g carbs/hora para carreras largas (antes decía 30-60g)
  - Agregados 2 tips adicionales sobre fueling durante carreras 120+ min
- [x] **1.4** Vincular recetas reales al Troubleshooting Guide (corregidas recetas que no existían)

### FASE 2: Mejoras de Alto Impacto ✅ COMPLETADO

- [x] **2.1** Agregar campo `coachNote` al modelo de receta en `athlete-cookbook.service.ts`
- [x] **2.2** Escribir coach notes para 10 recetas clave:
  1. Oat and Banana Pancakes
  2. My Everyday Oatmeal
  3. My Race Day Oatmeal
  4. Post-Workout Breakfast Burritos
  5. Chickpea Salad
  6. Tuna Salad
  7. Blueberry Smoothie Bowl
  8. Energy Bites
  9. Chicken and Veggie Wok
  10. Turmeric Pepitas
  11. Oat Energy Balls
- [x] **2.3** Actualizar template `recipe-page-multi.hbs` para mostrar coach notes con estilo distintivo
- [ ] **2.4** Crear página "Mistakes I Made" (5-7 puntos) - **PENDIENTE (requiere tu input)**

### FASE 3: Mejoras Opcionales (v0.4 o v1.0)

- [x] **3.1** Sección "How to Use This Book by Goal" ✅
  - Template: `templates/athlete-cookbook/goals-guide.hbs`
  - 5 objetivos: Weight Loss, Performance, GI Issues, Recovery, Busy Runners
  - Cada uno con tips de enfoque y recetas recomendadas
- [ ] **3.2** About the Author expandido (si decides)
- [ ] **3.3** Weekly Meal Plan ejemplo real
- [ ] **3.4** Más coach notes en recetas adicionales

---

## 🎯 RESULTADO ESPERADO

**v0.3 con Fase 1 + Fase 2 parcial:**
- Producto legalmente protegido (disclaimer)
- Información completa y útil
- Diferenciación a través de coach notes
- Precio justificable: **$27-37 USD**

**v1.0 con todas las fases:**
- Historia personal (si decides)
- Contenido completo
- Precio justificable: **$37-47 USD**

---

## 📝 NOTAS TÉCNICAS PARA IMPLEMENTACIÓN

### Estructura JSON sugerida para disclaimer:

```json
{
  "disclaimer": {
    "title": "Important Disclaimer",
    "icon": "⚠️",
    "paragraphs": [
      "This cookbook is based on personal experience as an amateur runner.",
      "The author is NOT a registered dietitian or nutritionist.",
      "Every body is different. What works for one person may not work for another.",
      "Before making significant dietary changes, consult with a qualified professional."
    ],
    "emphasis": "This book is a guide, not medical advice."
  }
}
```

### Estructura para coach notes en recetas:

```json
{
  "id": "oat-banana-pancakes",
  "name": "Oat and Banana Pancakes",
  "coachNote": {
    "text": "My go-to before 60-min runs. Light but fueling.",
    "icon": "💡"
  }
}
```

### Archivos a modificar:

1. `fuel_like_a_runner-en-enriched.json` - Agregar disclaimer y coach notes
2. `athlete-cookbook.service.ts` - Procesar nuevos campos
3. Template PDF - Renderizar disclaimer y coach notes

---

## ❓ DECISIONES PENDIENTES (Necesito tu input)

1. **Disclaimer:** ¿Quieres usar el texto sugerido o escribir uno propio?

2. **Coach Notes:** ¿Cuáles son tus 10-15 recetas favoritas? (Las que realmente usas)

3. **About the Author:** ¿Versión minimalista o quieres escribir algo más personal?

4. **Mistakes I Made:** ¿Puedes listarme 5-7 errores reales que cometiste con nutrición/running?

---

*Plan creado: 26 enero 2026*
*Versión objetivo: v0.3*
