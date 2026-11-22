import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  performedBy: mongoose.Types.ObjectId;
  performedByName: string;
  role: string;
  targetId?: string;
  targetType: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    performedByName: { type: String, required: true },
    role: { type: String, required: true },
    targetId: { type: String, default: '' },
    targetType: { type: String, default: 'Complaint' },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '127.0.0.1' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

import { isMemoryMode } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';

const MongooseAuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export const AuditLog: any = new Proxy(MongooseAuditLog, {
  get(target, prop, receiver) {
    if (isMemoryMode && (memoryStore.auditLogs as any)[prop]) {
      return (memoryStore.auditLogs as any)[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});
