# Amazon Location Service - Field Service Management System

A production-style enterprise Field Service Management platform featuring 3 independent role-based authentication portals (**Customer**, **Manager/Admin**, **Technician**), real-time device tracking via **Amazon Location Service Tracker**, automated job status workflow transitions, and intelligent **Amazon Bedrock AI Assistants**.

---

## 🌟 Key Features & Role Portals

### 1. 👤 Customer Portal (`Customer Login / Registration`)
- **Service Creation**: Input service category, issue description, address, site GPS coordinates, remarks, and preferred visit time.
- **Workflow Tracking**: Monitor status (`Requested` ➔ `Assigned` ➔ `Accepted` ➔ `Travelling` ➔ `Arrived` ➔ `Working` ➔ `Completed`).
- **Live Location Tracking**: View assigned technician positions on **Amazon Location Map**.
- **Bedrock AI Assistant**: Get instant service FAQs, complaint resolution, and booking guidance.
- **Ratings & Reviews**: Submit star ratings upon job completion.

### 2. 👨‍💼 Manager / Admin Portal (`Manager Console Login`)
- **Master Request Queue**: Overview all customer service requests across Mumbai (`ap-south-1`).
- **Smart Technician Dispatch**: Assign or reassign field technicians to pending requests.
- **Live Location & Geofence Monitoring**: Monitor device coordinates and geofence region alerts.
- **Bedrock AI Assistant**: Obtain dispatch optimization and pending job summaries.

### 3. 🛠️ Technician Portal (`Field Technician Login`)
- **Assigned Jobs Workspace**: Accept or reject new dispatches.
- **Status Progression**: Transition jobs through `Travelling`, `Arrived`, `Working`, and `Completed`.
- **Live GPS Streaming**: Stream device position updates directly to **Amazon Location Tracker**.
- **Bedrock AI Assistant**: Query repair suggestions, safety guidelines, and troubleshooting steps.

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
┌─────────────────────────────────────────────────────────┐
│                 Role-Based Web Portals                  │
│       (Customer Login | Manager Login | Tech Login)     │
└────────────────────────────┬────────────────────────────┘
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
         ┌─────────────┴──┐      ┌──┴─────────────────────────┐
         ▼                ▼      ▼                            ▼
┌──────────────────┐  ┌───────────────────────┐  ┌────────────────────────┐
│ Amazon DynamoDB  │  │ Amazon Location Map   │  │ Amazon Bedrock Runtime │
│ (Technicians)    │  │ & Device Tracker      │  │ (Claude 3 / Titan AI)  │
└──────────────────┘  └───────────────────────┘  └────────────────────────┘
```

---

## 📁 Repository File Structure

```text
.
├── index.html          # HTML Interface (3 Role Login Portals & Dashboards)
├── style.css           # Glassmorphism + Bootstrap 5 + AWS Dark Blue Gradient Stylesheet
├── app.js              # Full-Stack Controller (RBAC Session Guard, Map & Bedrock AI)
├── lambda_function.py  # Python 3.13 Lambda Backend Function
├── FLOWCHARTS.md       # Mermaid Flowcharts for Customer, Manager, and Tech Roles
├── LICENSE             # MIT License
└── README.md           # Master Project Documentation
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
