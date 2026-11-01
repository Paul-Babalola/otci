// Barrel export — drop these into your app.

// Pages
export { default as LandingPage } from './components/LandingPage.jsx';
export { default as AboutPage } from './components/AboutPage.jsx';
export { default as GalleryPage } from './components/GalleryPage.jsx';
export {
  default as DepartmentPage,
  DEPARTMENTS,
  DEPARTMENT_NAMES,
} from './components/DepartmentPage.jsx';
export { default as Page } from './components/Page.jsx';

// Chrome
export { default as Navbar } from './components/Navbar.jsx';
export { default as Footer } from './components/Footer.jsx';
export { default as StreetScene } from './components/ui/StreetScene.jsx';
export { default as Modal } from './components/ui/Modal.jsx';
export { default as Toast } from './components/ui/Toast.jsx';
export { default as Lightbox } from './components/ui/Lightbox.jsx';
export { default as FeedbackFab } from './components/ui/FeedbackFab.jsx';

// Individual landing sections, if you want to compose your own page.
export { default as LagosHero } from './components/sections/LagosHero.jsx';
export { default as Mandate } from './components/sections/Mandate.jsx';
export { default as Process } from './components/sections/Process.jsx';
export { default as Audience } from './components/sections/Audience.jsx';
export { default as Impact } from './components/sections/Impact.jsx';
export { default as Highlights } from './components/sections/Highlights.jsx';
export { default as VoiceBand } from './components/sections/VoiceBand.jsx';
export { default as News } from './components/sections/News.jsx';
export { default as Section } from './components/sections/Section.jsx';

// Hooks
export { default as usePageEffects } from './hooks/usePageEffects.js';
export { default as useScrollProgress } from './hooks/useScrollProgress.js';
export { default as useNavPill } from './hooks/useNavPill.js';
export { default as useHighlightPreview } from './hooks/useHighlightPreview.js';
export { default as useHashRoute, ROUTES } from './hooks/useHashRoute.js';

// Imperative API from the ported engine, if you need it directly.
export {
  openModal, closeModal, toast, sections, homeHTML, pages, setNavHandler,
  SEARCH, searchIndex, resetSearchIndex,
} from './otci/engine.js';

// Search internals, if you want to extend the index or reuse the matcher.
export {
  buildIndex, search, groupHits, highlight, GROUPS, SYNONYMS, STOPWORDS,
} from './otci/search.js';
