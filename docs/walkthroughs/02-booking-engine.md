# Serenova Booking Engine Walkthrough

This guide explains the booking work in plain English. It assumes that the foundation guide has already been read.

## 1. Summary

- Visitors can choose a department, doctor, date, and open time.
- The server checks the doctor schedule before it accepts a booking.
- Times are shown in the clinic timezone, `Asia/Karachi`.
- Appointment times are stored in MongoDB as UTC dates.
- A booking gets a readable reference such as `APT-2026-00001`.
- Visitors can look up, cancel, or reschedule a booking with a private manage token.
- Development emails are saved as HTML files when SMTP is not configured.
- The home page, doctor pages, department pages, and contact form now use live API data.

## 2. What I can do now

### Book an appointment

1. Start MongoDB.
2. In the project folder, run `npm run dev`.
3. Open the client URL shown by Vite, usually `http://localhost:5173`.
4. Click **Book an appointment**.
5. Choose a department.
6. Choose a doctor.
7. Choose a future date.
8. Choose one of the displayed time buttons.
9. Enter your name, phone, email, date of birth, and reason.
10. Tick the consent checkbox.
11. Click **Request appointment**.
12. The confirmation page shows the reference and a manage link.

### Start from today's availability

1. Open the home page.
2. Find the availability section.
3. Click an open time under a doctor.
4. The booking page opens with the doctor, date, and time already selected.

### Manage a booking

1. Open **Manage booking** from the navigation or confirmation page.
2. Enter the appointment reference.
3. Enter the manage token from the confirmation page.
4. Click **Find booking**.
5. Review the appointment details.
6. Use **Cancel** to cancel it, or choose another open time and use **Reschedule**.

### View live content

1. Click **Doctors** and open a doctor profile.
2. Click a department or service to see its detail page.
3. Open **Contact**, complete the form, and submit it.
4. In development, the contact message is saved by the server.

## 3. File map

### Server configuration and entry points

- `server/src/app.js` - Creates the Express app and mounts middleware and routes.
- `server/src/server.js` - Connects to MongoDB and starts the HTTP server.
- `server/src/config/env.js` - Reads environment settings and booking limits.
- `server/src/config/db.js` - Opens the Mongoose database connection.

### Server models

- `server/src/models/Appointment.js` - Stores booking details and the double-booking index.
- `server/src/models/Counter.js` - Stores the yearly appointment-number counter.
- `server/src/models/ContactMessage.js` - Stores contact form messages.
- `server/src/models/Doctor.js` - Stores doctors and their slot length.
- `server/src/models/Department.js` - Stores departments.
- `server/src/models/Schedule.js` - Stores weekly hours, breaks, and days off.

### Server booking code

- `server/src/services/slots.service.js` - Builds open slots and removes unavailable ones.
- `server/src/services/booking.service.js` - Creates, finds, cancels, and reschedules bookings.
- `server/src/services/email.service.js` - Sends SMTP mail or saves development mail files.
- `server/src/controllers/booking.controller.js` - Converts booking results into HTTP responses.
- `server/src/controllers/contact.controller.js` - Handles contact submissions.
- `server/src/routes/booking.routes.js` - Defines booking, lookup, cancel, and reschedule endpoints.
- `server/src/routes/availability.routes.js` - Defines the live availability endpoint.
- `server/src/routes/contact.routes.js` - Defines the contact endpoint.
- `server/src/validators/appointments.js` - Checks appointment input.
- `server/src/middleware/validate.js` - Runs Zod validation and formats errors.
- `server/src/middleware/rateLimit.js` - Limits repeated requests.
- `server/src/seed/data.js` - Contains sample doctors, departments, and schedules.
- `server/src/seed/seed.js` - Loads the sample data into MongoDB.

### Client API and shared components

- `client/src/api/client.js` - Sends requests and keeps the common error shape.
- `client/src/api/appointments.js` - Calls booking and manage endpoints.
- `client/src/api/availability.js` - Calls today's availability endpoint.
- `client/src/api/contact.js` - Sends contact messages.
- `client/src/api/doctors.js` - Loads doctors, profiles, and slots.
- `client/src/utils/date.js` - Formats dates for the clinic timezone.
- `client/src/components/ui/FormField.jsx` - Provides labels, hints, and field errors.
- `client/src/components/ui/SlotChips.jsx` - Displays keyboard-friendly time choices.
- `client/src/components/ui/BookingSummary.jsx` - Displays appointment details.
- `client/src/components/ui/Notice.jsx` - Displays status messages.

### Client pages and tests

- `client/src/pages/Appointment.jsx` - Shows the booking form and submits it.
- `client/src/pages/BookingConfirmed.jsx` - Shows a successful booking.
- `client/src/pages/ManageBooking.jsx` - Looks up, cancels, and reschedules bookings.
- `client/src/pages/Home.jsx` - Shows today's available times.
- `client/src/pages/Contact.jsx` - Sends the contact form.
- `client/src/pages/Doctors.jsx` - Lists doctors.
- `client/src/pages/DoctorProfile.jsx` - Shows one doctor's details and slots.
- `client/src/pages/Services.jsx` - Lists departments.
- `client/src/pages/ServiceDetail.jsx` - Shows one department and its doctors.
- `client/src/routes.jsx` - Connects browser URLs to page components.
- `server/tests/booking.test.js` - Tests the booking API and its important failure cases.
- `client/src/tests/SlotChips.test.jsx` - Tests keyboard selection of a slot.

## 4. How a request travels

Here is the path for “open the Doctors page”.

1. The browser visits `/doctors`.
2. `client/src/routes.jsx` matches that URL to `Doctors`.
3. `client/src/pages/Doctors.jsx` calls the doctors API helper.
4. `client/src/api/doctors.js` sends `GET /api/doctors`.
5. `server/src/routes/doctors.routes.js` receives the request.
6. The route calls the doctors controller in `server/src/controllers/doctors.controller.js`.
7. The controller calls the doctors service in `server/src/services/doctors.service.js`.
8. The service uses the `Doctor` Mongoose model in `server/src/models/Doctor.js`.
9. Mongoose sends a query to MongoDB.
10. MongoDB returns doctor documents.
11. The service and controller return `{ data: ... }`.
12. The client API helper reads the JSON response.
13. `Doctors.jsx` stores the data and renders the doctor cards.
14. The browser paints the page.

The booking path is similar, but `Appointment.jsx` first asks for slots. The slot service reads the doctor schedule and existing appointments. On submit, the booking service checks the slot again before saving it. This second check matters because another visitor could book the slot between the first check and the submit.

## 5. Key ideas explained

### Slot generation

**What it is:** A function that turns working hours into selectable times.

**Why it is used here:** Visitors must see only real, future, unused times.

Important code from `server/src/services/slots.service.js`:

```js
const step = doctor.slotMinutes || 30;
let cursor = localDateTime(date, weekly.start);
const finish = localDateTime(date, weekly.end);
const nowWithNotice = DateTime.utc().plus({ hours: env.MIN_NOTICE_HOURS });
while (cursor.plus({ minutes: step }) <= finish) {
  const slotEnd = cursor.plus({ minutes: step });
  if (!isWithinBreak(cursor.toFormat('HH:mm'), weekly.breaks)
      && cursor.toUTC() >= nowWithNotice) {
    slots.push({
      startAt: cursor.toUTC().toISO(),
      endAt: slotEnd.toUTC().toISO()
    });
  }
  cursor = slotEnd;
}
```

### Double-booking protection

**What it is:** A database rule that prevents two pending or confirmed appointments from using the same doctor and time.

**Why it is used here:** Two requests can arrive at almost the same moment. A normal availability check alone cannot close that race.

`server/src/models/Appointment.js` uses a partial unique index. The booking service turns MongoDB duplicate-key error `11000` into a clear `SLOT_TAKEN` response.

### Manage tokens

**What it is:** A random secret that proves a visitor may manage a guest booking.

**Why it is used here:** Guest visitors need access without creating an account.

```js
const manageToken = crypto.randomBytes(32).toString('hex');
cancelTokenHash: hashToken(manageToken)
```

Only the hash is stored. The original token is returned once after booking. Lookup, cancellation, and rescheduling compare hashes with `timingSafeEqual`.

### API response shape

**What it is:** The same wrapper used for successful and failed responses.

**Why it is used here:** The client can handle every endpoint in the same way.

```json
{ "data": { "reference": "APT-2026-00001" } }
```

```json
{
  "error": {
    "code": "SLOT_TAKEN",
    "message": "That time was just taken, please choose another."
  }
}
```

Validation errors may also include `fields`, with one message for each invalid field.

### React Router

**What it is:** The client library that maps URLs to React pages.

**Why it is used here:** The browser can move between booking, confirmation, profiles, and management pages without full page reloads.

The important routes are declared in `client/src/routes.jsx`, including `/appointment`, `/appointment/confirmed/:reference`, and `/manage-booking`.

### The `useFetch` hook

**What it is:** A shared React hook for loading data, tracking loading state, and tracking errors.

**Why it is used here:** Pages such as the booking page and doctor profile need the same request states.

```js
const slotState = useFetch(
  () => doctorId && date ? getDoctorSlots(doctorId, date) : Promise.resolve(null),
  [doctorId, date, reloadSlots]
);

if (slotState.loading) return <Loading />;
if (slotState.error) return <ErrorMessage message={slotState.error.message} />;
```

## 6. How to test it

Run these commands from the project folder:

```powershell
npm --prefix server test -- --runInBand
npm --prefix client test
npm --prefix server run lint
npm --prefix client run lint
npm --prefix client run build
npm test
```

The server suite should report 4 suites and 12 tests passed. The client suite should report 2 tests passed. Lint should finish without errors. The client build should create the Vite production output.

Manual tests:

1. Book a valid future slot and confirm that a reference appears.
2. Open the confirmation manage link and look up the booking.
3. Cancel the booking, then confirm that it is no longer available for management.
4. Reschedule a booking to another open slot and confirm the new time.
5. Try to submit the booking form without choosing a time. It should fail with a field error and should not create an appointment.
6. Try an incorrect manage token. It should show the same not-found style response as an unknown booking.
7. If SMTP is not configured, check `server/tmp/emails` for the saved HTML messages.

## 7. Problems and limits

- Email delivery is not configured by default. Development email is saved to files instead.
- The guest manage token is shown only in the confirmation flow. Losing it requires clinic help.
- Authentication, patient accounts, staff tools, invoices, prescriptions, and lab results are still future work.
- Some legacy page sections are shorter than the original static HTML.
- The client currently uses the clinic date helpers and the server is the final authority for timezone and booking rules.
- The home page shows a small selection of today's availability, not every doctor and every slot.
- Email sending is deliberately non-blocking. A mail failure does not undo a successful database booking.

## 8. Vocabulary

- **API:** A set of URLs that lets the browser talk to the server.
- **Appointment:** One saved visit request with a patient, doctor, and time.
- **UTC:** A standard time format used for storing exact moments.
- **Clinic timezone:** The local timezone used to interpret dates and working hours.
- **Slot:** One available appointment interval.
- **Index:** A MongoDB rule that helps search or prevents duplicate data.
- **Token:** A secret value used to prove access.
- **Hash:** A one-way transformation used to store a secret safely.
- **Rate limit:** A rule that limits how often one client can call an endpoint.
- **Validation:** Checking that input has the required format and values.
- **Reschedule:** Moving an appointment to a different open time.
- **SMTP:** The standard system used to send email.

## 9. What comes next

The booking code gives the patient portal a useful base:

- The portal can reuse the appointment data and status values.
- Authenticated patients can replace the temporary guest token as the owner check.
- Patient accounts can be linked to existing guest appointments when identity is verified.
- The same service, controller, route, validation, and response layers can be extended.
- Portal pages can reuse `BookingSummary`, loading states, notices, and API error handling.
- New access rules must ensure that one patient cannot view another patient's appointment.
