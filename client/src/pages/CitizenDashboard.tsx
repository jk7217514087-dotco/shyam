import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Complaint, ComplaintStatus, WasteCategory } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { CategoryBadge, PriorityBadge } from '../components/CategoryBadge.js';
import { MapView } from '../components/MapView.js';
import {
  PlusCircle,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  Star,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(false);

  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackTargetId, setFeedbackTargetId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const fetchCitizenComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaints();
      if (data.success && data.complaints) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error('Failed to fetch citizen complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizenComplaints();
  }, []);

  // Compute exact live statistics from database records for this citizen
  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;
  const inProgressComplaints = complaints.filter(
    (c) => c.status === 'Assigned' || c.status === 'In Progress' || c.status === 'Cleaned_Pending_Verification'
  ).length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved').length;

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && c.wasteCategory !== categoryFilter) return false;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const match =
        c.title.toLowerCase().includes(query) ||
        c.trackingId.toLowerCase().includes(query) ||
        c.location.address.toLowerCase().includes(query);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenFeedback = (id: string) => {
    setFeedbackTargetId(id);
    setRating(5);
    setFeedbackComment('');
    setFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTargetId) return;
    setFeedbackSubmitting(true);
    try {
      const res = await api.submitFeedback(feedbackTargetId, {
        rating,
        comment: feedbackComment,
      });
      if (res.success) {
        setFeedbackModalOpen(false);
        fetchCitizenComplaints();
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const mapMarkers = complaints.map((c) => ({
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
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Citizen Portal</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Welcome, {user?.name || 'Citizen'}</h1>
          <p className="text-slate-400 text-xs mt-1">
            Track and oversee your submitted waste reports, field dispatch timelines, and verified clearances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMap(!showMap)}
            className="text-xs px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold transition"
          >
            {showMap ? 'Hide My Report Map' : 'View My Reports on Map'}
          </button>

          <Link
            to="/report"
            className="text-xs px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report New Garbage</span>
          </Link>
        </div>
      </div>

      {/* 4 LIVE DATABASE METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Submitted</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalComplaints}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Lifetime reports from your account</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{pendingComplaints}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Awaiting worker scheduling</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">In Progress / Cleaning</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">{inProgressComplaints}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Dispatched to field teams</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Cleaned & Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{resolvedComplaints}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">100% verified clearance</span>
        </div>
      </div>

      {/* Optional Map View */}
      {showMap && complaints.length > 0 && (
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Your Geo-Reported Locations</h3>
          </div>
          <MapView
            markers={mapMarkers}
            height="340px"
            onMarkerClick={(id) => navigate(`/track?id=${id}`)}
          />
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, tracking ID, address..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Cleaned_Pending_Verification">Awaiting Verification</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            <option value="plastic">Plastic & Polymers</option>
            <option value="organic">Organic Waste</option>
            <option value="paper_cardboard">Paper & Cardboard</option>
            <option value="metal">Metal</option>
            <option value="glass">Glass</option>
            <option value="electronic">E-Waste</option>
            <option value="hazardous">Hazardous</option>
            <option value="mixed">Mixed Waste</option>
          </select>

          <button
            onClick={fetchCitizenComplaints}
            title="Refresh"
            className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="sm:hidden">Refresh List</span>
          </button>
        </div>
      </div>

      {/* COMPLAINTS LIST / EMPTY STATE */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">
          Loading your complaint history...
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="py-16 px-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200 mb-1">No Complaints Found</h3>
          <p className="text-xs text-slate-400 mb-6">
            {complaints.length === 0
              ? "You haven't submitted any waste complaints yet. Spot garbage in your neighborhood? Report it right away!"
              : 'No complaints match your current search and filter settings.'}
          </p>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Your First Report</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((item) => (
            <div
              key={item._id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl transition flex flex-col group"
            >
              {/* Image thumbnail header */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                <img
                  src={item.beforeImage.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 border border-slate-700">
                  {item.trackingId}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <CategoryBadge category={item.wasteCategory} />
                  <PriorityBadge priority={item.priority} />
                </div>

                <h3 className="font-bold text-sm text-slate-100 line-clamp-1 mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-1">{item.description}</p>

                <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800 pt-3 mb-4">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="line-clamp-1">{item.location.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <Link
                    to={`/track/${item.trackingId}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Timeline & Details</span>
                  </Link>

                  {item.status === 'Resolved' && !item.feedback && (
                    <button
                      onClick={() => handleOpenFeedback(item._id)}
                      className="py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Rate</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Citizen Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-100 mb-2">Rate Sanitation Clearance Quality</h3>
            <p className="text-xs text-slate-400 mb-4">
              Your feedback ensures municipal contractors and field workers maintain high cleanliness standards.
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Cleanliness Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-lg transition ${
                        rating >= star ? 'text-amber-400 bg-amber-400/10' : 'text-slate-600 bg-slate-800'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${rating >= star ? 'fill-amber-400' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Remarks / Comments (Optional)</label>
                <textarea
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="e.g. Cleared thoroughly, sidewalk is spotless! Thank you."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
                >
                  {feedbackSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
