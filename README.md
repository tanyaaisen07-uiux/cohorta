# Cohorta

A role-based LMS for cohort-based online schools. UX/UI and front-end by **Tania Aisen**.

**Product site:** https://tanyaaisen07-uiux.github.io/cohorta
**Live demo:** https://tanyaaisen07-uiux.github.io/cohorta/#/instructor/home
**Figma:** https://www.figma.com/design/J4J6upc1wrEXRMm6xLjisE

## Project type

Self-initiated Product Design case study. All names and data in the demo are fictional.

## Approach

The product direction was developed through scenario-based design and product hypotheses. I mapped the needs of students, instructors and administrators, then explored how role-based permissions, grading workflows, course management and product states could support their tasks.

The concepts and workflows represent design hypotheses, not findings from primary user research.

## Case study

![Cohorta cover](case/cohorta-01.png)

All 14 case images are in [`/case`](case).

## The problem

Online schools run the same course for several cohorts at once. Students, instructors, teaching assistants and admins all work in one product, but each role needs a different home, different permissions and a different idea of "what to do next".

## What the demo shows

| Role | Key flows |
|---|---|
| Student | One finished flow: course home with the next step, lesson marked as done, assignment (choose a file, then submit), what happens next, grades with a grade the instructor released in the same session. Also the locked lesson |
| Instructor | Grading queue with filters and bulk actions, quick review panel, full grading view with AI draft, course builder, assignment editor, roster |
| Teaching assistant | The same grading tools scoped to Group A, in a simpler view: queue without the Group column, quick review over the queue, grading view, group roster. Work from other groups opens as No access, and a released grade is locked with a note that only the instructor can change it |
| Admin | Overview, course review and publishing, cohort scheduling, enrolments with bulk pause and undo, users and roles with an audit log |

Use the bar at the top to switch role and page state: normal, empty, loading, error, no access, long data.

## Key UX decisions

- **Queue first, not inbox.** Instructors grade from one queue sorted by Priority (late work first, then whatever has waited longest), with a quick review panel so they never lose their place.
- **AI drafts a grade, a person releases it.** The AI draft is visibly marked, can be accepted, edited or discarded, and nothing reaches a student without a human release. Release stays locked until the draft is accepted, edited or discarded, a discarded draft takes its score with it, and every release says in the audit log whether AI helped. A release can be undone for a few seconds.
- **Versions protect running cohorts.** Course edits go into a new version; a running cohort keeps its version until an admin pushes the update.
- **Every sensitive action is logged.** Role changes, pushes and bulk actions land in the audit log; bulk actions have undo.
- **Responsive by rule, not by shrinking.** Tablet splits grading into Document and Assessment tabs; mobile turns tables into compact rows with a fixed bulk bar.

## Motion

Motion appears only where it explains an action or a state: the review panel slides in once and only fades its content when you move to the next submission; toasts fade in and out and update in place; the bulk bar rises with the first selected row and the rows an action changed get a short highlight; buttons change colour on hover and press and show a spinner while an action runs; skeletons appear only while data loads. Micro transitions take 150 ms, panels 200 ms. Nothing pulses, bounces or animates between pages, and `prefers-reduced-motion` turns every movement into an instant change.

## Visual layer

White sidebar, a cool off-white canvas (`#F7F8FA`) and white surfaces separated by a 1 px line (`#E5E7EB`), not a shadow. Text is `#191D27`, secondary text `#667085`. Cobalt is an accent, not a surface: the primary action, the current page in the sidebar, focus, links and selected filters and tabs. The one card on each home that says what to do next sits on a faint blue tint (`#F0F2FF`) and its primary button carries the colour. Red is kept for errors, late work and real risk. Status badges are 22 px, 4 px radius, with five meanings and no more: red only for late or failed work, amber for something that needs a decision, blue for work in motion, green for live or graded, grey for everything that needs no action. Lists of people share one row component: avatar, name (14 px medium) and one line of context (12 px), the status in its own column so badges line up, then the action. Shadows are kept only for things that float above the page: toasts, popovers, the bulk bar, the slide-over review panel and bottom sheets.

People are drawn as illustrated, faceless avatars generated from their names, so long-data names get a stable drawing too. For instructors on screens 1400 px and wider the quick review is a column next to the grading queue: any row opens in one click and the queue is never dimmed. Below 1400 px, and always for a teaching assistant, it slides over the queue; on a phone review is a separate step. Release has three visible states: locked until a decision on the AI draft, ready with a preview of what the student will see, and released with a few seconds to undo.

## Product site

`#/` opens a public landing page for Cohorta; every app route (`#/student/…`, `#/instructor/…`, `#/ta/…`, `#/admin/…`) still opens the demo directly, and the demo bar has a link back to the site.

- **Sections:** header with Log in and Try for free, hero with the real grading queue, what Cohorta covers, a role switcher (student, instructor, course builder, admin) with a link into each view, how AI-drafted grades are released, versions and the audit log, a closing call to action and a footer.
- **Only what the product does.** Every capability on the page is in the demo. There are no customer logos, testimonials, statistics or pricing, because none exist.
- **Screenshots are the product.** Images in `/site` are captured from this demo at 2x (Playwright, Geist loaded, demo bar hidden) and saved as WebP, so the page shows the current interface. Recapture them after a visible UI change.
- Files: `landing.js` (markup and behaviour), `site.css` (styles on top of the product tokens), `site/` (images).

## Try for free: sign-up and log-in

**Try for free** (header, hero, closing section) opens `#/signup`; **Log in** opens `#/login`.

- Fields are validated when you leave them and again on submit, with the error under the field and focus on the first problem.
- **The demo has no backend, so nothing is faked.** With no API configured the form says that sign-up isn't connected, that nothing was sent or stored, and offers the demo instead.
- The request, loading, success and error states are already built. Set `window.COHORTA_API` to a base URL to turn them on:
  - `POST {API}/trials` with `{ name, email, org, password }` → `201` shows "Check your inbox"; `409` says the account exists and links to log-in; any other status shows the server message.
  - `POST {API}/sessions` with `{ email, password }` → `200` redirects to `body.redirect` (default instructor home); `401` says the email or password is wrong.
  - A network failure keeps the form filled in and asks to try again.
- **Still needed on the server:** account and workspace creation, email confirmation, password hashing and rate limiting, a session cookie (`credentials: 'include'` is sent), and real auth guards on app routes. The demo routes are open by design.

## Responsive experience across roles

Cohorta is designed as a responsive LMS, adapting learning and teaching workflows to different screen sizes. Student learning is optimized for mobile, while complex grading and administration workflows prioritize desktop usability.

- **Student, mobile first.** The whole flow works on a phone: next lesson, assignment, submission and the released grade. Every phone page keeps space above the bottom navigation, so the last card is never hidden.
- **Instructor.** On a phone the queue and the review are separate steps with a clear way back; on a wide screen the review is a column next to the queue.
- **Admin, desktop first.** Bulk work, tables and roles are built for a desktop. On a phone tables become stacked rows and nothing scrolls sideways.

Checked at 360, 390 and 430 px for phones, 1024 for tablets and 1440 for desktop, including the long data, loading and error states.

## Long content

The **Long data** state swaps the sample data for a stress set: 200 enrolments and 198 submissions, 30 to 40 character names with diacritics, long emails, course and cohort titles, scopes and feedback. Rules it checks:

- One line cells (email, course, cohort, owner) truncate with an ellipsis and keep the full text in a tooltip; names never push the status, score or actions out of the row.
- Long text that carries meaning (feedback, scope, audit entries) wraps instead of truncating.
- At 1024 px secondary columns hide before anything truncates to a few letters.
- At 390 px tables turn into stacked rows; wide reference tables scroll inside their card, never the page.
- A student's name in the review header wraps in full on a phone instead of being cut.

## Resizing rules

Every Figma container says how it grows, so a longer label, a translation or an extra row does not break the layout. The Handoff page has the full table; the short version:

- Buttons are instances of one component. Width hugs the label; only the main action on a phone fills the width. The icon is a component property, not a separate layer.
- Text is Fill width and Auto height. There are no fixed text boxes.
- Cards and lists hug their content. Clipping is kept only for scroll areas, the course map canvas, media and bottom sheets.
- Two-column pages: the work area fills, the side column stays 372 px.
- Label and value rows use Space between, not a large fixed gap. The sidebar fills the height and a growing spacer keeps the profile at the bottom.
- The stress frame `SM01-L` shows the student home at 360 px with long course and assignment names, long dates and five Due next items: everything wraps and the cards grow.

## Design tokens

`styles.css` opens with one token layer used by the whole app and the product site; components use tokens only, and each token has one meaning. Figma names map to CSS custom properties: `surface/tint` is `--surface-tint`, `feedback/error-bg` is `--fb-error-bg`.

| Group | Tokens |
|---|---|
| Colour | brand `--cobalt` (hover, pressed), neutrals `--ink`, `--text-2`, `--text-3`, `--line`, `--line-2`, `--subtle`, surfaces `--canvas`, `--surface`, `--surface-tint`, `--surface-hover`, `--surface-table-head` |
| Status | five meanings, each a background + text pair used only for badges: danger (Late, Error), warning (Paused, In review), info (AI draft ready, Invited, In progress, Scheduled), success (Published, Running, Active, Graded), neutral (Draft, Not started, Submitted, Returned, Archived, Completed, Dropped, Locked) |
| Badge | `--badge-h` 22, `--badge-px` 8, `--badge-fs` 12, `--badge-fw` 500, `--badge-r` 4; no border, shadow or icon |
| Feedback | `--fb-info/success/warning/error-*` for banners |
| Avatars | one circle in four sizes `--av-xs` 24, `--av-sm` 28, `--av-md` 32 (every row), `--av-xl` 48; muted palette `--av-bg-1…6`, `--av-shirt-1…4`. Each original colour maps to one token, so every person keeps their own drawing |
| Type | `--fs-12` to `--fs-28` with matching `--lh-*`, weights `--fw-regular/medium/semibold`. Page title 28, section title 16, metric 28, body 14, meta 12 to 13 |
| Space | `--sp-1` to `--sp-12`, 4 px steps (4, 8, 12, 16, 20, 24, 32, 40, 48) |
| Radius | `--r-xs` 4 tags and counters, `--r-sm` 6 buttons, inputs and chips, `--r-md`/`--r-lg` 8 cards and panels, `--r-xl` 10 large containers only |
| Controls and icons | `--h-sm` 32, `--h-md` 40, `--h-lg` 44. One outline icon set: sizes snap to 12 / 16 / 18 / 20 / 24, stroke 1.75 (2.25 at 12 px) |
| Elevation | `--shadow-popover`, `--shadow-overlay`, `--shadow-sheet`; cards have none |
| States | `--state-hover`, `--state-pressed`, `--focus-ring` |

Repeated layout tweaks that used to be inline styles in the markup are utility classes (`u-grow`, `u-meta`, `u-strong`, …); what stays inline is dynamic (progress widths, map positions, skeleton sizes).

## Prototype toolbar

The dark bar is case-study chrome, not part of the LMS. It is one 44 px row with two labelled segmented controls, role (Student, Instructor, TA, Admin) and state (Normal, Empty, Loading, Error, No access, Long data), divided by a thin rule. The selected item is a lighter segment with a thin underline, not a white pill. The case-study note shows only from 1280 px; below that the row scrolls sideways instead of wrapping, so the sidebar and panels always start 44 px down. On a phone it turns into three short static rows above the app.

## Accessibility

Text and status tags meet WCAG AA: status badges 5.4:1 and up (text on its own background), primary button 6.6:1, secondary text 4.97:1 on white and 4.68:1 on the canvas, cobalt on the selected tint 5.95:1, toolbar labels 5.4:1 on dark. Focus states are visible, hit areas are at least 32 px, and motion respects `prefers-reduced-motion`.

## Stack

Plain HTML, CSS and JavaScript, no build step and no new dependencies. Type: Geist. Brand assets are in `/brand`; landing screenshots in `/site`.

## Contact

- Portfolio: https://tania-aisen.framer.website/
- LinkedIn: https://www.linkedin.com/in/tania-aisen
- Behance: https://www.behance.net/tanyaaisen
