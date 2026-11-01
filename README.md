# OTCI — React port

Navbar, landing page and footer from the OTCI artifact, rebuilt as React
components. Visually and behaviourally identical to the original: same
animations, same scroll choreography, same canvas, same artwork, same assets.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Using it in your app

```jsx
import { Navbar, LandingPage, StreetScene, Footer, Modal, Toast, FeedbackFab,
         useScrollProgress, useNavPill } from './otci-landing/src';
import './otci-landing/src/styles/site.css';

export default function Page() {
  useScrollProgress();
  useNavPill();
  return (
    <>
      <Navbar links={{ home: '/', about: '/about', gallery: '/gallery' }} />
      <LandingPage />
      <StreetScene />
      <Footer />
      <FeedbackFab />
      <Modal />
      <Toast />
    </>
  );
}
```

`Modal` and `Toast` are the hosts for the feedback / idea dialogs and status
messages. Leave them out and the "Share feedback" buttons have nowhere to open.

Sections are independent — compose your own page if you'd rather:

```jsx
import { LagosHero, Impact, News, useLandingEffects } from './otci-landing/src';

function Custom() {
  useLandingEffects();            // boots the scenes, reveals and counters
  return <main id="app"><LagosHero /><Impact /><News /></main>;
}
```

## Layout

```
src/
  components/
    Navbar.jsx              1:1 JSX conversion of the original header
    Footer.jsx              1:1 JSX conversion of the original footer
    LandingPage.jsx         composes the eight sections
    sections/
      Section.jsx           shared wrapper (display: contents)
      LagosHero.jsx         animated Lagos panorama, weather toggle, service search
      Mandate.jsx           "four departments, one mandate"
      Process.jsx           scroll-driven consult → reform → innovate → deliver
      Audience.jsx          three ways in
      Impact.jsx            impact stats, analytics story stage, counters
      Highlights.jsx        highlights with cursor-following preview
      VoiceBand.jsx         citizen-feedback band (canvas waveform)
      News.jsx              news & updates
    ui/                     Modal, Toast, FeedbackFab, StreetScene
  hooks/
    useLandingEffects.js    mount/teardown for the landing page's effects
    useScrollProgress.js    --sp custom property
    useNavPill.js           sliding nav pill
    useHighlightPreview.js  cursor-following photo preview
  otci/
    engine.js               the artifact's script, ported to an ES module
    street.js               street scene between page and footer
    footerFx.js             footer clock, reveal, newsletter form
  styles/site.css           the original stylesheet, photos swapped for real files
  assets/otci-logo.jpg      imported by Navbar and Footer
public/assets/*.jpg         the 11 photos, referenced from CSS as /assets/*.jpg
```

## How the port works, and why

Navbar and Footer are hand-written markup in the original, so they are true JSX —
every attribute converted, no `dangerouslySetInnerHTML`.

The landing page is different. Its artwork is **procedurally generated**: the
Lagos skyline, the traffic, the isometric city, the cable-stayed bridge, the
ribbons and the vehicles are built at runtime by functions that compute SVG
strings — over a thousand paths, many of them randomised per load. Those
generators are ported verbatim into `src/otci/engine.js` (converted from the
original IIFE to an ES module, logic untouched), and each section component
renders their output. That is what makes the recreation exact rather than
approximate: translating a thousand computed paths into JSX by hand would have
introduced drift, and the generators are already cleanly separated from the
behaviour.

So: React owns composition, lifecycle and teardown; the ported engine owns the
art. Each section is a real component you can reorder, drop or render on its
own, and every animation loop is cancelled on unmount.

## What changed from the original

- The hash router is gone. `Navbar` takes a `links` prop so you can point it at
  your own routes; the original `#about`, `#gallery` etc. are the defaults.
- The global `a[href^="#"]` click interceptor is gone, so your router handles
  links normally.
- Import-time DOM lookups (`#modal`, `#burger`, `#depMenu`) are lazy or moved
  into mount functions, since React mounts after module evaluation.
- Photos were pulled out of the CSS (they were base64-inlined) into
  `public/assets/`. The stylesheet went from 1.2 MB to 283 KB.
- Imperative mounts are guarded against double-invoke, so `React.StrictMode`
  in development doesn't double-bind listeners or duplicate scenes.

## Verified

Built output diffed against the original page in a headless browser at 1440px:

| View | Differing pixels |
|---|---|
| Process section | 0.00% |
| Highlights | 0.00% |
| Footer | 0.02% (the animated bridge lights) |
| Hero | 0.52% (live clock, typewriter placeholder, randomised traffic) |

Same `scrollHeight` (14035px), same eight sections, no console errors, no
horizontal overflow at 390px, and clean under StrictMode's double mount.

## Two things to know

**There is no video on the landing page.** The only non-SVG motion is one
`<canvas>` in the voice band; everything else is animated SVG and CSS. The
video gallery lives on the `#gallery` route, which wasn't part of this export —
say the word and I'll port that too.

**The forms are still client-side only.** Validation, character counts, success
states and the newsletter form all work; nothing is submitted anywhere. Wire
`ACT` in `src/otci/engine.js` and the footer form in `src/otci/footerFx.js` to
your endpoints.

The engine also still carries the bridge-scene code (`bridgeScene`, `carSVG`,
`startScene`'s `#scene` branch) that the old hero used. The landing page doesn't
render it — `startScene()` is what boots the panorama — but it's left in place
rather than cut, in case you want that hero back.
