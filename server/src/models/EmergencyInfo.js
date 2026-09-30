import { Schema, model } from 'mongoose';

const EmergencyInfoSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  loopId: {
    type: Schema.Types.ObjectId,
    ref: 'Loop',
    required: true,
    index: true
  },
  primaryContactName: {
    type: String,
    required: true,
    trim: true
  },
  primaryContactPhone: {
    type: String,
    required: true,
    trim: true
  },
  doctorName: {
    type: String,
    trim: true
  },
  doctorPhone: {
    type: String,
    trim: true
  },
  hospitalPreference: {
    type: String,
    trim: true
  },
  allergies: [{
    type: String,
    trim: true
  }],
  bloodType: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

EmergencyInfoSchema.index({ userId: 1, loopId: 1 }, { unique: true });

export const EmergencyInfo = model('EmergencyInfo', EmergencyInfoSchema);
