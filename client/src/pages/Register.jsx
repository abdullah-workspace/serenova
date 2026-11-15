import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';
import FormField from '../components/ui/FormField.jsx';
import Toast from '../components/ui/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  usePageTitle('Create account'); const auth = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', dateOfBirth: '', password: '', confirmPassword: '', consent: false }); const [error, setError] = useState(''); const [fields, setFields] = useState({}); const [sending, setSending] = useState(false);
  function update(event) { const { name, value, checked, type } = event.target; setForm({ ...form, [name]: type === 'checkbox' ? checked : value }); }
  async function submit(event) { event.preventDefault(); setError(''); setFields({}); if (form.password !== form.confirmPassword) { setFields({ confirmPassword: 'Passwords do not match' }); return; } setSending(true); try { await auth.register(form); navigate('/portal', { replace: true }); } catch (requestError) { setError(requestError.message); setFields(requestError.fields); } finally { setSending(false); } }
  return <section className="section section--compact"><Toast message={error || fields.confirmPassword} onClose={() => { setError(''); setFields({}); }} /><div className="container login-wrap"><div className="login-panel"><h1>Create your patient account</h1><form onSubmit={submit}><div className="form-grid">
    <FormField id="full-name" label="Full name" required error={fields.fullName}>{({ id }) => <input id={id} name="fullName" value={form.fullName} onChange={update} required />}</FormField>
    <FormField id="email" label="Email" required error={fields.email}>{({ id }) => <input type="email" id={id} name="email" value={form.email} onChange={update} required />}</FormField>
    <FormField id="phone" label="Phone" required error={fields.phone}>{({ id }) => <input type="tel" id={id} name="phone" value={form.phone} onChange={update} required />}</FormField>
    <FormField id="dob" label="Date of birth" required error={fields.dateOfBirth}>{({ id }) => <input type="date" id={id} name="dateOfBirth" value={form.dateOfBirth} onChange={update} required />}</FormField>
    <FormField id="password" label="Password" required hint="Use 10 to 72 characters with at least one letter and one number." error={fields.password}>{({ id }) => <input type="password" id={id} name="password" value={form.password} onChange={update} required />}</FormField>
    <FormField id="confirm-password" label="Confirm password" required error={fields.confirmPassword}>{({ id }) => <input type="password" id={id} name="confirmPassword" value={form.confirmPassword} onChange={update} required />}</FormField>
    <label className="check"><input type="checkbox" name="consent" checked={form.consent} onChange={update} /> I agree that Serenova may contact me.</label>
    <button className="btn btn-primary btn-block" disabled={sending}>{sending ? 'Creating…' : 'Create account'}</button></div></form><p className="login-links"><Link to="/login">Already have an account? Log in</Link></p></div></div></section>;
}
