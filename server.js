import './analytics.js';
import { Server } from 'socket.io';
import debug from 'debug';

import { app } from './app.js';
import './mongoDb.js';
import { createAdapter } from '@socket.io/mongo-adapter';
import os from 'os';
import appInsightsClient from './analytics.js';
import { adapterCollection } from './mongoDb.js';

const port = normalizePort(process.env.PORT || '3101');
app.set('port', port);
export const appLogger = debug('frontend');
const hostName = os.hostname();
const pid = process.pid;

export const server = app.listen(port, () => {
  const info = `🤙 Express on ${hostName}, pid: ${pid}, listening on port:${
    server.address().port
  }`;
  appLogger(info);
  appInsightsClient.trackEvent({
    name: '👕' + 'FRONTEND SERVER STARTED ID: ' + pid,
    properties: { info },
  });
});
export const socketIoServer = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
  },
  cors: { origin: '*' },
});
socketIoServer.adapter(
  createAdapter(adapterCollection, { addCreatedAtField: true })
);

socketIoServer.on('connection', socketListen);
function socketListen(socket) {
  appLogger(
    `socket connected with id: ${socket.id} connected to  PID: ${pid} `
  );
  appInsightsClient.trackEvent({
    name: `🤙 Connected socket`,
    properties: {
      socketId: socket.id,
      pid: pid,
    },
  });

  socket.on('postMessage', ({ gameId, playerName, message }) =>
    socketIoServer.in(gameId).emit('newMessage', { playerName, message })
  );

  socket.on('disconnecting', async reason => {
    appLogger(`🤙 disconnecting ${socket.id} due to :${reason}`);
    appInsightsClient.trackEvent({
      name: `🤙 disconnecting socket`,
      properties: {
        socketId: socket.id,
        pid: pid,
        reason,
      },
    });
  });
}

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
