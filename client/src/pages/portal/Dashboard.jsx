import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { getAppointments } from '../../api/portal.js';
import { useFetch } from '../../hooks/useFetch.js';
import Loading from '../../components/ui/Loading.jsx';
import BookingSummary from '../../components/ui/BookingSummary.jsx';
import { formatClinicDateTime } from '../../utils/date.js';

export default function Dashboard() {
  usePageTitle('My account'); const { patient } = useAuth();   const state = useFetch(() => getAppointments('upcoming'), []);
  const past = useFetch(() => getAppointments('past', 1), []);
  if (state.loading) return <Loading />; const next = state.data?.appointments?.[0];
  return <><h1>Hello, {patient?.fullName?.split(' ')[0] || 'there'}</h1>{next ? <section className="card"><h2>Next visit</h2><p>{formatClinicDateTime(next.startAt)}</p><BookingSummary booking={next} /><Link className="btn btn-primary" to={`/portal/appointments/${next._id}`}>View appointment</Link></section> : <section className="card"><h2>No upcoming visits</h2><p>Choose a time that works for you.</p><Link className="btn btn-primary" to="/appointment">Book an appointment</Link></section>}<section className="section-block"><h2>Recent visits</h2>{past.loading ? <Loading /> : <ul>{(past.data?.appointments || []).slice(0, 3).map((appointment) => <li key={appointment._id}>{formatClinicDateTime(appointment.startAt)} - {appointment.doctorId?.name}</li>)}</ul>}</section></>;
}
