/** Photo viewer used by the gallery. Wired by lbxInit() in usePageEffects. */
export default function Lightbox() {
  return (
    <div className="lbx" id="lbx" role="dialog" aria-modal="true" aria-label="Photo viewer" hidden>
      <div className="lbx-bar">
        <span className="lbx-c" id="lbxC" aria-live="polite">1 / 6</span>
        <span className="lbx-t">Ideas Day Innovation Competition</span>
        <button type="button" className="lbx-x" data-lbx="close" aria-label="Close viewer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="lbx-st">
        <div className="lbx-img ph img" id="lbxI" role="img" aria-label="Photo" />
        <button type="button" className="lbx-n lbx-p" data-lbx="prev" aria-label="Previous photo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <button type="button" className="lbx-n lbx-nx" data-lbx="next" aria-label="Next photo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <div className="lbx-th" id="lbxT" />
    </div>
  );
}
