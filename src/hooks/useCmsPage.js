import { useEffect, useState } from 'react';
import { getCmsPage, loadCmsPage } from '../otci/cmsHome.js';

/** CMS content for a page id, or null while loading / when unreachable. */
export default function useCmsPage(pid) {
  const [cms, setCms] = useState(getCmsPage(pid));
  useEffect(() => {
    if (getCmsPage(pid)) { setCms(getCmsPage(pid)); return; }
    let on = true;
    loadCmsPage(pid).then((d) => { if (on && d) setCms(d); });
    return () => { on = false; };
  }, [pid]);
  return cms;
}
