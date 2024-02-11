import debug from 'debug';
import mongoose from 'mongoose';

const DB = 'Socket';
const COLLECTION = 'socket.io-adapter-events';
const appLogger = debug('frontend');
try {
  mongoose.set('strictQuery', false); // if true only the fields that are specified in the Schema will be saved
  await mongoose.connect(
    `mongodb+srv://primitivo:ZuIFwncwAlka6oX@cluster0.qyvtcbt.mongodb.net/${DB}?retryWrites=true&w=majority`
  );
  appLogger('🌎 Connection to AdapterDb Succesfull! 🌎');
} catch (err) {
  appLogger('🌞 Connection to AdapterDb failed', err);
  process.exit(0);
}

export const defaultConnection = mongoose.connection;
export const adapterCollection = defaultConnection.collection(COLLECTION);
await adapterCollection.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 60, background: true }
);
mongoose.set('toJSON', { virtuals: true });

mongoose.connection.on('disconnected', () => {
  appLogger('Disconnected from Db!!!');
});

defaultConnection.on('error', err => {
  appLogger('🌞 Db error', err);
});
defaultConnection.on('disconnected', () => {
  appLogger('🌞 Disconnected from Db!!!');
});
