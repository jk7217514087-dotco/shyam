export type UserRole = 'citizen' | 'worker' | 'admin';

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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  department?: string;
  assignedZone?: string;
  employeeId?: string;
}

export interface ITimelineEntry {
  status: ComplaintStatus;
  changedByName: string;
  role: string;
  note: string;
  timestamp: string;
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

export interface Complaint {
  _id: string;
  trackingId: string;
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
    uploadedAt: string;
  };
  afterImage?: {
    url: string;
    notes?: string;
    uploadedAt?: string;
  };
  aiAnalysis?: IAIAnalysis;
  assignedWorker?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    assignedZone?: string;
    employeeId?: string;
  };
  assignedWorkerName?: string;
  assignedWorkerPhone?: string;
  assignedAt?: string;
  resolvedAt?: string;
  rejectionReason?: string;
  recleaningRequested?: boolean;
  timeline: ITimelineEntry[];
  estimatedWeightKg?: number;
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SystemMetrics {
  totalComplaints: number;
  pendingTotal: number;
  inProgressTotal: number;
  pendingVerificationCount: number;
  resolvedCount: number;
  rejectedCount: number;
  resolutionRate: number;
  activeWorkersCount: number;
  registeredCitizensCount: number;
  avgResolutionHours: number;
  impact: {
    wasteCollectedKg: number;
    carbonOffsetKg: number;
    landfillDiversionPct: number;
    treesEquivalent: number;
  };
}

export interface SystemAnalytics {
  metrics: SystemMetrics;
  charts: {
    categoryBreakdown: { category: string; name: string; count: number; percentage: number }[];
    statusBreakdown: { status: string; count: number; label: string }[];
    priorityBreakdown: { priority: string; count: number }[];
    wardBreakdown: { ward: string; count: number }[];
  };
  hotspots: {
    id: string;
    title: string;
    status: ComplaintStatus;
    priority: PriorityLevel;
    category: WasteCategory;
    lat: number;
    lng: number;
    address: string;
    createdAt: string;
  }[];
}
