import { useRef } from 'react';
import Page from './Page.jsx';
import useCmsHome from '../hooks/useCmsHome.js';

import LagosHero from './sections/LagosHero.jsx';
import Mandate from './sections/Mandate.jsx';
import Process from './sections/Process.jsx';
import Audience from './sections/Audience.jsx';
import Impact from './sections/Impact.jsx';
import Highlights from './sections/Highlights.jsx';
import VoiceBand from './sections/VoiceBand.jsx';
import News from './sections/News.jsx';

/**
 * The landing page. Sections are independent components — reorder or drop any
 * of them and the rest keep working.
 *
 * Content comes from the CMS (GET /api/pages/home) with the built-in copy as
 * fallback. When the CMS data arrives after first paint the sections re-render
 * and the page effects re-run (without repeating the scroll reset).
 */
export default function LandingPage() {
  const cms = useCmsHome();
  const boot = useRef(cms);
  return (
    <Page accent="#008751" effectKey={cms ? 'cms' : 'base'} scrollToTop={cms === boot.current}>
      <LagosHero cms={cms} />
      <Mandate cms={cms} />
      <Process />
      <Audience />
      <Impact cms={cms} />
      <Highlights cms={cms} />
      <VoiceBand cms={cms} />
      <News cms={cms} />
    </Page>
  );
}
