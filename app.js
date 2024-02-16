import axios from 'axios';
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { filterIpAddresses } from './middleware/filterIpAddresses.js';
import { requestWebhookKey } from './middleware/requestWebhookKey.js';
import os from 'os';
import appInsightsClient from './analytics.js';
import { appLogger } from './server.js';
import { handler } from './errorHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const backendUrl = process.env.BACKEND_URL;

export const app = express();
app.use(express.json());

const hostName = os.hostname();
const pid = process.pid;

const HEADERS = {
  'Content-Security-Policy':
    "default-src 'self' https://westeurope-5.in.applicationinsights.azure.com/v2/track;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Origin-Agent-Cluster': '?1',
  'Referrer-Policy': 'no-referrer',
  'Strict-Transport-Security': 'max-age=15552000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-DNS-Prefetch-Control': 'off',
  'X-Download-Options': 'noopen',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-XSS-Protection': '0',
};
app.use((_req, res, next) => {
  res.set(HEADERS);
  next();
});
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, OPTIONS'
  );
  res.setHeader('Access-Control-Expose-Headers', '*');
  next();
});

app.set('trust proxy', true); // to get the req.ip
app.disable('x-powered-by'); // for hiding being an express app

app.use((req, _res, next) => {
  appLogger('Requset method and url : ', req.method, req.url);
  appLogger('Requset body:', req.body);
  appLogger('Client ip:', req.ip);
  appLogger('hosstName', hostName);
  appLogger('id', pid);
  next();
});

app.patch('/', (req, res, next) => {
  if (req.body.msg === 'F')
    setTimeout(() => {
      throw new Error('lets restart');
    }, 5000);
  next();
});

app.patch('/', async (req, res, next) => {
  appInsightsClient.trackEvent({
    name: `🌞🌞🌞frontend patch controler`,
    properties: { frontend: '🔐' + hostName, pid, requestIp: req.ip },
  });
  try {
    if (req.body.msg === 'F') throw new Error('wtF!@!');
    if (req.body.roomId === 'cpuLoad') {
      mySlowFunction(req.body.load); // higher number => more iterations => slower
      return res.status(202).json('ok');
    }
    await axios({
      method: 'patch',
      url: backendUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      data: req.body,
    });
    res.status(202).json('ok');
  } catch (error) {
    next(error);
  }
});

app.use(
  '/webhook/payment',
  requestWebhookKey,
  filterIpAddresses,
  async (req, res, next) => {
    try {
      if (req.method === 'POST') {
        appLogger('webhookPOSTPAYMENTINFO');
        return res.send({ message: 'ok' });
      } else {
        appLogger('KEY:', res.locals.webHook_key);
        return res.send({ key: res.locals.webHook_key });
      }
    } catch (error) {
      next(error);
    }
  }
);

app.post('/', async (req, res, next) => {
  try {
    await axios({
      method: 'post',
      url: backendUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    res.status(202).json('ok');
  } catch (error) {
    next(error);
  }
});

app.use(express.static(path.join(__dirname, 'build')));
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, './build', 'index.html'));
});
// eslint-disable-next-line no-unused-vars
app.use(async (err, req, res, next, _next) => {
  await handler.handleError(err, req, res, next);
});

function mySlowFunction(baseNumber) {
  console.time('mySlowFunction');
  let result = 0;
  for (var i = Math.pow(baseNumber, 7); i >= 0; i--) {
    result += Math.atan(i) * Math.tan(i);
  }
  console.timeEnd('mySlowFunction');
  appLogger(result);
}
