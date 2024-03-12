import './analytics.js';
import { createAdapter } from '@socket.io/mongo-adapter';
import { Server } from 'socket.io';
import debug from 'debug';
import mongoose from 'mongoose';
import os from 'os';

import { app } from './app.js';
import appInsightsClient from './analytics.js';
import { adapterCollection } from './mongoDb.js';
import { errorHandler } from './errorHandler.js';

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
    name: '👕 FRONTEND SERVER STARTED',
    properties: { hostName, pid },
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
  const ipAddress =
    socket.client.request.headers['x-forwarded-for']?.split(':')[0];
  appLogger(
    `socket connected with id: ${socket.id} & ip: ${ipAddress} connected to  host: ${hostName} `
  );
  appInsightsClient.trackEvent({
    name: `🤙 Socket connected`,
    properties: {
      hostName,
      socketId: socket.id,
      ip: ipAddress,
    },
  });
  socket.emit('ConnInfo', hostName, socket.id);

  socket.on('disconnecting', async reason => {
    appLogger(
      `🤙 disconnecting ${socket.id} from ${hostName} : ${pid} due to :${reason}`
    );
    appInsightsClient.trackEvent({
      name: `Disconnecting socket`,
      properties: {
        socketId: socket.id,
        hostName,
        pid,
        reason,
      },
    });
  });
}

server.on('error', onError);
server.on('listening', onListening);

process.on('uncaughtException', function uncaughtExceptionHandler(error) {
  errorHandler.handle(error, { isCritical: 1 }, 'process uncaughtException');
});

process.on('unhandledRejection', function unhandledRejectionHandler(reason) {
  const error = Error(reason);
  errorHandler.handle(error, { isCritical: 1 }, 'process unhandledRejection');
});

process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);

async function gracefulExit() {
  appInsightsClient.trackEvent({
    name: '🌎GracefulExit🌎',
    properties: { frontend: hostName, pid: process.pid },
  });
  appLogger('GracefulExit');
  await mongoose.disconnect();
  socketIoServer.close(() => {
    appInsightsClient.trackEvent({
      name: '🌎Closing socket server🌎',
      properties: { frontend: hostName, pid: process.pid },
    });
    appLogger('Closing socket server');
    process.exit(0);
  });
}

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES': {
      const error = Error(bind + ' requires elevated privileges');
      errorHandler.handle(error, { isCritical: 1 });
      break;
    }
    case 'EADDRINUSE': {
      const error = Error(bind + ' is already in use');
      errorHandler.handle(error, { isCritical: 1 });
      break;
    }
    default:
      throw error;
  }
}
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  appLogger('Listening on ' + bind);
}
