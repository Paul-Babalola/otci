import { useEffect, useRef } from 'react';
import { mountNavMenus } from '../otci/engine.js';
import logo from '../assets/otci-logo.jpg';

/**
 * Site navbar. Markup is a 1:1 JSX conversion of the original header.
 *
 * `links` lets you repoint the nav at your app's real routes. The default
 * values are the original hash routes.
 */
const DEPT_KEYS = ['bos', 'ci', 'reforms', 'ms', 'non-technical'];

export default function Navbar({
  links = {
    home: '#home',
    about: '#about',
    gallery: '#gallery',
  },
  active = 'home',
  onFeedback,
}) {
  const ref = useRef(null);

  // Departments mega-menu, hover intent, burger toggle, outside-click close.
  useEffect(() => mountNavMenus(), []);

  // The original router put .active on the current item; these are styling
  // hooks only (the shipped rules for them are empty), but they're the
  // documented way to mark the current page.
  const on = (key) =>
    (key === 'dept' ? DEPT_KEYS.includes(active) : active === key)
      ? 'active'
      : undefined;

  const feedback = (e) => {
    if (onFeedback) {
      e.preventDefault();
      onFeedback(e);
    }
    // otherwise the engine's delegated [data-act] handler opens the modal
  };

  return (
    <header className="top hd2" ref={ref}>
      <div className="wrap nav">
        <a className="logo" href={links.home} aria-label="OTCI home">
          <img className="logo-img" src={logo} alt="" />
          <span className="wm">
            <b>OTCI</b>
            <small>
              Office of Transformation,
              <br />
              Creativity &amp; Innovation
            </small>
          </span>
        </a>

        <nav className="navlinks" id="navlinks" aria-label="Main">
          <a href={links.home} data-r="home" className={on('home')}>Home</a>
          <a href={links.about} data-r="about" className={on('about')}>About us</a>

          <div className="dd mm">
            <button
              id="depBtn"
              aria-haspopup="true"
              aria-expanded="false"
              aria-controls="depMenu"
              data-r="dept"
              className={on('dept')}
            >
              Departments{' '}
              <svg className="caret" viewBox="0 0 10 10" aria-hidden="true">
                <path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            {/* filled by mountNavMenus() */}
            <div className="menu mega" id="depMenu" />
          </div>

          <a href={links.gallery} data-r="gallery" className={on('gallery')}>Gallery</a>

          <div className="nav-m">
            <button type="button" className="mbtn" data-act="feedback" onClick={feedback}>
              Share your experience
            </button>
            <button type="button" className="mbtn ghost" data-act="idea">
              Ideas Day Innovation Competition
            </button>
          </div>
        </nav>

        <div className="nav-r">
          <div className="dd qa">
            <button
              type="button"
              className="hd-cta"
              id="qaBtn"
              aria-haspopup="true"
              aria-expanded="false"
              aria-controls="qaMenu"
            >
              Quick actions
              <svg
                className="qa-car" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {/* wired by mountNavMenus() */}
            <div className="menu right qa-menu" id="qaMenu">
              <button type="button" data-act="idea">
                <svg
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true"
                >
                  <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z" />
                </svg>
                Ideas Day Innovation Competition
              </button>
              <button type="button" data-act="feedback" onClick={feedback}>
                <svg
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true"
                >
                  <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                Share your experience
              </button>
            </div>
          </div>

          <button
            className="burger"
            id="burger"
            aria-label="Open menu"
            aria-expanded="false"
            aria-controls="navlinks"
          >
            <span className="bg-l" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
