import axios from 'axios';

export const requestWebhookKey = async (_req, res, next) => {
  try {
    const encodedCredentials = Buffer.from(
      'be46fd68-cb09-4172-a2c7-887c18c1d156:alelamachine'
    ).toString('base64');

    const response = await axios({
      method: 'get',
      url: 'https://demo.vivapayments.com/api/messages/config/token',
      headers: {
        Authorization: 'Basic ' + encodedCredentials,
      },
    });
    res.locals.webHook_key = response.data.Key;
    console.log('webhookMIDDLEWARE', response.data.Key);
    next();
  } catch (error) {
    console.log('🌞 requestWebhookKey', error.message);
    res.send(error.message);
  }
};
