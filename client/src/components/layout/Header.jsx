import { NavLink } from 'react-router-dom';
const links = [['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/doctors', 'Doctors'], ['/contact', 'Contact'], ['/login', 'Patient login']];
export default function Header() {
  return <header className="site-header"><div className="container header-inner">
    <NavLink className="logo" to="/" aria-label="Serenova Clinic, home"><span className="logo-mark" aria-hidden="true">S</span><span className="logo-word">Serenova <span>Clinic</span></span></NavLink>
    <input type="checkbox" id="nav-toggle" className="nav-toggle" /><label htmlFor="nav-toggle" className="nav-btn">Menu</label>
    <nav className="main-nav" aria-label="Main"><ul>{links.map(([to, label]) => <li key={to}><NavLink to={to} end={to === '/'}>{label}</NavLink></li>)}<li className="nav-book"><NavLink to="/appointment">Book appointment</NavLink></li></ul></nav>
    <NavLink className="btn btn-primary header-cta" to="/appointment">Book appointment</NavLink>
  </div></header>;
}
