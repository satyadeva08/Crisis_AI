import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { incidentService } from '../services/incidents';
import { supabase } from '../services/supabase';

const IncidentContext = createContext(null);

const initialState = {
  incidents: [],
  selectedIncident: null,
  stats: null,
  alerts: [],
  isLoading: false,
  error: null,
  filters: { severity: '', status: '', search: '' },
};

function incidentReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'SET_INCIDENTS':
      return { ...state, incidents: action.payload, isLoading: false };
    case 'SET_SELECTED':
      return { ...state, selectedIncident: action.payload, isLoading: false };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'ADD_INCIDENT':
      return { ...state, incidents: [action.payload, ...state.incidents] };
    default:
      return state;
  }
}

export function IncidentProvider({ children }) {
  const [state, dispatch] = useReducer(incidentReducer, initialState);

  const fetchIncidents = useCallback(async (filters = {}) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const data = await incidentService.getAll(filters);
      dispatch({ type: 'SET_INCIDENTS', payload: data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const fetchIncident = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const data = await incidentService.getById(id);
      dispatch({ type: 'SET_SELECTED', payload: data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await incidentService.getStats();
      dispatch({ type: 'SET_STATS', payload: data });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Setup Supabase Realtime Subscription for automatic updates
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incidents',
        },
        (payload) => {
          // When an incident changes, re-fetch all data to ensure dashboard stays up to date
          fetchIncidents(state.filters);
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIncidents, fetchStats, state.filters]);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await incidentService.getAlerts();
      dispatch({ type: 'SET_ALERTS', payload: data });
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const submitIncident = useCallback(async (formData) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const result = await incidentService.create(formData);
      return result;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, []);

  const updateStatus = useCallback(async (id, status) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const result = await incidentService.updateStatus(id, status);
      // Re-fetch incident to update local state completely
      await fetchIncident(id);
      return result;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, [fetchIncident]);

  return (
    <IncidentContext.Provider
      value={{
        ...state,
        fetchIncidents,
        fetchIncident,
        fetchStats,
        fetchAlerts,
        setFilters,
        submitIncident,
        updateStatus,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const context = useContext(IncidentContext);
  if (!context) throw new Error('useIncidents must be used within IncidentProvider');
  return context;
}
