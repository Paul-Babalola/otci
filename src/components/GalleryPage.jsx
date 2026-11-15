import { useState, useEffect, useMemo } from 'react';
import { pages } from '../otci/engine.js';
import { cmsGallery, cmsMediaUrl } from '../api/index.js';
import Page from './Page.jsx';

export default function GalleryPage({ view = 'photos' }) {
  const sub = view === 'videos' ? 'videos' : undefined;
  const [galleryData, setGalleryData] = useState(null);

  useEffect(() => {
    cmsGallery.list().then(async (data) => {
      const folders = (data?.folders || []).filter((f) => f.is_visible !== false);
      if (!folders.length) return;
      const details = await Promise.all(folders.map((f) => cmsGallery.get(f.id).catch(() => null)));
      const allPhotos = [];
      details.forEach((detail) => {
        if (!detail) return;
        (detail.images || [])
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .forEach((im) => { const url = cmsMediaUrl(im.url || ''); if (url) allPhotos.push(url); });
      });
      if (allPhotos.length) {
        const primary = folders[0];
        setGalleryData({
          photos: allPhotos,
          album: { title: primary.title || '', desc: primary.description || '' },
        });
      }
    }).catch(() => {});
  }, []);

  const html = useMemo(() => pages.gallery.html(sub, galleryData), [sub, galleryData]);
  return <Page accent={pages.gallery.accent} html={html} effectKey={`gallery:${view}:${galleryData ? 'cms' : 'base'}`} />;
}
