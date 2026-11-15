import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { createAdminDoctor, createAdminUser } from '../../api/dashboards.js';
import { getDepartments } from '../../api/departments.js';
import { useFetch } from '../../hooks/useFetch.js';
import Loading from '../../components/ui/Loading.jsx';
import Toast from '../../components/ui/Toast.jsx';

export default function CreateDoctor() {
  usePageTitle('Add doctor');
  const navigate = useNavigate();
  const departments = useFetch(getDepartments, []);
  const [form, setForm] = useState({ name: '', specialty: '', initials: '', email: '', password: '', departmentId: '' });
  const [error, setError] = useState('');
  if (departments.loading) return <Loading />;
  const list = departments.data?.departments || departments.data || [];
  async function submit(event) {
    event.preventDefault();
    try {
      const user = await createAdminUser({ email: form.email, password: form.password, role: 'doctor' });
      const userId = user._id || user.user?._id;
      await createAdminDoctor({ userId, name: form.name, initials: form.initials, specialty: form.specialty, departmentId: form.departmentId });
      navigate('/admin/doctors');
    } catch (requestError) { setError(requestError.message); }
  }
  return <><Toast message={error} onClose={() => setError('')} /><div className="dashboard-page-heading"><div><p className="eyebrow">Administration</p><h1>Add doctor</h1><p className="muted">Create the login and public doctor profile together.</p></div></div><form className="dashboard-card form-grid" onSubmit={submit}><label>Doctor name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Initials<input required maxLength="4" value={form.initials} onChange={(e) => setForm({ ...form, initials: e.target.value })} /></label><label>Specialty<input required value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} /></label><label>Department<select required value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}><option value="">Choose department</option>{list.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label><label>Login email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Temporary password<input type="password" minLength="8" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label><div className="button-row"><button type="button" onClick={() => navigate('/admin/doctors')}>Cancel</button><button className="btn btn-primary">Create doctor</button></div></form></>;
}
