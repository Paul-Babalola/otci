import { Fragment, useRef } from 'react';
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

const DEFAULT_ORDER = ['hero', 'what_we_do', 'metrics_bar', 'transformation_highlights', 'citizen_engagement_cta', 'news_updates'];

export default function LandingPage() {
  const cms = useCmsHome();
  const boot = useRef(cms);
  const order = cms?._order ?? DEFAULT_ORDER;

  return (
    <Page accent="#008751" effectKey={cms ? 'cms' : 'base'} scrollToTop={cms === boot.current}>
      {order.map((type) => {
        switch (type) {
          case 'hero': return <LagosHero key={type} cms={cms} />;
          case 'what_we_do': return <Fragment key={type}><Mandate cms={cms} /><Process /><Audience /></Fragment>;
          case 'metrics_bar': return <Impact key={type} cms={cms} />;
          case 'transformation_highlights': return <Highlights key={type} cms={cms} />;
          case 'citizen_engagement_cta': return <VoiceBand key={type} cms={cms} />;
          case 'news_updates': return <News key={type} cms={cms} />;
          default: return null;
        }
      })}
    </Page>
  );
}
