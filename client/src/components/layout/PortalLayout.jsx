import { NavLink, Outlet } from 'react-router-dom';

const links = [['/portal', 'Dashboard'], ['/portal/appointments', 'My appointments'], ['/portal/profile', 'Profile']];

export default function PortalLayout() {
  return <section className="section"><div className="container portal-layout">
    <aside className="portal-sidebar"><h2>My account</h2><nav aria-label="Patient portal"><ul>{links.map(([to, label]) => <li key={to}><NavLink to={to} end={to === '/portal'}>{label}</NavLink></li>)}<li><span className="disabled">Lab results <small>Coming soon</small></span></li><li><span className="disabled">Prescriptions <small>Coming soon</small></span></li><li><span className="disabled">Bills <small>Coming soon</small></span></li></ul></nav></aside>
    <div className="portal-content"><Outlet /></div>
  </div></section>;
}
