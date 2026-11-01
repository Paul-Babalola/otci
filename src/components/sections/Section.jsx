/**
 * Thin wrapper that drops a section's generated markup into the page.
 *
 * The landing page's artwork (the Lagos panorama, the isometric city, the
 * vehicles, the ribbons) is produced by procedural generators that build SVG
 * strings — hundreds of paths computed at runtime. Those generators are ported
 * verbatim in src/otci/engine.js, so the output here is byte-identical to the
 * original artifact. `display: contents` keeps the wrapper out of layout.
 */
export default function Section({ html, className }) {
  return (
    <div
      className={className}
      style={{ display: 'contents' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
