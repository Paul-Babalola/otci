import { useMemo } from 'react';
import { sections } from '../../otci/engine.js';
import Section from './Section.jsx';

/** News & updates cards. */
export default function News({ cms }) {
  const html = useMemo(() => sections.newsSec(cms), [cms]);
  return <Section html={html} />;
}
