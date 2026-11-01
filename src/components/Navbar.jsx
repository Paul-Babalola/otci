import { useEffect, useRef } from 'react';
import { mountNavMenus } from '../otci/engine.js';
import logo from '../assets/otci-logo.jpg';

/**
 * Site navbar. Markup is a 1:1 JSX conversion of the original header.
 *
 * `links` lets you repoint the nav at your app's real routes. The default
 * values are the original hash routes.
 */
const DEPT_KEYS = ['bos', 'ci', 'reforms', 'ms'];

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
              Share feedback
            </button>
          </div>
        </nav>

        <div className="nav-r">
          <button type="button" className="hd-cta" data-act="feedback" onClick={feedback}>
            Share feedback
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>

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
