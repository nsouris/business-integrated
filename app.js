import axios from 'axios';
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { filterIpAddresses } from './middleware/filterIpAddresses';
import { requestWebhookKey } from './middleware/requestWebhookKey';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const app = express();
app.use(express.json());

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
  console.log('Requset method and url : ', req.method, req.url);
  // console.log('Requset queryParams:', req.query);
  console.log('Requset body:', req.body);
  // console.log('REMOTEADDRESSIP', req.socket.remoteAddress);
  // console.log('HEADERSIP', req.headers['x-forwarded-for']);
  // console.log('IP', req.ip);
  next();
});

app.patch('/', async (req, res) => {
  try {
    if (req.body.msg === 'F') throw new Error('wtF!@!');
    await axios({
      method: 'patch',
      url: 'https://BackendPrivateApi.azurewebsites.net',
      headers: {
        'Content-Type': 'application/json',
      },
      data: req.body,
    });
    res.status(202).json('ok');
  } catch (error) {
    console.log('🌞jj', error.message);
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
        console.log('webhookPOSTPAYMENTINFO');
        return res.send({ message: 'ok' });
      } else {
        console.log('KEY:', res.locals.webHook_key);
        return res.send({ key: res.locals.webHook_key });
      }
    } catch (error) {
      console.log(error.message);
    }
  }
);

app.post('/', async (req, res) => {
  try {
    await axios({
      method: 'post',
      url: 'https://BackendPrivateApi.azurewebsites.net',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    res.status(202).json('ok');
  } catch (error) {
    console.log('🌞', error.message);
    res.status(517).json(error.message);
  }
});

app.use(express.static(path.join(__dirname, 'build')));
app.use((_req, res, _next) => {
  res.sendFile(path.join(__dirname, './build', 'index.html'));
});
