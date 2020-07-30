import mongoose, { Schema } from 'mongoose';
import { UserDB } from '../utils/types';

const UserDBSchema: Schema = new Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

export default mongoose.model<UserDB>('User', UserDBSchema);
