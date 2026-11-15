# Phase 4: Staff dashboards walkthrough

## 1. What was built

- Doctors have a protected dashboard.
- Doctors can see their appointments and schedule.
- Doctors can open a visit and save notes or mark it complete.
- Receptionists have a dashboard for appointments, patients, and messages.
- Receptionists can filter appointments and start a walk-in booking.
- Administrators have reports, doctor, user, and settings screens.
- Server routes check the signed-in user's role.
- Important administrator changes can be written to an audit log.
- Clinic settings are stored in MongoDB and used by booking rules.

## 2. Try the dashboards

1. Start MongoDB.
2. Run `npm run dev` from the project folder.
3. Open the Vite address shown in the terminal.
4. Sign in with a seeded staff account.
5. Use the dashboard link in the top navigation.
6. Choose **Appointments**, **Patients**, or **Messages** from the left menu.
7. Sign out and sign in with the seeded doctor account.
8. Open **Doctor dashboard**, then open an appointment.
9. Save a note or mark the appointment complete.
10. Sign in as the administrator and open **Administration**.
11. Open **Doctors**, **Users**, or **Settings**.

The exact demo passwords are the values in the local seed configuration. They are for development only.

## 3. File map

### Server

- `server/src/models/AuditLog.js` stores administrator and staff actions.
- `server/src/models/Setting.js` stores runtime clinic settings.
- `server/src/services/settings.service.js` reads and updates runtime settings.
- `server/src/utils/audit.js` creates audit records.
- `server/src/services/doctor.service.js` handles doctor-owned data.
- `server/src/services/staff.service.js` handles receptionist data.
- `server/src/services/admin.service.js` handles administration data and reports.
- `server/src/controllers/doctor.controller.js` sends doctor responses.
- `server/src/controllers/staff.controller.js` sends receptionist responses.
- `server/src/controllers/admin.controller.js` sends administrator responses.
- `server/src/routes/doctor.routes.js` protects doctor endpoints.
- `server/src/routes/staff.routes.js` protects receptionist endpoints.
- `server/src/routes/admin.routes.js` protects administrator endpoints.
- `server/src/validators/doctor.js` validates doctor inputs.
- `server/src/validators/staff.js` validates receptionist inputs.
- `server/src/validators/admin.js` validates administrator inputs.
- `server/src/seed/seed.js` adds demo staff, doctor, settings, and history data.

### Client

- `client/src/api/dashboards.js` calls dashboard endpoints.
- `client/src/components/dashboards/DashboardLayout.jsx` provides the protected sidebar.
- `client/src/components/dashboards/DataTable.jsx` displays accessible tables.
- `client/src/components/dashboards/StatusBadge.jsx` displays appointment status.
- `client/src/components/dashboards/FilterBar.jsx` stores filters in the URL.
- `client/src/components/dashboards/Pagination.jsx` changes result pages.
- `client/src/components/dashboards/StatCard.jsx` displays totals.
- `client/src/components/dashboards/ConfirmDialog.jsx` provides a native confirmation dialog.
- `client/src/pages/doctor/` contains doctor screens.
- `client/src/pages/staff/` contains receptionist screens.
- `client/src/pages/admin/` contains administrator screens.
- `client/src/routes.jsx` connects roles to protected routes.

## 4. How a doctor request travels

1. The browser opens `/doctor/appointments`.
2. React Router selects `DoctorAppointments` in `client/src/routes.jsx`.
3. `useFetch` calls `getDoctorAppointments` in `client/src/api/dashboards.js`.
4. The API client sends `GET /api/v1/doctor/appointments` with cookies.
5. `doctor.routes.js` runs `requireAuth` and `requireRole('doctor')`.
6. `doctor.controller.js` calls `doctor.service.js`.
7. The service finds the `Doctor` record linked to `req.user._id`.
8. The service queries `Appointment` with that doctor ID.
9. Mongoose reads the matching records from MongoDB.
10. Express returns `{ data: [...] }`.
11. `useFetch` stores the data in React state.
12. `DataTable` renders the rows in the browser.

The ownership filter is important. A doctor cannot use their cookie to read another doctor's appointments.

## 5. Key ideas

### Role middleware

Role middleware is a gate before a route. It stops a user with the wrong role before the controller runs. This protects both the data and the user interface.

```js
router.use(requireAuth, requireRole('doctor'));
router.get('/appointments', validate(v.query), asyncHandler(controller.appointments));
router.get('/schedule', asyncHandler(controller.schedule));
```

### Audit logs

An audit log is a history of important changes. It helps an administrator answer who changed a record and when.

```js
export async function audit(req, action, resource, resourceId, details = {}) {
  await AuditLog.create({
    actorId: req.user._id, action, resource, resourceId, details
  });
}
```

### Runtime settings

Runtime settings are values that can change without changing source code. The booking and slot services read them before applying clinic rules.

```js
export async function getSettings() {
  const rows = await Setting.find({}).lean();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}
```

### Data tables

A data table gives staff a compact view of many records. The shared component keeps table headings and empty states consistent.

```jsx
<DataTable
  caption="My appointments"
  columns={[{ key: 'time', label: 'Time' }]}
  rows={rows}
  renderRow={(item) => <tr key={item._id}><td>{item.startAt}</td></tr>}
/>
```

## 6. How to test

Run:

```text
npm --prefix server run lint
npm --prefix server test -- --runInBand
npm --prefix client run lint
npm --prefix client run build
```

Expected results:

- Server lint exits with code 0.
- The server test suites pass.
- Client lint exits with code 0.
- Vite prints a successful production build.

Manual tests:

1. Sign in as a doctor and confirm the doctor dashboard opens.
2. Sign in as a receptionist and confirm appointments can be filtered.
3. Sign in as an administrator and change a runtime setting.
4. Try to open `/admin` while signed in as a patient. It should show the forbidden page.
5. Try to open a different doctor's appointment by changing its ID in the URL. The server should return a not-found or forbidden error.

## 7. Problems and limits

- The dashboard tests are not yet as extensive as the older booking tests.
- Some secondary screens are intentionally small placeholders. The main dashboard, list, detail, settings, and schedule flows are wired.
- The walk-in form currently expects IDs. A later usability pass should replace those fields with searchable patient, department, and doctor controls.
- Reports currently return summary counts and grouped appointment data. They are not yet exportable.
- Email delivery still uses the existing development transport unless production SMTP settings are supplied.
- Demo passwords must not be used in a real clinic.

## 8. Vocabulary

- **Role:** A label such as doctor or admin that controls access.
- **Middleware:** A function that runs between a request and its final handler.
- **Ownership:** A rule that lets a user access only records belonging to them.
- **Audit log:** A record of who changed what and when.
- **Runtime setting:** A configurable value read while the server is running.
- **Route:** A URL pattern handled by the server or browser.
- **Controller:** A function that turns a request into a response.
- **Service:** A function that contains reusable application rules.
- **Index:** A MongoDB structure that makes selected searches faster.
- **Pagination:** Showing a large list in smaller pages.

## 9. What comes next

The next phase should improve the walk-in form with searchable selectors, finish the secondary patient and message detail screens, add report charts and CSV export, and expand automated tests for role isolation, audit records, settings, schedule validation, and email notifications.
