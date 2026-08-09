import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import IncidentCard from './IncidentCard';
import LoadingSpinner from '../common/LoadingSpinner';
import './IncidentList.css';

/**
 * Filterable list of incidents with search and severity filters.
 *
 * Props:
 *   incidents       — array of incident objects
 *   isLoading       — shows loading state when true
 *   onSelectIncident — callback when an incident card is clicked
 *   selectedId      — ID of the currently selected incident
 */
export default function IncidentList({ incidents, isLoading, onSelectIncident, selectedId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Filter incidents by search and severity
  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      !searchQuery ||
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      severityFilter === 'all' || incident.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const severityTabs = [
    { value: 'all', label: 'All' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <div className="incident-list">
      {/* Search bar */}
      <div className="incident-list-search">
        <Search size={16} className="incident-list-search-icon" />
        <input
          type="text"
          placeholder="Search incidents…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="incident-list-search-input"
        />
      </div>

      {/* Severity filter tabs */}
      <div className="incident-list-filters">
        {severityTabs.map((tab) => (
          <button
            key={tab.value}
            className={`incident-list-filter ${severityFilter === tab.value ? 'active' : ''}`}
            onClick={() => setSeverityFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Incident cards */}
      <div className="incident-list-items">
        {isLoading ? (
          <LoadingSpinner message="Loading incidents…" />
        ) : filteredIncidents.length === 0 ? (
          <div className="incident-list-empty">
            <p>No incidents match your filters</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onClick={onSelectIncident}
              isActive={selectedId === incident.id}
            />
          ))
        )}
      </div>

      {/* Count summary */}
      {!isLoading && (
        <div className="incident-list-count">
          Showing {filteredIncidents.length} of {incidents.length} incidents
        </div>
      )}
    </div>
  );
}
