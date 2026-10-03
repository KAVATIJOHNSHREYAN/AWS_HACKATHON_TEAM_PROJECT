# Amazon Location Service - Enterprise Field Service Management System

An enterprise-grade, production-ready Field Service Management platform built around **Amazon Location Service**, **AWS Lambda (Python 3.13)**, **Amazon DynamoDB**, **Amazon API Gateway**, **Amazon Bedrock AI**, and **Amazon SNS**.

Featuring **3 independent role-based portals** (Customer, Manager/Admin, Field Technician), a 7-stage workflow engine, animated radar location tracking, geofence monitoring, and offline PWA capabilities.

---

## 🌟 Key Platform Features & Modules

### 1. 👤 Customer Portal (`Customer Login & Registration`)
- **Service Creation**: Input category, issue description, site GPS coordinates (`lat`, `lng`), address, remarks, and preferred visit time.
- **Visual Workflow Stepper**: Monitor job progression in real-time (`Requested` ➔ `Assigned` ➔ `Accepted` ➔ `Travelling` ➔ `Arrived` ➔ `Working` ➔ `Completed`).
- **Live Location Tracking**: View assigned technician positions on **Amazon Location Map** with animated radar pulse rings.
- **Bedrock AI Assistant**: Instant service FAQs, complaint resolution, and booking guidance.
- **Ratings & Reviews**: Submit star ratings upon job completion.

### 2. 👨‍💼 Manager / Admin Portal (`Manager Console Login`)
- **Master Request Queue**: Overview pending, assigned, and completed jobs across Mumbai (`ap-south-1`).
- **Smart Technician Dispatch**: Assign or reassign field technicians to pending jobs.
- **Live Location & Geofencing**: Monitor technician device positions and geofence alerts on **Amazon Location Tracker**.
- **Bedrock AI Assistant**: Dispatch optimization suggestions and pending job summaries.

### 3. 🛠️ Technician Field Portal (`Field Technician Login`)
- **Assigned Jobs Workspace**: Accept or reject new dispatches.
- **Journey & Location Updates**: Transition jobs through workflow stages.
- **Live GPS Streaming & Route Simulator**: Stream live device position updates directly to **Amazon Location Tracker** and simulate en-route navigation.
- **Bedrock AI Assistant**: Repair recommendations, safety guidelines, and troubleshooting steps.
- **Offline PWA Support**: Service Worker (`service-worker.js`) and Web Manifest (`manifest.json`) allow field techs to view jobs in low-connectivity zones.

---

## 📐 Flowcharts Documentation

Detailed Mermaid flowcharts for all three roles can be found in [FLOWCHARTS.md](FLOWCHARTS.md):
- Customer Request & Tracking Flowchart
- Manager Review & Dispatch Flowchart
- Technician Journey & Completion Flowchart
- Integrated System Lifecycle Sequence Diagram

---

## 🏗️ Architecture & AWS Resources Reused

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      Role-Based Web Portals & PWA                        │
│          (Customer Login | Manager Login | Tech Field Workspace)         │
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
- **Amazon Bedrock**: Generative AI assistance for Customer, Manager, and Technician portals.
- **Amazon SNS**: Instant Push / SMS notification delivery on workflow status changes.

---

## 📁 Repository File Structure

```text
.
├── index.html          # HTML Single-Page Application (3 Role Portals & Dashboards)
├── style.css           # Glassmorphism + Bootstrap 5 + AWS Dark Blue Gradient Stylesheet
├── app.js              # Full-Stack Controller (RBAC Session Guard, Map, Stepper & Bedrock AI)
├── lambda_function.py  # Python 3.13 Lambda Backend Function (Location Tracker, SNS & Bedrock AI)
├── service-worker.js   # Progressive Web App (PWA) Offline Caching Engine
├── manifest.json       # Web App Manifest for Mobile Installation
├── FLOWCHARTS.md       # Mermaid Flowcharts for Customer, Manager, and Tech Roles
├── LICENSE             # MIT License
└── README.md           # Master Project Documentation
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
