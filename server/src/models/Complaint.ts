import mongoose, { Document, Schema, Model } from 'mongoose';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Cleaned_Pending_Verification'
  | 'Resolved'
  | 'Rejected';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type WasteCategory =
  | 'plastic'
  | 'organic'
  | 'paper_cardboard'
  | 'metal'
  | 'glass'
  | 'electronic'
  | 'hazardous'
  | 'mixed';

export interface ITimelineEntry {
  status: ComplaintStatus;
  changedBy: mongoose.Types.ObjectId;
  changedByName: string;
  role: string;
  note: string;
  timestamp: Date;
}

export interface IAIAnalysis {
  classifiedCategory: string;
  confidence: number;
  recyclable: boolean;
  urgencyLevel: string;
  hazardScore: number;
  disposalRecommendation: string;
  environmentalImpact: string;
  featuresDetected: string[];
}

export interface IComplaint extends Document {
  _id: mongoose.Types.ObjectId;
  trackingId: string;
  citizen: mongoose.Types.ObjectId;
  citizenName: string;
  citizenEmail: string;
  citizenPhone?: string;
  title: string;
  description: string;
  wasteCategory: WasteCategory;
  wasteCategoryName: string;
  priority: PriorityLevel;
  status: ComplaintStatus;
  location: {
    address: string;
    landmark?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    ward?: string;
    city?: string;
  };
  beforeImage: {
    url: string;
    publicId?: string;
    uploadedAt: Date;
  };
  afterImage?: {
    url: string;
    publicId?: string;
    notes?: string;
    uploadedAt?: Date;
  };
  aiAnalysis?: IAIAnalysis;
  assignedWorker?: mongoose.Types.ObjectId;
  assignedWorkerName?: string;
  assignedWorkerPhone?: string;
  assignedAt?: Date;
  resolvedAt?: Date;
  rejectionReason?: string;
  recleaningRequested?: boolean;
  timeline: ITimelineEntry[];
  estimatedWeightKg?: number;
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TimelineSchema = new Schema<ITimelineEntry>(
  {
    status: { type: String, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changedByName: { type: String, required: true },
    role: { type: String, required: true },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AIAnalysisSchema = new Schema<IAIAnalysis>(
  {
    classifiedCategory: { type: String, required: true },
    confidence: { type: Number, required: true },
    recyclable: { type: Boolean, required: true },
    urgencyLevel: { type: String, required: true },
    hazardScore: { type: Number, required: true },
    disposalRecommendation: { type: String, required: true },
    environmentalImpact: { type: String, required: true },
    featuresDetected: [{ type: String }],
  },
  { _id: false }
);

const ComplaintSchema = new Schema<IComplaint>(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    citizen: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    citizenName: { type: String, required: true },
    citizenEmail: { type: String, required: true },
    citizenPhone: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    wasteCategory: {
      type: String,
      enum: ['plastic', 'organic', 'paper_cardboard', 'metal', 'glass', 'electronic', 'hazardous', 'mixed'],
      required: true,
      index: true,
    },
    wasteCategoryName: { type: String, required: true },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Cleaned_Pending_Verification',
        'Resolved',
        'Rejected',
      ],
      default: 'Submitted',
      index: true,
    },
    location: {
      address: { type: String, required: true },
      landmark: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
      ward: { type: String, default: 'General Ward' },
      city: { type: String, default: 'Metropolis' },
    },
    beforeImage: {
      url: { type: String, required: true },
      publicId: { type: String, default: '' },
      uploadedAt: { type: Date, default: Date.now },
    },
    afterImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      notes: { type: String, default: '' },
      uploadedAt: { type: Date },
    },
    aiAnalysis: { type: AIAnalysisSchema },
    assignedWorker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    assignedWorkerName: { type: String, default: '' },
    assignedWorkerPhone: { type: String, default: '' },
    assignedAt: { type: Date },
    resolvedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
    recleaningRequested: { type: Boolean, default: false },
    timeline: [TimelineSchema],
    estimatedWeightKg: { type: Number, default: 25 },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: '' },
      submittedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Helpful compound indexes for geo & filter queries
ComplaintSchema.index({ 'location.coordinates.lat': 1, 'location.coordinates.lng': 1 });
ComplaintSchema.index({ status: 1, priority: 1 });

import { isMemoryMode } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';

const MongooseComplaint: Model<IComplaint> = mongoose.model<IComplaint>('Complaint', ComplaintSchema);

export const Complaint: any = new Proxy(MongooseComplaint, {
  get(target, prop, receiver) {
    if (isMemoryMode && (memoryStore.complaints as any)[prop]) {
      return (memoryStore.complaints as any)[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});
