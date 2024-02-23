import appInsightsClient from './analytics.js';
import debug from 'debug';
import os from 'os';

export const hostName = os.hostname();
export const pid = process.pid;
const appLogger = debug('frontend');

export class AppError extends Error {
  constructor(message, isOperational) {
    super();
    this.message = message;
    this.isOperational = isOperational;
  }
}
class ErrorHandler {
  constructor() {
    this.handleError = async (error, req = {}, res = {}) => {
      appLogger(`🌞 ${req.originalUrl} error`, error.message);
      appInsightsClient.trackException({
        exception: error,
        properties: {
          body: req.body,
          frontEnd: hostName,
          pid,
        },
      });
      if (res.locals) res.status(500).send(error.message);
    };
  }
}

export const handler = new ErrorHandler();
