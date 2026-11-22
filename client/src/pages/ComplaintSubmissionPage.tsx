import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { MapView } from '../components/MapView.js';
import { WasteCategory, IAIAnalysis } from '../types/index.js';
import {
  Upload,
  Camera,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
  Leaf,
  Info,
  Search,
} from 'lucide-react';

// Comprehensive Indian PIN Code & Major Zone Coordinates Cache
const KNOWN_PINCODES: Record<string, { lat: number; lng: number; address: string; ward: string }> = {
  // Bengaluru
  '560001': { lat: 12.9716, lng: 77.5946, address: 'MG Road / Shivaji Nagar, Bengaluru, Karnataka 560001', ward: 'Central Downtown & Ward 4' },
  '560004': { lat: 12.9416, lng: 77.5753, address: 'Basavanagudi, Bengaluru, Karnataka 560004', ward: 'South Residential Ward' },
  '560038': { lat: 12.9784, lng: 77.6408, address: '100ft Road, Indiranagar, Bengaluru, Karnataka 560038', ward: 'Ward 7 - Innovation Hub' },
  '560034': { lat: 12.9352, lng: 77.6245, address: 'Koramangala 4th Block, Bengaluru, Karnataka 560034', ward: 'Ward 7 - Innovation Hub' },
  '560025': { lat: 12.9667, lng: 77.6083, address: 'Richmond Town, Bengaluru, Karnataka 560025', ward: 'Central Downtown & Ward 4' },
  '560066': { lat: 12.9698, lng: 77.7499, address: 'Whitefield Main Road, Bengaluru, Karnataka 560066', ward: 'Ward 7 - Innovation Hub' },
  '560058': { lat: 13.0382, lng: 77.4987, address: 'Peenya Industrial Area, Bengaluru, Karnataka 560058', ward: 'North Industrial Zone' },
  '560076': { lat: 12.8988, lng: 77.6025, address: 'Bannerghatta Main Road, Bengaluru, Karnataka 560076', ward: 'South Residential Ward' },
  // National Capitals & Metros
  '110001': { lat: 28.6304, lng: 77.2177, address: 'Connaught Place, Central New Delhi, Delhi 110001', ward: 'Central Downtown & Ward 4' },
  '110006': { lat: 28.6562, lng: 77.2307, address: 'Chandni Chowk, Old Delhi, Delhi 110006', ward: 'Central Downtown & Ward 4' },
  '400001': { lat: 18.9322, lng: 72.8347, address: 'Fort / Nariman Point, South Mumbai, Maharashtra 400001', ward: 'Central Downtown & Ward 4' },
  '400050': { lat: 19.0596, lng: 72.8295, address: 'Bandra West, Mumbai, Maharashtra 400050', ward: 'Ward 12 - Riverside Promenade' },
  '500001': { lat: 17.3850, lng: 78.4867, address: 'Abids, Hyderabad, Telangana 500001', ward: 'Central Downtown & Ward 4' },
  '500081': { lat: 17.4435, lng: 78.3772, address: 'HITEC City, Madhapur, Hyderabad, Telangana 500081', ward: 'Ward 7 - Innovation Hub' },
  '600001': { lat: 13.0878, lng: 80.2785, address: 'George Town, Chennai, Tamil Nadu 600001', ward: 'Central Downtown & Ward 4' },
  '700001': { lat: 22.5726, lng: 88.3639, address: 'BBD Bagh, Central Kolkata, West Bengal 700001', ward: 'Central Downtown & Ward 4' },
  '411001': { lat: 18.5204, lng: 73.8567, address: 'Pune Camp / Station Road, Pune, Maharashtra 411001', ward: 'Central Downtown & Ward 4' },
};

export const ComplaintSubmissionPage: React.FC = () => {
  const navigate = useNavigate();

  // Form states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [wasteCategory, setWasteCategory] = useState<WasteCategory>('plastic');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [ward, setWard] = useState('Central Downtown & Ward 4');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946,
  });

  // PIN / Area Search & Geocoding states
  const [pincodeQuery, setPincodeQuery] = useState('');
  const [pinSearching, setPinSearching] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);

  // AI & submission states
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<IAIAnalysis | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{ trackingId: string; id: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Reverse geocode coordinates to street address
  const reverseGeocode = async (lat: number, lng: number) => {
    setReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const addr = data.address || {};
          const streetParts = [
            addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood,
            addr.city || addr.town || addr.village || addr.county,
            addr.postcode,
          ].filter(Boolean);
          const formatted = streetParts.length > 0 ? streetParts.join(', ') : data.display_name;
          setAddress(formatted);
          if (addr.suburb && !landmark) {
            setLandmark(`Near ${addr.suburb}`);
          }
          setGpsMessage(`📍 Location resolved: ${formatted}`);
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    } finally {
      setReverseGeocoding(false);
    }
  };

  // Find location coordinates & address by PIN code or Area query
  const lookupLocationByPinOrArea = async (queryToSearch?: string) => {
    const raw = (queryToSearch || pincodeQuery).trim();
    if (!raw) {
      setGpsMessage('Please enter a PIN code (e.g. 560001) or Area name to search.');
      return;
    }

    setPinSearching(true);
    setGpsMessage(`Locating "${raw}" on map...`);

    // 1. Instant check in offline cache
    if (KNOWN_PINCODES[raw]) {
      const match = KNOWN_PINCODES[raw];
      setCoordinates({ lat: match.lat, lng: match.lng });
      setAddress(match.address);
      setWard(match.ward);
      setGpsMessage(`✅ Found PIN code ${raw}: ${match.address}`);
      setPinSearching(false);
      return;
    }

    // 2. OpenStreetMap Nominatim geocoding
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(raw)}&limit=1&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          setCoordinates({ lat, lng });
          const detectedAddr = item.display_name || raw;
          setAddress(detectedAddr);
          setGpsMessage(`✅ Located: ${detectedAddr}`);
          setPinSearching(false);
          return;
        }
      }
      setGpsMessage(`Could not find coordinates for "${raw}". Please tap directly on the map to set the pin.`);
    } catch (err) {
      setGpsMessage(`Search temporarily busy. You can click on the map to drop the pin.`);
    } finally {
      setPinSearching(false);
    }
  };

  // Browser Geolocation with IP Fallback & Auto Reverse Geocoding
  const handleDetectGPS = () => {
    setGpsLoading(true);
    setGpsMessage('Detecting your GPS position...');

    const onCoordsAcquired = async (lat: number, lng: number, source: string) => {
      setCoordinates({ lat, lng });
      setGpsMessage(`📡 ${source} acquired (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}). Resolving street address...`);
      await reverseGeocode(lat, lng);
      setGpsLoading(false);
    };

    const tryIpFallback = async () => {
      try {
        setGpsMessage('Hardware GPS not responding. Estimating approximate city area via IP...');
        const ipRes = await fetch('https://ipapi.co/json/');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData && ipData.latitude && ipData.longitude) {
            await onCoordsAcquired(ipData.latitude, ipData.longitude, 'IP Location');
            return;
          }
        }
      } catch (e) {
        console.warn('IP fallback failed:', e);
      }

      // If browser blocks GPS and IP is restricted, set to default central zone gracefully
      setCoordinates({ lat: 12.9716, lng: 77.5946 });
      setAddress('MG Road, Bengaluru, Karnataka 560001');
      setGpsMessage('GPS restricted on browser. Defaulted to Central Ward. Enter your PIN code or click the map to relocate.');
      setGpsLoading(false);
    };

    if (!navigator.geolocation) {
      tryIpFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onCoordsAcquired(pos.coords.latitude, pos.coords.longitude, 'GPS position');
      },
      (err) => {
        console.warn('GPS error, using fallback:', err.message);
        tryIpFallback();
      },
      { timeout: 7000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  };

  // Handle image upload and trigger AI
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        setFormError('Please upload a valid JPG, PNG, or WebP image file.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setFormError('Image size exceeds 10MB limit.');
        return;
      }

      setFormError(null);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      // Trigger AI Classification
      await runAIClassification(file);
    }
  };

  const runAIClassification = async (file: File) => {
    setIsAnalyzingAI(true);
    setAiError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('hint', file.name);

      const response = await api.classifyImage(formData);

      if (response.success && response.data) {
        const data = response.data;
        const analysis: IAIAnalysis = {
          classifiedCategory: data.category || 'mixed',
          confidence: data.confidence || 0.92,
          recyclable: data.recyclable ?? true,
          urgencyLevel: data.urgency_level || 'Medium',
          hazardScore: data.hazard_score || 4,
          disposalRecommendation: data.disposal_recommendation || 'Segregate into dry recyclables.',
          environmentalImpact: data.environmental_impact || 'Moderate landfill accumulation risk.',
          featuresDetected: data.features_detected || ['Multi-material solid waste profile detected'],
        };

        setAiAnalysis(analysis);
        if (analysis.classifiedCategory) {
          setWasteCategory(analysis.classifiedCategory as WasteCategory);
        }

        // Auto-suggest title if blank
        if (!title) {
          setTitle(`Accumulated ${data.display_name || 'Solid Waste'} on Street`);
        }
      }
    } catch (err: any) {
      console.warn('AI analysis request issue:', err);
      setAiError('AI classification took too long. You can manually confirm the category below.');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Submit Complaint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!imageFile && !imagePreview) {
      setFormError('A photograph of the garbage is required.');
      return;
    }

    if (!title || !description || !address) {
      setFormError('Please fill in title, description, and street address.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      }
      formData.append('title', title);
      formData.append('description', description);
      formData.append('wasteCategory', wasteCategory);
      formData.append('latitude', coordinates.lat.toString());
      formData.append('longitude', coordinates.lng.toString());
      formData.append('address', address);
      formData.append('landmark', landmark);
      formData.append('ward', ward);

      if (aiAnalysis) {
        formData.append('aiAnalysis', JSON.stringify(aiAnalysis));
      }

      const res = await api.createComplaint(formData);

      if (res.success && res.complaint) {
        setSubmissionSuccess({
          trackingId: res.trackingId || res.complaint.trackingId,
          id: res.complaint._id,
        });
      } else {
        setFormError(res.message || 'Failed to submit complaint. Check authentication.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Network error while submitting complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success view
  if (submissionSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-2">Complaint Registered Successfully!</h2>
        <p className="text-slate-400 text-sm mb-6">
          Thank you for reporting. Municipal sanitation dispatch has received this geo-tagged record.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Your Tracking ID</div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 select-all mb-4">
            {submissionSuccess.trackingId}
          </div>
          <p className="text-xs text-slate-300 mb-4">
            You can use this tracking ID anytime to follow worker dispatch progress and inspect before/after verification photos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/track/${submissionSuccess.trackingId}`}
              className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs text-center transition"
            >
              Track This Complaint
            </Link>
            <Link
              to="/citizen"
              className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs text-center border border-slate-700 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Citizen Reporting</span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Report Garbage & Solid Waste</h1>
        <p className="text-slate-400 text-xs mt-1">
          Upload a photograph. Our AI classifies the waste material and triggers rapid municipal field dispatch.
        </p>
      </div>

      {formError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN: PHOTOGRAPH & AI SCAN */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>1. Garbage Photograph *</span>
              </h3>

              {!imagePreview ? (
                <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition group">
                  <Upload className="w-10 h-10 text-slate-500 group-hover:text-emerald-400 mb-3 transition-colors" />
                  <span className="text-xs font-bold text-slate-200 mb-1">Click or drag image to upload</span>
                  <span className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP (Max 10MB)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <label className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer shadow flex items-center gap-1.5 transition">
                      <RefreshCw className="w-3.5 h-3.5" /> Replace Photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* AI Classification Widget */}
              {isAnalyzingAI && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-3 animate-pulse">
                  <Cpu className="w-5 h-5 shrink-0 animate-spin" />
                  <div>
                    <p className="font-bold">FastAPI Vision Microservice is analyzing image...</p>
                    <p className="text-[11px] text-emerald-500">Extracting color histograms, edge density, and recyclability index</p>
                  </div>
                </div>
              )}

              {aiAnalysis && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> AI Classification Result
                    </span>
                    <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                      {Math.round(aiAnalysis.confidence * 100)}% Confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Identified Material</span>
                      <span className="font-bold text-slate-200 capitalize">{aiAnalysis.classifiedCategory}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Recyclability</span>
                      <span className="font-bold text-teal-300">
                        {aiAnalysis.recyclable ? '♻️ Recyclable' : '⚠️ Non-Recyclable'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Disposal Recommendation:</span>
                    <p className="text-[11px] mt-0.5 text-slate-300">{aiAnalysis.disposalRecommendation}</p>
                  </div>

                  {aiAnalysis.featuresDetected && aiAnalysis.featuresDetected.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Features Detected:</span>
                      <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-0.5">
                        {aiAnalysis.featuresDetected.slice(0, 3).map((feat, idx) => (
                          <li key={idx}>{feat}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-200">2. Waste Description & Category</h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Complaint Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Plastic bottle accumulation near bus stop"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirmed Waste Category *</label>
                <select
                  value={wasteCategory}
                  onChange={(e) => setWasteCategory(e.target.value as WasteCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="plastic">Plastic & Synthetic Polymers</option>
                  <option value="organic">Organic & Biodegradable Waste</option>
                  <option value="paper_cardboard">Paper & Cardboard Packaging</option>
                  <option value="metal">Metal & Scrap Cans</option>
                  <option value="glass">Glass Bottles & Cullet</option>
                  <option value="electronic">Electronic & E-Waste</option>
                  <option value="hazardous">Hazardous & Bio-Medical Waste</option>
                  <option value="mixed">Mixed Unsegregated Refuse</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the heap size, accessibility, whether drainage is blocked, odor severity..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE GEOLOCATION & MAP */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>3. Location & Map Pin *</span>
                </h3>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={gpsLoading}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{gpsLoading ? 'Detecting GPS...' : 'Auto-Detect GPS Location'}</span>
                </button>
              </div>

              {/* PIN Code / Area Search Box */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200">
                    Find Location by PIN Code or Area
                  </label>
                  <span className="text-[10px] text-emerald-400 font-medium">Auto-drops pin & detects address</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={pincodeQuery}
                      onChange={(e) => setPincodeQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          lookupLocationByPinOrArea();
                        }
                      }}
                      placeholder="Enter PIN (e.g. 560001, 110001) or Area..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={pinSearching}
                    onClick={() => lookupLocationByPinOrArea()}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                  >
                    {pinSearching ? (
                      <span>Locating...</span>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Find Location</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick PIN Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Quick PINs:</span>
                  {[
                    { pin: '560001', name: 'MG Road' },
                    { pin: '560038', name: 'Indiranagar' },
                    { pin: '560034', name: 'Koramangala' },
                    { pin: '110001', name: 'Delhi' },
                    { pin: '400001', name: 'Mumbai' },
                  ].map((p) => (
                    <button
                      key={p.pin}
                      type="button"
                      onClick={() => {
                        setPincodeQuery(p.pin);
                        lookupLocationByPinOrArea(p.pin);
                      }}
                      className="font-mono text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20 transition text-[10px]"
                    >
                      {p.pin} ({p.name})
                    </button>
                  ))}
                </div>
              </div>

              {gpsMessage && (
                <p className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                  {gpsMessage}
                </p>
              )}

              {/* Interactive map for picking location */}
              <div className="space-y-1">
                <p className="text-[11px] text-slate-400 italic">
                  💡 Click or drag the pin anywhere on the map to pinpoint spot — address updates automatically.
                </p>
                <MapView
                  interactivePicker={true}
                  selectedLocation={coordinates}
                  onLocationSelect={(coords) => {
                    setCoordinates(coords);
                    reverseGeocode(coords.lat, coords.lng);
                  }}
                  height="280px"
                  center={[coordinates.lat, coordinates.lng]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    readOnly
                    value={coordinates.lat}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    readOnly
                    value={coordinates.lng}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">Street Address / Area *</label>
                  {reverseGeocoding && (
                    <span className="text-[10px] text-emerald-400 animate-pulse flex items-center gap-1 font-mono">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Detecting street address...
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. MG Road, Near Metro Station Pillar 14"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite City Park Gate"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Municipal Ward</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Central Downtown & Ward 4">Central Downtown & Ward 4</option>
                    <option value="Ward 7 - Innovation Hub">Ward 7 - Innovation Hub</option>
                    <option value="Ward 12 - Riverside Promenade">Ward 12 - Riverside Promenade</option>
                    <option value="North Industrial Zone">North Industrial Zone</option>
                    <option value="South Residential Ward">South Residential Ward</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submission Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting & Dispatching...</span>
              ) : (
                <>
                  <span>Submit Garbage Complaint</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
