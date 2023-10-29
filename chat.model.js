import mongoose, { Schema } from 'mongoose';
import { socketIoServer } from './server.js';

const chatSchema = new Schema(
  {
    roomId: { type: String },
    messages: { type: Array },
  },
  { versionKey: false, minimize: false } // for saving empty objects
);

const Chat = mongoose.model('chat', chatSchema);

Chat.watch({ fullDocument: 'updateLookup' }).on('change', data => {
  socketIoServer.emit('update', data.fullDocument.messages);
});

export { Chat };
