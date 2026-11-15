import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { useFetch } from '../../hooks/useFetch.js';
import { getDoctorSummary } from '../../api/dashboards.js';
import Loading from '../../components/ui/Loading.jsx';
import StatCard from '../../components/dashboards/StatCard.jsx';
import StatusBadge from '../../components/dashboards/StatusBadge.jsx';

export default function DoctorDashboard() {
  usePageTitle('Doctor dashboard'); const state = useFetch(getDoctorSummary, []);
  if (state.loading) return <Loading />; if (state.error) return <p className="error-summary">{state.error.message}</p>;
  const data = state.data || {}; return <><h1>Today</h1><div className="stat-grid"><StatCard label="Today’s visits" value={data.todayCount ?? data.count ?? 0} /><StatCard label="Next visit" value={data.next?.startAt ? new Date(data.next.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'None'} /></div><section className="section-block"><h2>Today’s appointments</h2><ul className="dashboard-list">{(data.appointments || data.today || []).map((item) => <li key={item._id}><Link to={`/doctor/appointments/${item._id}`}><strong>{new Date(item.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong><span>{item.patient?.fullName || item.guest?.fullName || 'Patient'} <StatusBadge status={item.status} /></span></Link></li>)}</ul></section></>;
}
