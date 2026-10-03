# Amazon Location Service - Field Service Management System Flowcharts

This document details the operational flowcharts for all three role-based portals: **Customer**, **Manager/Admin**, and **Technician**.

---

## 1. 👤 Customer Workflow Flowchart

```mermaid
flowchart TD
    A[Start: Customer Access Portal] --> B{Have Account?}
    B -- No --> C[Customer Registration Form]
    C --> D[Save Customer Profile]
    D --> E[Customer Login]
    B -- Yes --> E
    
    E --> F[Redirect to customer-dashboard.html]
    F --> G[Create New Service Request]
    
    G --> H[Fill Request Details:
    - Service Category
    - Issue Description
    - Site Address & GPS Lat/Lng
    - Preferred Visit Time
    - Special Instructions]
    
    H --> I[Submit Request to API Gateway]
    I --> J[Request Status: REQUESTED]
    J --> K[Real-Time Dispatch Notification to Manager]
    
    F --> L[Track Active Service Requests]
    L --> M[Visual Workflow Stepper: REQUESTED -> ASSIGNED -> ACCEPTED -> TRAVELLING -> ARRIVED -> WORKING -> COMPLETED]
    
    L --> N{Select Table Action}
    N -- View --> O[Open Technician Detail Modal: Profile, Rating, Experience, ETA, Remarks]
    N -- Chat --> P[Open In-App Live Chat Drawer with Technician]
    N -- Call --> Q[Trigger Direct Quick-Dial Call]
    
    L --> R[Live Location Map Tracker with Animated Radar]
    L --> S[Query Amazon Bedrock AI Customer Assistant]
    
    R --> T{Job Status == COMPLETED?}
    T -- No --> L
    T -- Yes --> U[Receive Completion Notification]
    U --> V[Submit Star Rating & Service Review]
    V --> W[Service Record Archived]
```

---

## 2. 👨‍💼 Manager / Admin Workflow Flowchart

```mermaid
flowchart TD
    A[Start: Manager Login] --> B[Redirect to manager-dashboard.html]
    B --> C[View Operational Metrics & Analytics Charts]
    B --> D[Monitor Master Service Request Queue]
    
    D --> E{Filter Job Status}
    E -- Requested / Unassigned --> F[Click 'Assign' Action Button]
    E -- Active Jobs --> G[Monitor Live Technician Device Map & Radar]
    
    F --> H[Open Dispatch Modal]
    H --> I[Review Issue Details & GPS Site Coordinates]
    I --> J[Select Qualified Technician from Available List]
    J --> K[Confirm Assignment via API Gateway]
    
    K --> L[Update Job Status: ASSIGNED]
    L --> M[Trigger Instant Push Notification to Technician]
    
    G --> N[Track Real-Time Device Position via Amazon Location Tracker]
    G --> O[Monitor Geofence Breaches & Site Arrival]
    G --> P[Consult Amazon Bedrock Manager AI for Smart Dispatch Advice]
    
    Q[Technician Completes Work] --> R[Automated Manager Status Update: COMPLETED]
    R --> S[Update Fleet Performance Analytics]
```

---

## 3. 🛠️ Technician Workflow Flowchart

```mermaid
flowchart TD
    A[Start: Technician Login] --> B[Redirect to technician-dashboard.html]
    B --> C[View Assigned Jobs Workspace]
    
    C --> D[Select New Dispatch Assignment]
    D --> E{Accept or Reject Job?}
    E -- Reject --> F[Notify Manager & Revert Status to REQUESTED]
    E -- Accept --> G[Update Status: ACCEPTED]
    
    G --> H[Click 'Start Journey']
    H --> I[Update Status: TRAVELLING]
    I --> J[Stream Device Coordinates to Amazon Location Tracker]
    
    J --> K[Navigate to Customer Site using Amazon Location Routing]
    K --> L{Site Arrival}
    
    L -- Arrived at Site --> M[Click 'Mark Arrived' -> Status: ARRIVED]
    M --> N[Click 'Start Work' -> Status: WORKING]
    
    N --> O[Consult Amazon Bedrock Technician AI for Repair & Safety Advice]
    N --> P[In-App Chat with Customer]
    
    N --> Q[Complete Maintenance & Repair Work]
    Q --> R[Click 'Complete Job' -> Status: COMPLETED]
    R --> S[Notify Customer & Manager Instantly]
```

---

## 4. 🔄 End-to-End Integrated Job Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    actor Manager
    actor Tech
    participant API as API Gateway / Lambda
    participant Loc as Amazon Location Service

    Customer->>API: 1. Create Service Request (GPS, Issue)
    API-->>Manager: 2. Real-time Request Notification
    Manager->>API: 3. Assign Technician to Request
    API-->>Tech: 4. Assignment Push Notification
    Tech->>API: 5. Accept Job & Start Journey
    Tech->>Loc: 6. Stream Live Device Location
    Loc-->>Customer: 7. Live Map Radar Tracking View
    Customer->>Tech: 8. In-App Chat / View Details / Call
    Tech->>Loc: 9. Arrive at Customer Site & Start Work
    Tech->>API: 10. Mark Job as Completed
    API-->>Customer: 11. Completion Notification
    Customer->>API: 12. Submit Star Rating & Review
```
