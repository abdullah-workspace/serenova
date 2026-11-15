import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
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
import DashboardLayout from './components/dashboards/DashboardLayout.jsx';
import DoctorDashboard from './pages/doctor/Dashboard.jsx';
import DoctorAppointments from './pages/doctor/Appointments.jsx';
import DoctorAppointmentDetail from './pages/doctor/AppointmentDetail.jsx';
import DoctorSchedule from './pages/doctor/Schedule.jsx';
import StaffDashboard from './pages/staff/Dashboard.jsx';
import StaffAppointments from './pages/staff/Appointments.jsx';
import StaffMessages from './pages/staff/Messages.jsx';
import StaffPatients from './pages/staff/Patients.jsx';
import WalkIn from './pages/staff/WalkIn.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminDoctors from './pages/admin/Doctors.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminSettings from './pages/admin/Settings.jsx';
import CreateUser from './pages/admin/CreateUser.jsx';
import CreateDoctor from './pages/admin/CreateDoctor.jsx';
import DashboardPlaceholder from './pages/DashboardPlaceholder.jsx';

export default function AppRoutes() {
  return <Routes><Route element={<Layout />}><Route index element={<Home />} /><Route path="about" element={<About />} /><Route path="services" element={<Services />} /><Route path="services/:slug" element={<ServiceDetail />} /><Route path="doctors" element={<Doctors />} /><Route path="doctors/:id" element={<DoctorProfile />} /><Route path="appointment" element={<Appointment />} /><Route path="appointment/confirmed/:reference" element={<BookingConfirmed />} /><Route path="appointment/manage" element={<ManageBooking />} /><Route path="contact" element={<Contact />} /><Route path="login" element={<Login />} /><Route path="register" element={<Register />} /><Route path="forgot-password" element={<ForgotPassword />} /><Route path="reset-password/:token" element={<ResetPassword />} /><Route path="forbidden" element={<Forbidden />} /><Route element={<RequireAuth><RequireRole roles={['patient']}><PortalLayout /></RequireRole></RequireAuth>}><Route path="portal" element={<Dashboard />} /><Route path="portal/appointments" element={<PortalAppointments />} /><Route path="portal/appointments/:id" element={<AppointmentDetail />} /><Route path="portal/profile" element={<Profile />} /></Route>
    <Route element={<RequireAuth><RequireRole roles={['doctor']}><DashboardLayout role="doctor" title="Doctor dashboard" links={[['/doctor', 'Overview'], ['/doctor/appointments', 'Appointments'], ['/doctor/schedule', 'My schedule']]} /></RequireRole></RequireAuth>}><Route path="doctor" element={<DoctorDashboard />} /><Route path="doctor/appointments" element={<DoctorAppointments />} /><Route path="doctor/appointments/:id" element={<DoctorAppointmentDetail />} /><Route path="doctor/schedule" element={<DoctorSchedule />} /><Route path="doctor/patients/:id" element={<DashboardPlaceholder title="Patient record" />} /></Route>
    <Route element={<RequireAuth><RequireRole roles={['receptionist', 'admin']}><DashboardLayout role="receptionist" title="Reception" links={[['/staff', 'Overview'], ['/staff/appointments', 'Appointments'], ['/staff/patients', 'Patients'], ['/staff/messages', 'Messages']]} /></RequireRole></RequireAuth>}><Route path="staff" element={<StaffDashboard />} /><Route path="staff/appointments" element={<StaffAppointments />} /><Route path="staff/appointments/new" element={<WalkIn />} /><Route path="staff/appointments/:id" element={<DashboardPlaceholder title="Appointment detail" />} /><Route path="staff/messages" element={<StaffMessages />} /><Route path="staff/messages/:id" element={<DashboardPlaceholder title="Message detail" />} /><Route path="staff/patients" element={<StaffPatients />} /><Route path="staff/patients/:id" element={<DashboardPlaceholder title="Patient record" />} /></Route>
    <Route element={<RequireAuth><RequireRole roles={['admin']}><DashboardLayout role="admin" title="Administration" links={[['/admin', 'Overview'], ['/admin/doctors', 'Doctors'], ['/admin/users', 'Users'], ['/admin/settings', 'Settings']]} /></RequireRole></RequireAuth>}><Route path="admin" element={<AdminDashboard />} /><Route path="admin/doctors" element={<AdminDoctors />} /><Route path="admin/doctors/new" element={<CreateDoctor />} /><Route path="admin/doctors/:id" element={<DashboardPlaceholder title="Doctor details" />} /><Route path="admin/doctors/:id/schedule" element={<DashboardPlaceholder title="Edit schedule" />} /><Route path="admin/departments" element={<DashboardPlaceholder title="Departments" />} /><Route path="admin/users" element={<AdminUsers />} /><Route path="admin/users/new" element={<CreateUser />} /><Route path="admin/audit-log" element={<DashboardPlaceholder title="Audit log" />} /><Route path="admin/settings" element={<AdminSettings />} /></Route>
    <Route path="*" element={<NotFound />} /></Route></Routes>;
}
