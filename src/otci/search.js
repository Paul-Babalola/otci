/**
 * Search for the hero finder.
 *
 * The original artifact matched a 10-item list of task labels with a plain
 * substring test, so "feedback", "hospital", "charters" and anything with a
 * typo returned nothing. This module indexes everything the site actually
 * holds — actions, pages, departments, MDAs and their charter services,
 * hospitals and news — and matches with synonyms, stemming and typo
 * tolerance.
 *
 * It is pure: engine.js owns the data and passes it to buildIndex().
 */

/* Order groups appear in, and their headings. */
export const GROUPS = [
  ['action', 'Do something'],
  ['service', 'Services'],
  ['dept', 'Departments'],
  ['mda', 'Agencies'],
  ['hospital', 'Hospitals'],
  ['page', 'Pages'],
  ['news', 'News'],
];

/* Applied as a multiplier, so a news headline that happens to start with the
   query can't outrank the page the user actually wants. */
const KIND_WEIGHT = { action: 1.35, page: 1.3, dept: 1.2, service: 1.05, mda: 1.05, hospital: 1.05, news: 0.8 };

/* Words carried by ordinary questions that shouldn't have to match anything:
   "how do i report a problem" is a query about reporting a problem. */
export const STOPWORDS = new Set(('a about an and any are as at be by can do does for from get go '
 + 'have how i if in into is it like me my need of on or out please should some the their there this '
 + 'to up want was way we what when where which who why will with would you your'
 ).split(' '));

/* Query words that should also match a different word in the index. */
export const SYNONYMS = {
  complaint: ['feedback', 'complain', 'report'],
  complain: ['feedback', 'report'],
  report: ['feedback', 'complain'],
  feedback: ['experience', 'complain', 'complaint', 'praise'],
  praise: ['feedback', 'experience'],
  problem: ['feedback', 'complain', 'issue'],
  issue: ['feedback', 'complain', 'problem'],
  suggestion: ['idea'],
  suggest: ['idea'],
  innovate: ['innovation', 'idea'],
  standard: ['charter', 'promise'],
  promise: ['charter', 'standard'],
  clinic: ['hospital', 'health'],
  health: ['hospital', 'medical', 'clinic'],
  medical: ['hospital', 'health'],
  doctor: ['hospital', 'health'],
  tax: ['revenue', 'levy', 'levies'],
  levy: ['tax', 'revenue'],
  revenue: ['tax', 'levy'],
  land: ['lands', 'property'],
  property: ['land', 'lands'],
  car: ['vehicle'],
  vehicle: ['car', 'inspection'],
  job: ['evaluation', 'grading', 'staff'],
  staff: ['job', 'evaluation', 'personnel'],
  photo: ['gallery', 'picture', 'image'],
  picture: ['gallery', 'photo'],
  video: ['gallery', 'briefing'],
  team: ['department', 'unit'],
  office: ['department', 'otci'],
  help: ['contact', 'support'],
  support: ['contact', 'help'],
  phone: ['contact'],
  email: ['contact'],
};

/* ---------------- text helpers ---------------- */

export const norm = (s) =>
  String(s)
    .replace(/&amp;/g, '&')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/* Crude but effective plural/suffix stripping. */
export const stem = (w) => {
  if (w.length > 4 && /(ies)$/.test(w)) return w.slice(0, -3) + 'y';
  if (w.length > 4 && /(ses|xes|zes|ches|shes)$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
  return w;
};

/* Bounded Levenshtein: returns a number > max as soon as it knows. */
export function editDistance(a, b, max = 2) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/* ---------------- index ---------------- */

/**
 * @param {object} data engine data: { TASKS, STEPS, MDAS, HOSP, NEWS, HL, svcNm }
 * @returns {Array} entries, each { label, hint, kind, href?, act?, words, text }
 */
export function buildIndex(data) {
  const { TASKS = [], STEPS = [], MDAS = {}, HOSP = [], NEWS = [], HL = [], svcNm = (s) => s } = data;
  const out = [];
  const add = (label, kind, target, keys = [], hint) => {
    if (!label) return;
    const text = norm(label + ' ' + keys.join(' '));
    out.push({
      label: String(label).replace(/&amp;/g, '&'),
      kind,
      hint: hint || (target && target.act ? 'Opens a form' : 'Go to page'),
      href: target && target.href,
      act: target && target.act,
      text,
      words: [...new Set(text.split(' ').filter(Boolean).map(stem))],
    });
  };

  // 1. the original task list — actions and shortcut pages
  const TASK_KEYS = {
    'Share your experience with an MDA':
      'feedback complain complaint report problem praise review service experience',
    'Submit an idea for Ideas Day': 'idea innovation suggestion pitch creativity submit',
    'Find a service charter': 'charter standards promises commitments service bos',
    'Check service standards by MDA': 'charter standards compliance mda agency bos',
    'Contact Management Services': 'contact msd management services support help consultancy',
    'Request a job evaluation': 'job evaluation grading staff structure msd personnel',
    'Read about public service reforms': 'reform performance policy restructuring transformation',
    'Join the Ideas Day innovation competition': 'ideas day innovation competition contest ci',
    'See the gallery': 'gallery photos pictures images videos briefings events',
    'About OTCI and the Special Adviser': 'about otci mandate leadership special adviser history',
  };
  TASKS.forEach((t) => {
    const isAct = !!t[2];
    add(t[0], isAct ? 'action' : 'page', isAct ? { act: t[1] } : { href: t[1] },
      (TASK_KEYS[t[0]] || '').split(' '));
  });

  // 2. departments
  const DEPT_KEYS = {
    '#ms': 'msd management services consultancy job evaluation structure internal consultant',
    '#reforms': 'reforms performance reporting policy restructuring transformation appraise',
    '#ci': 'ci creativity innovation ideas day labs competition homegrown',
    '#bos': 'bos branding one stop shop service charter standards citizen feedback',
  };
  STEPS.forEach((s) => {
    const href = s[3];
    add(s[1], 'dept', { href }, (DEPT_KEYS[href] || '').split(' ').concat(norm(s[2]).split(' ')),
      'Department');
  });

  // 3. MDAs and every charter service under them
  Object.keys(MDAS).forEach((key) => {
    const name = svcNm(key);
    const isHosp = /hospital|health|maternity|clinic|medical/i.test(name);
    add(name, isHosp ? 'hospital' : 'mda', { href: '#bos/standards' },
      ['charter', 'standards', 'mda', 'agency',
        ...(isHosp ? ['hospital', 'health', 'clinic', 'medical'] : []),
        ...norm(key).split(' ')],
      'Service charter');
    (MDAS[key] || []).forEach((row) => {
      add(row[0], 'service', { href: '#bos/standards' },
        [...norm(name).split(' '), 'charter', 'service', 'standard'], name);
    });
  });

  // 4. hospitals
  HOSP.forEach((h) =>
    add(h, 'hospital', { href: '#bos/standards' },
      ['hospital', 'health', 'clinic', 'medical', ...norm(h).split(' ')], 'Health facility'));

  // 5. news and highlights
  NEWS.forEach((n) => add(n[2], 'news', { href: '#home/news' }, [norm(n[0]), 'news', 'update'], n[1]));
  HL.forEach((h) => add(h[0], 'news', { href: h[7] || '#home/highlights' },
    [norm(h[1]), norm(h[3]), 'highlight', 'report'], h[2]));

  // de-duplicate by label, keeping the highest-priority kind
  const seen = new Map();
  for (const e of out) {
    const k = e.label.toLowerCase();
    const prev = seen.get(k);
    if (!prev || (KIND_WEIGHT[e.kind] || 0) > (KIND_WEIGHT[prev.kind] || 0)) seen.set(k, e);
  }
  return [...seen.values()];
}

/* ---------------- matching ---------------- */

function tokenScore(entry, token) {
  let best = 0;
  const variants = [token, ...(SYNONYMS[token] || []).map(stem)];
  for (const v of variants) {
    const exact = v === token;
    for (const w of entry.words) {
      let s = 0;
      if (w === v) s = 100;
      else if (w.startsWith(v)) s = 70;
      else if (v.length >= 4 && w.includes(v)) s = 50;
      else if (v.length >= 4 && editDistance(w, v, v.length >= 7 ? 2 : 1) <= (v.length >= 7 ? 2 : 1)) s = 30;
      if (!exact) s *= 0.45;          // synonym hits rank well below direct hits
      if (s > best) best = s;
    }
    if (best >= 100) break;
  }
  if (!best && token.length >= 3 && entry.text.includes(token)) best = 40;
  return best;
}

/**
 * @returns {Array} matching entries, best first, each with a `score`.
 */
export function search(index, query, limit = 8) {
  const q = norm(query);
  if (!q) return index.filter((e) => e.kind === 'action' || e.kind === 'page').slice(0, limit);

  let words = q.split(' ').filter(Boolean);
  const rawCount = words.length;
  const kept = words.filter((w) => !STOPWORDS.has(w));
  if (kept.length) words = kept;                 // drop filler unless that's all there is
  const tokens = [...new Set(words.map(stem))];
  const hits = [];

  /* A terse query must match in full — "service charter" means both words.
     A sentence is a different thing: the user is describing an intent, so once
     they've typed four or more words we stop insisting every one of them lands.
     That's what makes "where do i complain about a hospital" work. */
  const sentence = rawCount >= 4;
  const need = (!sentence && tokens.length <= 2)
    ? tokens.length
    : Math.max(1, Math.ceil(tokens.length * 0.5));

  for (const e of index) {
    let total = 0, matched = 0;
    for (const t of tokens) {
      const s = tokenScore(e, t);
      if (s) { matched++; total += s; }
    }
    if (matched < need) continue;

    if (e.text === q) total += 300;
    else if (e.text.startsWith(q)) total += 120;
    else if (e.text.includes(q)) total += 60;

    total *= matched / tokens.length;            // full matches beat partial ones
    total *= KIND_WEIGHT[e.kind] || 1;
    total -= Math.min(30, e.label.length / 4);   // prefer the tighter, more specific label
    hits.push({ ...e, score: total });
  }

  hits.sort((a, b) => b.score - a.score || a.label.length - b.label.length);
  return hits.slice(0, limit);
}

/** Wraps the matched part of a label in <mark>, HTML-escaped. */
export function highlight(label, query) {
  const esc = (t) => t.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  const tokens = norm(query).split(' ').filter((t) => t.length > 1);
  if (!tokens.length) return esc(label);
  let out = '', i = 0;
  const low = label.toLowerCase();
  while (i < label.length) {
    let hit = 0;
    for (const t of tokens) {
      if (low.startsWith(t, i)) { hit = Math.max(hit, t.length); }
    }
    if (hit) { out += '<mark>' + esc(label.slice(i, i + hit)) + '</mark>'; i += hit; }
    else { out += esc(label[i]); i++; }
  }
  return out;
}

/** Shown when nothing matches. */
export const SUGGESTIONS = ['service charter', 'share feedback', 'submit an idea', 'hospitals', 'contact'];

/**
 * Reorders hits so same-kind entries sit together, with groups ordered by
 * their best member. The array stays in visual order, so hits[0] is still the
 * top-scoring entry and arrow keys follow what the eye sees.
 */
export function groupHits(hits) {
  const byKind = new Map();
  for (const h of hits) {
    if (!byKind.has(h.kind)) byKind.set(h.kind, []);
    byKind.get(h.kind).push(h);
  }
  return [...byKind.entries()]
    .sort((a, b) => b[1][0].score - a[1][0].score)
    .flatMap(([, list]) => list);
}

/** Heading shown above each group. */
export const groupTitle = (kind) => (GROUPS.find((g) => g[0] === kind) || [, 'Results'])[1];
