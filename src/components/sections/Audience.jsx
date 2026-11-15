import { useMemo } from 'react';
import { sections } from '../../otci/engine.js';
import Section from './Section.jsx';

/** "Built for everyone who keeps Lagos working" — three ways in. */
export default function Audience({ cms }) {
  const html = useMemo(() => sections.audSec(cms), [cms]);
  return <Section html={html} />;
}
