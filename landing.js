/* Cohorta public site: landing page, sign-up and log-in.
   Rendered by the app router (app.js) for #/, #/signup and #/login. Product screenshots in /site
   are captured from this demo, so the page always shows the real interface. */
window.CohortaSite = function (h) {
  const { ic, symbol, wordmark, esc } = h;

  /* Where sign-up and log-in would be sent. The demo has no backend, so this stays empty and the forms say so.
     Set window.COHORTA_API = 'https://api.example.com' to switch the forms to real requests (see README). */
  const API = () => (window.COHORTA_API || '').replace(/\/$/, '');

  const logo = (href = '#/') => `<a href="${href}" class="brand s-brand" aria-label="Cohorta home">${symbol(22)}${wordmark(19)}</a>`;
  const shot = (src, alt, w = 1440, h = 900) => `<img src="site/${src}.webp" alt="${esc(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async">`;
  const tick = t => `<li>${ic('check', 16, 2)}<span>${t}</span></li>`;

  /* ---------------- landing ---------------- */
  const TABS = [
    { id: 'student', label: 'Student', title: 'Students always know what comes next',
      text: 'Home opens on the next lesson, not on a list of everything in the course.',
      points: ['Progress for every module and the next step on top', 'Assignments go from file to submission to a released grade', 'Locked lessons say what opens them', 'The whole student flow works on a phone'],
      href: '#/student/home', img: 'show-student', alt: 'Student home in Cohorta: next lesson, course progress by module, due dates and the latest feedback', phone: 'phone-student' },
    { id: 'instructor', label: 'Instructor', title: 'Instructors see who needs attention',
      text: 'The dashboard leads with the work waiting for review and the students who have gone quiet.',
      points: ['Submissions to review, with late work counted first', 'Students with no activity for 7 days or more', 'Upcoming deadlines and recent activity across cohorts'],
      href: '#/instructor/home', img: 'show-instructor', alt: 'Instructor dashboard in Cohorta: submissions to review, students at risk and upcoming deadlines' },
    { id: 'course', label: 'Course builder', title: 'Courses change without breaking a running cohort',
      text: 'Build modules from lessons and assignments, then set what opens after what.',
      points: ['Lessons are made of blocks: text, video, image, callout and quiz', 'The course map flags items that open before their prerequisite', 'Edits go into a new version; a running cohort keeps its version until an admin pushes the update'],
      href: '#/instructor/builder/map', img: 'show-map', alt: 'Course map in Cohorta: four modules, links between lessons and one item flagged as opening too early' },
    { id: 'admin', label: 'Admin', title: 'Admins run the school with every change on record',
      text: 'Enrolments, roles and publishing live in one place, built for bulk work on a desktop.',
      points: ['Review and publish courses, schedule cohorts', 'Enrol students, pause them in bulk and undo', 'Change roles and scopes; the audit log keeps who did what'],
      href: '#/admin/enrolments', img: 'show-admin', alt: 'Enrolments table in Cohorta with status filters, cohorts, progress and last activity' }
  ];
  const tabPanel = (t, on) => `<div class="s-panel" role="tabpanel" id="panel-${t.id}" aria-labelledby="tab-${t.id}" ${on ? '' : 'hidden'}>
      <div class="s-panel-txt"><h3>${t.title}</h3><p>${t.text}</p><ul class="s-ticks">${t.points.map(tick).join('')}</ul>
        <a class="s-more" href="${t.href}">Open this view in the demo ${ic('chev', 16, 2)}</a></div>
      <div class="s-panel-img${t.phone ? ' has-phone' : ''}"><div class="s-shot">${shot(t.img, t.alt)}</div>${t.phone ? `<div class="s-phone">${shot(t.phone, 'The same student home on a phone', 390, 650)}</div>` : ''}</div>
    </div>`;

  const FEATURES = [
    ['Courses and lessons', 'Course builder, a block editor for lessons and a course map for what opens after what. Courses go through review before they are published.'],
    ['Cohorts and learners', 'Schedule cohorts of the same course, enrol or import students, pause and resume enrolments in bulk with undo.'],
    ['Progress', 'Students see progress per module. Instructors see who has had no activity for a week. Admins see each cohort’s progress and how many students are behind.'],
    ['Grading and feedback', 'One queue sorted by priority, a rubric, written feedback and a release step. AI can draft a grade; a person decides.'],
    ['Roles and permissions', 'Student, instructor, teaching assistant and admin each get their own home. A TA sees only their group. Sensitive actions go to the audit log.']
  ];

  function landing() {
    return `<div class="site">
    <a class="s-skip" href="#s-main">Skip to content</a>
    <header class="s-head"><div class="s-wrap s-head-in">
      ${logo()}
      <nav class="s-nav" id="s-nav" aria-label="Site">
        <a href="#product">Product</a><a href="#roles">Roles</a><a href="#grading">Grading</a><a href="#versions">Versions</a>
        <span class="s-nav-m"><a href="#/login">Log in</a></span>
      </nav>
      <span class="s-grow"></span>
      <a href="#/login" class="s-login">Log in</a>
      <a href="#/signup" class="btn primary s-try">Try for free</a>
      <button type="button" class="iconbtn s-menu" aria-expanded="false" aria-controls="s-nav" aria-label="Menu">${ic('list', 20)}</button>
    </div></header>

    <main id="s-main">
      <section class="s-hero"><div class="s-wrap">
        <p class="s-eyebrow">LMS for cohort-based online schools</p>
        <h1>Run every cohort of your course from one place</h1>
        <p class="s-lead">Cohorta brings students, instructors, teaching assistants and admins into one product. Each of them opens to their own next step: the next lesson, the next submission to grade, the next course to publish.</p>
        <div class="s-ctas"><a href="#/signup" class="btn primary s-lg">Try for free</a><a href="#/instructor/home" class="btn secondary s-lg">Explore the demo</a></div>
        <p class="s-note">The demo opens with sample data. No sign-up needed.</p>
        <figure class="s-hero-shot s-shot">${shot('hero-queue', 'Cohorta grading queue: submissions sorted by priority with a quick review column showing an AI-drafted grade waiting for the instructor’s decision').replace(' loading="lazy"', ' fetchpriority="high"')}</figure>
        <ul class="s-facts">
          <li><b>Four roles</b><span>Student, instructor, TA and admin in one product</span></li>
          <li><b>A person releases every grade</b><span>AI drafts are marked and need a decision</span></li>
          <li><b>One version per cohort</b><span>Course edits never reach a running cohort by surprise</span></li>
        </ul>
      </div></section>

      <section class="s-sec" id="product" aria-labelledby="h-product"><div class="s-wrap s-cols">
        <div class="s-sec-head"><h2 id="h-product">What Cohorta covers</h2><p>The work of running a course for several groups at once, from the first lesson to the last grade.</p></div>
        <dl class="s-feats">${FEATURES.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl>
      </div></section>

      <section class="s-sec s-alt" id="roles" aria-labelledby="h-roles"><div class="s-wrap">
        <div class="s-sec-head s-center"><h2 id="h-roles">One product, a different home for each role</h2><p>Every role sees its own navigation, permissions and idea of what to do next.</p></div>
        <div class="s-tabs" role="tablist" aria-label="Roles">${TABS.map((t, i) => `<button type="button" role="tab" id="tab-${t.id}" aria-controls="panel-${t.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-stab="${t.id}">${t.label}</button>`).join('')}</div>
        ${TABS.map((t, i) => tabPanel(t, i === 0)).join('')}
      </div></section>

      <section class="s-sec" id="grading" aria-labelledby="h-grading"><div class="s-wrap s-split">
        <div class="s-split-txt">
          <p class="s-eyebrow">Grading</p>
          <h2 id="h-grading">AI drafts a grade. A person releases it.</h2>
          <p>Instructors and TAs grade from one queue. When AI has drafted a score against the rubric, it is clearly marked and nothing reaches the student until someone decides.</p>
          <ol class="s-steps">
            <li><span class="s-num">1</span><div><b>Draft</b><span>AI scores each rubric criterion and writes a short summary. The student doesn’t see it.</span></div></li>
            <li><span class="s-num">2</span><div><b>Decide</b><span>Accept, edit or discard the draft. Release stays locked until one of the three happens.</span></div></li>
            <li><span class="s-num">3</span><div><b>Release</b><span>The student gets the grade and feedback. The release can be undone for a few seconds, and the audit log records whether AI helped.</span></div></li>
          </ol>
          <a class="s-more" href="#/instructor/queue">Try the grading queue ${ic('chev', 16, 2)}</a>
        </div>
        <div class="s-split-img"><div class="s-shot">${shot('show-grade', 'Full grading view in Cohorta: the submitted document next to the rubric and the AI draft', 1200, 720)}</div>
          <figure class="s-phone s-phone-cap">${shot('phone-grade', 'Student grades page on a phone, showing a released grade and feedback', 390, 560)}<figcaption>What the student sees after release</figcaption></figure></div>
      </div></section>

      <section class="s-sec s-alt" id="versions" aria-labelledby="h-versions"><div class="s-wrap s-split s-rev">
        <div class="s-split-txt">
          <p class="s-eyebrow">Versions and audit</p>
          <h2 id="h-versions">Change the course while a cohort is still running</h2>
          <p>Several cohorts often study the same course at different stages. In Cohorta, edits go into a new version that is reviewed before it is published. A running cohort keeps its version until an admin pushes the update to it.</p>
          <ul class="s-ticks">${tick('Courses move through draft, review and published')}${tick('Pushes, role changes and bulk actions are logged with who and when')}${tick('Bulk actions on enrolments can be undone')}</ul>
          <a class="s-more" href="#/admin/users">See users and the audit log ${ic('chev', 16, 2)}</a>
        </div>
        <div class="s-split-img"><div class="s-shot">${shot('show-users', 'Users and roles in Cohorta with scopes per person and the audit log', 1200, 640)}</div></div>
      </div></section>

      <section class="s-final" aria-labelledby="h-final"><div class="s-wrap s-final-in">
        <div><h2 id="h-final">Set up your first cohort</h2><p>Create a workspace for your school, or open the demo first and switch between all four roles.</p></div>
        <div class="s-ctas"><a href="#/signup" class="btn primary s-lg">Try for free</a><a href="#/instructor/home" class="btn secondary s-lg">Explore the demo</a></div>
      </div></section>
    </main>

    <footer class="s-foot"><div class="s-wrap">
      <div class="s-foot-grid">
        <div class="s-foot-brand">${logo()}<p>A role-based LMS for cohort-based online schools.</p></div>
        <nav aria-label="Product"><b>Product</b><a href="#product">What it covers</a><a href="#roles">Roles</a><a href="#grading">Grading</a><a href="#versions">Versions</a></nav>
        <nav aria-label="Demo"><b>Demo</b><a href="#/student/home">Student view</a><a href="#/instructor/home">Instructor view</a><a href="#/ta/queue">Teaching assistant view</a><a href="#/admin/home">Admin view</a></nav>
        <nav aria-label="Project"><b>Project</b><a href="https://github.com/tanyaaisen07-uiux/cohorta#readme" target="_blank" rel="noopener">Case study</a><a href="https://www.figma.com/design/J4J6upc1wrEXRMm6xLjisE" target="_blank" rel="noopener">Figma file</a></nav>
        <nav aria-label="Contact"><b>Contact</b><a href="https://tania-aisen.framer.website/" target="_blank" rel="noopener">Portfolio</a><a href="https://www.linkedin.com/in/tania-aisen" target="_blank" rel="noopener">LinkedIn</a><a href="https://www.behance.net/tanyaaisen" target="_blank" rel="noopener">Behance</a></nav>
      </div>
      <p class="s-legal">Cohorta is a self-initiated product design case study by Tania Aisen. All names and data in the demo are fictional. No account or payment is taken on this site.</p>
    </div></footer>
  </div>`;
  }

  /* ---------------- sign-up and log-in ---------------- */
  const field = (id, label, type, opts = {}) => `<div class="field" data-f="${id}">
      <label for="f-${id}">${label}</label>
      <input id="f-${id}" name="${id}" type="${type}" ${opts.ac ? `autocomplete="${opts.ac}"` : ''} ${opts.req === false ? '' : 'required'} ${opts.min ? `minlength="${opts.min}"` : ''} aria-describedby="e-${id}${opts.help ? ` h-${id}` : ''}">
      ${opts.help ? `<span class="help" id="h-${id}">${opts.help}</span>` : ''}
      <span class="help err" id="e-${id}" aria-live="polite"></span></div>`;

  function auth(mode) {
    const up = mode === 'signup';
    const form = up
      ? field('name', 'Full name', 'text', { ac: 'name' }) + field('email', 'Work email', 'email', { ac: 'email' }) + field('org', 'School or company', 'text', { ac: 'organization' }) + field('password', 'Password', 'password', { ac: 'new-password', min: 8, help: 'At least 8 characters' })
      : field('email', 'Email', 'email', { ac: 'email' }) + field('password', 'Password', 'password', { ac: 'current-password' });
    return `<div class="site s-auth">
      <header class="s-auth-head"><div class="s-wrap s-head-in">${logo()}<span class="s-grow"></span><a href="#/" class="s-login">${ic('back', 16, 2)} Back to site</a></div></header>
      <main class="s-auth-main" id="s-main">
        <div class="s-auth-card">
          <h1>${up ? 'Start your free trial' : 'Log in to Cohorta'}</h1>
          <p class="muted">${up ? 'Create a workspace for your school. You can invite instructors and students after that.' : 'Use the email you signed up with.'}</p>
          <div class="s-result" id="s-result" role="status" aria-live="polite"></div>
          <form class="s-form" data-auth="${mode}" novalidate>${form}
            <button type="submit" class="btn primary s-lg s-submit">${up ? 'Create workspace' : 'Log in'}</button>
          </form>
          <p class="s-switch">${up ? 'Already have an account? <a href="#/login">Log in</a>' : 'New to Cohorta? <a href="#/signup">Try it for free</a>'}</p>
          <div class="s-demo-alt"><b>Just looking?</b><span>Open the demo with sample data, no account needed.</span>
            <div class="s-roles"><a class="btn sm" href="#/student/home">Student</a><a class="btn sm" href="#/instructor/home">Instructor</a><a class="btn sm" href="#/ta/queue">TA</a><a class="btn sm" href="#/admin/home">Admin</a></div></div>
        </div>
      </main>
    </div>`;
  }

  /* ---------------- behaviour ---------------- */
  const RULES = {
    name: v => v.trim().length >= 2 || 'Enter your full name',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || (v.trim() ? 'Enter an email like name@school.com' : 'Enter your email'),
    org: v => v.trim().length >= 2 || 'Enter the name of your school or company',
    password: (v, mode) => mode === 'login' ? (v.length > 0 || 'Enter your password') : (v.length >= 8 || (v ? `Use at least 8 characters (${v.length} so far)` : 'Create a password'))
  };
  function check(form, input, show = true) {
    const rule = RULES[input.name]; if (!rule) return true;
    const r = rule(input.value, form.dataset.auth); const ok = r === true;
    const f = input.closest('.field'); const err = f.querySelector('.err');
    if (show) { f.classList.toggle('invalid', !ok); input.setAttribute('aria-invalid', String(!ok)); err.textContent = ok ? '' : r; }
    return ok;
  }
  function result(kind, title, text, extra = '') {
    const box = document.getElementById('s-result'); if (!box) return;
    box.innerHTML = `<div class="banner ${kind}">${ic(kind === 'error' ? 'alert' : kind === 'success' ? 'check' : 'alert', 20)}<div class="grow"><b>${title}</b>${text}${extra}</div></div>`;
  }
  async function send(mode, data) {
    const api = API();
    if (!api) return { state: 'no-backend' };
    try {
      const res = await fetch(`${api}/${mode === 'signup' ? 'trials' : 'sessions'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(data) });
      const body = await res.json().catch(() => ({}));
      if (res.ok) return { state: 'ok', body };
      return { state: 'error', status: res.status, message: body.message || '' };
    } catch (e) { return { state: 'network' }; }
  }
  async function submit(form) {
    const inputs = [...form.querySelectorAll('input')];
    const bad = inputs.filter(i => !check(form, i));
    if (bad.length) { bad[0].focus(); return; }
    if (form.dataset.busy) return; form.dataset.busy = '1';
    const mode = form.dataset.auth; const btn = form.querySelector('.s-submit');
    const data = Object.fromEntries(inputs.map(i => [i.name, i.name === 'password' ? i.value : i.value.trim()]));
    btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true'); inputs.forEach(i => i.readOnly = true);
    document.getElementById('s-result').innerHTML = '';
    const r = await send(mode, data);
    btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy'); delete form.dataset.busy; inputs.forEach(i => i.readOnly = false);
    const roles = ' <a href="#/instructor/home">Open the demo as an instructor</a>.';
    if (r.state === 'no-backend') {
      result('info', mode === 'signup' ? 'Sign-up isn’t connected yet.' : 'Log-in isn’t connected yet.',
        ` This site is a design demo without a backend, so no account was ${mode === 'signup' ? 'created' : 'checked'} and nothing you typed was sent or stored.`, roles);
    } else if (r.state === 'ok') {
      if (mode === 'signup') { form.hidden = true; result('success', 'Check your inbox.', ` We sent a link to ${esc(data.email)} to confirm your workspace for ${esc(data.org)}.`); }
      else { location.hash = (r.body && r.body.redirect) || '#/instructor/home'; }
    } else if (r.state === 'network') {
      result('error', 'We couldn’t reach the server.', ' Check your connection and try again. Your details are still in the form.');
    } else {
      const msg = r.status === 409 ? ' An account with this email already exists. <a href="#/login">Log in instead</a>.' : r.status === 401 ? ' The email or password is wrong.' : ` ${esc(r.message || 'Something went wrong on our side.')} Try again in a minute.`;
      result('error', mode === 'signup' ? 'We couldn’t create your workspace.' : 'We couldn’t log you in.', msg);
    }
    const banner = document.querySelector('#s-result .banner'); if (banner) { banner.setAttribute('tabindex', '-1'); banner.focus(); }
  }
  function selectTab(id, focus) {
    document.querySelectorAll('[data-stab]').forEach(b => { const on = b.dataset.stab === id; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    document.querySelectorAll('.s-panel').forEach(p => { p.hidden = p.id !== 'panel-' + id; });
  }
  const inSite = el => el && el.closest && el.closest('.site');

  document.addEventListener('click', e => {
    if (!inSite(e.target)) return;
    const tab = e.target.closest('[data-stab]'); if (tab) { selectTab(tab.dataset.stab); return; }
    const menu = e.target.closest('.s-menu');
    if (menu) { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', open); document.querySelector('.s-head').classList.toggle('open', open); return; }
    // In-page anchors scroll without touching the hash, which belongs to the app router.
    const a = e.target.closest('a[href^="#"]:not([href^="#/"])');
    if (a) {
      const t = document.getElementById(a.getAttribute('href').slice(1)); if (!t) return;
      e.preventDefault();
      const head = document.querySelector('.s-head'); if (head) { head.classList.remove('open'); const m = head.querySelector('.s-menu'); if (m) m.setAttribute('aria-expanded', 'false'); }
      const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      if (t.id === 's-main') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    }
  });
  document.addEventListener('keydown', e => {
    const tab = e.target.closest && e.target.closest('[data-stab]'); if (!tab) return;
    const all = [...document.querySelectorAll('[data-stab]')]; const i = all.indexOf(tab);
    const n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : null;
    if (n === null) return; e.preventDefault(); selectTab(all[(n + all.length) % all.length].dataset.stab, true);
  });
  document.addEventListener('submit', e => { const f = e.target.closest('form[data-auth]'); if (!f) return; e.preventDefault(); submit(f); });
  // Errors show after the person leaves a field, then update while they fix it.
  document.addEventListener('focusout', e => { const f = e.target.closest && e.target.closest('form[data-auth]'); if (f && e.target.matches('input') && e.target.value) check(f, e.target); });
  document.addEventListener('input', e => { const f = e.target.closest && e.target.closest('form[data-auth]'); if (f && e.target.closest('.field.invalid')) check(f, e.target); });

  return {
    landing, auth,
    title: page => ({ landing: 'Cohorta · LMS for cohort-based online schools', signup: 'Start your free trial · Cohorta', login: 'Log in · Cohorta' })[page]
  };
};
