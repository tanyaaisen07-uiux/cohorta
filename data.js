/* Sample data for the Cohorta demo. All names and numbers are fictional. */
window.DB = (function () {
  const today = 'Oct 6, 2026';

  const people = {
    student: { name: 'Lucía Fernández', initials: 'LF', role: 'Student' },
    instructor: { name: 'Maria Lopez', initials: 'ML', role: 'Instructor' },
    ta: { name: 'Nadia Kowalski', initials: 'NK', role: 'Teaching assistant', group: 'Group A' },
    admin: { name: 'Alex Morgan', initials: 'AM', role: 'Admin' }
  };

  const course = {
    id: 'uxf', title: 'UX Design Fundamentals', version: 2, state: 'Published', owner: 'Maria Lopez',
    modules: [
      { id: 'm1', title: 'Research', items: [
        { kind: 'lesson', id: 'l1', title: 'Why research comes first', len: '12 min' },
        { kind: 'lesson', id: 'l2', title: 'Planning user interviews', len: '18 min' },
        { kind: 'assignment', id: 'a1', title: 'User interview plan', due: 'Sep 15' }
      ]},
      { id: 'm2', title: 'Structure', items: [
        { kind: 'lesson', id: 'l3', title: 'Information architecture', len: '16 min' },
        { kind: 'lesson', id: 'l4', title: 'Flows before screens', len: '14 min' },
        { kind: 'assignment', id: 'a2', title: 'Wireframe review', due: 'Oct 2' }
      ]},
      { id: 'm3', title: 'Interface', items: [
        { kind: 'lesson', id: 'l5', title: 'Layout and hierarchy', len: '20 min' },
        { kind: 'lesson', id: 'l6', title: 'Working with components', len: '17 min' },
        { kind: 'lesson', id: 'l7', title: 'States nobody designs', len: '15 min' },
        { kind: 'assignment', id: 'a3', title: 'Usability test report', due: 'Oct 14' }
      ]},
      { id: 'm4', title: 'Delivery', items: [
        { kind: 'lesson', id: 'l8', title: 'Handoff that developers trust', len: '19 min' },
        { kind: 'assignment', id: 'a4', title: 'Final case study', due: 'Nov 4' }
      ]}
    ],
    // "Opens after" links for the course map: [prerequisite, item]. Next-in-module order is implied.
    links: [['a1', 'l3'], ['a2', 'l5'], ['a2', 'a3'], ['l7', 'a3'], ['a3', 'l8'], ['l7', 'l4']]
  };

  /* Lesson blocks for the lesson editor. "Working with components" is the full example;
     "States nobody designs" starts empty; other lessons get a short opening. */
  const lessons = {
    l6: [
      { id: 'b1', type: 'heading', text: 'What a component is' },
      { id: 'b2', type: 'text', text: 'A component is a part of the interface you design once and reuse everywhere: a button, an input, a card. When the main component changes, every copy changes with it.' },
      { id: 'b3', type: 'video', text: 'Components in Figma, from scratch', len: '6:40' },
      { id: 'b4', type: 'heading', text: 'Variants and properties' },
      { id: 'b5', type: 'text', text: 'Variants group versions of one component, like a button in primary, secondary and danger styles. Properties switch them without detaching. Name them the way developers will: size=sm, state=disabled.' },
      { id: 'b6', type: 'image', file: 'button-variants.png', alt: '', caption: 'Button component with 3 variants and 4 states' },
      { id: 'b7', type: 'callout', text: 'Design the states first: default, hover, focus, disabled, loading. Most handoff bugs come from a state nobody drew.' }
    ],
    l7: []
  };
  // Prepared answers for the AI actions in the demo. Nothing is sent anywhere.
  const aiSamples = {
    quiz: [
      { q: 'You change the corner radius of the main button component. What happens to its copies?', options: ['They all update', 'Only copies on this page update', 'Nothing, copies are independent'], correct: 0, why: 'Copies inherit from the main component unless that property was overridden.' },
      { q: 'You need a button in primary and danger styles. What is the cleanest setup?', options: ['One component with a style variant', 'Two separate components', 'Detach a copy and recolour it'], correct: 0, why: 'Variants keep related versions together, so swapping style never breaks the layout.' },
      { q: 'Which states are most often missing at handoff?', options: ['Default', 'Focus and loading', 'Hover'], correct: 1, why: 'Default and hover get drawn first. Developers end up inventing focus and loading.' }
    ],
    recap: 'Recap: build a part once as a component, group its versions as variants, and draw every state before handoff.',
    first: t => [
      { type: 'heading', text: 'Why ' + t.toLowerCase() + ' matters' },
      { type: 'text', text: 'Every screen has more states than the one in the mockup: empty, loading, error, disabled and locked. Users meet them on their first day, and developers build them with or without a design.' },
      { type: 'callout', text: 'Before handoff, list the states for each screen and check that each one is drawn.' },
      { type: 'quiz', q: 'A list has no items yet. Which state is that?', options: ['Empty', 'Error', 'Loading'], correct: 0, why: 'Empty means the data loaded and there is nothing in it yet. It needs a next step, not an error message.' }
    ]
  };

  const names = ['Lucía Fernández','Omar Haddad','Chloé Martin','Jonas Weber','Priya Nair','Mateo Silva','Hannah Cole','Yuki Tanaka','Daniel Ortega','Amira Bensaid',
    'Leo Rossi','Sara Lindqvist','Noah Becker','Elena Popescu','Kofi Mensah','Inés Navarro','Tom Walsh','Aisha Khan','Pablo Ruiz','Mia Novak',
    'Felix Braun','Zara Ahmed','Ivan Petrov','Grace Kim'];
  const ini = n => n.split(' ').map(p => p[0]).join('');

  // Grading queue: Wireframe review (a2) + some late a1, Spring 2026
  const st = ['ai','ai','submitted','late','ai','graded','ai','submitted','returned','ai','late','ai','submitted','graded','ai','ai','submitted','ai','graded','late','ai','submitted'];
  const subs = names.slice(0, 22).map((n, i) => {
    const status = st[i];
    const ai = ['ai','late','graded','returned'].includes(status) ? 64 + ((i * 7) % 33) : null;
    const fin = status === 'graded' ? ai + ((i % 3) - 1) * 2 : status === 'returned' ? ai - 6 : null;
    return {
      id: 's' + (i + 1), student: n, initials: ini(n), group: i % 2 ? 'Group B' : 'Group A',
      assignment: i % 6 === 3 ? 'User interview plan' : 'Wireframe review',
      submitted: ['Oct 2','Oct 2','Oct 3','Oct 4','Oct 1','Sep 30','Oct 2','Oct 3','Oct 1','Oct 2','Oct 5','Oct 2','Oct 3','Sep 30','Oct 1','Oct 2','Oct 4','Oct 2','Sep 29','Oct 5','Oct 2','Oct 3'][i],
      status, ai, final: fin
    };
  });

  const catalogue = [
    { id: 'uxf', title: 'UX Design Fundamentals', state: 'Published', version: 'v2', owner: 'Maria Lopez', cohorts: 2, students: 96, updated: 'Sep 28' },
    { id: 'prb', title: 'Product Research Basics', state: 'In review', version: 'v1', owner: 'Sofia Rossi', cohorts: 0, students: 0, updated: 'Oct 5' },
    { id: 'dsp', title: 'Design Systems in Practice', state: 'In review', version: 'v3', owner: 'Maria Lopez', cohorts: 1, students: 41, updated: 'Oct 4' },
    { id: 'uim', title: 'UI Motion Essentials', state: 'Published', version: 'v1', owner: 'Daniel Kim', cohorts: 1, students: 37, updated: 'Aug 19' },
    { id: 'svd', title: 'Service Design 101', state: 'Published', version: 'v2', owner: 'Sofia Rossi', cohorts: 2, students: 83, updated: 'Sep 11' },
    { id: 'acc', title: 'Accessible Interfaces', state: 'In review', version: 'v1', owner: 'Lucas Martin', cohorts: 0, students: 0, updated: 'Oct 6' },
    { id: 'wrt', title: 'UX Writing Basics', state: 'Draft', version: 'v1', owner: 'Maria Lopez', cohorts: 0, students: 0, updated: 'Oct 1' },
    { id: 'fgt', title: 'Figma for Teams', state: 'Archived', version: 'v4', owner: 'Daniel Kim', cohorts: 0, students: 0, updated: 'Jun 30' }
  ];

  const cohorts = [
    { id: 'c1', course: 'UX Design Fundamentals', name: 'Spring 2026', state: 'Running', students: 48, progress: 64, behind: 12, start: 'Sep 1', end: 'Nov 28' },
    { id: 'c2', course: 'UX Design Fundamentals', name: 'Autumn 2026', state: 'Scheduled', students: 48, progress: 0, behind: 0, start: 'Oct 20', end: 'Jan 30' },
    { id: 'c3', course: 'Service Design 101', name: 'Spring 2026', state: 'Running', students: 45, progress: 41, behind: 12, start: 'Sep 8', end: 'Dec 5' },
    { id: 'c4', course: 'UI Motion Essentials', name: 'Spring 2026', state: 'Running', students: 37, progress: 78, behind: 2, start: 'Aug 25', end: 'Oct 31' },
    { id: 'c5', course: 'Design Systems in Practice', name: 'Summer 2026', state: 'Completed', students: 41, progress: 100, behind: 0, start: 'Jun 2', end: 'Aug 29' },
    { id: 'c6', course: 'Service Design 101', name: 'Winter 2026', state: 'Running', students: 38, progress: 22, behind: 14, start: 'Sep 22', end: 'Dec 19' }
  ];

  const enrolState = ['Active','Active','Active','Invited','Active','Paused','Active','Active','Active','Dropped','Active','Active','Invited','Active','Active','Active','Paused','Active','Active','Active','Active','Completed','Active','Active'];
  const enrolments = names.map((n, i) => ({
    id: 'e' + (i + 1), student: n, initials: ini(n), email: n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(' ', '.') + '@mail.com',
    cohort: i % 3 === 2 ? 'Service Design 101 · Spring' : 'UX Design Fundamentals · Spring',
    state: enrolState[i], progress: enrolState[i] === 'Invited' ? 0 : enrolState[i] === 'Completed' ? 100 : 18 + ((i * 13) % 74),
    last: ['Today','Today','Yesterday','Never','Oct 3','Sep 21','Today','Oct 4','Yesterday','Sep 14','Today','Oct 5','Never','Today','Oct 2','Yesterday','Sep 25','Today','Oct 4','Today','Oct 5','Aug 29','Yesterday','Today'][i]
  }));

  const staff = [
    { name: 'Alex Morgan', initials: 'AM', email: 'alex.morgan@cohorta.school', role: 'Admin', scope: 'Whole school', last: 'Today' },
    { name: 'Maria Lopez', initials: 'ML', email: 'maria.lopez@cohorta.school', role: 'Instructor', scope: 'UX Design Fundamentals, Design Systems', last: 'Today' },
    { name: 'Lucas Martin', initials: 'LM', email: 'lucas.martin@cohorta.school', role: 'Admin + Instructor', scope: 'Whole school; Accessible Interfaces', last: 'Yesterday' },
    { name: 'Sofia Rossi', initials: 'SR', email: 'sofia.rossi@cohorta.school', role: 'Instructor', scope: 'Service Design 101, Product Research', last: 'Oct 4' },
    { name: 'Daniel Kim', initials: 'DK', email: 'daniel.kim@cohorta.school', role: 'Instructor', scope: 'UI Motion Essentials', last: 'Oct 2' },
    { name: 'Nadia Kowalski', initials: 'NK', email: 'nadia.k@cohorta.school', role: 'Teaching assistant', scope: 'UXF Spring 2026 · Group A', last: 'Today' },
    { name: 'Ben Okafor', initials: 'BO', email: 'ben.okafor@cohorta.school', role: 'Teaching assistant', scope: 'UXF Spring 2026 · Group B', last: 'Yesterday' },
    { name: 'Clara Jensen', initials: 'CJ', email: 'clara.jensen@cohorta.school', role: 'Teaching assistant', scope: 'Service Design 101 · Spring', last: 'Oct 3' }
  ];

  const audit = [
    { when: 'Oct 6, 2026 · 14:32', who: 'Alex Morgan', what: 'Changed role of Lucas Martin: Instructor → Admin + Instructor' },
    { when: 'Oct 6, 2026 · 11:08', who: 'Maria Lopez', what: 'Changed grade for Omar Haddad, Wireframe review: 78 → 84 · reason: rubric correction' },
    { when: 'Oct 5, 2026 · 17:45', who: 'Alex Morgan', what: 'Pushed UX Design Fundamentals v2 to cohort Spring 2026' },
    { when: 'Oct 5, 2026 · 09:20', who: 'Alex Morgan', what: 'Paused enrolment of 2 students in UXF Spring 2026' },
    { when: 'Oct 4, 2026 · 16:02', who: 'Alex Morgan', what: 'Added Clara Jensen as Teaching assistant · Service Design 101 · Spring' },
    { when: 'Oct 3, 2026 · 10:14', who: 'Lucas Martin', what: 'Archived course Figma for Teams' }
  ];

  const studentGrades = [
    { title: 'User interview plan', module: 'Research', status: 'Graded', score: 88, date: 'Sep 19', feedback: 'Clear goals and a good mix of open questions. Next time, add how you will recruit participants.' },
    { title: 'Wireframe review', module: 'Structure', status: 'Submitted', score: null, date: 'Oct 2', feedback: '' },
    { title: 'Usability test report', module: 'Interface', status: 'Not started', score: null, date: 'Due Oct 14', feedback: '' },
    { title: 'Final case study', module: 'Delivery', status: 'Locked', score: null, date: 'Due Nov 4', feedback: '' }
  ];

  return { today, people, course, lessons, aiSamples, subs, catalogue, cohorts, enrolments, staff, audit, studentGrades };
})();

/* Long data: the same school with long names, long titles and about 200 rows.
   Used by the "Long data" demo state to check that nothing breaks with real content. */
window.makeLongDB = function (D) {
  const names = ['Maximiliana Konstantinopoulou', 'Bartholomew Oyelaran-Whitfield', 'Anne-Sophie van der Westhuizen', 'Nguyễn Thị Minh Khai Hoàng',
    'Christopher Alexander Montgomery III', 'Guðmundur Sigurðarson-Eriksen', 'María de los Ángeles Rodríguez Zapatero', 'Oluwaseun Adebayo-Okonkwo',
    'Wolfgang Schwarzenberger-Lindqvist', 'Aleksandra Wiśniewska-Kowalczyk', 'Siddharth Venkataraman Iyer', 'Jean-Baptiste Delacroix-Beaumont'];
  const ini = n => n.split(/[\s-]+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
  const nameAt = i => names[i % names.length] + (i >= names.length ? ' ' + (Math.floor(i / names.length) + 1) : '');
  const mail = n => n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ð/g, 'd').replace(/þ/g, 'th').replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '') + '@continuing-education.university.example';
  const course = { ...D.course, title: 'UX Design Fundamentals for Product Teams Moving From Agency Work',
    modules: D.course.modules.map((m, mi) => ({ ...m, title: m.title + [' and discovery interviews', ': information architecture and flows', ': components, states and accessibility', ' and handoff to engineering'][mi],
      items: m.items.map(it => ({ ...it, title: it.title + (it.kind === 'lesson' ? ' with a worked example from a real product' : ' (individual, peer-reviewed, 4 to 8 pages)') })) })) };
  const subs = Array.from({ length: 198 }, (_, i) => { const b = D.subs[i % D.subs.length]; const n = nameAt(i);
    return { ...b, id: 's' + (i + 1), student: n, initials: ini(n), group: i % 2 ? 'Group B' : 'Group A',
      assignment: i % 6 === 3 ? 'User interview plan and recruitment screener' : 'Wireframe review: enrolment, payment and first lesson flow' }; });
  const catalogue = D.catalogue.map((c, i) => ({ ...c, title: c.title + [' for Product Teams Moving From Agency Work', ': From Interview Guide to Synthesis Board', ' at Scale, With Tokens and Governance', ' for Product Designers Who Prototype in Code', ': Journeys, Blueprints and Operations', ' and Inclusive Design Reviews', ' for Interfaces, Errors and Empty States', ' and Shared Libraries Across Teams'][i], owner: nameAt(i + 3) }));
  const cohorts = D.cohorts.map((c, i) => ({ ...c, course: catalogue.find(x => c.course.startsWith(x.title.split(/ for | at |: | and /)[0])) ? c.course + ' for Product Teams Moving From Agency Work' : c.course, name: c.name + ' · Evening, Europe and Africa time zones' }));
  const enrolments = Array.from({ length: 200 }, (_, i) => { const b = D.enrolments[i % D.enrolments.length]; const n = nameAt(i);
    return { ...b, id: 'e' + (i + 1), student: n, initials: ini(n), email: mail(n), cohort: b.cohort.replace('UX Design Fundamentals', 'UX Design Fundamentals for Product Teams').replace('Service Design 101', 'Service Design 101: Journeys and Blueprints') + ' · Evening' }; });
  const staff = D.staff.map((s, i) => ({ ...s, name: nameAt(i + 5), initials: ini(nameAt(i + 5)), email: mail(nameAt(i + 5)), scope: s.scope + ', plus the Evening cohorts in Europe and Africa time zones' }));
  const audit = D.audit.map((a, i) => ({ ...a, who: nameAt(i + 5), what: a.what + ' · reason: agreed with the programme lead after the cohort review meeting' }));
  const studentGrades = D.studentGrades.map(g => ({ ...g, title: g.title + ' (individual, peer-reviewed)', feedback: g.feedback ? g.feedback + ' Your goals are specific and each one maps to a question, which makes the plan easy to run. For the next round, add a screener with two disqualifying questions, plan a pilot session with a colleague, and write down how you will take notes so that synthesis takes one afternoon instead of three.' : '' }));
  return { ...D, course, subs, catalogue, cohorts, enrolments, staff, audit, studentGrades,
    people: { ...D.people, student: { ...D.people.student, name: 'María de los Ángeles Rodríguez Zapatero', initials: 'MR' } },
    feedback: 'Strong flow from sign-up to first course, and the empty states are thought through: each one tells the student what happens next and offers one clear action. Two things to fix before v3. First, the enrolment screen hides the cohort dates until after payment, which is the moment students most need them; move the dates and the time zone to the course page. Second, the error on a failed upload says only "Something went wrong"; say what failed, whether the file was kept, and what to try next, for example a smaller PDF or a different browser.' };
};
