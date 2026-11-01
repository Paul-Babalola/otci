import { useEffect, useRef } from 'react';
import { mountFooterFx } from '../otci/footerFx.js';
import logo from '../assets/otci-logo.jpg';

/**
 * Site footer. Markup is a 1:1 JSX conversion of the original.
 * The live Lagos clock, reveal-on-scroll and newsletter form come from
 * mountFooterFx(), ported verbatim from the artifact.
 */
export default function Footer() {
  const ref = useRef(null);
  useEffect(() => mountFooterFx(ref.current), []);

  return (
    <footer className="ft3" id="ft3" data-v="c" ref={ref}>
     <div className="wrap">
      <div className="fc-row"><div className="fv fc-top" data-for="c">
       <p className="ft-greet f-greet" id="ftGreet">Lagos, good evening</p>
       <h2 className="fc-h">Taking governance to greater heights.</h2>
       <p className="fc-clock"><span className="f-dot" aria-hidden="true"></span><span className="fClk">--:--</span> in Lagos</p>
      </div>
      <div className="fc-news"><form className="f-news" id="ftNews" noValidate aria-labelledby="fnT">
        <div className="fn-h"><span className="fn-ic" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6 8.5-6" /></svg></span><div><p className="f-nh" id="fnT">The OTCI briefing</p><p className="fn-t">Reform updates and Ideas Day news, in your inbox.</p></div></div>
        <label className="sr" htmlFor="ftEmail">Email address</label>
        <div className="ft-in"><input id="ftEmail" type="email" placeholder="name@example.com" autoComplete="email" aria-describedby="ftMsg" /><button className="f-sub" type="submit">Subscribe<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button></div>
        <p className="fn-n">Unsubscribe anytime.</p>
        <span className="ft-msg" id="ftMsg" role="status" aria-live="polite"></span>
        <div className="fn-ok"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" /><path d="M12.5 20.5l5 5 10-10" /></svg><div><b>You’re subscribed</b><span>The next briefing will land in your inbox.</span></div></div>
       </form></div></div>
      <div className="f-mid">
       <div className="f-brand"><div className="logo"><span className="ft-tile"><img className="logo-img" src={logo} alt="" /></span><span className="wm"><b>OTCI</b><small>Office of Transformation,<br />Creativity &amp; Innovation</small></span></div>
        <p className="about">Driving reform, creativity and service excellence across Lagos State’s Public Service.</p></div>
       <div className="f-cols">
        <div><h5>About</h5><ul><li><a href="#about">History</a></li><li><a href="#about">Responsibilities</a></li><li><a href="#about">Departments and units</a></li><li><a href="#about">Principal officers</a></li></ul></div>
        <div className="f-cd"><h5>Departments</h5><ul><li><a href="#ci">Creativity &amp; Innovation</a></li><li><a href="#bos">Branding, One-Stop &amp; Service Charter</a></li><li><a href="#ms">Management Services</a></li><li><a href="#reforms">Reforms</a></li></ul></div>
        <div><h5>Get involved</h5><ul><li><button type="button" data-act="feedback">Share feedback</button></li><li><button type="button" data-act="idea">Submit an idea</button></li><li><a href="#bos/standards">Find a service charter</a></li><li><a href="#ms/contact">Contact us</a></li></ul></div>
        <div><h5>Gallery</h5><ul><li><a href="#gallery">Photo gallery</a></li><li><a href="#gallery/videos">Video gallery</a></li><li><a href="#home/highlights">Event highlights</a></li></ul></div>
       </div>
   
      </div>
     </div>
     <div className="f-mark" aria-hidden="true">
        <svg className="fc-scene fv" data-for="c" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice"><g fill="none" stroke="#D9EDE5" strokeLinecap="round"><path className="fb" d="M703 300 L708 60 L690 4 M737 300 L732 60 L750 4 M694 22 H746 M698 40 H742" strokeWidth="2.4" /><g className="fb" strokeWidth="1" opacity=".7"><line x1="708" y1="60" x2="560" y2="300" /><line x1="708" y1="82" x2="490" y2="300" /><line x1="708" y1="104" x2="420" y2="300" /><line x1="708" y1="126" x2="350" y2="300" /><line x1="708" y1="148" x2="280" y2="300" /><line x1="708" y1="170" x2="210" y2="300" /><line x1="708" y1="192" x2="140" y2="300" /><line x1="732" y1="60" x2="880" y2="300" /><line x1="732" y1="82" x2="950" y2="300" /><line x1="732" y1="104" x2="1020" y2="300" /><line x1="732" y1="126" x2="1090" y2="300" /><line x1="732" y1="148" x2="1160" y2="300" /><line x1="732" y1="170" x2="1230" y2="300" /><line x1="732" y1="192" x2="1300" y2="300" /></g><path className="fb" d="M0 300 L1440 300" strokeWidth="1.4" /></g><g stroke="#D9EDE5" strokeLinecap="round" fill="none"><line x1="0" y1="242" x2="1440" y2="242" strokeWidth="1.6" opacity=".7" /><line x1="0" y1="260" x2="1440" y2="260" strokeWidth="1" opacity=".35" /><g className="fc-shim" opacity=".35"><path d="M80 276 h40" strokeWidth=".8" /><path d="M260 284 h26" strokeWidth=".8" /><path d="M420 272 h34" strokeWidth=".8" /><path d="M980 280 h30" strokeWidth=".8" /><path d="M1150 274 h44" strokeWidth=".8" /><path d="M1320 286 h24" strokeWidth=".8" /><path d="M600 290 h20" strokeWidth=".8" /><path d="M860 292 h28" strokeWidth=".8" /></g></g><g className="fc-lights"><circle r="2.4" fill="#FFF1C2"><animateMotion dur="9s" begin="-0s" repeatCount="indefinite" path="M-20 247 H1460" /></circle><circle r="2.4" fill="#FFF1C2"><animateMotion dur="9s" begin="-3.2s" repeatCount="indefinite" path="M-20 247 H1460" /></circle><circle r="2.2" fill="#FFF1C2"><animateMotion dur="11s" begin="-6s" repeatCount="indefinite" path="M-20 247 H1460" /></circle><circle r="2.2" fill="#FF7A6B"><animateMotion dur="10s" begin="-1s" repeatCount="indefinite" path="M1460 255 H-20" /></circle><circle r="2.2" fill="#FF7A6B"><animateMotion dur="10s" begin="-5.5s" repeatCount="indefinite" path="M1460 255 H-20" /></circle><circle r="2" fill="#FF7A6B"><animateMotion dur="13s" begin="-8s" repeatCount="indefinite" path="M1460 255 H-20" /></circle></g></svg>
     </div>
     <div className="wrap f-bot">
      <span>© <span className="fYr">2026</span> Office of Transformation, Creativity &amp; Innovation, Lagos State</span>
      <nav className="f-soc" aria-label="Social media"><a href="#">Instagram</a><a href="#">Facebook</a><a href="#">X</a><a href="#">YouTube</a></nav>
      <span className="f-clk"><span className="fClk">--:--</span> WAT</span>
      <button className="totop" id="toTop" type="button">Back to top<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg></button>
     </div>
    </footer>

  );
}
