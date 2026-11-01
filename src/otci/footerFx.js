/* Footer clock, reveal and newsletter form — ported verbatim. */
export function mountFooterFx(f){if(!f)return ()=>{};
 /* The clock restarts on every mount; the DOM listeners below are wired once
    per footer element so a dev-mode double mount can't double-bind them. */
 if('IntersectionObserver' in window){const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){f.classList.add('in');o.disconnect()}}),{threshold:.2});o.observe(f.querySelector('.f-mark'))}else f.classList.add('in');if(matchMedia('(prefers-reduced-motion: reduce)').matches){const sc=f.querySelector('.fc-scene');sc&&sc.pauseAnimations&&sc.pauseAnimations()}
 {const ck=()=>{const d=new Date(Date.now()+3600e3),h=d.getUTCHours(),m=String(d.getUTCMinutes()).padStart(2,'0'),t=`${h%12||12}:${m} ${h<12?'AM':'PM'}`;f.querySelectorAll('.fClk').forEach(e=>e.textContent=t);f.querySelectorAll('.fYr').forEach(e=>e.textContent=d.getUTCFullYear())};ck();f._ck=setInterval(ck,15000)}
 const fm=document.getElementById('ftNews'),em=document.getElementById('ftEmail'),msg=document.getElementById('ftMsg');
 if(!fm||!em||!msg||f._bf)return ()=>{clearInterval(f._ck)};
 f._bf=1;
 fm.addEventListener('submit',e=>{e.preventDefault();const v=em.value.trim();if(!/^\S+@\S+\.\S+$/.test(v)){fm.classList.remove('shake');void fm.offsetWidth;fm.classList.add('shake');msg.className='ft-msg err';msg.textContent='Enter a valid email address, like name@example.com.';em.focus();return}
  msg.className='ft-msg ok';msg.textContent='You’re subscribed. The next briefing will land in your inbox.';fm.classList.remove('done');void fm.offsetWidth;fm.classList.add('done');fm.reset()});
 em.addEventListener('input',()=>{if(msg.classList.contains('err')){msg.textContent='';msg.className='ft-msg'}});
 {const tt=document.getElementById('toTop');tt&&tt.addEventListener('click',()=>scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));}

 return ()=>{clearInterval(f._ck)};
}
