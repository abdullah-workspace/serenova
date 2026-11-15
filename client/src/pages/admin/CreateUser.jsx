import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { createAdminUser } from '../../api/dashboards.js';
import Toast from '../../components/ui/Toast.jsx';

export default function CreateUser() {
  usePageTitle('Create staff account');
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'receptionist' });
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    try { await createAdminUser(form); navigate('/admin/users'); } catch (requestError) { setError(requestError.message); }
  }
  return <><Toast message={error} onClose={() => setError('')} /><div className="dashboard-page-heading"><div><p className="eyebrow">Administration</p><h1>Create staff account</h1><p className="muted">Only an administrator can create work accounts.</p></div></div><form className="dashboard-card form-grid" onSubmit={submit}><label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Temporary password<input type="password" minLength="8" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label><label>Role<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="receptionist">Receptionist</option><option value="doctor">Doctor</option><option value="admin">Administrator</option></select></label><div className="button-row"><button type="button" onClick={() => navigate('/admin/users')}>Cancel</button><button className="btn btn-primary">Create account</button></div></form></>;
}
