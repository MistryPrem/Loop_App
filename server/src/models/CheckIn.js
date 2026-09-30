import { Schema, model } from 'mongoose';

const CheckInSchema = new Schema({
  loopId: {
    type: Schema.Types.ObjectId,
    ref: 'Loop',
    required: true,
    index: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'LoopItem',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  scheduledTime: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['done', 'taken', 'paid', 'skipped', 'missed'],
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 300
  },
  proofAttachment: {
    type: {
      type: String,
      enum: ['photo', 'voice_note']
    },
    url: String
  },
  canUndoUntil: {
    type: Date
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

// Composite index to quickly check today's status or streaks
CheckInSchema.index({ itemId: 1, userId: 1, scheduledTime: 1 });
CheckInSchema.index({ loopId: 1, timestamp: -1 });

export const CheckIn = model('CheckIn', CheckInSchema);
