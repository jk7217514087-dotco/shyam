import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Complaint, SystemAnalytics, PriorityLevel, ComplaintStatus } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { CategoryBadge, PriorityBadge } from '../components/CategoryBadge.js';
import { MapView } from '../components/MapView.js';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider.js';
import {
  Shield,
  BarChart3,
  Users,
  Layers,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  Eye,
  TrendingUp,
  Leaf,
  Recycle,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'complaints' | 'workers' | 'hotspots'>('analytics');

  // Data states
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [verifyModalTask, setVerifyModalTask] = useState<Complaint | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [assignModalTask, setAssignModalTask] = useState<Complaint | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [priorityModalTask, setPriorityModalTask] = useState<Complaint | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>('Medium');

  const [createWorkerModalOpen, setCreateWorkerModalOpen] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerPassword, setNewWorkerPassword] = useState('Worker@123');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerZone, setNewWorkerZone] = useState('Central Downtown & Ward 4');
  const [creatingWorker, setCreatingWorker] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, complaintsRes, workersRes] = await Promise.all([
        api.getAnalytics(),
        api.getComplaints(),
        api.getWorkers(),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes);
      if (complaintsRes.success) setComplaints(complaintsRes.complaints);
      if (workersRes.success) setWorkers(workersRes.workers);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        c.title.toLowerCase().includes(q) ||
        c.trackingId.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        c.location.address.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Assign worker handler
  const handleAssignWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalTask || !selectedWorkerId) return;
    setAssigning(true);
    try {
      const res = await api.assignWorker(assignModalTask._id, selectedWorkerId);
      if (res.success) {
        setAssignModalTask(null);
        setSelectedWorkerId('');
        loadData();
      }
    } catch (err) {
      console.error('Error assigning worker:', err);
    } finally {
      setAssigning(false);
    }
  };

  // Change priority handler
  const handleUpdatePriority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priorityModalTask) return;
    try {
      const res = await api.updatePriority(priorityModalTask._id, selectedPriority);
      if (res.success) {
        setPriorityModalTask(null);
        loadData();
      }
    } catch (err) {
      console.error('Error updating priority:', err);
    }
  };

  // Verify complaint (Approve or Reject)
  const handleVerify = async (action: 'approve' | 'reject') => {
    if (!verifyModalTask) return;
    setVerifying(true);
    try {
      const res = await api.verifyComplaint(verifyModalTask._id, {
        action,
        notes: verifyNotes,
        rejectionReason: action === 'reject' ? rejectionReason || 'Clearance unsatisfactory' : undefined,
      });
      if (res.success) {
        setVerifyModalTask(null);
        setVerifyNotes('');
        setRejectionReason('');
        loadData();
      }
    } catch (err) {
      console.error('Error verifying complaint:', err);
    } finally {
      setVerifying(false);
    }
  };

  // Create Worker handler
  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingWorker(true);
    setModalMessage(null);
    try {
      const res = await api.createWorker({
        name: newWorkerName,
        email: newWorkerEmail,
        password: newWorkerPassword,
        phone: newWorkerPhone,
        assignedZone: newWorkerZone,
      });
      if (res.success) {
        setCreateWorkerModalOpen(false);
        setNewWorkerName('');
        setNewWorkerEmail('');
        setNewWorkerPhone('');
        loadData();
      } else {
        setModalMessage(res.message || 'Worker creation failed.');
      }
    } catch (err: any) {
      setModalMessage(err.message || 'Network error.');
    } finally {
      setCreatingWorker(false);
    }
  };

  // Toggle worker active state
  const handleToggleWorker = async (workerId: string) => {
    try {
      const res = await api.toggleWorker(workerId);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      console.error('Error toggling worker status:', err);
    }
  };

  // Chart data configs
  const categoryChartData = analytics?.charts?.categoryBreakdown?.map((item) => ({
    name: item.name.split(' ')[0], // Short name
    count: item.count,
  })) || [];

  const statusColors = ['#3b82f6', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e'];
  const statusPieData = analytics?.charts?.statusBreakdown?.map((item) => ({
    name: item.label,
    value: item.count,
  })) || [];
  const totalStatusComplaints = statusPieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-8 mb-6 sm:mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 blur-[110px] pointer-events-none rounded-full" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-extrabold shadow-[0_0_20px_rgba(168,85,247,0.3)] shrink-0">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Municipal Command Center</h1>
                <span className="text-[10px] sm:text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                  Administrative Authority
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1 sm:line-clamp-none">
                City Solid Waste Directorate • Triage, Worker Dispatch, Verification & Hotspots
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setCreateWorkerModalOpen(true)}
              className="flex-1 sm:flex-none text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Worker Account</span>
            </button>
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shrink-0"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Impact Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="p-2 sm:p-0">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold truncate">Citywide Reports</span>
            <span className="text-xl sm:text-2xl font-extrabold text-white">
              {analytics?.metrics?.totalComplaints ?? 0}
            </span>
          </div>
          <div className="p-2 sm:p-0">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold truncate">Awaiting Verification</span>
            <span className="text-xl sm:text-2xl font-extrabold text-amber-400">
              {analytics?.metrics?.pendingVerificationCount ?? 0}
            </span>
          </div>
          <div className="p-2 sm:p-0">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold truncate">Verified Cleaned</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">
              {analytics?.metrics?.resolvedCount ?? 0}
            </span>
          </div>
          <div className="p-2 sm:p-0">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold truncate">Diverted Waste</span>
            <span className="text-xl sm:text-2xl font-extrabold text-teal-300">
              {analytics?.metrics?.impact?.wasteCollectedKg ?? 0} kg
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 sm:mb-8 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>System Analytics & Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'complaints'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Complaints & Verification ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'workers'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Field Workers ({workers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hotspots')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'hotspots'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Spatial Hotspot Map</span>
        </button>
      </div>

      {/* TAB 1: RECHARTS ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Status Pie Chart (Responsive Donut + Legend Chips) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-100">Complaint Status Breakdown</h3>
                  <span className="text-[11px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    {totalStatusComplaints} Total
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Distribution across municipal clearance pipeline</p>
              </div>

              <div className="h-56 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={46}
                      paddingAngle={3}
                    >
                      {statusPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Status Legend Chips (Eliminates text cutoff on mobile) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-4 border-t border-slate-800/80">
                {statusPieData.map((item, index) => {
                  const pct = totalStatusComplaints > 0 ? Math.round((item.value / totalStatusComplaints) * 100) : 0;
                  return (
                    <div key={item.name} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: statusColors[index % statusColors.length] }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-slate-300 truncate" title={item.name}>{item.name}</p>
                        <p className="text-xs font-bold text-slate-100">{item.value} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span></p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Waste Category Bar Chart */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 mb-1">Waste Categories Aggregation</h3>
                <p className="text-xs text-slate-400 mb-4">Volume of reported refuse by material classification</p>
              </div>
              <div className="h-56 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} interval={0} />
                    <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-3 pt-3 border-t border-slate-800/80">
                Sorted across Polymer, Organic, Cardboard, Metal, Glass, and E-Waste streams
              </p>
            </div>
          </div>

          {/* Environmental Impact Statistics */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Municipal Carbon Offsets & Landfill Diversion</span>
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-xl sm:text-2xl font-extrabold text-white">{analytics?.metrics?.impact?.wasteCollectedKg ?? 0} kg</div>
                <span className="text-[11px] sm:text-xs text-emerald-400 font-medium">Refuse Collected</span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-xl sm:text-2xl font-extrabold text-teal-300">{analytics?.metrics?.impact?.carbonOffsetKg ?? 0} kg</div>
                <span className="text-[11px] sm:text-xs text-teal-400 font-medium">CO2 Avoided</span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-xl sm:text-2xl font-extrabold text-cyan-300">{analytics?.metrics?.impact?.landfillDiversionPct ?? 78}%</div>
                <span className="text-[11px] sm:text-xs text-cyan-400 font-medium">Landfill Diversion</span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-xl sm:text-2xl font-extrabold text-purple-300">{analytics?.metrics?.impact?.treesEquivalent ?? 0}</div>
                <span className="text-[11px] sm:text-xs text-purple-400 font-medium">Tree Absorption Eq.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPLAINTS MANAGEMENT TABLE & VERIFICATION */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search complaints, tracking ID, address..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted (New)</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Cleaned_Pending_Verification">Pending Verification</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Table Container: Responsive Desktop Table + Native Mobile Cards */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* 1. Desktop & Tablet Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                    <th className="py-4 px-4">Tracking Code</th>
                    <th className="py-4 px-4">Complaint Title</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Priority</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Assigned Worker</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No complaints match your query.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-800/40 transition">
                        <td className="py-4 px-4 font-mono font-bold text-purple-300">{item.trackingId}</td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-slate-100 line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{item.location.address}</p>
                        </td>
                        <td className="py-4 px-4">
                          <CategoryBadge category={item.wasteCategory} />
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => {
                              setPriorityModalTask(item);
                              setSelectedPriority(item.priority);
                            }}
                            className="hover:scale-105 transition"
                            title="Click to adjust priority"
                          >
                            <PriorityBadge priority={item.priority} />
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={item.status} size="sm" />
                        </td>
                        <td className="py-4 px-4">
                          {item.assignedWorkerName ? (
                            <span className="text-slate-200 font-medium">{item.assignedWorkerName}</span>
                          ) : (
                            <span className="text-slate-500 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          {/* Worker assignment button */}
                          <button
                            onClick={() => {
                              setAssignModalTask(item);
                              setSelectedWorkerId(item.assignedWorker?._id || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] border border-slate-700 transition"
                          >
                            Assign Worker
                          </button>

                          {/* Verification Review Button */}
                          {item.status === 'Cleaned_Pending_Verification' && (
                            <button
                              onClick={() => {
                                setVerifyModalTask(item);
                                setVerifyNotes('');
                                setRejectionReason('');
                              }}
                              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow animate-pulse transition"
                            >
                              Verify Proof
                            </button>
                          )}

                          {item.status === 'Resolved' && (
                            <button
                              onClick={() => setVerifyModalTask(item)}
                              className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30"
                            >
                              View Evidence
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 2. Mobile Responsive Card List (Optimized for Phones & Small Screens) */}
            <div className="block md:hidden divide-y divide-slate-800">
              {filteredComplaints.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No complaints match your query.
                </div>
              ) : (
                filteredComplaints.map((item) => (
                  <div key={item._id} className="p-4 sm:p-5 space-y-3 hover:bg-slate-800/30 transition">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-purple-400 bg-purple-500/15 px-2.5 py-1 rounded-lg border border-purple-500/25">
                        {item.trackingId}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-100 leading-snug">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{item.location.address}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <CategoryBadge category={item.wasteCategory} />
                      <button
                        onClick={() => {
                          setPriorityModalTask(item);
                          setSelectedPriority(item.priority);
                        }}
                        className="hover:scale-105 transition"
                        title="Tap to adjust priority"
                      >
                        <PriorityBadge priority={item.priority} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/50">
                      <span className="text-[11px] text-slate-400">Assigned Crew:</span>
                      {item.assignedWorkerName ? (
                        <span className="text-slate-200 font-semibold flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{item.assignedWorkerName}</span>
                        </span>
                      ) : (
                        <span className="text-amber-400/90 italic text-[11px]">Unassigned</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          setAssignModalTask(item);
                          setSelectedWorkerId(item.assignedWorker?._id || '');
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        <span>{item.assignedWorkerName ? 'Reassign' : 'Assign Worker'}</span>
                      </button>

                      {item.status === 'Cleaned_Pending_Verification' && (
                        <button
                          onClick={() => {
                            setVerifyModalTask(item);
                            setVerifyNotes('');
                            setRejectionReason('');
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition flex items-center justify-center gap-1.5 animate-pulse"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify Proof</span>
                        </button>
                      )}

                      {item.status === 'Resolved' && (
                        <button
                          onClick={() => setVerifyModalTask(item)}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-semibold text-xs border border-emerald-500/30 transition flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Evidence</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WORKERS MANAGEMENT */}
      {activeTab === 'workers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Sanitation Worker Roster</h3>
              <p className="text-xs text-slate-400">Manage field crews, assigned wards, and active task workloads</p>
            </div>
            <button
              onClick={() => setCreateWorkerModalOpen(true)}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Worker Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <div
                key={worker._id}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                      {worker.employeeId || 'SBW-1042'}
                    </span>
                    <button
                      onClick={() => handleToggleWorker(worker._id)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        worker.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {worker.isActive ? 'Active' : 'Deactivated'}
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">{worker.name}</h4>
                  <p className="text-xs text-slate-400 mb-4">{worker.email}</p>

                  <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned Ward:</span>
                      <span className="font-semibold text-slate-200">{worker.assignedZone || 'Central Zone'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <span className="text-slate-200">{worker.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center pt-3 border-t border-slate-800">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Active Tasks</span>
                    <span className="text-lg font-extrabold text-cyan-400">{worker.activeTasks ?? 0}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Resolved Tasks</span>
                    <span className="text-lg font-extrabold text-emerald-400">{worker.resolvedTasks ?? 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HOTSPOTS MAP */}
      {activeTab === 'hotspots' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Recurring Waste Hotspots Map</h3>
            <p className="text-xs text-slate-400">
              Visualizes spatial clusters of dumping spots to optimize future municipal dustbin placement
            </p>
          </div>
          <MapView
            markers={analytics?.hotspots || []}
            height="550px"
          />
        </div>
      )}

      {/* MODAL 1: VERIFICATION REVIEW (APPROVE OR REJECT) */}
      {verifyModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden">
            {/* Pinned Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-900 shrink-0">
              <div className="min-w-0 pr-2">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">Visual Verification Review</h3>
                <p className="text-xs text-slate-400 font-mono truncate">
                  Complaint: <span className="text-purple-400 font-bold">{verifyModalTask.trackingId}</span> • {verifyModalTask.citizenName}
                </p>
              </div>
              <button
                onClick={() => setVerifyModalTask(null)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 shrink-0 transition"
              >
                Close
              </button>
            </div>

            {/* Scrollable Modal Content Body */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
              {/* Before vs After Visual Proof */}
              <div>
                {verifyModalTask.afterImage?.url ? (
                  <BeforeAfterSlider
                    beforeUrl={verifyModalTask.beforeImage.url}
                    afterUrl={verifyModalTask.afterImage.url}
                    beforeLabel="Reported Heap"
                    afterLabel="Clearance Evidence"
                  />
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                    <p className="font-bold text-slate-200 mb-1">Before Cleaning Photograph:</p>
                    <img src={verifyModalTask.beforeImage.url} alt="Before" className="rounded-xl w-full max-h-72 object-cover" />
                  </div>
                )}
              </div>

              {verifyModalTask.afterImage?.notes && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-slate-400 block mb-0.5">Worker Clearance Notes:</span>
                  <p>{verifyModalTask.afterImage.notes}</p>
                </div>
              )}

              {verifyModalTask.status === 'Cleaned_Pending_Verification' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Approval / Rejection Remarks (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    placeholder="Enter verification comments..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Pinned Action Footer: Always Visible on All Screen Sizes */}
            {verifyModalTask.status === 'Cleaned_Pending_Verification' && (
              <div className="p-4 sm:p-5 bg-slate-950/95 border-t border-slate-800 shrink-0 space-y-3">
                {/* Approve Button is Primary and Always Visible */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <button
                    type="button"
                    disabled={verifying}
                    onClick={() => handleVerify('approve')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 text-xs font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.35)] transition disabled:opacity-50 text-center flex items-center justify-center gap-2 order-1 sm:order-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{verifying ? 'Verifying...' : 'Approve & Mark Resolved'}</span>
                  </button>

                  {/* Reject Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 order-2 sm:order-1 flex-1">
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Reason if rejecting clearance..."
                      className="bg-slate-900 border border-rose-500/30 rounded-xl px-3 py-2 text-xs text-rose-300 placeholder-slate-500 focus:outline-none focus:border-rose-500 flex-1 min-w-0"
                    />
                    <button
                      type="button"
                      disabled={verifying}
                      onClick={() => handleVerify('reject')}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition disabled:opacity-50 whitespace-nowrap text-center shrink-0"
                    >
                      Reject Proof
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN WORKER */}
      {assignModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-1">Dispatch Sanitation Worker</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono truncate">{assignModalTask.trackingId} • {assignModalTask.location.address}</p>

            <form onSubmit={handleAssignWorker} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Select Active Worker</label>
                <select
                  required
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- Choose sanitation crew --</option>
                  {workers
                    .filter((w) => w.isActive)
                    .map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name} ({w.assignedZone || 'Zone'}) - Active tasks: {w.activeTasks ?? 0}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalTask(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || !selectedWorkerId}
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs disabled:opacity-50"
                >
                  {assigning ? 'Dispatching...' : 'Dispatch Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADJUST PRIORITY */}
      {priorityModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-1">Adjust Priority</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">{priorityModalTask.trackingId}</p>

            <form onSubmit={handleUpdatePriority} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Set Priority Level</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as PriorityLevel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Critical">Critical Hazard</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPriorityModalTask(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs"
                >
                  Save Priority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE WORKER */}
      {createWorkerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-1">Add New Sanitation Worker</h3>
            <p className="text-xs text-slate-400 mb-4">Creates official municipal sanitation worker credentials</p>

            {modalMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {modalMessage}
              </div>
            )}

            <form onSubmit={handleCreateWorker} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Worker Email *</label>
                <input
                  type="email"
                  required
                  value={newWorkerEmail}
                  onChange={(e) => setNewWorkerEmail(e.target.value)}
                  placeholder="worker.ramesh@smartbin.ai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Initial Password *</label>
                <input
                  type="text"
                  required
                  value={newWorkerPassword}
                  onChange={(e) => setNewWorkerPassword(e.target.value)}
                  placeholder="Worker@123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newWorkerPhone}
                  onChange={(e) => setNewWorkerPhone(e.target.value)}
                  placeholder="+91 98765 43219"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Ward Zone</label>
                <select
                  value={newWorkerZone}
                  onChange={(e) => setNewWorkerZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Central Downtown & Ward 4">Central Downtown & Ward 4</option>
                  <option value="Ward 7 - Innovation Hub">Ward 7 - Innovation Hub</option>
                  <option value="Ward 12 - Riverside Promenade">Ward 12 - Riverside Promenade</option>
                  <option value="North Industrial Zone">North Industrial Zone</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateWorkerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingWorker}
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs disabled:opacity-50"
                >
                  {creatingWorker ? 'Creating...' : 'Create Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
