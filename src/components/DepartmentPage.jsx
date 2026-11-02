import { useMemo } from 'react';
import { pages } from '../otci/engine.js';
import Page from './Page.jsx';

/** The department page keys, in the order the nav lists them. */
export const DEPARTMENTS = ['bos', 'ci', 'reforms', 'ms', 'non-technical'];

export const DEPARTMENT_NAMES = {
  bos: 'Branding, One-Stop & Service Charter',
  ci: 'Creativity & Innovation',
  reforms: 'Reforms',
  ms: 'Management Consulting Services',
  'non-technical': 'Non-technical departments',
};

/**
 * A department page.
 * @param {'bos'|'ci'|'reforms'|'ms'|'non-technical'} dept
 */
export default function DepartmentPage({ dept }) {
  const page = pages[dept];
  const html = useMemo(() => (page ? page.html() : ''), [page]);
  if (!page) return null;
  return <Page accent={page.accent} html={html} effectKey={dept} />;
}
