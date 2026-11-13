import { useMemo } from 'react';
import { sections } from '../../otci/engine.js';
import Section from './Section.jsx';

/** Animated Lagos panorama hero: skyline, traffic, weather toggle, service search. */
export default function LagosHero({ cms }) {
  const html = useMemo(() => sections.lagosHero(cms), [cms]);
  return <Section html={html} />;
}
