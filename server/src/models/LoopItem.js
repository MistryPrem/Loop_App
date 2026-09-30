import { Schema, model } from 'mongoose';

const LoopScheduleSchema = new Schema({
  frequency: {
    type: String,
    enum: ['daily', 'weekdays', 'custom_days', 'interval'],
    default: 'daily'
  },
  timesOfDay: {
    type: [String], // e.g. ["08:00", "20:00"] (24hr format)
    default: ['09:00']
  },
  customDays: {
    type: [Number], // 0=Sun, 1=Mon ... 6=Sat
    default: []
  },
  deadlineMinutesAfterDue: {
    type: Number,
    default: 60 // 60 mins overdue threshold
  }
}, { _id: false });

const LoopItemSchema = new Schema({
  loopId: {
    type: Schema.Types.ObjectId,
    ref: 'Loop',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  schedule: {
    type: LoopScheduleSchema,
    default: () => ({})
  },
  // Type-specific extensions
  medicineDetails: {
    dosage: { type: String, trim: true },
    instructions: { type: String, trim: true },
    currentStock: { type: Number, min: 0 },
    refillThreshold: { type: Number, min: 0 }
  },
  choreDetails: {
    rotationMode: {
      type: String,
      enum: ['fixed', 'round_robin'],
      default: 'fixed'
    },
    currentAssigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    estimatedMinutes: { type: Number, min: 1 }
  },
  expenseDetails: {
    defaultSplitMode: {
      type: String,
      enum: ['equal', 'percentage', 'exact'],
      default: 'equal'
    },
    amount: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' }
  },
  isActive: {
    type: Boolean,
    default: true,
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

export const LoopItem = model('LoopItem', LoopItemSchema);
