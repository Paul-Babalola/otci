import { useMemo } from 'react';
import { pages } from '../otci/engine.js';
import Page from './Page.jsx';

/**
 * Gallery.
 * @param {'photos'|'videos'} [view='photos'] - which tab to show.
 *
 * The tab buttons call window.__nav('#gallery/videos') — point that at your
 * router with setNavHandler(), or let it fall through to the hash.
 */
export default function GalleryPage({ view = 'photos' }) {
  const sub = view === 'videos' ? 'videos' : undefined;
  const html = useMemo(() => pages.gallery.html(sub), [sub]);
  return <Page accent={pages.gallery.accent} html={html} effectKey={view} />;
}
