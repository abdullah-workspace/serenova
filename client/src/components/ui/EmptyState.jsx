export default function EmptyState({ message = 'No results found.' }) { return <p role="status" aria-live="polite">{message}</p>; }
