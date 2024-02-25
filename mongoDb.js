import debug from 'debug';
import mongoose from 'mongoose';
import appInsightsClient from './analytics.js';
import os from 'os';
import { handler } from './errorHandler.js';

const hostName = os.hostname();
const DB = 'Socket';
const COLLECTION = 'socket.io-adapter-events';
const appLogger = debug('frontend');
try {
  mongoose.set('strictQuery', false); // if true only the fields that are specified in the Schema will be saved
  await mongoose.connect(
    `${process.env.MONGODB_CONN_STRING}${DB}?retryWrites=true&w=majority&appName=Cluster0`
  );
  appLogger('🌎 Connection to AdapterDb Succesfull! 🌎');
  appInsightsClient.trackEvent({
    name: '🌎 Connection to AdapterDb Succesfull! 🌎',
    properties: { backend: hostName, pid: process.pid },
  });
} catch (error) {
  handler.handleError(error, { originalUrl: ' Connection to AdapterDb' });
  process.exit(0);
}

export const defaultConnection = mongoose.connection;
export const adapterCollection = defaultConnection.collection(COLLECTION);
await adapterCollection.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 60, background: true }
);
mongoose.set('toJSON', { virtuals: true });

defaultConnection.on('error', err => {
  handler.handleError(err);
  process.exit(0);
});
defaultConnection.on('disconnected', () => {
  appLogger(`🌞 Disconnected from AdapterDb`);
  appInsightsClient.trackEvent({
    name: `🌞 Disconnected from AdapterDb`,
    properties: {
      frontEnd: hostName,
      pid: process.pid,
    },
  });
});
