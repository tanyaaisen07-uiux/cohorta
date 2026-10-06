/* Cohorta demo app: one course, three roles. Vanilla JS, hash routing. */
(function () {
  const D = window.DB;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const S = {
    role: 'instructor', page: 'home', param: null, demo: 'normal',
    sel: new Set(), qStatus: 'all', q: '', sortDir: 'desc', dense: false,
    eSel: new Set(), eFilter: 'all', cFilter: 'all',
    toast: null, modal: null, panel: null,
    ai: {}, done: new Set(), ret: new Set(), studentSubmitted: false, order: null, anim: false, focus: null
  };

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
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2'
  };
  const ic = (n, s = 18, w = 1.8) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`;

  const symbol = (h = 22, mid = '#0B0D17', out = '#2A3BFF') => `<svg width="${Math.round(h * 52 / 48)}" height="${h}" viewBox="6 8 52 48" aria-hidden="true"><rect x="6" y="8" width="52" height="13" rx="6.5" fill="${out}"/><rect x="6" y="25.5" width="24" height="13" rx="6.5" fill="${mid}"/><rect x="6" y="43" width="52" height="13" rx="6.5" fill="${out}"/></svg>`;
  const wordmark = (h = 18) => `<svg width="${Math.round(h * 4.71)}" height="${h}" overflow="visible" viewBox="${LOGO.vb}" fill="currentColor" role="img" aria-label="cohorta">${LOGO.wm}</svg>`;
  const lockup = () => `<a href="#/${S.role}/home" class="brand">${symbol(22)}${wordmark(19)}</a>`;

  const tagClass = s => ({ 'Draft': 't-draft', 'In review': 't-review', 'Published': 't-published', 'Archived': 't-archived', 'Running': 't-running', 'Scheduled': 't-scheduled',
    'Completed': 't-completed', 'Active': 't-active', 'Invited': 't-invited', 'Paused': 't-paused', 'Dropped': 't-dropped', 'Graded': 't-graded', 'Submitted': 't-submitted',
    'Returned': 't-returned', 'Late': 't-late', 'AI draft ready': 't-ai', 'Locked': 't-locked', 'Not started': 't-draft', 'Error': 't-error' }[s] || 't-draft');
  const tag = s => `<span class="tag ${tagClass(s)}">${esc(s)}</span>`;
  const subLabel = s => ({ ai: 'AI draft ready', submitted: 'Submitted', late: 'Late', graded: 'Graded', returned: 'Returned' }[s]);
  const av = (i, n) => `<span class="avatar" aria-hidden="true">${esc(i)}</span>`;
  const bar = (p, c = '') => `<div class="bar ${c}" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><span style="width:${p}%"></span></div>`;

  /* ---------- navigation ---------- */
  const NAV = {
    student: [['home', 'Home', 'home'], ['lesson', 'Current lesson', 'play'], ['assignment', 'Assignment', 'file'], ['grades', 'Grades', 'chart']],
    instructor: [['home', 'Dashboard', 'home'], ['queue', 'Grading queue', 'inbox'], ['builder', 'Course builder', 'book'], ['editor', 'Assignment editor', 'edit'], ['roster', 'Cohort roster', 'users']],
    admin: [['home', 'Overview', 'home'], ['catalogue', 'Courses', 'grid'], ['enrolments', 'Enrolments', 'list'], ['users', 'Users and roles', 'shield']]
  };
  const stOf = s => S.done.has(s.id) ? 'graded' : S.ret.has(s.id) ? 'returned' : s.status;
  const aiState = s => S.ai[s.id] || (S.ai[s.id] = { mode: s.ai ? 'draft' : 'none', final: null, crit: (() => { const t = s.ai || 76; const a = [Math.round(t * .26), Math.round(t * .25), Math.round(t * .24)].map(x => Math.min(25, x)); a.push(Math.max(0, Math.min(25, t - a[0] - a[1] - a[2]))); return a; })() });
  const scoreOf = s => { const st = aiState(s); return st.final != null ? st.final : st.crit.reduce((x, y) => x + (+y || 0), 0); };
  const finalOf = s => { const k = stOf(s); if (k === 'graded') return S.done.has(s.id) ? scoreOf(s) : s.final; if (k === 'returned') return S.ret.has(s.id) ? scoreOf(s) : s.final; return null; };
  const pending = () => D.subs.filter(s => ['ai', 'submitted', 'late'].includes(stOf(s)));
  const toReview = () => pending().length;
  const inReview = () => D.catalogue.filter(c => c.state === 'In review');
  const pl = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const audit = what => D.audit.unshift({ when: 'Oct 6, 2026 · ' + new Date().toTimeString().slice(0, 5), who: D.people[S.role].name, what });

  function side() {
    const me = D.people[S.role];
    const items = NAV[S.role].map(([p, l, i]) => {
      const count = S.role === 'instructor' && p === 'queue' ? `<span class="count">${toReview()}</span>` : S.role === 'admin' && p === 'catalogue' && inReview().length ? `<span class="count">${inReview().length}</span>` : '';
      return `<a href="#/${S.role}/${p}" ${S.page === p || (p === 'queue' && S.page === 'grade') ? 'aria-current="page"' : ''} title="${l}">${ic(i)}<span class="lbl">${l}</span>${count}</a>`;
    }).join('');
    const ctx = S.role === 'student' ? 'UX Design Fundamentals · Spring 2026' : S.role === 'instructor' ? 'UXF · Spring 2026' : 'Cohorta School';
    return `<aside class="side" aria-label="Main">${lockup()}<div><div class="nav-label">${esc(ctx)}</div><nav class="nav">${items}</nav></div>
      <div class="me" title="${esc(me.name)} · ${me.role}">${av(me.initials)}<div class="me-txt"><div style="font-weight:600">${esc(me.name)}</div><div class="muted" style="font-size:12px">${me.role}</div></div></div></aside>`;
  }
  function mobileChrome() {
    const items = NAV[S.role].slice(0, 4).map(([p, l, i]) => `<a href="#/${S.role}/${p}" ${S.page === p ? 'aria-current="page"' : ''}>${ic(i, 20)}<span>${l.split(' ')[0]}</span></a>`).join('');
    return { top: `<div class="mtop">${symbol(20)}${wordmark(16)}<span class="grow"></span>${av(D.people[S.role].initials)}</div>`, bottom: `<nav class="mnav" aria-label="Main">${items}</nav>` };
  }
  function demoBar() {
    const seg = (key, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button type="button" data-act="${key}" data-v="${v}" aria-pressed="${S[key] === v}">${l}</button>`).join('')}</div>`;
    return `<div class="demo" role="region" aria-label="Demo controls"><b>Cohorta demo</b><span class="hide-m">View as</span>${seg('role', [['student', 'Student'], ['instructor', 'Instructor'], ['admin', 'Admin']])}
      <span class="hide-m">State</span>${seg('demo', [['normal', 'Normal'], ['empty', 'Empty'], ['loading', 'Loading'], ['error', 'Error'], ['denied', 'No access']])}
      <span class="spacer"></span><span class="hide-m">Self-initiated case study by Tania Aisen · sample data</span></div>`;
  }

  /* ---------- shared states ---------- */
  const head = (title, sub = '', actions = '', crumbs = '') => `<div class="page-head"><div>${crumbs ? `<div class="crumbs">${crumbs}</div>` : ''}<h1>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
  const emptyState = (title, text, action = '', icon = 'inbox') => `<div class="card empty"><div class="ico">${ic(icon, 22)}</div><h3>${title}</h3><p>${text}</p>${action}</div>`;
  const skeleton = () => `<div class="grid g-4" style="margin-bottom:16px">${'<div class="card"><div class="skel" style="height:14px;width:60%"></div><div class="skel" style="height:30px;width:40%;margin-top:12px"></div></div>'.repeat(4)}</div>
    <div class="tablebox" style="padding:12px" aria-busy="true" aria-label="Loading">${'<div style="display:flex;gap:16px;padding:12px 4px"><div class="skel" style="width:28px;height:28px;border-radius:50%"></div><div class="skel" style="height:14px;flex:2;margin-top:7px"></div><div class="skel" style="height:14px;flex:1;margin-top:7px"></div><div class="skel" style="height:14px;flex:1;margin-top:7px"></div></div>'.repeat(8)}</div>`;
  const errorBanner = (what) => `<div class="banner error" role="alert">${ic('alert', 20)}<div class="grow"><b>We couldn't load ${what}.</b>Check your connection and try again. Your last changes are saved.</div><button class="btn sm" data-act="demo" data-v="normal">Try again</button></div>`;
  const denied = (what, who, alt) => `<div class="denied card"><div class="lock" style="color:#fff">${ic('lock', 24)}</div><h2 style="font-family:var(--font-brand);font-weight:600;letter-spacing:-.02em;margin:0 0 8px">You can't open ${what}</h2>
    <p class="muted" style="margin:0 0 16px">${who}</p>${alt}</div>`;
  function guard(cfg, render) {
    if (S.demo === 'loading') return head(cfg.title, cfg.sub) + skeleton();
    if (S.demo === 'denied') return head(cfg.title) + denied(cfg.deniedWhat, cfg.deniedWho, cfg.deniedAlt || '');
    if (S.demo === 'error') return head(cfg.title, cfg.sub) + errorBanner(cfg.errWhat) + emptyState('Nothing to show yet', 'This page will fill in as soon as the data loads.', '', 'alert');
    if (S.demo === 'empty') return cfg.empty.startsWith('<div class="page-head"') ? cfg.empty : head(cfg.title, cfg.sub) + cfg.empty;
    return render();
  }
  const lockBtn = (label, why, cls = 'btn') => `<span class="lockwrap"><button class="${cls}" aria-disabled="true" aria-describedby="why-${label.replace(/\W/g, '')}">${ic('lock', 14)}${label}</button><span class="why" role="tooltip" id="why-${label.replace(/\W/g, '')}">${why}</span></span>`;

  /* ================= INSTRUCTOR ================= */
  function iHome() {
    const n = toReview(); const late = D.subs.filter(s => stOf(s) === 'late').length;
    return guard({ title: 'Good afternoon, Maria', sub: 'UX Design Fundamentals · 2 cohorts', errWhat: 'your dashboard', deniedWhat: 'this dashboard', deniedWho: 'Your instructor access ended on Sep 30. Ask an admin to renew it.',
      empty: `<div class="grid g-main"><div>${emptyState('No submissions yet', 'Your next review will appear here when students submit work for Spring 2026.', '<a class="btn" href="#/instructor/builder">Open course builder</a>')}</div><div class="card" style="align-self:start"><h2>Upcoming deadlines</h2><p class="muted" style="margin:0">No deadlines in the next 14 days.</p></div></div>` }, () => `
      ${head('Good afternoon, Maria', 'UX Design Fundamentals · Spring 2026 and Autumn 2026')}
      <div class="card cta-card" style="margin-bottom:16px"><div style="flex:1"><div class="big">${pl(n, 'submission', 'submissions')} to review</div><div class="muted">${late === 1 ? '1 is late' : late + ' are late'} · AI drafts are ready for ${D.subs.filter(s => stOf(s) === 'ai').length}. You always confirm the grade.</div></div>
        <a class="btn primary" href="#/instructor/queue">Review ${pl(n, 'submission', 'submissions')}</a></div>
      <div class="grid g-4" style="margin-bottom:16px">
        <div class="card stat"><div class="label">Active cohorts</div><div class="val num">2</div><div class="hint">96 students</div></div>
        <div class="card stat"><div class="label">To review</div><div class="val num">${n}</div><div class="hint">Oldest from Sep 29</div></div>
        <div class="card stat alert"><div class="label">Students at risk</div><div class="val num">12</div><div class="hint">No activity in 7+ days</div></div>
        <div class="card stat"><div class="label">Next deadline</div><div class="val num">Oct 14</div><div class="hint">Usability test report</div></div>
      </div>
      <div class="grid g-main">
        <div class="card"><h2>Students at risk</h2><div class="list">
          ${[['Mateo Silva', 'MS', 'No activity for 15 days', 'Paused'], ['Amira Bensaid', 'AB', '2 assignments late', 'Late'], ['Tom Walsh', 'TW', 'Stuck on Module 2 for 11 days', 'Late'], ['Elena Popescu', 'EP', 'Last login Sep 24', 'Paused'], ['Noah Becker', 'NB', 'Wireframe review returned twice', 'Returned']]
            .map(([nm, i, why, t]) => `<div class="row">${av(i)}<div style="flex:1"><div style="font-weight:600">${nm}</div><div class="muted" style="font-size:13px">${why}</div></div>${tag(t)}<a class="btn sm" href="#/instructor/roster">Open</a></div>`).join('')}
          </div></div>
        <div class="grid">
          <div class="card"><h2>Upcoming deadlines</h2><div class="list">
            <div class="row"><div style="flex:1"><b>Usability test report</b><div class="muted" style="font-size:13px">Spring 2026 · 48 students</div></div><span class="num">Oct 14</span></div>
            <div class="row"><div style="flex:1"><b>Cohort starts</b><div class="muted" style="font-size:13px">Autumn 2026</div></div><span class="num">Oct 20</span></div>
            <div class="row"><div style="flex:1"><b>Final case study</b><div class="muted" style="font-size:13px">Spring 2026</div></div><span class="num">Nov 4</span></div></div></div>
          <div class="card"><h2>Recent activity</h2><div class="list" style="font-size:13px">
            <div class="row"><span style="flex:1">Leo Rossi submitted Wireframe review</span><span class="muted">2 h</span></div>
            <div class="row"><span style="flex:1">Nadia Kowalski graded 4 submissions</span><span class="muted">5 h</span></div>
            <div class="row"><span style="flex:1">Course v2 pushed to Spring 2026</span><span class="muted">1 d</span></div></div></div>
        </div>
      </div>`);
  }

  function filteredSubs() {
    let rows = D.subs.map(s => ({ ...s, status: stOf(s), final: finalOf(s) }));
    if (S.qStatus !== 'all') rows = rows.filter(r => r.status === S.qStatus);
    if (S.q) rows = rows.filter(r => r.student.toLowerCase().includes(S.q.toLowerCase()));
    const ord = d => { const [m, day] = d.split(' '); return (m === 'Sep' ? 0 : 100) + +day; };
    rows.sort((a, b) => S.sortDir === 'desc' ? ord(b.submitted) - ord(a.submitted) : ord(a.submitted) - ord(b.submitted));
    return rows;
  }
  function iQueue() {
    return guard({ title: 'Grading queue', sub: 'UXF · Spring 2026', errWhat: 'submissions', deniedWhat: 'this grading queue', deniedWho: 'Teaching assistants only see the groups they are assigned to. Group B belongs to Ben Okafor.',
      deniedAlt: '<a class="btn" href="#/instructor/queue" data-act="demo" data-v="normal">Open my groups</a>',
      empty: emptyState('No submissions yet', 'Your next review will appear here. Students submit Wireframe review by Oct 2.', '<a class="btn" href="#/instructor/editor">Check the assignment</a>') }, () => {
      const rows = filteredSubs();
      const counts = s => D.subs.filter(x => stOf(x) === s).length;
      const chips = [['all', `All ${D.subs.length}`], ['ai', `AI draft ready ${counts('ai')}`], ['submitted', `Submitted ${counts('submitted')}`], ['late', `Late ${counts('late')}`], ['graded', `Graded ${counts('graded')}`], ['returned', `Returned ${counts('returned')}`]]
        .map(([v, l]) => `<button class="chip" data-act="qStatus" data-v="${v}" aria-pressed="${S.qStatus === v}">${l}</button>`).join('');
      const allSel = rows.length && rows.every(r => S.sel.has(r.id));
      const pad = S.dense ? 'style="padding-top:5px;padding-bottom:5px"' : '';
      const body = rows.map(r => `<tr class="${S.sel.has(r.id) ? 'sel' : ''}"><td class="check c-check" ${pad}><label class="hit"><input type="checkbox" aria-label="Select ${esc(r.student)}" data-act="sel" data-v="${r.id}" ${S.sel.has(r.id) ? 'checked' : ''}></label></td>
        <td class="c-student" ${pad}><div class="who">${av(r.initials)}<div style="min-width:0"><button class="linkbtn" data-act="panel" data-v="grade:${r.id}">${esc(r.student)}</button><div class="meta-2nd">${esc(r.assignment)} · ${r.group} · ${r.submitted}</div></div></div></td>
        <td class="c-2nd" ${pad}>${esc(r.assignment)}</td><td ${pad} class="muted c-2nd">${r.group}</td><td ${pad} class="num c-2nd">${r.submitted}</td><td class="c-status" ${pad}>${tag(subLabel(r.status))}</td>
        <td ${pad} class="num c-ai" data-label="AI">${r.ai != null ? `<span class="mono" style="background:#F1F2FF;padding:2px 6px;border-radius:6px">${r.ai}</span>` : '<span class="muted">—</span>'}</td>
        <td ${pad} class="num c-final" data-label="Final" style="font-weight:600">${r.final != null ? r.final : '<span class="muted" style="font-weight:400">—</span>'}</td>
        <td ${pad} class="c-act" style="text-align:right"><button class="btn sm" data-act="panel" data-v="grade:${r.id}">${r.status === 'graded' ? 'View' : 'Review'}</button></td></tr>`).join('');
      const selRows = rows.filter(r => S.sel.has(r.id));
      const canRelease = selRows.length && selRows.every(r => r.status === 'graded');
      const bulk = S.sel.size ? `<div class="bulkbar" role="region" aria-label="Bulk actions"><b>${S.sel.size} selected</b><span class="spacer" style="flex:1"></span>
        <button class="btn sm" data-act="bulk" data-v="assign">Assign to TA</button><button class="btn sm" data-act="bulk" data-v="return">Return for revision</button>
        ${canRelease ? '<button class="btn sm primary" data-act="bulk" data-v="release">Release grades</button>' : lockBtn('Release grades', 'Only graded work can be released. Review the AI drafts first.', 'btn sm')}
        <button class="iconbtn" style="color:#C9CBD6" aria-label="Clear selection" data-act="clearSel">${ic('x')}</button></div>` : '';
      return `${head('Grading queue', 'UX Design Fundamentals · Spring 2026 · Wireframe review is due Oct 2', '<button class="btn" data-act="dense">' + (S.dense ? 'Comfortable rows' : 'Compact rows') + '</button>')}
        <div class="toolbar"><label class="search">${ic('search', 16)}<span class="sr">Search students</span><input data-act="q" value="${esc(S.q)}" placeholder="Search students"></label>
          <select class="select" aria-label="Cohort"><option>Spring 2026</option><option>Autumn 2026</option></select>
          <select class="select" aria-label="Assignment"><option>All assignments</option><option>Wireframe review</option><option>User interview plan</option></select></div>
        <div class="toolbar" role="group" aria-label="Filter by status">${chips}</div>
        <div class="tablebox"><table class="rtable"><thead><tr><th class="check"><label class="hit"><input type="checkbox" aria-label="Select all" data-act="selAll" ${allSel ? 'checked' : ''}></label></th><th>Student</th><th class="c-2nd">Assignment</th><th class="c-2nd">Group</th>
          <th class="sortable c-2nd" data-act="sort" aria-sort="${S.sortDir === 'desc' ? 'descending' : 'ascending'}">Submitted ${S.sortDir === 'desc' ? '↓' : '↑'}</th><th>Status</th><th>AI score</th><th>Final score</th><th></th></tr></thead>
          <tbody>${body || `<tr><td colspan="9"><div class="empty" style="padding:32px"><h3>No matches</h3><p>No submissions with this status. Clear the filter to see all ${D.subs.length}.</p><button class="btn sm" data-act="qStatus" data-v="all">Clear filter</button></div></td></tr>`}</tbody></table></div>${bulk}`;
    });
  }

  const FB = 'Strong flow from sign-up to first course. The empty states are thought through. Two things to fix: the enrolment screen hides the cohort dates, and the error on a failed upload does not say what to do next.';
  function aiCard(s, st) {
    if (st.mode === 'draft') return `<div class="ai" aria-label="AI draft"><div class="head">${ic('sparkle', 16)}<b>AI draft</b>${tag('AI draft ready')}<span class="spacer" style="flex:1"></span><span class="mono">Suggested ${s.ai}</span></div>
        <div style="font-size:14px;color:var(--text-2)">${FB}</div><div class="muted" style="font-size:12px">Based on the rubric. Check it before you send; students see only what you release.</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm primary" data-act="ai" data-v="accept" data-id="${s.id}">Accept draft</button><button class="btn sm" data-act="ai" data-v="edit" data-id="${s.id}">Edit</button><button class="btn sm ghost" data-act="ai" data-v="discard" data-id="${s.id}">Discard</button></div></div>`;
    if (st.mode === 'none') return `<div class="banner info" style="margin:0">${ic('clock', 18)}<div class="grow"><b>AI draft is not ready yet.</b>It usually takes a minute after submission. You can grade without it.</div></div>`;
    if (st.mode === 'discard') return `<div class="banner info" style="margin:0">${ic('x', 18)}<div class="grow"><b>AI draft discarded.</b>Grade with the rubric.</div><button class="btn sm" data-act="ai" data-v="restore" data-id="${s.id}">Undo</button></div>`;
    if (st.mode === 'accept') return `<div class="banner info" style="margin:0">${ic('check', 18)}<div class="grow"><b>AI draft accepted as a starting point.</b>Score and feedback are filled in. Check them, then release.</div></div>`;
    if (st.mode === 'edit') return `<div class="banner info" style="margin:0">${ic('edit', 18)}<div class="grow"><b>Editing the AI draft.</b>Your version replaces the draft; the student sees only what you release.</div></div>`;
    return '';
  }
  const fbFor = st => (st.mode === 'accept' || st.mode === 'edit') ? (st.fb != null ? st.fb : FB) : (st.fb || '');
  const stateBanner = s => stOf(s) === 'graded' ? `<div class="banner info" style="margin:0">${ic('check', 18)}<div class="grow"><b>Graded and released.</b>You can change the grade within 7 days; every change is logged.</div></div>`
    : stOf(s) === 'returned' ? `<div class="banner warn" style="margin:0">${ic('back', 18)}<div class="grow"><b>Returned for revision.</b>${esc(s.student.split(' ')[0])} can submit attempt 2 of 2.</div></div>` : '';
  function iGrade(id) {
    const list = D.subs; const idx = Math.max(0, list.findIndex(s => s.id === id)); const s = list[idx];
    const st = aiState(s);
    const total = scoreOf(s);
    const prev = list[(idx - 1 + list.length) % list.length].id, next = list[(idx + 1) % list.length].id;
    return guard({ title: s.student, errWhat: 'this submission', deniedWhat: 'this submission', deniedWho: `${s.student} is in ${s.group}, which is assigned to another teaching assistant.`, deniedAlt: '<a class="btn" href="#/instructor/queue">Back to my queue</a>',
      empty: emptyState('Nothing submitted', `${s.student} has not submitted ${s.assignment} yet. You'll get a notification when they do.`, '<a class="btn" href="#/instructor/queue">Back to queue</a>', 'file') }, () => `
      ${head(esc(s.student), `${esc(s.assignment)} · ${s.group} · submitted ${s.submitted}`, `<a class="btn" href="#/instructor/grade/${prev}" aria-label="Previous submission">${ic('back', 16)}<span class="kbd">K</span></a><a class="btn" href="#/instructor/grade/${next}" aria-label="Next submission"><span class="kbd">J</span>${ic('chev', 16)}</a>`,
        `<a href="#/instructor/queue">Grading queue</a> / ${esc(s.assignment)}`)}
      ${stateBanner(s) ? `<div style="margin-bottom:16px">${stateBanner(s)}</div>` : ''}
      <div class="gtabs" role="tablist" aria-label="Grading workspace"><button role="tab" aria-selected="${(S.gtab || 'doc') === 'doc'}" data-act="gtab" data-v="doc">Document</button><button role="tab" aria-selected="${S.gtab === 'assess'}" data-act="gtab" data-v="assess">Assessment · ${total}</button></div>
      <div class="split show-${S.gtab || 'doc'}">
        <div class="doc"><div class="mono muted">wireframe-review-${s.initials.toLowerCase()}.pdf · 6 pages</div>
          <h2 style="font-family:var(--font-brand);font-weight:600;letter-spacing:-.02em;margin:12px 0 4px">Enrolment flow: wireframes v2</h2><div class="muted">Submitted ${s.submitted}, 2026 · attempt 1 of 2</div>
          <div class="frame">Page 1 · Sign-up and course choice</div>
          <p>I mapped the flow from the course page to the first lesson. The main change from v1 is a single step for choosing the cohort, so students see dates before they pay.</p>
          <div class="frame">Page 2 · Cohort choice and confirmation</div>
          <button class="btn primary only-small" style="width:100%;margin-top:8px" data-act="gtab" data-v="assess">Continue to assessment</button></div>
        <div class="grid assess" style="gap:12px">${aiCard(s, st)}
          <div class="card rubric"><h2 style="margin-bottom:4px">Rubric</h2>
            ${[['Problem framing', 25], ['Flow and structure', 25], ['States and edge cases', 25], ['Clarity of handoff', 25]].map(([n, max], i) => `<div class="r"><label for="c${i}">${n}<span class="muted"> / ${max}</span></label><input id="c${i}" class="score-input num" inputmode="numeric" data-act="crit" data-id="${s.id}" data-v="${i}" value="${st.crit[i]}"></div>`).join('')}
            <div class="r" style="font-weight:600"><span>Final score</span><span class="num" style="font-family:var(--font-brand);font-weight:600;font-size:24px">${total}<span class="muted" style="font-size:14px"> / 100</span></span></div></div>
          <div class="card"><div class="field"><label for="fb">Feedback to ${esc(s.student.split(' ')[0])}</label><textarea id="fb" placeholder="Write feedback the student can act on" data-act="fbtext" data-id="${s.id}">${esc(fbFor(st))}</textarea><span class="help">Students see feedback only after you release it.</span></div>
            <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn" data-act="returnOne" data-v="${s.id}">Return for revision</button><span class="spacer" style="flex:1"></span><button class="btn primary" data-act="release" data-v="${s.id}" data-next="${next}">Release grade ${total}</button></div></div>
        </div></div>`);
  }

  function iBuilder() {
    const mods = S.order || (S.order = D.course.modules.map(m => ({ ...m, items: [...m.items] })));
    const kindIc = k => k === 'lesson' ? ic('play', 14) : ic('file', 14);
    return guard({ title: 'UX Design Fundamentals', errWhat: 'the course', deniedWhat: 'this course', deniedWho: 'Only the course owner and admins can edit it. The owner is Maria Lopez.',
      empty: head('New course', 'Draft · not visible to students') + emptyState('Start with a module', 'A module groups lessons and assignments. Most courses have 3 to 6.', '<button class="btn primary" data-act="start" data-v="#/instructor/builder">' + ic('plus', 16) + 'Add first module</button>', 'book') }, () => `
      ${head('UX Design Fundamentals', `${tag('Published')} <span class="mono" style="margin-left:6px">v2</span> · 4 modules · 15 items · owner Maria Lopez`, `<button class="btn" data-act="toast" data-v="Preview opened as a student">Preview as student</button><button class="btn primary" data-act="modal" data-v="publish">Send v3 for review</button>`, '<a href="#/instructor/home">Dashboard</a> / Course builder')}
      <div class="banner warn">${ic('alert', 18)}<div class="grow"><b>You're editing a draft of v3.</b>Spring 2026 keeps v2 until an admin pushes the update, so students never see content change mid-lesson.</div></div>
      <div class="grid g-main">
        <div>${mods.map((m, mi) => `<section class="module"><div class="module-head"><span class="handle">${ic('grip', 16)}</span><b>Module ${mi + 1} · ${esc(m.title)}</b><span class="muted" style="font-size:13px">${m.items.length} items</span><span class="spacer" style="flex:1"></span>
            <button class="iconbtn" aria-label="Move module up" data-act="mv" data-v="${mi},-1" ${mi === 0 ? 'disabled' : ''}>${ic('up', 16)}</button><button class="iconbtn" aria-label="Move module down" data-act="mv" data-v="${mi},1" ${mi === mods.length - 1 ? 'disabled' : ''}>${ic('down', 16)}</button></div>
            ${m.items.map(it => `<div class="item"><span class="handle">${ic('grip', 16)}</span><span class="kind">${kindIc(it.kind)}</span><div class="grow"><div style="font-weight:500">${esc(it.title)}</div><div class="muted" style="font-size:12px">${it.kind === 'lesson' ? 'Lesson · ' + it.len : 'Assignment · due ' + it.due}</div></div>
              ${it.kind === 'assignment' ? '<a class="btn sm" href="#/instructor/editor">Edit</a>' : '<button class="btn sm" data-act="toast" data-v="Lesson editor opens here in the full product">Edit</button>'}</div>`).join('')}
            ${m.items.length ? '' : '<div class="item muted" style="font-size:13px">No items yet. Add a lesson or an assignment to start this module.</div>'}
            <div class="add-row"><button class="btn sm add" data-act="addItem" data-v="${mi},lesson">${ic('plus', 14)}Add lesson</button><button class="btn sm add" data-act="addItem" data-v="${mi},assignment">${ic('plus', 14)}Add assignment</button></div></section>`).join('')}
          <button class="btn add add-module" data-act="addModule">${ic('plus', 16)}Add module</button></div>
        <div class="grid" style="align-content:start">
          <div class="card"><h2>Versions</h2><div class="list" style="font-size:13px">
            <div class="row"><span style="flex:1"><b>v3</b> · draft</span>${tag('Draft')}</div>
            <div class="row"><span style="flex:1"><b>v2</b> · Spring 2026</span>${tag('Published')}</div>
            <div class="row"><span style="flex:1"><b>v1</b> · Summer 2026</span>${tag('Archived')}</div></div></div>
          <div class="card"><h2>Who can do what</h2><div class="list" style="font-size:13px">
            <div class="row"><span style="flex:1">Edit draft</span><span>You, admins</span></div>
            <div class="row"><span style="flex:1">Publish</span><span>Admins</span></div>
            <div class="row"><span style="flex:1">Push to running cohorts</span><span>Admins</span></div></div>
            <div style="margin-top:12px">${lockBtn('Publish now', 'Only admins can publish courses. Send this draft for review instead.')}</div></div>
        </div></div>`);
  }

  function iEditor() {
    return guard({ title: 'Wireframe review', errWhat: 'the assignment', deniedWhat: 'this assignment', deniedWho: 'The course is archived, so assignments are read-only for everyone.',
      empty: emptyState('No assignments yet', 'Add an assignment to a module to set a brief, a due date and a rubric.', '<a class="btn" href="#/instructor/builder">Open course builder</a>', 'edit') }, () => `
      ${head('Wireframe review', 'Module 2 · Structure · used in 2 cohorts', '<button class="btn" data-act="toast" data-v="Draft saved">Save draft</button>', '<a href="#/instructor/builder">Course builder</a> / Assignment')}
      <div class="grid g-main">
        <div class="grid" style="align-content:start">
          <div class="card grid" style="gap:14px"><div class="field"><label for="t">Title</label><input id="t" value="Wireframe review"></div>
            <div class="field"><label for="b">Brief</label><textarea id="b">Wireframe the enrolment flow from the course page to the first lesson. Show at least one empty state and one error state. Upload a PDF of 4 to 8 pages.</textarea></div>
            <div class="grid g-2"><div class="field"><label for="d">Due</label><select id="d"><option>4 weeks after cohort start</option><option>5 weeks after cohort start</option></select><span class="help">Spring 2026: Oct 2 · Autumn 2026: Nov 17</span></div>
              <div class="field"><label for="a">Attempts</label><select id="a"><option>2 attempts</option><option>1 attempt</option><option>Unlimited</option></select></div></div></div>
          <div class="card"><h2>Rubric</h2><div class="scrollx"><table><thead><tr><th>Criterion</th><th>What a full score looks like</th><th style="text-align:right">Points</th></tr></thead><tbody>
            ${[['Problem framing', 'States who the flow is for and what they need to finish', 25], ['Flow and structure', 'Every step has one clear next action', 25], ['States and edge cases', 'Empty, error and locked states are designed', 25], ['Clarity of handoff', 'Annotations a developer can build from', 25]]
              .map(([a, b, c]) => `<tr><td style="font-weight:500">${a}</td><td class="muted" style="white-space:normal">${b}</td><td class="num" style="text-align:right">${c}</td></tr>`).join('')}
            <tr><td><b>Total</b></td><td></td><td class="num" style="text-align:right"><b>100</b></td></tr></tbody></table></div></div></div>
        <div class="grid" style="align-content:start">
          <div class="card"><h2>AI drafts</h2><label style="display:flex;gap:10px;align-items:flex-start"><input type="checkbox" checked style="margin-top:3px"><span><b>Prepare an AI draft for each submission</b><br><span class="muted" style="font-size:13px">A suggested score and feedback based on this rubric. Instructors and TAs always confirm before students see anything.</span></span></label></div>
          <div class="card"><h2>Used in</h2><div class="list" style="font-size:13px"><div class="row"><span style="flex:1">Spring 2026</span>${tag('Running')}</div><div class="row"><span style="flex:1">Autumn 2026</span>${tag('Scheduled')}</div></div>
            <p class="muted" style="font-size:12px;margin:10px 0 0">Changes apply to new submissions. Work already graded keeps its rubric.</p></div></div></div>`);
  }

  function iRoster() {
    const rows = D.enrolments.filter(e => e.cohort.startsWith('UX')).map((e, i) => ({ ...e, done: Math.min(4, Math.round(e.progress / 25)), risk: ['Paused', 'Dropped'].includes(e.state) || e.progress < 30 }));
    return guard({ title: 'Cohort roster', errWhat: 'the roster', deniedWhat: 'this roster', deniedWho: 'You are not an instructor or TA of Autumn 2026 yet. Access starts when the cohort is scheduled for you.',
      empty: emptyState('No students yet', 'Students appear here when an admin enrols them in Autumn 2026. The cohort starts Oct 20.', '', 'users') }, () => `
      ${head('Cohort roster', 'UX Design Fundamentals · Spring 2026 · 48 students, showing 16', '<button class="btn" data-act="toast" data-v="Message drafted to 5 students at risk">Message students at risk</button>')}
      <div class="grid g-4" style="margin-bottom:16px"><div class="card stat"><div class="label">Average progress</div><div class="val num">64%</div></div><div class="card stat"><div class="label">On track</div><div class="val num">36</div></div>
        <div class="card stat alert"><div class="label">Behind</div><div class="val num">12</div></div><div class="card stat"><div class="label">Completed</div><div class="val num">0</div><div class="hint">Course ends Nov 28</div></div></div>
      <div class="tablebox"><table><thead><tr><th>Student</th><th>Group</th><th>Progress</th><th>Assignments</th><th>Last active</th><th>Status</th></tr></thead><tbody>
        ${rows.map((r, i) => `<tr><td><div class="who">${av(r.initials)}<b style="font-weight:600">${esc(r.student)}</b></div></td><td class="muted">${i % 2 ? 'Group B' : 'Group A'}</td>
          <td><div style="display:flex;align-items:center;gap:10px">${bar(r.progress)}<span class="num muted" style="width:36px">${r.progress}%</span></div></td><td class="num">${r.done} / 4</td><td class="num">${r.last}</td>
          <td>${r.risk ? tag(r.state === 'Active' ? 'Late' : r.state) : tag(r.state)}</td></tr>`).join('')}</tbody></table></div>`);
  }

  /* ================= ADMIN ================= */
  function aHome() {
    return guard({ title: 'Overview', errWhat: 'the overview', deniedWhat: 'the school overview', deniedWho: 'Only admins see school-wide numbers. Ask Alex Morgan if you need a report.',
      empty: head('Welcome to Cohorta', 'Set up your school in three steps') + `<div class="grid g-3">${[['1', 'Invite your staff', 'Add instructors and TAs, then set what each can reach.'], ['2', 'Publish a course', 'Approve a course draft so it can run.'], ['3', 'Schedule a cohort', 'Pick dates, staff and capacity, then enrol students.']].map(([n, t, d]) => `<div class="card" style="display:flex;flex-direction:column"><div class="mono muted">Step ${n}</div><h2 style="margin-top:6px">${t}</h2><p class="muted" style="margin:0 0 16px">${d}</p><button class="btn sm" style="margin-top:auto;align-self:flex-start" data-act="start" data-v="${n === '1' ? '#/admin/users' : n === '2' ? '#/admin/catalogue' : '#/admin/enrolments'}">Start</button></div>`).join('')}</div>` }, () => `
      ${head('Overview', 'Cohorta School · 6 cohorts this term')}
      ${inReview().length ? `<div class="card cta-card" style="margin-bottom:16px"><div style="flex:1"><div class="big">${inReview().length} course${inReview().length > 1 ? 's' : ''} waiting for review</div><div class="muted">${inReview().map(c => esc(c.title)).join(' · ')}</div></div><a class="btn primary" href="#/admin/catalogue">Review ${inReview().length} course${inReview().length > 1 ? 's' : ''}</a></div>`
        : `<div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:12px">${ic('check', 20)}<div style="flex:1"><b>No courses waiting for review.</b> <span class="muted">New drafts from instructors will appear here.</span></div></div>`}
      <div class="grid g-4" style="margin-bottom:16px">
        <div class="card stat"><div class="label">Active cohorts</div><div class="val num">4</div><div class="hint">1 scheduled, 1 completed</div></div>
        <div class="card stat"><div class="label">Total students</div><div class="val num">257</div><div class="hint">+48 in Autumn 2026</div></div>
        <div class="card stat"><div class="label">Submissions pending</div><div class="val num">41</div><div class="hint">Across 4 cohorts</div></div>
        <div class="card stat alert"><div class="label">At-risk cohorts</div><div class="val num">2</div><div class="hint">More than 25% behind</div></div></div>
      <div class="grid g-main">
        <div class="card"><h2>Cohorts</h2><div class="scrollx"><table><thead><tr><th>Cohort</th><th>Status</th><th>Progress</th><th>Behind</th><th>Ends</th></tr></thead><tbody>
          ${D.cohorts.map(c => `<tr><td><b style="font-weight:600">${esc(c.course)}</b><div class="muted" style="font-size:12px">${c.name} · ${c.students} students</div></td><td>${tag(c.state)}</td>
            <td><div style="display:flex;align-items:center;gap:10px">${bar(c.progress)}<span class="num muted">${c.progress}%</span></div></td><td class="num" ${c.behind / c.students > .25 ? 'style="color:var(--s-error);font-weight:600"' : ''}>${c.behind}</td><td class="num">${c.end}</td></tr>`).join('')}</tbody></table></div></div>
        <div class="grid" style="align-content:start">
          <div class="card"><h2>System alerts</h2>
            <div class="banner error" style="margin-bottom:10px">${ic('alert', 18)}<div class="grow"><b>18 students not imported</b><span style="font-size:13px">Autumn 2026 import, rows need a valid email.</span></div><a class="btn sm" href="#/admin/enrolments">Fix</a></div>
            <div class="banner warn" style="margin:0">${ic('users', 18)}<div class="grow"><b>Autumn 2026 has no TA</b><span style="font-size:13px">Starts Oct 20 with 48 students.</span></div><a class="btn sm" href="#/admin/users">Assign</a></div></div>
          <div class="card"><h2>Recent activity</h2><div class="list" style="font-size:13px">${D.audit.slice(0, 4).map(a => `<div class="row" style="align-items:flex-start"><span style="flex:1">${esc(a.what)}</span><span class="muted" style="white-space:nowrap">${a.when.split(' · ')[0].replace(', 2026', '')}</span></div>`).join('')}</div>
            <a href="#/admin/users" style="display:inline-block;margin-top:8px;font-weight:600">Open audit log</a></div></div></div>`);
  }

  function aCatalogue() {
    const list = D.catalogue.filter(c => S.cFilter === 'all' || c.state === S.cFilter);
    const chips = ['all', 'In review', 'Published', 'Draft', 'Archived'].map(v => `<button class="chip" data-act="cFilter" data-v="${v}" aria-pressed="${S.cFilter === v}">${v === 'all' ? 'All 8' : v + ' ' + D.catalogue.filter(c => c.state === v).length}</button>`).join('');
    const act = c => c.state === 'In review' ? `<button class="btn sm primary" data-act="panel" data-v="review:${c.id}">Review</button>`
      : c.state === 'Published' ? `<button class="btn sm" data-act="panel" data-v="cohort:${c.id}">Schedule cohort</button>${c.id === 'uxf' ? ' <button class="btn sm" data-act="modal" data-v="push">Push v2</button>' : ''}`
      : c.state === 'Archived' ? lockBtn('Edit', 'Archived courses are read-only for everyone.', 'btn sm') : `<span class="muted" style="font-size:13px">Owner is editing</span>`;
    return guard({ title: 'Courses', errWhat: 'courses', deniedWhat: 'the course catalogue', deniedWho: 'Instructors see only the courses they own. Your courses are in the course builder.', deniedAlt: '<a class="btn" href="#/instructor/builder" data-act="role" data-v="instructor">Open course builder</a>',
      empty: emptyState('No courses yet', 'Instructors create drafts, you review and publish them. Invite an instructor to start.', '<a class="btn primary" href="#/admin/users">Invite an instructor</a>', 'grid') }, () => `
      ${head('Courses', 'A course is the template; a cohort is one dated run of it', '<button class="btn primary" data-act="newCourse">' + ic('plus', 16) + 'New course</button>')}
      <div class="toolbar">${chips}</div>
      <div class="tablebox"><table><thead><tr><th>Course</th><th>Status</th><th>Version</th><th>Owner</th><th>Cohorts</th><th>Students</th><th>Updated</th><th></th></tr></thead><tbody>
        ${list.map(c => `<tr><td><b style="font-weight:600">${esc(c.title)}</b></td><td>${tag(c.state)}</td><td class="mono">${c.version}</td><td>${esc(c.owner)}</td><td class="num">${c.cohorts}</td><td class="num">${c.students}</td><td class="num muted">${c.updated}</td><td style="text-align:right">${act(c)}</td></tr>`).join('')}</tbody></table></div>`);
  }

  function aEnrol() {
    const rows = D.enrolments.filter(e => S.eFilter === 'all' || e.state === S.eFilter);
    const chips = ['all', 'Active', 'Invited', 'Paused', 'Dropped', 'Completed'].map(v => `<button class="chip" data-act="eFilter" data-v="${v}" aria-pressed="${S.eFilter === v}">${v === 'all' ? 'All ' + D.enrolments.length : v + ' ' + D.enrolments.filter(e => e.state === v).length}</button>`).join('');
    const allSel = rows.length && rows.every(r => S.eSel.has(r.id));
    const bulk = S.eSel.size ? `<div class="bulkbar"><b>${S.eSel.size} selected</b><span style="flex:1"></span><button class="btn sm" data-act="ebulk" data-v="Paused">Pause</button><button class="btn sm" data-act="ebulk" data-v="move">Move to cohort</button><button class="btn sm" data-act="ebulk" data-v="Dropped">Drop</button><button class="iconbtn" style="color:#C9CBD6" aria-label="Clear selection" data-act="eClear">${ic('x')}</button></div>` : '';
    return guard({ title: 'Enrolments', errWhat: 'enrolments', deniedWhat: 'Enrolments', deniedWho: 'Only admins can enrol, pause or drop students. Instructors see their own cohorts read-only in the roster.', deniedAlt: '<a class="btn" href="#/instructor/roster" data-act="role" data-v="instructor">Open my roster</a>',
      empty: emptyState('No students enrolled', 'Import a CSV or invite students by email. Autumn 2026 starts Oct 20.', '<button class="btn primary" data-act="modal" data-v="import">Import CSV</button>', 'users') }, () => `
      ${head('Enrolments', `${233 + D.enrolments.length} students in ${D.cohorts.length} cohorts`, '<button class="btn" data-act="modal" data-v="import">' + ic('upload', 16) + 'Import CSV</button><button class="btn primary" data-act="modal" data-v="enrol">' + ic('plus', 16) + 'Enrol students</button>')}
      <div class="toolbar"><label class="search">${ic('search', 16)}<span class="sr">Search</span><input placeholder="Search name or email"></label><select class="select" aria-label="Cohort"><option>All cohorts</option><option>UXF · Spring 2026</option><option>Service Design · Spring 2026</option></select></div>
      <div class="toolbar">${chips}</div>
      <div class="tablebox"><table class="rtable"><thead><tr><th class="check"><label class="hit"><input type="checkbox" aria-label="Select all" data-act="eSelAll" ${allSel ? 'checked' : ''}></label></th><th>Student</th><th class="c-2nd">Email</th><th class="c-2nd">Cohort</th><th>Status</th><th>Progress</th><th>Last active</th></tr></thead><tbody>
        ${rows.map(r => `<tr class="${S.eSel.has(r.id) ? 'sel' : ''}"><td class="check c-check"><label class="hit"><input type="checkbox" aria-label="Select ${esc(r.student)}" data-act="eSel" data-v="${r.id}" ${S.eSel.has(r.id) ? 'checked' : ''}></label></td><td class="c-student"><div class="who">${av(r.initials)}<div style="min-width:0"><b style="font-weight:600">${esc(r.student)}</b><div class="meta-2nd">${esc(r.email)} · ${esc(r.cohort)}</div></div></div></td>
          <td class="muted c-2nd">${esc(r.email)}</td><td class="c-2nd">${esc(r.cohort)}</td><td class="c-status">${tag(r.state)}</td><td class="c-ai" data-label="Progress"><div style="display:flex;align-items:center;gap:10px">${bar(r.progress)}<span class="num muted" style="width:36px">${r.progress}%</span></div></td><td class="num c-final" data-label="Last active">${r.last}</td></tr>`).join('')}</tbody></table></div>${bulk}`);
  }

  function aUsers() {
    return guard({ title: 'Users and roles', errWhat: 'users', deniedWhat: 'Users and roles', deniedWho: 'Only admins can change roles. Every change is recorded in the audit log.',
      empty: emptyState('Only you so far', 'Invite instructors and teaching assistants, then choose what each can reach.', '<button class="btn primary" data-act="start" data-v="#/admin/users">Invite people</button>', 'shield') }, () => `
      ${head('Users and roles', 'Role sets the action · scope sets the reach · state can lock it', '<button class="btn primary" data-act="modal" data-v="invite">' + ic('plus', 16) + 'Invite people</button>')}
      <div class="grid g-main">
        <div class="tablebox"><table><thead><tr><th>Person</th><th>Role</th><th>Scope</th><th>Last active</th><th></th></tr></thead><tbody>
          ${D.staff.map((u, i) => `<tr><td><div class="who">${av(u.initials)}<div><b style="font-weight:600">${esc(u.name)}</b><div class="muted" style="font-size:12px">${esc(u.email)}</div></div></div></td><td>${esc(u.role)}</td><td class="muted" style="white-space:normal;max-width:220px">${esc(u.scope)}</td><td class="num">${u.last}</td>
            <td style="text-align:right"><button class="btn sm" data-act="panel" data-v="user:${i}">Open</button></td></tr>`).join('')}</tbody></table></div>
        <div class="card" style="align-self:start"><h2>Audit log</h2><div class="list" style="font-size:13px">${D.audit.map(a => `<div class="row" style="align-items:flex-start;flex-direction:column;gap:2px"><span>${esc(a.what)}</span><span class="muted">${esc(a.who)} · ${a.when}</span></div>`).join('')}</div></div></div>`);
  }

  /* ================= STUDENT ================= */
  const allItems = () => D.course.modules.flatMap((m, mi) => m.items.map((it, ii) => ({ ...it, module: m.title, mi })));
  function steps(current) {
    const items = allItems(); const cur = items.findIndex(i => i.title === current);
    return `<div class="steps">${items.map((it, i) => `<div class="step ${i < cur ? 'done' : i === cur ? 'now' : i > cur + 1 ? 'lock' : ''}"><span class="dot">${i < cur ? `<span style="color:#fff">${ic('check', 12, 3)}</span>` : i > cur + 1 ? ic('lock', 11, 2) : ''}</span><span style="font-size:13px">${esc(it.title)}</span></div>`).join('')}</div>`;
  }
  function sHome() {
    return guard({ title: 'Hi, Lucía', errWhat: 'your courses', deniedWhat: 'this course', deniedWho: 'Your enrolment in Spring 2026 is paused. Contact your school to continue.',
      empty: head('Hi, Lucía', 'You are not enrolled in a course yet') + emptyState('No courses yet', 'When your school enrols you in a cohort, it will appear here with its start date.', '', 'book') }, () => `
      ${head('Hi, Lucía', "You're 2 lessons from finishing Module 3.")}
      <div class="card cta-card" style="margin-bottom:16px"><div style="flex:1"><div class="muted" style="font-size:13px">Continue · Module 3 · Interface</div><div class="big">Working with components</div><div class="muted">17 min · lesson 2 of 3</div></div><a class="btn primary" href="#/student/lesson">${ic('play', 16)}Continue</a></div>
      <div class="grid g-main">
        <div class="card"><h2>UX Design Fundamentals</h2><div class="muted" style="margin:-6px 0 12px">Spring 2026 · ends Nov 28</div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">${bar(58, 'cobalt')}<span class="num" style="font-weight:600">58%</span></div>
          ${D.course.modules.map((m, i) => `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--line)"><span class="mono muted">0${i + 1}</span><span style="flex:1;font-weight:500">${m.title}</span>${[tag('Completed'), tag('Completed'), '<span class="tag t-submitted">In progress</span>', tag('Locked')][i]}</div>`).join('')}</div>
        <div class="grid" style="align-content:start">
          <div class="card"><h2>Due next</h2><div class="list"><div class="row"><div style="flex:1"><b>Usability test report</b><div class="muted" style="font-size:13px">Module 3</div></div><span class="num">Oct 14</span></div>
            <div class="row"><div style="flex:1"><b>Final case study</b><div class="muted" style="font-size:13px">Opens after Module 3</div></div><span class="num">Nov 4</span></div></div></div>
          <div class="card"><h2>Latest feedback</h2><div class="feedback">Clear goals and a good mix of open questions. Next time, add how you will recruit participants.</div><div class="muted" style="font-size:12px;margin-top:8px">User interview plan · 88 / 100 · Maria Lopez</div></div></div></div>`);
  }
  function sLesson() {
    const locked = S.param === 'locked';
    return guard({ title: 'Working with components', errWhat: 'this lesson', deniedWhat: 'this lesson', deniedWho: 'Your enrolment is paused, so lessons are read-only. Contact your school to continue.',
      empty: emptyState('This lesson has no content yet', 'Your instructor is still preparing it. Try another lesson in this module.', '<a class="btn" href="#/student/home">Back to course</a>', 'play') }, () => locked ? `
      ${head('Final case study', 'Module 4 · Delivery', '', '<a href="#/student/home">UX Design Fundamentals</a> / Module 4')}
      <div class="grid g-main" style="align-items:start"><div class="locked-card"><div class="denied" style="margin:0;max-width:none;text-align:left"><div class="lock" style="margin:0;color:#fff">${ic('lock', 24)}</div></div>
        <div><h2 style="font-family:var(--font-brand);font-weight:600;letter-spacing:-.02em;margin:0 0 6px">Opens on Oct 14, or after you finish Lesson 4.</h2><p class="muted" style="margin:0 0 14px">You have 2 lessons and 1 assignment left in Module 3.</p><a class="btn primary" href="#/student/lesson">Go to your current lesson</a></div></div>
        <div class="card">${steps('Working with components')}</div></div>` : `
      ${head('Working with components', 'Module 3 · Interface · lesson 2 of 3 · 17 min', '<a class="btn" href="#/student/lesson/locked">Next: locked lesson</a>', '<a href="#/student/home">UX Design Fundamentals</a> / Module 3')}
      <div class="grid g-main"><div class="lesson"><div class="video">${ic('play', 40)}</div>
        <p>Components let a team build many screens from a few reliable parts. In this lesson you'll take one card from the course page and turn it into a component with three states: default, loading and locked.</p>
        <p>Watch the walkthrough, then try it in your own file. The usability test in Module 3 will use these components.</p>
        <div style="display:flex;gap:8px;margin-top:20px"><button class="btn primary" data-act="toast" data-v="Lesson marked as done">${ic('check', 16)}Mark as done</button><a class="btn" href="#/student/assignment">Go to assignment</a></div></div>
        <div class="card" style="align-self:start"><h3>Your progress</h3>${steps('Working with components')}</div></div>`);
  }
  function sAssignment() {
    const sub = S.studentSubmitted;
    return guard({ title: 'Usability test report', errWhat: 'the assignment', deniedWhat: 'this assignment', deniedWho: 'Submissions closed when the cohort ended. Ask your instructor if you need an extension.',
      empty: emptyState('No assignment here yet', 'Your instructor has not published this assignment. You will get an email when it opens.', '', 'file') }, () => `
      ${head('Usability test report', `Module 3 · due Oct 14 · ${sub ? tag('Submitted') : tag('Not started')}`, '', '<a href="#/student/home">UX Design Fundamentals</a> / Assignment')}
      <div class="grid g-main"><div class="grid" style="align-content:start">
        <div class="card"><h2>Brief</h2><p style="margin:0">Run a short usability test with 3 people on your wireframes. Report what you saw, what you changed and why. PDF, up to 8 pages.</p></div>
        ${sub ? `<div class="card"><div class="banner info" style="margin:0 0 12px">${ic('check', 18)}<div class="grow"><b>Submitted on Oct 6.</b>Your instructor will review it after Oct 14. You can replace the file until then.</div></div>
            <div style="display:flex;align-items:center;gap:12px"><span class="kind" style="width:40px;height:40px;border-radius:10px;background:var(--subtle);display:grid;place-items:center">${ic('file')}</span><div style="flex:1"><b>usability-report-lucia.pdf</b><div class="muted" style="font-size:12px">2.4 MB · attempt 1 of 2</div></div><button class="btn sm" data-act="unsubmit">Replace file</button></div></div>`
          : `<div class="drop">${ic('upload', 28)}<h3 style="margin:10px 0 4px">Drop your PDF here</h3><p class="muted" style="margin:0 0 14px">Up to 8 pages, 20 MB</p><button class="btn primary" data-act="submit">Choose file</button></div>`}</div>
        <div class="card" style="align-self:start"><h2>How it's graded</h2><div class="list" style="font-size:13px">${['Test plan and tasks', 'What you observed', 'Changes you made', 'Clarity of the report'].map(c => `<div class="row"><span style="flex:1">${c}</span><span class="num muted">25</span></div>`).join('')}</div>
          <p class="muted" style="font-size:12px;margin:12px 0 0">Feedback comes from your instructor. AI may help draft it, but a person always reviews your grade.</p></div></div>`);
  }
  function sGrades() {
    return guard({ title: 'Grades', errWhat: 'your grades', deniedWhat: 'grades', deniedWho: 'Grades are hidden while your enrolment is paused.',
      empty: emptyState('No grades yet', 'Your grades appear here after your instructor releases them. Your first assignment is due Sep 15.', '', 'chart') }, () => `
      ${head('Grades', 'UX Design Fundamentals · Spring 2026')}
      <div class="grid" style="max-width:860px">${D.studentGrades.map(g => `<div class="card"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><div style="flex:1;min-width:200px"><b style="font-size:15px">${g.title}</b><div class="muted" style="font-size:13px">${g.module} · ${g.date}</div></div>
        ${g.status === 'Submitted' && S.studentSubmitted === false ? tag('Submitted') : tag(g.status)}${g.score != null ? `<span class="num" style="font-family:var(--font-brand);font-weight:600;font-size:24px">${g.score}<span class="muted" style="font-size:13px"> / 100</span></span>` : ''}</div>
        ${g.feedback ? `<div class="feedback" style="margin-top:12px">${g.feedback}</div>` : g.status === 'Submitted' ? '<p class="muted" style="margin:10px 0 0;font-size:13px">Waiting for review. Grades are released after the deadline.</p>' : ''}</div>`).join('')}</div>`);
  }

  /* ---------- overlays ---------- */
  function overlays() {
    let out = '';
    if (S.panel) {
      const [k, v] = S.panel.split(':');
      let body = '';
      if (k === 'review') { const c = D.catalogue.find(x => x.id === v); body = `<div class="crumbs">Review course</div><h2 style="font-family:var(--font-brand);font-weight:600;letter-spacing:-.02em;margin:0">${esc(c.title)}</h2><div>${tag(c.state)} <span class="mono">${c.version}</span> · owner ${esc(c.owner)}</div>
          <div class="card" style="padding:14px"><h3>What changed</h3><ul style="margin:0;padding-left:18px;color:var(--text-2)"><li>New module: Accessibility checks</li><li>Rubric updated for 2 assignments</li><li>3 lessons rewritten</li></ul></div>
          <div class="field"><label for="note">Note to ${esc(c.owner.split(' ')[0])}</label><textarea id="note" placeholder="Optional. Required if you request changes."></textarea></div>
          <div style="display:flex;gap:8px"><button class="btn" data-act="review" data-v="changes:${c.id}">Request changes</button><button class="btn primary" data-act="review" data-v="approve:${c.id}">Approve and publish</button></div>`; }
      if (k === 'cohort') { const c = D.catalogue.find(x => x.id === v); body = `<div class="crumbs">Schedule cohort</div><h2 style="font-family:var(--font-brand);font-weight:600;letter-spacing:-.02em;margin:0">${esc(c.title)} · ${c.version}</h2><p class="muted" style="margin:0">The cohort runs this version. Content edits on the course won't reach it until you push an update.</p>
          <div class="field"><label for="cn">Cohort name</label><input id="cn" value="Winter 2027"></div><div class="grid g-2"><div class="field"><label for="cs">Starts</label><input id="cs" value="Jan 12, 2027"></div><div class="field"><label for="ce">Ends</label><input id="ce" value="Apr 9, 2027"></div></div>
          <div class="field"><label for="ci">Instructors</label><select id="ci"><option>${esc(c.owner)}</option></select></div><div class="field"><label for="ct">Teaching assistants</label><select id="ct"><option>Nadia Kowalski · Group A</option><option>Ben Okafor · Group B</option></select></div>
          <div class="grid g-2"><div class="field"><label for="cg">Groups</label><input id="cg" value="2" inputmode="numeric"></div><div class="field"><label for="cc">Capacity</label><input id="cc" value="48" inputmode="numeric"><span class="help">Max 24 per group</span></div></div>
          <button class="btn primary" data-act="schedule" data-v="${c.id}">Schedule cohort</button>`; }
      if (k === 'user') { const u = D.staff[+v]; const log = D.audit.filter(a => a.what.includes(u.name.split(' ')[0]) || a.who === u.name); body = `<div class="crumbs">User</div><div class="who" style="gap:12px">${av(u.initials)}<div><h2 style="font-family:var(--font-brand);font-weight:600;letter-spacing:-.02em;margin:0">${esc(u.name)}</h2><div class="muted">${esc(u.email)}</div></div></div>
          <div class="field"><label for="ur">Role</label><select id="ur">${['Admin', 'Instructor', 'Admin + Instructor', 'Teaching assistant'].map(r => `<option ${r === u.role ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
          <div class="field"><label for="us">Scope</label><input id="us" value="${esc(u.scope)}"><span class="help">Where the role applies: whole school, a course, a cohort or a group.</span></div>
          <button class="btn primary" data-act="saveRole" data-v="${v}">Save changes</button>
          <div><h3 style="margin:8px 0">Activity</h3><div class="list" style="font-size:13px">${(log.length ? log : [{ what: 'Signed in', who: u.name, when: u.last }]).map(a => `<div class="row" style="flex-direction:column;align-items:flex-start;gap:2px"><span>${esc(a.what)}</span><span class="muted">${esc(a.who)} · ${esc(a.when)}</span></div>`).join('')}</div></div>`; }
      if (k === 'grade') { const s = D.subs.find(x => x.id === v); const st = aiState(s); const i = D.subs.indexOf(s); const p2 = D.subs[(i - 1 + D.subs.length) % D.subs.length].id, n2 = D.subs[(i + 1) % D.subs.length].id; const done = stOf(s) === 'graded';
        body = `<div class="crumbs">Quick review · ${i + 1} of ${D.subs.length}</div><div class="who" style="gap:12px">${av(s.initials)}<div style="flex:1;min-width:0"><h2 style="font-family:var(--font-brand);font-weight:600;letter-spacing:-.02em;margin:0">${esc(s.student)}</h2><div class="muted">${esc(s.assignment)} · ${s.group} · ${s.submitted}</div></div>${tag(subLabel(stOf(s)))}</div>
          ${stateBanner(s)}${done ? '' : aiCard(s, st)}
          <div class="field"><label for="qs">Final score</label><div style="display:flex;align-items:center;gap:8px"><input id="qs" class="score-input num" style="width:88px" inputmode="numeric" data-act="qscore" data-id="${s.id}" value="${scoreOf(s)}" ${done ? 'disabled' : ''}><span class="muted">/ 100</span></div></div>
          <div class="field"><label for="fb">Feedback to ${esc(s.student.split(' ')[0])}</label><textarea id="fb" data-act="fbtext" data-id="${s.id}" placeholder="Write feedback the student can act on" ${done ? 'disabled' : ''}>${esc(fbFor(st))}</textarea><span class="help">Students see feedback only after you release it.</span></div>
          ${done ? '' : `<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="returnOne" data-v="${s.id}">Return for revision</button><span style="flex:1"></span><button class="btn primary" data-act="releaseQ" data-v="${s.id}">Release grade ${scoreOf(s)}</button></div>`}
          <div style="display:flex;align-items:center;gap:8px;border-top:1px solid var(--line);padding-top:14px;margin-top:auto"><button class="btn sm" data-act="panel" data-v="grade:${p2}" aria-label="Previous submission">${ic('back', 14)}</button><button class="btn sm" data-act="panel" data-v="grade:${n2}" aria-label="Next submission">${ic('chev', 14)}</button><span style="flex:1"></span><a class="btn sm" href="#/instructor/grade/${s.id}">Open full view</a></div>`; }
      out += `<div class="scrim" style="background:rgba(11,13,23,.2);place-items:stretch" data-act="closeAll"></div><aside class="panel${S.anim ? ' enter' : ''}" role="dialog" aria-modal="true" aria-label="Details"><button class="iconbtn" style="align-self:flex-end" aria-label="Close" data-act="closeAll">${ic('x')}</button>${body}</aside>`;
    }
    if (S.modal) {
      const M = {
        publish: `<h2>Send v3 for review?</h2><p class="muted" style="margin:0">Alex Morgan will review it. Spring 2026 keeps v2 until the update is pushed.</p><div class="field"><label for="m1">What changed</label><textarea id="m1">New lesson on component states. Rubric for Wireframe review now asks for an error state.</textarea></div><div class="foot"><button class="btn" data-act="closeAll">Cancel</button><button class="btn primary" data-act="closeAll" data-toast="Sent to Alex Morgan for review">Send for review</button></div>`,
        push: `<h2>Push v2 to running cohorts?</h2><p class="muted" style="margin:0">Spring 2026 (48 students) will switch to v2 tonight. Progress and grades are kept. Students see a note about what changed.</p><label style="display:flex;gap:8px"><input type="checkbox" checked>Notify students and staff</label><div class="foot"><button class="btn" data-act="closeAll">Cancel</button><button class="btn primary" data-act="push">Push update</button></div>`,
        import: `<h2>182 of 200 students imported</h2><div class="banner error" style="margin:0">${ic('alert', 18)}<div class="grow"><b>We couldn't import 18 students.</b>Review the rows below and try again.</div></div>
          <div class="tablebox" style="max-height:200px"><table><thead><tr><th>Row</th><th>Value</th><th>Problem</th></tr></thead><tbody>${[[14, 'jonas.weber@', 'Email is incomplete'], [27, 'priya nair@mail.com', 'Email has a space'], [41, '', 'Email is missing'], [58, 'leo.rossi@mail', 'Domain is incomplete'], [77, 'sara@mail.com', 'Already enrolled in this cohort']].map(r => `<tr><td class="num">${r[0]}</td><td class="mono">${esc(r[1] || '—')}</td><td>${r[2]}</td></tr>`).join('')}<tr><td colspan="3" class="muted">and 13 more</td></tr></tbody></table></div>
          <div class="foot"><button class="btn" data-act="closeAll" data-toast="18 rows downloaded as CSV">Download 18 rows</button><button class="btn primary" data-act="closeAll">Done</button></div>`,
        enrol: `<h2>Enrol students</h2><div class="field"><label for="ec">Cohort</label><select id="ec"><option>UX Design Fundamentals · Autumn</option><option>Service Design 101 · Winter</option></select><span class="help">Autumn 2026 starts Oct 20 · 48 seats</span></div>
          <div class="field"><label for="ee">Emails, one per line</label><textarea id="ee">rosa.marin@mail.com
theo.laurent@mail.com
nina.berg@mail.com</textarea><span class="help">Each person gets an invite and counts as enrolled once they accept.</span></div><div class="foot"><button class="btn" data-act="closeAll">Cancel</button><button class="btn primary" data-act="doEnrol">Send invites</button></div>`,
        invite: `<h2>Invite people</h2><div class="field"><label for="in">Name</label><input id="in" value="Irene Duarte"></div><div class="field"><label for="ie">Email</label><input id="ie" value="irene.duarte@cohorta.school"></div>
          <div class="grid g-2"><div class="field"><label for="ir">Role</label><select id="ir"><option>Teaching assistant</option><option>Instructor</option><option>Admin</option></select></div><div class="field"><label for="is">Scope</label><select id="is"><option>UXF Autumn 2026 · Group A</option><option>UX Design Fundamentals</option><option>Whole school</option></select></div></div>
          <p class="muted" style="margin:0;font-size:13px">Role sets what they can do, scope sets where. You can change both later; every change is logged.</p><div class="foot"><button class="btn" data-act="closeAll">Cancel</button><button class="btn primary" data-act="doInvite">Send invite</button></div>`,
        move: `<h2>Move ${pl(S.eSel.size, 'student', 'students')}</h2><div class="field"><label for="mv">To cohort</label><select id="mv"><option>UX Design Fundamentals · Autumn 2026</option><option>Service Design 101 · Winter 2026</option></select><span class="help">Progress moves with them. Grades stay in the old cohort's record.</span></div><div class="foot"><button class="btn" data-act="closeAll">Cancel</button><button class="btn primary" data-act="doMove">Move students</button></div>`
      };
      out += `<div class="scrim" data-act="scrim"><div class="modal" role="dialog" aria-modal="true">${M[S.modal]}</div></div>`;
    }
    if (S.toast) out += `<div class="toast" role="status">${esc(S.toast.text)}${S.toast.undo ? '<button data-act="undo">Undo</button>' : ''}</div>`;
    return out;
  }

  /* ---------- render ---------- */
  const VIEWS = {
    instructor: { home: iHome, queue: iQueue, grade: () => iGrade(S.param), builder: iBuilder, editor: iEditor, roster: iRoster },
    admin: { home: aHome, catalogue: aCatalogue, enrolments: aEnrol, users: aUsers },
    student: { home: sHome, lesson: sLesson, assignment: sAssignment, grades: sGrades }
  };
  function render() {
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
    S.anim = false;
    if (S.focus) { const f = document.querySelector(S.focus); if (f) { f.focus(); if (f.setSelectionRange) f.setSelectionRange(f.value.length, f.value.length); } S.focus = null; }
  }
  let current = '#/instructor/home';
  function route(h) {
    if (h) current = h;
    const parts = current.replace(/^#\/?/, '').split('/');
    if (VIEWS[parts[0]]) { if (S.role !== parts[0]) { S.sel.clear(); S.eSel.clear(); } S.role = parts[0]; }
    S.page = parts[1] && VIEWS[S.role][parts[1]] ? parts[1] : 'home'; S.param = parts[2] || null; S.gtab = 'doc';
    S.panel = null; S.modal = null; render(); window.scrollTo(0, 0);
    try { if (location.protocol !== 'about:' && history.replaceState) history.replaceState(null, '', current); } catch (e) {}
  }
  let toastTimer;
  function toast(text, undo) { S.toast = { text, undo }; clearTimeout(toastTimer); toastTimer = setTimeout(() => { S.toast = null; render(); }, undo ? 6000 : 3000); }
  const go = h => route(h);

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#/"]');
    if (link) {
      e.preventDefault();
      const ta = link.dataset.act; if (ta === 'demo') S.demo = link.dataset.v; if (ta === 'role') S.role = link.dataset.v;
      route(link.getAttribute('href')); return;
    }
    const t = e.target.closest('[data-act]'); if (!t) return;
    const a = t.dataset.act, v = t.dataset.v;
    if (t.tagName === 'INPUT' && t.type === 'checkbox') return; // handled on change
    if (a === 'scrim' && e.target !== t) return;
    switch (a) {
      case 'role': S.sel.clear(); S.eSel.clear(); go(`#/${v}/home`); return;
      case 'demo': S.demo = v; break;
      case 'qStatus': S.qStatus = v; S.sel.clear(); break;
      case 'cFilter': S.cFilter = v; break;
      case 'eFilter': S.eFilter = v; S.eSel.clear(); break;
      case 'sort': S.sortDir = S.sortDir === 'desc' ? 'asc' : 'desc'; break;
      case 'dense': S.dense = !S.dense; break;
      case 'clearSel': S.sel.clear(); break;
      case 'eClear': S.eSel.clear(); break;
      case 'start': S.demo = 'normal'; go(v); return;
      case 'review': { const [kind, id] = v.split(':'); const c = D.catalogue.find(x => x.id === id);
        if (kind === 'approve') { c.state = 'Published'; c.updated = 'Oct 6'; audit(`Published ${c.title} ${c.version}`); toast(`${c.title} published. Instructors can schedule cohorts.`); }
        else { c.state = 'Draft'; c.updated = 'Oct 6'; audit(`Requested changes to ${c.title} ${c.version}`); toast(`Changes requested from ${c.owner}. The course is back in draft.`); }
        S.panel = null; break; }
      case 'schedule': { const c = D.catalogue.find(x => x.id === v); c.cohorts++; D.cohorts.push({ id: 'c' + (D.cohorts.length + 1), course: c.title, name: 'Winter 2027', state: 'Scheduled', students: 0, progress: 0, behind: 0, start: 'Jan 12', end: 'Apr 9' }); audit(`Scheduled cohort Winter 2027 for ${c.title}`); toast('Winter 2027 scheduled. Enrolment is open.'); S.panel = null; break; }
      case 'push': audit('Pushed UX Design Fundamentals v2 to cohort Spring 2026'); S.modal = null; toast('v2 scheduled for Spring 2026 tonight · logged'); break;
      case 'saveRole': { const u = D.staff[+v]; const r = document.getElementById('ur').value, sc = document.getElementById('us').value; if (r !== u.role) audit(`Changed role of ${u.name}: ${u.role} → ${r}`); u.role = r; u.scope = sc; S.panel = null; toast('Role saved and logged'); break; }
      case 'newCourse': D.catalogue.unshift({ id: 'n' + D.catalogue.length, title: 'Untitled course', state: 'Draft', version: 'v1', owner: 'Alex Morgan', cohorts: 0, students: 0, updated: 'Oct 6' }); S.cFilter = 'all'; toast('Draft created. Assign an owner to start writing.'); break;
      case 'doEnrol': { const list = document.getElementById('ee').value.split(/\s+/).filter(x => x.includes('@')); const coh = document.getElementById('ec').value;
        list.slice().reverse().forEach((em, k) => { const nm = em.split('@')[0].split(/[._]/).map(p => p[0].toUpperCase() + p.slice(1)).join(' '); D.enrolments.unshift({ id: 'n' + Date.now() + k, student: nm, initials: nm.split(' ').map(p => p[0]).join(''), email: em, cohort: coh, state: 'Invited', progress: 0, last: 'Never' }); });
        audit(`Invited ${list.length} students to ${coh}`); S.modal = null; S.eFilter = 'all'; toast(`${pl(list.length, 'invite', 'invites')} sent. They show as Invited until they accept.`); break; }
      case 'doInvite': { const nm = document.getElementById('in').value.trim() || 'New person'; const role = document.getElementById('ir').value; D.staff.push({ name: nm, initials: nm.split(' ').map(p => p[0]).join('').slice(0, 2), email: document.getElementById('ie').value, role, scope: document.getElementById('is').value, last: 'Invited' }); audit(`Invited ${nm} as ${role}`); S.modal = null; toast(`Invite sent to ${nm} · logged`); break; }
      case 'addItem': { const [mi, kind] = v.split(','); const m = S.order[+mi]; m.items.push(kind === 'lesson' ? { kind, title: 'New lesson', len: '0 min' } : { kind, id: 'x', title: 'New assignment', due: 'not set' }); toast(kind === 'lesson' ? 'Lesson added to the v3 draft' : 'Assignment added. Set a due date and rubric.'); break; }
      case 'addModule': S.order.push({ id: 'm' + (S.order.length + 1), title: 'New module', items: [] }); toast('Module added to the v3 draft'); break;
      case 'releaseQ': { const s = D.subs.find(x => x.id === v); S.done.add(v); S.ret.delete(v); toast(`Grade ${scoreOf(s)} released to ${s.student.split(' ')[0]}`); const nx = pending()[0]; S.panel = nx ? 'grade:' + nx.id : null; break; }
      case 'bulk': {
        const n = S.sel.size; const ids = [...S.sel];
        if (v === 'release') { toast(`${pl(n, 'grade', 'grades')} released to students`); }
        if (v === 'return') { ids.forEach(i => { S.ret.add(i); S.done.delete(i); }); toast(`${pl(n, 'submission', 'submissions')} returned for revision`); }
        if (v === 'assign') toast(`${pl(n, 'submission', 'submissions')} assigned to Nadia Kowalski`);
        S.sel.clear(); break;
      }
      case 'ebulk': {
        if (v === 'move') { S.modal = 'move'; break; }
        const ids = [...S.eSel]; const before = ids.map(i => [i, D.enrolments.find(e => e.id === i).state]);
        ids.forEach(i => D.enrolments.find(e => e.id === i).state = v);
        S.undo = () => before.forEach(([i, s]) => D.enrolments.find(e => e.id === i).state = s);
        toast(`${pl(ids.length, 'student', 'students')} ${v === 'Paused' ? 'paused' : 'dropped'} · logged`, true); S.eSel.clear(); break;
      }
      case 'doMove': toast(`${pl(S.eSel.size, 'student', 'students')} moved to Autumn 2026`); S.eSel.clear(); S.modal = null; break;
      case 'undo': if (S.undo) S.undo(); S.undo = null; S.toast = null; break;
      case 'ai': { const id = t.dataset.id || S.param; const st = aiState(D.subs.find(s => s.id === id)); st.mode = v === 'restore' ? 'draft' : v; if (v === 'accept') { st.final = null; toast('AI draft accepted. Check the score, then release.'); } if (v === 'edit') S.focus = '#fb'; if (v === 'discard') st.fb = ''; break; }
      case 'release': S.done.add(v); S.ret.delete(v); toast('Grade released. Next submission opened.'); go(`#/instructor/grade/${t.dataset.next}`); return;
      case 'returnOne': S.ret.add(v); S.done.delete(v); toast('Returned for revision. The student can submit attempt 2.'); break;
      case 'mv': { const [i, d] = v.split(',').map(Number); const o = S.order; const j = i + d; if (j >= 0 && j < o.length) [o[i], o[j]] = [o[j], o[i]]; break; }
      case 'modal': S.modal = v; break;
      case 'panel': S.anim = !S.panel; S.panel = v; break;
      case 'gtab': S.gtab = v; window.scrollTo(0, 0); break;
      case 'closeAll': S.modal = null; S.panel = null; if (t.dataset.toast) toast(t.dataset.toast); break;
      case 'scrim': S.modal = null; break;
      case 'toast': toast(v); break;
      case 'submit': S.studentSubmitted = true; toast('Submitted. You can replace the file until Oct 14.'); break;
      case 'unsubmit': S.studentSubmitted = false; break;
      default: return;
    }
    render();
  });
  document.addEventListener('change', e => {
    const t = e.target; const a = t.dataset.act; if (!a) return;
    if (a === 'sel') { t.checked ? S.sel.add(t.dataset.v) : S.sel.delete(t.dataset.v); }
    if (a === 'selAll') { const rows = filteredSubs(); rows.forEach(r => t.checked ? S.sel.add(r.id) : S.sel.delete(r.id)); }
    if (a === 'eSel') { t.checked ? S.eSel.add(t.dataset.v) : S.eSel.delete(t.dataset.v); }
    if (a === 'eSelAll') { D.enrolments.filter(r => S.eFilter === 'all' || r.state === S.eFilter).forEach(r => t.checked ? S.eSel.add(r.id) : S.eSel.delete(r.id)); }
    if (a === 'crit') { const st = aiState(D.subs.find(s => s.id === t.dataset.id)); st.crit[+t.dataset.v] = Math.max(0, Math.min(25, parseInt(t.value) || 0)); st.final = null; }
    if (a === 'qscore') { const st = aiState(D.subs.find(s => s.id === t.dataset.id)); st.final = Math.max(0, Math.min(100, parseInt(t.value) || 0)); }
    if (a === 'fbtext') { aiState(D.subs.find(s => s.id === t.dataset.id)).fb = t.value; return; }
    render();
  });
  document.addEventListener('input', e => {
    if (e.target.dataset.act === 'q') { S.q = e.target.value; const pos = e.target.selectionStart; render(); const i = document.querySelector('[data-act="q"]'); i.focus(); i.setSelectionRange(pos, pos); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && (S.modal || S.panel)) { S.modal = null; S.panel = null; render(); }
    if (S.page === 'grade' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      const i = D.subs.findIndex(s => s.id === S.param);
      if (e.key === 'j') go(`#/instructor/grade/${D.subs[(i + 1) % D.subs.length].id}`);
      if (e.key === 'k') go(`#/instructor/grade/${D.subs[(i - 1 + D.subs.length) % D.subs.length].id}`);
    }
  });
  let start = '#/instructor/home';
  try { if (/^#\/(student|instructor|admin)\//.test(location.hash)) start = location.hash; } catch (e) {}
  route(start);
})();
