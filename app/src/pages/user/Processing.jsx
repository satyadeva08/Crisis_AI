import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle2, Brain, Image, MapPin, Shield } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { useIncidents } from '../../context/IncidentContext';
import './Processing.css';

/**
 * Processing page — shown while the system "analyzes" the submitted report.
 * Displays animated step-by-step progress, then redirects to the success page.
 */
export default function Processing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { submitIncident } = useIncidents();

  // Each processing step with its display info
  const processingSteps = [
    { id: 'upload', label: 'Uploading image data', icon: Image },
    { id: 'location', label: 'Verifying location coordinates', icon: MapPin },
    { id: 'analyze', label: 'AI analyzing disaster scene', icon: Brain },
    { id: 'priority', label: 'Assigning severity and priority', icon: Shield },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Animate through each step with a delay
    const stepDuration = 1200; // milliseconds per step

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1;

        if (nextStep >= processingSteps.length) {
          clearInterval(timer);
          setIsComplete(true);

          // After a brief pause, redirect to success page
          setTimeout(() => {
            navigate('/report/success', {
              state: { incidentId: 'INC-2026-009' },
            });
          }, 800);

          return prev;
        }

        return nextStep;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="processing-page">
      <Navbar variant="user" />

      <main className="processing-main">
        <div className="container-narrow">
          <div className="processing-card">
            {/* Animated spinner or checkmark */}
            <div className={`processing-icon ${isComplete ? 'complete' : ''}`}>
              {isComplete ? (
                <CheckCircle2 size={32} />
              ) : (
                <Loader2 size={32} className="loading-spinner-icon" />
              )}
            </div>

            <h1 className="processing-title">
              {isComplete ? 'Analysis Complete' : 'Processing Your Report'}
            </h1>

            <p className="processing-description">
              {isComplete
                ? 'Your emergency report has been analyzed and routed to responders.'
                : 'Please wait while our AI system analyzes your emergency report.'
              }
            </p>

            {/* Step-by-step progress */}
            <div className="processing-steps">
              {processingSteps.map((step, index) => {
                const StepIcon = step.icon;
                let stepStatus = 'pending';
                if (index < currentStep) stepStatus = 'done';
                if (index === currentStep && !isComplete) stepStatus = 'active';
                if (isComplete) stepStatus = 'done';

                return (
                  <div key={step.id} className={`processing-step ${stepStatus}`}>
                    <div className="processing-step-indicator">
                      {stepStatus === 'done' ? (
                        <CheckCircle2 size={18} />
                      ) : stepStatus === 'active' ? (
                        <Loader2 size={18} className="loading-spinner-icon" />
                      ) : (
                        <StepIcon size={18} />
                      )}
                    </div>
                    <span className="processing-step-label">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
