# Amazon Location Service - Enterprise Field Service Management System

An enterprise-grade, production-ready Field Service Management platform built around **Amazon Location Service**, **AWS Lambda (Python 3.13)**, **Amazon DynamoDB**, **Amazon API Gateway**, **Amazon Bedrock AI**, and **Amazon SNS**.

Featuring **3 independent role-based portals** (Customer, Manager/Admin, Field Technician) with separate dedicated dashboard pages, a 7-stage workflow engine, animated radar location tracking, geofence monitoring, and offline PWA capabilities.

---

## 🌟 Key Platform Features & Modules

### 1. 👤 Customer Portal (`index.html` Portal & `customer-dashboard.html`)
- **Independent Login & Registration**: Role-isolated authentication with session management and RBAC guards.
- **Service Request Creation**: Input category, issue description, site GPS coordinates (`lat`, `lng`), address, remarks, and preferred visit time.
- **Visual Workflow Stepper**: Monitor job progression in real-time (`Requested` ➔ `Assigned` ➔ `Accepted` ➔ `Travelling` ➔ `Arrived` ➔ `Working` ➔ `Completed`).
- **Interactive Action Hub**:
  - 👁️ **View**: Comprehensive modal with technician profile, experience, rating, live ETA, and manager remarks.
  - 💬 **Chat**: Real-time customer-technician in-app messaging drawer.
  - 📞 **Call**: Direct quick-dial trigger to assigned technician.
- **Live Location Tracking**: View assigned technician positions on **Amazon Location Map** with animated radar pulse rings.
- **Amazon Bedrock AI Assistant**: Instant service FAQs, complaint resolution, and booking guidance.
- **Ratings & Reviews**: Submit star ratings upon job completion.

### 2. 👨‍💼 Manager / Admin Portal (`manager-dashboard.html`)
- **Master Request Queue**: Overview pending, assigned, and completed jobs across Mumbai (`ap-south-1`).
- **Smart Technician Dispatch**: Modal-based dispatching to assign or reassign field technicians to pending requests.
- **Analytics & Fleet Performance**: Visual metrics showing total dispatches, active jobs, completed services, and operational health.
- **Live Location & Geofencing**: Monitor technician device positions and geofence alerts on **Amazon Location Tracker**.
- **Amazon Bedrock AI Assistant**: Dispatch optimization suggestions, workload balancing, and pending job summaries.

### 3. 🛠️ Technician Field Portal (`technician-dashboard.html`)
- **Assigned Jobs Workspace**: Accept or reject new dispatches with instant status callbacks.
- **Journey & Location Updates**: Transition jobs through workflow stages (`Accepted` ➔ `Travelling` ➔ `Arrived` ➔ `Working` ➔ `Completed`).
- **Live GPS Streaming & Route Simulator**: Stream live device position updates directly to **Amazon Location Tracker** and simulate en-route navigation.
- **Amazon Bedrock AI Assistant**: Repair recommendations, safety guidelines, and troubleshooting steps.
- **Offline PWA Support**: Service Worker (`service-worker.js`) with network-first caching strategy (`aws-fsm-pwa-v3`) and Web Manifest (`manifest.json`) for low-connectivity field zones.

---

## 📐 Flowcharts Documentation

Detailed Mermaid flowcharts for all three roles can be found in [FLOWCHARTS.md](FLOWCHARTS.md):
- Customer Request, Actions & Tracking Flowchart
- Manager Review & Dispatch Flowchart
- Technician Journey & Completion Flowchart
- Integrated System Lifecycle Sequence diagram

---

## 🏗️ Architecture & AWS Integration

```
┌──────────────────────────────────────────────────────────────────────────┐
│              Role-Based Web Portals & Offline PWA Suite                  │
│       (Customer Portal | Manager Dashboard | Technician Workspace)       │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
                        ┌──────────────────────────┐
                        │   Amazon API Gateway     │
                        └────────────┬─────────────┘
                                     │
                                     ▼
                        ┌──────────────────────────┐
                        │        AWS Lambda        │
                        │      (Python 3.13)       │
                        └──────┬────────────┬──────┘
                               │            │
         ┌─────────────┬───────┴──┐      ┌──┴─────────────────────────┐
         ▼             ▼          ▼      ▼                            ▼
┌────────────────┐ ┌──────────┐ ┌───────────────────┐ ┌────────────────────────┐
│ DynamoDB Table │ │   SNS    │ │ Location Tracker  │ │ Amazon Bedrock Runtime │
│ (Technicians)  │ │ (Alerts) │ │ & Map Resources   │ │ (Claude 3 / Titan AI)  │
└────────────────┘ └──────────┘ └───────────────────┘ └────────────────────────┘
```

- **Amazon API Gateway**: HTTP API routing CRUD operations, SNS notifications, and Bedrock AI requests.
- **AWS Lambda**: Extended Python 3.13 backend handling DynamoDB persistence, Location Tracker updates, SNS SMS alerts, and Bedrock AI dispatch assistance.
- **Amazon DynamoDB**: `Technicians` table storing technician state and coordinates.
- **Amazon Location Service**: Map resources and Device Tracker for real-time tracking in Mumbai (`ap-south-1`).
- **Amazon Bedrock**: Generative AI assistance across Customer, Manager, and Technician portals.
- **Amazon SNS**: Instant Push / SMS notification delivery on workflow status changes.

---

## 📁 Repository File Structure

```text
.
├── index.html                  # Main Auth Portal (Customer, Manager & Technician Login & Registration)
├── customer-dashboard.html     # Customer Dashboard & Service Tracking Workspace
├── manager-dashboard.html      # Manager Console, Analytics & Dispatch Center
├── technician-dashboard.html   # Field Technician Task Execution Workspace
├── app.js                      # Full-Stack Controller (RBAC Route Guard, Modals, Map, Stepper & AI)
├── lambda_function.py          # Python 3.13 Lambda Backend Function (Location Tracker, SNS & Bedrock AI)
├── service-worker.js           # Progressive Web App (PWA) Network-First Caching Engine (v3)
├── manifest.json               # Web App Manifest for Mobile Installation
├── css/                        # Modular CSS Architecture
│   ├── theme.css               # Main CSS bundle importer
│   ├── variables.css           # Color palette, spacing & glassmorphism variables
│   ├── base.css                # Typography & global reseters
│   ├── layout.css              # Page containers & grid systems
│   ├── login.css               # Modern Auth Portal glassmorphism styles
│   ├── sidebar.css             # Enterprise navigation sidebar
│   ├── header.css              # Dashboard headers & user badges
│   ├── dashboard.css            # Metric cards & overview widgets
│   ├── cards.css                # Component card containers
│   ├── tables.css               # Data tables & status badges
│   ├── buttons.css              # Glassmorphic & action buttons
│   ├── forms.css                # Input controls & modal forms
│   ├── map.css                  # Amazon Location map view & radar overlay
│   ├── chat.css                 # Real-time drawer chat UI
│   ├── animations.css           # Keyframe transitions & glowing effects
│   ├── utilities.css            # Helper classes
│   └── responsive.css           # Mobile & tablet breakpoint rules
├── FLOWCHARTS.md               # Mermaid Flowcharts for Customer, Manager, and Tech Roles
├── LICENSE                     # MIT License
└── README.md                   # Master Project Documentation
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
