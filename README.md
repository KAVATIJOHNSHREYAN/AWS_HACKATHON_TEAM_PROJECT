# Amazon Location Service - Field Service Management System

A production-style AWS Field Service Management application demonstrating real-time technician location tracking, geofence monitoring, dashboard analytics, and nearest technician dispatching using **Amazon Location Service**, **AWS Lambda (Python 3.13)**, **Amazon DynamoDB**, and **Amazon API Gateway**.

---

## 🌟 Key Features

1. **Real-Time Amazon Location Tracker Integration**:
   - `POST` / `PUT` technician API requests automatically stream device coordinate updates to **Amazon Location Service Tracker**.
2. **Interactive Live Map**:
   - Visualizes technicians with status color codes:
     - 🟢 **Green**: Available
     - 🟠 **Orange**: Busy
     - 🔴 **Red**: Offline
3. **Geofence Monitoring & Region Alerts**:
   - Automated detection and real-time dashboard banner warnings if a technician exits the designated service boundary.
4. **Nearest Technician Search**:
   - Calculates distance via Haversine algorithm & API query based on customer coordinates (`lat`, `lng`) to dispatch the nearest available technician.
5. **Dashboard Analytics**:
   - Status distribution charts, active job counts, and recent location activity feeds.
6. **Glassmorphism Web UI**:
   - Built with Vanilla HTML, CSS (Glassmorphism + AWS theme tokens), JavaScript, Leaflet, and Chart.js.

---

## 🏗️ Architecture & AWS Resources Reused

```
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────┐
│  Web Frontend   │ ────> │  Amazon API Gateway  │ ────> │    AWS Lambda    │
│  Amplify / S3   │ <──── │      (HTTP API)      │ <──── │   (Python 3.13)  │
└─────────────────┘       └──────────────────────┘       └────────┬─────────┘
                                                                  │
                                            ┌─────────────────────┴─────────────────────┐
                                            ▼                                           ▼
                                ┌───────────────────────┐                  ┌─────────────────────────┐
                                │   Amazon DynamoDB     │                  │ Amazon Location Service │
                                │ (Technicians Table)   │                  │ (Tracker & Map Service) │
                                └───────────────────────┘                  └─────────────────────────┘
```

- **Amazon API Gateway**: HTTP API routing CRUD operations and search queries.
- **AWS Lambda**: Extended Python 3.13 backend handling DynamoDB persistence and Location Tracker updates.
- **Amazon DynamoDB**: `Technicians` table storing technician state and coordinates.
- **Amazon Location Service**: Map resources and Device Tracker.

---

## 📁 Repository Structure

```text
.
├── index.html          # Frontend Single-Page Application
├── style.css           # Glassmorphism & AWS Design System Stylesheet
├── app.js              # Full-stack Client Controller, Map Rendering & Analytics
├── lambda_function.py  # Python 3.13 Lambda Backend Function
├── LICENSE             # MIT License
└── README.md           # Project Documentation
```

---

## 🚀 Setup & Deployment

1. **Lambda Function Update**:
   - Deploy `lambda_function.py` to your existing AWS Lambda instance.
   - Attach `geo:BatchUpdateDevicePosition` permission to the Lambda execution role.

2. **Frontend Configuration**:
   - Update `API_BASE_URL` in `app.js` with your API Gateway invoke endpoint.

3. **Deploy Web Application**:
   - Host `index.html`, `style.css`, and `app.js` on **AWS Amplify Hosting** or **Amazon S3 Static Website Hosting**.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
