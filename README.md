# KNOW WORLD — Proyecto completo

## Inicio limpio
La primera vez que se abre esta versión se crea un perfil completamente nuevo:
- EXP: 0
- Monedas: 0
- Racha: 0
- Mejor racha: 0
- Preguntas correctas/respondidas: 0
- Título: Sin título
- Ranking: última posición disponible
- Vidas: 5/5 para comenzar a jugar

El nombre se solicita al entrar y puede cambiarse desde Perfil > Editar perfil.

## Vidas
- Máximo: 5.
- Error o tiempo agotado: -1 vida.
- Recuperación automática: 1 vida cada 30 minutos.
- Compra por monedas: 500 monedas por vida.
- Compra por EXP: empieza en 100 EXP y aumenta 100 por cada compra con EXP dentro de la ventana de 24 horas.
- Después de 24 horas desde el inicio de esa ventana, el precio vuelve a 100 EXP.
- Con 0 vidas no se puede iniciar ni continuar una pregunta. Aparece el panel para comprar o esperar.

## Tienda y colección
Los artículos comprados se guardan en el perfil y pueden equiparse desde **Artículos adquiridos** mediante el botón **USAR**.
- Avatares
- Marcos
- Fondos
- Efectos
- Títulos
- Insignias

El artículo equipado se aplica visualmente al perfil y a la interfaz cuando existe una representación disponible.

## Preguntas
Las preguntas se encuentran en `questions.json`.

Formato esperado:
```json
{
  "id": 1,
  "category": "Ciencia",
  "question": "Pregunta...",
  "options": ["A", "B", "C", "D"],
  "answer": 1,
  "explanation": "Explicación..."
}
```

## Ejecutar
```bash
npm install
npm start
```
Luego abrir `http://localhost:3000`.

## Datos
El progreso se guarda en `localStorage` del navegador. La versión del estado es la 3 para evitar que los datos demo de versiones anteriores aparezcan como progreso inicial.
