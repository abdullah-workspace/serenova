# Serenova Clinic foundation walkthrough

This guide explains the first working slice of Serenova Clinic. It assumes that you
are learning web development and have Node.js, MongoDB, and a code editor installed.

## 1. Summary

- The project now has a Node.js server and a React browser app.
- The server uses Express to expose a versioned API at `/api/v1`.
- MongoDB stores departments, doctors, and weekly schedules.
- A repeatable seed script inserts the eight departments and eight doctors from the
  original HTML website.
- The browser app uses React Router for the public pages and future portal routes.
- The Services and Doctors pages load their lists from the server API.
- Shared layout pieces keep the emergency strip, header, navigation, skip link, and
  footer consistent.
- Tests, lint commands, a production build, CI configuration, and setup notes are
  included.

## 2. What I can do now

### Start the project

1. Open a terminal in the project folder.
2. Make sure the local MongoDB service is running.
3. Run `npm install`.
4. Run `npm --prefix server install`.
5. Run `npm --prefix client install`.
6. Run `npm run seed`.
7. Run `npm run dev`.
8. Open `http://localhost:5173`.

The `dev` command starts the server and the browser app together. The server uses
port 5000. The browser app uses port 5173.

### Try the working pages

1. Click **Home**. You can see the clinic introduction and sample appointment
   times.
2. Click **About**. You can read the clinic values.
3. Click **Services**. Wait for the list to load from MongoDB. Click a jump link to
   move to a department.
4. Click **Doctors**. Wait for the doctor list to load from MongoDB.
5. Open `/doctors?department=cardiology` in the address bar. Only cardiology
   doctors should be shown.
6. Click **Book appointment**. Fill in the required fields and submit. The page
   shows “Saving arrives in the next phase.” It does not save anything yet.
7. Click **Contact**. Fill in the form and submit. It shows the same temporary
   notice.
8. Click **Patient login**. The login form is visible, but real login is not
   implemented yet.
9. Resize the browser or open developer tools and use a narrow phone viewport.
   The copied CSS supplies the mobile layout and CSS-only menu.
10. Open `http://localhost:5000/api/v1/health`. You should see a JSON response with
    `"status":"ok"` and, when MongoDB is available, `"db":"connected"`.

## 3. File map

Files inside `node_modules`, `dist`, and the existing `legacy-html` folder are not
listed here. They are dependencies, build output, or source material rather than
files created for the foundation.

### Project root

- `.editorconfig` — Shared editor settings.
- `.gitignore` — Keeps dependencies, secrets, builds, coverage, and Mongo data out
  of version control.
- `.prettierrc` — Formatting rules: single quotes, semicolons, and 100 columns.
- `docker-compose.yml` — Optional future MongoDB and Mailpit services; it is not
  required for the local setup.
- `package.json` — Root commands for development, seeding, and testing.
- `package-lock.json` — Exact versions for root dependencies.
- `README.md` — Short setup instructions.
- `.github/workflows/ci.yml` — Runs install, lint, and test commands on pushes and
  pull requests.

### `server/`

- `.env.example` — Example server environment values.
- `.eslintrc.cjs` — Server lint rules.
- `jest.config.js` — Jest test environment and setup file.
- `package.json` — Server dependencies and scripts.
- `package-lock.json` — Exact versions for server dependencies.

### `server/src/`

- `app.js` — Builds and exports the Express app without opening a port.
- `server.js` — Connects to MongoDB, then starts the HTTP server.

#### `server/src/config/`

- `env.js` — Loads environment variables and checks their shape with Zod.
- `db.js` — Opens the Mongoose connection and reports its status.

#### `server/src/models/`

- `Department.js` — Department schema and model.
- `Doctor.js` — Doctor schema, department reference, and text index.
- `Schedule.js` — Weekly hours and days-off schema.
- `User.js` — Later-phase placeholder.
- `Patient.js` — Later-phase placeholder.
- `Appointment.js` — Later-phase placeholder.
- `ContactMessage.js` — Later-phase placeholder.
- `LabResult.js` — Later-phase placeholder.
- `Prescription.js` — Later-phase placeholder.
- `Invoice.js` — Later-phase placeholder.

#### `server/src/routes/`

- `index.js` — Mounts the active API route groups.
- `health.routes.js` — Defines `GET /health`.
- `departments.routes.js` — Defines department list and detail URLs.
- `doctors.routes.js` — Defines doctor list and detail URLs.
- `auth.routes.js` — Later-phase placeholder.
- `appointments.routes.js` — Later-phase placeholder.
- `contact.routes.js` — Later-phase placeholder.
- `me.routes.js` — Later-phase placeholder.
- `staff.routes.js` — Later-phase placeholder.
- `doctor.routes.js` — Later-phase placeholder.
- `admin.routes.js` — Later-phase placeholder.

#### `server/src/controllers/`

- `departments.controller.js` — Turns department requests into API responses.
- `doctors.controller.js` — Validates doctor IDs and returns doctor responses.
- `others.controller.js` — Later-phase placeholder.

#### `server/src/services/`

- `departments.service.js` — Reads active departments and their doctors.
- `doctors.service.js` — Filters doctors and loads their department and schedule.
- `slots.service.js` — Later-phase appointment-slot placeholder.
- `booking.service.js` — Later-phase booking placeholder.
- `email.service.js` — Later-phase email placeholder.

#### `server/src/middleware/`

- `errorHandler.js` — Converts errors into the standard JSON error shape.
- `notFound.js` — Handles unknown API routes.
- `validate.js` — Runs a Zod schema against request data.
- `auth.js` — Later-phase authentication placeholder.
- `roles.js` — Later-phase role checks placeholder.
- `rateLimit.js` — Later-phase route-specific limit placeholder.

#### `server/src/validators/`

- `common.js` — Later-phase shared validation placeholder.
- `doctors.js` — Later-phase doctor validation placeholder.
- `departments.js` — Later-phase department validation placeholder.

#### `server/src/utils/`

- `ApiError.js` — Application error with an HTTP status and error code.
- `asyncHandler.js` — Sends rejected async route work to Express error handling.
- `logger.js` — Small logging wrapper.

#### `server/src/jobs/`

- `reminders.job.js` — Later-phase reminder job placeholder.

#### `server/src/seed/`

- `data.js` — Department and doctor seed data from the legacy pages.
- `seed.js` — Clears old seed records and inserts fresh records and schedules.

### `server/tests/`

- `setup.js` — Test environment values and Mongoose test behavior.
- `health.test.js` — Checks the health endpoint.
- `departments.test.js` — Checks the department endpoint response behavior.
- `doctors.test.js` — Checks the invalid doctor ID error shape.

### `client/`

- `.env.example` — Example API URL for Vite.
- `.eslintignore` — Prevents generated build files from being linted.
- `.eslintrc.cjs` — Client lint rules.
- `index.html` — Browser document and Google Font links.
- `package.json` — React dependencies and client scripts.
- `package-lock.json` — Exact versions for client dependencies.
- `vite.config.js` — Vite React plugin configuration.
- `vitest.config.js` — Browser-like test environment.

### `client/src/`

- `main.jsx` — Starts React, the router, and the shared stylesheet.
- `App.jsx` — Renders the route table.
- `routes.jsx` — Defines public and future routes.

#### `client/src/api/`

- `client.js` — Fetch wrapper that adds JSON handling and API errors.
- `departments.js` — Department API functions.
- `doctors.js` — Doctor API functions.

#### `client/src/hooks/`

- `useFetch.js` — Loads async data and avoids updating an unmounted page.
- `usePageTitle.js` — Sets the browser tab title.

#### `client/src/components/layout/`

- `Layout.jsx` — Shared page frame with header, outlet, and footer.
- `SkipLink.jsx` — Keyboard skip link.
- `EmergencyStrip.jsx` — Emergency number and clinic hours strip.
- `Header.jsx` — Logo, navigation, mobile menu control, and booking link.
- `Footer.jsx` — Shared footer content.

#### `client/src/components/ui/`

- `Loading.jsx` — Accessible loading message.
- `ErrorMessage.jsx` — API error message.
- `EmptyState.jsx` — Empty list message.
- `ComingSoon.jsx` — Placeholder for later features.

#### `client/src/pages/`

- `Home.jsx` — Static home page and sample availability board.
- `About.jsx` — About page.
- `Services.jsx` — API-backed department page.
- `Doctors.jsx` — API-backed doctor page and department query filter.
- `Appointment.jsx` — Appointment form with a temporary submit notice.
- `Contact.jsx` — Contact form with a temporary submit notice.
- `Login.jsx` — Login form design with a temporary submit notice.
- `NotFound.jsx` — Catch-all page.
- `ServiceDetail.jsx` — Later-phase placeholder.
- `DoctorProfile.jsx` — Later-phase placeholder.
- `BookingConfirmed.jsx` — Later-phase placeholder.
- `ManageBooking.jsx` — Later-phase placeholder.
- `Register.jsx` — Later-phase placeholder.
- `ForgotPassword.jsx` — Later-phase placeholder.
- `ResetPassword.jsx` — Later-phase placeholder.
- `VerifyEmail.jsx` — Later-phase placeholder.
- `Forbidden.jsx` — Later-phase placeholder.
- `ServerError.jsx` — Later-phase placeholder.
- `Privacy.jsx` — Later-phase placeholder.
- `Terms.jsx` — Later-phase placeholder.

#### `client/src/pages/portal/`, `doctor/`, `staff/`, and `admin/`

- `Index.jsx` in each folder — Placeholder for its future area.

#### `client/src/context/`

- `AuthContext.jsx` — Empty authentication context stub for a later phase.

#### `client/src/styles/`

- `style.css` — Exact copy of the legacy shared stylesheet.

#### `client/src/tests/`

- `setup.js` — Installs Testing Library matchers.
- `Header.test.jsx` — Checks navigation links and the active-page marker.

## 4. How a request travels: opening the Doctors page

1. The browser opens `http://localhost:5173/doctors`.
2. `client/src/main.jsx` starts React and wraps the app in `BrowserRouter`.
3. `client/src/routes.jsx` matches the `doctors` route and renders
   `client/src/pages/Doctors.jsx`.
4. `Doctors.jsx` reads the optional `department` query parameter.
5. `Doctors.jsx` calls `useFetch` from `client/src/hooks/useFetch.js`.
6. `useFetch` calls `getDoctors` from `client/src/api/doctors.js`.
7. `getDoctors` calls `apiClient` in `client/src/api/client.js`.
8. `apiClient` sends `GET /api/v1/doctors` to the server.
9. `server/src/app.js` receives the request through Helmet, CORS, JSON parsing,
   cookies, and the general rate limiter.
10. `server/src/routes/index.js` sends `/doctors` to
    `server/src/routes/doctors.routes.js`.
11. The route calls `list` in
    `server/src/controllers/doctors.controller.js`.
12. The controller calls `listDoctors` in
    `server/src/services/doctors.service.js`.
13. The service uses the `Doctor` and `Department` Mongoose models. MongoDB returns
    active doctors. The department name is added with `populate`.
14. The service returns the records to the controller.
15. The controller sends `{ "data": [...] }`.
16. `apiClient` reads the JSON and returns its `data` value.
17. `useFetch` stores the data in React state.
18. `Doctors.jsx` renders one doctor row for each record.

The request does not call `server/src/server.js`. That file only starts listening.
The exported app in `app.js` handles the request after the server is running.

## 5. Key ideas explained

### The Express app and middleware

**What it is:** Express is the server framework. Middleware is a function that can
inspect a request, change it, or pass it to the next function.

**Why it is used here:** It gives the API a clear request pipeline. Security
headers, cross-origin rules, JSON parsing, rate limiting, routes, missing-route
handling, and errors each have a separate job.

Important lines from `server/src/app.js`:

```js
export const app = express();                 // Create the reusable app.
app.use(helmet());                            // Add security-related headers.
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));      // Read JSON request bodies.
app.use(cookieParser());                      // Read browser cookies.
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use('/api/v1', routes);                   // Mount the API route groups.
app.use(notFound);                            // Handle unknown paths.
app.use(errorHandler);                        // Format errors last.
```

### Mongoose models and indexes

**What they are:** A Mongoose model describes the fields in a MongoDB document and
provides functions for reading and writing documents.

**Why they are used here:** The model keeps database structure close to the code.
The department and doctor references also let the API connect related records.
Indexes make common lookups faster and enforce important rules such as unique
department slugs.

Important lines from `server/src/models/Doctor.js`:

```js
const doctorSchema = new mongoose.Schema(
  {
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    qualifications: [String],
    languages: [String],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);
doctorSchema.index({ name: 'text', specialty: 'text' }); // Supports text searches.
export const Doctor = mongoose.model('Doctor', doctorSchema);
```

### The seed script

**What it is:** A seed script puts known starter data into a database.

**Why it is used here:** A new learner can get the same eight departments and eight
doctors without manually entering records. It is safe to repeat because it clears
the three seed collections before inserting them again.

Important lines from `server/src/seed/seed.js`:

```js
await mongoose.connect(env.MONGODB_URI);     // Connect to local MongoDB.
await Promise.all([
  Schedule.deleteMany({}),                   // Remove old schedules.
  Doctor.deleteMany({}),                     // Remove old doctors.
  Department.deleteMany({})                  // Remove old departments.
]);
const departmentDocs = await Department.insertMany(departments);
const byName = new Map(departmentDocs.map((d) => [d.name, d]));
const doctorDocs = await Doctor.insertMany(
  doctors.map(({ department, ...doctor }) => ({
    ...doctor, departmentId: byName.get(department)._id
  }))
);
```

### The API response shape

**What it is:** Every successful response wraps its useful value in `data`.
Errors use an `error` object with a code and message.

**Why it is used here:** The browser can always look in the same place. Later,
pagination information can be added beside `data` without changing the main value.

Important lines from `server/src/controllers/doctors.controller.js`:

```js
export async function list(req, res) {
  const doctors = await service.listDoctors({
    department: req.query.department,        // Optional department filter.
    q: req.query.q                            // Optional text search.
  });
  res.json({ data: doctors });                // Stable success shape.
}
```

### React Router

**What it is:** React Router maps browser URLs to React components without a full
page reload.

**Why it is used here:** The clinic behaves like one app while still having clear
URLs such as `/services`, `/doctors`, and `/appointment`. Future routes can be
added before their real features are implemented.

Important lines from `client/src/routes.jsx`:

```jsx
return <Routes>
  <Route element={<Layout />}>          {/* Shared frame for every page. */}
    <Route index element={<Home />} />
    <Route path="services" element={<Services />} />
    <Route path="doctors" element={<Doctors />} />
    <Route path="appointment" element={<Appointment />} />
    {futureRoutes.map((path) => (
      <Route key={path} path={path} element={<ComingSoon />} />
    ))}
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>;
```

### The `useFetch` hook

**What it is:** A hook is reusable React logic. `useFetch` manages loading, data,
and error state for an asynchronous request.

**Why it is used here:** Services and Doctors need the same request behavior.
Keeping it in one hook avoids copying loading and error code into every page. The
`active` flag prevents an old request from changing a page after it unmounts.

Important lines from `client/src/hooks/useFetch.js`:

```js
const [state, setState] = useState({ data: null, loading: true, error: null });
useEffect(() => {
  let active = true;
  setState({ data: null, loading: true, error: null });
  fetcher()
    .then((data) => active && setState({ data, loading: false, error: null }))
    .catch((error) => active && setState({ data: null, loading: false, error }));
  return () => { active = false; };          // Ignore late results.
}, dependencies);
return state;
```

## 6. How to test it

### Automated commands

Run these commands from the project folder:

```powershell
npm run seed
npm --prefix server run lint
npm --prefix client run lint
npm --prefix client run build
npm test
```

Expected results:

- The seed prints `Inserted 8 departments, 8 doctors and 8 schedules.`
- Both lint commands finish without errors.
- The client build prints `built`.
- The root test command reports three server suites passed and one client test
  passed.

### Five manual tests

1. Open `/services`. The page should show eight departments after loading.
2. Open `/doctors`. The page should show eight doctors.
3. Open `/doctors?department=cardiology`. The list should be filtered to the
   cardiology doctor.
4. Submit the Appointment form with valid required fields. The page should show
   “Saving arrives in the next phase.” No database record should be created.
5. Purposefully fail a request by opening
   `http://localhost:5000/api/v1/doctors/not-an-id`. It should return HTTP 400 and
   JSON like:

   ```json
   { "error": { "code": "INVALID_ID", "message": "Invalid doctor id" } }
   ```

## 7. Problems and limits

- Real booking is not implemented. Appointment, contact, and login forms only show
  a temporary notice.
- Authentication, patients, payments, reminders, email, SMS, dashboards, and
  portal data are placeholders.
- The Services and Doctors pages are API-backed, but several later detail routes
  only show `ComingSoon`.
- The first implementation keeps the legacy stylesheet unchanged, but some React
  pages are shorter versions of the original static HTML pages. The full legacy
  laboratory, insurance, timeline, and detailed form sections were not all
  reproduced in this foundation slice.
- The server tests use the real app and avoid requiring a live database for the
  basic endpoint checks. The seed and manual API checks were run against the local
  MongoDB service.
- Docker Compose was created but intentionally not run because Docker was outside
  the requested local setup.
- Dependency installation reported audit warnings. Those are package-tree warnings,
  not application test failures, and were not changed with a forced upgrade.
- The API returns `db: "disconnected"` if the app is started without MongoDB. The
  health route still responds so the problem is visible.

## 8. Vocabulary

- **API** — A set of URLs that lets one program communicate with another.
- **Browser app** — The React code that runs in the user's browser.
- **Controller** — Code that receives a request and chooses the response.
- **Database** — A system that stores information for later use.
- **Endpoint** — One API URL and its supported operation.
- **Hook** — Reusable React logic that connects a component to state or browser
  behavior.
- **Index** — A database lookup structure that helps searches run faster.
- **Middleware** — A function that runs during a request before the final route.
- **Model** — Code that describes stored data and provides database operations.
- **Route** — A rule that maps a URL to server or browser behavior.
- **Seed data** — Starter records inserted into a new or reset database.
- **Schema** — A description of the fields and rules for stored data.

## 9. What comes next

The booking phase will build on this foundation:

1. Add real schemas for users, patients, and appointments.
2. Add request validators for names, phone numbers, dates, doctors, and consent.
3. Use the existing `Schedule` records to calculate open time slots.
4. Add booking service logic that checks conflicts before saving.
5. Replace the Appointment page's temporary notice with a POST request.
6. Return a booking reference and show the confirmation page.
7. Add authentication before exposing patient appointment data.
8. Add tests for slot generation, duplicate bookings, date rules, and authorization.

The existing separation is meant to help with this. Routes receive requests,
controllers format responses, services hold business rules, and models talk to
MongoDB.
