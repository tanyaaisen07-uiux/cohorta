/* Cohorta demo app: one course, three roles. Vanilla JS, hash routing. */
(function () {
  const D = window.DB;
  /* Long data demo state: swaps the sample school for one with long names, titles and ~200 rows. */
  const DB_BASE = { ...D }; let DB_LONG = null;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // One line with an ellipsis, full text on hover: long names never push table columns off screen.
  const trunc = (t, w) => `<span class="trunc" style="--tw:${w}px" title="${esc(t)}">${esc(t)}</span>`;

  const S = {
    role: 'instructor', page: 'home', param: null, demo: 'normal',
    sel: new Set(), qStatus: 'all', q: '', sortDir: 'desc', qSort: 'priority', dense: false,
    eSel: new Set(), eFilter: 'all', cFilter: 'all',
    toast: null, modal: null, panel: null,
    ai: {}, done: new Set(), ret: new Set(), studentSubmitted: false, studentFile: false, lessonDone: false, order: null, anim: false, focus: null,
    swap: false, flash: new Set(), bulkShown: false, eBulkShown: false,
    lessons: {}, links: null, map: null, sheet: false
  };

  /* ---------- motion: only where it explains an action or a state ---------- */
  const reduceMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  // Run fn after an exit animation; with reduced motion, right away.
  const afterMotion = (ms, fn) => reduceMotion() ? fn() : setTimeout(fn, ms);
  const MOTION = { toastOut: 150, panelOut: 160, bulkOut: 140, load: 600 };
  function setLongData(on) {
    if (on === !!S.longData) return;
    S.longData = on;
    if (on) { DB_LONG = DB_LONG || window.makeLongDB(DB_BASE); Object.assign(D, DB_LONG); }
    else { Object.assign(D, DB_BASE); delete D.feedback; }
    S.order = null; S.lessons = {}; S.links = null; S.map = null; S.ai = {}; S.done = new Set(); S.ret = new Set(); S.lessonDone = false; S.studentFile = false; S.studentSubmitted = false; S.sel.clear(); S.eSel.clear(); S.flash = new Set(); S.panel = null;
  }

  /* ---------- icons (stroke, 18px) ---------- */
  const P = {
    home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
    book: 'M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3zM4 17a3 3 0 0 1 3-3h11',
    edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
    inbox: 'M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z',
    users: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M22 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z',
    lock: 'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3',
    play: 'M8 5v14l11-7z',
    check: 'M5 12.5 10 17 19 7',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
    up: 'M12 19V5M6 11l6-6 6 6', down: 'M12 5v14M6 13l6 6 6-6',
    plus: 'M12 5v14M5 12h14', file: 'M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5',
    sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
    alert: 'M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    upload: 'M12 16V4M6 10l6-6 6 6M4 20h16', x: 'M6 6l12 12M18 6 6 18', chev: 'M9 6l6 6-6 6', back: 'M15 6l-6 6 6 6',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2', grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    heading: 'M6 4v16M18 4v16M6 12h12', text: 'M4 6h16M4 12h16M4 18h10', image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',
    callout: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5', quiz: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01',
    minus: 'M5 12h14', copy: 'M9 9h11v11H9zM5 15H4V4h11v1', trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
    undo: 'M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3', redo: 'M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h3',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
    hand: 'M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8a8 8 0 0 0 16 0v-3a2 2 0 0 0-4 0',
    cursor: 'M5 3l14 7-6 2-2 6z', connect: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7.5 15.5l9-8',
    note: 'M5 4h14v10l-6 6H5zM13 20v-6h6', fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5', map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14'
  };
  /* One outline family: sizes snap to 12 / 16 / 18 / 20 / 24, stroke 1.75 (2.25 at 12 px so small checks stay legible). */
  const ICON_SIZES = [12, 16, 18, 20, 24];
  const ic = (n, s = 18) => { const z = s > 24 ? s : ICON_SIZES.find(v => v >= s) || 24; const w = z <= 12 ? 2.25 : 1.75;
    return `<svg width="${z}" height="${z}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`; };

  const symbol = (h = 22, mid = '#0B0D17', out = '#2A3BFF') => `<svg width="${Math.round(h * 52 / 48)}" height="${h}" viewBox="6 8 52 48" aria-hidden="true"><rect x="6" y="8" width="52" height="13" rx="6.5" fill="${out}"/><rect x="6" y="25.5" width="24" height="13" rx="6.5" fill="${mid}"/><rect x="6" y="43" width="52" height="13" rx="6.5" fill="${out}"/></svg>`;
  const wordmark = (h = 18) => `<svg width="${Math.round(h * 4.71)}" height="${h}" overflow="visible" viewBox="${LOGO.vb}" fill="currentColor" role="img" aria-label="cohorta">${LOGO.wm}</svg>`;
  const lockup = () => `<a href="#/${S.role}/home" class="brand">${symbol(22)}${wordmark(19)}</a>`;

  /* Status → meaning. Five families, one colour each: danger (overdue, failed), warning (needs a decision),
     info (in motion, AI draft waiting), success (live or done well), neutral (no action needed). */
  const STATUS = {
    'Late': 'danger', 'Error': 'danger',
    'Paused': 'warning', 'In review': 'warning',
    'AI draft ready': 'info', 'Invited': 'info', 'In progress': 'info', 'Scheduled': 'info',
    'Graded': 'success', 'Published': 'success', 'Running': 'success', 'Active': 'success',
    'Draft': 'neutral', 'Not started': 'neutral', 'Submitted': 'neutral', 'Returned': 'neutral', 'Archived': 'neutral', 'Completed': 'neutral', 'Dropped': 'neutral', 'Locked': 'neutral'
  };
  const tagClass = s => 'st-' + (STATUS[s] || 'neutral');
  const tag = s => `<span class="tag ${tagClass(s)}">${esc(s)}</span>`;
  // Person row: avatar, name, one line of context, status, action. Same grid in every list of people.
  const personRow = (avatar, name, meta, status = '', action = '') => `<div class="row prow">${avatar}<div class="prow-txt"><div class="prow-name" title="${esc(name)}">${esc(name)}</div><div class="prow-meta">${meta}</div></div><span class="prow-status">${status}</span>${action}</div>`;
  const subLabel = s => ({ ai: 'AI draft ready', submitted: 'Submitted', late: 'Late', graded: 'Graded', returned: 'Returned' }[s]);
  /* Illustrated, faceless avatars. The same drawing function builds the Avatar/<name> components in Figma. */
  const AV_PEOPLE = {
    'Hannah Cole': ['#C9CDFF', 'a', 'bun', '#7A4B2A', '#2A3BFF'], 'Leo Rossi': ['#FFE2C2', 'b', 'short', '#2B2118', '#0B0D17'], 'Mia Novak': ['#E3F2E8', 'a', 'long', '#C9A06A', '#FF6B3D'],
    'Jonas Weber': ['#FDE3E1', 'a', 'side', '#B58B57', '#3A3D4A'], 'Tom Walsh': ['#FFF1C2', 'b', 'buzz', '#5B3A22', '#2A3BFF'], 'Chloé Martin': ['#E6E8FF', 'a', 'bob', '#2B2118', '#0B0D17'],
    'Yuki Tanaka': ['#E3F2E8', 'b', 'bob', '#111111', '#FF6B3D'], 'Noah Becker': ['#C9CDFF', 'c', 'curly', '#2B2118', '#0B0D17'], 'Lucía Fernández': ['#FFE2C2', 'c', 'long', '#2B2118', '#2A3BFF'],
    'Omar Haddad': ['#E6E8FF', 'c', 'short', '#111111', '#3A3D4A'], 'Maria Lopez': ['#FDE3E1', 'b', 'long', '#4A2C1C', '#0B0D17'], 'Sofia Rossi': ['#FFE2C2', 'a', 'bob', '#A0522D', '#FF6B3D'],
    'Amira Bensaid': ['#E3F2E8', 'c', 'long', '#111111', '#0B0D17'], 'Priya Nair': ['#FFF1C2', 'd', 'long', '#111111', '#2A3BFF'], 'Alex Morgan': ['#C9CDFF', 'b', 'side', '#2B2118', '#0B0D17'],
    'Nadia Kowalski': ['#FDE3E1', 'a', 'bun', '#C9A06A', '#3A3D4A'], 'Kofi Mensah': ['#FFF1C2', 'e', 'buzz', '#111111', '#2A3BFF'], 'Pablo Ruiz': ['#E6E8FF', 'b', 'curly', '#3B2416', '#FF6B3D'],
  };
  const AV_BG = ['#C9CDFF', '#FFE2C2', '#E3F2E8', '#FDE3E1', '#FFF1C2', '#E6E8FF'], AV_HAIR = ['short', 'side', 'bob', 'long', 'bun', 'curly', 'buzz'], AV_HC = ['#111111', '#2B2118', '#4A2C1C', '#7A4B2A', '#B58B57', '#C9A06A', '#A0522D'], AV_SHIRT = ['#2A3BFF', '#0B0D17', '#FF6B3D', '#3A3D4A'];
  const hashOf = t => { let h = 2166136261; for (const ch of String(t)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const avParams = name => AV_PEOPLE[name] || (h => [AV_BG[h % 6], 'abcde'[(h >> 3) % 5], AV_HAIR[(h >> 6) % 7], AV_HC[(h >> 9) % 7], AV_SHIRT[(h >> 12) % 4]])(hashOf(name));
  // Muted avatar palette. Each original colour maps to one token, so every person keeps their own drawing.
  const AV_TOKEN = { '#C9CDFF': 'var(--av-bg-1)', '#FFE2C2': 'var(--av-bg-2)', '#E3F2E8': 'var(--av-bg-3)', '#FDE3E1': 'var(--av-bg-4)', '#FFF1C2': 'var(--av-bg-5)', '#E6E8FF': 'var(--av-bg-6)',
    '#2A3BFF': 'var(--av-shirt-1)', '#0B0D17': 'var(--av-shirt-2)', '#FF6B3D': 'var(--av-shirt-3)', '#3A3D4A': 'var(--av-shirt-4)' };
  function avatarSVG(name) {
    const [bg0, sk, hair, hc, shirt0] = avParams(name); const bg = AV_TOKEN[bg0] || bg0, shirt = AV_TOKEN[shirt0] || shirt0;
    const skin = { a: '#F3D2B8', b: '#E3B08E', c: '#C98B62', d: '#8D5A3B', e: '#5E3A26' }[sk];
    const top = 'M21.5 29c-1-9 4.5-14 11-14s11.5 4.6 10.5 12.5c-2.5-3.6-6.8-5.6-11.5-5-4.3.6-7.7 2.9-10 6.5z';
    const H = { short: `<path d="${top}" fill="${hc}"/>`, side: `<path d="M21 30c-1.5-10 4.5-15.5 11.5-15.5 7.2 0 12 5 11 13-4-1.5-9-4.6-12-8.6-2 4.4-6 8.2-10.5 11.1z" fill="${hc}"/>`,
      bob: `<path d="M19.5 33c-1.6-11.5 4-18.5 12.7-18.5 8.7 0 14.1 7 12.3 18.5l.5 5.5c-2.6.5-4.3-1.6-4.3-4.5v-6c-4.5-3-12.5-3.6-16.5-.6v6.6c0 2.9-1.8 5-4.4 4.5z" fill="${hc}"/>`,
      long: `<path d="M19 31c-1-11 4.7-16.5 13-16.5S46 20 45 31l.8 15.5c-2.8 1-5.6-.6-5.6-4.6V28.5c-4.4-3.5-11.6-3.8-16.4-.5v13.9c0 4-2.8 5.6-5.6 4.6z" fill="${hc}"/>`,
      bun: `<circle cx="32" cy="12.5" r="5.2" fill="${hc}"/><path d="${top}" fill="${hc}"/>`,
      curly: `<g fill="${hc}"><circle cx="24" cy="22" r="4.6"/><circle cx="29" cy="17.5" r="4.8"/><circle cx="35.5" cy="17" r="4.8"/><circle cx="40.5" cy="21.5" r="4.6"/><circle cx="22.2" cy="27.5" r="3.6"/><circle cx="42" cy="27.5" r="3.6"/></g>`,
      buzz: `<path d="M22 27.5c0-7.5 4.6-11.5 10.5-11.5S43 20 43 27.5c-3-3.2-6.6-4.6-10.5-4.6s-7.6 1.4-10.5 4.6z" fill="${hc}"/>` }[hair];
    const back = hair === 'long' || hair === 'bob';
    return `<svg viewBox="5 6 54 54" width="100%" height="100%" aria-hidden="true"><rect x="5" y="6" width="54" height="54" fill="${bg}"/>${back ? H : ''}<path d="M9 66c0-12.5 9.5-20.5 23-20.5S55 53.5 55 66z" fill="${shirt}"/><path d="M27.5 37h9v7.5c0 2.6-2 4.5-4.5 4.5s-4.5-1.9-4.5-4.5z" fill="${skin}"/><path d="M27.5 41.5c2.8 1.4 6.2 1.4 9 0V39h-9z" opacity=".08"/><ellipse cx="32.3" cy="29" rx="10" ry="11.4" fill="${skin}"/>${back ? '' : H}</svg>`;
  }
  // Initials alone are ambiguous, so callers pass the full name where they have it; known initials map to people in the sample school.
  const nameFor = i => { const all = [...Object.values(D.people), ...D.subs.map(s => ({ name: s.student, initials: s.initials })), ...D.enrolments.map(e => ({ name: e.student, initials: e.initials })), ...D.staff]; const f = all.find(p => p.initials === i); return f ? f.name : i; };
  const av = (i, n) => `<span class="avatar ill" aria-hidden="true" title="${esc(n || nameFor(i))}">${avatarSVG(n || nameFor(i))}</span>`;
  const bar = (p, c = '') => `<div class="bar ${c}" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><span style="width:${p}%"></span></div>`;

  /* ---------- navigation ---------- */
  const NAV = {
    student: [['home', 'Home', 'home'], ['lesson', 'Current lesson', 'play'], ['assignment', 'Assignment', 'file'], ['grades', 'Grades', 'chart']],
    instructor: [['home', 'Dashboard', 'home'], ['queue', 'Grading queue', 'inbox'], ['builder', 'Course builder', 'book'], ['editor', 'Assignment editor', 'edit'], ['roster', 'Cohort roster', 'users']],
    ta: [['queue', 'Grading queue', 'inbox'], ['roster', 'Group roster', 'users']],
    admin: [['home', 'Overview', 'home'], ['catalogue', 'Courses', 'grid'], ['enrolments', 'Enrolments', 'list'], ['users', 'Users and roles', 'shield']]
  };
  const stOf = s => S.done.has(s.id) ? 'graded' : S.ret.has(s.id) ? 'returned' : s.status;
  // A submission with an AI draft starts from the AI's rubric split; one without starts empty, so no score appears that nobody gave.
  const split4 = t => { const a = [Math.round(t * .26), Math.round(t * .25), Math.round(t * .24)].map(x => Math.min(25, x)); a.push(Math.max(0, Math.min(25, t - a[0] - a[1] - a[2]))); return a; };
  // Work graded before the demo opens: the rubric adds up to the released score, and the AI draft counts as edited.
  const aiState = s => S.ai[s.id] || (S.ai[s.id] = s.final != null
    ? { mode: s.ai ? 'edit' : 'none', final: null, crit: split4(s.final) }
    : { mode: s.ai ? 'draft' : 'none', final: null, crit: s.ai ? split4(s.ai) : ['', '', '', ''] });
  const scoreOf = s => { const st = aiState(s); return st.final != null ? st.final : st.crit.reduce((x, y) => x + (+y || 0), 0); };
  // Release rule: a grade leaves only after a person has looked at it.
  const emptyScore = st => st.final == null && st.crit.every(x => x === '' || x == null);
  const needsReview = s => { const st = aiState(s); return st.mode === 'draft' || emptyScore(st); };
  const lockWhy = s => aiState(s).mode === 'draft' ? 'Accept, edit or discard the AI draft first. Students only see a grade you release.' : 'Enter a score first. Students only see a grade you release.';
  const scoreText = s => emptyScore(aiState(s)) ? '' : String(scoreOf(s));
  const howGraded = s => ({ accept: 'AI draft accepted', edit: 'AI draft edited' }[aiState(s).mode] || 'graded by hand');
  const readyToRelease = s => ['ai', 'submitted', 'late'].includes(stOf(s)) && !needsReview(s);
  const releaseRow = (s, act, extra = '') => {
    const label = `Release grade${scoreText(s) ? ' ' + scoreText(s) : ''}`;
    const btn = needsReview(s) ? lockBtn(label, lockWhy(s), 'btn') : `<button class="btn primary" data-act="${act}" data-v="${s.id}"${extra}>${label}</button>`;
    return `<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="returnOne" data-v="${s.id}">Return for revision</button><span class="spacer u-grow"></span>${btn}</div>`
      + (needsReview(s) ? `<p class="muted release-hint">${aiState(s).mode === 'draft' ? 'Release unlocks after you accept, edit or discard the AI draft.' : 'Release unlocks once there is a score.'}</p>` : '');
  };
  const finalOf = s => { const k = stOf(s); if (k === 'graded') return S.done.has(s.id) ? scoreOf(s) : s.final; if (k === 'returned') return S.ret.has(s.id) ? scoreOf(s) : s.final; return null; };
  // Scope: a teaching assistant sees only the groups assigned to them; the rules stay the same.
  const myGroup = () => S.role === 'ta' ? D.people.ta.group : null;
  const mySubs = () => myGroup() ? D.subs.filter(s => s.group === myGroup()) : D.subs;
  const inScope = s => !myGroup() || s.group === myGroup();
  const pending = () => mySubs().filter(s => ['ai', 'submitted', 'late'].includes(stOf(s)));
  const toReview = () => pending().length;
  const inReview = () => D.catalogue.filter(c => c.state === 'In review');
  const pl = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const audit = what => D.audit.unshift({ when: 'Oct 6, 2026 · ' + new Date().toTimeString().slice(0, 5), who: D.people[S.role].name, what });

  function side() {
    const me = D.people[S.role];
    const items = NAV[S.role].map(([p, l, i]) => {
      const count = ['instructor', 'ta'].includes(S.role) && p === 'queue' ? `<span class="count">${toReview()}</span>` : S.role === 'admin' && p === 'catalogue' && inReview().length ? `<span class="count">${inReview().length}</span>` : '';
      return `<a href="#/${S.role}/${p}" ${S.page === p || (p === 'queue' && S.page === 'grade') || (p === 'builder' && S.page === 'lesson') ? 'aria-current="page"' : ''} title="${l}">${ic(i)}<span class="lbl">${l}</span>${count}</a>`;
    }).join('');
    const ctx = S.role === 'student' ? 'UXF · Spring 2026' : S.role === 'instructor' ? 'UXF · Spring 2026' : S.role === 'ta' ? `UXF · Spring 2026 · ${myGroup()}` : 'Cohorta School';
    return `<aside class="side" aria-label="Main">${lockup()}<div><div class="nav-label">${esc(ctx)}</div><nav class="nav">${items}</nav></div>
      <div class="me" title="${esc(me.name)} · ${me.role}">${av(me.initials, me.name)}<div class="me-txt"><div class="u-strong">${esc(me.name)}</div><div class="muted u-small">${me.role}</div></div></div></aside>`;
  }
  function mobileChrome() {
    const items = NAV[S.role].slice(0, 4).map(([p, l, i]) => `<a href="#/${S.role}/${p}" ${S.page === p || (p === 'builder' && S.page === 'lesson') ? 'aria-current="page"' : ''}>${ic(i, 20)}<span>${l.split(' ')[0]}</span></a>`).join('');
    return { top: `<div class="mtop">${symbol(20)}${wordmark(16)}<span class="grow"></span>${av(D.people[S.role].initials, D.people[S.role].name)}</div>`, bottom: `<nav class="mnav" aria-label="Main">${items}</nav>` };
  }
  function demoBar() {
    const seg = (key, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button type="button" data-act="${key}" data-v="${v}" aria-pressed="${S[key] === v}">${l}</button>`).join('')}</div>`;
    return `<div class="demo" role="region" aria-label="Demo controls"><b>Cohorta demo</b><span class="show-m dhint">Demo controls · sample data</span><a class="dsite" href="#/">Product site</a><span class="dgrp"><span class="dlab">View as</span>${seg('role', [['student', 'Student'], ['instructor', 'Instructor'], ['ta', 'TA'], ['admin', 'Admin']])}</span>
      <span class="dsep" aria-hidden="true"></span><span class="dgrp"><span class="dlab">State</span>${seg('demo', [['normal', 'Normal'], ['empty', 'Empty'], ['loading', 'Loading'], ['error', 'Error'], ['denied', 'No access'], ['long', 'Long data']])}</span>
      <span class="spacer"></span><span class="dnote">Self-initiated case study · sample data · UX/UI by Tania Aisen</span></div>`;
  }

  /* ---------- shared states ---------- */
  const head = (title, sub = '', actions = '', crumbs = '') => `<div class="page-head"><div>${crumbs ? `<div class="crumbs">${crumbs}</div>` : ''}<h1>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
  const emptyState = (title, text, action = '', icon = 'inbox') => `<div class="card empty"><div class="ico">${ic(icon, 22)}</div><h3>${title}</h3><p>${text}</p>${action}</div>`;
  const studentSkeleton = () => `<div class="card sk-hero"><div class="skel" style="width:48px;height:48px;border-radius:var(--r-md)"></div><div class="skel" style="height:12px;width:40%;margin-top:14px"></div><div class="skel" style="height:22px;width:70%;margin-top:10px"></div><div class="skel" style="height:44px;width:100%;margin-top:16px;border-radius:var(--r-md)"></div></div><div class="card">${'<div style="display:flex;gap:12px;align-items:center;margin:10px 0"><div class="skel" style="width:36px;height:36px;border-radius:var(--r-md)"></div><div class="u-grow"><div class="skel" style="height:12px;width:55%"></div><div class="skel" style="height:10px;width:35%;margin-top:8px"></div></div></div>'.repeat(4)}</div>`;
  const skeleton = () => `<div class="grid g-4 u-mb4">${'<div class="card"><div class="skel" style="height:14px;width:60%"></div><div class="skel" style="height:30px;width:40%;margin-top:12px"></div></div>'.repeat(4)}</div>
    <div class="tablebox" style="padding:12px" aria-busy="true" aria-label="Loading">${'<div style="display:flex;gap:16px;padding:12px 4px"><div class="skel" style="width:28px;height:28px;border-radius:50%"></div><div class="skel" style="height:14px;flex:2;margin-top:7px"></div><div class="skel" style="height:14px;flex:1;margin-top:7px"></div><div class="skel" style="height:14px;flex:1;margin-top:7px"></div></div>'.repeat(8)}</div>`;
  const errorBanner = (what) => `<div class="banner error" role="alert">${ic('alert', 20)}<div class="grow"><b>We couldn't load ${what}.</b>Check your connection and try again. Your last changes are saved.</div><button class="btn sm" data-act="demo" data-v="normal">Try again</button></div>`;
  const denied = (what, who, alt) => `<div class="denied card"><div class="lock">${ic('lock', 24)}</div><h2>You can't open ${what}</h2>
    <p class="muted" style="margin:0 0 16px">${who}</p>${alt}</div>`;
  function guard(cfg, render) {
    if (S.demo === 'loading') return head(cfg.title, cfg.sub) + (S.role === 'student' ? studentSkeleton() : skeleton());
    if (S.demo === 'denied') return head(cfg.title) + denied(cfg.deniedWhat, cfg.deniedWho, cfg.deniedAlt || '');
    if (S.demo === 'error') return head(cfg.title, cfg.sub) + errorBanner(cfg.errWhat);
    if (S.demo === 'empty') return cfg.empty.startsWith('<div class="page-head"') ? cfg.empty : head(cfg.title, cfg.sub) + cfg.empty;
    return render();
  }
  const lockBtn = (label, why, cls = 'btn') => `<span class="lockwrap"><button class="${cls}" aria-disabled="true" aria-describedby="why-${label.replace(/\W/g, '')}">${ic('lock', 14)}${label}</button><span class="why" role="tooltip" id="why-${label.replace(/\W/g, '')}">${why}</span></span>`;

  /* ================= INSTRUCTOR ================= */
  function iHome() {
    const n = toReview(); const late = D.subs.filter(s => stOf(s) === 'late').length;
    return guard({ title: 'Good afternoon, Maria', sub: 'UX Design Fundamentals · 2 cohorts', errWhat: 'your dashboard', deniedWhat: 'this dashboard', deniedWho: 'Your instructor access ended on Sep 30. Ask an admin to renew it.',
      empty: `<div class="grid g-main"><div>${emptyState('No submissions yet', 'Your next review will appear here when students submit work for Spring 2026.', '<a class="btn" href="#/instructor/builder">Open course builder</a>')}</div><div class="card u-start"><h2>Upcoming deadlines</h2><p class="muted u-m0">No deadlines in the next 14 days.</p></div></div>` }, () => `
      ${head('Good afternoon, Maria', 'UX Design Fundamentals · Spring 2026 and Autumn 2026')}
      <div class="card cta-card u-mb4"><div class="u-grow"><div class="big">${pl(n, 'submission', 'submissions')} to review</div><div class="muted">${late === 1 ? '1 is late' : late + ' are late'} · AI drafts are ready for ${D.subs.filter(s => stOf(s) === 'ai').length}. You always confirm the grade.</div></div>
        <a class="btn primary" href="#/instructor/queue">Review ${pl(n, 'submission', 'submissions')}</a></div>
      <div class="grid g-4 u-mb4">
        <div class="card stat"><div class="label">Active cohorts</div><div class="val num">2</div><div class="hint">96 students</div></div>
        <div class="card stat"><div class="label">To review</div><div class="val num">${n}</div><div class="hint">Oldest from Sep 29</div></div>
        <div class="card stat alert"><div class="label">Students at risk</div><div class="val num">12</div><div class="hint">No activity in 7+ days</div></div>
        <div class="card stat"><div class="label">Next deadline</div><div class="val num">Oct 14</div><div class="hint">Usability test report</div></div>
      </div>
      <div class="grid g-main">
        <div class="card"><h2>Students at risk</h2><div class="list">
          ${[['Mateo Silva', 'MS', 'No activity for 15 days', 'Paused'], ['Amira Bensaid', 'AB', '2 assignments late', 'Late'], ['Tom Walsh', 'TW', 'Stuck on Module 2 for 11 days', 'Late'], ['Elena Popescu', 'EP', 'Last login Sep 24', 'Paused'], ['Noah Becker', 'NB', 'Wireframe review returned twice', 'Returned']]
            .map(([nm, i, why, t]) => personRow(av(i, nm), nm, why, tag(t), `<a class="btn sm" href="#/instructor/roster" aria-label="Open ${esc(nm)} in the roster">Open</a>`)).join('')}
          </div></div>
        <div class="grid">
          <div class="card"><h2>Upcoming deadlines</h2><div class="list">
            <div class="row"><div class="u-grow"><b>Usability test report</b><div class="muted u-meta">Spring 2026 · 48 students</div></div><span class="num">Oct 14</span></div>
            <div class="row"><div class="u-grow"><b>Cohort starts</b><div class="muted u-meta">Autumn 2026</div></div><span class="num">Oct 20</span></div>
            <div class="row"><div class="u-grow"><b>Final case study</b><div class="muted u-meta">Spring 2026</div></div><span class="num">Nov 4</span></div></div></div>
          <div class="card"><h2>Recent activity</h2><div class="list u-meta">
            <div class="row"><span class="u-grow">Leo Rossi submitted Wireframe review</span><span class="muted">2 h</span></div>
            <div class="row"><span class="u-grow">Nadia Kowalski graded 4 submissions</span><span class="muted">5 h</span></div>
            <div class="row"><span class="u-grow">Course v2 pushed to Spring 2026</span><span class="muted">1 d</span></div></div></div>
        </div>
      </div>`);
  }

  function filteredSubs() {
    let rows = mySubs().map(s => ({ ...s, status: stOf(s), final: finalOf(s) }));
    if (S.qStatus !== 'all') rows = rows.filter(r => r.status === S.qStatus);
    if (S.q) rows = rows.filter(r => r.student.toLowerCase().includes(S.q.toLowerCase()));
    const ord = d => { const [m, day] = d.split(' '); return (m === 'Sep' ? 0 : 100) + +day; };
    // Priority: late work first, then whatever has waited longest; returned and graded work sinks to the bottom.
    const rank = { late: 0, ai: 1, submitted: 1, returned: 2, graded: 3 };
    if (S.qSort === 'priority') rows.sort((a, b) => (rank[a.status] ?? 1) - (rank[b.status] ?? 1) || ord(a.submitted) - ord(b.submitted));
    else rows.sort((a, b) => S.qSort === 'newest' ? ord(b.submitted) - ord(a.submitted) : ord(a.submitted) - ord(b.submitted));
    return rows;
  }
  function iQueue() {
    return guard({ title: 'Grading queue', sub: 'UXF · Spring 2026', errWhat: 'submissions', deniedWhat: 'this grading queue', deniedWho: 'Teaching assistants only see the groups they are assigned to. Group B belongs to Ben Okafor.',
      deniedAlt: `<a class="btn" href="#/${S.role}/queue" data-act="demo" data-v="normal">Open my groups</a>`,
      empty: emptyState('No submissions yet', 'Your next review will appear here. Students submit Wireframe review by Oct 2.', '<a class="btn" href="#/instructor/editor">Check the assignment</a>') }, () => {
      const rows = filteredSubs();
      const counts = s => mySubs().filter(x => stOf(x) === s).length;
      const chips = [['all', `All ${mySubs().length}`], ['ai', `AI draft ready ${counts('ai')}`], ['submitted', `Submitted ${counts('submitted')}`], ['late', `Late ${counts('late')}`], ['graded', `Graded ${counts('graded')}`], ['returned', `Returned ${counts('returned')}`]]
        .map(([v, l]) => `<button class="chip" data-act="qStatus" data-v="${v}" aria-pressed="${S.qStatus === v}">${l}</button>`).join('');
      const allSel = rows.length && rows.every(r => S.sel.has(r.id));
      const pad = S.dense ? 'data-dense' : '';
      const dock = dockOn();
      if (dock && !S.panel && !S.dockClosed && rows.length) S.panel = 'grade:' + (rows.find(r => ['ai', 'late', 'submitted'].includes(stOf(r))) || rows[0]).id;
      const cur = S.panel && S.panel.startsWith('grade:') ? S.panel.slice(6) : null;
      const body = rows.map(r => `<tr class="${S.sel.has(r.id) ? 'sel' : ''}${S.flash.has(r.id) ? ' flash' : ''}${cur === r.id ? ' cur' : ''}"><td class="check c-check" ${pad}><label class="hit"><input type="checkbox" aria-label="Select ${esc(r.student)}" data-act="sel" data-v="${r.id}" ${S.sel.has(r.id) ? 'checked' : ''}></label></td>
        <td class="c-student" ${pad}><div class="who">${av(r.initials, r.student)}<div class="u-grow"><button class="linkbtn" data-act="panel" data-v="grade:${r.id}" title="${esc(r.student)}">${esc(r.student)}</button><div class="meta-2nd">${myGroup() ? '' : r.group + ' · '}${r.submitted} · ${esc(r.assignment)}</div></div></div></td>
        <td class="c-2nd" ${pad}>${trunc(r.assignment, 260)}</td>${myGroup() ? '' : `<td ${pad} class="muted c-2nd">${r.group}</td>`}<td ${pad} class="num c-2nd">${r.submitted}</td><td class="c-status" ${pad}>${tag(subLabel(r.status))}</td>
        <td ${pad} class="num c-ai" data-label="AI">${r.ai != null ? `<span class="mono" style="background:var(--surface-tint);padding:2px 6px;border-radius:var(--r-sm)">${r.ai}</span>` : '<span class="muted">—</span>'}</td>
        <td ${pad} class="num c-final u-strong" data-label="Final">${r.final != null ? r.final : '<span class="muted u-regular">—</span>'}</td>
        <td ${pad} class="c-act u-right">${dock ? `<button class="iconbtn rowgo" data-act="panel" data-v="grade:${r.id}" aria-label="${r.status === 'graded' ? 'View' : 'Review'} ${esc(r.student)}">${ic('chev', 18)}</button>` : `<button class="btn sm" data-act="panel" data-v="grade:${r.id}">${r.status === 'graded' ? 'View' : 'Review'}</button>`}</td></tr>`).join('');
      const selRows = rows.filter(r => S.sel.has(r.id));
      const canRelease = selRows.length && selRows.every(r => readyToRelease(D.subs.find(x => x.id === r.id)));
      const bulkEnter = S.sel.size && !S.bulkShown; S.bulkShown = !!S.sel.size;
      const bulk = S.sel.size ? `<div class="bulkbar${bulkEnter ? ' enter' : ''}" role="region" aria-label="Bulk actions"><b>${S.sel.size} selected</b><span class="spacer u-grow"></span>
        ${myGroup() ? '' : '<button class="btn sm" data-act="bulk" data-v="assign">Assign to TA</button>'}<button class="btn sm" data-act="bulk" data-v="return">Return for revision</button>
        ${canRelease ? '<button class="btn sm primary" data-act="bulk" data-v="release">Release grades</button>' : lockBtn('Release grades', 'Release only work you have reviewed. Open each AI draft and check the score first.', 'btn sm')}
        <button class="iconbtn on-dark" aria-label="Clear selection" data-act="clearSel">${ic('x')}</button></div>` : '';
      const metric = (icon, cls, val, label) => `<span class="qm"><span class="qchip ${cls}">${ic(icon, 16)}</span><b class="num">${val}</b>${label}</span>`;
      const stats = `<div class="qsum" role="group" aria-label="Summary">${metric('inbox', 'qc-haze', toReview(), 'to review')}<span class="qdiv"></span>${metric('sparkle', 'qc-ai', counts('ai'), '<span class="hide-m">AI drafts waiting for a decision</span><span class="only-m">AI drafts</span>')}<span class="qdiv"></span>${metric('clock', 'qc-late', counts('late'), 'late')}<span class="spacer u-grow"></span><span class="muted small hide-m">${myGroup() ? `You review ${myGroup()} only · Group B is Ben Okafor’s` : 'Wireframe review is due Oct 2'}</span></div>`;
      const docked = dock && cur;
      return `${head('Grading queue', `UX Design Fundamentals · Spring 2026${myGroup() ? ' · ' + myGroup() : ''}`, '<button class="btn" data-act="dense">' + (S.dense ? 'Comfortable rows' : 'Compact rows') + '</button>')}${stats}
        ${myGroup() ? `<p class="sr">You review ${myGroup()} only. Group B belongs to Ben Okafor. Released grades can be changed by the instructor, Maria Lopez.</p>` : ''}
        <div class="qwrap${docked ? ' docked' : ''}"><div class="qmain"><div class="toolbar"><label class="search">${ic('search', 16)}<span class="sr">Search students</span><input data-act="q" value="${esc(S.q)}" placeholder="Search students"></label>
          <select class="select" aria-label="Cohort"><option>Spring 2026</option><option>Autumn 2026</option></select>
          <select class="select" aria-label="Assignment"><option>All assignments</option><option>Wireframe review</option><option>User interview plan</option></select></div>
        <div class="toolbar qfilters"><div class="chips" role="group" aria-label="Filter by status">${chips}</div><span class="spacer u-grow"></span>
          <span class="muted small hide-m">${S.qSort === 'priority' ? 'Late first, then longest waiting' : S.qSort === 'newest' ? 'Newest submissions first' : 'Oldest submissions first'}</span>
          <select class="select" data-act="qSort" aria-label="Sort queue"><option value="priority" ${S.qSort === 'priority' ? 'selected' : ''}>Sort: Priority</option><option value="oldest" ${S.qSort === 'oldest' ? 'selected' : ''}>Sort: Oldest first</option><option value="newest" ${S.qSort === 'newest' ? 'selected' : ''}>Sort: Newest first</option></select></div>
        <div class="tablebox"><table class="rtable"><thead><tr><th class="check"><label class="hit"><input type="checkbox" aria-label="Select all" data-act="selAll" ${allSel ? 'checked' : ''}></label></th><th>Student</th><th class="c-2nd">Assignment</th>${myGroup() ? '' : '<th class="c-2nd">Group</th>'}
          <th class="sortable c-2nd" data-act="sort" ${S.qSort === 'priority' ? '' : `aria-sort="${S.qSort === 'newest' ? 'descending' : 'ascending'}"`}>Submitted${S.qSort === 'priority' ? '' : S.qSort === 'newest' ? ' ↓' : ' ↑'}</th><th>Status</th><th>AI score</th><th>Final score</th><th></th></tr></thead>
          <tbody>${body || `<tr><td colspan="${myGroup() ? 8 : 9}"><div class="empty" style="padding:32px"><h3>No matches</h3><p>No submissions with this status. Clear the filter to see all ${mySubs().length}.</p><button class="btn sm" data-act="qStatus" data-v="all">Clear filter</button></div></td></tr>`}</tbody></table></div>${bulk}</div>${docked ? `<aside class="panel docked qr" aria-label="Quick review">${gradeBody(cur)}</aside>` : ''}</div>`;
    });
  }

  const FB = 'Strong flow from sign-up to first course. The empty states are thought through. Two things to fix: the enrolment screen hides the cohort dates, and the error on a failed upload does not say what to do next.';
  function aiCard(s, st) {
    // Once a grade is released the draft is history: show how it was used, never the actions.
    if (stOf(s) === 'graded' && s.ai != null) return `<div class="banner info u-m0">${ic('sparkle', 18)}<div class="grow"><b>${howGraded(s) === 'graded by hand' ? 'Graded by hand.' : howGraded(s) === 'AI draft edited' ? 'AI draft edited before release.' : 'AI draft accepted before release.'}</b>AI suggested ${s.ai}. The released grade is ${finalOf(s)}.</div></div>`;
    if (st.mode === 'draft') return `<div class="ai" aria-label="AI draft"><div class="head">${ic('sparkle', 16)}<b>AI draft</b>${tag('AI draft ready')}<span class="spacer u-grow"></span><span class="mono">Suggested ${s.ai}</span></div>
        <div class="ai-text">${D.feedback || FB}</div><div class="muted u-small">Based on the rubric. Check it before you send; students see only what you release.</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm primary" data-act="ai" data-v="accept" data-id="${s.id}">Accept draft</button><button class="btn sm" data-act="ai" data-v="edit" data-id="${s.id}">Edit</button><button class="btn sm ghost" data-act="ai" data-v="discard" data-id="${s.id}">Discard</button></div></div>`;
    if (st.mode === 'none') return `<div class="banner info u-m0">${ic('clock', 18)}<div class="grow"><b>AI draft is not ready yet.</b>It usually takes a minute after submission. You can grade without it.</div></div>`;
    if (st.mode === 'discard') return `<div class="banner info u-m0">${ic('x', 18)}<div class="grow"><b>AI draft discarded.</b>Grade with the rubric.</div><button class="btn sm" data-act="ai" data-v="restore" data-id="${s.id}">Undo</button></div>`;
    if (st.mode === 'accept') return `<div class="banner info u-m0">${ic('check', 18)}<div class="grow"><b>AI draft accepted as a starting point.</b>Score and feedback are filled in. Check them, then release.</div></div>`;
    if (st.mode === 'edit') return `<div class="banner info u-m0">${ic('edit', 18)}<div class="grow"><b>Editing the AI draft.</b>Your version replaces the draft; the student sees only what you release.</div></div>`;
    return '';
  }
  const fbFor = st => (st.mode === 'accept' || st.mode === 'edit') ? (st.fb != null ? st.fb : (D.feedback || FB)) : (st.fb || '');
  const stateBanner = s => stOf(s) === 'graded' ? `<div class="banner info u-m0">${ic('check', 18)}<div class="grow"><b>Graded and released.</b>${myGroup() ? 'Only the instructor can change a released grade. Ask Maria Lopez if it needs a correction.' : 'You can change the grade within 7 days; every change is logged.'}</div></div>`
    : stOf(s) === 'returned' ? `<div class="banner warn u-m0">${ic('back', 18)}<div class="grow"><b>Returned for revision.</b>${esc(s.student.split(' ')[0])} can submit attempt 2 of 2.</div></div>` : '';
  // A locked action stays visible, with one line on why and who can do it.
  const releasedRow = () => myGroup() ? `<div style="display:flex;justify-content:flex-end">${lockBtn('Change grade', 'Only the instructor can change a released grade.', 'btn')}</div><p class="muted release-hint">Locked for teaching assistants after release. Every change by the instructor is logged.</p>` : '';
  function iGrade(id) {
    const all = D.subs.find(x => x.id === id) || mySubs()[0];
    // Out-of-scope work is a real permission rule for a TA, not only a demo state.
    if (!inScope(all)) return head(esc(all.student), `${esc(all.assignment)} · ${all.group}`, '', `<a href="#/${S.role}/queue">Grading queue</a> / ${esc(all.assignment)}`)
      + denied('this submission', `${esc(all.student)} is in ${all.group}, which is assigned to Ben Okafor. You review ${myGroup()} only.`, `<a class="btn" href="#/${S.role}/queue">Back to my queue</a>`);
    const list = mySubs(); const idx = Math.max(0, list.findIndex(x => x.id === all.id)); const s = list[idx];
    const st = aiState(s);
    const locked = !!myGroup() && stOf(s) === 'graded';
    const total = scoreText(s) || '—';
    const prev = list[(idx - 1 + list.length) % list.length].id, next = list[(idx + 1) % list.length].id;
    return guard({ title: s.student, errWhat: 'this submission', deniedWhat: 'this submission', deniedWho: `${s.student} is in ${s.group}, which is assigned to another teaching assistant.`, deniedAlt: `<a class="btn" href="#/${S.role}/queue">Back to my queue</a>`,
      empty: emptyState('Nothing submitted', `${s.student} has not submitted ${s.assignment} yet. You'll get a notification when they do.`, `<a class="btn" href="#/${S.role}/queue">Back to queue</a>`, 'file') }, () => `
      ${head(esc(s.student), `${esc(s.assignment)} · ${s.group} · submitted ${s.submitted}`, `<a class="btn" href="#/${S.role}/grade/${prev}" aria-label="Previous submission">${ic('back', 16)}<span class="kbd">K</span></a><a class="btn" href="#/${S.role}/grade/${next}" aria-label="Next submission"><span class="kbd">J</span>${ic('chev', 16)}</a>`,
        `<a href="#/${S.role}/queue">Grading queue</a> / ${esc(s.assignment)}`)}
      ${stateBanner(s) ? `<div class="u-mb4">${stateBanner(s)}</div>` : ''}
      <div class="gtabs" role="tablist" aria-label="Grading workspace"><button role="tab" aria-selected="${(S.gtab || 'doc') === 'doc'}" data-act="gtab" data-v="doc">Document</button><button role="tab" aria-selected="${S.gtab === 'assess'}" data-act="gtab" data-v="assess">Assessment · ${total}</button></div>
      <div class="split show-${S.gtab || 'doc'}">
        <div class="doc"><div class="mono muted">wireframe-review-${s.initials.toLowerCase()}.pdf · 6 pages</div>
          <h2 class="h-doc">Enrolment flow: wireframes v2</h2><div class="muted">Submitted ${s.submitted}, 2026 · attempt 1 of 2</div>
          <div class="frame">Page 1 · Sign-up and course choice</div>
          <p>I mapped the flow from the course page to the first lesson. The main change from v1 is a single step for choosing the cohort, so students see dates before they pay.</p>
          <div class="frame">Page 2 · Cohort choice and confirmation</div>
          <button class="btn primary only-small" style="width:100%;margin-top:8px" data-act="gtab" data-v="assess">Continue to assessment</button></div>
        <div class="grid assess" style="gap:12px">${aiCard(s, st)}
          <div class="card rubric"><h2 style="margin-bottom:4px">Rubric</h2>
            ${[['Problem framing', 25], ['Flow and structure', 25], ['States and edge cases', 25], ['Clarity of handoff', 25]].map(([n, max], i) => `<div class="r"><label for="c${i}">${n}<span class="muted"> / ${max}</span></label><input id="c${i}" class="score-input num" inputmode="numeric" data-act="crit" data-id="${s.id}" data-v="${i}" value="${st.crit[i]}" ${locked ? 'disabled' : ''}></div>`).join('')}
            <div class="r u-strong"><span>Final score</span><span class="num gc-score">${total}<small> / 100</small></span></div></div>
          <div class="card"><div class="field"><label for="fb">Feedback to ${esc(s.student.split(' ')[0])}</label><textarea id="fb" placeholder="Write feedback the student can act on" data-act="fbtext" data-id="${s.id}" ${locked ? 'disabled' : ''}>${esc(fbFor(st))}</textarea><span class="help">Students see feedback only after you release it.</span></div>
            <div style="margin-top:12px">${stOf(s) === 'graded' ? releasedRow() : releaseRow(s, 'release', ` data-next="${next}"`)}</div></div>
        </div></div>`);
  }

  function iBuilder() {
    const mods = S.order || (S.order = D.course.modules.map(m => ({ ...m, items: [...m.items] })));
    const kindIc = k => k === 'lesson' ? ic('play', 14) : ic('file', 14);
    return guard({ title: 'UX Design Fundamentals', errWhat: 'the course', deniedWhat: 'this course', deniedWho: 'Only the course owner and admins can edit it. The owner is Maria Lopez.',
      empty: head('New course', 'Draft · not visible to students') + emptyState('Start with a module', 'A module groups lessons and assignments. Most courses have 3 to 6.', '<button class="btn primary" data-act="start" data-v="#/instructor/builder">' + ic('plus', 16) + 'Add first module</button>', 'book') }, () => `
      ${head('UX Design Fundamentals', `${tag('Published')} <span class="mono" style="margin-left:6px">v2</span> · 4 modules · 15 items · owner Maria Lopez`, `${presence()}${viewSeg()}<button class="btn primary" data-act="modal" data-v="publish">Send v3 for review</button>`, '<a href="#/instructor/home">Dashboard</a> / Course builder')}
      <div class="banner warn">${ic('alert', 18)}<div class="grow"><b>You're editing a draft of v3.</b>Spring 2026 keeps v2 until an admin pushes the update, so students never see content change mid-lesson.</div></div>
      <div class="grid g-main">
        <div>${mods.map((m, mi) => `<section class="module"><div class="module-head"><span class="handle">${ic('grip', 16)}</span><b>Module ${mi + 1} · ${esc(m.title)}</b><span class="muted u-meta">${m.items.length} items</span><span class="spacer u-grow"></span>
            <button class="iconbtn" aria-label="Move module up" data-act="mv" data-v="${mi},-1" ${mi === 0 ? 'disabled' : ''}>${ic('up', 16)}</button><button class="iconbtn" aria-label="Move module down" data-act="mv" data-v="${mi},1" ${mi === mods.length - 1 ? 'disabled' : ''}>${ic('down', 16)}</button></div>
            ${m.items.map(it => `<div class="item"><span class="handle">${ic('grip', 16)}</span><span class="kind">${kindIc(it.kind)}</span><div class="grow"><div class="u-medium">${esc(it.title)}</div><div class="muted u-small">${it.kind === 'lesson' ? 'Lesson · ' + it.len : 'Assignment · due ' + it.due}</div></div>
              ${it.kind === 'assignment' ? '<a class="btn sm" href="#/instructor/editor">Edit</a>' : `<a class="btn sm" href="#/instructor/lesson/${it.id}">Edit</a>`}</div>`).join('')}
            ${m.items.length ? '' : '<div class="item muted u-meta">No items yet. Add a lesson or an assignment to start this module.</div>'}
            <div class="add-row"><button class="btn sm add" data-act="addItem" data-v="${mi},lesson">${ic('plus', 14)}Add lesson</button><button class="btn sm add" data-act="addItem" data-v="${mi},assignment">${ic('plus', 14)}Add assignment</button></div></section>`).join('')}
          <button class="btn add add-module" data-act="addModule">${ic('plus', 16)}Add module</button></div>
        <div class="grid u-top">
          <div class="card"><h2>Versions</h2><div class="list u-meta">
            <div class="row"><span class="u-grow"><b>v3</b> · draft</span>${tag('Draft')}</div>
            <div class="row"><span class="u-grow"><b>v2</b> · Spring 2026</span>${tag('Published')}</div>
            <div class="row"><span class="u-grow"><b>v1</b> · Summer 2026</span>${tag('Archived')}</div></div></div>
          <div class="card"><h2>Who can do what</h2><div class="list u-meta">
            <div class="row"><span class="u-grow">Edit draft</span><span>You, admins</span></div>
            <div class="row"><span class="u-grow">Publish</span><span>Admins</span></div>
            <div class="row"><span class="u-grow">Push to running cohorts</span><span>Admins</span></div></div>
            <div style="margin-top:12px">${lockBtn('Publish now', 'Only admins can publish courses. Send this draft for review instead.')}</div></div>
        </div></div>`);
  }

  function iEditor() {
    return guard({ title: 'Wireframe review', errWhat: 'the assignment', deniedWhat: 'this assignment', deniedWho: 'The course is archived, so assignments are read-only for everyone.',
      empty: emptyState('No assignments yet', 'Add an assignment to a module to set a brief, a due date and a rubric.', '<a class="btn" href="#/instructor/builder">Open course builder</a>', 'edit') }, () => `
      ${head('Wireframe review', 'Module 2 · Structure · used in 2 cohorts', '<button class="btn" data-load data-act="toast" data-v="Draft saved">Save draft</button>', '<a href="#/instructor/builder">Course builder</a> / Assignment')}
      <div class="grid g-main">
        <div class="grid u-top">
          <div class="card grid" style="gap:14px"><div class="field"><label for="t">Title</label><input id="t" value="Wireframe review"></div>
            <div class="field"><label for="b">Brief</label><textarea id="b">Wireframe the enrolment flow from the course page to the first lesson. Show at least one empty state and one error state. Upload a PDF of 4 to 8 pages.</textarea></div>
            <div class="grid g-2"><div class="field"><label for="d">Due</label><select id="d"><option>4 weeks after cohort start</option><option>5 weeks after cohort start</option></select><span class="help">Spring 2026: Oct 2 · Autumn 2026: Nov 17</span></div>
              <div class="field"><label for="a">Attempts</label><select id="a"><option>2 attempts</option><option>1 attempt</option><option>Unlimited</option></select></div></div></div>
          <div class="card"><h2>Rubric</h2><div class="scrollx"><table><thead><tr><th>Criterion</th><th>What a full score looks like</th><th class="u-right">Points</th></tr></thead><tbody>
            ${[['Problem framing', 'States who the flow is for and what they need to finish', 25], ['Flow and structure', 'Every step has one clear next action', 25], ['States and edge cases', 'Empty, error and locked states are designed', 25], ['Clarity of handoff', 'Annotations a developer can build from', 25]]
              .map(([a, b, c]) => `<tr><td class="u-medium">${a}</td><td class="muted" style="white-space:normal">${b}</td><td class="num u-right">${c}</td></tr>`).join('')}
            <tr><td><b>Total</b></td><td></td><td class="num u-right"><b>100</b></td></tr></tbody></table></div></div></div>
        <div class="grid u-top">
          <div class="card"><h2>AI drafts</h2><label style="display:flex;gap:10px;align-items:flex-start"><input type="checkbox" checked style="margin-top:3px"><span><b>Prepare an AI draft for each submission</b><br><span class="muted u-meta">A suggested score and feedback based on this rubric. Instructors and TAs always confirm before students see anything.</span></span></label></div>
          <div class="card"><h2>Used in</h2><div class="list u-meta"><div class="row"><span class="u-grow">Spring 2026</span>${tag('Running')}</div><div class="row"><span class="u-grow">Autumn 2026</span>${tag('Scheduled')}</div></div>
            <p class="muted u-small note">Changes apply to new submissions. Work already graded keeps its rubric.</p></div></div></div>`);
  }


  /* ================= LESSON EDITOR ================= */
  // Blocks live in a v3 draft. AI adds blocks as drafts; students never see a draft.
  const mods = () => S.order || (S.order = D.course.modules.map(m => ({ ...m, items: [...m.items] })));
  const flatItems = () => mods().flatMap((m, mi) => m.items.map((it, ii) => ({ it, m, mi, ii })));
  const findItem = id => flatItems().find(x => x.it.id === id) || null;
  const links = () => S.links || (S.links = D.course.links.map(l => [...l]));
  const BT = { heading: ['Heading', 'heading'], text: ['Text', 'text'], video: ['Video', 'play'], image: ['Image', 'image'], callout: ['Callout', 'callout'], quiz: ['Quiz question', 'quiz'], divider: ['Divider', 'minus'] };
  let bseq = 100;
  const newBlock = o => ({ ...JSON.parse(JSON.stringify(o)), id: 'b' + (++bseq) });
  function lessonState(id) {
    if (S.lessons[id]) return S.lessons[id];
    const f = findItem(id);
    const src = D.lessons[id] || [{ type: 'heading', text: f ? f.it.title : 'New lesson' }, { type: 'text', text: 'Opening paragraph for this lesson. Edit it right here, or ask AI for a first draft from the title.' }];
    return (S.lessons[id] = { blocks: src.map(newBlock), undo: [], redo: [], sel: null, tab: 'block', aiAct: id === 'l7' ? 'first' : 'quiz', prompt: '', aiNote: '', preview: false });
  }
  const curLesson = () => lessonState(S.param);
  const snap = L => JSON.stringify(L.blocks);
  function change(L, fn) { L.undo.push(snap(L)); if (L.undo.length > 60) L.undo.shift(); L.redo = []; fn(); }
  function undoL(L) { if (!L.undo.length) return; L.redo.push(snap(L)); L.blocks = JSON.parse(L.undo.pop()); if (!L.blocks.some(b => b.id === L.sel)) L.sel = null; }
  function redoL(L) { if (!L.redo.length) return; L.undo.push(snap(L)); L.blocks = JSON.parse(L.redo.pop()); if (!L.blocks.some(b => b.id === L.sel)) L.sel = null; }
  const drafts = L => L.blocks.filter(b => b.ai);
  const minutes = L => Math.max(1, Math.round(L.blocks.filter(b => !b.ai).reduce((t, b) => t + ({ heading: .5, text: 2, video: 7, image: 1, callout: 1, quiz: 1, divider: 0 }[b.type] || 0), 0)));
  const needsAlt = b => b.type === 'image' && !b.decorative && !(b.alt || '').trim();
  function issues(L) {
    const out = [];
    if (!L.blocks.length) out.push({ text: 'The lesson is empty. Students would open a blank page.', bid: null });
    L.blocks.filter(needsAlt).forEach(b => out.push({ text: `Image ${b.file || ''} has no alt text. Screen reader users hear nothing in its place.`, bid: b.id }));
    const d = drafts(L); if (d.length) out.push({ text: `${pl(d.length, 'AI draft is', 'AI drafts are')} waiting for review. Drafts stay hidden from students until you accept them.`, bid: d[0].id });
    return out;
  }
  const blockLabel = b => b ? (b.type === 'heading' || b.type === 'callout' || b.type === 'text' ? `${BT[b.type][0]}, “${(b.text || '').slice(0, 28)}${(b.text || '').length > 28 ? '…' : ''}”` : b.type === 'quiz' ? 'Quiz question' : BT[b.type][0]) : 'the end of the lesson';
  const ce = (b, field, cls, tagName = 'div', ph = '') => `<${tagName} class="${cls}" contenteditable="true" spellcheck="true" data-bedit="${field}" data-bid="${b.id}" data-ph="${esc(ph)}">${esc(b[field] || '')}</${tagName}>`;

  function blockView(b, L, preview) {
    const quizN = L.blocks.filter(x => x.type === 'quiz' && (!preview || !x.ai)); const qi = quizN.indexOf(b);
    if (preview) {
      if (b.type === 'heading') return `<h2 class="b-h">${esc(b.text)}</h2>`;
      if (b.type === 'text') return `<p class="b-p">${esc(b.text)}</p>`;
      if (b.type === 'callout') return `<div class="b-callout">${ic('callout', 16)}<div>${esc(b.text)}</div></div>`;
      if (b.type === 'divider') return '<hr class="b-hr">';
      if (b.type === 'video') return `<div class="b-video"><span class="play">${ic('play', 18)}</span><div class="cap"><b>${esc(b.text)}</b><span>${esc(b.len || '')} · Captions on</span></div></div>`;
      if (b.type === 'image') return `<figure class="b-img"><div class="ph" role="img" aria-label="${esc(b.decorative ? '' : b.alt || '')}">${ic('image', 20)}<span>${esc(b.file || 'image.png')}</span></div>${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>`;
      if (b.type === 'quiz') return `<div class="b-quiz"><div class="overline">Check yourself · question ${qi + 1} of ${quizN.length}</div><div class="q">${esc(b.q)}</div>${b.options.map(o => `<div class="opt"><span class="radio"></span>${esc(o)}</div>`).join('')}</div>`;
      return '';
    }
    const sel = L.sel === b.id;
    let inner = '';
    if (b.type === 'heading') inner = ce(b, 'text', 'b-h', 'h2', 'Heading');
    if (b.type === 'text') inner = ce(b, 'text', 'b-p', 'div', 'Start typing');
    if (b.type === 'callout') inner = `<div class="b-callout">${ic('callout', 16)}${ce(b, 'text', 'grow', 'div', 'A tip students should not miss')}</div>`;
    if (b.type === 'divider') inner = '<hr class="b-hr">';
    if (b.type === 'video') inner = `<div class="b-video"><span class="play">${ic('play', 18)}</span><div class="cap"><b>${esc(b.text)}</b><span>${esc(b.len || '0:00')} · Captions on</span></div></div>`;
    if (b.type === 'image') inner = `<figure class="b-img"><div class="ph">${needsAlt(b) ? '<span class="tag st-danger noalt">No alt text</span>' : ''}${ic('image', 20)}<span>${esc(b.file || 'image.png')}</span></div>${ce(b, 'caption', 'figcap', 'figcaption', 'Add a caption')}</figure>`;
    if (b.type === 'quiz') inner = `<div class="b-quiz"><div class="overline">Quiz · question ${qi + 1} of ${quizN.length}</div>${ce(b, 'q', 'q', 'div', 'Question')}
      ${b.options.map((o, i) => `<div class="opt${b.correct === i ? ' ok' : ''}"><button type="button" class="radio" role="radio" aria-checked="${b.correct === i}" aria-label="Mark as the correct answer" data-act="qCorrect" data-v="${b.id},${i}"></button>${ce({ id: b.id, ['o' + i]: o }, 'o' + i, 'grow', 'div', 'Answer')}${b.correct === i ? '<span class="tag st-success">Correct</span>' : ''}</div>`).join('')}
      <div class="why"><span>Why:</span> ${ce(b, 'why', 'grow', 'span', 'Explain the answer')}</div></div>`;
    const aiHead = b.ai ? `<div class="ai-head">${ic('sparkle', 14)}<span class="tag st-info" data-badge="${b.id}">${b.ai === 'edited' ? 'AI draft · edited by you' : 'AI draft'}</span><span class="grow"></span><button class="btn sm ghost" data-act="aiBlock" data-v="discard,${b.id}">Discard</button><button class="btn sm primary" data-act="aiBlock" data-v="accept,${b.id}">${ic('check', 14)}Accept</button></div>` : '';
    const tools = sel ? `<div class="blk-tools" role="toolbar" aria-label="Block actions"><button class="iconbtn" aria-label="Move up" data-act="blk" data-v="up">${ic('up', 15)}</button><button class="iconbtn" aria-label="Move down" data-act="blk" data-v="down">${ic('down', 15)}</button><button class="iconbtn" aria-label="Duplicate" data-act="blk" data-v="dup">${ic('copy', 15)}</button><button class="iconbtn" aria-label="Delete" data-act="blk" data-v="del">${ic('trash', 15)}</button></div>` : '';
    return `<div class="blk${sel ? ' is-sel' : ''}${b.ai ? ' is-ai' : ''}" id="blk-${b.id}" data-act="selBlock" data-v="${b.id}" data-block="${b.id}">
      <span class="grip" draggable="true" data-drag="move:${b.id}" title="Drag to move" aria-hidden="true">${ic('grip', 14)}</span>${tools}${aiHead}${inner}</div>`;
  }

  function lessonInspector(L, f) {
    const b = L.blocks.find(x => x.id === L.sel);
    const iss = issues(L);
    const tabs = `<div class="itabs" role="tablist">${[['block', b ? 'Block' : 'Lesson'], ['ai', `${ic('sparkle', 13)}AI`], ['checks', `Checks${iss.length ? ` <span class="cnt" id="checks-count">${iss.length}</span>` : ''}`]].map(([k, l]) => `<button role="tab" aria-selected="${L.tab === k}" data-act="ltab" data-v="${k}">${l}</button>`).join('')}</div>`;
    let body = '';
    if (L.tab === 'block' && !b) {
      const pre = links().filter(l => l[1] === S.param).map(l => findItem(l[0])).filter(Boolean);
      body = `<div class="field"><label for="lt">Title</label><input id="lt" value="${esc(f.it.title)}" data-act="lessonTitle"></div>
        <div class="kv"><span>Estimated time</span><b>${L.blocks.length ? 'about ' + minutes(L) + ' min' : 'Fills in as you add content'}</b></div><div class="kv"><span>Blocks</span><b>${L.blocks.length}</b></div><div class="kv"><span>Module</span><b>${f.mi + 1} · ${esc(f.m.title)}</b></div>
        <div class="overline" style="margin-top:6px">Opens after</div>${pre.length ? pre.map(p => `<div class="linkrow">${ic(p.it.kind === 'lesson' ? 'play' : 'file', 14)}<span class="grow">${esc(p.it.title)}</span></div>`).join('') : '<p class="muted small u-m0">Opens right away for students in this module.</p>'}
        <a class="linkbtn small" href="#/instructor/builder/map" data-act="mapFocus" data-v="${S.param}">${ic('map', 14)}Edit order on the course map</a>
        <div class="ai-tip">${ic('sparkle', 14)}<span>AI uses the lesson title and the module around it. Add a line about what students should be able to do, and the draft gets sharper.</span></div>`;
    } else if (L.tab === 'block') {
      const i = L.blocks.indexOf(b);
      let fields = '';
      if (b.type === 'image') fields = `<div class="field${needsAlt(b) ? ' invalid' : ''}" id="alt-field"><label for="alt">Alt text</label><textarea id="alt" data-act="bfield" data-v="alt" data-bid="${b.id}" placeholder="Describe what the image shows" ${b.decorative ? 'disabled' : ''}>${esc(b.alt || '')}</textarea><span class="help err">Required. Screen reader users hear this instead of the image.</span></div>
          <label class="check"><input type="checkbox" data-act="decorative" ${b.decorative ? 'checked' : ''}> Decorative image, skip alt text</label>
          <div class="field"><label for="cap">Caption</label><input id="cap" data-act="bfield" data-v="caption" data-bid="${b.id}" value="${esc(b.caption || '')}"></div>`;
      else if (b.type === 'video') fields = `<div class="field"><label for="vt">Title</label><input id="vt" data-act="bfield" data-v="text" data-bid="${b.id}" value="${esc(b.text)}"></div><div class="kv"><span>Length</span><b>${esc(b.len || '0:00')}</b></div><div class="kv"><span>Captions</span><b>On, auto-checked</b></div>`;
      else if (b.type === 'quiz') fields = `<p class="muted small">Edit the question and answers right on the page. The circle marks the correct answer. Students see “Why” after they answer.</p>`;
      else if (b.type === 'divider') fields = `<p class="muted small">Splits the lesson into parts. Students see a thin line.</p>`;
      else fields = `<p class="muted small">Type right on the page. ${b.type === 'heading' ? 'Headings build the “On this page” list.' : 'Plain text, no formatting to fix later.'}</p>`;
      body = `<div class="ihead"><span class="kind">${ic(BT[b.type][1], 15)}</span><b>${BT[b.type][0]}</b><span class="grow"></span><span class="muted small">Block ${i + 1} of ${L.blocks.length}</span></div>${fields}
        <div class="iacts"><button class="btn sm" aria-label="Move up" data-act="blk" data-v="up" ${i === 0 ? 'disabled' : ''}>${ic('up', 15)}</button><button class="btn sm" aria-label="Move down" data-act="blk" data-v="down" ${i === L.blocks.length - 1 ? 'disabled' : ''}>${ic('down', 15)}</button><button class="btn sm" aria-label="Duplicate" data-act="blk" data-v="dup">${ic('copy', 15)}</button><button class="btn sm danger" data-act="blk" data-v="del">${ic('trash', 15)}Delete</button></div>
        <div class="keys">Alt + ↑↓ move · ⌘D duplicate · ⌫ delete · ⌘Z undo</div>`;
    } else if (L.tab === 'ai') {
      const acts = [['quiz', 'Quiz from this lesson'], ['recap', 'Recap for the end'], ['first', 'First draft from title']];
      body = `<div class="ai-card"><h3>${ic('sparkle', 16)}Draft with AI</h3><p>AI adds blocks as drafts. You accept or discard each one, and students never see a draft.</p></div>
        <div class="overline">Quick actions</div><div class="chips-col">${acts.map(([k, l]) => `<button class="chip" aria-pressed="${L.aiAct === k}" data-act="aiAct" data-v="${k}">${l}</button>`).join('')}</div>
        <div class="field"><label for="aip">Or describe what you need</label><textarea id="aip" data-act="aiPrompt" placeholder="3 questions, one about naming variants">${esc(L.prompt)}</textarea><span class="help">Adds after: ${esc(blockLabel(L.blocks.find(x => x.id === L.sel) || L.blocks[L.blocks.length - 1]))}</span></div>
        <button class="btn primary" data-load data-act="aiGen">${ic('sparkle', 16)}Generate</button>
        ${L.aiNote ? `<div class="ai-done">${ic('check', 15)}${esc(L.aiNote)}</div>` : ''}
        <p class="muted small demo-note">Demo: prepared sample answers. Nothing leaves your browser.</p>`;
    } else {
      body = iss.length ? `<div class="list">${iss.map(x => `<div class="issue">${ic('alert', 16)}<span class="grow">${esc(x.text)}</span>${x.bid ? `<button class="btn sm" data-act="showBlock" data-v="${x.bid}">Show</button>` : ''}</div>`).join('')}</div><p class="muted small">Checks run as you edit. Fix them before you send v3 for review.</p>`
        : `<div class="ai-done">${ic('check', 15)}No problems found.</div><p class="muted small">Students can open this lesson once v3 is published.</p>`;
    }
    return `<aside class="card insp${S.sheet ? ' open' : ''}" aria-label="Inspector"><button class="sheet-handle" data-act="sheet" aria-label="${S.sheet ? 'Collapse' : 'Expand'} panel"></button>${tabs}<div class="ibody">${body}</div></aside>`;
  }

  function iLesson(id) {
    const f = findItem(id);
    if (!f || f.it.kind !== 'lesson') return head('Lesson not found') + emptyState('This lesson is not in the v3 draft', 'It may have been removed. Open the course builder to see what is there now.', '<a class="btn" href="#/instructor/builder">Open course builder</a>', 'book');
    const L = lessonState(id);
    return guard({ title: f.it.title, errWhat: 'this lesson', deniedWhat: 'this lesson', deniedWho: 'Only the course owner and admins can edit lessons. The owner is Maria Lopez.',
      empty: head(f.it.title, `${tag('Draft')} <span class="mono">v3</span> · New lesson`) + emptyState('This lesson is empty', 'Drag a block from the left, or let AI draft a first version from the title.', `<a class="btn" href="#/instructor/lesson/l7">Open an empty lesson</a>`, 'text') }, () => {
      const iss = issues(L); const d = drafts(L);
      const outline = L.blocks.filter(b => b.type === 'heading' && !b.ai);
      const selIdx = L.blocks.findIndex(b => b.id === L.sel);
      const curH = selIdx < 0 ? null : [...L.blocks.slice(0, selIdx + 1)].reverse().find(b => b.type === 'heading');
      const firstQuiz = L.blocks.find(b => b.type === 'quiz');
      const pal = `<div class="card palette"><div class="overline">Blocks</div><div class="pal-list">${Object.entries(BT).map(([k, [l, i]]) => `<button class="pal-item" draggable="true" data-drag="add:${k}" data-act="addBlock" data-v="${k}"><span class="kind">${ic(i, 15)}</span><span class="grow">${l}</span><span class="dots" aria-hidden="true">${ic('grip', 13)}</span></button>`).join('')}</div>
        <p class="muted small pal-hint">Drag onto the page, or click to add after the selected block.</p>
        ${outline.length || firstQuiz ? `<div class="outline"><div class="overline">On this page</div>${outline.map(h => `<button class="olink${curH && curH.id === h.id ? ' cur' : ''}" data-act="showBlock" data-v="${h.id}" data-outline="${h.id}">${esc(h.text)}</button>`).join('')}${firstQuiz ? `<button class="olink${curH === undefined || (selIdx >= 0 && L.blocks[selIdx].type === 'quiz') ? ' cur' : ''}" data-act="showBlock" data-v="${firstQuiz.id}">Check yourself</button>` : ''}</div>` : ''}</div>`;
      const page = L.preview
        ? `<div class="lpage preview">${L.blocks.filter(b => !b.ai).map(b => blockView(b, L, true)).join('') || '<p class="muted">Nothing to show yet.</p>'}</div>`
        : `<div class="lpage" data-drop="page">${L.blocks.length ? L.blocks.map(b => blockView(b, L, false)).join('') + `<button class="add-block" data-act="addBlock" data-v="text">${ic('plus', 15)}Add a block</button>`
          : `<div class="lempty"><span class="kind">${ic('text', 18)}</span><h3>This lesson is empty</h3><p>Drag a block from the left, or let AI draft a first version from the title. You review it before anything is saved for students.</p>
            <div class="row-btns"><button class="btn" data-act="addBlock" data-v="text">${ic('plus', 15)}Add text block</button><button class="btn primary" data-act="aiFirst">${ic('sparkle', 15)}Draft with AI</button></div></div><div class="dropzone">${ic('grip', 13)}Drop blocks here</div>`}</div>`;
      const dbar = !L.preview && d.length ? `<div class="draftbar" role="region" aria-label="AI drafts">${ic('sparkle', 16)}<div class="grow"><b>${pl(d.length, 'AI draft', 'AI drafts')} to review</b><span>Students never see a draft.</span></div><button class="btn sm" data-act="aiAll" data-v="discard">Discard all</button><button class="btn sm primary" data-act="aiAll" data-v="accept">Accept all</button></div>` : '';
      const sub = `${tag('Draft')} <span class="mono" style="margin:0 2px 0 6px">v3</span> · ${L.blocks.length ? 'about ' + minutes(L) + ' min · All changes saved to v3 draft' : 'New lesson · Not visible to students'}`;
      const acts = `<button class="btn icon" aria-label="Undo" data-act="lundo" ${L.undo.length ? '' : 'disabled'}>${ic('undo', 17)}</button><button class="btn icon" aria-label="Redo" data-act="lredo" ${L.redo.length ? '' : 'disabled'}>${ic('redo', 17)}</button>
        ${L.blocks.length ? `<button class="btn issues-btn${iss.length ? ' has' : ''}" id="lesson-issues" data-act="ltab" data-v="checks">${iss.length ? ic('alert', 16) + pl(iss.length, 'issue', 'issues') : ic('check', 16) + 'No issues'}</button>` : ''}
        <button class="btn" data-act="lpreview">${L.preview ? ic('edit', 16) + 'Back to editing' : ic('eye', 16) + '<span>Preview<span class="hide-m"> as student</span></span>'}</button>`;
      return `${head(esc(f.it.title), sub, acts, `<a href="#/instructor/builder">Course builder</a> / Module ${f.mi + 1}<span class="hide-m"> · ${esc(f.m.title)}</span>`)}
        ${L.preview ? `<div class="banner info">${ic('eye', 18)}<div class="grow"><b>Student preview</b>${d.length ? pl(d.length, 'AI draft is', 'AI drafts are') + ' hidden, the way students will see it.' : 'This is what students will see once v3 is published.'}</div></div>` : ''}
        <div class="lgrid${L.preview ? ' is-preview' : ''}">${L.preview ? '' : pal}<div class="lcanvas">${page}${dbar}</div>${L.preview ? '' : lessonInspector(L, f)}</div>`;
    });
  }

  /* ================= COURSE MAP ================= */
  // Modules are columns; "next in module" is implied by order; "opens after" links are drawn between items.
  const MAPK = { cw: 198, ch: 54, gap: 22, head: 42, pad: 14, mw: 226, col: 30, row: 56, perRow: 3 };
  function mapLayout() {
    const M = mods(); const pos = {}; const boxes = []; let rowY = 0, rowH = 0;
    M.forEach((m, mi) => {
      const c = mi % MAPK.perRow; if (c === 0 && mi) { rowY += rowH + MAPK.row; rowH = 0; }
      const x = c * (MAPK.mw + MAPK.col), y = rowY;
      const h = MAPK.head + Math.max(1, m.items.length) * (MAPK.ch + MAPK.gap) - MAPK.gap + MAPK.pad;
      boxes.push({ m, mi, x, y, h }); rowH = Math.max(rowH, h);
      m.items.forEach((it, ii) => { pos[it.id] = { x: x + MAPK.pad, y: y + MAPK.head + ii * (MAPK.ch + MAPK.gap), it, mi, ii }; });
    });
    const W = Math.max(...boxes.map(b => b.x + MAPK.mw)) + 40, H = Math.max(...boxes.map(b => b.y + b.h)) + 40;
    return { pos, boxes, W, H };
  }
  const orderIdx = () => { const o = {}; flatItems().forEach((x, i) => o[x.it.id] = i); return o; };
  const conflicts = () => { const o = orderIdx(); return links().filter(([p, t]) => o[p] != null && o[t] != null && o[p] > o[t]); };
  const isConflict = (p, t) => { const o = orderIdx(); return o[p] > o[t]; };
  function mapState() { return S.map || (S.map = { x: 24, y: 24, k: 1, tool: 'select', sel: null, pick: null, from: null, ready: false, notes: null }); }
  function edgePath(a, b) {
    const ay = a.y + MAPK.ch / 2, by = b.y + MAPK.ch / 2;
    if (b.x > a.x + 10) { const x1 = a.x + MAPK.cw, x2 = b.x, dx = Math.max(30, (x2 - x1) / 2); return `M${x1},${ay} C${x1 + dx},${ay} ${x2 - dx},${by} ${x2 - 2},${by}`; }
    if (b.x < a.x - 10) { const x1 = a.x, x2 = b.x + MAPK.cw, dx = Math.max(30, (x1 - x2) / 2); return `M${x1},${ay} C${x1 - dx},${ay} ${x2 + dx},${by} ${x2 + 2},${by}`; }
    const x1 = a.x + MAPK.cw, x2 = b.x + MAPK.cw; return `M${x1},${ay} C${x1 + 44},${ay} ${x2 + 44},${by} ${x2 + 2},${by}`;
  }
  function mapCanvas() {
    const st = mapState(); const L = mapLayout(); const sel = st.sel; const bad = conflicts();
    const badItems = new Set(bad.map(l => l[1]));
    const related = sel ? new Set(links().filter(l => l[0] === sel || l[1] === sel).flat()) : new Set();
    const nextArrows = L.boxes.map(bx => bx.m.items.slice(0, -1).map((it, ii) => { const p = L.pos[it.id]; const x = p.x + MAPK.cw / 2; return `<path d="M${x},${p.y + MAPK.ch + 4} L${x},${p.y + MAPK.ch + MAPK.gap - 5}" class="e-next" marker-end="url(#mk-g)"/>`; }).join('')).join('');
    const edges = links().map(([p, t]) => { const a = L.pos[p], b = L.pos[t]; if (!a || !b) return ''; const c = isConflict(p, t); const on = sel && (p === sel || t === sel);
      return `<path d="${edgePath(a, b)}" class="e-link${c ? ' bad' : ''}${on ? ' on' : ''}" marker-end="url(#mk-${c ? 'c' : on ? 'b' : 'g'})"/>`; }).join('');
    const cards = Object.values(L.pos).map(p => { const it = p.it; const c = badItems.has(it.id);
      return `<button class="mcard${sel === it.id ? ' sel' : ''}${c ? ' bad' : ''}${st.from === it.id ? ' from' : ''}${related.has(it.id) && sel !== it.id ? ' rel' : ''}" style="left:${p.x}px;top:${p.y}px" data-act="mapSel" data-v="${it.id}" data-card="${it.id}">
        <span class="kind${it.kind === 'assignment' ? ' as' : ''}">${ic(it.kind === 'lesson' ? 'play' : 'file', 13)}</span><span class="txt"><b data-ctitle="${it.id}">${esc(it.title)}</b><span>${c ? 'Opens too early' : it.kind === 'lesson' ? 'Lesson · ' + esc(it.len) : 'Assignment · due ' + esc(it.due)}</span></span></button>`; }).join('');
    const boxes = L.boxes.map(b => `<div class="mbox" style="left:${b.x}px;top:${b.y}px;width:${MAPK.mw}px;height:${b.h}px"><div class="mbox-h"><b>Module ${b.mi + 1} · ${esc(b.m.title)}</b><span>${pl(b.m.items.length, 'item', 'items')}</span></div></div>`).join('');
    if (!st.notes) { const b3 = L.boxes[2] || L.boxes[0]; st.notes = [{ id: 'n1', x: b3.x, y: b3.y + b3.h + 46, who: 'Sofia Rossi', initials: 'SR', when: '2 min ago', text: 'Should the usability test open before Module 3 ends? Students asked for more time.' }]; }
    const notes = st.notes.map(n => `<div class="mnote${st.selNote === n.id ? ' sel' : ''}" style="left:${n.x}px;top:${n.y}px" data-note="${n.id}"><div class="mnote-h" data-notedrag="${n.id}">${av(n.initials, n.who)}<b>${esc(n.who)}</b><span>${n.when}</span></div><div class="mnote-t" contenteditable="true" data-notetext="${n.id}">${esc(n.text)}</div></div>`).join('');
    const sofia = st.notes[0] ? `<span class="cursor-tag" style="left:${st.notes[0].x + 200}px;top:${st.notes[0].y + 128}px" aria-hidden="true">${ic('cursor', 12)}<span>Sofia</span></span>` : '';
    const hint = st.pick ? `Pick the item that has to come first for “${esc(findItem(st.pick).it.title)}”` : st.tool === 'connect' ? (st.from ? `Now pick what opens after “${esc(findItem(st.from).it.title)}”` : 'Pick the item that comes first, then the one it opens') : st.tool === 'note' ? 'Click anywhere on the map to leave a note' : '';
    const tools = [['select', 'cursor', 'Select (V)'], ['hand', 'hand', 'Pan (H)'], ['connect', 'connect', 'Link two items (C)'], ['note', 'note', 'Add a note (N)']];
    return `<div class="mapvp tool-${st.tool}" data-mapvp tabindex="0" aria-label="Course map. Use the list view for a text version.">
      <div class="mworld" style="transform:translate(${st.x}px,${st.y}px) scale(${st.k});width:${L.W}px;height:${L.H}px">
        ${boxes}<svg class="medges" width="${L.W}" height="${L.H}" aria-hidden="true"><defs>${[['g', 'var(--canvas-link)'], ['b', 'var(--canvas-link-selected)'], ['c', 'var(--canvas-link-problem)']].map(([k, c]) => `<marker id="mk-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1,1 L9,5 L1,9" fill="none" style="stroke:${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>`).join('')}</defs>${nextArrows}${edges}</svg>
        ${cards}${notes}${sofia}</div>
      ${hint ? `<div class="mhint" role="status">${hint}${st.pick || st.from ? '<button data-act="mapCancel">Cancel</button>' : ''}</div>` : '<div class="mhint touch-only">Pinch to zoom · drag to pan</div>'}
      <div class="mlegend"><div><i class="lg-b"></i>Opens after</div><div><i class="lg-g"></i>Next in module</div><div><i class="lg-c"></i>Opens too early</div></div>
      <div class="mtools" role="toolbar" aria-label="Map tools">${tools.map(([k, i, l]) => `<button class="${st.tool === k ? 'on' : ''}" aria-pressed="${st.tool === k}" aria-label="${l}" title="${l}" data-act="mapTool" data-v="${k}">${ic(i, 17)}</button>`).join('')}
        <span class="sep"></span><button class="desk" aria-label="Zoom out" data-act="mapZoom" data-v="-1">${ic('minus', 17)}</button><span class="zoom desk" data-zoom>${Math.round(st.k * 100)}%</span><button class="desk" aria-label="Zoom in" data-act="mapZoom" data-v="1">${ic('plus', 17)}</button><button aria-label="Fit to screen" title="Fit to screen (0)" data-act="mapFit">${ic('fit', 17)}</button></div></div>`;
  }
  function mapInspector() {
    const st = mapState(); const bad = conflicts();
    const prob = bad.length ? `<div class="mprob">${ic('alert', 17)}<div class="grow"><b>${pl(bad.length, 'problem', 'problems')} on the map</b>${bad.map(([p, t]) => `<span>${esc(findItem(t).it.title)} opens before its prerequisite, ${esc(findItem(p).it.title)}.</span>`).join('')}</div><button class="btn sm" data-act="mapShow" data-v="${bad[0][1]}">Show</button></div>` : '';
    if (!st.sel) return `<aside class="card minsp"><div class="ihead"><span class="kind">${ic('map', 15)}</span><b>Course map</b></div><p class="muted small u-m0">${pl(mods().length, 'module', 'modules')} · ${pl(flatItems().length, 'item', 'items')} · ${pl(links().length, 'link', 'links')}</p>
      <p class="small u-m0">Click an item to see what opens it. Press <span class="kbd">C</span> to link two items, <span class="kbd">N</span> to leave a note. Drag the background or hold space to pan.</p>${prob}</aside>`;
    const f = findItem(st.sel); const it = f.it; const o = orderIdx();
    const pre = links().filter(l => l[1] === it.id); const nxt = links().filter(l => l[0] === it.id);
    const row = (id, l) => { const x = findItem(id).it; const c = isConflict(l[0], l[1]); return `<div class="linkrow${c ? ' bad' : ''}">${ic(x.kind === 'lesson' ? 'play' : 'file', 14)}<span class="grow">${esc(x.title)}${c ? '<small>Comes later in the course</small>' : ''}</span><button class="iconbtn sm" aria-label="Remove link" data-act="unlink" data-v="${l[0]},${l[1]}">${ic('x', 14)}</button></div>`; };
    const names = pre.map(l => findItem(l[0]).it.title);
    const sees = names.length ? `Opens after you finish ${names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0]}.` : 'Open as soon as the module starts.';
    return `<aside class="card minsp"><div class="ihead"><span class="kind">${ic(it.kind === 'lesson' ? 'play' : 'file', 15)}</span><b>${it.kind === 'lesson' ? 'Lesson' : 'Assignment'}</b><span class="grow"></span><span class="muted small">Module ${f.mi + 1} · ${f.ii + 1} of ${f.m.items.length}</span></div>
      <div class="field"><label for="mt">Title</label><input id="mt" value="${esc(it.title)}" data-act="itemTitle" data-v="${it.id}"></div>
      <div class="field"><label for="mm">Module</label><select id="mm" data-act="itemModule" data-v="${it.id}">${mods().map((m, i) => `<option value="${i}" ${i === f.mi ? 'selected' : ''}>Module ${i + 1} · ${esc(m.title)}</option>`).join('')}</select></div>
      <div class="ordrow"><span class="muted small">Order in module</span><span class="grow"></span><button class="btn sm" aria-label="Move earlier" data-act="itemMove" data-v="-1" ${f.ii === 0 ? 'disabled' : ''}>${ic('up', 14)}</button><button class="btn sm" aria-label="Move later" data-act="itemMove" data-v="1" ${f.ii === f.m.items.length - 1 ? 'disabled' : ''}>${ic('down', 14)}</button></div>
      <div class="overline">Opens after</div>${pre.map(l => row(l[0], l)).join('') || '<p class="muted small u-m0">Nothing. It opens with the module.</p>'}
      <button class="linkbtn small" data-act="mapPick" data-v="${it.id}">${ic('plus', 14)}Add prerequisite</button>
      <div class="overline">Opens next</div>${nxt.map(l => row(l[1], l)).join('') || '<p class="muted small u-m0">Nothing waits for it.</p>'}
      <div class="sees">${ic('eye', 15)}<span>Students see: “${esc(sees)}”</span></div>
      <a class="btn" href="${it.kind === 'lesson' ? '#/instructor/lesson/' + it.id : '#/instructor/editor'}">${ic('edit', 15)}Edit ${it.kind}</a>${prob}</aside>`;
  }
  function mapSheet() {
    const st = mapState(); if (!st.sel) return `<div class="msheet"><span class="sheet-grab"></span><p class="muted small u-m0">Tap an item to see what opens it.${conflicts().length ? ` <button class="linkbtn small" data-act="mapShow" data-v="${conflicts()[0][1]}">${pl(conflicts().length, 'problem', 'problems')} on the map</button>` : ''}</p></div>`;
    const it = findItem(st.sel).it; const names = links().filter(l => l[1] === it.id).map(l => findItem(l[0]).it.title);
    return `<div class="msheet"><span class="sheet-grab"></span><div class="who"><span class="kind">${ic(it.kind === 'lesson' ? 'play' : 'file', 15)}</span><div class="u-grow"><b>${esc(it.title)}</b><div class="muted small">${names.length ? 'Opens after ' + esc(names.join(' and ')) : 'Opens with the module'}</div></div></div>
      <div class="row-btns"><button class="btn" data-act="mapPick" data-v="${it.id}">${ic('connect', 15)}Edit links</button><a class="btn primary" href="${it.kind === 'lesson' ? '#/instructor/lesson/' + it.id : '#/instructor/editor'}">${ic('edit', 15)}Open</a></div></div>`;
  }
  const presence = () => `<span class="presence hide-m">${av('ML', 'Maria Lopez')}${av('SR', 'Sofia Rossi')}<span class="muted small">Sofia is viewing</span></span>`;
  const viewSeg = () => `<div class="vseg" role="group" aria-label="View"><a href="#/instructor/builder" aria-current="${S.param !== 'map'}">${ic('list', 15)}List</a><a href="#/instructor/builder/map" aria-current="${S.param === 'map'}">${ic('map', 15)}Map</a></div>`;
  function iMap() {
    return guard({ title: 'UX Design Fundamentals', errWhat: 'the course map', deniedWhat: 'this course', deniedWho: 'Only the course owner and admins can edit it. The owner is Maria Lopez.',
      empty: head('New course', 'Draft · not visible to students', viewSeg()) + emptyState('Nothing to map yet', 'Add a module with a lesson or an assignment, and it appears here as a card you can link.', '<button class="btn primary" data-act="start" data-v="#/instructor/builder">' + ic('plus', 16) + 'Add first module</button>', 'map') }, () => `
      ${head('UX Design Fundamentals', `${tag('Draft')} <span class="mono" style="margin:0 2px 0 6px">v3</span> · ${pl(mods().length, 'module', 'modules')} · ${pl(flatItems().length, 'item', 'items')} · owner Maria Lopez`, `${presence()}${viewSeg()}<button class="btn primary" data-act="modal" data-v="publish">Send v3 for review</button>`, '<a href="#/instructor/home">Dashboard</a> / Course builder')}
      <div class="mgrid">${mapCanvas()}${mapInspector()}</div>${mapSheet()}`);
  }
  // Fit the whole map in view; on a phone, fit the width so cards stay readable.
  function fitMap(force) {
    const vp = document.querySelector('[data-mapvp]'); if (!vp) return; const st = mapState(); if (st.ready && !force) return;
    const L = mapLayout(); const w = vp.clientWidth, h = vp.clientHeight;
    const k = Math.max(.45, Math.min(1, (w - 48) / L.W, force ? (h - 110) / L.H : 1));
    st.k = +k.toFixed(2); st.x = Math.max(12, (w - L.W * st.k) / 2); st.y = 24; st.ready = true;
    // On a phone the whole map would be unreadable, so it opens at a readable zoom on the first problem (or the first item).
    if (!force && w < 560) { const bad = conflicts(); const id = bad.length ? bad[0][1] : flatItems()[0].it.id; const p = L.pos[id];
      st.k = .75; if (p) { st.x = Math.round(w / 2 - (p.x + MAPK.cw / 2) * st.k); st.y = Math.round(Math.min(24, h / 2.6 - (p.y + MAPK.ch / 2) * st.k)); } }
    applyMap();
  }
  function applyMap() { const st = mapState(); const w = document.querySelector('.mworld'); if (w) w.style.transform = `translate(${st.x}px,${st.y}px) scale(${st.k})`; const z = document.querySelector('[data-zoom]'); if (z) z.textContent = Math.round(st.k * 100) + '%'; }
  function zoomAt(k2, cx, cy) { const st = mapState(); k2 = Math.max(.4, Math.min(1.8, k2)); st.x = cx - (cx - st.x) * (k2 / st.k); st.y = cy - (cy - st.y) * (k2 / st.k); st.k = k2; applyMap(); }
  function addLink(p, t) {
    if (p === t) { toast('An item cannot open after itself.'); return false; }
    if (links().some(l => l[0] === p && l[1] === t)) { toast('These two are already linked.'); return false; }
    // Walk forward from t: if p is reachable, the new link would make a loop nobody can finish.
    const reach = new Set([t]); let grew = true; while (grew) { grew = false; links().forEach(([a, b]) => { if (reach.has(a) && !reach.has(b)) { reach.add(b); grew = true; } }); }
    if (reach.has(p)) { toast('That would make a loop. Students could never open either item.'); return false; }
    links().push([p, t]); const late = isConflict(p, t);
    S.undo = () => { S.links = links().filter(l => !(l[0] === p && l[1] === t)); };
    toast(`${findItem(t).it.title} now opens after ${findItem(p).it.title}${late ? '. It comes later in the course, so the map flags it.' : ''}`, true); return true;
  }

  const DEFAULTS = { heading: { text: '' }, text: { text: '' }, video: { text: 'New video', len: '0:00' }, image: { file: 'image.png', alt: '', caption: '' }, callout: { text: '' }, quiz: { q: '', options: ['', '', ''], correct: 0, why: '' }, divider: {} };
  function addBlockAt(L, type, at) {
    const b = newBlock({ type, ...DEFAULTS[type] }); change(L, () => L.blocks.splice(at, 0, b)); L.sel = b.id; if (L.tab === 'checks') L.tab = 'block';
    const fld = { heading: 'text', text: 'text', callout: 'text', quiz: 'q' }[type]; if (fld) S.focusCE = `#blk-${b.id} [data-bedit="${fld}"]`; S.scrollTo = '#blk-' + b.id; return b;
  }
  function blockOp(L, i, op) {
    const b = L.blocks[i]; const B = L.blocks;
    if (op === 'up' && i > 0) change(L, () => { [B[i - 1], B[i]] = [B[i], B[i - 1]]; });
    if (op === 'down' && i < B.length - 1) change(L, () => { [B[i + 1], B[i]] = [B[i], B[i + 1]]; });
    if (op === 'dup') { const c = newBlock(b); change(L, () => B.splice(i + 1, 0, c)); L.sel = c.id; }
    if (op === 'del') { change(L, () => B.splice(i, 1)); L.sel = (B[i] || B[i - 1] || {}).id || null; S.undo = () => undoL(L); toast(`${BT[b.type][0]} deleted`, true); }
    S.scrollTo = L.sel ? '#blk-' + L.sel : null;
  }
  function centerOn(id) { const vp = document.querySelector('[data-mapvp]'); const p = mapLayout().pos[id]; if (!vp || !p) return; const st = mapState();
    st.x = vp.clientWidth / 2 - (p.x + MAPK.cw / 2) * st.k; st.y = vp.clientHeight / 2 - (p.y + MAPK.ch / 2) * st.k; applyMap(); }

  function iRoster() {
    const rows = D.enrolments.filter(e => e.cohort.startsWith('UX')).map((e, i) => ({ ...e, group: i % 2 ? 'Group B' : 'Group A', done: Math.min(4, Math.round(e.progress / 25)), risk: ['Paused', 'Dropped'].includes(e.state) || e.progress < 30 }))
      .filter(r => !myGroup() || r.group === myGroup());
    // A TA sees the numbers for their own group; the instructor sees the whole cohort.
    const statAvg = myGroup() ? Math.round(rows.reduce((a, r) => a + r.progress, 0) / rows.length) + '%' : '64%';
    const statOn = myGroup() ? rows.filter(r => !r.risk).length : 36, statBehind = myGroup() ? rows.filter(r => r.risk).length : 12;
    return guard({ title: 'Cohort roster', errWhat: 'the roster', deniedWhat: 'this roster', deniedWho: 'You are not an instructor or TA of Autumn 2026 yet. Access starts when the cohort is scheduled for you.',
      empty: emptyState('No students yet', 'Students appear here when an admin enrols them in Autumn 2026. The cohort starts Oct 20.', '', 'users') }, () => `
      ${head(myGroup() ? 'Group roster' : 'Cohort roster', myGroup() ? `UX Design Fundamentals · Spring 2026 · ${myGroup()} · ${rows.length} students` : 'UX Design Fundamentals · Spring 2026 · 48 students, showing 16', '<button class="btn" data-act="toast" data-v="Message drafted to 5 students at risk">Message students at risk</button>')}
      <div class="grid g-4 u-mb4"><div class="card stat"><div class="label">Average progress</div><div class="val num">${statAvg}</div></div><div class="card stat"><div class="label">On track</div><div class="val num">${statOn}</div></div>
        <div class="card stat alert"><div class="label">Behind</div><div class="val num">${statBehind}</div></div><div class="card stat"><div class="label">Completed</div><div class="val num">0</div><div class="hint">Course ends Nov 28</div></div></div>
      <div class="tablebox"><table><thead><tr><th>Student</th><th>Group</th><th>Progress</th><th>Assignments</th><th>Last active</th><th>Status</th></tr></thead><tbody>
        ${rows.map((r, i) => `<tr><td><div class="who">${av(r.initials, r.student)}<b class="u-strong" title="${esc(r.student)}">${esc(r.student)}</b></div></td><td class="muted">${r.group}</td>
          <td><div class="u-row">${bar(r.progress)}<span class="num muted" style="width:36px">${r.progress}%</span></div></td><td class="num">${r.done} / 4</td><td class="num">${r.last}</td>
          <td>${r.risk ? tag(r.state === 'Active' ? 'Late' : r.state) : tag(r.state)}</td></tr>`).join('')}</tbody></table></div>`);
  }

  /* ================= ADMIN ================= */
  function aHome() {
    return guard({ title: 'Overview', errWhat: 'the overview', deniedWhat: 'the school overview', deniedWho: 'Only admins see school-wide numbers. Ask Alex Morgan if you need a report.',
      empty: head('Welcome to Cohorta', 'Set up your school in three steps') + `<div class="grid g-3">${[['1', 'Invite your staff', 'Add instructors and TAs, then set what each can reach.'], ['2', 'Publish a course', 'Approve a course draft so it can run.'], ['3', 'Schedule a cohort', 'Pick dates, staff and capacity, then enrol students.']].map(([n, t, d]) => `<div class="card" style="display:flex;flex-direction:column"><div class="mono muted">Step ${n}</div><h2 style="margin-top:6px">${t}</h2><p class="muted" style="margin:0 0 16px">${d}</p><button class="btn sm" style="margin-top:auto;align-self:flex-start" data-act="start" data-v="${n === '1' ? '#/admin/users' : n === '2' ? '#/admin/catalogue' : '#/admin/enrolments'}">Start</button></div>`).join('')}</div>` }, () => `
      ${head('Overview', 'Cohorta School · 6 cohorts this term')}
      ${inReview().length ? `<div class="card cta-card u-mb4"><div class="u-grow"><div class="big">${inReview().length} course${inReview().length > 1 ? 's' : ''} waiting for review</div><div class="muted">${inReview().map(c => esc(c.title)).join(' · ')}</div></div><a class="btn primary" href="#/admin/catalogue">Review ${inReview().length} course${inReview().length > 1 ? 's' : ''}</a></div>`
        : `<div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:12px">${ic('check', 20)}<div class="u-grow"><b>No courses waiting for review.</b> <span class="muted">New drafts from instructors will appear here.</span></div></div>`}
      <div class="grid g-4 u-mb4">
        <div class="card stat"><div class="label">Active cohorts</div><div class="val num">4</div><div class="hint">1 scheduled, 1 completed</div></div>
        <div class="card stat"><div class="label">Total students</div><div class="val num">257</div><div class="hint">+48 in Autumn 2026</div></div>
        <div class="card stat"><div class="label">Submissions pending</div><div class="val num">41</div><div class="hint">Across 4 cohorts</div></div>
        <div class="card stat alert"><div class="label">At-risk cohorts</div><div class="val num">2</div><div class="hint">More than 25% behind</div></div></div>
      <div class="grid g-main">
        <div class="card"><h2>Cohorts</h2><div class="scrollx"><table><thead><tr><th>Cohort</th><th>Status</th><th>Progress</th><th>Behind</th><th>Ends</th></tr></thead><tbody>
          ${D.cohorts.map(c => `<tr><td><b class="u-strong">${trunc(c.course, 260)}</b><div class="muted u-small">${c.name} · ${c.students} students</div></td><td>${tag(c.state)}</td>
            <td><div class="u-row">${bar(c.progress)}<span class="num muted">${c.progress}%</span></div></td><td class="num" ${c.behind / c.students > .25 ? 'style="color:var(--s-error);font-weight:600"' : ''}>${c.behind}</td><td class="num">${c.end}</td></tr>`).join('')}</tbody></table></div></div>
        <div class="grid u-top">
          <div class="card"><h2>System alerts</h2>
            <div class="banner error" style="margin-bottom:10px">${ic('alert', 18)}<div class="grow"><b>18 students not imported</b><span class="u-meta">Autumn 2026 import, rows need a valid email.</span></div><a class="btn sm" href="#/admin/enrolments">Fix</a></div>
            <div class="banner warn u-m0">${ic('users', 18)}<div class="grow"><b>Autumn 2026 has no TA</b><span class="u-meta">Starts Oct 20 with 48 students.</span></div><a class="btn sm" href="#/admin/users">Assign</a></div></div>
          <div class="card"><h2>Recent activity</h2><div class="list u-meta">${D.audit.slice(0, 4).map(a => `<div class="row" style="align-items:flex-start"><span class="u-grow">${esc(a.what)}</span><span class="muted u-nowrap">${a.when.split(' · ')[0].replace(', 2026', '')}</span></div>`).join('')}</div>
            <a href="#/admin/users" class="card-link">Open audit log</a></div></div></div>`);
  }

  function aCatalogue() {
    const list = D.catalogue.filter(c => S.cFilter === 'all' || c.state === S.cFilter);
    const chips = ['all', 'In review', 'Published', 'Draft', 'Archived'].map(v => `<button class="chip" data-act="cFilter" data-v="${v}" aria-pressed="${S.cFilter === v}">${v === 'all' ? 'All 8' : v + ' ' + D.catalogue.filter(c => c.state === v).length}</button>`).join('');
    const act = c => c.state === 'In review' ? `<button class="btn sm primary" data-act="panel" data-v="review:${c.id}">Review</button>`
      : c.state === 'Published' ? `<button class="btn sm" data-act="panel" data-v="cohort:${c.id}">Schedule cohort</button>${c.id === 'uxf' ? ' <button class="btn sm" data-act="modal" data-v="push">Push v2</button>' : ''}`
      : c.state === 'Archived' ? lockBtn('Edit', 'Archived courses are read-only for everyone.', 'btn sm') : `<span class="muted u-meta">Owner is editing</span>`;
    return guard({ title: 'Courses', errWhat: 'courses', deniedWhat: 'the course catalogue', deniedWho: 'Instructors see only the courses they own. Your courses are in the course builder.', deniedAlt: '<a class="btn" href="#/instructor/builder" data-act="role" data-v="instructor">Open course builder</a>',
      empty: emptyState('No courses yet', 'Instructors create drafts, you review and publish them. Invite an instructor to start.', '<a class="btn primary" href="#/admin/users">Invite an instructor</a>', 'grid') }, () => `
      ${head('Courses', 'A course is the template; a cohort is one dated run of it', '<button class="btn primary" data-act="newCourse">' + ic('plus', 16) + 'New course</button>')}
      <div class="toolbar">${chips}</div>
      <div class="tablebox"><table><thead><tr><th>Course</th><th>Status</th><th>Version</th><th>Owner</th><th class="c-wide">Cohorts</th><th class="c-wide">Students</th><th class="c-wide">Updated</th><th></th></tr></thead><tbody>
        ${list.map(c => `<tr><td><b class="u-strong">${trunc(c.title, 320)}</b></td><td>${tag(c.state)}</td><td class="mono">${c.version}</td><td>${trunc(c.owner, 200)}</td><td class="num c-wide">${c.cohorts}</td><td class="num c-wide">${c.students}</td><td class="num muted c-wide">${c.updated}</td><td class="u-right">${act(c)}</td></tr>`).join('')}</tbody></table></div>`);
  }

  function aEnrol() {
    const rows = D.enrolments.filter(e => S.eFilter === 'all' || e.state === S.eFilter);
    const chips = ['all', 'Active', 'Invited', 'Paused', 'Dropped', 'Completed'].map(v => `<button class="chip" data-act="eFilter" data-v="${v}" aria-pressed="${S.eFilter === v}">${v === 'all' ? 'All ' + D.enrolments.length : v + ' ' + D.enrolments.filter(e => e.state === v).length}</button>`).join('');
    const allSel = rows.length && rows.every(r => S.eSel.has(r.id));
    const eEnter = S.eSel.size && !S.eBulkShown; S.eBulkShown = !!S.eSel.size;
    const bulk = S.eSel.size ? `<div class="bulkbar${eEnter ? ' enter' : ''}" role="region" aria-label="Bulk actions"><b>${S.eSel.size} selected</b><span class="u-grow"></span><button class="btn sm" data-act="ebulk" data-v="Paused">Pause</button><button class="btn sm" data-act="ebulk" data-v="move">Move to cohort</button><button class="btn sm" data-act="ebulk" data-v="Dropped">Drop</button><button class="iconbtn on-dark" aria-label="Clear selection" data-act="eClear">${ic('x')}</button></div>` : '';
    return guard({ title: 'Enrolments', errWhat: 'enrolments', deniedWhat: 'Enrolments', deniedWho: 'Only admins can enrol, pause or drop students. Instructors see their own cohorts read-only in the roster.', deniedAlt: '<a class="btn" href="#/instructor/roster" data-act="role" data-v="instructor">Open my roster</a>',
      empty: emptyState('No students enrolled', 'Import a CSV or invite students by email. Autumn 2026 starts Oct 20.', '<button class="btn primary" data-act="modal" data-v="import">Import CSV</button>', 'users') }, () => `
      ${head('Enrolments', `${233 + D.enrolments.length} students in ${D.cohorts.length} cohorts`, '<button class="btn" data-act="modal" data-v="import">' + ic('upload', 16) + 'Import CSV</button><button class="btn primary" data-act="modal" data-v="enrol">' + ic('plus', 16) + 'Enrol students</button>')}
      <div class="toolbar"><label class="search">${ic('search', 16)}<span class="sr">Search</span><input placeholder="Search name or email"></label><select class="select" aria-label="Cohort"><option>All cohorts</option><option>UXF · Spring 2026</option><option>Service Design · Spring 2026</option></select></div>
      <div class="toolbar">${chips}</div>
      <div class="tablebox"><table class="rtable"><thead><tr><th class="check"><label class="hit"><input type="checkbox" aria-label="Select all" data-act="eSelAll" ${allSel ? 'checked' : ''}></label></th><th>Student</th><th class="c-2nd">Email</th><th class="c-2nd">Cohort</th><th>Status</th><th>Progress</th><th>Last active</th></tr></thead><tbody>
        ${rows.map(r => `<tr class="${S.eSel.has(r.id) ? 'sel' : ''}${S.flash.has(r.id) ? ' flash' : ''}"><td class="check c-check"><label class="hit"><input type="checkbox" aria-label="Select ${esc(r.student)}" data-act="eSel" data-v="${r.id}" ${S.eSel.has(r.id) ? 'checked' : ''}></label></td><td class="c-student"><div class="who">${av(r.initials, r.student)}<div class="u-grow"><b class="u-strong" title="${esc(r.student)}">${esc(r.student)}</b><div class="meta-2nd">${esc(r.email)} · ${esc(r.cohort)}</div></div></div></td>
          <td class="muted c-2nd">${trunc(r.email, 210)}</td><td class="c-2nd">${trunc(r.cohort, 190)}</td><td class="c-status">${tag(r.state)}</td><td class="c-ai" data-label="Progress"><div class="u-row">${bar(r.progress)}<span class="num muted" style="width:36px">${r.progress}%</span></div></td><td class="num c-final" data-label="Last active">${r.last}</td></tr>`).join('')}</tbody></table></div>${bulk}`);
  }

  function aUsers() {
    return guard({ title: 'Users and roles', errWhat: 'users', deniedWhat: 'Users and roles', deniedWho: 'Only admins can change roles. Every change is recorded in the audit log.',
      empty: emptyState('Only you so far', 'Invite instructors and teaching assistants, then choose what each can reach.', '<button class="btn primary" data-act="start" data-v="#/admin/users">Invite people</button>', 'shield') }, () => `
      ${head('Users and roles', 'Role sets the action · scope sets the reach · state can lock it', '<button class="btn primary" data-act="modal" data-v="invite">' + ic('plus', 16) + 'Invite people</button>')}
      <div class="grid g-main">
        <div class="tablebox"><table class="utable"><thead><tr><th>Person</th><th>Role</th><th>Scope</th><th>Last active</th><th></th></tr></thead><tbody>
          ${D.staff.map((u, i) => `<tr><td class="u-who"><div class="who">${av(u.initials, u.name)}<div><b class="u-strong" title="${esc(u.name)}">${esc(u.name)}</b><div class="muted u-small">${trunc(u.email, 220)}</div></div></div></td><td class="u-role" data-last="${esc(u.last)}">${esc(u.role)}</td><td class="muted u-scope" style="white-space:normal;max-width:220px">${esc(u.scope)}</td><td class="num u-last">${u.last}</td>
            <td class="u-act u-right"><button class="btn sm" data-act="panel" data-v="user:${i}">Open</button></td></tr>`).join('')}</tbody></table></div>
        <div class="card u-start"><h2>Audit log</h2><div class="list u-meta">${D.audit.map(a => `<div class="row" style="align-items:flex-start;flex-direction:column;gap:2px"><span>${esc(a.what)}</span><span class="muted">${esc(a.who)} · ${a.when}</span></div>`).join('')}</div></div></div>`);
  }

  /* ================= STUDENT ================= */
  const allItems = () => D.course.modules.flatMap((m, mi) => m.items.map((it, ii) => ({ ...it, module: m.title, mi })));
  function steps(current) {
    const items = allItems(); const cur = items.findIndex(i => i.title === current);
    return `<div class="steps">${items.map((it, i) => `<div class="step ${i < cur ? 'done' : i === cur ? 'now' : i > cur + 1 ? 'lock' : ''}"><span class="dot">${i < cur ? `<span style="color:var(--white)">${ic('check', 12, 3)}</span>` : i > cur + 1 ? ic('lock', 11, 2) : ''}</span><span class="u-meta">${esc(it.title)}</span></div>`).join('')}</div>`;
  }
  function sHome() {
    // The home follows the student's own progress in this session: finishing a lesson moves the next step.
    const done = S.lessonDone, sub = S.studentSubmitted;
    const pct = done ? 67 : 58, left = done ? '1 lesson left in Module 3' : '2 lessons left in Module 3';
    const next = done ? ['States nobody designs', '15 min · lesson 3 of 3', '#/student/home'] : ['Working with components', '17 min · lesson 2 of 3', '#/student/lesson'];
    const lessons = [['check', 'Layout and hierarchy', '20 min', '', '#/student/home'],
      done ? ['check', 'Working with components', '17 min · done', '', '#/student/lesson'] : ['play', 'Working with components', '17 min · next', 'next', '#/student/lesson'],
      done ? ['play', 'States nobody designs', '15 min · next', 'next', '#/student/home'] : ['lock', 'States nobody designs', '15 min · opens after the previous lesson', 'locked', '#/student/lesson/locked'],
      ['file', 'Usability test report', sub ? 'submitted · in review after Oct 14' : 'due Oct 14', '', '#/student/assignment']];
    return guard({ title: 'Hi, Lucía', errWhat: 'your courses', deniedWhat: 'this course', deniedWho: 'Your enrolment in Spring 2026 is paused. Contact your school to continue.',
      empty: head('Hi, Lucía', 'You are not enrolled in a course yet') + emptyState('No courses yet', 'When your school enrols you in a cohort, it will appear here with its start date.', '', 'book') }, () => `
      ${head('Hi, Lucía', 'UX Design Fundamentals · Spring 2026 · ends Nov 28', `<span class="pchip">${ic('chart', 16)}${left}</span>`)}
      <div class="card cta-card hero"><span class="hero-play">${ic('play', 24)}</span><div class="u-grow"><div class="muted u-small">Continue · Module 3 · Interface</div><div class="big">${next[0]}</div><div class="muted u-meta">${next[1]}</div></div><a class="btn primary" href="${next[2]}">Continue lesson</a></div>
      <div class="grid g-main home-grid">
        <div class="card"><div class="prog-head"><div><h2 class="u-m0">UX Design Fundamentals</h2><div class="muted small">4 modules · 12 items</div></div><span class="prog-val num">${pct}%</span></div>
          <div class="prog-bar">${bar(pct, 'cobalt')}</div>
          ${D.course.modules.map((m, i) => { const st = ['Completed', 'Completed', 'In progress', 'Locked'][i]; const subl = ['3 of 3 done', '3 of 3 done', done ? '2 of 3 done · States nobody designs is next' : '1 of 3 done · Working with components is next', 'Opens after Module 3'][i];
            const mark = st === 'Completed' ? ic('check', 16) : st === 'Locked' ? ic('lock', 16) : `<span class="mono">0${i + 1}</span>`;
            const ls = st === 'In progress' ? `<div class="mod-lessons">${lessons.map(([icn, n, meta, k, href]) => `<a class="mod-lesson ${k}" href="${href}">${ic(icn, 16)}<span class="ml-text"><span class="ml-title">${n}</span><span class="muted small">${meta}</span></span></a>`).join('')}</div>` : '';
            return `<div class="mod-row"><span class="mod-mark${st === 'In progress' ? ' now' : ''}">${mark}</span><div class="u-grow"><b>${m.title}</b><div class="muted small">${subl}</div></div>${tag(st)}</div>${ls}`; }).join('')}</div>
        <div class="card side-card"><section><h3>Due next</h3><div class="list">
            <a class="row" href="#/student/assignment"><span class="qchip qc-review">${ic('file', 18)}</span><div class="u-grow"><b>Usability test report</b><div class="muted small">Module 3 · Assignment</div></div>${sub ? tag('Submitted') : '<span class="num u-medium">Oct 14</span>'}</a>
            <div class="row"><span class="qchip qc-sub">${ic('lock', 18)}</span><div class="u-grow"><b>Final case study</b><div class="muted small">Opens after Module 3</div></div><span class="num u-medium">Nov 4</span></div></div></section>
          <section><h3>Latest feedback</h3><div class="who" style="margin-bottom:12px">${av('ML', 'Maria Lopez')}<div class="u-grow"><b>Maria Lopez</b><div class="muted small">User interview plan</div></div><span class="qr-big num">88<small> / 100</small></span></div><div class="feedback-box">Clear goals and a good mix of open questions. Next time, add how you will recruit participants.</div></section>
          <section><div style="display:flex;align-items:baseline;gap:8px;margin-bottom:12px"><h3 class="u-m0 u-grow">Your group</h3><span class="muted small">Group A · 8 students</span></div>
            <div class="classmates">${['Hannah Cole', 'Jonas Weber', 'Amira Bensaid', 'Noah Becker', 'Pablo Ruiz'].map(n => av('', n)).join('')}<span class="avatar more">+2</span></div>
            <div class="who" style="margin-top:12px">${av('ML', 'Maria Lopez')}${av('NK', 'Nadia Kowalski')}<span class="muted small">Maria Lopez teaches · Nadia Kowalski reviews</span></div></section></div></div>`);
  }
  function sLesson() {
    const locked = S.param === 'locked';
    return guard({ title: 'Working with components', errWhat: 'this lesson', deniedWhat: 'this lesson', deniedWho: 'Your enrolment is paused, so lessons are read-only. Contact your school to continue.',
      empty: emptyState('This lesson has no content yet', 'Your instructor is still preparing it. Try another lesson in this module.', '<a class="btn" href="#/student/home">Back to course</a>', 'play') }, () => locked ? `
      ${head('Final case study', 'Module 4 · Delivery', '', '<a href="#/student/home">UX Design Fundamentals</a> / Module 4')}
      <div class="grid g-main u-items-start"><div class="locked-card"><div class="lock-mark">${ic('lock', 24)}</div>
        <div><h2 class="h-panel">Opens on Oct 14, or after you finish Lesson 4.</h2><p class="muted lead-gap">You have 2 lessons and 1 assignment left in Module 3.</p><a class="btn primary" href="#/student/lesson">Go to your current lesson</a></div></div>
        <div class="card">${steps('Working with components')}</div></div>` : `
      ${head('Working with components', `Module 3 · Interface · lesson 2 of 3 · 17 min${S.lessonDone ? ' · ' + tag('Completed') : ''}`, '<a class="btn hide-m" href="#/student/lesson/locked">Next: locked lesson</a>', '<a href="#/student/home">UX Design Fundamentals</a> / Module 3')}
      <div class="grid g-main"><div class="grid u-top"><div class="lesson"><div class="video">${ic('play', 40)}</div>
        <p>Components let a team build many screens from a few reliable parts. In this lesson you'll take one card from the course page and turn it into a component with three states: default, loading and locked.</p>
        <p>Watch the walkthrough, then try it in your own file. The usability test in Module 3 will use these components.</p>
        ${S.lessonDone ? '' : `<div class="lesson-acts"><button class="btn primary" data-act="lessonDone">${ic('check', 16)}Mark as done</button><a class="btn" href="#/student/assignment">Go to assignment</a></div>`}</div>
        ${S.lessonDone ? `<div class="card done-card${S.flashDone ? ' flash' : ''}"><div class="done-head"><span class="ok-dot">${ic('check', 16, 2.4)}</span><div><b>Lesson done</b><div class="muted small">2 of 3 lessons in Module 3 are done. Progress is saved.</div></div><button class="linkbtn small" data-act="lessonUndo">Undo</button></div>
          <div class="overline">Next up</div>
          ${nextRow('file', 'Usability test report', S.studentSubmitted ? 'Assignment · submitted' : 'Assignment · due Oct 14 · uses this lesson', '#/student/assignment', 'qc-review')}
          ${nextRow('play', 'States nobody designs', 'Lesson 3 of 3 · 15 min', '#/student/home')}
          <a class="btn primary block" href="#/student/assignment">Open the assignment</a></div>` : ''}</div>
        <div class="card u-start"><h3>Your progress</h3>${steps(S.lessonDone ? 'States nobody designs' : 'Working with components')}</div></div>`);
  }
  const nextRow = (icn, title, meta, href, cls = 'qc-sub') => `<a class="next-row" href="${href}"><span class="qchip ${cls}">${ic(icn, 18)}</span><span class="grow"><b>${title}</b><span class="muted small">${meta}</span></span>${ic('chev', 18)}</a>`;
  function sAssignment() {
    // Two deliberate steps: choose a file, then submit it. Submitting shows what happens next.
    const sub = S.studentSubmitted, file = S.studentFile;
    const fileRow = (removable) => `<div class="file-row"><span class="qchip qc-white">${ic('file', 18)}</span><div class="grow"><b>usability-report-lucia.pdf</b><div class="muted small">2.4 MB · 6 pages${removable ? ' · checked' : ''}</div></div>${removable ? `<button class="iconbtn" data-act="removeFile" aria-label="Remove file">${ic('x', 18)}</button>` : ''}</div>`;
    const upload = sub ? `<div class="card submitted-card${S.flashSub ? ' flash' : ''}"><div class="done-head"><span class="ok-dot">${ic('check', 16, 2.4)}</span><div><b>Submitted on Oct 6 at ${sub}</b><div class="muted small">usability-report-lucia.pdf · 2.4 MB</div></div></div>
          <div class="overline">What happens next</div>
          <ol class="tl"><li class="done"><span class="tl-dot">${ic('check', 12, 2.4)}</span><div><b>Submitted</b><div class="muted small">Oct 6 · you can replace the file until Oct 14</div></div></li>
            <li><span class="tl-dot">2</span><div><b>Instructor review</b><div class="muted small">After Oct 14 · Maria Lopez reviews it</div></div></li>
            <li><span class="tl-dot">3</span><div><b>Grade and feedback</b><div class="muted small">Appear in Grades once released</div></div></li></ol>
          <div class="acts2"><button class="btn" data-act="replaceFile">Replace file</button><a class="btn primary" href="#/student/grades">See my grades</a></div></div>`
      : file ? `<div class="card"><h2>Your file</h2>${fileRow(true)}<button class="btn primary block" data-act="submit">Submit for review</button><p class="muted small" style="margin:10px 0 0">You can replace the file until Oct 14. Your instructor opens it after the deadline.</p></div>`
      : `<div class="drop">${ic('upload', 28)}<h3 style="margin:10px 0 4px">Drop your PDF here</h3><p class="muted" style="margin:0 0 14px">Up to 8 pages, 20 MB</p><button class="btn primary" data-act="chooseFile">Choose file</button></div>`;
    return guard({ title: 'Usability test report', errWhat: 'the assignment', deniedWhat: 'this assignment', deniedWho: 'Submissions closed when the cohort ended. Ask your instructor if you need an extension.',
      empty: emptyState('No assignment here yet', 'Your instructor has not published this assignment. You will get an email when it opens.', '', 'file') }, () => `
      ${head('Usability test report', `Module 3 · due Oct 14 · ${sub ? tag('Submitted') : tag('Not started')}`, '', '<a href="#/student/home">UX Design Fundamentals</a> / Assignment')}
      <div class="grid g-main"><div class="grid u-top">
        ${sub ? '' : `<div class="card"><h2>Brief</h2><p class="u-m0">Run a short usability test with 3 people on your wireframes. Report what you saw, what you changed and why. PDF, up to 8 pages.</p></div>`}
        ${upload}
        ${sub ? `<div class="card"><div class="overline">Next up</div>${nextRow('play', 'States nobody designs', 'Lesson 3 of 3 · 15 min', '#/student/home')}</div>` : ''}</div>
        <div class="card u-start"><h2>How it's graded</h2><div class="list u-meta">${['Test plan and tasks', 'What you observed', 'Changes you made', 'Clarity of the report'].map(c => `<div class="row"><span class="u-grow">${c}</span><span class="num muted">25</span></div>`).join('')}</div>
          <p class="muted u-small note">Feedback comes from your instructor. AI may help draft it, but a person always reviews your grade.</p></div></div>`);
  }
  function sGrades() {
    // Lucía's Wireframe review is s1 in the instructor's queue: releasing it there makes it appear here.
    const s1 = D.subs.find(x => x.student === D.people.student.name) || D.subs[0];
    const released = stOf(s1) === 'graded' && S.done.has(s1.id);
    const crit = aiState(s1).crit, names = ['Problem framing', 'Flow and structure', 'States and edge cases', 'Clarity of handoff'];
    const sub = S.studentSubmitted;
    const rows = D.studentGrades.map(g => {
      if (g.title.startsWith('Wireframe review') && released) return { ...g, status: 'Graded', score: finalOf(s1), date: 'released today', feedback: fbFor(aiState(s1)) || g.feedback, rubric: crit, fresh: true };
      if (g.title.startsWith('Usability test report')) return sub ? { ...g, status: 'Submitted', date: 'submitted Oct 6' } : g;
      return g; }).sort((a, b) => (b.fresh ? 1 : 0) - (a.fresh ? 1 : 0));
    return guard({ title: 'Grades', errWhat: 'your grades', deniedWhat: 'grades', deniedWho: 'Grades are hidden while your enrolment is paused.',
      empty: emptyState('No grades yet', 'Your grades appear here after your instructor releases them. Your first assignment is due Sep 15.', '', 'chart') }, () => `
      ${head('Grades', 'UX Design Fundamentals · Spring 2026')}
      <div class="grid" style="max-width:860px">${rows.map(g => `<div class="card grade-card${g.fresh ? ' flash' : ''}"><div class="gc-head"><div class="grow"><b>${g.title}</b><div class="muted small">${g.module} · ${g.date}</div></div>${g.fresh ? '<span class="new-pill">New</span>' : ''}${tag(g.status)}</div>
        ${g.score != null ? `<div class="gc-score num">${g.score}<small> / 100</small></div>` : ''}
        ${g.feedback ? `<div class="feedback-box">${esc(g.feedback)}</div>` : ''}
        ${g.rubric ? `<div class="gc-rubric">${g.rubric.map((v, i) => `<div><span>${names[i]}</span><span class="mono">${v} / 25</span></div>`).join('')}</div><div class="who small muted">${av('ML', 'Maria Lopez')}<span>Reviewed and released by Maria Lopez</span></div>` : ''}
        ${g.status === 'Submitted' ? `<p class="muted small u-m0">Waiting for review. Grades are released after the deadline${g.title.startsWith('Wireframe') ? '.' : ', Oct 14.'}</p>${g.title.startsWith('Wireframe') ? `<button class="linkbtn small demo-hint" data-act="demoRelease" data-v="${s1.id}">Demo: release it as the instructor</button>` : ''}` : ''}
        ${g.status === 'Not started' ? `<a class="btn sm" href="#/student/assignment">Open the assignment</a>` : ''}</div>`).join('')}</div>`);
  }

  /* ---------- overlays ---------- */

  /* Quick review. On wide screens (≥1400 px) it is a column next to the queue; below that it slides over the queue. */
  const dockOn = () => S.page === 'queue' && S.role !== 'ta' && innerWidth >= 1400 && (S.demo === 'normal' || S.demo === 'long');
  const rubricList = st => `<div class="qr-rubric">${[['Problem framing', 25], ['Flow and structure', 25], ['States and edge cases', 25], ['Clarity of handoff', 25]].map(([n, max], i) => { const v = +st.crit[i] || 0; return `<div class="r"><span>${n}</span><span class="bar"><span style="width:${Math.round(100 * v / max)}%"></span></span><span class="mono">${st.crit[i] === '' ? '—' : v} / ${max}</span></div>`; }).join('')}</div>`;
  // Two steps make the lock and its reason visible: decide on the AI draft, then release.
  const relSteps = (s, released) => { const first = esc(s.student.split(' ')[0]); const st = aiState(s);
    const s1 = released ? ['done', howGraded(s) === 'graded by hand' ? 'Graded by hand' : st.mode === 'edit' ? 'AI draft edited' : 'AI draft accepted'] : needsReview(s) ? ['now', st.mode === 'draft' ? 'Decide on the AI draft' : 'Enter a score'] : ['done', st.mode === 'accept' ? 'AI draft accepted' : st.mode === 'edit' ? 'AI draft edited' : st.mode === 'discard' ? 'AI draft discarded' : 'Score entered'];
    const s2 = released ? ['done', 'Released to ' + first] : needsReview(s) ? ['locked', 'Release to ' + first] : ['now', 'Release to ' + first];
    const dot = (k, n) => `<span class="sdot ${k}">${k === 'done' ? ic('check', 12, 2.4) : k === 'locked' ? ic('lock', 11, 2.2) : n}</span>`;
    return `<ol class="rsteps" aria-label="Release steps"><li class="${s1[0]}">${dot(s1[0], 1)}${s1[1]}</li><li class="line" aria-hidden="true"></li><li class="${s2[0]}">${dot(s2[0], 2)}${s2[1]}${s2[0] === 'locked' ? '<span class="sr"> (locked until step 1 is done)</span>' : ''}</li></ol>`; };
  function gradeBody(id) {
    const s = D.subs.find(x => x.id === id); const st = aiState(s); const F = filteredSubs().map(r => D.subs.find(x => x.id === r.id)); const L = F.includes(s) ? F : mySubs(); const i = L.indexOf(s);
    const p2 = L[(i - 1 + L.length) % L.length].id, n2 = L[(i + 1) % L.length].id; const done = stOf(s) === 'graded'; const first = esc(s.student.split(' ')[0]);
    const nav = `<div class="qr-nav"><span class="muted small">${i + 1} / ${L.length}</span><button class="iconbtn sm" data-act="panel" data-v="grade:${p2}" aria-label="Previous submission">${ic('up', 16)}</button><button class="iconbtn sm" data-act="panel" data-v="grade:${n2}" aria-label="Next submission">${ic('down', 16)}</button><button class="iconbtn sm" data-act="closeAll" aria-label="Close">${ic('x', 16)}</button></div>`;
    const headHtml = `<button class="btn ghost qr-back" data-act="closeAll">${ic('back', 18)}Queue</button><div class="qr-head">${av(s.initials, s.student)}<div class="qr-who"><h2 title="${esc(s.student)}">${esc(s.student)}</h2><div class="muted small">${s.group} · ${s.submitted} · ${esc(s.assignment)}</div></div>${nav}</div>`;
    const draft = !done && st.mode === 'draft';
    const decided = ['accept', 'edit'].includes(st.mode);
    // What the AI proposes: tinted, never what the student gets.
    const aiBlock = s.ai == null ? (done ? '' : aiCard(s, st)) : st.mode === 'discard' && !done ? aiCard(s, st)
      : `<section class="qr-ai${draft ? '' : ' compact'}" aria-label="AI suggestion"><div class="head">${ic(draft ? 'sparkle' : 'check', 16)}<b>${draft ? 'AI suggestion' : 'AI suggestion ' + (st.mode === 'edit' ? 'edited' : 'accepted')}</b><span class="spacer u-grow"></span><span class="${draft ? 'qr-big' : 'qr-mid'} num">${s.ai}<small> / 100</small></span>${!draft && !done ? `<button class="linkbtn small" data-act="ai" data-v="restore" data-id="${s.id}">Undo</button>` : ''}</div>
        ${draft ? `<p class="qr-sum">Clear flow and well-handled empty states. Fix the hidden cohort dates and the missing next step after a failed upload.</p>${rubricList(st)}<div class="muted small">Based on the rubric. ${first} does not see this.</div>` : `<div class="muted small">${done ? 'Used as the starting point for the released grade.' : 'Score and feedback below start from the suggestion. Change anything before release.'}</div>`}</section>`;
    // The teacher's decision: actions first, then what will be sent.
    const decision = draft ? `<div class="qr-dec"><div class="overline">Your decision</div><div class="qr-acts"><button class="btn primary" data-act="ai" data-v="accept" data-id="${s.id}">Accept ${s.ai}</button><button class="btn" data-act="ai" data-v="edit" data-id="${s.id}">Edit</button><button class="btn ghost" data-act="ai" data-v="discard" data-id="${s.id}">Discard</button></div>
        <div class="field"><label for="fb" class="sr">Feedback to ${first}</label><textarea id="fb" data-act="fbtext" data-id="${s.id}" placeholder="Feedback to ${first}: what to fix next">${esc(fbFor(st))}</textarea></div></div>`
      : `<div class="qr-dec"><div class="overline">Your decision</div><div class="qr-score"><label for="qs">Final score</label><span class="spacer u-grow"></span><input id="qs" class="score-input num" style="width:72px" inputmode="numeric" data-act="qscore" data-id="${s.id}" value="${scoreText(s)}" placeholder="—" ${done ? 'disabled' : ''}><span class="muted">/ 100</span></div>
        <div class="field"><label for="fb" class="sr">Feedback to ${first}</label><textarea id="fb" data-act="fbtext" data-id="${s.id}" placeholder="Feedback to ${first}: what to fix next" ${done ? 'disabled' : ''}>${esc(fbFor(st))}</textarea></div>
        ${!done && !needsReview(s) ? `<div class="qr-preview">${ic('eye', 16)}<div><div class="muted small">${first} will see after release</div><b>${esc(s.assignment)} · ${scoreText(s)} / 100 · the feedback above</b></div></div>` : ''}</div>`;
    const jr = S.justReleased && S.justReleased.id === s.id ? S.justReleased : null; const nx = pending()[0];
    const foot = done ? `${relSteps(s, true)}${jr ? `<div class="qr-released">${ic('check', 16)}<span class="grow">Released to ${first} at ${jr.time}. Logged as ${howGraded(s)}.</span>${S.undo ? '<button class="btn sm ghost" data-act="undo">Undo</button>' : ''}</div>` : stateBanner(s)}${releasedRow()}${nx ? `<button class="btn" data-act="panel" data-v="grade:${nx.id}">Review next: ${esc(nx.student)}</button>` : ''}`
      : `${relSteps(s, false)}${releaseRow(s, 'releaseQ')}${needsReview(s) ? '' : `<p class="muted release-hint">${ic('clock', 14)} Sends the grade and feedback to ${first}. Undo for 6 seconds.</p>`}`;
    return `${headHtml}${aiBlock}${decision}<div class="qr-foot">${foot}<a class="linkbtn small" href="#/${S.role}/grade/${s.id}">Open full view</a></div>`;
  }
  function overlays() {
    let out = '';
    if (S.panel && !(dockOn() && S.panel.startsWith('grade:'))) {
      const [k, v] = S.panel.split(':');
      let body = '';
      if (k === 'review') { const c = D.catalogue.find(x => x.id === v); body = `<div class="crumbs">Review course</div><h2 class="h-panel">${esc(c.title)}</h2><div>${tag(c.state)} <span class="mono">${c.version}</span> · owner ${esc(c.owner)}</div>
          <div class="card" style="padding:14px"><h3>What changed</h3><ul class="plain-list"><li>New module: Accessibility checks</li><li>Rubric updated for 2 assignments</li><li>3 lessons rewritten</li></ul></div>
          <div class="field"><label for="note">Note to ${esc(c.owner.split(' ')[0])}</label><textarea id="note" placeholder="Optional. Required if you request changes."></textarea></div>
          <div style="display:flex;gap:8px"><button class="btn" data-load data-act="review" data-v="changes:${c.id}">Request changes</button><button class="btn primary" data-load data-act="review" data-v="approve:${c.id}">Approve and publish</button></div>`; }
      if (k === 'cohort') { const c = D.catalogue.find(x => x.id === v); body = `<div class="crumbs">Schedule cohort</div><h2 class="h-panel">${esc(c.title)} · ${c.version}</h2><p class="muted u-m0">The cohort runs this version. Content edits on the course won't reach it until you push an update.</p>
          <div class="field"><label for="cn">Cohort name</label><input id="cn" value="Winter 2027"></div><div class="grid g-2"><div class="field"><label for="cs">Starts</label><input id="cs" value="Jan 12, 2027"></div><div class="field"><label for="ce">Ends</label><input id="ce" value="Apr 9, 2027"></div></div>
          <div class="field"><label for="ci">Instructors</label><select id="ci"><option>${esc(c.owner)}</option></select></div><div class="field"><label for="ct">Teaching assistants</label><select id="ct"><option>Nadia Kowalski · Group A</option><option>Ben Okafor · Group B</option></select></div>
          <div class="grid g-2"><div class="field"><label for="cg">Groups</label><input id="cg" value="2" inputmode="numeric"></div><div class="field"><label for="cc">Capacity</label><input id="cc" value="48" inputmode="numeric"><span class="help">Max 24 per group</span></div></div>
          <button class="btn primary" data-load data-act="schedule" data-v="${c.id}">Schedule cohort</button>`; }
      if (k === 'user') { const u = D.staff[+v]; const log = D.audit.filter(a => a.what.includes(u.name.split(' ')[0]) || a.who === u.name); body = `<div class="crumbs">User</div><div class="who" style="gap:12px">${av(u.initials, u.name)}<div><h2 class="h-panel">${esc(u.name)}</h2><div class="muted">${esc(u.email)}</div></div></div>
          <div class="field"><label for="ur">Role</label><select id="ur">${['Admin', 'Instructor', 'Admin + Instructor', 'Teaching assistant'].map(r => `<option ${r === u.role ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
          <div class="field"><label for="us">Scope</label><input id="us" value="${esc(u.scope)}"><span class="help">Where the role applies: whole school, a course, a cohort or a group.</span></div>
          <button class="btn primary" data-load data-act="saveRole" data-v="${v}">Save changes</button>
          <div><h3 style="margin:8px 0">Activity</h3><div class="list u-meta">${(log.length ? log : [{ what: 'Signed in', who: u.name, when: u.last }]).map(a => `<div class="row" style="flex-direction:column;align-items:flex-start;gap:2px"><span>${esc(a.what)}</span><span class="muted">${esc(a.who)} · ${esc(a.when)}</span></div>`).join('')}</div></div>`; }
      if (k === 'grade') body = gradeBody(v);
      // First open slides the panel in; moving to another submission only fades the content.
      out += `<div class="scrim panel-scrim${S.anim ? ' enter' : ''}" data-act="closeAll"></div><aside class="panel${S.anim ? ' enter' : S.swap ? ' swap' : ''}${k === 'grade' ? ' qr' : ''}" role="dialog" aria-modal="true" aria-label="Details">${k === 'grade' ? '' : `<button class="iconbtn" style="align-self:flex-end" aria-label="Close" data-act="closeAll">${ic('x')}</button>`}${body}</aside>`;
    }
    if (S.modal) {
      const M = {
        publish: `<h2>Send v3 for review?</h2><p class="muted u-m0">Alex Morgan will review it. Spring 2026 keeps v2 until the update is pushed.</p><div class="field"><label for="m1">What changed</label><textarea id="m1">New lesson on component states. Rubric for Wireframe review now asks for an error state.</textarea></div><div class="foot"><button class="btn" data-act="closeAll">Cancel</button><button class="btn primary" data-load data-act="closeAll" data-toast="Sent to Alex Morgan for review">Send for review</button></div>`,
        push: `<h2>Push v2 to running cohorts?</h2><p class="muted u-m0">Spring 2026 (48 students) will switch to v2 tonight. Progress and grades are kept. Students see a note about what changed.</p><label style="display:flex;gap:8px"><input type="checkbox" checked>Notify students and staff</label><div class="foot"><button class="btn" data-act="closeAll">Cancel</button><button class="btn primary" data-load data-act="push">Push update</button></div>`,
        import: `<h2>182 of 200 students imported</h2><div class="banner error u-m0">${ic('alert', 18)}<div class="grow"><b>We couldn't import 18 students.</b>Review the rows below and try again.</div></div>
          <div class="tablebox" style="max-height:200px"><table><thead><tr><th>Row</th><th>Value</th><th>Problem</th></tr></thead><tbody>${[[14, 'jonas.weber@', 'Email is incomplete'], [27, 'priya nair@mail.com', 'Email has a space'], [41, '', 'Email is missing'], [58, 'leo.rossi@mail', 'Domain is incomplete'], [77, 'sara@mail.com', 'Already enrolled in this cohort']].map(r => `<tr><td class="num">${r[0]}</td><td class="mono">${esc(r[1] || '—')}</td><td>${r[2]}</td></tr>`).join('')}<tr><td colspan="3" class="muted">and 13 more</td></tr></tbody></table></div>
          <div class="foot"><button class="btn" data-act="closeAll" data-toast="18 rows downloaded as CSV">Download 18 rows</button><button class="btn primary" data-act="closeAll">Done</button></div>`,
        enrol: `<h2>Enrol students</h2><div class="field"><label for="ec">Cohort</label><select id="ec"><option>UX Design Fundamentals · Autumn</option><option>Service Design 101 · Winter</option></select><span class="help">Autumn 2026 starts Oct 20 · 48 seats</span></div>
          <div class="field"><label for="ee">Emails, one per line</label><textarea id="ee">rosa.marin@mail.com
theo.laurent@mail.com
nina.berg@mail.com</textarea><span class="help">Each person gets an invite and counts as enrolled once they accept.</span></div><div class="foot"><button class="btn" data-act="closeAll">Cancel</button><button class="btn primary" data-load data-act="doEnrol">Send invites</button></div>`,
        invite: `<h2>Invite people</h2><div class="field"><label for="in">Name</label><input id="in" value="Irene Duarte"></div><div class="field"><label for="ie">Email</label><input id="ie" value="irene.duarte@cohorta.school"></div>
          <div class="grid g-2"><div class="field"><label for="ir">Role</label><select id="ir"><option>Teaching assistant</option><option>Instructor</option><option>Admin</option></select></div><div class="field"><label for="is">Scope</label><select id="is"><option>UXF Autumn 2026 · Group A</option><option>UX Design Fundamentals</option><option>Whole school</option></select></div></div>
          <p class="muted u-m0 u-meta">Role sets what they can do, scope sets where. You can change both later; every change is logged.</p><div class="foot"><button class="btn" data-act="closeAll">Cancel</button><button class="btn primary" data-load data-act="doInvite">Send invite</button></div>`,
        move: `<h2>Move ${pl(S.eSel.size, 'student', 'students')}</h2><div class="field"><label for="mv">To cohort</label><select id="mv"><option>UX Design Fundamentals · Autumn 2026</option><option>Service Design 101 · Winter 2026</option></select><span class="help">Progress moves with them. Grades stay in the old cohort's record.</span></div><div class="foot"><button class="btn" data-act="closeAll">Cancel</button><button class="btn primary" data-load data-act="doMove">Move students</button></div>`
      };
      out += `<div class="scrim" data-act="scrim"><div class="modal" role="dialog" aria-modal="true">${M[S.modal]}</div></div>`;
    }
    return out;
  }

  /* ---------- render ---------- */
  const VIEWS = {
    instructor: { home: iHome, queue: iQueue, grade: () => iGrade(S.param), builder: () => S.param === 'map' ? iMap() : iBuilder(), lesson: () => iLesson(S.param), editor: iEditor, roster: iRoster },
    ta: { home: iQueue, queue: iQueue, grade: () => iGrade(S.param), roster: iRoster },
    admin: { home: aHome, catalogue: aCatalogue, enrolments: aEnrol, users: aUsers },
    student: { home: sHome, lesson: sLesson, assignment: sAssignment, grades: sGrades }
  };
  /* Public site (landing, sign-up, log-in) lives in landing.js and shares the icons and logo. */
  const SITE = window.CohortaSite ? window.CohortaSite({ ic, symbol, wordmark, esc }) : null;
  const PUBLIC = { '': 'landing', signup: 'signup', login: 'login' };
  function renderPublic() {
    $('#app').innerHTML = S.site === 'landing' ? SITE.landing() : SITE.auth(S.site);
    document.title = SITE.title(S.site);
    if (S.site !== 'landing') { const f = document.querySelector('.s-form input'); if (f && matchMedia('(min-width:721px)').matches) f.focus(); }
  }
  function render() {
    if (S.page === 'public') return renderPublic();
    const view = (VIEWS[S.role][S.page] || VIEWS[S.role].home)();
    const m = mobileChrome();
    const staffNote = S.role !== 'student' ? '<div class="banner info mtop-note" style="display:none"></div>' : '';
    const html = demoBar() + m.top + `<div class="shell">${side()}<main class="main" id="main">${staffNote}${view}</main></div>` + m.bottom + overlays();
    // keep dates, terms and numbers with units on one line
    $('#app').innerHTML = html
      .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2})\b/g, '$1\u00A0$2')
      .replace(/\b(Spring|Summer|Autumn|Winter) (\d{4})\b/g, '$1\u00A0$2')
      .replace(/(\d) (min|MB|px|students|days|h|d)\b/g, '$1\u00A0$2');
    document.title = `${(NAV[S.role].find(n => n[0] === S.page) || ['', 'Cohorta'])[1]} · Cohorta`;
    S.anim = false; S.swap = false;
    // A row highlight plays once, on the render that follows the action.
    if (S.flash.size) S.flash = new Set();
    S.flashDone = S.flashSub = false;
    if (S.focus) { const f = document.querySelector(S.focus); if (f) { f.focus(); if (f.setSelectionRange) f.setSelectionRange(f.value.length, f.value.length); } S.focus = null; }
    if (S.focusCE) { const el = document.querySelector(S.focusCE); if (el) { el.focus(); const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); const sl = window.getSelection(); sl.removeAllRanges(); sl.addRange(r); } S.focusCE = null; }
    if (S.scrollTo) { const el = document.querySelector(S.scrollTo); if (el && el.scrollIntoView) { const r = el.getBoundingClientRect(); if (r.top < 120 || r.bottom > innerHeight - 120) el.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' }); } S.scrollTo = null; }
    if (document.querySelector('[data-mapvp]')) { fitMap(false); if (S.mapCenter) { centerOn(S.mapCenter); S.mapCenter = null; } }
  }
  // Crossing 1400 px switches the quick review between a column and an overlay.
  let lastDock = null; window.addEventListener('resize', () => { if (S.page === 'public') return; const d = dockOn(); if (lastDock !== null && d !== lastDock) render(); lastDock = d; });
  let current = '#/instructor/home';
  function route(h, replace) {
    if (h) current = h;
    const parts = current.replace(/^#\/?/, '').split('/');
    if (SITE && parts[0] in PUBLIC && !VIEWS[parts[0]]) {
      S.page = 'public'; S.site = PUBLIC[parts[0]]; S.panel = null; S.modal = null;
      render(); window.scrollTo(0, 0);
      try { if (location.protocol !== 'about:' && history.pushState && location.hash !== current) history[replace ? 'replaceState' : 'pushState'](null, '', current); } catch (e) {}
      return;
    }
    if (VIEWS[parts[0]]) { if (S.role !== parts[0]) { S.sel.clear(); S.eSel.clear(); } S.role = parts[0]; }
    S.page = parts[1] && VIEWS[S.role][parts[1]] ? parts[1] : 'home'; S.param = parts[2] || null; S.gtab = 'doc';
    // A role without a dashboard lands on its first page, so the nav always shows where you are.
    if (S.page === 'home' && !NAV[S.role].some(n => n[0] === 'home')) S.page = NAV[S.role][0][0];
    S.panel = null; S.modal = null; S.sheet = false; if (S.map) { S.map.from = null; S.map.pick = null; }
    render(); window.scrollTo(0, 0);
    // Each page gets its own history entry, so the browser Back button walks back through the demo.
    try { if (location.protocol !== 'about:' && history.pushState && location.hash !== current) history[replace ? 'replaceState' : 'pushState'](null, '', current); } catch (e) {}
  }
  const ROUTE_RE = /^#\/((student|instructor|ta|admin)\/|(signup|login)$|$)/;
  function fromURL() { if (ROUTE_RE.test(location.hash) && location.hash !== current) route(location.hash, true); }
  window.addEventListener('popstate', fromURL); window.addEventListener('hashchange', fromURL);
  /* Toast lives outside #app: page re-renders never replay its entrance,
     a new message replaces the text in place, and it fades out on its own. */
  const toastRoot = document.createElement('div'); toastRoot.id = 'toast-root'; toastRoot.setAttribute('aria-live', 'polite'); document.body.appendChild(toastRoot);
  let toastTimer;
  function paintToast() {
    const cur = toastRoot.querySelector('.toast:not(.leave)');
    if (!S.toast) { if (cur) { cur.classList.add('leave'); afterMotion(MOTION.toastOut, () => cur.remove()); } return; }
    const inner = `<span>${esc(S.toast.text)}</span>${S.toast.undo ? '<button data-act="undo">Undo</button>' : ''}`;
    if (cur) { cur.innerHTML = inner; return; }
    toastRoot.insertAdjacentHTML('beforeend', `<div class="toast" role="status">${inner}</div>`);
  }
  function toast(text, undo) { S.toast = { text, undo }; paintToast(); clearTimeout(toastTimer); toastTimer = setTimeout(() => { S.toast = null; paintToast(); if (undo) { S.undo = null; if (document.querySelector('.qr-released [data-act="undo"]')) render(); } }, undo ? 6000 : 3000); }
  function hideToast() { clearTimeout(toastTimer); S.toast = null; paintToast(); }
  const go = h => route(h);

  /* Review panel closes by sliding back, then the page renders without it. */
  function closeOverlays() {
    const p = document.querySelector('.panel');
    if (S.panel && p && !S.modal && !reduceMotion()) {
      p.classList.add('leave'); const sc = document.querySelector('.panel-scrim'); if (sc) sc.classList.add('leave');
      setTimeout(() => { S.panel = null; render(); }, MOTION.panelOut);
    } else { S.modal = null; S.panel = null; render(); }
  }
  /* Bulk bar leaves the way it came, then the selection and the rows update. */
  function leaveBulk(fn) {
    const bar = document.querySelector('.bulkbar');
    if (bar && !reduceMotion()) { bar.classList.add('leave'); setTimeout(() => { fn(); render(); }, MOTION.bulkOut); }
    else { fn(); render(); }
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#/"]');
    if (link) {
      e.preventDefault();
      const ta = link.dataset.act; if (ta === 'demo') { setLongData(link.dataset.v === 'long'); S.demo = link.dataset.v; } if (ta === 'role') S.role = link.dataset.v; if (ta === 'mapFocus') { const st = mapState(); st.sel = link.dataset.v; S.mapCenter = link.dataset.v; }
      route(link.getAttribute('href')); return;
    }
    const t = e.target.closest('[data-act]'); if (!t) return;
    const a = t.dataset.act, v = t.dataset.v;
    if (t.tagName === 'INPUT' && t.type === 'checkbox') return; // handled on change
    if (a === 'scrim' && e.target !== t) return;
    // Actions that would wait on a server show a spinner and lock the button first.
    if (t.hasAttribute('data-load') && t.dataset.loaded !== '1') {
      if (t.classList.contains('is-loading')) return;
      t.classList.add('is-loading'); t.setAttribute('aria-busy', 'true'); t.setAttribute('aria-disabled', 'true');
      setTimeout(() => { t.dataset.loaded = '1'; t.click(); }, MOTION.load); return;
    }
    switch (a) {
      case 'role': S.sel.clear(); S.eSel.clear(); go(`#/${v}/home`); return;
      case 'demo': setLongData(v === 'long'); S.demo = v; break;
      case 'qStatus': S.qStatus = v; S.sel.clear(); break;
      case 'cFilter': S.cFilter = v; break;
      case 'eFilter': S.eFilter = v; S.eSel.clear(); break;
      case 'sort': S.qSort = S.qSort === 'newest' ? 'oldest' : 'newest'; break;
      case 'dense': S.dense = !S.dense; break;
      case 'clearSel': leaveBulk(() => S.sel.clear()); return;
      case 'eClear': leaveBulk(() => S.eSel.clear()); return;
      case 'start': setLongData(false); S.demo = 'normal'; go(v); return;
      case 'review': { const [kind, id] = v.split(':'); const c = D.catalogue.find(x => x.id === id);
        if (kind === 'approve') { c.state = 'Published'; c.updated = 'Oct 6'; audit(`Published ${c.title} ${c.version}`); toast(`${c.title} published. Instructors can schedule cohorts.`); }
        else { c.state = 'Draft'; c.updated = 'Oct 6'; audit(`Requested changes to ${c.title} ${c.version}`); toast(`Changes requested from ${c.owner}. The course is back in draft.`); }
        closeOverlays(); return; }
      case 'schedule': { const c = D.catalogue.find(x => x.id === v); c.cohorts++; D.cohorts.push({ id: 'c' + (D.cohorts.length + 1), course: c.title, name: 'Winter 2027', state: 'Scheduled', students: 0, progress: 0, behind: 0, start: 'Jan 12', end: 'Apr 9' }); audit(`Scheduled cohort Winter 2027 for ${c.title}`); toast('Winter 2027 scheduled. Enrolment is open.'); closeOverlays(); return; }
      case 'push': audit('Pushed UX Design Fundamentals v2 to cohort Spring 2026'); S.modal = null; toast('v2 scheduled for Spring 2026 tonight · logged'); break;
      case 'saveRole': { const u = D.staff[+v]; const r = document.getElementById('ur').value, sc = document.getElementById('us').value; if (r !== u.role) audit(`Changed role of ${u.name}: ${u.role} → ${r}`); u.role = r; u.scope = sc; toast('Role saved and logged'); closeOverlays(); return; }
      case 'newCourse': D.catalogue.unshift({ id: 'n' + D.catalogue.length, title: 'Untitled course', state: 'Draft', version: 'v1', owner: 'Alex Morgan', cohorts: 0, students: 0, updated: 'Oct 6' }); S.cFilter = 'all'; toast('Draft created. Assign an owner to start writing.'); break;
      case 'doEnrol': { const list = document.getElementById('ee').value.split(/\s+/).filter(x => x.includes('@')); const coh = document.getElementById('ec').value;
        list.slice().reverse().forEach((em, k) => { const nm = em.split('@')[0].split(/[._]/).map(p => p[0].toUpperCase() + p.slice(1)).join(' '); D.enrolments.unshift({ id: 'n' + Date.now() + k, student: nm, initials: nm.split(' ').map(p => p[0]).join(''), email: em, cohort: coh, state: 'Invited', progress: 0, last: 'Never' }); });
        audit(`Invited ${list.length} students to ${coh}`); S.modal = null; S.eFilter = 'all'; toast(`${pl(list.length, 'invite', 'invites')} sent. They show as Invited until they accept.`); break; }
      case 'doInvite': { const nm = document.getElementById('in').value.trim() || 'New person'; const role = document.getElementById('ir').value; D.staff.push({ name: nm, initials: nm.split(' ').map(p => p[0]).join('').slice(0, 2), email: document.getElementById('ie').value, role, scope: document.getElementById('is').value, last: 'Invited' }); audit(`Invited ${nm} as ${role}`); S.modal = null; toast(`Invite sent to ${nm} · logged`); break; }
      case 'addItem': { const [mi, kind] = v.split(','); const m = S.order[+mi]; m.items.push(kind === 'lesson' ? { kind, id: 'l' + Date.now(), title: 'New lesson', len: '0 min' } : { kind, id: 'a' + Date.now(), title: 'New assignment', due: 'not set' }); toast(kind === 'lesson' ? 'Lesson added to the v3 draft' : 'Assignment added. Set a due date and rubric.'); break; }
      case 'addModule': S.order.push({ id: 'm' + (S.order.length + 1), title: 'New module', items: [] }); toast('Module added to the v3 draft'); break;
      case 'releaseQ': { const s = D.subs.find(x => x.id === v); if (needsReview(s)) { toast(lockWhy(s)); break; }
        const sc = scoreOf(s); S.done.add(v); S.ret.delete(v); audit(`Released grade ${sc} to ${s.student}, ${s.assignment} · ${howGraded(s)}`);
        S.undo = () => { S.done.delete(v); audit(`Took back the grade for ${s.student}, ${s.assignment}`); S.panel = 'grade:' + v; };
        S.justReleased = { id: v, time: new Date().toTimeString().slice(0, 5) }; S.flash = new Set([v]);
        toast(`Grade ${sc} released to ${s.student.split(' ')[0]}`, true); break; }
      case 'bulk': {
        const n = S.sel.size; const ids = [...S.sel];
        if (v === 'release') {
          const ok = ids.filter(i => readyToRelease(D.subs.find(x => x.id === i)));
          if (ok.length !== ids.length) { toast('Some selected work is not reviewed yet. Open each AI draft first.'); break; }
          ok.forEach(i => { const s = D.subs.find(x => x.id === i); S.done.add(i); S.ret.delete(i); audit(`Released grade ${scoreOf(s)} to ${s.student}, ${s.assignment} · ${howGraded(s)}`); });
          S.undo = () => { ok.forEach(i => S.done.delete(i)); S.flash = new Set(ok); audit(`Took back ${pl(ok.length, 'released grade', 'released grades')}`); };
          toast(`${pl(n, 'grade', 'grades')} released to students`, true);
        }
        if (v === 'return') { ids.forEach(i => { S.ret.add(i); S.done.delete(i); }); toast(`${pl(n, 'submission', 'submissions')} returned for revision`); }
        if (v === 'assign') toast(`${pl(n, 'submission', 'submissions')} assigned to Nadia Kowalski`);
        // The bar leaves first, then the changed rows update with a short highlight.
        S.flash = new Set(ids); leaveBulk(() => S.sel.clear()); return;
      }
      case 'ebulk': {
        if (v === 'move') { S.modal = 'move'; break; }
        const ids = [...S.eSel]; const before = ids.map(i => [i, D.enrolments.find(e => e.id === i).state]);
        ids.forEach(i => D.enrolments.find(e => e.id === i).state = v);
        S.undo = () => { before.forEach(([i, s]) => D.enrolments.find(e => e.id === i).state = s); S.flash = new Set(ids); };
        toast(`${pl(ids.length, 'student', 'students')} ${v === 'Paused' ? 'paused' : 'dropped'} · logged`, true);
        S.flash = new Set(ids); leaveBulk(() => S.eSel.clear()); return;
      }
      case 'doMove': toast(`${pl(S.eSel.size, 'student', 'students')} moved to Autumn 2026`); S.flash = new Set(S.eSel); S.eSel.clear(); S.modal = null; break;
      case 'undo': if (S.undo) S.undo(); S.undo = null; hideToast(); break;
      case 'ai': { const id = t.dataset.id || S.param; const st = aiState(D.subs.find(s => s.id === id)); st.mode = v === 'restore' ? 'draft' : v;
        if (v === 'accept') { st.final = null; toast('AI draft accepted. Check the score, then release.'); }
        if (v === 'edit') S.focus = '#fb';
        // Discarding the draft also clears its score, so the AI number cannot be released as a hand grade.
        if (v === 'discard') { st.fb = ''; st.aiCrit = st.crit; st.crit = ['', '', '', '']; st.final = null; }
        if (v === 'restore' && st.aiCrit) { st.crit = st.aiCrit; st.final = null; }
        break; }
      case 'release': { const s = D.subs.find(x => x.id === v); if (needsReview(s)) { toast(lockWhy(s)); break; }
        const sc = scoreOf(s); S.done.add(v); S.ret.delete(v); audit(`Released grade ${sc} to ${s.student}, ${s.assignment} · ${howGraded(s)}`);
        S.undo = () => { S.done.delete(v); audit(`Took back the grade for ${s.student}, ${s.assignment}`); go(`#/${S.role}/grade/${v}`); };
        go(`#/${S.role}/grade/${t.dataset.next}`); toast(`Grade ${sc} released to ${s.student.split(' ')[0]}. Next submission opened.`, true); render(); return; }
      case 'returnOne': S.ret.add(v); S.done.delete(v); toast('Returned for revision. The student can submit attempt 2.'); break;
      case 'mv': { const [i, d] = v.split(',').map(Number); const o = S.order; const j = i + d; if (j >= 0 && j < o.length) [o[i], o[j]] = [o[j], o[i]]; break; }
      /* lesson editor */
      case 'selBlock': { const L = curLesson(); if (L.preview) return; const ed = e.target.closest('[data-bedit]');
        if (L.sel === v) return; L.sel = v; if (L.tab !== 'ai') L.tab = 'block';
        if (ed) S.focusCE = `#blk-${v} [data-bedit="${ed.dataset.bedit}"]`; break; }
      case 'blk': { const L = curLesson(); const i = L.blocks.findIndex(b => b.id === L.sel); if (i < 0) return; blockOp(L, i, v); break; }
      case 'addBlock': { const L = curLesson(); L.preview = false; addBlockAt(L, v, L.sel ? L.blocks.findIndex(b => b.id === L.sel) + 1 : L.blocks.length); break; }
      case 'qCorrect': { const L = curLesson(); const [id, i] = v.split(','); const b = L.blocks.find(x => x.id === id); change(L, () => { b.correct = +i; if (b.ai === 'draft') b.ai = 'edited'; }); L.sel = id; break; }
      case 'aiBlock': { const L = curLesson(); const [kind, id] = v.split(','); const b = L.blocks.find(x => x.id === id);
        change(L, () => { if (kind === 'accept') delete b.ai; else L.blocks = L.blocks.filter(x => x !== b); });
        if (kind === 'discard' && L.sel === id) L.sel = null;
        toast(kind === 'accept' ? 'Accepted. It joins the v3 draft and students see it once v3 is published.' : 'Draft discarded'); break; }
      case 'aiAll': { const L = curLesson(); const n = drafts(L).length;
        change(L, () => { if (v === 'accept') L.blocks.forEach(b => delete b.ai); else L.blocks = L.blocks.filter(b => !b.ai); });
        if (!L.blocks.some(b => b.id === L.sel)) L.sel = null;
        S.undo = () => undoL(L); toast(v === 'accept' ? `${pl(n, 'draft', 'drafts')} accepted into v3` : `${pl(n, 'draft', 'drafts')} discarded`, true); break; }
      case 'ltab': { const L = curLesson(); L.tab = v; S.sheet = true; break; }
      case 'sheet': S.sheet = !S.sheet; break;
      case 'lundo': undoL(curLesson()); break;
      case 'lredo': redoL(curLesson()); break;
      case 'lpreview': { const L = curLesson(); L.preview = !L.preview; L.sel = null; window.scrollTo(0, 0); break; }
      case 'aiAct': curLesson().aiAct = v; break;
      case 'aiFirst': { const L = curLesson(); L.tab = 'ai'; L.aiAct = 'first'; S.sheet = true; break; }
      case 'aiGen': { const L = curLesson(); const f = findItem(S.param); const A = D.aiSamples;
        const at = L.sel ? L.blocks.findIndex(b => b.id === L.sel) + 1 : L.blocks.length;
        const made = (L.aiAct === 'quiz' ? A.quiz.map(q => ({ type: 'quiz', ...q })) : L.aiAct === 'recap' ? [{ type: 'callout', text: A.recap }] : A.first(f.it.title)).map(b => newBlock({ ...b, ai: 'draft' }));
        change(L, () => { L.blocks.splice(L.aiAct === 'recap' ? L.blocks.length : at, 0, ...made); });
        L.sel = made[0].id; L.aiNote = L.aiAct === 'quiz' ? '3 questions added as drafts' : L.aiAct === 'recap' ? 'Recap added at the end as a draft' : `${pl(made.length, 'block', 'blocks')} added as drafts`;
        S.scrollTo = '#blk-' + made[0].id; break; }
      case 'showBlock': { const L = curLesson(); L.sel = v; L.preview = false; if (L.tab === 'checks') L.tab = 'block'; S.scrollTo = '#blk-' + v; break; }
      /* course map */
      case 'mapSel': { const st = mapState(); if (st.justPanned) return;
        if (st.pick) { const ok = addLink(v, st.pick); if (ok) { st.sel = st.pick; st.pick = null; } break; }
        if (st.tool === 'connect') { if (!st.from) { st.from = v; break; } if (addLink(st.from, v)) st.sel = v; st.from = null; break; }
        st.sel = st.sel === v ? null : v; st.selNote = null; break; }
      case 'mapTool': { const st = mapState(); st.tool = v; st.from = null; st.pick = null; break; }
      case 'mapCancel': { const st = mapState(); st.from = null; st.pick = null; if (st.tool === 'connect') st.tool = 'select'; break; }
      case 'mapPick': { const st = mapState(); st.pick = v; st.sel = v; st.from = null; break; }
      case 'mapZoom': { const vp = document.querySelector('[data-mapvp]'); zoomAt(+(mapState().k + (+v) * .1).toFixed(2), vp.clientWidth / 2, vp.clientHeight / 2); return; }
      case 'mapFit': fitMap(true); return;
      case 'mapShow': { const st = mapState(); st.sel = v; st.pick = null; st.from = null; S.mapCenter = v; break; }
      case 'unlink': { const [p, q] = v.split(','); const before = links().map(l => [...l]); S.links = links().filter(l => !(l[0] === p && l[1] === q));
        S.undo = () => { S.links = before; }; toast(`${findItem(q).it.title} no longer waits for ${findItem(p).it.title}`, true); break; }
      case 'itemMove': { const st = mapState(); const f = findItem(st.sel); const j = f.ii + (+v); if (j < 0 || j >= f.m.items.length) return; [f.m.items[f.ii], f.m.items[j]] = [f.m.items[j], f.m.items[f.ii]]; break; }
      case 'modal': S.modal = v; break;
      case 'panel': S.anim = !S.panel; S.swap = !!S.panel && S.panel !== v; S.panel = v; S.dockClosed = false; break;
      case 'gtab': S.gtab = v; window.scrollTo(0, 0); break;
      case 'closeAll': if (t.dataset.toast) toast(t.dataset.toast); if (dockOn() && S.panel && S.panel.startsWith('grade:')) { S.dockClosed = true; S.panel = null; render(); return; } closeOverlays(); return;
      case 'scrim': S.modal = null; break;
      case 'toast': toast(v); break;
      case 'lessonDone': S.lessonDone = true; S.flashDone = true; toast('Lesson marked as done'); break;
      case 'lessonUndo': S.lessonDone = false; break;
      case 'chooseFile': S.studentFile = true; break;
      case 'removeFile': S.studentFile = false; break;
      case 'submit': S.studentSubmitted = new Date().toTimeString().slice(0, 5); S.flashSub = true; toast('Submitted. You can replace the file until Oct 14.'); break;
      case 'replaceFile': S.studentSubmitted = false; S.studentFile = false; break;
      case 'demoRelease': route('#/instructor/queue'); S.panel = 'grade:' + v; S.dockClosed = false; S.anim = true; render(); return;
      default: return;
    }
    render();
  });
  document.addEventListener('change', e => {
    const t = e.target; const a = t.dataset.act; if (!a) return;
    if (['bfield', 'lessonTitle', 'aiPrompt', 'itemTitle', 'decorative', 'itemModule'].includes(a)) return;
    if (a === 'sel') { t.checked ? S.sel.add(t.dataset.v) : S.sel.delete(t.dataset.v); }
    if (a === 'qSort') S.qSort = t.value;
    if (a === 'selAll') { const rows = filteredSubs(); rows.forEach(r => t.checked ? S.sel.add(r.id) : S.sel.delete(r.id)); }
    if (a === 'eSel') { t.checked ? S.eSel.add(t.dataset.v) : S.eSel.delete(t.dataset.v); }
    if (a === 'eSelAll') { D.enrolments.filter(r => S.eFilter === 'all' || r.state === S.eFilter).forEach(r => t.checked ? S.eSel.add(r.id) : S.eSel.delete(r.id)); }
    // Unticking the last row lets the bulk bar leave before the page updates.
    if (['sel', 'selAll', 'eSel', 'eSelAll'].includes(a) && !(a.startsWith('e') ? S.eSel : S.sel).size) {
      const bar = document.querySelector('.bulkbar');
      if (bar && !reduceMotion()) { bar.classList.add('leave'); setTimeout(render, MOTION.bulkOut); return; }
    }
    // Changing the score or the feedback by hand counts as reviewing the AI draft.
    if (a === 'crit') { const st = aiState(D.subs.find(s => s.id === t.dataset.id)); st.crit[+t.dataset.v] = t.value.trim() === '' ? '' : Math.max(0, Math.min(25, parseInt(t.value) || 0)); st.final = null; if (st.mode === 'draft') st.mode = 'edit'; }
    if (a === 'qscore') { const st = aiState(D.subs.find(s => s.id === t.dataset.id)); st.final = t.value.trim() === '' ? null : Math.max(0, Math.min(100, parseInt(t.value) || 0)); if (st.mode === 'draft') st.mode = 'edit'; }
    if (a === 'fbtext') { aiState(D.subs.find(s => s.id === t.dataset.id)).fb = t.value; return; }
    render();
  });
  document.addEventListener('input', e => {
    if (e.target.dataset.act === 'fbtext') { const st = aiState(D.subs.find(s => s.id === e.target.dataset.id)); st.fb = e.target.value; if (st.mode === 'draft') { st.mode = 'edit'; S.focus = '#fb'; render(); } return; }
    if (e.target.dataset.act === 'q') { S.q = e.target.value; const pos = e.target.selectionStart; render(); const i = document.querySelector('[data-act="q"]'); i.focus(); i.setSelectionRange(pos, pos); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && (S.modal || S.panel)) { closeOverlays(); return; }
    const ae = document.activeElement; const typing = /INPUT|TEXTAREA|SELECT/.test(ae.tagName) || ae.isContentEditable; const mod = e.metaKey || e.ctrlKey;
    if (S.page === 'lesson' && VIEWS.instructor && S.role === 'instructor' && !S.modal) {
      const L = curLesson();
      // Enter in a text block starts a new text block; in a one-line field it finishes the edit.
      if (ae.isContentEditable && ae.dataset.bedit && e.key === 'Enter' && !e.shiftKey) { e.preventDefault();
        if (ae.dataset.bedit === 'text' && L.blocks.find(b => b.id === ae.dataset.bid).type === 'text') { addBlockAt(L, 'text', L.blocks.findIndex(b => b.id === ae.dataset.bid) + 1); render(); } else ae.blur(); return; }
      if (typing) return;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redoL(L) : undoL(L); render(); return; }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redoL(L); render(); return; }
      const i = L.blocks.findIndex(b => b.id === L.sel); if (i < 0) return;
      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); blockOp(L, i, e.key === 'ArrowUp' ? 'up' : 'down'); render(); return; }
      if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); blockOp(L, i, 'dup'); render(); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); blockOp(L, i, 'del'); render(); return; }
      if (e.key === 'Escape') { L.sel = null; render(); return; }
    }
    if (S.page === 'builder' && S.param === 'map' && !typing && !S.modal && document.querySelector('[data-mapvp]')) {
      const st = mapState(); const k = e.key.toLowerCase(); const vp = document.querySelector('[data-mapvp]');
      const T = { v: 'select', h: 'hand', c: 'connect', n: 'note' };
      if (k === ' ') { e.preventDefault(); S.space = true; vp.classList.add('space'); return; }
      if (T[k] && !mod) { st.tool = T[k]; st.from = null; st.pick = null; render(); return; }
      if (k === '+' || k === '=') { zoomAt(st.k + .1, vp.clientWidth / 2, vp.clientHeight / 2); return; }
      if (k === '-') { zoomAt(st.k - .1, vp.clientWidth / 2, vp.clientHeight / 2); return; }
      if (k === '0') { fitMap(true); return; }
      if (k === 'escape') { st.from = null; st.pick = null; st.sel = null; st.selNote = null; if (st.tool === 'connect') st.tool = 'select'; render(); return; }
      if ((k === 'delete' || k === 'backspace') && st.selNote) { st.notes = st.notes.filter(n => n.id !== st.selNote); st.selNote = null; render(); return; }
    }
    if (S.page === 'grade' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      const L = mySubs(); const i = Math.max(0, L.findIndex(s => s.id === S.param));
      if (e.key === 'j') go(`#/${S.role}/grade/${L.at((i + 1) % L.length).id}`);
      if (e.key === 'k') go(`#/${S.role}/grade/${L.at((i - 1 + L.length) % L.length).id}`);
    }
  });
  /* ---------- lesson editor: typing, drag and drop, shortcuts ---------- */
  function patchLesson(L) {
    const iss = issues(L); const btn = document.getElementById('lesson-issues');
    if (btn) { btn.classList.toggle('has', !!iss.length); btn.innerHTML = iss.length ? ic('alert', 16) + pl(iss.length, 'issue', 'issues') : ic('check', 16) + 'No issues'; }
    const cnt = document.getElementById('checks-count'); if (cnt) cnt.textContent = iss.length;
    L.blocks.filter(b => b.type === 'image').forEach(b => { const el = document.querySelector(`#blk-${b.id} .noalt`); if (el) el.style.display = needsAlt(b) ? '' : 'none'; });
    const af = document.getElementById('alt-field'); const b = L.blocks.find(x => x.id === L.sel); if (af && b) af.classList.toggle('invalid', needsAlt(b));
    const u = document.querySelector('[data-act="lundo"]'); if (u) u.disabled = !L.undo.length;
  }
  // The first keystroke of an edit saves one undo step for the whole edit.
  function beginEdit(L) { if (S.ceDirty) return; L.undo.push(S.ceSnap || snap(L)); L.redo = []; S.ceDirty = true; }
  document.addEventListener('focusin', e => { if (e.target.matches('[data-bedit],[data-act="bfield"]') && S.page === 'lesson') { S.ceSnap = snap(curLesson()); S.ceDirty = false; } });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset && t.dataset.bedit) { const L = curLesson(); const b = L.blocks.find(x => x.id === t.dataset.bid); if (!b) return; beginEdit(L);
      const f = t.dataset.bedit, val = t.innerText.replace(/\n$/, '');
      if (/^o\d$/.test(f)) b.options[+f[1]] = val; else b[f] = val;
      if (b.ai === 'draft') { b.ai = 'edited'; const bd = document.querySelector(`[data-badge="${b.id}"]`); if (bd) bd.textContent = 'AI draft · edited by you'; }
      if (b.type === 'heading') { const o = document.querySelector(`[data-outline="${b.id}"]`); if (o) o.textContent = val; }
      patchLesson(L); return; }
    if (t.dataset.act === 'bfield') { const L = curLesson(); const b = L.blocks.find(x => x.id === t.dataset.bid); beginEdit(L); b[t.dataset.v] = t.value;
      if (t.dataset.v === 'caption') { const c = document.querySelector(`#blk-${b.id} [data-bedit="caption"]`); if (c) c.textContent = t.value; }
      if (t.dataset.v === 'text') { const c = document.querySelector(`#blk-${b.id} .cap b`); if (c) c.textContent = t.value; }
      patchLesson(L); return; }
    if (t.dataset.act === 'lessonTitle') { const f = findItem(S.param); f.it.title = t.value; const h = document.querySelector('.page-head h1'); if (h) h.textContent = t.value || 'Untitled lesson'; return; }
    if (t.dataset.act === 'aiPrompt') { curLesson().prompt = t.value; return; }
    if (t.dataset.act === 'itemTitle') { const f = findItem(t.dataset.v); f.it.title = t.value; const c = document.querySelector(`[data-ctitle="${t.dataset.v}"]`); if (c) c.textContent = t.value; return; }
    if (t.dataset.notetext) { const n = mapState().notes.find(x => x.id === t.dataset.notetext); if (n) n.text = t.innerText; }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.act === 'decorative') { const L = curLesson(); const b = L.blocks.find(x => x.id === L.sel); change(L, () => { b.decorative = t.checked; }); render(); }
    if (t.dataset.act === 'itemModule') { const f = findItem(t.dataset.v); const to = mods()[+t.value]; f.m.items.splice(f.ii, 1); to.items.push(f.it); toast(`Moved to Module ${+t.value + 1} · ${to.title}`); render(); }
  });
  // Paste as plain text, so lessons never carry fonts and colours from elsewhere.
  document.addEventListener('paste', e => { const t = e.target.closest && e.target.closest('[contenteditable]'); if (!t) return; e.preventDefault(); const txt = (e.clipboardData || window.clipboardData).getData('text/plain'); document.execCommand('insertText', false, txt); });
  let DRAG = null, DROP = null;
  const clearDrop = () => document.querySelectorAll('.drop-before,.drop-after').forEach(x => x.classList.remove('drop-before', 'drop-after'));
  document.addEventListener('dragstart', e => {
    const d = e.target.closest && e.target.closest('[data-drag]'); if (!d) return; DRAG = d.dataset.drag;
    try { e.dataTransfer.setData('text/plain', DRAG); e.dataTransfer.effectAllowed = 'copyMove'; } catch (x) {}
    if (DRAG.startsWith('move:')) { const blk = d.closest('.blk'); if (blk && e.dataTransfer.setDragImage) e.dataTransfer.setDragImage(blk, 24, 24); }
    document.body.classList.add('is-dragging');
  });
  document.addEventListener('dragover', e => {
    if (!DRAG) return; const page = e.target.closest && e.target.closest('[data-drop="page"]'); if (!page) return; e.preventDefault();
    const L = curLesson(); clearDrop(); const blk = e.target.closest('.blk');
    if (blk) { const r = blk.getBoundingClientRect(); const after = e.clientY > r.top + r.height / 2; blk.classList.add(after ? 'drop-after' : 'drop-before'); DROP = { id: blk.dataset.block, after }; }
    else { const last = page.querySelector('.blk:last-of-type'); if (last) { last.classList.add('drop-after'); DROP = { id: last.dataset.block, after: true }; } else DROP = { id: null, after: true }; }
  });
  document.addEventListener('drop', e => {
    if (!DRAG || !DROP) return; e.preventDefault(); const L = curLesson();
    let at = DROP.id ? L.blocks.findIndex(b => b.id === DROP.id) + (DROP.after ? 1 : 0) : L.blocks.length;
    if (DRAG.startsWith('add:')) addBlockAt(L, DRAG.slice(4), at);
    else { const id = DRAG.slice(5); const from = L.blocks.findIndex(b => b.id === id); if (from > -1 && at !== from && at !== from + 1) { change(L, () => { const [b] = L.blocks.splice(from, 1); L.blocks.splice(at > from ? at - 1 : at, 0, b); }); L.sel = id; } }
    DRAG = null; DROP = null; clearDrop(); document.body.classList.remove('is-dragging'); render();
  });
  document.addEventListener('dragend', () => { DRAG = null; DROP = null; clearDrop(); document.body.classList.remove('is-dragging'); });

  /* ---------- course map: pan, zoom, pinch, notes ---------- */
  const ptrs = new Map(); let PAN = null, NOTE = null, PINCH = null;
  const inMap = el => el && el.closest && el.closest('[data-mapvp]');
  document.addEventListener('pointerdown', e => {
    const vp = inMap(e.target); if (!vp) return; const st = mapState();
    if (e.target.closest('.mtools,.mhint,.mlegend')) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; PINCH = { d: Math.hypot(a.x - b.x, a.y - b.y), k: st.k }; PAN = null; return; }
    const nd = e.target.closest('[data-notedrag]');
    if (nd && st.tool !== 'hand') { const n = st.notes.find(x => x.id === nd.dataset.notedrag); NOTE = { n, x: e.clientX, y: e.clientY, el: nd.parentElement }; st.selNote = n.id; return; }
    const onThing = e.target.closest('.mcard,.mnote');
    if (st.tool === 'note' && !onThing) { const r = vp.getBoundingClientRect(); const n = { id: 'n' + Date.now(), x: (e.clientX - r.left - st.x) / st.k, y: (e.clientY - r.top - st.y) / st.k, who: D.people.instructor.name, initials: D.people.instructor.initials, when: 'just now', text: '' };
      st.notes.push(n); st.tool = 'select'; st.selNote = n.id; render(); const t = document.querySelector(`[data-notetext="${n.id}"]`); if (t) t.focus(); return; }
    if (onThing && st.tool !== 'hand' && !S.space) return;
    PAN = { x: e.clientX, y: e.clientY, moved: 0 }; vp.classList.add('panning'); try { vp.setPointerCapture(e.pointerId); } catch (x) {}
  });
  document.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); const st = mapState();
    if (PINCH && ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const vp = document.querySelector('[data-mapvp]').getBoundingClientRect(); zoomAt(PINCH.k * Math.hypot(a.x - b.x, a.y - b.y) / PINCH.d, (a.x + b.x) / 2 - vp.left, (a.y + b.y) / 2 - vp.top); return; }
    if (NOTE) { const dx = (e.clientX - NOTE.x) / st.k, dy = (e.clientY - NOTE.y) / st.k; NOTE.x = e.clientX; NOTE.y = e.clientY; NOTE.n.x += dx; NOTE.n.y += dy; NOTE.el.style.left = NOTE.n.x + 'px'; NOTE.el.style.top = NOTE.n.y + 'px'; return; }
    if (PAN) { const dx = e.clientX - PAN.x, dy = e.clientY - PAN.y; PAN.x = e.clientX; PAN.y = e.clientY; PAN.moved += Math.abs(dx) + Math.abs(dy); st.x += dx; st.y += dy; applyMap(); }
  });
  const endPtr = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) PINCH = null; if (!ptrs.size) {
    const st = S.map; if (PAN && st) { if (PAN.moved > 4) { st.justPanned = true; setTimeout(() => { st.justPanned = false; }, 0); } else if (!e.target.closest('.mcard,.mnote') && st.tool === 'select' && (st.sel || st.selNote)) { st.sel = null; st.selNote = null; render(); } }
    PAN = null; NOTE = null; const vp = document.querySelector('[data-mapvp]'); if (vp) vp.classList.remove('panning'); } };
  document.addEventListener('pointerup', endPtr); document.addEventListener('pointercancel', endPtr);
  document.addEventListener('wheel', e => {
    const vp = inMap(e.target); if (!vp) return; e.preventDefault(); const st = mapState(); const r = vp.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) zoomAt(st.k * Math.exp(-e.deltaY * .01), e.clientX - r.left, e.clientY - r.top); else { st.x -= e.deltaX; st.y -= e.deltaY; applyMap(); }
  }, { passive: false });
  document.addEventListener('keyup', e => { if (e.key === ' ' && S.space) { S.space = false; const vp = document.querySelector('[data-mapvp]'); if (vp) vp.classList.remove('space'); } });
  // An empty address opens the product site; any app route opens the demo directly.
  let start = SITE ? '#/' : '#/instructor/home';
  try { if (ROUTE_RE.test(location.hash)) start = location.hash; } catch (e) {}
  route(start, true);
})();
