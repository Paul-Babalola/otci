import Page from './Page.jsx';

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
 */
export default function LandingPage() {
  return (
    <Page accent="#008751">
      <LagosHero />
      <Mandate />
      <Process />
      <Audience />
      <Impact />
      <Highlights />
      <VoiceBand />
      <News />
    </Page>
  );
}
