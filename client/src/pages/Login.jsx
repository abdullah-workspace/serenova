import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';
import FormField from '../components/ui/FormField.jsx';
import Toast from '../components/ui/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  usePageTitle('Log in');
  const auth = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const [form, setForm] = useState({ identifier: '', password: '', remember: false }); const [error, setError] = useState(''); const [sending, setSending] = useState(false);
  function dashboardFor(role) { if (role === 'admin') return '/admin'; if (role === 'doctor') return '/doctor'; if (role === 'receptionist') return '/staff'; return '/portal'; }
  async function submit(event) { event.preventDefault(); setSending(true); setError(''); try { const data = await auth.login(form); const requested = location.state?.from?.pathname; const destination = data.user?.role === 'patient' && requested?.startsWith('/portal') ? requested : dashboardFor(data.user?.role); navigate(destination, { replace: true }); } catch (requestError) { setError(requestError.message); } finally { setSending(false); } }
  return <section className="section section--compact"><Toast message={error} onClose={() => setError('')} /><div className="container login-wrap"><div className="login-panel"><h1>Log in to Serenova</h1><p className="muted">Patients go to the patient portal. Doctors, receptionists, and admins go to their work dashboard automatically.</p><form onSubmit={submit}><div className="form-grid">
    <FormField id="identifier" label="Email or patient ID" required>{({ id }) => <input id={id} value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} autoComplete="username" required />}</FormField>
    <FormField id="password" label="Password" required>{({ id }) => <input type="password" id={id} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required />}</FormField>
    <label className="check"><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} /> Keep me signed in</label>
    <button className="btn btn-primary btn-block" disabled={sending}>{sending ? 'Logging in…' : 'Log in'}</button></div></form><p className="login-links"><Link to="/forgot-password">Forgot password?</Link><Link to="/register">Create an account</Link></p></div></div></section>;
}
