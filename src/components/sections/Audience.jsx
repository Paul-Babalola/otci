import { useMemo } from 'react';
import { sections } from '../../otci/engine.js';
import Section from './Section.jsx';

/** "Built for everyone who keeps Lagos working" — three ways in. */
export default function Audience() {
  const html = useMemo(() => sections.audSec, []);
  return <Section html={html} />;
}
