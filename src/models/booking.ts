import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  name: string;
  phone: string;
  date: Date;
  type: string;
  createdAt: Date;
  confirmed: boolean;
  confirmationId: string;
  telegramUsername?: string;
  userChatId?: string;
}

const BookingSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, required: true, enum: ['sup', 'surfing'] },
  createdAt: { type: Date, default: Date.now },
  confirmed: { type: Boolean, default: false },
  confirmationId: { type: String, required: true, unique: true },
  telegramUsername: { type: String },
  userChatId: { type: String }
});

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
