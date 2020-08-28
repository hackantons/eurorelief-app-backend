import { Document } from 'mongoose';

export interface Subscription {
  endpoint: string;
  p256dh: string;
  auth: string;
  user?: string;
}

export interface SubscriptionDB extends Subscription, Document {}

export interface User {
  uuid: string;
  password?: string;
  phone?: string;
}

export interface UserDB extends User, Document {}

export interface Message {
  uuid: string;
  message: string;
  title: string;
  sent: string;
  sentVia: string;
  seen: string;
  user?: string;
  log?: PushLog;
}

export interface MessageDB extends Message, Document {}

export type PushLog = Array<{
  type: 'push' | 'sms';
  success: boolean;
  raw: any;
}>;
