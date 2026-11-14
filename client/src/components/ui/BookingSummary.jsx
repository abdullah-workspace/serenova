import { formatClinicDateTime } from '../../utils/date.js';

export default function BookingSummary({ booking }) {
  return (
    <dl className="contact-list">
      <div><dt>Reference</dt><dd>{booking.reference}</dd></div>
      <div><dt>Status</dt><dd>{booking.status}</dd></div>
      <div><dt>Doctor</dt><dd>{booking.doctor?.name}</dd></div>
      <div><dt>Department</dt><dd>{booking.department?.name}</dd></div>
      <div><dt>Visit time</dt><dd>{formatClinicDateTime(booking.startAt)}</dd></div>
    </dl>
  );
}
