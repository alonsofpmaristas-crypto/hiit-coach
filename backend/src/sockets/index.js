// Canal en tiempo real. El servidor emite 'ranking:updated' cuando entra un
// resultado nuevo (ver resultController); los clientes vuelven a pedir el ranking.
export function registerSockets(io) {
  io.on('connection', (socket) => {
    socket.on('disconnect', () => {});
  });
}
