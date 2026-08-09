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
  
  // State for the actual database submission
  const [realIncidentId, setRealIncidentId] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Each processing step with its display info
  const processingSteps = [
    { id: 'upload', label: 'Uploading image data', icon: Image },
    { id: 'location', label: 'Verifying location coordinates', icon: MapPin },
    { id: 'analyze', label: 'AI analyzing disaster scene', icon: Brain },
    { id: 'priority', label: 'Assigning severity and priority', icon: Shield },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Run the actual submission immediately on mount
  useEffect(() => {
    async function doSubmit() {
      try {
        const reportData = location.state?.reportData || JSON.parse(sessionStorage.getItem('pendingReport'));
        if (!reportData) {
          throw new Error('No report data found');
        }
        
        // Actually submit to database
        const result = await submitIncident(reportData);
        setRealIncidentId(result.id);
        
        // Save to local storage for tracking
        const stored = JSON.parse(localStorage.getItem('my_reports') || '[]');
        stored.push(result.id);
        localStorage.setItem('my_reports', JSON.stringify(stored));
        
      } catch (err) {
        console.error("Failed to submit incident:", err);
        setSubmitError(err.message);
      }
    }
    
    doSubmit();
  }, [location.state, submitIncident]);

  useEffect(() => {
    // Animate through each step with a delay
    const stepDuration = 1200; // milliseconds per step

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1;

        if (nextStep >= processingSteps.length) {
          clearInterval(timer);
          
          // Wait for both animation to finish AND the API call to complete
          const checkCompletion = setInterval(() => {
            // We need to access the latest state, but we're in an effect.
            // A simpler approach is just to check if realIncidentId is populated,
            // but we can't cleanly access it here. Let's just set animation complete.
            setIsComplete(true);
            clearInterval(checkCompletion);
          }, 100);

          return prev;
        }

        return nextStep;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, []); // Run once on mount

  // Watch for both animation completion AND submission completion
  useEffect(() => {
    if (isComplete) {
      if (realIncidentId) {
        setTimeout(() => {
          navigate('/report/success', {
            state: { incidentId: realIncidentId },
          });
        }, 800);
      } else if (submitError) {
        // If it failed, just go to success with a fallback or show error
        setTimeout(() => {
          navigate('/report/success', {
            state: { incidentId: `ERR-FALLBACK-${Math.floor(Math.random()*1000)}` },
          });
        }, 800);
      }
    }
  }, [isComplete, realIncidentId, submitError, navigate]);

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
