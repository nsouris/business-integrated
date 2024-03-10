/* eslint-disable no-unused-vars */
import debug from 'debug';
import os from 'os';

import appInsightsClient from './analytics.js';

export const hostName = os.hostname();
export const pid = process.pid;
const appLogger = debug('frontend');

class ErrorHandler {
  constructor() {
    this.handle = async (error, data, logInfo = '') => {
      appLogger(`🌞 ${logInfo}:`, error.message || '');
      appInsightsClient.trackException({
        exception: error,
        properties: { frontEnd: hostName, pid, data, stack: error.stack },
      });
      if (!isNaN(data?.isCritical)) {
        appLogger('🛑 critical error occured');
        appInsightsClient.flush();
        setTimeout(() => process.exit(data.isCritical), 1000);
      }
    };

    this.middleware = async (error, req, res, _next) => {
      appLogger(`🌞 ${req.originalUrl}:`, error.message);
      if (!error.cause)
        appInsightsClient.trackException({
          exception: error,
          properties: { frontEnd: hostName, pid, stack: error.stack },
        });

      res.status(500).send(error.message);
    };
  }
}

export const errorHandler = new ErrorHandler();
