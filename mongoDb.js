import mongoose from 'mongoose';

const DB = 'Socket';
const COLLECTION = 'socket.io-adapter-events';

async function connectDb() {
  try {
    mongoose.set('strictQuery', false); // if true only the fields that are specified in the Schema will be saved
    await mongoose.connect(
      `mongodb+srv://primitivo:7ZuIFwncwAlka6oX@cluster0.qyvtcbt.mongodb.net/${DB}?retryWrites=true&w=majority`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log('Connection to MongoDB Succesfull!');
  } catch (err) {
    console.log('Connection to MongoDB failde due to ', err);
  }
}
await connectDb();

export const adapterCollection = mongoose.connection.collection(COLLECTION);
await adapterCollection.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 60, background: true }
);
mongoose.set('toJSON', { virtuals: true });

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from Db!!!');
});
