import { useMemo } from 'react';
import { sections } from '../../otci/engine.js';
import Section from './Section.jsx';

/** Transformation highlights with hover preview. */
export default function Highlights() {
  const html = useMemo(() => sections.hlSec, []);
  return <Section html={html} />;
}
