import { useEffect } from 'react';
import {
  ribbons, reveals, startScene, stopScene, gvInit, hwInit, storyInit,
  textFx, hlFx, btnFx, onScroll, resetStep, stopStory, bindHighlightFilter,
  wireBos, wireGallery, lbxInit, cxFx, chatFx, dpFx, aboutFx,
} from '../otci/engine.js';

/**
 * Runs a page's effects once its markup is in the DOM, then tears them down.
 *
 * This is the same sequence the original router ran after swapping a page in.
 * Every call is a no-op when the elements it looks for aren't on the page, so
 * one hook serves the landing page, About, the department pages and Gallery —
 * exactly as the original did.
 *
 * @param {string} accent - the page's accent colour, published as --accent.
 * @param {object} [opts]
 * @param {boolean} [opts.scrollToTop=true] - match the router's scroll reset.
 * @param {any} [opts.key] - change it to re-run the effects (e.g. gallery tab).
 */
export default function usePageEffects(accent = '#008751', opts = {}) {
  const { scrollToTop = true, key } = opts;

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);

    resetStep();
    document.querySelectorAll('.band')
      .forEach((b) => b.insertAdjacentHTML('afterbegin', ribbons()));

    wireBos();      // service-charter table (BOS)
    wireGallery();  // gallery tabs
    reveals();      // scroll reveals
    startScene();   // bridge scene + panorama hero
    gvInit();       // voice-band canvas
    hwInit();       // scroll-driven process stepper
    storyInit();    // analytics story stage
    textFx();       // line-by-line text reveals
    hlFx();         // highlights hover
    btnFx();        // button + icon micro-interactions
    aboutFx();      // About statement reveal
    lbxInit();      // gallery lightbox
    dpFx();         // department page effects
    chatFx();       // department chat box
    cxFx();         // one-stop / charter explorer

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('svg.rb')
        .forEach((v) => v.pauseAnimations && v.pauseAnimations());
    }
    onScroll();

    const offFilter = bindHighlightFilter();
    if (scrollToTop) window.scrollTo(0, 0);

    return () => {
      stopScene();  // cancels the panorama + bridge rAF loops
      stopStory();  // clears the story stage timers
      offFilter();
      if (window.__gv) { window.__gv(); window.__gv = null; }          // canvas rAF
      if (window.__cxOff) { window.__cxOff(); window.__cxOff = null; }
      if (window.__abOff) { window.__abOff(); window.__abOff = null; }
      if (window.__chatT) { clearTimeout(window.__chatT); window.__chatT = 0; }
      (window.__dpOff || []).forEach((f) => f());
      window.__dpOff = [];
    };
  }, [accent, scrollToTop, key]);
}
