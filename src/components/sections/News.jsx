import { useMemo } from 'react';
import { sections } from '../../otci/engine.js';
import Section from './Section.jsx';

/** News & updates cards. */
export default function News() {
  const html = useMemo(() => sections.newsSec, []);
  return <Section html={html} />;
}
