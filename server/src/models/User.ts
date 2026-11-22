import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'citizen' | 'worker' | 'admin';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  department?: string;
  assignedZone?: string;
  employeeId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['citizen', 'worker', 'admin'],
      default: 'citizen',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: 'Municipal Sanitation Directorate',
    },
    assignedZone: {
      type: String,
      default: 'General Ward',
    },
    employeeId: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

import { isMemoryMode } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';

const MongooseUser: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export const User: any = new Proxy(MongooseUser, {
  get(target, prop, receiver) {
    if (isMemoryMode && (memoryStore.users as any)[prop]) {
      return (memoryStore.users as any)[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});
