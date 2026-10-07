# Checklist manual: cámara y conteo de repeticiones

Esta parte **no está en el E2E automatizado** (ver `docs/fase-5-tests-despliegue.md`
para la justificación) y se verifica a mano antes de cada entrega o despliegue:

- [ ] Al pulsar "Empezar sesión", el navegador pide permiso de cámara.
- [ ] Denegar el permiso muestra el mensaje de error, no una pantalla en blanco.
- [ ] Con permiso concedido, aparece el vídeo y el esqueleto se dibuja sobre el cuerpo.
- [ ] En `/calibrate`, cada uno de los 8 ejercicios mueve el valor numérico
      en la dirección esperada al hacer el movimiento.
- [ ] El contador de repeticiones sube al completar una repetición real y
      no sube con quietud o con movimientos parciales.
- [ ] Al terminar una sesión completa, el resumen muestra repeticiones > 0
      en, al menos, los ejercicios que se hicieron de verdad.
- [ ] El resultado enviado aparece en `/rankings` y en `/history` sin recargar manualmente el ranking (gracias al socket).
