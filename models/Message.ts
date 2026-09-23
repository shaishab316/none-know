import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  cipher: string;
  maxView?: number;
  currentViewCount: number;
  ttl?: Date;
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
      min: [1, 'Max view count must be at least 1'],
    },
    currentViewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    ttl: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

MessageSchema.index(
  { ttl: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { ttl: { $exists: true } },
  },
);

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
