import { Loader2 } from 'lucide-react';
import './LoadingSpinner.css';

/**
 * Simple loading spinner. Can be used inline or as a full-page overlay.
 *
 * Props:
 *   size     — icon size in pixels (default: 24)
 *   message  — optional text displayed below the spinner
 *   fullPage — if true, centers the spinner on the entire viewport
 */
export default function LoadingSpinner({ size = 24, message, fullPage = false }) {
  const content = (
    <div className="loading-spinner">
      <Loader2 size={size} className="loading-spinner-icon" />
      {message && <p className="loading-spinner-message">{message}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="loading-spinner-fullpage">{content}</div>;
  }

  return content;
}
