import { Link, useParams } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { getDoctor, getDoctorSlots } from '../api/doctors.js';
import Loading from '../components/ui/Loading.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import { dateAfter, formatClinicDateTime } from '../utils/date.js';

export default function DoctorProfile() {
  const { id } = useParams();
  usePageTitle('Doctor profile');
  const state = useFetch(() => getDoctor(id), [id]);
  const nextDates = Array.from({ length: 7 }, (_, index) => dateAfter(index));
  const slotState = useFetch(
    () => state.data ? Promise.all(nextDates.map((date) => getDoctorSlots(id, date).then((result) => result.slots.map((slot) => ({ ...slot, date }))))) : Promise.resolve([]),
    [id, state.data]
  );
  if (state.loading) return <section className="section"><div className="container"><Loading /></div></section>;
  if (state.error) return <section className="section"><div className="container"><ErrorMessage message={state.error.message} /></div></section>;
  const doctor = state.data;
  const slots = slotState.data?.flat() || [];
  return <section className="section"><div className="container split"><div><div className="doctor-head"><span className="mono" aria-hidden="true">{doctor.initials}</span><div><h1>{doctor.name}</h1><p>{doctor.specialty}</p></div></div><p>{doctor.bio || 'This doctor is available for consultations at Serenova Clinic.'}</p><dl><dt>Qualified</dt><dd>{doctor.qualifications.join(', ')}</dd><dt>Languages</dt><dd>{doctor.languages.join(', ')}</dd><dt>Sees patients</dt><dd>{doctor.availableDays.join(', ')}</dd></dl><h2>Weekly hours</h2><ul className="tick">{doctor.schedule?.weekly?.map((entry) => <li key={entry.day}>{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][entry.day]}: {entry.start} to {entry.end}</li>)}</ul><Link className="btn btn-primary" to={`/appointment?doctor=${doctor._id}`}>Book with {doctor.name}</Link></div><aside className="aside-panel"><h2>Next open times</h2>{slotState.loading && <Loading />}{!slotState.loading && slots.length === 0 && <p>No open times in the next seven days.</p>}{slots.map((slot) => <p key={slot.startAt}><Link to={`/appointment?doctor=${doctor._id}&slot=${encodeURIComponent(slot.startAt)}`}>{formatClinicDateTime(slot.startAt)}</Link></p>)}</aside></div></section>;
}
