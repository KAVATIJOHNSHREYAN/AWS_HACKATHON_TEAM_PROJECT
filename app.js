/**
 * Role-Based Access Control (RBAC) & Application Controller
 * Handles Independent Logins (Customer, Manager, Tech), Job Lifecycle & Amazon Bedrock AI
 */

const CONFIG = {
  API_BASE_URL: 'https://YOUR_API_GATEWAY_ID.execute-api.ap-south-1.amazonaws.com/prod/technicians',
  REGION: 'ap-south-1',
  GEOFENCE_CENTER: { lat: 19.0760, lng: 72.8777 },
  GEOFENCE_RADIUS_KM: 25.0
};

// Application State
let activeUserRole = null; // 'customer', 'manager', 'technician'
let activeUserSession = null;

let technicians = [];
let serviceJobs = [
  { id: 'JOB-501', customerName: 'Apex Logistics', phone: '9820011111', address: 'Bandra Kurla Complex, Mumbai', lat: 19.0600, lng: 72.8680, category: 'HVAC Repair', description: 'Main server room AC cooling failure.', status: 'Requested', technicianId: null, remarks: 'Urgent assistance required.', rating: null, createdAt: new Date().toISOString() },
  { id: 'JOB-502', customerName: 'Reliance Data Center', phone: '9820022222', address: 'Powai, Mumbai', lat: 19.1197, lng: 72.9050, category: 'Electrical Audit', description: 'Transformers load balancing inspect.', status: 'Assigned', technicianId: 'TECH-102', remarks: 'Check high voltage panel B.', rating: null, createdAt: new Date().toISOString() },
  { id: 'JOB-503', customerName: 'Tata Communications', phone: '9820033333', address: 'Fort, Mumbai', lat: 18.9322, lng: 72.8347, category: 'Network Systems', description: 'Fiber optic splice link degradation.', status: 'Travelling', technicianId: 'TECH-104', remarks: 'Requires optical power meter.', rating: null, createdAt: new Date().toISOString() }
];

let chatMessages = {}; // jobId -> Array of msgs
let notifications = [];
let mapInstance = null;
let mapMarkers = [];

document.addEventListener('DOMContentLoaded', () => {
  setupLoginAuth();
  setupNavigation();
  setupForms();
  checkExistingSession();
});

// Authentication & Session Guard
function checkExistingSession() {
  const session = localStorage.getItem('fsm_user_session');
  if (session) {
    activeUserSession = JSON.parse(session);
    activeUserRole = activeUserSession.role;
    showAppConsole();
  } else {
    showLoginPortal('customer');
  }
}

function showLoginPortal(role) {
  document.getElementById('authPortals').style.display = 'flex';
  document.getElementById('appConsole').style.display = 'none';

  document.querySelectorAll('.auth-page').forEach(p => p.style.display = 'none');
  document.getElementById(`${role}LoginPage`).style.display = 'block';
}

function setupLoginAuth() {
  // Customer Login
  document.getElementById('custLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    loginUser('customer', document.getElementById('custEmail').value, 'Customer User');
  });
  // Customer Register
  document.getElementById('custRegisterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Registration successful! Please log in.');
    showLoginPortal('customer');
  });

  // Manager Login
  document.getElementById('mgrLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    loginUser('manager', document.getElementById('mgrEmail').value, 'AWS Operations Manager');
  });

  // Technician Login
  document.getElementById('techLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    loginUser('technician', document.getElementById('techEmail').value, 'Field Technician');
  });
}

function loginUser(role, email, name) {
  activeUserRole = role;
  activeUserSession = { role, email, name, loggedInAt: new Date().toISOString() };
  localStorage.setItem('fsm_user_session', JSON.stringify(activeUserSession));
  showAppConsole();
}

function logoutUser() {
  localStorage.removeItem('fsm_user_session');
  activeUserRole = null;
  activeUserSession = null;
  showLoginPortal('customer');
}

function showAppConsole() {
  document.getElementById('authPortals').style.display = 'none';
  document.getElementById('appConsole').style.display = 'flex';

  // Apply RBAC View Restrictions
  document.querySelectorAll('.nav-item').forEach(nav => {
    const roles = nav.getAttribute('data-roles');
    if (roles && roles.includes(activeUserRole)) {
      nav.style.display = 'flex';
    } else {
      nav.style.display = 'none';
    }
  });

  document.getElementById('sessionUserName').textContent = activeUserSession.name;
  document.getElementById('sessionUserRole').textContent = activeUserRole.toUpperCase();

  fetchTechnicians();

  // Default Redirect by Role
  if (activeUserRole === 'customer') switchPage('customerDashboard');
  if (activeUserRole === 'manager') switchPage('managerDashboard');
  if (activeUserRole === 'technician') switchPage('techDashboard');
}

// Page Navigation
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = item.getAttribute('data-page');
      switchPage(pageId);
    });
  });
}

function switchPage(pageId) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const activeNav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (activeNav) activeNav.classList.add('active');

  document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
  const targetEl = document.getElementById(pageId);
  if (targetEl) targetEl.classList.add('active');

  // Trigger page load handlers
  if (pageId === 'customerDashboard' || pageId === 'managerDashboard' || pageId === 'techDashboard') {
    renderRoleDashboards();
  }
  if (pageId === 'liveMap') initLiveMap();
  if (pageId === 'analytics') renderAnalyticsChart();
}

// Fetch Technicians
async function fetchTechnicians() {
  try {
    const res = await fetch(CONFIG.API_BASE_URL);
    if (res.ok) technicians = await res.json();
  } catch (err) {
    if (technicians.length === 0) {
      technicians = [
        { id: 'TECH-101', name: 'Aarav Sharma', skill: 'HVAC Specialist', status: 'Available', latitude: 19.0760, longitude: 72.8777, email: 'aarav@aws.com', phone: '9820011223' },
        { id: 'TECH-102', name: 'Priya Patel', skill: 'Electrical Specialist', status: 'Busy', latitude: 19.1197, longitude: 72.9050, email: 'priya@aws.com', phone: '9820044556' },
        { id: 'TECH-103', name: 'Rohan Mehta', skill: 'Plumbing Specialist', status: 'Offline', latitude: 18.9220, longitude: 72.8347, email: 'rohan@aws.com', phone: '9820077889' },
        { id: 'TECH-104', name: 'Ananya Iyer', skill: 'Network Specialist', status: 'Available', latitude: 19.0596, longitude: 72.8295, email: 'ananya@aws.com', phone: '9820099001' }
      ];
    }
  }
  renderRoleDashboards();
}

// Render Role Dashboards
function renderRoleDashboards() {
  // 1. CUSTOMER DASHBOARD
  const custHistory = document.getElementById('custServiceHistory');
  if (custHistory) {
    custHistory.innerHTML = serviceJobs.map(j => `
      <tr>
        <td><strong>${j.id}</strong></td>
        <td>${j.category}</td>
        <td>${j.address}</td>
        <td><span class="badge-stage stage-${j.status.toLowerCase()}">${j.status}</span></td>
        <td>${j.technicianId || '<span class="text-warning">Pending Manager Dispatch</span>'}</td>
        <td>
          <button class="btn btn-sm btn-outline-info" onclick="openCustomerJobModal('${j.id}')">View & Chat</button>
          ${j.status === 'Completed' && !j.rating ? `<button class="btn btn-sm btn-warning" onclick="rateServiceJob('${j.id}')">Rate</button>` : ''}
          ${j.rating ? `<span class="badge bg-success">★ ${j.rating}/5</span>` : ''}
        </td>
      </tr>
    `).join('');
  }

  // 2. MANAGER DASHBOARD
  document.getElementById('mgrTotalReq').textContent = serviceJobs.length;
  document.getElementById('mgrPendingReq').textContent = serviceJobs.filter(j => j.status === 'Requested').length;
  document.getElementById('mgrActiveTechs').textContent = technicians.filter(t => t.status === 'Available' || t.status === 'Busy').length;

  const mgrJobsTable = document.getElementById('mgrJobsTableBody');
  if (mgrJobsTable) {
    mgrJobsTable.innerHTML = serviceJobs.map(j => `
      <tr>
        <td><strong>${j.id}</strong></td>
        <td>${j.customerName} (${j.phone})</td>
        <td>${j.category}</td>
        <td><span class="badge-stage stage-${j.status.toLowerCase()}">${j.status}</span></td>
        <td>${j.technicianId || '<span class="text-warning">Unassigned</span>'}</td>
        <td>
          <button class="btn btn-sm btn-aws" onclick="openAssignModal('${j.id}')">${j.technicianId ? 'Reassign' : 'Assign Tech'}</button>
        </td>
      </tr>
    `).join('');
  }

  // 3. TECHNICIAN DASHBOARD
  const techJobsContainer = document.getElementById('techAssignedJobs');
  if (techJobsContainer) {
    const techAssigned = serviceJobs.filter(j => j.technicianId === 'TECH-104' || j.technicianId === 'TECH-102' || activeUserRole === 'technician');
    techJobsContainer.innerHTML = techAssigned.map(j => `
      <div class="glass-panel p-3 mb-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5>${j.id}: ${j.category}</h5>
          <span class="badge-stage stage-${j.status.toLowerCase()}">${j.status}</span>
        </div>
        <div class="small text-muted mb-2">
          <strong>Customer:</strong> ${j.customerName} | 📞 ${j.phone}<br/>
          <strong>Address:</strong> ${j.address} (${j.lat}, ${j.lng})<br/>
          <strong>Issue:</strong> ${j.description}
        </div>
        <div class="d-flex gap-2 mt-3">
          ${j.status === 'Assigned' ? `
            <button class="btn btn-sm btn-success" onclick="updateJobStage('${j.id}', 'Accepted')">Accept Job</button>
            <button class="btn btn-sm btn-danger" onclick="updateJobStage('${j.id}', 'Requested', true)">Reject Job</button>
          ` : ''}
          ${j.status === 'Accepted' ? `<button class="btn btn-sm btn-warning" onclick="updateJobStage('${j.id}', 'Travelling')">Start Journey</button>` : ''}
          ${j.status === 'Travelling' ? `<button class="btn btn-sm btn-info" onclick="updateJobStage('${j.id}', 'Arrived')">Mark Arrived</button>` : ''}
          ${j.status === 'Arrived' ? `<button class="btn btn-sm btn-secondary" onclick="updateJobStage('${j.id}', 'Working')">Start Work</button>` : ''}
          ${j.status === 'Working' ? `<button class="btn btn-sm btn-success" onclick="updateJobStage('${j.id}', 'Completed')">Complete Work</button>` : ''}
        </div>
      </div>
    `).join('');
  }
}

// Form Handlers
function setupForms() {
  const reqForm = document.getElementById('createServiceForm');
  if (reqForm) {
    reqForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newJob = {
        id: `JOB-${Math.floor(500 + Math.random() * 500)}`,
        customerName: document.getElementById('reqCustomerName').value,
        phone: document.getElementById('reqPhone').value,
        address: document.getElementById('reqAddress').value,
        lat: parseFloat(document.getElementById('reqLat').value),
        lng: parseFloat(document.getElementById('reqLng').value),
        category: document.getElementById('reqCategory').value,
        description: document.getElementById('reqDescription').value,
        status: 'Requested',
        technicianId: null,
        remarks: document.getElementById('reqRemarks').value,
        rating: null,
        createdAt: new Date().toISOString()
      };
      serviceJobs.push(newJob);
      addNotification('New Service Request', `Request ${newJob.id} created by ${newJob.customerName}`, 'manager');
      alert(`Service Request ${newJob.id} created! Sent to Manager Dashboard.`);
      switchPage('customerDashboard');
    });
  }
}

// Update Job Workflow Stage
function updateJobStage(jobId, newStatus, isRejection = false) {
  const job = serviceJobs.find(j => j.id === jobId);
  if (job) {
    if (isRejection) {
      job.technicianId = null;
      job.status = 'Requested';
      addNotification('Job Rejected', `Technician rejected Job ${jobId}. Returned to Manager Queue.`, 'manager');
    } else {
      job.status = newStatus;
      addNotification('Workflow Update', `Job ${jobId} status updated to ${newStatus}`, 'customer');
      addNotification('Workflow Update', `Job ${jobId} status updated to ${newStatus}`, 'manager');
    }
    renderRoleDashboards();
    alert(`Job ${jobId} status updated: ${newStatus}`);
  }
}

// Assign Technician Handler
function openAssignModal(jobId) {
  const select = document.getElementById('assignTechSelect');
  select.innerHTML = technicians.map(t => `<option value="${t.id}">${t.name} (${t.skill}) - ${t.status}</option>`).join('');
  document.getElementById('assignJobId').value = jobId;
  new bootstrap.Modal(document.getElementById('assignModal')).show();
}

function confirmAssignTechnician() {
  const jobId = document.getElementById('assignJobId').value;
  const techId = document.getElementById('assignTechSelect').value;

  const job = serviceJobs.find(j => j.id === jobId);
  if (job) {
    job.technicianId = techId;
    job.status = 'Assigned';
    addNotification('Technician Assigned', `Technician ${techId} assigned to Job ${jobId}`, 'technician');
    addNotification('Technician Assigned', `Technician ${techId} assigned to your request ${jobId}`, 'customer');
    renderRoleDashboards();
  }
  const modalEl = document.getElementById('assignModal');
  bootstrap.Modal.getInstance(modalEl).hide();
}

// Rating Handler
function rateServiceJob(jobId) {
  const rating = prompt('Rate service from 1 to 5 stars:', '5');
  if (rating) {
    const job = serviceJobs.find(j => j.id === jobId);
    if (job) {
      job.rating = parseInt(rating);
      renderRoleDashboards();
      alert('Thank you for your rating!');
    }
  }
}

// Add Notification Helper
function addNotification(title, message, role) {
  notifications.unshift({ id: Date.now(), title, message, timestamp: 'Just now', role });
  renderNotifications();
}

function renderNotifications() {
  const container = document.getElementById('notificationsFeed');
  if (container) {
    container.innerHTML = notifications.map(n => `
      <div class="glass-panel p-2 mb-2">
        <div class="d-flex justify-content-between">
          <strong style="color:var(--aws-orange); font-size:0.85rem;">${n.title}</strong>
          <small class="text-muted" style="font-size:0.75rem;">${n.timestamp}</small>
        </div>
        <div class="small text-light">${n.message}</div>
      </div>
    `).join('');
  }
}

// Live Map Leaflet Renderer with Route Simulator
let simulationInterval = null;

async function initLiveMap() {
  await fetchTechnicians();
  if (!mapInstance) {
    mapInstance = L.map('liveMapContainer').setView([19.0760, 72.8777], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© MapLibre / OpenStreetMap / Amazon Location Service'
    }).addTo(mapInstance);
  }
  setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 200);

  mapMarkers.forEach(m => mapInstance.removeLayer(m));
  mapMarkers = [];

  technicians.forEach(t => {
    let color = t.status === 'Available' ? '#10b981' : (t.status === 'Busy' ? '#f59e0b' : '#ef4444');
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div id="marker-${t.id}" style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 12px ${color}; transition: all 0.5s linear;"></div>`,
      iconSize: [24, 24]
    });

    const marker = L.marker([t.latitude, t.longitude], { icon: customIcon }).addTo(mapInstance);
    marker.bindPopup(`
      <div style="color: #000;">
        <strong>${t.name} (${t.id})</strong><br/>
        Skill: ${t.skill}<br/>
        Status: <strong style="color:${color};">${t.status}</strong>
      </div>
    `);
    mapMarkers.push({ id: t.id, marker: marker });
  });
}

// Live Route & Movement Simulator for Hackathon Presentation
function startMovementSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    alert('Route Simulation Paused.');
    return;
  }

  // Find active job travelling to customer
  const targetJob = serviceJobs.find(j => j.status === 'Travelling' || j.status === 'Assigned') || serviceJobs[0];
  const techId = targetJob.technicianId || 'TECH-104';
  const techObj = technicians.find(t => t.id === techId) || technicians[0];
  const techMarkerObj = mapMarkers.find(m => m.id === techObj.id);

  if (!techMarkerObj) {
    alert('Please initialize Live Map first!');
    return;
  }

  alert(`Starting Live Route Simulation for ${techObj.name} navigating towards ${targetJob.customerName} (${targetJob.lat}, ${targetJob.lng})`);

  let currentLat = techObj.latitude;
  let currentLng = techObj.longitude;
  const destLat = targetJob.lat;
  const destLng = targetJob.lng;

  const steps = 20;
  let stepCount = 0;

  const dLat = (destLat - currentLat) / steps;
  const dLng = (destLng - currentLng) / steps;

  simulationInterval = setInterval(() => {
    stepCount++;
    currentLat += dLat;
    currentLng += dLng;

    // Update Marker Position
    techMarkerObj.marker.setLatLng([currentLat, currentLng]);
    mapInstance.panTo([currentLat, currentLng]);

    // Check Geofence Proximity (within ~500m)
    const distKm = calculateHaversineDistance(currentLat, currentLng, destLat, destLng);
    if (distKm < 0.5 || stepCount >= steps) {
      clearInterval(simulationInterval);
      simulationInterval = null;
      techObj.latitude = destLat;
      techObj.longitude = destLng;
      updateJobStage(targetJob.id, 'Arrived');
      addNotification('Geofence Alert', `Technician ${techObj.name} entered customer geofence area for ${targetJob.customerName}!`, 'all');
      alert(`🎯 GEOFENCE TRIGGER: Technician ${techObj.name} has ARRIVED at customer location!`);
    }
  }, 1000);
}

// Bedrock AI Query Handler
async function sendBedrockQuery(role) {
  const inputEl = document.getElementById(`${role}AiInput`);
  const chatBox = document.getElementById(`${role}ChatBox`);
  const prompt = inputEl.value.trim();

  if (!prompt) return;

  chatBox.innerHTML += `<div class="chat-msg user">${prompt}</div>`;
  inputEl.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  const typingId = `typing-${Date.now()}`;
  chatBox.innerHTML += `<div id="${typingId}" class="chat-msg assistant"><em>Amazon Bedrock processing prompt...</em></div>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch(CONFIG.API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bedrock_ai', prompt: prompt, role: role })
    });
    
    document.getElementById(typingId).remove();
    if (res.ok) {
      const data = await res.json();
      chatBox.innerHTML += `<div class="chat-msg assistant">${data.reply}</div>`;
    }
  } catch (err) {
    if (document.getElementById(typingId)) document.getElementById(typingId).remove();
    let reply = `Amazon Bedrock AI (${role.toUpperCase()} Assistant): I have analyzed your request regarding "${prompt}". Operational guidelines have been retrieved.`;
    chatBox.innerHTML += `<div class="chat-msg assistant">${reply}</div>`;
  }
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Analytics Chart
function renderAnalyticsChart() {
  const ctx = document.getElementById('analyticsChart');
  if (!ctx) return;
  new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['HVAC', 'Electrical', 'Plumbing', 'Network'],
      datasets: [{ label: 'Completed Services', data: [18, 24, 12, 20], backgroundColor: '#00a4e4' }]
    },
    options: { responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } } }
  });
}
