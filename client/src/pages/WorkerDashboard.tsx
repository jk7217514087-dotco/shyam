import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Complaint, ComplaintStatus } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { CategoryBadge, PriorityBadge } from '../components/CategoryBadge.js';
import { MapView } from '../components/MapView.js';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider.js';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Camera,
  Play,
  Sparkles,
  Layers,
  Phone,
  RefreshCw,
  Eye,
  AlertCircle,
} from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Action modal
  const [selectedTask, setSelectedTask] = useState<Complaint | null>(null);
  const [modalMode, setModalMode] = useState<'progress' | 'complete' | 'inspect' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null);
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchWorkerTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaints();
      if (data.success && data.complaints) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error('Failed to load worker tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerTasks();
  }, []);

  const activeTasks = complaints.filter(
    (c) => ['Assigned', 'In Progress', 'Cleaned_Pending_Verification'].includes(c.status)
  );

  const completedTasks = complaints.filter((c) => c.status === 'Resolved');

  const displayedList = activeTab === 'active' ? activeTasks : completedTasks;

  const handleStartWork = async (task: Complaint) => {
    try {
      const formData = new FormData();
      formData.append('status', 'In Progress');
      formData.append('notes', 'Sanitation worker has arrived on-site and initiated clearance.');
      const res = await api.updateWorkerStatus(task._id, formData);
      if (res.success) {
        fetchWorkerTasks();
      }
    } catch (err) {
      console.error('Error starting task:', err);
    }
  };

  const handleOpenCompleteModal = (task: Complaint) => {
    setSelectedTask(task);
    setModalMode('complete');
    setActionNotes('');
    setAfterImageFile(null);
    setAfterImagePreview(null);
    setActionError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAfterImageFile(file);
      setAfterImagePreview(URL.createObjectURL(file));
      setActionError(null);
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    if (!afterImageFile) {
      setActionError('An after-cleaning photograph is required as evidence.');
      return;
    }

    setSubmittingAction(true);
    setActionError(null);

    try {
      const formData = new FormData();
      formData.append('status', 'Cleaned_Pending_Verification');
      formData.append('afterImage', afterImageFile);
      formData.append(
        'notes',
        actionNotes || 'Clearance completed. Site sanitized and waste loaded into collection vehicle.'
      );

      const res = await api.updateWorkerStatus(selectedTask._id, formData);
      if (res.success) {
        setModalMode(null);
        setSelectedTask(null);
        fetchWorkerTasks();
      } else {
        setActionError(res.message || 'Submission failed.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const mapMarkers = activeTasks.map((c) => ({
    id: c._id,
    title: c.title,
    lat: c.location.coordinates.lat,
    lng: c.location.coordinates.lng,
    status: c.status,
    priority: c.priority,
    category: c.wasteCategory,
    address: c.location.address,
    trackingId: c.trackingId,
    imageUrl: c.beforeImage.url,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-extrabold shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user?.name}</h1>
                <span className="text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                  {user?.employeeId || 'SBW-1042'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user?.department || 'Municipal Rapid Clean Operations'} • {user?.assignedZone || 'Central Zone'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-slate-500 block uppercase font-bold">Active Shift Status</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> On-Duty Field Dispatch
              </span>
            </div>
            <button
              onClick={fetchWorkerTasks}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Refresh Tasks"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Worker Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Active Dispatch</span>
            <span className="text-xl sm:text-2xl font-extrabold text-white">{activeTasks.length}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">In Progress</span>
            <span className="text-xl sm:text-2xl font-extrabold text-cyan-400">
              {complaints.filter((c) => c.status === 'In Progress').length}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Awaiting Verification</span>
            <span className="text-xl sm:text-2xl font-extrabold text-amber-400">
              {complaints.filter((c) => c.status === 'Cleaned_Pending_Verification').length}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Cleaned & Verified</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">{completedTasks.length}</span>
          </div>
        </div>
      </div>

      {/* Interactive Map with Worker Route Points */}
      {activeTasks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Assigned Navigation & Route Map</h3>
              <p className="text-xs text-slate-400">Interactive locations for scheduled field pickups today</p>
            </div>
          </div>
          <MapView
            markers={mapMarkers}
            height="320px"
            center={mapMarkers.length > 0 ? [mapMarkers[0].lat, mapMarkers[0].lng] : [12.9716, 77.5946]}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'active'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active Assigned Tasks ({activeTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'history'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed History ({completedTasks.length})</span>
        </button>
      </div>

      {/* Task Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading field dispatch tasks...</div>
      ) : displayedList.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl max-w-md mx-auto">
          <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200 mb-1">Queue is Clear</h3>
          <p className="text-xs text-slate-400">
            {activeTab === 'active'
              ? 'You have no pending assignments right now. Excellent work keeping the streets clean!'
              : 'No resolved clearance records found in history.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedList.map((task) => (
            <div
              key={task._id}
              className={`bg-slate-900/80 border rounded-2xl overflow-hidden shadow-xl flex flex-col transition ${
                task.recleaningRequested
                  ? 'border-rose-500/50 bg-rose-500/5'
                  : task.priority === 'Critical'
                  ? 'border-red-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Task Header with Before Image */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                <img src={task.beforeImage.url} alt={task.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3">
                  <StatusBadge status={task.status} size="sm" />
                </div>
                <div className="absolute top-3 right-3">
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-cyan-400 border border-slate-700">
                  {task.trackingId}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-2">
                  <CategoryBadge category={task.wasteCategory} />
                </div>

                <h3 className="font-bold text-sm text-slate-100 mb-1 line-clamp-1">{task.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-1">{task.description}</p>

                {/* Re-cleaning alert if rejected by admin */}
                {task.recleaningRequested && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    <span className="font-bold flex items-center gap-1 mb-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Re-cleaning Requested by Admin:
                    </span>
                    <p className="text-[11px]">{task.rejectionReason}</p>
                  </div>
                )}

                <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800 pt-3 mb-4">
                  <div className="flex items-start gap-1.5 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 font-medium text-slate-300">{task.location.address}</span>
                  </div>
                  {task.location.landmark && (
                    <div className="text-[11px] text-slate-500 pl-5">
                      Landmark: {task.location.landmark}
                    </div>
                  )}
                </div>

                {/* Task Actions */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  {task.status === 'Assigned' && (
                    <button
                      onClick={() => handleStartWork(task)}
                      className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Travel / Mark In Progress</span>
                    </button>
                  )}

                  {(task.status === 'In Progress' || task.recleaningRequested) && (
                    <button
                      onClick={() => handleOpenCompleteModal(task)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload After-Photo & Submit</span>
                    </button>
                  )}

                  {task.status === 'Cleaned_Pending_Verification' && (
                    <div className="text-center py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs font-semibold">
                      <span>Evidence submitted. Awaiting admin review.</span>
                    </div>
                  )}

                  {task.status === 'Resolved' && task.afterImage?.url && (
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setModalMode('inspect');
                      }}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Inspect Before & After Evidence</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBMISSION MODAL: UPLOAD AFTER PHOTOGRAPH */}
      {modalMode === 'complete' && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">Submit Clearance Proof</h3>
            <p className="text-xs text-slate-400 mb-6">
              Tracking Code: <span className="text-cyan-400 font-mono font-bold">{selectedTask.trackingId}</span>
            </p>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  After-Cleaning Photograph (Proof of Clearance) *
                </label>
                {!afterImagePreview ? (
                  <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950 transition">
                    <Camera className="w-8 h-8 text-slate-500 mb-2" />
                    <span className="text-xs font-bold text-slate-200">Tap to upload cleaned street photo</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Clear picture showing collected and sanitized area</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                    <img src={afterImagePreview} alt="After Preview" className="w-full h-full object-cover" />
                    <label className="absolute bottom-2 right-2 bg-slate-900/90 text-white text-xs px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer shadow">
                      Replace
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Sanitation Notes</label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="e.g. Cleared 45kg solid debris into Truck 12. Sidewalk washed and bleached."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 text-xs font-bold shadow transition disabled:opacity-50 text-center"
                >
                  {submittingAction ? 'Submitting Proof...' : 'Submit Evidence for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT MODAL (FOR COMPLETED HISTORY) */}
      {modalMode === 'inspect' && selectedTask && selectedTask.afterImage?.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Verified Transformation</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedTask.trackingId}</p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg"
              >
                Close
              </button>
            </div>

            <BeforeAfterSlider
              beforeUrl={selectedTask.beforeImage.url}
              afterUrl={selectedTask.afterImage.url}
              beforeLabel="Reported Heap"
              afterLabel="Sanitized Result"
            />
          </div>
        </div>
      )}
    </div>
  );
};
