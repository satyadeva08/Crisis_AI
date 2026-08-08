import { api } from './api';
import { mockIncidents, dashboardStats, recentAlerts } from '../data/mockIncidents';

// Toggle this to switch between mock and real API
const USE_MOCK = true;

// Simulate network delay for mock data
const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const incidentService = {
  // Get all incidents with optional filters
  async getAll(filters = {}) {
    if (USE_MOCK) {
      await delay();
      let results = [...mockIncidents];
      if (filters.severity) {
        results = results.filter(i => i.severity === filters.severity);
      }
      if (filters.status) {
        results = results.filter(i => i.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)
        );
      }
      return results;
    }
    const params = new URLSearchParams(filters).toString();
    return api.get(`/incidents${params ? `?${params}` : ''}`);
  },

  // Get single incident by ID
  async getById(id) {
    if (USE_MOCK) {
      await delay(400);
      const incident = mockIncidents.find(i => i.id === id);
      if (!incident) throw new Error('Incident not found');
      return incident;
    }
    return api.get(`/incidents/${id}`);
  },

  // Submit a new incident report
  async create(formData) {
    if (USE_MOCK) {
      await delay(2000); // Simulate AI processing time
      const newId = `INC-2026-${String(mockIncidents.length + 1).padStart(3, '0')}`;
      return {
        id: newId,
        status: 'active',
        severity: 'high',
        aiAnalysis: {
          disasterType: 'Detected from image analysis',
          confidence: 0.89,
          estimatedAffected: 'Under assessment',
          riskLevel: 'High',
          recommendations: [
            'Emergency response team dispatched',
            'Area being assessed for safety',
            'Updates will follow shortly',
          ],
          environmentalRisk: 'Assessment in progress',
        },
      };
    }
    return api.upload('/incidents', formData);
  },

  // Update incident status
  async updateStatus(id, status) {
    if (USE_MOCK) {
      await delay(300);
      return { id, status, updatedAt: new Date().toISOString() };
    }
    return api.patch(`/incidents/${id}`, { status });
  },

  // Get dashboard statistics
  async getStats() {
    if (USE_MOCK) {
      await delay(300);
      return dashboardStats;
    }
    return api.get('/analytics/summary');
  },

  // Get recent alerts
  async getAlerts() {
    if (USE_MOCK) {
      await delay(200);
      return recentAlerts;
    }
    return api.get('/alerts');
  },
};
