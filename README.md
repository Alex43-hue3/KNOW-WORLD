# KNOW WORLD V11

Proyecto web responsive de KNOW WORLD con preguntas, vidas, EXP, monedas, rachas, misiones, tienda, cosméticos, música, ranking local/online y cuentas.

## Ejecutar
```bash
npm start
```
Abre http://localhost:3000

## Preguntas
`questions.json` y `questions-data.js` contienen el banco. El juego usa `questions-data.js` para carga inmediata y el JSON queda como fuente editable. Actualmente hay 1,000 preguntas distribuidas por categorías.

## Sonidos y música
Edita `audio-config.js`:
- `correct`, `wrong`, `click`, `coin`, `reward`, `equip` para efectos.
- `musicLibrary` para canciones comprables.
- `defaultMusic` para música predeterminada.

Ejemplo:
```js
"Música: Mi Canción": "https://tu-servidor.com/musica.mp3"
```

## Agregar artículos con tus propios diseños
Edita `shop-assets.js`. Puedes sobrescribir imágenes existentes o añadir artículos nuevos en `customItems`:
```js
{ name:"Mi Fondo", type:"background", price:3500, rarity:"ÉPICO", icon:"🌌", image:"assets/fondos/mio.jpg" }
{ name:"Mi Avatar", type:"avatar", price:4500, rarity:"ÉPICO", icon:"🧑", image:"assets/avatares/mio.png" }
{ name:"Mi Canción", type:"music", price:2000, rarity:"MÚSICA", icon:"🎵", audio:"assets/audio/micancion.mp3" }
```
Tipos: `avatar`, `frame`, `background`, `effect`, `badge`, `title`, `music`.

## Cuenta y sincronización
El servidor incluye endpoints para:
- registro con usuario, correo y contraseña;
- verificación por código;
- inicio de sesión y recuperación del progreso;
- guardado cloud del estado;
- ranking online;
- conteo de jugadores conectados;
- recuperación/cambio de contraseña;
- cambio de usuario mediante código de recuperación.

Para producción, el código de verificación debe enviarse por un proveedor SMTP o servicio de correo. En desarrollo, el servidor devuelve el código en la respuesta para poder probar el flujo sin configurar correo.

**Seguridad de producción:** usa HTTPS, una base de datos real, hashing de contraseñas con un KDF como Argon2id/scrypt, tokens con expiración/rotación, rate limiting y un proveedor de correo transaccional. El servidor incluido es una base funcional de desarrollo, no una infraestructura de producción lista para manejar cuentas reales sin endurecimiento.

## Compartir progreso
Desde Perfil se genera una imagen PNG con nombre, nivel, EXP, rango, racha, vidas y título. En dispositivos compatibles se abre el menú nativo de compartir.

## Responsive
En teléfono la navegación pasa a la parte inferior. El HUD de EXP/monedas/vidas/rango se adapta a 2x2 y el contenido principal reduce tamaños para evitar desplazamiento vertical innecesario en Inicio y Juego.

## Reglas actuales
- 20 segundos por pregunta.
- Respuesta correcta: no quita vida.
- Respuesta incorrecta/tiempo agotado: -1 vida.
- +5 segundos: 2 monedas.
- Eliminar 2 opciones: 8 monedas.
- Vida: 500 monedas o EXP con precio 100, 200, 300...; el contador de compras con EXP se reinicia cada 24 horas.
- 15 misiones diarias y 15 semanales.
- Temporada 1.
