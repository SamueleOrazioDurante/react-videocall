const io = require('socket.io');
const users = require('./users');

/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */
function initSocket(socket) {
  let id;
  socket
    .on('init', async () => {
      id = await users.create(socket);
      console.log("Si è connesso -> "+id);
      if (id) {
        socket.emit('init', { id });
        console.log("GLi ho dato il suo id bro -> "+id);
      } else {
        socket.emit('error', { message: 'Failed to generating user id' });
      }
    })
    .on('request', (data) => {
      const receiver = users.get(data.to);
      if (receiver) {
        console.log("Non so quando venga chiamato sto metodo (request) -> "+id);
        receiver.emit('request', { from: id });
      }
    })
    .on('call', (data) => {
      const receiver = users.get(data.to);
      if (receiver) {
        console.log("Bro ti sto callando id -> "+id+" data: -> " +data);
        receiver.emit('call', { ...data, from: id });
      } else {
        socket.emit('failed');
      }
    })
    .on('end', (data) => {
      const receiver = users.get(data.to);
      if (receiver) {
        console.log("Sono esploso");
        receiver.emit('end');
      }
    })
    .on('disconnect', () => {
      users.remove(id);
      console.log(id, 'disconnected');
    });
}

module.exports = (server) => {
  io({ path: '/bridge', serveClient: false })
    .listen(server, { log: true })
    .on('connection', initSocket);
};
