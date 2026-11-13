import { useMemo, useRef } from 'react';
import { pages } from '../otci/engine.js';
import useCmsPage from '../hooks/useCmsPage.js';
import Page from './Page.jsx';

/** About us — who OTCI is, how it works, the four departments. CMS-driven with built-in fallbacks. */
export default function AboutPage() {
  const cms = useCmsPage('about');
  const boot = useRef(cms);
  const html = useMemo(() => pages.about.html(cms), [cms]);
  return <Page accent={pages.about.accent} html={html} effectKey={cms ? 'cms' : 'base'} scrollToTop={cms === boot.current} />;
}
