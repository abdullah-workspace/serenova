import { useState } from 'react';
import { sendContactMessage } from '../api/contact.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import FormField from '../components/ui/FormField.jsx';
import Notice from '../components/ui/Notice.jsx';

export default function Contact() {
  usePageTitle('Contact');
  const [form, setForm] = useState({ name: '', email: '', subject: 'General question', message: '' });
  const [notice, setNotice] = useState(null);
  const [sending, setSending] = useState(false);
  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }
  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setNotice(null);
    try {
      await sendContactMessage(form);
      setForm({ name: '', email: '', subject: 'General question', message: '' });
      setNotice({ tone: 'info', text: 'Your message has been received.' });
    } catch (error) {
      setNotice({ tone: 'error', text: error.message });
    } finally {
      setSending(false);
    }
  }
  return <><section className="page-hero"><div className="container"><h1>Contact us</h1><p className="lede">Call, write or visit. The care desk answers calls from 8am to 9pm, Monday to Saturday.</p></div></section><section className="section"><div className="container split">
    <div><dl className="contact-list"><div><dt>Care desk</dt><dd><a href="tel:+924211100123">(042) 111-000-123</a></dd></div><div><dt>Emergency, 24 hours</dt><dd><a className="emergency" href="tel:+924211100911">(042) 111-000-911</a></dd></div><div><dt>Email</dt><dd><a href="mailto:hello@serenova.example">hello@serenova.example</a></dd></div><div><dt>Address</dt><dd>14 Garden Avenue, Model Town, Lahore</dd></div></dl><h2>Opening hours</h2><table className="table"><tbody><tr><th>Monday to Saturday</th><td>8am to 9pm</td></tr><tr><th>Sunday</th><td>Closed</td></tr></tbody></table></div>
    <form onSubmit={submit}><fieldset><legend>Send us a message</legend><div className="form-grid">
      <FormField id="contact-name" label="Your name" required>{({ id, describedBy }) => <input id={id} name="name" value={form.name} onChange={update} aria-describedby={describedBy} required />}</FormField>
      <FormField id="contact-email" label="Email" required>{({ id, describedBy }) => <input type="email" id={id} name="email" value={form.email} onChange={update} aria-describedby={describedBy} required />}</FormField>
      <FormField id="contact-subject" label="Subject">{({ id }) => <select id={id} name="subject" value={form.subject} onChange={update}><option>General question</option><option>Appointments</option><option>Test results</option><option>Billing and insurance</option><option>Feedback</option></select>}</FormField>
      <FormField id="contact-message" label="Message" required hint="Please do not send urgent medical problems here.">{({ id, describedBy }) => <textarea id={id} name="message" value={form.message} onChange={update} aria-describedby={describedBy} required />}</FormField>
      <button className="btn btn-primary" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send message'}</button>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
    </div></fieldset></form>
  </div></section></>;
}
