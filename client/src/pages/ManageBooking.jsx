import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cancelAppointment, lookupAppointment, rescheduleAppointment } from '../api/appointments.js';
import { getDoctorSlots } from '../api/doctors.js';
import { useFetch } from '../hooks/useFetch.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import BookingSummary from '../components/ui/BookingSummary.jsx';
import SlotChips from '../components/ui/SlotChips.jsx';
import Notice from '../components/ui/Notice.jsx';
import Loading from '../components/ui/Loading.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { dateAfter, todayInClinic } from '../utils/date.js';

export default function ManageBooking() {
  usePageTitle('Manage appointment');
  const [params] = useSearchParams();
  const reference = params.get('ref') || '';
  const token = params.get('token') || '';
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [notice, setNotice] = useState(null);
  const [booking, setBooking] = useState(null);
  const bookingState = useFetch(
    () => reference && token ? lookupAppointment(reference, token) : Promise.reject(new Error('Missing booking link')),
    [reference, token]
  );
  const slotState = useFetch(
    () => booking && date ? getDoctorSlots(booking.doctor.id || booking.doctor._id, date) : Promise.resolve(null),
    [booking, date]
  );
  const slots = slotState.data?.slots || [];
  useEffect(() => {
    if (bookingState.data) setBooking(bookingState.data);
  }, [bookingState.data]);

  async function cancel() {
    try {
      const booking = await cancelAppointment(reference, token, reason);
      setBooking(booking);
      setNotice({ tone: 'info', text: 'Your appointment has been cancelled.' });
      setAction('');
    } catch (error) {
      setNotice({ tone: 'error', text: error.message });
    }
  }

  async function reschedule() {
    if (!slot) return;
    try {
      const booking = await rescheduleAppointment(reference, token, slot);
      setBooking(booking);
      setNotice({ tone: 'info', text: 'Your appointment has been rescheduled.' });
      setAction('');
    } catch (error) {
      setNotice({ tone: 'error', text: error.message });
    }
  }

  if (bookingState.loading) return <section className="section"><div className="container"><h1>Manage appointment</h1><Loading /></div></section>;
  return <section className="section"><div className="container split">
    <div>
      <h1>Manage appointment</h1>
      {bookingState.error && <ErrorMessage message="This link is invalid or has expired." />}
      {booking && <><BookingSummary booking={booking} />{notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
        {booking.status !== 'cancelled' && <div className="actions"><button className="btn btn-secondary" type="button" onClick={() => setAction('cancel')}>Cancel</button><button className="btn btn-secondary" type="button" onClick={() => setAction('reschedule')}>Reschedule</button></div>}
        {action === 'cancel' && <div className="note"><h2>Cancel this appointment?</h2><label htmlFor="cancel-reason">Reason (optional)</label><textarea id="cancel-reason" value={reason} onChange={(event) => setReason(event.target.value)} /><div className="actions"><button className="btn btn-primary" type="button" onClick={cancel}>Confirm cancellation</button><button className="btn btn-secondary" type="button" onClick={() => setAction('')}>Keep appointment</button></div></div>}
        {action === 'reschedule' && <div className="note"><h2>Choose a new time</h2><label htmlFor="reschedule-date">New date</label><input id="reschedule-date" type="date" min={todayInClinic()} max={dateAfter(60)} value={date} onChange={(event) => { setDate(event.target.value); setSlot(''); }} />{slotState.loading && date && <Loading />}{slotState.error && <ErrorMessage message={slotState.error.message} />}{date && !slotState.loading && slots.length === 0 && <EmptyState message="No open times that day. Try another date." />}{slots.length > 0 && <SlotChips slots={slots} value={slot} onChange={setSlot} />}<button className="btn btn-primary" type="button" disabled={!slot} onClick={reschedule}>Confirm new time</button></div>}
      </>}
    </div>
  </div></section>;
}
