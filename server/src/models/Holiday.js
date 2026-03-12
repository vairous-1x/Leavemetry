import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  type: { type: String, enum: ['company', 'employee'], default: 'company' },
  comment: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Holiday', holidaySchema);
