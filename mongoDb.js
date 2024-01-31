import mongoose from 'mongoose';

const DB = 'Socket';
const COLLECTION = 'socket.io-adapter-events';

try {
  mongoose.set('strictQuery', false); // if true only the fields that are specified in the Schema will be saved
  await mongoose.connect(
    `mongodb+srv://primitivo:7ZuIFwncwAlka6oX@cluster0.qyvtcbt.mongodb.net/${DB}?retryWrites=true&w=majority`
  );
  console.log('🌎 Connection to AdapterDb Succesfull! 🌎');
} catch (err) {
  console.log('🌞 Connection to AdapterDb failed', err);
}

export const defaultConnection = mongoose.connection;
export const adapterCollection = defaultConnection.collection(COLLECTION);
await adapterCollection.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 60, background: true }
);
mongoose.set('toJSON', { virtuals: true });

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from Db!!!');
});

defaultConnection.on('error', err => {
  console.log('🌞 Db error', err);
});
defaultConnection.on('disconnected', () => {
  console.log('🌞 Disconnected from Db!!!');
});
