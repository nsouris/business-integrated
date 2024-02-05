import { appLogger } from '../server.js';

const vivaWalletIps = [
  '20.50.240.57',
  '40.74.20.78',
  '94.70.170.65',
  '94.70.174.36',
  '94.70.255.73',
  '94.70.248.18',
  '83.235.24.226',
]; // change for production !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

export const filterIpAddresses = (req, res, next) => {
  try {
    if (vivaWalletIps.some(ip => req.ip.includes(ip))) {
      appLogger('TRUSTED', req.ip);
      next();
    } else res.send('untrusted');
  } catch (error) {
    appLogger('🌞 filterIpAddresses', error.message);
    res.send('internal server error');
  }
};
