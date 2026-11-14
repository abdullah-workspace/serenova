import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { getAvailabilityToday } from '../api/availability.js';
import Loading from '../components/ui/Loading.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function Home() {
  usePageTitle('Home');
  const { data, loading, error } = useFetch(getAvailabilityToday, []);
  return <section className="hero"><div className="container hero-grid"><div><h1>See a specialist this week, not next month.</h1><p className="lede">Serenova Clinic brings eight departments and a team of experienced doctors under one roof. Appointments are usually available within a week.</p><div className="actions"><Link className="btn btn-primary" to="/appointment">Book appointment</Link><Link className="btn btn-secondary" to="/doctors">Find a doctor</Link></div><p className="hero-meta">Open Monday to Saturday, 8am to 9pm. Emergency care is open 24 hours.</p></div><aside className="board" aria-labelledby="board-title"><div className="board-head"><h2 id="board-title">Open today</h2><span>Live times</span></div>{loading && <Loading />}{error && <ErrorMessage message={error.message} />}{!loading && !error && data?.length === 0 && <EmptyState message="No open slots left today." />}{data?.length > 0 && <ul className="board-list">{data.map(({ doctor, slots }) => <li className="board-row" key={doctor.id}><div className="board-doc"><span className="board-mono" aria-hidden="true">{doctor.initials}</span><div><strong>{doctor.name}</strong><small>{doctor.specialty}</small></div></div><ul className="slots">{slots.map((slot) => <li key={slot.startAt}><Link to={`/appointment?doctor=${doctor.id}&slot=${encodeURIComponent(slot.startAt)}`}>{slot.label}</Link></li>)}</ul></li>)}</ul>}<p className="board-foot"><span>Choose a time to start your booking.</span><Link to="/doctors">See all doctors</Link></p></aside></div></section>;
}
