import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  cipher: string;
  maxView: number;
  currentViewCount: number;
  ttl: Date;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    cipher: {
      type: String,
      required: [true, 'Cipher payload is required'],
    },
    maxView: {
      type: Number,
      required: [true, 'Max view count is required'],
      min: [1, 'Max view count must be at least 1'],
      default: 1,
    },
    currentViewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    ttl: {
      type: Date,
      required: [true, 'TTL expiration date is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

MessageSchema.index({ ttl: 1 }, { expireAfterSeconds: 0 });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
