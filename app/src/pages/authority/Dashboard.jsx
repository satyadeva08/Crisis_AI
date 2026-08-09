import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Activity, CheckCircle, Clock, Users, Siren } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import MobileNav from '../../components/common/MobileNav';
import StatCard from '../../components/common/StatCard';
import IncidentList from '../../components/authority/IncidentList';
import AlertPanel from '../../components/authority/AlertPanel';
import { useIncidents } from '../../context/IncidentContext';
import './Dashboard.css';

/**
 * Authority dashboard — the main command center view.
 * Shows stat cards, incident list, and alert panel.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const {
    incidents,
    stats,
    alerts,
    isLoading,
    fetchIncidents,
    fetchStats,
    fetchAlerts,
  } = useIncidents();

  // Fetch data on first load
  useEffect(() => {
    fetchIncidents();
    fetchStats();
    fetchAlerts();
  }, [fetchIncidents, fetchStats, fetchAlerts]);

  function handleSelectIncident(incident) {
    navigate(`/authority/incidents/${incident.id}`);
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Page header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Real-time overview of all emergency incidents
            </p>
          </div>
          <div className="dashboard-header-live">
            <span className="dashboard-live-dot" />
            Live Monitoring
          </div>
        </div>

        {/* Stat cards row */}
        <div className="dashboard-stats">
          <StatCard
            icon={Siren}
            value={stats?.total ?? '—'}
            label="Total Incidents"
            accent="var(--color-text-primary)"
            trend={`${stats?.active ?? 0} active`}
          />
          <StatCard
            icon={AlertTriangle}
            value={stats?.critical ?? '—'}
            label="Critical"
            accent="var(--color-critical)"
          />
          <StatCard
            icon={Activity}
            value={stats?.inProgress ?? '—'}
            label="In Progress"
            accent="var(--color-pending)"
          />
          <StatCard
            icon={CheckCircle}
            value={stats?.resolved ?? '—'}
            label="Resolved"
            accent="var(--color-resolved)"
          />
          <StatCard
            icon={Clock}
            value={stats?.avgResponseTime ?? '—'}
            label="Avg Response"
            accent="var(--color-accent)"
          />
          <StatCard
            icon={Users}
            value={stats?.teamsDeployed ?? '—'}
            label="Teams Deployed"
            accent="var(--color-active)"
          />
        </div>

        {/* Main content area: incidents list + alerts side panel */}
        <div className="dashboard-content">
          <div className="dashboard-incidents-panel">
            <h2 className="dashboard-section-title">Active Incidents</h2>
            <IncidentList
              incidents={incidents}
              isLoading={isLoading}
              onSelectIncident={handleSelectIncident}
              selectedId={null}
            />
          </div>

          <div className="dashboard-side-panel">
            <AlertPanel alerts={alerts} />
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
