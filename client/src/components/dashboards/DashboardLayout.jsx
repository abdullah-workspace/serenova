import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DashboardLayout({ role, title, links }) {
  const { user } = useAuth();
  return <section className="section"><div className="container dashboard-layout">
    <aside className="dashboard-sidebar"><p className="eyebrow">{role}</p><h2>{title}</h2><nav aria-label={`${role} dashboard`}><ul>{links.map(([to, label]) => <li key={to}><NavLink to={to} end={to === `/${role === 'doctor' ? 'doctor' : role === 'receptionist' ? 'staff' : 'admin'}`}>{label}</NavLink></li>)}</ul></nav></aside>
    <div className="dashboard-content"><p className="muted">Signed in as {user?.email}</p><Outlet /></div>
  </div></section>;
}
