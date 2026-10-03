/**
 * Application Configuration & State Management
 * Connects directly to existing AWS API Gateway & Location Service
 */

// Global Config - Update API Gateway Endpoint URL
const CONFIG = {
  // Replace with your API Gateway Stage URL if different
  API_BASE_URL: 'https://YOUR_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/prod/technicians',
  MAP_NAME: 'FieldServiceMap',
  REGION: 'us-east-1',
  GEOFENCE_CENTER: { lat: 37.7749, lng: -122.4194 }, // Center of service area
  GEOFENCE_RADIUS_KM: 25.0 // Maximum allowable radius before warning alert
};

let technicians = [];
let mapInstance = null;
let mapMarkers = [];
let chartInstance = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupEventListeners();
  checkAuthStatus();
});

// Auth Check Simulation
function checkAuthStatus() {
  const isLoggedIn = localStorage.getItem('fsm_logged_in');
  if (isLoggedIn === 'true') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    initDashboard();
  } else {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }
}

// Navigation Handler
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = item.getAttribute('data-page');
      
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      document.querySelectorAll('.page-view').forEach(page => page.classList.remove('active'));
      document.getElementById(`${targetPage}Page`).classList.add('active');

      if (targetPage === 'dashboard') initDashboard();
      if (targetPage === 'technicians') loadTechniciansTable();
      if (targetPage === 'map') initLiveMap();
    });
  });
}

// Event Listeners
function setupEventListeners() {
  // Login Form
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    localStorage.setItem('fsm_logged_in', 'true');
    checkAuthStatus();
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('fsm_logged_in');
    checkAuthStatus();
  });

  // Add Technician Form
  document.getElementById('techForm').addEventListener('submit', handleAddOrUpdateTech);

  // Search Input Filter
  document.getElementById('techSearchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = technicians.filter(t => 
      t.name.toLowerCase().includes(term) || 
      t.id.toLowerCase().includes(term) || 
      t.skill.toLowerCase().includes(term)
    );
    renderTechniciansTable(filtered);
  });

  // Nearby Search Form
  document.getElementById('nearbyForm').addEventListener('submit', handleNearbySearch);
}

// Fetch Technicians from API Gateway
async function fetchTechnicians() {
  try {
    const response = await fetch(CONFIG.API_BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch technicians');
    technicians = await response.json();
    return technicians;
  } catch (error) {
    console.warn('API Gateway error, using cached/mock fallback for demonstration:', error);
    // Demo Fallback Data if API URL is not updated yet
    if (technicians.length === 0) {
      technicians = [
        { id: 'TECH-101', name: 'Alex Rivera', skill: 'HVAC Specialist', status: 'Available', latitude: 37.7749, longitude: -122.4194, email: 'alex@example.com', phone: '555-0192', lastUpdated: new Date().toISOString() },
        { id: 'TECH-102', name: 'Sarah Chen', skill: 'Electrical Engineer', status: 'Busy', latitude: 37.7833, longitude: -122.4167, email: 'sarah@example.com', phone: '555-0144', lastUpdated: new Date().toISOString() },
        { id: 'TECH-103', name: 'Marcus Vance', skill: 'Plumbing & Pipefitting', status: 'Offline', latitude: 37.7300, longitude: -122.3800, email: 'marcus@example.com', phone: '555-0188', lastUpdated: new Date().toISOString() },
        { id: 'TECH-104', name: 'Elena Rostova', skill: 'Network Systems', status: 'Available', latitude: 37.7900, longitude: -122.4000, email: 'elena@example.com', phone: '555-0199', lastUpdated: new Date().toISOString() }
      ];
    }
    return technicians;
  }
}

// Dashboard Initialization
async function initDashboard() {
  await fetchTechnicians();
  updateMetrics();
  checkGeofenceAlerts();
  renderAnalyticsChart();
  renderRecentUpdates();
}

// Update Top Metric Cards
function updateMetrics() {
  const total = technicians.length;
  const available = technicians.filter(t => t.status === 'Available').length;
  const busy = technicians.filter(t => t.status === 'Busy').length;
  const offline = technicians.filter(t => t.status === 'Offline').length;

  document.getElementById('metricTotal').textContent = total;
  document.getElementById('metricAvailable').textContent = available;
  document.getElementById('metricBusy').textContent = busy;
  document.getElementById('metricOffline').textContent = offline;
  document.getElementById('metricActiveJobs').textContent = busy + 3; // Example job count calculation
}

// Geofence Exits Check
function checkGeofenceAlerts() {
  const alertContainer = document.getElementById('geofenceAlerts');
  alertContainer.innerHTML = '';
  
  let breaches = [];

  technicians.forEach(t => {
    const dist = calculateHaversineDistance(
      CONFIG.GEOFENCE_CENTER.lat, CONFIG.GEOFENCE_CENTER.lng,
      t.latitude, t.longitude
    );
    if (dist > CONFIG.GEOFENCE_RADIUS_KM) {
      breaches.push({ tech: t, dist: dist.toFixed(1) });
    }
  });

  if (breaches.length > 0) {
    breaches.forEach(b => {
      alertContainer.innerHTML += `
        <div class="alert-banner">
          <i class="ri-alarm-warning-fill"></i>
          <div>
            <strong>Geofence Violation Alert!</strong> Technician <strong>${b.tech.name} (${b.tech.id})</strong> is ${b.dist} km away (Exceeded service region threshold of ${CONFIG.GEOFENCE_RADIUS_KM} km).
          </div>
        </div>
      `;
    });
  }
}

// Analytics Chart (Chart.js)
function renderAnalyticsChart() {
  const ctx = document.getElementById('statusChart').getContext('2d');
  
  const available = technicians.filter(t => t.status === 'Available').length;
  const busy = technicians.filter(t => t.status === 'Busy').length;
  const offline = technicians.filter(t => t.status === 'Offline').length;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Available', 'Busy', 'Offline'],
      datasets: [{
        data: [available, busy, offline],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } }
      }
    }
  });
}

// Render Recent Updates Activity List
function renderRecentUpdates() {
  const container = document.getElementById('recentUpdatesList');
  container.innerHTML = technicians.slice(0, 5).map(t => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
      <div>
        <strong style="color:#fff;">${t.name}</strong>
        <div style="font-size:0.8rem; color:#94a3b8;">${t.skill} • (${t.latitude}, ${t.longitude})</div>
      </div>
      <span class="badge badge-${t.status.toLowerCase()}">${t.status}</span>
    </div>
  `).join('');
}

// Technician Management Table
async function loadTechniciansTable() {
  await fetchTechnicians();
  renderTechniciansTable(technicians);
}

function renderTechniciansTable(data) {
  const tbody = document.getElementById('techTableBody');
  tbody.innerHTML = data.map(t => `
    <tr>
      <td><strong>${t.id}</strong></td>
      <td>${t.name}</td>
      <td>${t.skill}</td>
      <td><span class="badge badge-${t.status.toLowerCase()}">${t.status}</span></td>
      <td>${t.latitude}, ${t.longitude}</td>
      <td>
        <button class="btn btn-secondary" onclick="openEditModal('${t.id}')"><i class="ri-edit-line"></i> Edit</button>
        <button class="btn btn-danger" onclick="deleteTechnician('${t.id}')"><i class="ri-delete-bin-line"></i></button>
      </td>
    </tr>
  `).join('');
}

// Open Form Modal
function openAddTechModal() {
  document.getElementById('modalTitle').textContent = 'Add New Technician';
  document.getElementById('techForm').reset();
  document.getElementById('techIdInput').removeAttribute('readonly');
  document.getElementById('techModal').classList.add('active');
}

function openEditModal(id) {
  const tech = technicians.find(t => t.id === id);
  if (!tech) return;

  document.getElementById('modalTitle').textContent = 'Update Technician';
  document.getElementById('techIdInput').value = tech.id;
  document.getElementById('techIdInput').setAttribute('readonly', 'true');
  document.getElementById('techNameInput').value = tech.name;
  document.getElementById('techEmailInput').value = tech.email || '';
  document.getElementById('techPhoneInput').value = tech.phone || '';
  document.getElementById('techSkillInput').value = tech.skill;
  document.getElementById('techStatusInput').value = tech.status;
  document.getElementById('techLatInput').value = tech.latitude;
  document.getElementById('techLngInput').value = tech.longitude;

  document.getElementById('techModal').classList.add('active');
}

function closeModal() {
  document.getElementById('techModal').classList.remove('active');
}

// Submit Add / Update Handler
async function handleAddOrUpdateTech(e) {
  e.preventDefault();
  
  const id = document.getElementById('techIdInput').value;
  const isEdit = document.getElementById('techIdInput').hasAttribute('readonly');

  const payload = {
    id: id,
    name: document.getElementById('techNameInput').value,
    email: document.getElementById('techEmailInput').value,
    phone: document.getElementById('techPhoneInput').value,
    skill: document.getElementById('techSkillInput').value,
    status: document.getElementById('techStatusInput').value,
    latitude: parseFloat(document.getElementById('techLatInput').value),
    longitude: parseFloat(document.getElementById('techLngInput').value)
  };

  try {
    const response = await fetch(isEdit ? `${CONFIG.API_BASE_URL}/${id}` : CONFIG.API_BASE_URL, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      closeModal();
      await loadTechniciansTable();
      alert(`Technician ${isEdit ? 'updated' : 'added'} successfully & Amazon Location Tracker updated!`);
    } else {
      throw new Error('API request failed');
    }
  } catch (err) {
    console.warn('API call error, updating local state for preview:', err);
    if (isEdit) {
      const index = technicians.findIndex(t => t.id === id);
      if (index !== -1) technicians[index] = payload;
    } else {
      technicians.push(payload);
    }
    closeModal();
    renderTechniciansTable(technicians);
  }
}

// Delete Technician Handler
async function deleteTechnician(id) {
  if (!confirm(`Are you sure you want to delete technician ${id}?`)) return;

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (response.ok) {
      await loadTechniciansTable();
    }
  } catch (err) {
    console.warn('API error, removing locally for preview:', err);
    technicians = technicians.filter(t => t.id !== id);
    renderTechniciansTable(technicians);
  }
}

// Live Map Leaflet Rendering with Color-Coded Markers
async function initLiveMap() {
  await fetchTechnicians();
  
  if (!mapInstance) {
    mapInstance = L.map('mapContainer').setView([37.7749, -122.4194], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© MapLibre / OpenStreetMap / Amazon Location Service'
    }).addTo(mapInstance);
  }

  // Force Leaflet to recalculate container size when tab becomes visible
  setTimeout(() => {
    if (mapInstance) {
      mapInstance.invalidateSize();
    }
  }, 200);

  // Clear existing markers
  mapMarkers.forEach(m => mapInstance.removeLayer(m));
  mapMarkers = [];

  technicians.forEach(t => {
    let color = t.status === 'Available' ? '#10b981' : (t.status === 'Busy' ? '#f59e0b' : '#ef4444');
    
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 10px ${color};"></div>`,
      iconSize: [20, 20]
    });

    const marker = L.marker([t.latitude, t.longitude], { icon: customIcon }).addTo(mapInstance);
    marker.bindPopup(`
      <div style="color: #000;">
        <strong>${t.name} (${t.id})</strong><br/>
        Skill: ${t.skill}<br/>
        Status: <span style="color:${color}; font-weight:bold;">${t.status}</span>
      </div>
    `);
    mapMarkers.push(marker);
  });
}

// Nearby Technician Search (Haversine & Lambda Backend Integration)
async function handleNearbySearch(e) {
  e.preventDefault();
  const cLat = parseFloat(document.getElementById('custLat').value);
  const cLng = parseFloat(document.getElementById('custLng').value);

  const resultContainer = document.getElementById('nearbyResult');
  resultContainer.style.display = 'block';
  resultContainer.innerHTML = '<p>Searching nearest technician via Amazon Location Backend...</p>';

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}?lat=${cLat}&lng=${cLng}`);
    if (res.ok) {
      const data = await res.json();
      displayNearbyResult(data.technician, data.distanceKm);
      return;
    }
  } catch (err) {
    console.warn('API gateway fallback math:', err);
  }

  // Client-side fallback calculation if API URL is placeholder
  const availableTechs = technicians.filter(t => t.status === 'Available');
  if (availableTechs.length === 0) {
    resultContainer.innerHTML = '<p style="color:var(--status-red);">No available technicians found.</p>';
    return;
  }

  let nearest = null;
  let minDistance = Infinity;

  availableTechs.forEach(t => {
    const dist = calculateHaversineDistance(cLat, cLng, t.latitude, t.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = t;
    }
  });

  displayNearbyResult(nearest, minDistance.toFixed(2));
}

function displayNearbyResult(tech, distanceKm) {
  const resultContainer = document.getElementById('nearbyResult');
  resultContainer.innerHTML = `
    <div class="glass-panel" style="padding: 20px; border-color: var(--status-green);">
      <h3 style="color: var(--status-green); margin-bottom: 8px;"><i class="ri-checkbox-circle-fill"></i> Nearest Available Technician Found</h3>
      <p style="font-size: 1.1rem; color: #fff;"><strong>${tech.name}</strong> (${tech.id})</p>
      <p style="color: var(--text-muted);">Skill: ${tech.skill} | Status: <span class="badge badge-available">Available</span></p>
      <p style="margin-top: 8px; color: var(--aws-orange);"><strong>Distance to Customer:</strong> ${distanceKm} km</p>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Coordinates: (${tech.latitude}, ${tech.longitude})</p>
    </div>
  `;
}

// Distance Helper Formula
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
