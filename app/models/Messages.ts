import mongoose, { Schema } from 'mongoose';
import { MessageDB } from '../utils/types';

const MessageDBSchema: Schema = new Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  message: {
    type: String,
    required: true,
  },
  sent: {
    type: Date,
    required: true,
  },
  sentVia: {
    type: String,
    required: true,
  },
  seen: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

export default mongoose.model<MessageDB>('Messages', MessageDBSchema);
