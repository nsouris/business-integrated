import mongoose from 'mongoose';

const DB = 'Socket';
const COLLECTION = 'socket.io-adapter-events';
mongoose.connect(
  `mongodb+srv://orionx7:i7HxupA9otqHGDWo@testcluster.t3fpgoc.mongodb.net/${DB}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

export const mongoCollection = mongoose.connection.collection(COLLECTION);
await mongoCollection.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 60, background: true }
);

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from Db!!!');
});
mongoose.set('toJSON', { virtuals: true });
