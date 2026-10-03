# Fase 3 — Visión artificial y conteo de repeticiones

Esta es la parte diferencial del TFM: contar repeticiones válidas a partir de
la cámara del usuario, sin enviar vídeo a ningún servidor.

## Cómo funciona, paso a paso

1. **Cámara** (`hooks/useCamera.js`): pide `getUserMedia` y conecta el stream
   a un `<video>`. Libera la pista de la cámara al desmontar el componente.
2. **Estimación de pose** (`pose-detection/poseDetector.js`): carga una vez
   TensorFlow.js con backend WebGL y el modelo **MoveNet SinglePose
   Lightning**, pensado para tiempo real en dispositivos modestos. Cada
   frame devuelve 17 keypoints del cuerpo con su confianza (`score`).
3. **Geometría** (`pose-detection/angles.js`): calcula el ángulo entre tres
   puntos (por ejemplo cadera-rodilla-tobillo) y distancias normalizadas por
   la longitud del tronco, para que el sistema funcione igual de cerca que
   de lejos de la cámara.
4. **Métrica por ejercicio** (`pose-detection/metrics.js`): cada uno de los 8
   ejercicios del seed tiene una función que reduce los keypoints a **un solo
   número** que sube y baja con el movimiento: el ángulo de rodilla en la
   sentadilla, el de codo en la flexión, la apertura de piernas y brazos en
   el jumping jack, etc.
5. **Contador con histéresis** (`pose-detection/RepCounter.js`): una máquina
   de estados de dos fases (extendido / contraído) con **dos umbrales
   separados**, no uno solo. Si se usara un único umbral, el ruido de la
   estimación frame a frame haría que el contador oscilara y sumara
   repeticiones falsas al cruzarlo varias veces seguidas. Con dos umbrales
   alejados entre sí, hay que completar de verdad el movimiento en ambos
   sentidos para que cuente. También hay un tiempo mínimo entre repeticiones
   para filtrar temblores rápidos.
6. **Overlay del esqueleto** (`pose-detection/PoseOverlay.jsx`): dibuja los
   huesos y puntos sobre un `<canvas>' superpuesto al vídeo, así el usuario
   ve que el sistema le está seguimiento correctamente.
7. **Reproductor de sesión** (`session/SessionRunner.jsx`): encadena los
   bloques de la sesión del día con su temporizador de trabajo/descanso
   (`hooks/useCountdown.js`), activa la cámara solo durante el tramo de
   trabajo, guarda el máximo de repeticiones contado en cada bloque y, al
   terminar, envía el resultado a `POST /api/results` (Fase 1).

## Pantalla de calibración

`/calibrate` dentro de la app deja elegir un ejercicio y ver en vivo el valor
crudo de su métrica y el contador, para ajustar los umbrales de
`RepCounter.js` sin tener que hacer series completas cada vez. Es la
herramienta que se usa para documentar en la memoria del TFM cómo se
eligieron esos umbrales.

## Cómo probarlo

```bash
cd frontend
npm install
npm run dev
```

Necesitas HTTPS o `localhost` para que el navegador permita la cámara (en
desarrollo con Vite, `localhost` ya vale). Entra, ve a "Calibración" y prueba
cada ejercicio antes de lanzar una sesión completa desde "Empezar sesión".

## Limitaciones a documentar en la memoria

- **Umbrales fijos y por defecto:** los valores de `RepCounter.js` son un
  punto de partida razonable, no una calibración con usuarios reales. La
  memoria del TFM debería incluir una pequeña validación: grabar a varias
  personas haciendo un número conocido de repeticiones y comparar con lo que
  cuenta el sistema, ajustando umbrales si hace falta.
- **Una sola persona en cámara.** MoveNet SinglePose asume un único cuerpo;
  si aparece más de una persona, el modelo puede seguir a la que no toca.
- **Burpee es el ejercicio más simplificado**, tratado como un único ciclo de
  altura de cadera. Es el candidato más razonable de "mejora futura" si el
  tribunal pregunta por precisión.
- **La validación de "rango de movimiento correcto"** se limita a que la
  métrica cruce los dos umbrales; no evalúa la calidad de la forma (espalda
  recta, alineación de rodillas, etc.). Eso encaja con la mejora futura ya
  prevista en el README: "detección de errores de forma/postura".
