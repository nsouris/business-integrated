import { app } from './app.js';
import { Chat } from './chat.model.js';
import { requestWebhookKey } from './middleware/requestWebhookKey.js';
import { filterIpAddresses } from './middleware/filterIpAddresses.js';

app.patch('/', async (req, res) => {
  try {
    const doc = await Chat.findOne({ roomId: 'minimal' });
    doc.messages.push(req.body.msg);
    await doc.save();
    res.status(202).json('ok');
  } catch (error) {
    console.log('🌞', error.message);
    res.status(517).json(error.message);
  }
});
app.post('/', async (req, res) => {
  try {
    const doc = await Chat.findOne({ roomId: 'minimal' });
    doc.messages = [];
    await doc.save();
    res.status(202).json('ok');
  } catch (error) {
    console.log('🌞', error.message);
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
        console.dir('webhookPOSTPAYMENTINFO', req.body);
        return res.send({ message: 'ok' });
      } else {
        return res.send({ key: res.locals.webHook_key });
      }
    } catch (error) {
      console.log(error.message);
    }
  }
);
