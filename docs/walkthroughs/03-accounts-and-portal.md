# Serenova Accounts and Patient Portal

This guide explains Phase 3 in plain English. It describes the account system and the first patient portal.

## 1. Summary

- Patients can register with an email, password, phone, and date of birth.
- Patients can log in with an email address or patient ID.
- Short access sessions and longer refresh sessions use secure cookies.
- Passwords, refresh tokens, and reset tokens are stored safely.
- Failed logins can temporarily lock an account.
- Patients can see, cancel, and reschedule their own appointments.
- A guest booking can be added to an account with its private manage token.
- The portal includes dashboard, appointments, profile, and password-change pages.

## 2. What I can do now

Start the app:

```powershell
npm run seed
npm run dev
```

Open `http://localhost:5173`.

Create an account:

1. Click **Patient login**.
2. Click **Create an account**.
3. Enter the required details.
4. Use a password with at least 10 characters, one letter, and one number.
5. Accept the consent checkbox.
6. Submit the form.
7. The portal opens after registration.

Use the development demo account:

```text
Email: patient@serenova.example
Patient ID: SC-000001
Password: DemoPassword123!
```

1. Open **Patient login**.
2. Enter either the email or patient ID.
3. Enter the password.
4. Click **Log in**.
5. Open **My account**.
6. Use **My appointments** to view the seeded appointment.
7. Open the appointment to view, cancel, or reschedule it.
8. Use **Profile** to update contact details or change the password.

The seed also creates these development-only accounts:

```text
admin@serenova.example
reception@serenova.example
```

They are not given portal screens in this phase.

## 3. File map

### Server account files

- `server/src/config/env.js` - Reads account, cookie, lockout, and reset settings.
- `server/src/models/User.js` - Stores login identity and role.
- `server/src/models/Patient.js` - Stores patient profile and patient ID.
- `server/src/models/RefreshToken.js` - Stores hashed rotating sessions.
- `server/src/models/PasswordReset.js` - Stores hashed, expiring reset tokens.
- `server/src/services/auth.service.js` - Registers, logs in, refreshes, logs out, and resets passwords.
- `server/src/controllers/auth.controller.js` - Sets cookies and formats auth responses.
- `server/src/routes/auth.routes.js` - Defines account endpoints and rate limits.
- `server/src/validators/auth.js` - Checks account input.
- `server/src/middleware/auth.js` - Reads the access cookie and loads the user.
- `server/src/middleware/roles.js` - Checks the user's role.
- `server/src/middleware/csrf.js` - Checks the request header and origin.
- `server/src/services/patient.service.js` - Handles profiles and patient-owned visits.
- `server/src/controllers/patient.controller.js` - Formats portal API responses.
- `server/src/routes/me.routes.js` - Defines `/api/v1/me` endpoints.
- `server/src/validators/patient.js` - Checks portal input.

### Server booking and seed changes

- `server/src/models/Appointment.js` - Adds patient ownership and a patient/time index.
- `server/src/services/booking.service.js` - Reuses cancellation and rescheduling rules for patients.
- `server/src/controllers/booking.controller.js` - Links a logged-in booking to its patient.
- `server/src/routes/booking.routes.js` - Adds optional authentication to booking.
- `server/src/seed/seed.js` - Creates repeatable development demo accounts and one visit.
- `server/src/services/email.service.js` - Sends welcome and password-reset messages.

### Client account and portal files

- `client/src/api/client.js` - Sends cookies and the CSRF header and retries once after refresh.
- `client/src/api/auth.js` - Calls account endpoints.
- `client/src/api/portal.js` - Calls profile and appointment endpoints.
- `client/src/context/AuthContext.jsx` - Holds the current user and patient profile.
- `client/src/components/auth/RequireAuth.jsx` - Redirects logged-out users.
- `client/src/components/auth/RequireRole.jsx` - Blocks the wrong role.
- `client/src/components/layout/PortalLayout.jsx` - Provides portal navigation.
- `client/src/pages/Login.jsx` - Logs a patient in.
- `client/src/pages/Register.jsx` - Creates an account.
- `client/src/pages/ForgotPassword.jsx` - Requests a reset link.
- `client/src/pages/ResetPassword.jsx` - Sets a new password.
- `client/src/pages/Forbidden.jsx` - Shows an access-denied page.
- `client/src/pages/portal/Dashboard.jsx` - Shows the next and recent visits.
- `client/src/pages/portal/Appointments.jsx` - Lists, paginates, and claims visits.
- `client/src/pages/portal/AppointmentDetail.jsx` - Manages one visit.
- `client/src/pages/portal/Profile.jsx` - Edits profile and password.
- `client/src/pages/Appointment.jsx` - Prefills a logged-in patient's booking form.
- `client/src/routes.jsx` - Wires account and portal routes.
- `client/src/styles/style.css` - Appends the portal styles.

## 4. How a request travels

### Login and My appointments

1. The patient submits `Login.jsx`.
2. The page calls `login` in `client/src/context/AuthContext.jsx`.
3. That calls `login` in `client/src/api/auth.js`.
4. `client/src/api/client.js` sends `POST /api/v1/auth/login` with cookies and `X-Requested-With`.
5. `server/src/routes/auth.routes.js` validates and rate-limits the request.
6. `auth.controller.js` calls `auth.service.js`.
7. The service finds the `User` and `Patient` in MongoDB.
8. It compares the password with bcrypt.
9. It sets an `access` cookie and a `refresh` cookie.
10. The client stores the returned public user and patient data in `AuthContext`.
11. `RequireAuth` allows `/portal`.
12. `PortalLayout` renders `Dashboard` or `Appointments`.
13. `Appointments.jsx` calls `getAppointments` in `client/src/api/portal.js`.
14. `me.routes.js` runs `requireAuth` and `requireRole('patient')`.
15. `patient.controller.js` calls `patient.service.js`.
16. The service queries `Appointment` with the current patient's ID.
17. Mongoose asks MongoDB for only that patient's visits.
18. MongoDB returns populated doctor and department names.
19. The server returns `{ data: { appointments, page, pages } }`.
20. The React page renders the list.

### Refresh

If a normal API call returns `401`, `client/src/api/client.js` calls `POST /auth/refresh` once. The server hashes the refresh cookie, finds its database record, revokes it, creates a replacement in the same family, and sets new cookies.

If an old refresh cookie is used again, the server sees `revokedAt`. It revokes the rest of that token family and returns `401`. This treats reuse as possible token theft.

## 5. Key ideas

### Password hashing with bcrypt

Passwords are never stored as readable text. Bcrypt makes a slow password hash.

```js
const passwordHash = await bcrypt.hash(password, env.BCRYPT_COST);
const matches = await bcrypt.compare(password, passwordHash);
```

### JWT access cookies

The access token is short-lived. It identifies the user to protected routes.

```js
return jwt.sign(
  { sub: user._id.toString(), role: user.role },
  env.JWT_SECRET,
  { expiresIn: env.JWT_ACCESS_TTL }
);
```

### httpOnly and SameSite cookies

`httpOnly` prevents browser scripts from reading the token. `SameSite=Lax` reduces cross-site sending. The refresh cookie is limited to auth URLs.

```js
res.cookie('refresh', token, {
  httpOnly: true,
  sameSite: 'lax',
  path: '/api/v1/auth'
});
```

### Refresh rotation and reuse detection

Only a hash is stored. Each refresh replaces the old token.

```js
token.revokedAt = new Date();
const next = await issueRefresh(user, req, token.remember, token.family);
token.replacedBy = next.token._id;
await token.save();
```

### Account lockout

The fifth wrong password creates a short lock. The response does not reveal the correct account detail.

```js
user.failedLogins += 1;
if (user.failedLogins >= env.MAX_FAILED_LOGINS) {
  user.lockedUntil = new Date(Date.now() + env.LOCK_MINUTES * 60000);
  await user.save();
  throw new ApiError(423, 'ACCOUNT_LOCKED', 'Too many attempts. Try again in a few minutes.');
}
```

### Identical errors and timing

Unknown users still get a bcrypt comparison with a dummy hash. This makes email discovery harder.

```js
const passwordHash = user?.passwordHash || dummyPasswordHash;
const passwordMatches = await bcrypt.compare(password, passwordHash);
if (!user || !passwordMatches) {
  throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
}
```

### Roles and ownership

The route checks both the user's role and the appointment's patient ID. A different patient's appointment looks like a missing appointment.

```js
router.use(requireAuth, requireRole('patient'));
const appointment = await Appointment.findOne({ _id: id, patientId });
if (!appointment) throw new ApiError(404, 'NOT_FOUND', 'Appointment not found');
```

### CSRF protection

Cookie requests must include the application header. An origin, when sent, must match the configured client URL.

```js
if (req.get('x-requested-with') !== 'serenova') {
  return next(new ApiError(403, 'CSRF', 'Request origin is not allowed'));
}
```

### Hashed reset tokens

The email contains the random token. MongoDB stores only its SHA-256 hash and an expiry time.

```js
const raw = randomToken();
await PasswordReset.create({
  userId: user._id,
  tokenHash: hash(raw),
  expiresAt: new Date(Date.now() + env.RESET_TOKEN_MINUTES * 60000)
});
```

### React context and route guards

The context loads the session once. The guard redirects before protected pages render.

```jsx
if (auth.loading) return <Loading />;
if (!auth.user) return <Navigate to="/login" state={{ from: location }} />;
return children;
```

## 6. How to test it

Run the checks:

```powershell
npm --prefix server run lint
npm --prefix server test -- --runInBand
npm --prefix client run lint
npm --prefix client test
npm --prefix client run build
npm run seed
```

The current result is 4 server suites and 12 server tests passed. The client has 2 test files and 2 tests passed. Lint and the production build pass.

Manual tests:

1. Register a new patient account.
2. Log in with the email.
3. Log out and log in with the patient ID.
4. Open the seeded upcoming appointment.
5. Book a new appointment while logged in and confirm it belongs to the account.
6. Edit the profile and reload it.
7. Change the password and log in with the new password.
8. Use the guest-booking claim form with a valid reference and token.
9. Wrong password five times. This should return `ACCOUNT_LOCKED`.
10. Open another patient's appointment URL. This should return `404 NOT_FOUND`.
11. Reuse a reset link after it succeeds. This should return `INVALID_TOKEN`.
12. Send a mutating cookie request without `X-Requested-With: serenova`. This should return `403 CSRF`.

## 7. Problems and limits

- Email verification is not implemented. Email addresses are not proof of identity.
- Two-factor login, SMS, payments, family members, prescriptions, lab results, bills, and staff dashboards are not included.
- The portal has only the patient role. Doctor, receptionist, and admin screens remain future work.
- Development reset and welcome emails are saved as HTML when SMTP is not configured.
- The current automated suite still focuses mainly on the foundation and booking engine. Full auth integration coverage should be expanded before production.
- The session-expired dialog requested for a failed refresh is not yet a full global dialog flow.
- This is not ready for real patient data without production secrets, HTTPS, email delivery, monitoring, backups, audit logs, and a security review.

## 8. Vocabulary

- **Authentication:** Checking who a user is.
- **Authorization:** Checking what that user may do.
- **Cookie:** Small browser data sent with matching requests.
- **httpOnly:** A cookie setting that blocks JavaScript access.
- **JWT:** A signed data string used for a short session.
- **Refresh token:** A longer-lived secret used to create a new access session.
- **Hash:** A one-way transformation of a secret.
- **Bcrypt:** A deliberately slow password-hashing algorithm.
- **CSRF:** A trick that makes a browser send an unwanted cookie request.
- **Role:** A label such as patient or admin.
- **Ownership check:** A check that a record belongs to the current user.
- **Patient ID:** A clinic identifier such as `SC-000001`.
- **Lockout:** A temporary block after too many failed logins.
- **Token family:** The group of refresh tokens created by one login.
- **Rate limit:** A maximum number of requests in a time window.
- **TTL index:** A MongoDB rule that removes expired records.

## 9. What comes next

Prompt 4 can build doctor, receptionist, and admin dashboards on these foundations:

- Reuse `User.role` and `requireRole`.
- Reuse the appointment service and slot service.
- Add staff ownership and audit records.
- Add appointment status and notes workflows.
- Protect every staff query with role checks and explicit record filters.
- Keep the same `{ data }` and `{ error }` response shapes.
- Add stronger audit logging before staff can view or change patient data.
