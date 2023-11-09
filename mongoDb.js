import mongoose from 'mongoose';

mongoose.set('strictQuery', false);
mongoose
  .connect(
    `mongodb+srv://orionx7:i7HxupA9otqHGDWo@testcluster.t3fpgoc.mongodb.net/TestMinimal?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(
    _ => console.log('Connection to Db Succesfull!'),
    err => console.log('Somthing Went Wrong:', err)
  );

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from Db!!!');
});

mongoose.set('toJSON', { virtuals: true });
