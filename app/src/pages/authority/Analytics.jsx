import { useEffect } from 'react';
import {
  AlertTriangle, Activity, CheckCircle, TrendingUp,
  Clock, PieChart, BarChart3
} from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import MobileNav from '../../components/common/MobileNav';
import StatCard from '../../components/common/StatCard';
import { useIncidents } from '../../context/IncidentContext';
import { SEVERITY_CONFIG } from '../../utils/constants';
import './Analytics.css';

/**
 * Analytics / Summary page.
 * Shows high-level metrics, incident distribution by severity,
 * category breakdown, and response performance.
 */
export default function Analytics() {
  const { incidents, stats, isLoading, fetchIncidents, fetchStats } = useIncidents();

  useEffect(() => {
    fetchIncidents();
    fetchStats();
  }, [fetchIncidents, fetchStats]);

  // Count incidents by severity
  const severityCounts = {
    critical: incidents.filter((i) => i.severity === 'critical').length,
    high: incidents.filter((i) => i.severity === 'high').length,
    medium: incidents.filter((i) => i.severity === 'medium').length,
    low: incidents.filter((i) => i.severity === 'low').length,
  };

  // Count incidents by category
  const categoryCounts = {};
  incidents.forEach((incident) => {
    const cat = incident.category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Sort categories by count (descending)
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]);

  // Count incidents by status
  const statusCounts = {
    active: incidents.filter((i) => i.status === 'active').length,
    'in-progress': incidents.filter((i) => i.status === 'in-progress').length,
    resolved: incidents.filter((i) => i.status === 'resolved').length,
  };

  // Calculate the maximum count for the severity bar chart
  const maxSeverityCount = Math.max(...Object.values(severityCounts), 1);

  return (
    <div className="analytics-layout">
      <Sidebar />

      <main className="analytics-main">
        {/* Header */}
        <div className="analytics-header">
          <h1 className="analytics-title">Analytics</h1>
          <p className="analytics-subtitle">
            Summary of emergency response metrics and incident distribution
          </p>
        </div>

        {/* Summary stat cards */}
        <div className="analytics-stats">
          <StatCard
            icon={TrendingUp}
            value={stats?.total ?? '—'}
            label="Total Incidents"
            accent="var(--color-text-primary)"
          />
          <StatCard
            icon={AlertTriangle}
            value={stats?.critical ?? '—'}
            label="Critical"
            accent="var(--color-critical)"
          />
          <StatCard
            icon={Clock}
            value={stats?.avgResponseTime ?? '—'}
            label="Avg Response Time"
            accent="var(--color-accent)"
          />
          <StatCard
            icon={CheckCircle}
            value={stats?.resolved ?? '—'}
            label="Resolved"
            accent="var(--color-active)"
          />
        </div>

        {/* Charts / breakdowns */}
        <div className="analytics-grid">
          {/* Severity Distribution */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <BarChart3 size={16} />
              <h2>Severity Distribution</h2>
            </div>
            <div className="analytics-bars">
              {Object.entries(severityCounts).map(([severity, count]) => {
                const config = SEVERITY_CONFIG[severity];
                const widthPercent = (count / maxSeverityCount) * 100;

                return (
                  <div key={severity} className="analytics-bar-row">
                    <span className="analytics-bar-label">{config.label}</span>
                    <div className="analytics-bar-track">
                      <div
                        className="analytics-bar-fill"
                        style={{
                          width: `${widthPercent}%`,
                          background: config.color,
                        }}
                      />
                    </div>
                    <span className="analytics-bar-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Overview */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <Activity size={16} />
              <h2>Status Overview</h2>
            </div>
            <div className="analytics-status-grid">
              <div className="analytics-status-item">
                <div className="analytics-status-dot" style={{ background: 'var(--color-critical)' }} />
                <span className="analytics-status-label">Active</span>
                <span className="analytics-status-value">{statusCounts.active}</span>
              </div>
              <div className="analytics-status-item">
                <div className="analytics-status-dot" style={{ background: 'var(--color-pending)' }} />
                <span className="analytics-status-label">In Progress</span>
                <span className="analytics-status-value">{statusCounts['in-progress']}</span>
              </div>
              <div className="analytics-status-item">
                <div className="analytics-status-dot" style={{ background: 'var(--color-resolved)' }} />
                <span className="analytics-status-label">Resolved</span>
                <span className="analytics-status-value">{statusCounts.resolved}</span>
              </div>
            </div>

            {/* Simple donut-like visual using CSS */}
            <div className="analytics-donut-row">
              {Object.entries(statusCounts).map(([status, count]) => {
                if (count === 0) return null;
                const percent = Math.round((count / incidents.length) * 100);
                const color = status === 'active' ? 'var(--color-critical)'
                  : status === 'in-progress' ? 'var(--color-pending)'
                  : 'var(--color-resolved)';

                return (
                  <div key={status} className="analytics-donut-segment" style={{ flex: count }}>
                    <div className="analytics-donut-bar" style={{ background: color }} />
                    <span className="analytics-donut-label">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="analytics-card analytics-card-wide">
            <div className="analytics-card-header">
              <PieChart size={16} />
              <h2>Incidents by Category</h2>
            </div>
            <div className="analytics-category-list">
              {sortedCategories.map(([category, count]) => (
                <div key={category} className="analytics-category-item">
                  <span className="analytics-category-name">{category}</span>
                  <div className="analytics-category-bar-track">
                    <div
                      className="analytics-category-bar-fill"
                      style={{
                        width: `${(count / incidents.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="analytics-category-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
