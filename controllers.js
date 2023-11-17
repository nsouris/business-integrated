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

async function withTransaction(req, res, callback) {
  try {
    const session = await Chat.startSession();
    await session.withTransaction(async () => {
      await callback(req.body, res.locals, session);
    });
    session.endSession();
    res.send({
      token: res.locals.token,
      username: req.body.username || res.locals.playerName,
    });
  } catch (error) {
    console.log(`🌞 ${callback?.name} controler`, error.message);
    res.status(401).json(error.message);
  }
}
