import { supabase } from './supabase';
import { authService } from './auth';
// Mock data removed — strictly using real database now

/**
 * Incident service — queries Supabase for incident data.
 * Falls back to mock data if Supabase is unavailable.
 */

// ── Data transformer ──
// Maps a Supabase DB row to the shape the frontend components expect.

function transformIncident(row) {
  return {
    id: row.incident_id,
    title: row.title,
    description: row.description,
    category: row.disaster_type,
    severity: row.severity_level,
    priority: row.priority_score ?? 5,
    status: row.status === 'reported' ? 'active' : row.status,
    location: {
      lat: parseFloat(row.latitude),
      lng: parseFloat(row.longitude),
      address: row.location_name || 'Unknown location',
    },
    imageUrl: null,
    reportedBy: row.reported_by || 'Citizen Report',
    reportedAt: row.reported_at,
    aiAnalysis: buildAiAnalysis(row),
    updates: transformUpdates(row.incident_updates),
  };
}

function buildAiAnalysis(row) {
  // If the row includes joined severity_assessments or recommendations, use them
  const severity = row.severity_assessments?.[0];
  const recs = row.recommendations || [];
  const damage = row.damage_assessments?.[0];

  if (!severity && !damage && recs.length === 0) {
    return null; // No AI analysis available yet
  }

  return {
    disasterType: row.disaster_type,
    confidence: severity?.confidence_score
      ? parseFloat(severity.confidence_score) / 100
      : 0.85,
    estimatedAffected: row.affected_population
      ? `${row.affected_population} people`
      : 'Under assessment',
    riskLevel: capitalizeFirst(row.severity_level),
    recommendations: recs.map((r) => r.recommendation),
    environmentalRisk: damage?.damage_description || 'Assessment in progress',
  };
}

function transformUpdates(updates) {
  if (!updates || !Array.isArray(updates)) return [];
  return updates.map((u) => ({
    time: u.update_time || formatTime(u.created_at),
    text: u.update_text,
  }));
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatTime(isoString) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}


// ── Service methods ──

export const incidentService = {
  /**
   * Fetch all incidents with optional filters.
   */
  async getAll(filters = {}) {
    try {
      let query = supabase
        .from('incidents')
        .select('*')
        .order('reported_at', { ascending: false });

      // Apply filters
      if (filters.severity) {
        query = query.eq('severity_level', filters.severity);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data) return []; 

      return data.map(transformIncident);
    } catch (err) {
      console.warn('Supabase getAll failed:', err.message);
      return [];
    }
  },

  /**
   * Fetch all incidents for a specific user ID
   */
  async getAllForUser(userId) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data.map(inc => ({
        id: inc.incident_id,
        title: inc.title,
        status: inc.status,
        reportedAt: inc.created_at,
      }));
    } catch (err) {
      console.error('Failed to fetch user incidents', err);
      return [];
    }
  },

  /**
   * Fetch a single incident by ID, including AI analysis and timeline.
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          severity_assessments (*),
          damage_assessments (*),
          recommendations (*),
          incident_updates (*)
        `)
        .eq('incident_id', id)
        .single();

      if (error) throw error;
      return transformIncident(data);
    } catch (err) {
      console.warn('Supabase getById failed:', err.message);
      throw new Error('Incident not found');
    }
  },

  /**
   * Submit a new incident report.
   * Inserts into incidents table and related tables.
   */
  async create(formData) {
    try {
      const user = authService.getUser();
      const userId = user?.role === 'citizen' ? user.id : null;

      // Insert the main incident record
      const { data: incident, error: incidentError } = await supabase
        .from('incidents')
        .insert({
          title: `${formData.category} — Emergency Report`,
          description: formData.description,
          disaster_type: formData.category,
          status: 'reported',
          severity_level: 'medium', // Default until AI processes it
          latitude: formData.location?.lat,
          longitude: formData.location?.lng,
          location_name: formData.location?.address,
          reported_by: formData.contactName || 'Anonymous',
          contact_name: formData.contactName,
          contact_phone: formData.contactPhone,
          user_id: userId,
        })
        .select()
        .single();

      if (incidentError) throw incidentError;

      // Insert the text report
      if (formData.description) {
        await supabase.from('text_reports').insert({
          incident_id: incident.incident_id,
          report_text: formData.description,
          title: `Report for ${formData.category}`,
          processing_status: 'pending',
          reported_at: new Date().toISOString(),
        });
      }

      // Insert initial timeline entry
      await supabase.from('incident_updates').insert({
        incident_id: incident.incident_id,
        update_text: 'Incident reported and submitted for AI analysis',
        update_time: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      });

      return {
        id: incident.incident_id,
        status: 'reported',
        severity: 'medium',
      };
    } catch (err) {
      console.error('Supabase create failed:', err.message);
      throw new Error('Failed to create incident report');
    }
  },

  /**
   * Update incident status.
   */
  async updateStatus(id, status) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .update({ status })
        .eq('incident_id', id)
        .select()
        .single();

      if (error) throw error;
      return { id: data.incident_id, status: data.status, updatedAt: data.updated_at };
    } catch (err) {
      console.warn('Supabase updateStatus failed:', err.message);
      return { id, status, updatedAt: new Date().toISOString() };
    }
  },

  /**
   * Get dashboard statistics — aggregated from incidents table.
   */
  async getStats() {
    try {
      const { data: incidents, error } = await supabase
        .from('incidents')
        .select('severity_level, status, reported_at, updated_at');

      if (error) throw error;
      
      const emptyStats = {
        total: 0, critical: 0, high: 0, medium: 0, low: 0,
        active: 0, inProgress: 0, resolved: 0,
        avgResponseTime: '0 min', teamsDeployed: 0,
      };
      
      if (!incidents || incidents.length === 0) return emptyStats;

      const total = incidents.length;
      const critical = incidents.filter((i) => i.severity_level === 'critical').length;
      const high = incidents.filter((i) => i.severity_level === 'high').length;
      const medium = incidents.filter((i) => i.severity_level === 'medium').length;
      const low = incidents.filter((i) => i.severity_level === 'low').length;
      const active = incidents.filter((i) => i.status === 'active' || i.status === 'reported').length;
      const inProgress = incidents.filter((i) => i.status === 'in-progress' || i.status === 'processing').length;
      const resolved = incidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length;

      // Calculate average response time for incidents that have been updated
      let totalMins = 0;
      let respondedCount = 0;
      incidents.forEach(inc => {
        if (inc.status !== 'reported' && inc.updated_at && inc.reported_at) {
          const diffMs = new Date(inc.updated_at).getTime() - new Date(inc.reported_at).getTime();
          const diffMins = Math.floor(diffMs / 60000);
          if (diffMins > 0) {
            totalMins += diffMins;
            respondedCount++;
          }
        }
      });
      const avgResponseTime = respondedCount > 0 ? `${Math.round(totalMins / respondedCount)} min` : 'N/A';

      // Query real deployed teams from resources table
      let teamsDeployed = 0;
      try {
        const { data: resources, error: resError } = await supabase
          .from('resources')
          .select('resource_id')
          .eq('status', 'deployed');
        if (resources) teamsDeployed = resources.length;
      } catch (e) {
        console.warn('Could not fetch resources:', e.message);
      }

      return {
        total,
        critical,
        high,
        medium,
        low,
        active,
        inProgress,
        resolved,
        avgResponseTime,
        teamsDeployed,
      };
    } catch (err) {
      console.warn('Supabase getStats failed:', err.message);
      return {
        total: 0, critical: 0, high: 0, medium: 0, low: 0,
        active: 0, inProgress: 0, resolved: 0,
        avgResponseTime: '0 min', teamsDeployed: 0,
      };
    }
  },

  /**
   * Get recent alerts from safety_alerts table.
   */
  async getAlerts() {
    try {
      const { data, error } = await supabase
        .from('safety_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (!data) return [];

      return data.map((alert) => ({
        id: alert.alert_id,
        type: alert.severity_level || 'medium',
        message: alert.message,
        time: formatTimeAgo(alert.created_at),
      }));
    } catch (err) {
      console.warn('Supabase getAlerts failed:', err.message);
      return [];
    }
  },
};

/**
 * Format a timestamp as "X min ago" style string.
 */
function formatTimeAgo(isoString) {
  if (!isoString) return 'Just now';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
