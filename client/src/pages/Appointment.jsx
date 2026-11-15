import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createAppointment } from '../api/appointments.js';
import { getDepartment } from '../api/departments.js';
import { getDepartments } from '../api/departments.js';
import { getDoctor, getDoctorSlots } from '../api/doctors.js';
import { useFetch } from '../hooks/useFetch.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import Loading from '../components/ui/Loading.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import FormField from '../components/ui/FormField.jsx';
import SlotChips from '../components/ui/SlotChips.jsx';
import Notice from '../components/ui/Notice.jsx';
import Toast from '../components/ui/Toast.jsx';
import { clinicDateFromIso, dateAfter, todayInClinic } from '../utils/date.js';
import { useAuth } from '../context/AuthContext.jsx';

function initialErrors() {
  return {};
}

export default function Appointment() {
  usePageTitle('Book appointment');
  const navigate = useNavigate();
  const { user, patient } = useAuth();
  const [searchParams] = useSearchParams();
  const summaryRef = useRef(null);
  const prefillDoctor = searchParams.get('doctor') || '';
  const prefillSlot = searchParams.get('slot') || '';
  const [departmentSlug, setDepartmentSlug] = useState(searchParams.get('department') || '');
  const [doctorId, setDoctorId] = useState(prefillDoctor);
  const [date, setDate] = useState(prefillSlot ? clinicDateFromIso(prefillSlot) : '');
  const [slot, setSlot] = useState(prefillSlot);
  const [visitType, setVisitType] = useState('new');
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    reason: '',
    consent: false
  });
  const [errors, setErrors] = useState(initialErrors);
  const [submitError, setSubmitError] = useState('');
  const [sending, setSending] = useState(false);
  const [reloadSlots, setReloadSlots] = useState(0);

  useEffect(() => {
    if (user && patient) {
      setForm((current) => ({
        ...current,
        fullName: current.fullName || patient.fullName || '',
        phone: current.phone || patient.phone || '',
        email: current.email || user.email || '',
        dateOfBirth: current.dateOfBirth || patient.dateOfBirth || ''
      }));
    }
  }, [user, patient]);

  useEffect(() => {
    if (!departmentSlug && prefillDoctor) {
      getDoctor(prefillDoctor).then((doctor) => setDepartmentSlug(doctor.departmentId.slug)).catch(() => {});
    }
  }, [departmentSlug, prefillDoctor]);

  const departmentState = useFetch(
    () => departmentSlug ? getDepartment(departmentSlug) : Promise.resolve(null),
    [departmentSlug]
  );
  const departmentsState = useFetch(getDepartments, []);
  const slotState = useFetch(
    () => doctorId && date ? getDoctorSlots(doctorId, date) : Promise.resolve(null),
    [doctorId, date, reloadSlots]
  );
  const doctors = departmentState.data?.doctors || [];
  const availableSlots = slotState.data?.slots || [];
  const popupError = submitError || Object.values(errors)[0] || '';

  useEffect(() => {
    if (prefillSlot && availableSlots.some((item) => item.startAt === prefillSlot)) setSlot(prefillSlot);
    if (slot && !availableSlots.some((item) => item.startAt === slot)) setSlot('');
  }, [availableSlots, prefillSlot, slot]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function validate() {
    const next = {};
    if (departmentSlug === '' || !departmentState.data) next.departmentId = 'Choose a department';
    if (doctorId === '') next.doctorId = 'Choose a doctor';
    if (!date) next.date = 'Choose a preferred date';
    if (!slot) next.startAt = 'Choose an open time';
    if (form.fullName.trim().length < 2) next.fullName = 'Enter your full name';
    if (!/^[\d\s+()[\]-]{7,20}$/.test(form.phone)) next.phone = 'Enter a phone number we can reach you on';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.dateOfBirth || new Date(form.dateOfBirth) >= new Date()) next.dateOfBirth = 'Enter your date of birth';
    if (!form.consent) next.consent = 'Please agree that the clinic may call you';
    setErrors(next);
    if (Object.keys(next).length) summaryRef.current?.focus();
    return next;
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitError('');
    if (Object.keys(validate()).length) return;
    setSending(true);
    try {
      const booking = await createAppointment({
        visitType,
        departmentId: departmentState.data._id,
        doctorId,
        startAt: slot,
        ...form
      });
      navigate(`/appointment/confirmed/${booking.reference}`, { state: booking });
    } catch (error) {
      if (error.code === 'SLOT_TAKEN' || error.code === 'SLOT_UNAVAILABLE') {
        setSlot('');
        setSubmitError(error.message);
        setReloadSlots((value) => value + 1);
      } else if (error.code === 'VALIDATION') {
        setErrors(error.fields);
        summaryRef.current?.focus();
      } else {
        setSubmitError(error.message);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Toast message={popupError} onClose={() => { setSubmitError(''); setErrors({}); }} />
      <section className="page-hero"><div className="container">
        <h1>Book an appointment</h1>
        <p className="lede">Tell us what you need and when you are free. We will call you within one working day to confirm.</p>
      </div></section>
      <section className="section"><div className="container split split--form">
        <form onSubmit={submit} noValidate>
          <div className="note form-note"><p><strong>Is this an emergency?</strong> Do not use this form. Call <a href="tel:+924211100911">(042) 111-000-911</a> now.</p></div>
          {(Object.keys(errors).length > 0 || submitError) && (
            <div className="error-summary" tabIndex="-1" ref={summaryRef}>
              <strong>Check the highlighted fields.</strong>
              {submitError && <p>{submitError}</p>}
            </div>
          )}
          {user && patient && <Notice>Booking as {patient.fullName}. You can still edit these details for this visit.</Notice>}
          <fieldset>
            <legend>Visit details</legend>
            <div className="form-grid">
              <div className="field">
                <span className="field-label">Have you visited Serenova before?</span>
                <div className="pick-group" role="radiogroup" aria-label="Visit type">
                  {['new', 'returning'].map((value) => <div className="pick pick--wide" key={value}>
                    <input type="radio" id={`visit-${value}`} name="visitType" value={value} checked={visitType === value} onChange={() => setVisitType(value)} />
                    <label htmlFor={`visit-${value}`}>{value === 'new' ? 'New patient' : 'Returning patient'}</label>
                  </div>)}
                </div>
              </div>
              <FormField id="department" label="Department" required error={errors.departmentId}>
                {({ id, describedBy, invalid }) => <select id={id} value={departmentSlug} aria-describedby={describedBy} aria-invalid={invalid} onChange={(event) => { setDepartmentSlug(event.target.value); setDoctorId(''); setSlot(''); }} required><option value="">Choose a department</option>{departmentsState.loading ? <option>Loading…</option> : departmentsState.data?.map((department) => <option value={department.slug} key={department._id}>{department.name}</option>)}</select>}
              </FormField>
              <FormField id="doctor" label="Preferred doctor" required error={errors.doctorId}>
                {({ id, describedBy, invalid }) => <select id={id} value={doctorId} aria-describedby={describedBy} aria-invalid={invalid} onChange={(event) => { setDoctorId(event.target.value); setSlot(''); }} required><option value="">Choose a doctor</option>{doctors.map((doctor) => <option value={doctor._id} key={doctor._id}>{doctor.name}, {doctor.specialty}</option>)}</select>}
              </FormField>
            </div>
          </fieldset>
          <fieldset>
            <legend>Your details</legend>
            <div className="form-grid">
              <FormField id="full-name" label="Full name" required error={errors.fullName}>
                {({ id, describedBy, invalid }) => <input id={id} name="fullName" value={form.fullName} onChange={updateField} aria-describedby={describedBy} aria-invalid={invalid} autoComplete="name" />}
              </FormField>
              <FormField id="phone" label="Phone number" required hint="We will call this number to confirm." error={errors.phone}>
                {({ id, describedBy, invalid }) => <input type="tel" id={id} name="phone" value={form.phone} onChange={updateField} aria-describedby={describedBy} aria-invalid={invalid} autoComplete="tel" />}
              </FormField>
              <FormField id="email" label="Email" required error={errors.email}>
                {({ id, describedBy, invalid }) => <input type="email" id={id} name="email" value={form.email} onChange={updateField} aria-describedby={describedBy} aria-invalid={invalid} autoComplete="email" />}
              </FormField>
              <FormField id="dob" label="Date of birth" required error={errors.dateOfBirth}>
                {({ id, describedBy, invalid }) => <input type="date" id={id} name="dateOfBirth" value={form.dateOfBirth} onChange={updateField} aria-describedby={describedBy} aria-invalid={invalid} />}
              </FormField>
            </div>
          </fieldset>
          <fieldset>
            <legend>Date and time</legend>
            <FormField id="visit-date" label="Preferred date" required error={errors.date}>
              {({ id, describedBy, invalid }) => <input type="date" id={id} value={date} min={todayInClinic()} max={dateAfter(60)} onChange={(event) => { setDate(event.target.value); setSlot(''); }} aria-describedby={describedBy} aria-invalid={invalid} />}
            </FormField>
            <div aria-live="polite">
              {slotState.loading && doctorId && date && <Loading />}
              {slotState.error && <ErrorMessage message={slotState.error.message} />}
              {!slotState.loading && doctorId && date && availableSlots.length === 0 && <EmptyState message="No open times that day. Try another date." />}
              {availableSlots.length > 0 && <SlotChips slots={availableSlots} value={slot} onChange={setSlot} />}
              {errors.startAt && <p className="field-error" role="alert">{errors.startAt}</p>}
            </div>
          </fieldset>
          <fieldset>
            <legend>Reason for visit</legend>
            <FormField id="reason" label="What would you like to see the doctor about?" hint="A few words is enough. The doctor will ask for more during your visit." error={errors.reason}>
              {({ id, describedBy, invalid }) => <textarea id={id} name="reason" value={form.reason} onChange={updateField} maxLength="500" aria-describedby={describedBy} aria-invalid={invalid} />}
            </FormField>
            <div className="check">
              <input type="checkbox" id="consent" name="consent" checked={form.consent} onChange={updateField} aria-invalid={Boolean(errors.consent)} />
              <label htmlFor="consent">I agree that Serenova Clinic may call me about this request. <span className="req">required</span></label>
              {errors.consent && <p className="field-error" role="alert">{errors.consent}</p>}
            </div>
          </fieldset>
          <button className="btn btn-primary" type="submit" disabled={sending}>{sending ? 'Saving…' : 'Request appointment'}</button>
        </form>
        <aside className="aside-panel" aria-label="Before your visit">
          <h2>Bring with you</h2><ul className="tick"><li>A photo ID</li><li>Earlier reports and scans</li><li>A list of the medicines you take</li><li>Your insurance card, if you have one</li></ul>
          <h2>Clinic hours</h2><p>Monday to Saturday, 8am to 9pm.<br />Closed on Sundays. Emergency care is always open.</p>
        </aside>
      </div></section>
    </>
  );
}
