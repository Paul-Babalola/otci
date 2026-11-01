/** Floating "share feedback" button. */
export default function FeedbackFab({ onClick }) {
  return (
    <button className="fab" data-act="feedback" aria-label="Share feedback" onClick={onClick}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <path d="M4 5h16v11H9l-5 4z" />
        <path d="M8 9h8M8 12h5" />
      </svg>
    </button>
  );
}
