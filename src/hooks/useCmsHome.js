import { useEffect, useState } from 'react';
import { getCmsHome, loadCmsHome } from '../otci/cmsHome.js';

/** CMS home page content, or null while loading / when the API is unreachable. */
export default function useCmsHome() {
  const [cms, setCms] = useState(getCmsHome());
  useEffect(() => {
    if (cms) return;
    let on = true;
    loadCmsHome().then((d) => { if (on && d) setCms(d); });
    return () => { on = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return cms;
}
