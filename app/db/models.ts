import mongoose, { Schema } from 'mongoose';
import { MessageDB, SubscriptionDB, UserDB } from '../types/types';

export const Messages = mongoose.model<MessageDB>(
  'Messages',
  new Schema({
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    message: {
      type: String,
      required: true,
    },
    title: {
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
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  })
);

export const Subscriptions = mongoose.model<SubscriptionDB>(
  'Subscription',
  new Schema({
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
  })
);

export const User = mongoose.model<UserDB>(
  'User',
  new Schema({
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
  })
);
