export default function Notice({ children, tone = 'info' }) {
  return <div className={`note notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'} aria-live="polite">{children}</div>;
}
