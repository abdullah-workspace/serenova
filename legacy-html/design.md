# Serenova Clinic: Design System

Version 1.0 · HTML and CSS only (no JavaScript)

## 1. Design idea

Hospital sites usually look the same: pale blue, stock photos of smiling staff, rounded cards everywhere. Serenova goes the other way. It feels like a calm private clinic: deep teal, sea-glass tints and a single champagne accent, set in a soft serif.

The one memorable element is the **availability board** on the home page. It shows which doctors have open slots today, so the first thing a visitor sees is what they came for: a time they can book.

Everything else stays quiet. Rows and hairlines are used instead of identical cards, and there are no photos to fake, so the design works with plain CSS.

## 2. Colour palette

| Name | Hex | Role |
|---|---|---|
| Deep Teal Ink | `#0D3B3E` | Headings, dark sections, footer, availability board |
| Lagoon | `#1F6F6B` | Buttons, links, focus ring, active states |
| Sea Glass | `#E4EFEC` | Soft section backgrounds, form fields, chips |
| Ivory White | `#FAFCFB` | Page background |
| Champagne | `#C8A15A` | Accent on dark backgrounds only (dividers, slot highlights, logo mark) |
| Brass | `#7A5C22` | Accent text on light backgrounds |
| Signal Red | `#B3372B` | Emergency only. Never used for decoration |
| Slate Text | `#24393B` | Body text |
| Quiet Slate | `#4F6769` | Secondary text, captions |
| Hairline | `#CFDEDA` | Borders and dividers |

### Contrast (WCAG 2.1)

| Text on background | Ratio | Result |
|---|---|---|
| Slate Text on Ivory White | 11.83 | AAA |
| Quiet Slate on Ivory White | 5.86 | AA |
| Quiet Slate on Sea Glass | 5.14 | AA |
| White on Deep Teal Ink | 12.26 | AAA |
| White on Lagoon | 5.92 | AA |
| Champagne on Deep Teal Ink | 5.08 | AA |
| Brass on Ivory White | 6.03 | AA |
| White on Signal Red | 6.00 | AA |

Champagne is never used as text on a light background (it fails contrast there). Use Brass instead.

## 3. Typography

| Role | Font | Fallbacks | Weights |
|---|---|---|---|
| Display (headings) | Fraunces | Georgia, serif | 400, 600 |
| Body and interface | Figtree | system-ui, Segoe UI, sans-serif | 400, 500, 600 |

Both load from Google Fonts. If they fail to load, the fallbacks keep the layout intact.

### Type scale (ratio about 1.25)

| Token | Size | Line height | Used for |
|---|---|---|---|
| `--fs-hero` | clamp(2.5rem, 6vw, 4.25rem) | 1.05 | Home page headline |
| `--fs-h1` | clamp(2.1rem, 4.5vw, 3rem) | 1.1 | Page titles |
| `--fs-h2` | clamp(1.6rem, 3vw, 2.1rem) | 1.2 | Section headings |
| `--fs-h3` | 1.25rem | 1.3 | Item titles |
| `--fs-body` | 1.0625rem (17px) | 1.65 | Paragraphs |
| `--fs-small` | 0.9rem | 1.5 | Captions, meta |

Rules: sentence case everywhere, no all-caps labels, paragraph width capped at 62 characters, serif headings get tight letter spacing (-0.01em).

## 4. Layout

- **Container:** max width 1160px, side padding 20px on mobile and 32px on desktop.
- **Grid:** 12 columns on desktop, 1 column on mobile. Two-column splits use `1.1fr 0.9fr` or `1fr 1fr`.
- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 72, 112px. Sections use 72px vertical padding on mobile and 112px on desktop.
- **Alignment:** left aligned. Centre alignment is used only for the closing call to action.
- **Breakpoints:** 640px (tablet), 960px (desktop). Mobile first.

### Corner radius (varies by role, on purpose)

| Element | Radius |
|---|---|
| Buttons | 999px (pill) |
| Form fields | 10px |
| Slot chips | 8px |
| Availability board and portal panel | 28px with one sharp corner (4px). The login form panel mirrors it |
| Doctor monogram | 50% (circle) |
| Everything else | 0 (rows, hairlines, full-width bands) |

### Shadows

One soft shadow only, used on the availability board: `0 18px 40px -20px rgba(13, 59, 62, 0.35)`. The sticky header uses a 1px hairline instead of a shadow.

## 5. Components

| Component | Description |
|---|---|
| Emergency strip | Thin Deep Teal Ink bar above the header: emergency number in Signal Red pill, hours text |
| Header | Logo (circle mark plus serif wordmark), five text links, one pill button "Book appointment". On mobile the links collapse into a CSS-only menu |
| Buttons | Primary (Lagoon fill, white text), Secondary (outline in Deep Teal Ink), Light (Ivory fill, for dark backgrounds). 48px minimum height |
| Availability board | Dark card listing doctors with their next open slots as chips |
| Department row | Name, one-line description and a link, separated by hairlines |
| Doctor profile | Monogram circle (initials), name, role, languages, next available day, link to book |
| Process steps | Four steps with numbers (this one really is a sequence) |
| Forms | Labels above fields, Sea Glass fill, 2px Lagoon outline on focus, inline hint text under fields |
| Slot chips | Radio inputs styled as time chips, selected state fills with Lagoon |
| Hours table | Two-column table, today's row not highlighted (no scripting) |
| Footer | Deep Teal Ink, four columns, emergency number repeated |

## 6. Motion

- One page-load moment: the availability board slides in once on the home page (400ms).
- Interactive states only: button hover (background colour, 150ms), focus ring, menu open.
- Everything respects `prefers-reduced-motion: reduce` (animation off).

## 7. Accessibility

- All text meets WCAG AA contrast (see table above).
- Visible focus ring on every interactive element: 3px Lagoon outline with 2px offset.
- Semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page, `aria-current="page"` on the active link.
- Every form field has a visible `label`. Required fields are marked in text, not colour alone.
- A skip link ("Skip to main content") is the first focusable element.
- Touch targets are at least 44px.

## 8. Voice and tone

Plain, warm and specific. Write for a worried person with one question: "Can I be seen soon, and by whom?"

- Say what happens: "Book appointment", not "Submit".
- Keep names consistent: the same action keeps the same name across pages.
- Errors explain the fix: "Enter a phone number we can reach you on", not "Invalid input".
- No medical claims or guarantees.

## 9. File structure

```
serenova-clinic/
├── index.html          Home
├── about.html          About
├── services.html       Departments and services
├── doctors.html        Doctors
├── appointment.html    Book appointment
├── contact.html        Contact
├── login.html          Patient portal login
├── css/
│   └── style.css       Single shared stylesheet
├── requirements.md     Requirements document
└── design.md           This file
```
