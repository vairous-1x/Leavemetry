import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Sick', 'Vacation', 'Personal', 'Urgent', 'Annual Leave', 'Maternity Leave'], required: true },
  description: { type: String, default: '' },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Leave', leaveSchema);
