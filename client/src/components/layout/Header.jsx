import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
const links = [['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/doctors', 'Doctors'], ['/contact', 'Contact'], ['/login', 'Patient login']];
export default function Header() {
  const { user, logout } = useAuth() || { user: null, logout: () => {} };
  const mainLinks = user ? links.filter(([, label]) => label !== 'Patient login') : links;
  const dashboardPath = user?.role === 'doctor' ? '/doctor' : user?.role === 'admin' ? '/admin' : user?.role === 'receptionist' ? '/staff' : '/portal';
  const dashboardLabel = user?.role === 'doctor' ? 'Doctor dashboard' : user?.role === 'admin' || user?.role === 'receptionist' ? 'Dashboard' : 'My account';
  const headerCtaPath = user ? dashboardPath : '/appointment';
  const headerCtaLabel = user ? dashboardLabel : 'Book appointment';
  return <header className="site-header"><div className="container header-inner">
    <NavLink className="logo" to="/" aria-label="Serenova Clinic, home"><span className="logo-mark" aria-hidden="true">S</span><span className="logo-word">Serenova <span>Clinic</span></span></NavLink>
    <input type="checkbox" id="nav-toggle" className="nav-toggle" /><label htmlFor="nav-toggle" className="nav-btn">Menu</label>
    <nav className="main-nav" aria-label="Main"><ul>{mainLinks.map(([to, label]) => <li key={to}><NavLink to={to} end={to === '/'}>{label}</NavLink></li>)}{user ? <><li><NavLink to={dashboardPath}>{dashboardLabel}</NavLink></li><li><button className="link-button" type="button" onClick={() => logout()}>Log out</button></li></> : null}<li className="nav-book"><NavLink to="/appointment">Book appointment</NavLink></li></ul></nav>
    <NavLink className="btn btn-primary header-cta" to={headerCtaPath}>{headerCtaLabel}</NavLink>
  </div></header>;
}
