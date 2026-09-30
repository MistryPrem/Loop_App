import { Schema, model } from 'mongoose';
import { nanoid } from 'nanoid';

const LoopMemberSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'member', 'caregiver', 'patient'],
    default: 'member'
  },
  nickname: {
    type: String,
    trim: true
  },
  patientCaregiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const LoopSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300
  },
  type: {
    type: String,
    enum: ['habit', 'medicine', 'chore', 'expense'],
    required: true,
    index: true
  },
  inviteCode: {
    type: String,
    unique: true,
    required: true,
    default: () => nanoid(8).toUpperCase(),
    index: true
  },
  icon: {
    type: String,
    default: 'circle'
  },
  color: {
    type: String,
    default: '#0D9488'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [LoopMemberSchema]
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

// Indexes for fast lookup of a user's loops
LoopSchema.index({ 'members.userId': 1 });

export const Loop = model('Loop', LoopSchema);
