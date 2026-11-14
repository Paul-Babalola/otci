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
      const folder = folders[0];
      const detail = await cmsGallery.get(folder.id);
      const photos = (detail?.images || [])
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((im) => cmsMediaUrl(im.url || ''))
        .filter(Boolean);
      if (photos.length) {
        setGalleryData({
          photos,
          album: { title: folder.title || '', desc: folder.description || '' },
        });
      }
    }).catch(() => {});
  }, []);

  const html = useMemo(() => pages.gallery.html(sub, galleryData), [sub, galleryData]);
  return <Page accent={pages.gallery.accent} html={html} effectKey={`gallery:${view}:${galleryData ? 'cms' : 'base'}`} />;
}
