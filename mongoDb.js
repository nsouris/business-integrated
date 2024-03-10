import debug from 'debug';
import mongoose from 'mongoose';
import appInsightsClient from './analytics.js';
import os from 'os';
import { errorHandler } from './errorHandler.js';

const hostName = os.hostname();
const appLogger = debug('frontend');
try {
  mongoose.set('strictQuery', false); // if true only the fields that are specified in the Schema will be saved
  mongoose.set('toJSON', { virtuals: true });
  await mongoose.connect(
    `${process.env.MONGODB_CONN_STRING}${process.env.ADAPTER_DB}?retryWrites=true&w=majority&appName=Cluster0`
  );
  appLogger('🌎 Connection to AdapterDb Succesful! 🌎');
  appInsightsClient.trackEvent({
    name: '🌎 Connection to AdapterDb Succesful! 🌎',
    properties: { frontend: hostName, pid: process.pid },
  });
} catch (error) {
  errorHandler.handle(
    error,
    { isCritical: 0 },
    `FrontEnd connection to ${process.env.ADAPTER_DB} error`
  );
}

export const defaultConnection = mongoose.connection;
export const adapterCollection = defaultConnection.collection(
  process.env.ADAPTER_COLLECTION
);
try {
  adapterCollection.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 60, background: true }
  );
} catch (error) {
  errorHandler.handle(
    error,
    {},
    `FrontEnd Create Index for ${process.env.ADAPTER_COLLECTION} error`
  );
}

defaultConnection.on('error', error => {
  errorHandler.handle(error, { isCritical: 0 }, `Default Connection  error`);
});
defaultConnection.on('disconnected', () => {
  appLogger(`🌞 FrontEnd disconnected from ${process.env.ADAPTER_DB}`);
  appInsightsClient.trackEvent({
    name: `🌞 FrontEnd disconnected from ${process.env.ADAPTER_DB}`,
    properties: { frontEnd: hostName, pid: process.pid },
  });
});
