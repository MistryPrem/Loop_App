import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const UserPreferencesSchema = new Schema({
  themePreference: {
    type: String,
    enum: ['system', 'light', 'dark', 'highContrast'],
    default: 'system'
  },
  textScale: {
    type: Number,
    min: 1.0,
    max: 2.5,
    default: 1.0
  },
  reduceMotion: {
    type: Boolean,
    default: false
  },
  ttsEnabled: {
    type: Boolean,
    default: false
  },
  simpleMode: {
    type: Boolean,
    default: false
  },
  highContrast: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  locale: {
    type: String,
    default: 'en-US'
  },
  preferences: {
    type: UserPreferencesSchema,
    default: () => ({})
  },
  refreshToken: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      delete ret.passwordHash;
      delete ret.refreshToken;
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Password verification method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = model('User', UserSchema);
