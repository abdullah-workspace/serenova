import { Outlet } from 'react-router-dom';
import SkipLink from './SkipLink.jsx';
import EmergencyStrip from './EmergencyStrip.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
export default function Layout() { return <><SkipLink /><EmergencyStrip /><Header /><main id="main"><Outlet /></main><Footer /></>; }
