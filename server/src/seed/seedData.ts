import { User } from '../models/User.js';
import { Complaint } from '../models/Complaint.js';
import { AuditLog } from '../models/AuditLog.js';

export const seedDatabase = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('[Seed] Database already contains records. Skipping initial seeding.');
      return;
    }

    console.log('[Seed] Seeding database with realistic municipal demonstration data...');

    // 1. Create Municipal Administrator
    const admin = await User.create({
      name: 'Commissioner Vikram Malhotra',
      email: 'admin@smartbin.ai',
      password: 'Admin@123',
      role: 'admin',
      department: 'Directorate of Municipal Solid Waste Operations',
      assignedZone: 'City HQ Command Center',
      phone: '+91 98000 11223',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isActive: true,
    });

    // 2. Create Field Sanitation Workers
    const worker1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'worker.rajesh@smartbin.ai',
      password: 'Worker@123',
      role: 'worker',
      department: 'Rapid Clean Dispatch Team A',
      assignedZone: 'Central Downtown & Ward 4',
      employeeId: 'SBW-1042',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      isActive: true,
    });

    const worker2 = await User.create({
      name: 'Priya Sharma',
      email: 'worker.priya@smartbin.ai',
      password: 'Worker@123',
      role: 'worker',
      department: 'Tech Corridor Sanitation Wing',
      assignedZone: 'Ward 7 - Innovation Hub',
      employeeId: 'SBW-1045',
      phone: '+91 98765 43211',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      isActive: true,
    });

    const worker3 = await User.create({
      name: 'Suresh Patil',
      email: 'worker.suresh@smartbin.ai',
      password: 'Worker@123',
      role: 'worker',
      department: 'Heavy Haulage & Recyclables',
      assignedZone: 'Ward 12 - Riverside Promenade',
      employeeId: 'SBW-1049',
      phone: '+91 98765 43212',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      isActive: true,
    });

    // 3. Create Citizens
    const citizen1 = await User.create({
      name: 'Ananya Deshmukh',
      email: 'citizen.ananya@gmail.com',
      password: 'Citizen@123',
      role: 'citizen',
      phone: '+91 98111 22334',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
      isActive: true,
    });

    const citizen2 = await User.create({
      name: 'Arjun Verma',
      email: 'citizen.arjun@gmail.com',
      password: 'Citizen@123',
      role: 'citizen',
      phone: '+91 98222 33445',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      isActive: true,
    });

    // 4. Create Complaints Across All Lifecycle States
    const sampleComplaints = [
      {
        trackingId: 'SB-2026-10482',
        citizen: citizen1._id,
        citizenName: citizen1.name,
        citizenEmail: citizen1.email,
        citizenPhone: citizen1.phone,
        title: 'Severe Plastic Accumulation Near Main Bus Interchange',
        description: 'Large pile of single-use PET bottles, multi-layer food wrappers, and plastic containers blocking the pedestrian sidewalk right outside the metro interchange gate 3.',
        wasteCategory: 'plastic',
        wasteCategoryName: 'Plastic & Synthetic Polymers',
        priority: 'Medium',
        status: 'Submitted',
        location: {
          address: 'Station Road, Near Metro Interchange Gate 3',
          landmark: 'Opposite City Center Bus Terminal',
          coordinates: { lat: 12.9716, lng: 77.5946 },
          ward: 'Central Downtown & Ward 4',
          city: 'Metropolis',
        },
        beforeImage: {
          url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
          uploadedAt: new Date(Date.now() - 3600000 * 2),
        },
        aiAnalysis: {
          classifiedCategory: 'plastic',
          confidence: 0.95,
          recyclable: true,
          urgency_level: 'Medium',
          hazardScore: 4,
          disposalRecommendation: 'Segregate into blue dry recyclables stream. Send to local polymer sorting depot.',
          environmentalImpact: 'High risk of storm drain choke during rains; non-biodegradable polymer structure.',
          featuresDetected: ['Translucent PET bottle profiles', 'Polyethylene film layers', 'High synthetic reflectance'],
        },
        timeline: [
          {
            status: 'Submitted',
            changedBy: citizen1._id,
            changedByName: citizen1.name,
            role: 'citizen',
            note: 'Complaint registered by citizen with AI-assisted plastic categorization.',
            timestamp: new Date(Date.now() - 3600000 * 2),
          },
        ],
        estimatedWeightKg: 42,
      },
      {
        trackingId: 'SB-2026-21840',
        citizen: citizen1._id,
        citizenName: citizen1.name,
        citizenEmail: citizen1.email,
        citizenPhone: citizen1.phone,
        title: 'Decomposing Vegetable & Fruit Waste Outside Wholesale Market',
        description: 'Substantial heap of decaying market produce emitting strong odors and attracting street animals. Urgent clearance needed before evening peak hours.',
        wasteCategory: 'organic',
        wasteCategoryName: 'Organic & Biodegradable Waste',
        priority: 'High',
        status: 'Assigned',
        location: {
          address: 'APMC Market Lane 4, Behind Fruit Mandi',
          landmark: 'Adjacent to Wholesale Cold Storage',
          coordinates: { lat: 12.9752, lng: 77.5991 },
          ward: 'Central Downtown & Ward 4',
          city: 'Metropolis',
        },
        beforeImage: {
          url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
          uploadedAt: new Date(Date.now() - 3600000 * 6),
        },
        aiAnalysis: {
          classifiedCategory: 'organic',
          confidence: 0.96,
          recyclable: true,
          urgency_level: 'High',
          hazardScore: 6,
          disposalRecommendation: 'Route directly to municipal bio-methanation facility for anaerobic digestate composting.',
          environmentalImpact: 'Immediate odor and methane emission risk; high microbial decomposition activity.',
          featuresDetected: ['Chlorophyll decomposition markers', 'Moist vegetative biomass', 'High odor risk index'],
        },
        assignedWorker: worker1._id,
        assignedWorkerName: worker1.name,
        assignedWorkerPhone: worker1.phone,
        assignedAt: new Date(Date.now() - 3600000 * 4),
        timeline: [
          {
            status: 'Submitted',
            changedBy: citizen1._id,
            changedByName: citizen1.name,
            role: 'citizen',
            note: 'Complaint submitted with high priority marker.',
            timestamp: new Date(Date.now() - 3600000 * 6),
          },
          {
            status: 'Assigned',
            changedBy: admin._id,
            changedByName: admin.name,
            role: 'admin',
            note: `Dispatched to ${worker1.name} for same-day organic clearance.`,
            timestamp: new Date(Date.now() - 3600000 * 4),
          },
        ],
        estimatedWeightKg: 85,
      },
      {
        trackingId: 'SB-2026-31994',
        citizen: citizen2._id,
        citizenName: citizen2.name,
        citizenEmail: citizen2.email,
        citizenPhone: citizen2.phone,
        title: 'Discarded Commercial Electronics & Lithium Batteries in Alley',
        description: 'Old desktop CPU casings, swollen lithium battery packs, and bundles of sheared copper cabling dumped behind tech park block B.',
        wasteCategory: 'electronic',
        wasteCategoryName: 'Electronic & E-Waste',
        priority: 'High',
        status: 'In Progress',
        location: {
          address: '7th Cross Road, Behind Cyber Heights Tower 2',
          landmark: 'Next to Tech Park Transformer Yard',
          coordinates: { lat: 12.9812, lng: 77.6045 },
          ward: 'Ward 7 - Innovation Hub',
          city: 'Metropolis',
        },
        beforeImage: {
          url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
          uploadedAt: new Date(Date.now() - 3600000 * 8),
        },
        aiAnalysis: {
          classifiedCategory: 'electronic',
          confidence: 0.93,
          recyclable: true,
          urgency_level: 'High',
          hazardScore: 8,
          disposalRecommendation: 'Dispatch certified e-waste recovery vehicle. Do not mix with generic solid refuse.',
          environmentalImpact: 'Heavy metal leaching hazard (lead, cadmium); fire risk from damaged lithium cells.',
          featuresDetected: ['Silicon printed circuit board signature', 'Heavy cabling density', 'E-waste metal casings'],
        },
        assignedWorker: worker2._id,
        assignedWorkerName: worker2.name,
        assignedWorkerPhone: worker2.phone,
        assignedAt: new Date(Date.now() - 3600000 * 5),
        timeline: [
          {
            status: 'Submitted',
            changedBy: citizen2._id,
            changedByName: citizen2.name,
            role: 'citizen',
            note: 'Complaint submitted by citizen.',
            timestamp: new Date(Date.now() - 3600000 * 8),
          },
          {
            status: 'Assigned',
            changedBy: admin._id,
            changedByName: admin.name,
            role: 'admin',
            note: `Assigned to ${worker2.name} for specialized hazardous e-waste containment.`,
            timestamp: new Date(Date.now() - 3600000 * 5),
          },
          {
            status: 'In Progress',
            changedBy: worker2._id,
            changedByName: worker2.name,
            role: 'worker',
            note: 'Worker arrived at Cyber Heights alley with anti-static containers.',
            timestamp: new Date(Date.now() - 3600000 * 1),
          },
        ],
        estimatedWeightKg: 35,
      },
      {
        trackingId: 'SB-2026-44102',
        citizen: citizen1._id,
        citizenName: citizen1.name,
        citizenEmail: citizen1.email,
        citizenPhone: citizen1.phone,
        title: 'Huge Cardboard & Packaging Dump Behind Commercial Complex',
        description: 'Dozens of flattened packing boxes, styrofoam packaging, and plastic pallet wrap dumped after warehouse deliveries.',
        wasteCategory: 'paper_cardboard',
        wasteCategoryName: 'Paper & Cardboard Packaging',
        priority: 'Medium',
        status: 'Cleaned_Pending_Verification',
        location: {
          address: 'Brigade Link Road, Commercial Service Lane',
          landmark: 'Behind Grand Central Mall Loading Bay',
          coordinates: { lat: 12.9689, lng: 77.6012 },
          ward: 'Central Downtown & Ward 4',
          city: 'Metropolis',
        },
        beforeImage: {
          url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
          uploadedAt: new Date(Date.now() - 3600000 * 12),
        },
        afterImage: {
          url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
          notes: 'Full cardboard recovery completed. 14 bundles bound and dispatched to pulp recycling depot. Alley washed down.',
          uploadedAt: new Date(Date.now() - 3600000 * 1),
        },
        aiAnalysis: {
          classifiedCategory: 'paper_cardboard',
          confidence: 0.94,
          recyclable: true,
          urgency_level: 'Low',
          hazardScore: 2,
          disposalRecommendation: 'Bundle dry corrugated sheets. Direct transfer to municipal baling press facility.',
          environmentalImpact: 'High potential for recovery; saving ~17 trees per ton of recycled cardboard.',
          featuresDetected: ['Kraft paper brown hue', 'Corrugated carton layering', 'Low moisture index'],
        },
        assignedWorker: worker1._id,
        assignedWorkerName: worker1.name,
        assignedWorkerPhone: worker1.phone,
        assignedAt: new Date(Date.now() - 3600000 * 10),
        timeline: [
          {
            status: 'Submitted',
            changedBy: citizen1._id,
            changedByName: citizen1.name,
            role: 'citizen',
            note: 'Complaint submitted by citizen.',
            timestamp: new Date(Date.now() - 3600000 * 12),
          },
          {
            status: 'Assigned',
            changedBy: admin._id,
            changedByName: admin.name,
            role: 'admin',
            note: `Assigned to ${worker1.name}.`,
            timestamp: new Date(Date.now() - 3600000 * 10),
          },
          {
            status: 'In Progress',
            changedBy: worker1._id,
            changedByName: worker1.name,
            role: 'worker',
            note: 'Baling crew mobilized on site.',
            timestamp: new Date(Date.now() - 3600000 * 4),
          },
          {
            status: 'Cleaned_Pending_Verification',
            changedBy: worker1._id,
            changedByName: worker1.name,
            role: 'worker',
            note: 'Complete collection done. After-cleaning photograph submitted for admin approval.',
            timestamp: new Date(Date.now() - 3600000 * 1),
          },
        ],
        estimatedWeightKg: 120,
      },
      {
        trackingId: 'SB-2026-55910',
        citizen: citizen2._id,
        citizenName: citizen2.name,
        citizenEmail: citizen2.email,
        citizenPhone: citizen2.phone,
        title: 'Mixed Roadside Waste Heap at Riverside Promenade',
        description: 'Illegal dumping spot with discarded glass bottles, beverage cans, plastic cups, and unsegregated household debris.',
        wasteCategory: 'mixed',
        wasteCategoryName: 'Mixed Unsegregated Solid Waste',
        priority: 'Medium',
        status: 'Resolved',
        location: {
          address: 'Riverside Walkway, Near Sunset Pavilion',
          landmark: 'Opposite River View Pier 4',
          coordinates: { lat: 12.9845, lng: 77.5891 },
          ward: 'Ward 12 - Riverside Promenade',
          city: 'Metropolis',
        },
        beforeImage: {
          url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
          uploadedAt: new Date(Date.now() - 3600000 * 24),
        },
        afterImage: {
          url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
          notes: 'Promenade cleared, sweeping and disinfectant spray applied. New dustbins placed nearby.',
          uploadedAt: new Date(Date.now() - 3600000 * 8),
        },
        aiAnalysis: {
          classifiedCategory: 'mixed',
          confidence: 0.91,
          recyclable: false,
          urgency_level: 'High',
          hazardScore: 5,
          disposalRecommendation: 'Mechanical sorting truck dispatch required. Segregate glass cullet and dry recyclables.',
          environmentalImpact: 'Litter wash-off into river system; microplastic and aquatic toxicity danger.',
          featuresDetected: ['Heterogeneous municipal waste clutter', 'High visual entropy', 'Multiple material signatures'],
        },
        assignedWorker: worker3._id,
        assignedWorkerName: worker3.name,
        assignedWorkerPhone: worker3.phone,
        assignedAt: new Date(Date.now() - 3600000 * 20),
        resolvedAt: new Date(Date.now() - 3600000 * 6),
        timeline: [
          {
            status: 'Submitted',
            changedBy: citizen2._id,
            changedByName: citizen2.name,
            role: 'citizen',
            note: 'Complaint submitted by citizen.',
            timestamp: new Date(Date.now() - 3600000 * 24),
          },
          {
            status: 'Assigned',
            changedBy: admin._id,
            changedByName: admin.name,
            role: 'admin',
            note: `Assigned to ${worker3.name}.`,
            timestamp: new Date(Date.now() - 3600000 * 20),
          },
          {
            status: 'In Progress',
            changedBy: worker3._id,
            changedByName: worker3.name,
            role: 'worker',
            note: 'Clearance initiated.',
            timestamp: new Date(Date.now() - 3600000 * 12),
          },
          {
            status: 'Cleaned_Pending_Verification',
            changedBy: worker3._id,
            changedByName: worker3.name,
            role: 'worker',
            note: 'Cleaned photograph submitted.',
            timestamp: new Date(Date.now() - 3600000 * 8),
          },
          {
            status: 'Resolved',
            changedBy: admin._id,
            changedByName: admin.name,
            role: 'admin',
            note: 'Verified and approved by Commissioner Vikram Malhotra. Promenade restored.',
            timestamp: new Date(Date.now() - 3600000 * 6),
          },
        ],
        feedback: {
          rating: 5,
          comment: 'Outstanding response time and very clean result! Thank you SmartBin team.',
          submittedAt: new Date(Date.now() - 3600000 * 4),
        },
        estimatedWeightKg: 65,
      },
      {
        trackingId: 'SB-2026-66230',
        citizen: citizen1._id,
        citizenName: citizen1.name,
        citizenEmail: citizen1.email,
        citizenPhone: citizen1.phone,
        title: 'Toxic Paint Cans & Chemical Solvent Drums Discarded on Vacant Plot',
        description: 'Leaking chemical tins and commercial paint solvent containers emitting pungent fumes. Soil is contaminated.',
        wasteCategory: 'hazardous',
        wasteCategoryName: 'Hazardous & Bio-Medical Waste',
        priority: 'Critical',
        status: 'In Progress',
        recleaningRequested: true,
        rejectionReason: 'Worker only swept surrounding leaves; chemical canisters still uncollected. Re-cleaning with hazardous team required.',
        location: {
          address: 'Plot 44, Industrial Bypass Road',
          landmark: 'Opposite Substation Gate',
          coordinates: { lat: 12.9645, lng: 77.5812 },
          ward: 'Central Downtown & Ward 4',
          city: 'Metropolis',
        },
        beforeImage: {
          url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
          uploadedAt: new Date(Date.now() - 3600000 * 18),
        },
        aiAnalysis: {
          classifiedCategory: 'hazardous',
          confidence: 0.97,
          recyclable: false,
          urgency_level: 'Critical',
          hazardScore: 9,
          disposalRecommendation: 'CRITICAL HAZARD: Dispatch HAZMAT response truck with spill containment kits.',
          environmentalImpact: 'Severe chemical VOC fumes; groundwater table pollution risk from solvent leakage.',
          featuresDetected: ['Chemical drum markings', 'Hazard pigment reflection', 'High volatile compound toxicity'],
        },
        assignedWorker: worker1._id,
        assignedWorkerName: worker1.name,
        assignedWorkerPhone: worker1.phone,
        assignedAt: new Date(Date.now() - 3600000 * 15),
        timeline: [
          {
            status: 'Submitted',
            changedBy: citizen1._id,
            changedByName: citizen1.name,
            role: 'citizen',
            note: 'Critical complaint registered.',
            timestamp: new Date(Date.now() - 3600000 * 18),
          },
          {
            status: 'Assigned',
            changedBy: admin._id,
            changedByName: admin.name,
            role: 'admin',
            note: 'Emergency dispatch to worker1.',
            timestamp: new Date(Date.now() - 3600000 * 15),
          },
          {
            status: 'In Progress',
            changedBy: admin._id,
            changedByName: admin.name,
            role: 'admin',
            note: 'Clearance evidence rejected: Worker only swept surrounding leaves; chemical canisters still uncollected. Re-cleaning with hazardous team required.',
            timestamp: new Date(Date.now() - 3600000 * 2),
          },
        ],
        estimatedWeightKg: 50,
      },
    ];

    await Complaint.insertMany(sampleComplaints);

    console.log('[Seed] Database successfully populated with:');
    console.log(' - 1 Administrator (admin@smartbin.ai / Admin@123)');
    console.log(' - 3 Sanitation Workers (worker.rajesh@smartbin.ai / Worker@123, etc.)');
    console.log(' - 2 Citizens (citizen.ananya@gmail.com / Citizen@123, etc.)');
    console.log(` - ${sampleComplaints.length} Realistic complaints across all lifecycles`);
  } catch (error: any) {
    console.error('[Seed] Error seeding database:', error.message);
  }
};
