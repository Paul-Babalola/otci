import usePageEffects from '../hooks/usePageEffects.js';
import Section from './sections/Section.jsx';

/**
 * Shell every page renders into: the <main> the original used, plus the
 * effects pass the router used to run after swapping a page in.
 */
export default function Page({ accent, html, effectKey, scrollToTop = true, children }) {
  usePageEffects(accent, { key: effectKey, scrollToTop });
  return (
    <main id="app" tabIndex={-1}>
      {children ?? <Section html={html} />}
    </main>
  );
}
