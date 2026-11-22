const API_BASE = 'http://localhost:5000/api';

const getAuthHeaders = (isMultipart = false): HeadersInit => {
  const token = localStorage.getItem('smartbin_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getDemoAccounts() {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return res.json();
  },

  async updateProfile(data: { name?: string; phone?: string; avatar?: string }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Complaints
  async getComplaints(params?: Record<string, string>) {
    const query = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE}/complaints?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getComplaintById(id: string) {
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getComplaintByTrackingId(trackingId: string) {
    const res = await fetch(`${API_BASE}/complaints/track/${trackingId}`);
    return res.json();
  },

  async createComplaint(formData: FormData) {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return res.json();
  },

  async updatePriority(id: string, priority: string) {
    const res = await fetch(`${API_BASE}/complaints/${id}/priority`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ priority }),
    });
    return res.json();
  },

  async assignWorker(id: string, workerId: string) {
    const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ workerId }),
    });
    return res.json();
  },

  async updateWorkerStatus(id: string, formData: FormData) {
    const res = await fetch(`${API_BASE}/complaints/${id}/worker-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return res.json();
  },

  async verifyComplaint(id: string, data: { action: 'approve' | 'reject'; notes?: string; rejectionReason?: string }) {
    const res = await fetch(`${API_BASE}/complaints/${id}/verify`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async submitFeedback(id: string, data: { rating: number; comment?: string }) {
    const res = await fetch(`${API_BASE}/complaints/${id}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Workers
  async getWorkers() {
    const res = await fetch(`${API_BASE}/users/workers`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createWorker(data: any) {
    const res = await fetch(`${API_BASE}/users/workers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async toggleWorker(id: string) {
    const res = await fetch(`${API_BASE}/users/workers/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`);
    return res.json();
  },

  // AI Classification
  async classifyImage(formData: FormData) {
    const res = await fetch(`${API_BASE}/ai/classify`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return res.json();
  },
};
