import './analytics.js';
import { Server } from 'socket.io';
import debug from 'debug';

import { app } from './app.js';
import './controllers.js';
import './mongoDb.js';

const port = normalizePort(process.env.PORT || '3101');
app.set('port', port);

const server = app.listen(app.get('port'), () =>
  console.log(`Express server listening on port:` + server.address().port)
);
export const socketIoServer = new Server(server, {
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
  cors: { origin: '*' },
  // pingInterval: 5000,
  // pingTimeout: 5000,
});

socketIoServer.on('connection', socket => {
  console.log('SOCKET CONNECTED', socket.id);

  socket.on('postMessage', msg => console.log('@@@@@@@@@@@@', msg));
});

server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
