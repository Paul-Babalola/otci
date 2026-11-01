import { useEffect } from 'react';
import { bindModal } from '../../otci/engine.js';

/** Host for the feedback / idea / service-charter dialogs. */
export default function Modal() {
  useEffect(() => bindModal(), []);
  return (
    <div className="modal" id="modal">
      <div className="dlg" role="dialog" aria-modal="true" aria-labelledby="mTitle">
        <button className="x" type="button" aria-label="Close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div id="mBody" />
      </div>
    </div>
  );
}
