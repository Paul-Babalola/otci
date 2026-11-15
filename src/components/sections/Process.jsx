import { useMemo } from 'react';
import { sections } from '../../otci/engine.js';
import Section from './Section.jsx';

/** Scroll-driven consult → reform → innovate → deliver stepper. */
export default function Process({ cms }) {
  const html = useMemo(() => sections.processSec(cms), [cms]);
  return <Section html={html} />;
}
