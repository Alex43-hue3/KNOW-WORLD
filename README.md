# KNOW WORLD — Proyecto completo y funcional

Esta versión amplía el proyecto para que el progreso del jugador sea persistente y conectado entre Inicio, Quiz, Perfil, Tienda, Misiones y Ranking.

## Funciones implementadas

### Perfil
- Al abrir por primera vez pide el nombre del jugador.
- El nombre aparece en Inicio, Perfil y Ranking.
- Desde **Editar perfil** se puede cambiar el nombre.
- Desde Perfil se puede seleccionar un título disponible.
- El título equipado se refleja en toda la interfaz.

### EXP y Ranking
- Cada respuesta correcta da **+50 EXP** y 10 monedas.
- La posición del ranking se recalcula automáticamente con la EXP actual.
- Comprar una vida con EXP reduce la EXP y, por lo tanto, puede bajar la posición.
- Las recompensas de misiones también pueden aumentar la EXP y modificar el ranking.
- Los datos se guardan en `localStorage`.

### Vidas
- Máximo: 5 vidas.
- Al perder una vida comienza la recuperación automática.
- Se recupera **1 vida cada 30 minutos**.
- El contador se conserva aunque se cierre la página.
- Se puede comprar una vida por **500 monedas**.
- También se puede comprar por EXP:
  - primera compra: 100 EXP
  - segunda: 200 EXP
  - tercera: 300 EXP
  - y así sucesivamente +100 EXP por cada compra con EXP.
- El precio creciente queda guardado.

### Misiones diarias
- Se reinician automáticamente cada día.
- 10 respuestas correctas: +200 EXP y 500 monedas.
- Racha de 10: +300 EXP.
- 3 categorías distintas: +750 monedas.
- Cada misión puede reclamarse una sola vez por día.

### Tienda
- Las compras descuentan monedas.
- Un artículo no puede comprarse dos veces.
- Los artículos comprados aparecen en el Perfil.
- Los títulos comprados se pueden equipar.
- Los artículos y el saldo se conservan al cerrar el navegador.

### Preguntas
Las preguntas están en `questions.json` y se cargan desde el navegador.
Cada pregunta tiene:
`id`, `category`, `question`, `options`, `answer`, `explanation`.

## Ejecutar

Recomendado:
1. Instala Node.js.
2. Abre una terminal en esta carpeta.
3. Ejecuta:
   `npm start`
4. Abre:
   `http://localhost:3000`

También incluye un respaldo para poder probar el juego sin servidor, aunque para cargar/modificar el JSON correctamente se recomienda usar `npm start`.

## Reiniciar todo el progreso

Abre la consola del navegador y ejecuta:

`localStorage.removeItem("knowWorldState"); location.reload();`

Esto vuelve a pedir el nombre y restaura los valores iniciales.
