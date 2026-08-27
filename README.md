# KNOW WORLD — Proyecto funcional

Recreación web inspirada en la interfaz de la imagen proporcionada.

## Incluye
- Dashboard estilo juego educativo.
- Quiz funcional con preguntas en `questions.json`.
- Respuestas correctas/incorrectas, explicación, cronómetro y racha.
- Vidas, EXP, monedas y misión diaria persistentes con `localStorage`.
- Tienda funcional con compras.
- Perfil, rankings y misiones.
- Diseño responsive para escritorio y móvil.
- Navegación completa sin frameworks ni dependencias externas.

## Ejecutar
1. Instala Node.js.
2. Abre una terminal dentro de esta carpeta.
3. Ejecuta:
   `npm start`
4. Abre `http://localhost:3000`.

> También puedes abrir `index.html` directamente. El proyecto incluye un pequeño respaldo de preguntas para ese caso, aunque se recomienda usar `npm start` para cargar `questions.json` mediante HTTP.

## Modificar preguntas
Edita `questions.json`. Cada pregunta usa:
- `id`
- `category`
- `question`
- `options`
- `answer` (índice de la opción correcta, empezando en 0)
- `explanation`
