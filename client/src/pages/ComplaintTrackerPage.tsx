import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Complaint } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { CategoryBadge, PriorityBadge } from '../components/CategoryBadge.js';
import { TimelineView } from '../components/TimelineView.js';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider.js';
import { MapView } from '../components/MapView.js';
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  Truck,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Star,
  ArrowRight,
} from 'lucide-react';

export const ComplaintTrackerPage: React.FC = () => {
  const { trackingId: routeTrackingId } = useParams<{ trackingId?: string }>();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');

  const [inputCode, setInputCode] = useState(routeTrackingId || 'SB-2026-44102');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaint = async (code: string) => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getComplaintByTrackingId(code);
      if (res.success && res.complaint) {
        setComplaint(res.complaint);
      } else {
        setError(`No complaint found with tracking code '${code}'. Check spelling or try a demo ID.`);
        setComplaint(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error tracking complaint.');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeTrackingId) {
      setInputCode(routeTrackingId);
      fetchComplaint(routeTrackingId);
    } else if (queryId) {
      api.getComplaintById(queryId).then((res) => {
        if (res.success && res.complaint) {
          setComplaint(res.complaint);
          setInputCode(res.complaint.trackingId);
        }
      });
    } else {
      // Default initial lookup
      fetchComplaint('SB-2026-44102');
    }
  }, [routeTrackingId, queryId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaint(inputCode.trim());
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
          Public Civic Transparency
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Track Complaint Progress</h1>
        <p className="text-slate-400 text-xs mt-1">
          Enter your unique tracking code to inspect real-time field progress and verified clearance photography.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 max-w-xl mx-auto mb-10 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="e.g. SB-2026-44102"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {/* Demo Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px] text-slate-400">
          <span className="text-slate-500">Try Demo IDs:</span>
          {['SB-2026-10482', 'SB-2026-21840', 'SB-2026-44102', 'SB-2026-55910'].map((demo) => (
            <button
              key={demo}
              type="button"
              onClick={() => {
                setInputCode(demo);
                fetchComplaint(demo);
              }}
              className="font-mono text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20 transition"
            >
              {demo}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="max-w-xl mx-auto mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* COMPLAINT DETAILS VIEW */}
      {complaint && (
        <div className="space-y-8">
          {/* Main Status Header Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                    {complaint.trackingId}
                  </span>
                  <StatusBadge status={complaint.status} size="md" />
                  <PriorityBadge priority={complaint.priority} />
                </div>
                <h2 className="text-2xl font-extrabold text-white">{complaint.title}</h2>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{complaint.location.address} • {complaint.location.ward}</span>
                </p>
              </div>

              <CategoryBadge category={complaint.wasteCategory} />
            </div>

            {/* Lifecycle Timeline */}
            <div className="pt-6">
              <TimelineView timeline={complaint.timeline} currentStatus={complaint.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Visual Evidence Showcase */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Photographic Evidence & Verification</span>
              </h3>

              {complaint.afterImage?.url ? (
                <BeforeAfterSlider
                  beforeUrl={complaint.beforeImage.url}
                  afterUrl={complaint.afterImage.url}
                  beforeLabel="Reported Garbage"
                  afterLabel="Verified Cleaned Area"
                />
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
                    <img src={complaint.beforeImage.url} alt="Reported" className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-slate-900/90 text-rose-300 font-bold text-xs px-2.5 py-1 rounded-md border border-slate-700 shadow">
                      Initial Citizen Report Photograph
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 italic text-center">
                    Clearance in progress. After-cleaning photograph will appear here as soon as field worker submits proof.
                  </p>
                </div>
              )}
            </div>

            {/* AI Analysis & Details */}
            <div className="space-y-6">
              {complaint.aiAnalysis && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" /> AI Vision Analysis
                    </span>
                    <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                      {Math.round(complaint.aiAnalysis.confidence * 100)}% Confidence
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-200">Recommendation: </span>
                    {complaint.aiAnalysis.disposalRecommendation}
                  </p>

                  <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="font-semibold text-slate-300 block mb-0.5">Environmental Assessment:</span>
                    <p>{complaint.aiAnalysis.environmentalImpact}</p>
                  </div>
                </div>
              )}

              {/* Location Pin */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Report Location</span>
                </h3>
                <MapView
                  markers={[
                    {
                      id: complaint._id,
                      title: complaint.title,
                      lat: complaint.location.coordinates.lat,
                      lng: complaint.location.coordinates.lng,
                      status: complaint.status,
                      priority: complaint.priority,
                      category: complaint.wasteCategory,
                      address: complaint.location.address,
                      trackingId: complaint.trackingId,
                    },
                  ]}
                  center={[complaint.location.coordinates.lat, complaint.location.coordinates.lng]}
                  zoom={14}
                  height="220px"
                />
              </div>

              {/* Citizen Feedback if resolved */}
              {complaint.feedback && (
                <div className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Citizen Cleanliness Rating
                    </span>
                    <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                      {[...Array(complaint.feedback.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  {complaint.feedback.comment && (
                    <p className="text-xs text-slate-300 italic">"{complaint.feedback.comment}"</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
