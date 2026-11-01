import { useEffect, useRef } from 'react';
import { mountStreet } from '../../otci/street.js';

/** Animated street strip that sits between the page and the footer. */
export default function StreetScene() {
  const ref = useRef(null);
  useEffect(() => mountStreet(ref.current), []);
  return <div className="street" id="street" ref={ref} aria-hidden="false" />;
}
