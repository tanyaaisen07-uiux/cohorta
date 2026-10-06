/* Sample data for the Cohorta demo. All names and numbers are fictional. */
window.DB = (function () {
  const today = 'Oct 6, 2026';

  const people = {
    student: { name: 'Lucía Fernández', initials: 'LF', role: 'Student' },
    instructor: { name: 'Maria Lopez', initials: 'ML', role: 'Instructor' },
    admin: { name: 'Alex Morgan', initials: 'AM', role: 'Admin' }
  };

  const course = {
    id: 'uxf', title: 'UX Design Fundamentals', version: 2, state: 'Published', owner: 'Maria Lopez',
    modules: [
      { id: 'm1', title: 'Research', items: [
        { kind: 'lesson', title: 'Why research comes first', len: '12 min' },
        { kind: 'lesson', title: 'Planning user interviews', len: '18 min' },
        { kind: 'assignment', id: 'a1', title: 'User interview plan', due: 'Sep 15' }
      ]},
      { id: 'm2', title: 'Structure', items: [
        { kind: 'lesson', title: 'Information architecture', len: '16 min' },
        { kind: 'lesson', title: 'Flows before screens', len: '14 min' },
        { kind: 'assignment', id: 'a2', title: 'Wireframe review', due: 'Oct 2' }
      ]},
      { id: 'm3', title: 'Interface', items: [
        { kind: 'lesson', title: 'Layout and hierarchy', len: '20 min' },
        { kind: 'lesson', title: 'Working with components', len: '17 min' },
        { kind: 'lesson', title: 'States nobody designs', len: '15 min' },
        { kind: 'assignment', id: 'a3', title: 'Usability test report', due: 'Oct 14' }
      ]},
      { id: 'm4', title: 'Delivery', items: [
        { kind: 'lesson', title: 'Handoff that developers trust', len: '19 min' },
        { kind: 'assignment', id: 'a4', title: 'Final case study', due: 'Nov 4' }
      ]}
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

  return { today, people, course, subs, catalogue, cohorts, enrolments, staff, audit, studentGrades };
})();
