import { useEffect, useRef } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { lookupAppointment } from '../api/appointments.js';
import { useFetch } from '../hooks/useFetch.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import BookingSummary from '../components/ui/BookingSummary.jsx';
import Loading from '../components/ui/Loading.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';

export default function BookingConfirmed() {
  usePageTitle('Appointment request received');
  const headingRef = useRef(null);
  const location = useLocation();
  const [params] = useSearchParams();
  const { user } = useAuth() || {};
  const stateBooking = location.state;
  const reference = stateBooking?.reference || params.get('ref');
  const token = stateBooking?.manageToken || params.get('token');
  const { data, loading, error } = useFetch(
    () => stateBooking ? Promise.resolve(stateBooking) : lookupAppointment(reference, token),
    [reference, token, stateBooking]
  );
  useEffect(() => headingRef.current?.focus(), []);

  return <section className="section"><div className="container split">
    <div>
      <h1 tabIndex="-1" ref={headingRef}>Appointment request received</h1>
      {loading && <Loading />}
      {error && <ErrorMessage message="We could not load this booking. Check the reference and manage token." />}
      {data && <><p className="lede">The clinic will call to confirm your request. Keep this reference for your records.</p><BookingSummary booking={data} /><div className="button-row"><Link className="btn btn-primary" to={`/appointment/manage?ref=${encodeURIComponent(data.reference)}&token=${encodeURIComponent(token || '')}`}>Manage this appointment</Link>{user && <Link className="btn" to="/portal/appointments">View in patient portal</Link>}</div></>}
    </div>
    <aside className="aside-panel"><h2>What to bring</h2><ul className="tick"><li>A photo ID</li><li>Earlier reports and scans</li><li>A list of medicines you take</li><li>Your insurance card, if you have one</li></ul></aside>
  </div></section>;
}
