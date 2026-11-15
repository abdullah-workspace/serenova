import { useEffect } from 'react';

export default function Toast({ message, tone = 'error', onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => onClose?.(), 6000);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;
  return <div className={`toast toast--${tone}`} role={tone === 'error' ? 'alert' : 'status'} aria-live="assertive">
    <span>{message}</span>
    <button type="button" onClick={() => onClose?.()} aria-label="Dismiss notification">×</button>
  </div>;
}
