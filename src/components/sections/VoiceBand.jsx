import { useMemo } from 'react';
import { sections } from '../../otci/engine.js';
import Section from './Section.jsx';

/** Citizen-feedback band with its canvas waveform. */
export default function VoiceBand() {
  const html = useMemo(() => sections.voiceBand, []);
  return <Section html={html} />;
}
