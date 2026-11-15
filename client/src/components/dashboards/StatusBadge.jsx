const labels = { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled', 'no-show': 'No-show', new: 'New', replied: 'Replied', closed: 'Closed' };
export default function StatusBadge({ status }) { return <span className={`status-badge status-badge--${status}`}><span aria-hidden="true">●</span> {labels[status] || status}</span>; }
