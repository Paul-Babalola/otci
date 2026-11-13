import { useMemo } from 'react';
import { sections } from '../../otci/engine.js';
import Section from './Section.jsx';

/** Impact stats, analytics story stage and counters. */
export default function Impact({ cms }) {
  const html = useMemo(() => sections.impactSec(cms), [cms]);
  return <Section html={html} />;
}
