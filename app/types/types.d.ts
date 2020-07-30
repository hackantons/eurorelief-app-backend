import { Document } from 'mongoose';

export interface Subscription {
  endpoint: string;
  p256dh: string;
  auth: string;
  user: string;
}

export interface SubscriptionDB extends Subscription, Document {}

export interface User {
  uuid: string;
  phone: string;
}

export interface UserDB extends User, Document {}

export interface Message {
  uuid: string;
  message: string;
  sent: string;
  sentVia: string;
  seen: string;
  user: string;
}

export interface MessageDB extends Message, Document {}
