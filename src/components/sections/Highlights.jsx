import { useMemo } from 'react';
import { sections } from '../../otci/engine.js';
import Section from './Section.jsx';

/** Transformation highlights with hover preview. */
export default function Highlights({ cms }) {
  const html = useMemo(() => sections.hlSec(cms), [cms]);
  return <Section html={html} />;
}
