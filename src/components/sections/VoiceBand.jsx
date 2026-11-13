import { useMemo } from 'react';
import { sections } from '../../otci/engine.js';
import Section from './Section.jsx';

/** Citizen-feedback band with its canvas waveform. */
export default function VoiceBand({ cms }) {
  const html = useMemo(() => sections.voiceBand(cms), [cms]);
  return <Section html={html} />;
}
