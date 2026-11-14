# Serenova Clinic Website: Requirements Document

Course: Web Development · Semester project
Scope of this deliverable: front end only (HTML and CSS)

## 1. Purpose

Serenova Clinic is a fictional multi-specialty clinic. This project is its public website. Visitors can learn about the clinic, find a doctor, check departments and request an appointment.

This phase delivers the **static front end** (HTML and CSS). Back-end features such as saving appointments and real logins are planned for a later phase and are listed in section 8.

## 2. Goals

1. Let a visitor find the right department or doctor in two clicks.
2. Let a visitor request an appointment in under two minutes.
3. Make emergency and contact details visible on every page.
4. Look trustworthy and calm, and work on phones.

## 3. Users

| User | What they want |
|---|---|
| New patient | Find a doctor, see what the clinic offers, book a first visit |
| Returning patient | Log in to the portal, book a follow-up |
| Family member | Check opening hours, location and phone numbers for someone else |
| Visitor in a hurry | Find the emergency number immediately |

## 4. Sitemap

```
Home
├── About
├── Services (departments)
├── Doctors
├── Book appointment
├── Contact
└── Patient login
```

Every page shares the same header (navigation) and footer.

## 5. Screens

### 5.1 Home (`index.html`)
**Purpose:** Explain what the clinic offers and get the visitor to book.

| Section | Content |
|---|---|
| Emergency strip | Emergency number, "open 24 hours" |
| Header | Logo, navigation, "Book appointment" button |
| Hero | Headline, short description, two buttons ("Book appointment", "Find a doctor"), availability board showing doctors with open slots today |
| Why Serenova | Three short points: same-week appointments, one record across departments, results online |
| Departments | List of 6 departments with a one-line description and link |
| Meet our doctors | Three doctor profiles |
| How a visit works | Four steps: book, check in, see the doctor, follow up |
| Call to action | "Not sure which department?" with phone number and booking button |
| Footer | Contact details, links, hours |

### 5.2 About (`about.html`)
**Purpose:** Build trust.

- Page title and introduction
- Our approach (three values written as short paragraphs)
- Milestones (timeline of the clinic's growth)
- Facilities (consultation rooms, lab, imaging, pharmacy, parking)
- Call to action to book

### 5.3 Services (`services.html`)
**Purpose:** Show all departments and what each treats.

- Intro and jump links to each department
- 8 departments, each with description, common conditions and a "Book with this department" link
- Diagnostics and lab section (blood tests, X-ray, ultrasound, ECG)
- Insurance and payment notes

### 5.4 Doctors (`doctors.html`)
**Purpose:** Help visitors choose a doctor.

- Intro and department jump links
- 8 doctor profiles: initials monogram, name, specialty, qualifications, languages, days available, "Book with Dr. X" link

### 5.5 Book appointment (`appointment.html`)
**Purpose:** Collect the details needed to request a visit.

- Form: visit type (new or returning), full name, phone, email, date of birth, department, preferred doctor, preferred date, time slot (chips), reason for visit, consent checkbox, submit button
- Side panel: what to bring, opening hours, cancellation note

### 5.6 Contact (`contact.html`)
**Purpose:** Let visitors reach the clinic.

- Address, phone numbers, email, emergency number
- Opening hours table
- Contact form: name, email, subject, message
- Map placeholder block with address

### 5.7 Patient login (`login.html`)
**Purpose:** Entry point to the patient portal (design only for now).

- Login form: email or patient ID, password, "keep me signed in", "Log in" button, "Forgot password" link
- Side panel listing what the portal offers: appointments, lab results, prescriptions, bills
- Link to create an account

## 6. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Every page has a header with logo, navigation and a "Book appointment" button | Must |
| FR-02 | Every page has a footer with address, phone, emergency number and hours | Must |
| FR-03 | The navigation marks the current page | Must |
| FR-04 | The home page shows an availability board with sample doctors and open times | Must |
| FR-05 | The services page lists at least 8 departments with jump links | Must |
| FR-06 | The doctors page lists at least 8 doctors with a booking link each | Must |
| FR-07 | The appointment form has all fields listed in 5.5 with correct input types (`tel`, `email`, `date`) | Must |
| FR-08 | Required fields are marked and use the browser's built-in validation | Must |
| FR-09 | The login form has a password field and a "Forgot password" link | Must |
| FR-10 | The contact form has name, email, subject and message | Must |
| FR-11 | The navigation collapses into a menu on small screens (CSS only) | Must |
| FR-12 | Time slots on the appointment form are selectable chips | Should |
| FR-13 | The emergency number is visible at the top of every page | Should |

## 7. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | **Responsive:** layout works from 360px to 1440px wide without sideways scrolling |
| NFR-02 | **Accessibility:** text contrast meets WCAG AA, visible keyboard focus, labelled form fields, skip link, one `h1` per page |
| NFR-03 | **Performance:** one shared stylesheet, no JavaScript, no image files required. Pages load quickly on slow connections |
| NFR-04 | **Consistency:** colours, fonts and spacing come from CSS variables defined in one place |
| NFR-05 | **Maintainability:** clean, indented, semantic HTML and commented CSS |
| NFR-06 | **Browser support:** current Chrome, Edge, Firefox and Safari |
| NFR-07 | **Content:** no medical claims or guarantees; all names, numbers and addresses are fictional |

## 8. Out of scope (later phases)

- Saving appointments to a database
- Real login and patient accounts
- Sending email or SMS confirmations
- Online payments
- Admin dashboard for staff
- Live doctor availability (the board is sample data)

## 9. Assumptions

- All content (names, phone numbers, address) is fictional placeholder content.
- Fonts load from Google Fonts. The site still works offline with fallback fonts.
- No images are required. Doctor photos are replaced by initials.

## 10. Acceptance criteria

1. All seven pages open and link to each other without broken links.
2. Each page matches the screen description in section 5.
3. The site is usable on a 360px wide phone screen.
4. The design follows `design.md` (colours, fonts, spacing).
5. Forms use the correct input types and show required fields.
