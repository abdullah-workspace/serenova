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
import ForgotPassword from './pages/ForgotPassword.jsx';
import Register from './pages/Register.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Forbidden from './pages/Forbidden.jsx';
import RequireAuth from './components/auth/RequireAuth.jsx';
import RequireRole from './components/auth/RequireRole.jsx';
import PortalLayout from './components/layout/PortalLayout.jsx';
import Dashboard from './pages/portal/Dashboard.jsx';
import PortalAppointments from './pages/portal/Appointments.jsx';
import AppointmentDetail from './pages/portal/AppointmentDetail.jsx';
import Profile from './pages/portal/Profile.jsx';

const futureRoutes = [
  '/privacy', '/terms', '/verify-email/:token', '/portal/results',
  '/portal/results/:id', '/portal/prescriptions', '/portal/bills', '/portal/family', '/doctor',
  '/doctor/appointments', '/doctor/appointments/:id', '/doctor/patients/:id', '/doctor/schedule',
  '/staff', '/staff/appointments', '/staff/appointments/new', '/staff/appointments/:id', '/staff/messages',
  '/staff/messages/:id', '/staff/patients', '/staff/patients/:id', '/staff/bills', '/admin',
  '/admin/doctors', '/admin/doctors/new', '/admin/doctors/:id', '/admin/doctors/:id/schedule',
  '/admin/departments', '/admin/users', '/admin/audit-log', '/admin/settings', '/error'
];

export default function AppRoutes() {
  return <Routes><Route element={<Layout />}><Route index element={<Home />} /><Route path="about" element={<About />} /><Route path="services" element={<Services />} /><Route path="services/:slug" element={<ServiceDetail />} /><Route path="doctors" element={<Doctors />} /><Route path="doctors/:id" element={<DoctorProfile />} /><Route path="appointment" element={<Appointment />} /><Route path="appointment/confirmed/:reference" element={<BookingConfirmed />} /><Route path="appointment/manage" element={<ManageBooking />} /><Route path="contact" element={<Contact />} /><Route path="login" element={<Login />} /><Route path="register" element={<Register />} /><Route path="forgot-password" element={<ForgotPassword />} /><Route path="reset-password/:token" element={<ResetPassword />} /><Route path="forbidden" element={<Forbidden />} /><Route element={<RequireAuth><RequireRole roles={['patient']}><PortalLayout /></RequireRole></RequireAuth>}><Route path="portal" element={<Dashboard />} /><Route path="portal/appointments" element={<PortalAppointments />} /><Route path="portal/appointments/:id" element={<AppointmentDetail />} /><Route path="portal/profile" element={<Profile />} /></Route>{futureRoutes.map((path) => <Route key={path} path={path} element={<ComingSoon />} />)}<Route path="*" element={<NotFound />} /></Route></Routes>;
}
