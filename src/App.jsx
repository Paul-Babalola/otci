import { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import LandingPage from './components/LandingPage.jsx';
import AboutPage from './components/AboutPage.jsx';
import DepartmentPage, { DEPARTMENTS } from './components/DepartmentPage.jsx';
import GalleryPage from './components/GalleryPage.jsx';
import StreetScene from './components/ui/StreetScene.jsx';
import Footer from './components/Footer.jsx';
import Modal from './components/ui/Modal.jsx';
import Toast from './components/ui/Toast.jsx';
import Lightbox from './components/ui/Lightbox.jsx';
import FeedbackFab from './components/ui/FeedbackFab.jsx';
import IdeaFormModal from './components/ui/IdeaFormModal.jsx';
import useScrollProgress from './hooks/useScrollProgress.js';
import useNavPill from './hooks/useNavPill.js';
import useHighlightPreview from './hooks/useHighlightPreview.js';
import useHashRoute from './hooks/useHashRoute.js';

/**
 * Demo shell: the whole site behind a hash router, so `npm run dev` matches the
 * original artifact. In your app, drop useHashRoute and route the page
 * components with your own router — see the README.
 */
export default function App() {
  const { route, sub } = useHashRoute();
  const [showIdea, setShowIdea] = useState(false);

  useScrollProgress();
  useNavPill();
  useHighlightPreview();

  // Intercept data-act="idea" clicks in the capture phase so they open the
  // React modal instead of engine.js's innerHTML-based modal.
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('[data-act="idea"]')) return;
      e.stopImmediatePropagation();
      setShowIdea(true);
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);

  const page = route === 'about' ? <AboutPage />
    : route === 'gallery' ? <GalleryPage view={sub === 'videos' ? 'videos' : 'photos'} />
    : DEPARTMENTS.includes(route) ? <DepartmentPage dept={route} />
    : <LandingPage />;

  return (
    <>
      <Navbar active={route} />
      {/* key remounts the page on navigation, so each page's effects
          run and tear down cleanly — the router used to do this by
          replacing #app's innerHTML. */}
      <div key={route} style={{ display: 'contents' }}>{page}</div>
      <StreetScene />
      <Footer />
      <FeedbackFab />
      <Modal />
      <Toast />
      <Lightbox />
      <IdeaFormModal open={showIdea} onClose={() => setShowIdea(false)} />
    </>
  );
}
