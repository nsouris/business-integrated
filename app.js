import axios from 'axios';
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { filterIpAddresses } from './middleware/filterIpAddresses.js';
import { requestWebhookKey } from './middleware/requestWebhookKey.js';
import os from 'os';
import appInsightsClient from './analytics.js';
import { appLogger } from './server.js';
import helmet from 'helmet';

const __dirname = dirname(fileURLToPath(import.meta.url));

const backendUrl = process.env.BACKEND_URL;

export const app = express();
app.use(express.json());

const hostName = os.hostname();
const pid = process.pid;

// app.use(helmet());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Expose-Headers', '*');
  next();
});

app.set('trust proxy', true);

app.use((req, _res, next) => {
  appLogger('Requset method and url : ', req.method, req.url);
  // appLogger('Requset queryParams:', req.query);
  appLogger('Requset body:', req.body);
  appLogger('hostName', hostName);
  appLogger('id', pid);
  // appLogger('REMOTEADDRESSIP', req.socket.remoteAddress);
  // appLogger('HEADERSIP', req.headers['x-forwarded-for']);
  // appLogger('IP', req.ip);
  next();
});

app.patch('/', (req, res, next) => {
  if (req.body.msg === 'F')
    setTimeout(() => {
      throw new Error('lets restart');
    }, 5000);
  next();
});

app.patch('/', async (req, res) => {
  appInsightsClient.trackEvent({
    name: `🌞🌞🌞🌞🌞🌞🌞`,
    properties: { backend: '🔐' + hostName, pid },
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
    appLogger('🌞 patch error', error.message);
    res.status(517).json(error.message);
  }
});

app.use(
  '/webhook/payment',
  requestWebhookKey,
  filterIpAddresses,
  async (req, res) => {
    try {
      if (req.method === 'POST') {
        appLogger('webhookPOSTPAYMENTINFO');
        return res.send({ message: 'ok' });
      } else {
        appLogger('KEY:', res.locals.webHook_key);
        return res.send({ key: res.locals.webHook_key });
      }
    } catch (error) {
      appLogger(error.message);
    }
  }
);

app.post('/', async (req, res) => {
  appInsightsClient.trackEvent({
    name: `🔐🔐🔐🔐🔐🔐🔐🔐🔐`,
    properties: { backend: '🔐' + hostName, pid },
  });
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
    appLogger('🌞', error.message);
    res.status(517).json(error.message);
  }
});

app.use(express.static(path.join(__dirname, 'build')));
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, './build', 'index.html'));
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
