import { useMemo, useRef } from 'react';
import { pages } from '../otci/engine.js';
import useCmsPage from '../hooks/useCmsPage.js';
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
 * A department page. Content comes from the CMS (GET /api/pages/{slug}) with
 * the built-in copy as fallback; non-technical has no CMS page.
 * @param {'bos'|'ci'|'reforms'|'ms'|'non-technical'} dept
 */
export default function DepartmentPage({ dept }) {
  const cms = useCmsPage(dept);
  // The component instance is reused across department routes — track the
  // content seen at each route's first render so only a late CMS arrival
  // skips the scroll reset.
  const boot = useRef({});
  if (boot.current.pid !== dept) boot.current = { pid: dept, cms };
  const page = pages[dept];
  const html = useMemo(() => (page ? page.html(cms) : ''), [page, cms]);
  if (!page) return null;
  return <Page accent={page.accent} html={html} effectKey={`${dept}:${cms ? 'cms' : 'base'}`} scrollToTop={cms === boot.current.cms} />;
}
