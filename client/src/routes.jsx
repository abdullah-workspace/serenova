import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import ComingSoon from './components/ui/ComingSoon.jsx';
import NotFound from './pages/NotFound.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Doctors from './pages/Doctors.jsx';
import Appointment from './pages/Appointment.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';
import DoctorProfile from './pages/DoctorProfile.jsx';
import BookingConfirmed from './pages/BookingConfirmed.jsx';
import ManageBooking from './pages/ManageBooking.jsx';

const futureRoutes = [
  '/privacy', '/terms', '/register', '/forgot-password', '/reset-password/:token', '/verify-email/:token',
  '/portal', '/portal/appointments', '/portal/appointments/:id', '/portal/profile', '/portal/results',
  '/portal/results/:id', '/portal/prescriptions', '/portal/bills', '/portal/family', '/doctor',
  '/doctor/appointments', '/doctor/appointments/:id', '/doctor/patients/:id', '/doctor/schedule',
  '/staff', '/staff/appointments', '/staff/appointments/new', '/staff/appointments/:id', '/staff/messages',
  '/staff/messages/:id', '/staff/patients', '/staff/patients/:id', '/staff/bills', '/admin',
  '/admin/doctors', '/admin/doctors/new', '/admin/doctors/:id', '/admin/doctors/:id/schedule',
  '/admin/departments', '/admin/users', '/admin/audit-log', '/admin/settings', '/forbidden', '/error'
];

export default function AppRoutes() {
  return <Routes><Route element={<Layout />}><Route index element={<Home />} /><Route path="about" element={<About />} /><Route path="services" element={<Services />} /><Route path="services/:slug" element={<ServiceDetail />} /><Route path="doctors" element={<Doctors />} /><Route path="doctors/:id" element={<DoctorProfile />} /><Route path="appointment" element={<Appointment />} /><Route path="appointment/confirmed/:reference" element={<BookingConfirmed />} /><Route path="appointment/manage" element={<ManageBooking />} /><Route path="contact" element={<Contact />} /><Route path="login" element={<Login />} />{futureRoutes.map((path) => <Route key={path} path={path} element={<ComingSoon />} />)}<Route path="*" element={<NotFound />} /></Route></Routes>;
}
