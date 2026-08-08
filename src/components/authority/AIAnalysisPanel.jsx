import { Brain, Shield, AlertTriangle, Users, Leaf } from 'lucide-react';
import './AIAnalysisPanel.css';

/**
 * Displays the AI analysis results for an incident.
 * Shows disaster type, confidence, risk level, recommendations, etc.
 *
 * Props:
 *   analysis — the aiAnalysis object from an incident
 */
export default function AIAnalysisPanel({ analysis }) {
  if (!analysis) {
    return (
      <div className="ai-panel ai-panel-empty">
        <Brain size={24} />
        <p>No AI analysis available yet</p>
      </div>
    );
  }

  // Convert confidence score to a percentage string
  const confidencePercent = Math.round(analysis.confidence * 100);

  return (
    <div className="ai-panel">
      {/* Panel header */}
      <div className="ai-panel-header">
        <Brain size={18} />
        <h3 className="ai-panel-title">AI Analysis</h3>
        <span className="ai-panel-confidence">
          {confidencePercent}% confidence
        </span>
      </div>

      {/* Key facts grid */}
      <div className="ai-panel-facts">
        <div className="ai-panel-fact">
          <AlertTriangle size={16} />
          <div>
            <span className="ai-panel-fact-label">Disaster Type</span>
            <span className="ai-panel-fact-value">{analysis.disasterType}</span>
          </div>
        </div>

        <div className="ai-panel-fact">
          <Shield size={16} />
          <div>
            <span className="ai-panel-fact-label">Risk Level</span>
            <span className="ai-panel-fact-value">{analysis.riskLevel}</span>
          </div>
        </div>

        <div className="ai-panel-fact">
          <Users size={16} />
          <div>
            <span className="ai-panel-fact-label">Estimated Affected</span>
            <span className="ai-panel-fact-value">{analysis.estimatedAffected}</span>
          </div>
        </div>

        <div className="ai-panel-fact">
          <Leaf size={16} />
          <div>
            <span className="ai-panel-fact-label">Environmental Risk</span>
            <span className="ai-panel-fact-value">{analysis.environmentalRisk}</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="ai-panel-recommendations">
        <h4 className="ai-panel-section-title">Recommended Actions</h4>
        <ol className="ai-panel-rec-list">
          {analysis.recommendations.map((rec, index) => (
            <li key={index} className="ai-panel-rec-item">
              <span className="ai-panel-rec-number">{index + 1}</span>
              <span>{rec}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
