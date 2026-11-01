import { useMemo } from 'react';
import { sections } from '../../otci/engine.js';
import Section from './Section.jsx';

/** "Four departments, one mandate" — isometric mandate block. */
export default function Mandate() {
  const html = useMemo(() => sections.mandSec, []);
  return <Section html={html} />;
}
