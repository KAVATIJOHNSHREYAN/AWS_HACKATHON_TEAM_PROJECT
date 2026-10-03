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
    
    E --> F[Customer Dashboard]
    F --> G[Create Service Request]
    
    G --> H[Fill Request Details:
    - Service Category
    - Issue Description
    - Site Address & GPS Lat/Lng
    - Preferred Visit Time
    - Contact Details
    - Optional Image Attachment]
    
    H --> I[Submit Request to API Gateway]
    I --> J[Request Status: REQUESTED]
    J --> K[Real-Time Dispatch Notification to Manager]
    
    F --> L[Track Active Job & Live Location]
    L --> M[View Assigned Technician & Live Map Tracker]
    L --> N[In-App Customer-Technician Chat]
    L --> O[Query Amazon Bedrock AI Customer Assistant]
    
    M --> P{Job Completed?}
    P -- No --> L
    P -- Yes --> Q[Receive Job Completion Alert]
    Q --> R[Submit Star Rating & Customer Feedback]
    R --> S[Service History Archived]
```

---

## 2. 👨‍💼 Manager / Admin Workflow Flowchart

```mermaid
flowchart TD
    A[Start: Manager Login] --> B[Manager Master Console]
    B --> C[View Key Performance Metrics & Analytics]
    B --> D[Monitor Master Service Request Queue]
    
    D --> E{Filter Job Status}
    E -- Pending Requests --> F[Select Unassigned Job]
    E -- Active Jobs --> G[Monitor Live Technician Map & Geofence Breaches]
    
    F --> H[Review Customer Issue Details & GPS Coordinates]
    H --> I[Check Technician Skill & Availability Matrix]
    I --> J[Select Optimal Technician & Set Job Priority]
    J --> K[Assign / Reassign Technician via API]
    
    K --> L[Trigger Real-Time Assignment Notification to Tech]
    
    G --> M[Track Device Position via Amazon Location Tracker]
    G --> N[Send In-App Manager Instructions to Tech]
    G --> O[Consult Amazon Bedrock Manager AI for Dispatch Recommendations]
    
    P[Technician Marks Work Completed] --> Q[Receive Automated Completion Notification]
    Q --> R[Archive Job Record & Update Business Performance Metrics]
```

---

## 3. 🛠️ Technician Workflow Flowchart

```mermaid
flowchart TD
    A[Start: Technician Login] --> B[Technician Dedicated Dashboard]
    B --> C[View Assigned Jobs Workspace]
    
    C --> D[Select New Assignment]
    D --> E{Accept or Reject Job?}
    E -- Reject --> F[Notify Manager & Reset Status to REQUESTED]
    E -- Accept --> G[Update Job Status: ACCEPTED]
    
    G --> H[Click 'Start Journey']
    H --> I[Update Job Status: TRAVELLING]
    I --> J[Stream GPS Device Coordinates to Amazon Location Tracker]
    
    J --> K[Navigate to Customer Site using Amazon Location Route]
    K --> L{Reached Customer Site?}
    
    L -- Yes / Geofence Detection --> M[Auto / Manual Status Update: ARRIVED]
    M --> N[Click 'Start Work' -> Status: WORKING]
    
    N --> O[Consult Amazon Bedrock Technician Assistant for Safety & Repair Steps]
    N --> P[In-App Chat with Customer & Manager]
    
    N --> Q[Complete Repair Work]
    Q --> R[Click 'Complete Work' -> Status: COMPLETED]
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
    Manager->>API: 3. Assign Technician
    API-->>Tech: 4. Assignment Push Notification
    Tech->>API: 5. Accept Job & Start Journey
    Tech->>Loc: 6. Stream Live GPS Device Position
    Loc-->>Customer: 7. Live Map Tracking View
    Loc->>Loc: 8. Detect Geofence Entrance (Arrived)
    Tech->>API: 9. Start Repair & Mark Completed
    API-->>Customer: 10. Completion Notification
    Customer->>API: 11. Submit Star Rating & Review
```
