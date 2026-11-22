# SmartBin AI — AI-Powered Smart Waste Management System

> **"Report Smartly. Collect Efficiently. Keep Cities Clean."**

SmartBin AI is an end-to-end civic technology platform connecting **citizens**, **sanitation workers**, and **municipal administrators** to streamline solid waste reporting, dispatch optimization, and verified photographic clearance.

---

## 🌟 Key Features

### 👤 Citizen Experience
- **Geo-Tagged Complaint Reporting:** Snap a garbage photo with automatic browser geolocation or manual map pin placement on Leaflet / OpenStreetMap.
- **AI Material Classification:** Instant computer vision categorizes waste into Polymers, Organic, Cardboard, Metal, Glass, E-Waste, Hazardous, or Mixed refuse with recyclability ratings.
- **Personalized Citizen Dashboard:** Real-time metrics computed directly from database records, complaint status tags, and interactive map of personal reports.
- **Public Complaint Tracking:** Track any complaint lifecycle via unique tracking code (`SB-2026-XXXXX`) without mandatory login.
- **Service Rating & Feedback:** 5-star rating system with comments for verified cleanups.

### 👷 Sanitation Worker Experience
- **Assigned Field Task Queue:** Real-time visibility into scheduled waste clearance jobs with priority indicators (*Low*, *Medium*, *High*, *Critical*).
- **Navigation & Route Mapping:** Leaflet-powered route overview showing geo-coordinates of assigned spots.
- **Status Workflow Updates:** One-tap transition to `In Progress` upon arriving on site.
- **Visual Clearance Evidence Upload:** Upload timestamped after-cleaning photographs with clearance notes.
- **Completed Work History:** Access past resolved clearance records and performance counts.

### 👑 Municipal Administrator Console
- **System Analytics with Recharts:** Live metrics for total complaints, resolution efficiency (%), kg of waste diverted, and CO2 emissions avoided.
- **Visual Verification Suite:** Interactive split-slider and side-by-side **Before vs After** photograph review.
- **Accountability Actions:** One-click approval (`Resolved`) or rejection with specific re-cleaning instructions sent back to the worker.
- **Sanitation Worker Management:** Create new worker credentials, assign municipal ward zones, and toggle active status.
- **Spatial Hotspot Map:** Interactive heatmap identifying high-frequency illegal dumping spots for municipal dustbin planning.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router, Lucide React, Recharts, Leaflet & React Leaflet |
| **Backend** | Node.js, Express.js, TypeScript, REST API Architecture, Mongoose (with Turnkey Zero-Config In-Memory Fallback) |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt password hashing, Strict Role-Based Access Control (RBAC) |
| **AI / Machine Vision** | Python 3, FastAPI, Uvicorn, Pillow (PIL), NumPy, Multi-Spectral Feature Extraction |
| **Testing** | Vitest, React Testing Library, Supertest (Frontend & Backend Test Suites) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on v24.18)
- **Python** 3.10+ (tested on v3.14)

### 2. Running the AI Microservice (FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
python app/main.py
# AI microservice will start on http://localhost:8000
```

### 3. Running the Backend Server (Express + TypeScript)
```bash
cd server
npm install
npm run dev
# Server will start on http://localhost:5000
# Zero-config mode: Automatically initializes seed data in memory if MongoDB is not present!
```

### 4. Running the Frontend Client (React + Vite)
```bash
cd client
npm install
npm run dev
# Client will be live on http://localhost:3000
```

---

## 🔑 Hackathon Demo Accounts (1-Click Login)

The application includes seeded demonstration accounts ready for evaluation:

| Role | Name | Email | Password | Access Path |
| :--- | :--- | :--- | :--- | :--- |
| **Municipal Admin** | Commissioner Vikram Malhotra | `admin@smartbin.ai` | `Admin@123` | `/admin` |
| **Sanitation Worker** | Rajesh Kumar | `worker.rajesh@smartbin.ai` | `Worker@123` | `/worker` |
| **Active Citizen** | Ananya Deshmukh | `citizen.ananya@gmail.com` | `Citizen@123` | `/citizen` |

*Note: Quick-login buttons are also provided directly on the Navbar and Login page for effortless 1-click evaluation.*

---

## 🧪 Running Automated Tests

### Frontend Tests (Vitest + React Testing Library)
```bash
cd client
npm test
```
*Validates StatusBadge, CategoryBadge, PriorityBadge, BeforeAfterSlider, and TimelineView components.*

### Backend Tests (Vitest + Supertest)
```bash
cd server
npm test
```
*Validates health routes, authentication, strict role permissions, public tracking lookups, and real analytics calculations.*

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Endpoint / Capability | Citizen | Sanitation Worker | Municipal Admin |
| :--- | :---: | :---: | :---: |
| Submit Garbage Complaint | ✅ | ❌ | ✅ |
| View Own Complaints | ✅ | ❌ | ❌ |
| View Assigned Tasks | ❌ | ✅ | ❌ |
| Update Status & Upload After-Photo | ❌ | ✅ | ❌ |
| Assign Worker to Complaint | ❌ | ❌ | ✅ |
| Change Complaint Priority | ❌ | ❌ | ✅ |
| Approve / Reject (Request Re-Clean) | ❌ | ❌ | ✅ |
| Create Sanitation Worker Accounts | ❌ | ❌ | ✅ |
| View System Analytics Dashboard | ❌ | ❌ | ✅ |
