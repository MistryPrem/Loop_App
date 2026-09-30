import { Schema, model } from 'mongoose';

const NudgeSchema = new Schema({
  loopId: {
    type: Schema.Types.ObjectId,
    ref: 'Loop',
    required: true,
    index: true
  },
  fromUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'LoopItem'
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
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

export const Nudge = model('Nudge', NudgeSchema);
