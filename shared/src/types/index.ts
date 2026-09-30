/**
 * Shared Type Definitions for Loop Domain Entities & Payloads
 */

export type LoopType = 'habit' | 'medicine' | 'chore' | 'expense';

export type LoopRole = 'owner' | 'member' | 'caregiver' | 'patient';

export type CheckInStatus = 'done' | 'taken' | 'paid' | 'skipped' | 'missed';

export type ThemePreference = 'system' | 'light' | 'dark' | 'highContrast';

export interface UserAccessibilityPreferences {
  themePreference: ThemePreference;
  textScale: number; // 1.0 = standard, up to 2.5
  reduceMotion: boolean;
  ttsEnabled: boolean;
  simpleMode: boolean; // Patient mode: high contrast, big cards, single action
  highContrast: boolean;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  timezone: string; // e.g. "America/New_York"
  locale: string; // e.g. "en-US"
  preferences: UserAccessibilityPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface ILoopMember {
  userId: string;
  role: LoopRole;
  nickname?: string;
  joinedAt: string;
  patientCaregiverId?: string; // Links caregiver to patient if applicable
}

export interface ILoopSchedule {
  frequency: 'daily' | 'weekdays' | 'custom_days' | 'interval';
  timesOfDay: string[]; // e.g. ["08:00", "20:00"] in 24-hr format
  customDays?: number[]; // 0=Sunday, 1=Monday ... 6=Saturday
  deadlineMinutesAfterDue: number; // e.g., 60 minutes after due time before considered 'missed'
}

export interface ILoop {
  id: string;
  name: string;
  description?: string;
  type: LoopType;
  inviteCode: string;
  icon: string; // e.g. 'pill', 'flame', 'sparkles', 'wallet'
  color: string; // token reference
  members: ILoopMember[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILoopItem {
  id: string;
  loopId: string;
  title: string;
  description?: string;
  assignedTo?: string[]; // Member IDs. Empty means all members
  schedule: ILoopSchedule;
  // Type-specific extensions:
  medicineDetails?: {
    dosage: string; // e.g. "500mg"
    instructions: string; // e.g. "Take with food"
    currentStock?: number;
    refillThreshold?: number;
  };
  choreDetails?: {
    rotationMode: 'fixed' | 'round_robin';
    currentAssigneeId?: string;
    estimatedMinutes?: number;
  };
  expenseDetails?: {
    defaultSplitMode: 'equal' | 'percentage' | 'exact';
    amount?: number;
    currency: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICheckIn {
  id: string;
  loopId: string;
  itemId: string;
  userId: string;
  scheduledTime: string; // ISO String
  status: CheckInStatus;
  timestamp: string; // ISO String of when checked in
  notes?: string;
  proofAttachment?: {
    type: 'photo' | 'voice_note';
    url: string;
  };
  canUndoUntil?: string; // Timestamp for 10-second undo window
}

export interface INudge {
  id: string;
  loopId: string;
  fromUserId: string;
  toUserId: string;
  itemId?: string;
  message: string;
  timestamp: string;
}

export interface IEmergencyInfo {
  id: string;
  userId: string; // Patient
  loopId: string;
  primaryContactName: string;
  primaryContactPhone: string;
  doctorName?: string;
  doctorPhone?: string;
  hospitalPreference?: string;
  allergies?: string[];
  bloodType?: string;
  notes?: string;
}
