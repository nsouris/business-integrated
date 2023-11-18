import { app } from './app.js';
import { requestWebhookKey } from './middleware/requestWebhookKey.js';
import { filterIpAddresses } from './middleware/filterIpAddresses.js';

app.use(
  '/webhook/payment',
  requestWebhookKey,
  filterIpAddresses,
  async (req, res) => {
    try {
      if (req.method === 'POST') {
        console.dir('webhookPOSTPAYMENTINFO');
        return res.send({ message: 'ok' });
      } else {
        return res.send({ key: res.locals.webHook_key });
      }
    } catch (error) {
      console.log(error.message);
    }
  }
);
