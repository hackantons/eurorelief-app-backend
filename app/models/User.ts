import mongoose, { Schema } from 'mongoose';
import { UserDB } from '../types/types';

const UserDBSchema: Schema = new Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
});

export default mongoose.model<UserDB>('User', UserDBSchema);
