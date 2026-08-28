# KNOW WORLD — Proyecto V7

Juego web educativo inspirado en la referencia proporcionada.

## Incluye
- Inicio desde cero: 0 EXP, 0 monedas, 0 racha y última posición del ranking; 5 vidas iniciales.
- Nombre obligatorio al comenzar y editable desde Perfil.
- 9 categorías: Ciencia, Historia, Geografía, Matemáticas, Artistas, Deportes, Literatura, Tecnología y Cultura.
- `questions.json` contiene **1,000 preguntas**. Las partidas mezclan preguntas aleatoriamente y evitan repetir una pregunta dentro de la misma sesión hasta agotar el banco.
- 1 vida se pierde únicamente por respuesta incorrecta o por agotarse el tiempo. Una respuesta correcta nunca resta vidas.
- Recuperación: 1 vida cada 30 minutos, incluso con la página cerrada.
- Compra de vida: 500 monedas o EXP. El precio EXP comienza en 100, sube 100 por compra y se reinicia a 100 después de 24 horas.
- 15 misiones diarias y 15 semanales con actualización automática y recompensas individuales.
- Temporada 1.
- Ranking dinámico según EXP.
- Tienda con avatares, marcos, fondos, efectos, títulos e insignias.
- Los artículos comprados pueden equiparse o quitarse desde Perfil y el cambio se refleja visualmente en el juego.
- Títulos seleccionables y opción `Sin título`.
- Sonidos generados con Web Audio API, sin archivos externos.
- Diseño responsive para escritorio y teléfono.

## Ejecutar
```bash
npm start
```
Después abre `http://localhost:3000`.

## Reiniciar el progreso
Desde la consola del navegador:
```js
localStorage.removeItem('knowWorldState');
location.reload();
```

## V8
- JUGAR y CATEGORÍAS abren primero el selector de categoría.
- Solo se puede iniciar una partida después de elegir una categoría.
- Se eliminó la opción "Todas las categorías".
- Las preguntas se toman exclusivamente de la categoría elegida y se mezclan sin repetirse durante esa partida.
- Se evita reiniciar automáticamente el mazo al terminar para no provocar cargas/ciclos innecesarios.


## V9 — personalización y preguntas
- **Desafío Universal:** el botón verde JUGAR inicia directamente una partida con preguntas de todas las categorías.
- **Categorías:** el botón CATEGORÍAS abre el menú y permite elegir una sola categoría; la partida usa únicamente ese tema.
- El selector ya **no muestra cantidades de preguntas**.
- Las preguntas se precargan desde `questions-data.js` para que el juego no se quede en “Cargando pregunta...” y también funcione al abrir `index.html` directamente. `questions.json` sigue siendo el archivo editable principal.

### Agregar tus propios sonidos
Edita `audio-config.js` y pega un enlace directo: 
```js
window.KNOW_WORLD_AUDIO = {
  music: "https://tu-sitio.com/musica.mp3",
  correct: "https://tu-sitio.com/correcto.mp3",
  wrong: "https://tu-sitio.com/error.mp3",
  click: "https://tu-sitio.com/click.mp3",
  coin: "https://tu-sitio.com/moneda.mp3",
  reward: "https://tu-sitio.com/recompensa.mp3",
  equip: "https://tu-sitio.com/equipar.mp3",
  volume: 0.55,
  musicVolume: 0.18
};
```
La música se reproduce en bucle después de una interacción del usuario, respetando las reglas de autoplay del navegador.

### Agregar diseños propios a la tienda
Edita `shop-assets.js`. Por ejemplo:
```js
window.KNOW_WORLD_SHOP_ASSETS = {
  "Fondo Galaxia": { image: "assets/fondos/mi-galaxia.jpg" },
  "Avatar Guerrero": { image: "assets/avatares/mi-guerrero.png" },
  "Marco Fuego": { image: "assets/marcos/mi-marco.png" },
  "Efecto Estrella": { image: "assets/efectos/mi-efecto.png" },
  "Insignia Ciencia": { image: "assets/insignias/mi-insignia.png" }
};
```
Para **agregar un artículo nuevo**, copia un objeto dentro de `SHOP` en `app.js` con `name`, `type`, `price`, `rarity` e `icon`, y después agrega su diseño en `shop-assets.js` usando exactamente el mismo nombre. Los tipos válidos son `avatar`, `frame`, `background`, `effect`, `badge` y `title`.

> Para fondos, avatares, marcos, efectos e insignias se admiten imágenes propias. Para títulos, el texto se muestra como título equipado; si quieres una imagen decorativa, puedes añadirla como `image` y ampliar el bloque visual del título.
