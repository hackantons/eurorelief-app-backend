import mongoose, { Schema } from 'mongoose';
import { SubscriptionDB } from '../utils/types';

const SubscriptionsSchema: Schema = new Schema({
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
  p256dh: {
    type: String,
    required: true,
  },
  auth: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

export default mongoose.model<SubscriptionDB>(
  'Subscription',
  SubscriptionsSchema
);
