import { useMemo } from 'react';
import { pages } from '../otci/engine.js';
import Page from './Page.jsx';

/** About us — who OTCI is, how it works, the four departments. */
export default function AboutPage() {
  const html = useMemo(() => pages.about.html(), []);
  return <Page accent={pages.about.accent} html={html} />;
}
