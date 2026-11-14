import { useState, useEffect, useRef } from 'react';
import { api, ApiError } from '../../api/index.js';

const GRADE_LEVELS = Array.from({ length: 17 }, (_, i) => i + 1);
const IDEA_MIN = 20;

const FALLBACK_SECTORS = [
  'Service delivery', 'Digital transformation',
  'Process improvement', 'Citizen engagement',
];

const INIT = {
  title: '', category: '', idea: '',
  first: '', last: '', phone: '', email: '', dob: '',
  gender: '', lga: '',
  mda: '', officer_email: '', designation: '', grade: '',
  password: '', password2: '',
};

// ---------------------------------------------------------------- sub-components

function ErrSpan({ id, msg }) {
  if (!msg) return null;
  return (
    <span className="err" id={id} style={{ display: 'flex' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.2h.01"/>
      </svg>
      {msg}
    </span>
  );
}

function Fld({ id, label, optional, error, hint, children }) {
  return (
    <div className={`fld${error ? ' invalid' : ''}`}>
      <span className="lab">
        {label}
        {optional && <span className="opt">Optional</span>}
      </span>
      {children}
      {hint && <span className="hint" id={`${id}-h`}>{hint}</span>}
      <ErrSpan id={`${id}-e`} msg={error} />
    </div>
  );
}

function PwField({ id, name, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input
        id={id} name={name}
        type={show ? 'text' : 'password'}
        value={value} onChange={onChange}
        required autoComplete="new-password"
        placeholder="At least 8 characters"
        aria-describedby={`${id}-e`}
      />
      <button
        type="button" className="pw-t"
        onClick={() => setShow(s => !s)}
        aria-pressed={show}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------- main component

export default function IdeaFormModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState('citizen');
  const [file, setFile] = useState(null);
  const [refCode, setRefCode] = useState('');
  const [errs, setErrs] = useState({});
  const [copied, setCopied] = useState(false);
  const [f, setF] = useState(INIT);

  // Reference data loaded from the API
  const [sectors, setSectors] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [mdas, setMdas] = useState([]);
  const [activeForm, setActiveForm] = useState(null);
  const [refLoading, setRefLoading] = useState(false);

  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const abortRef = useRef(null);

  const field = (k) => (e) => setF(v => ({ ...v, [k]: e.target.value }));
  const ideaLen = f.idea.trim().length;

  // Load reference data once when the modal first opens
  useEffect(() => {
    if (!open) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setRefLoading(true);

    Promise.all([
      api.public.reference.sectors({ signal: ctrl.signal }).catch(() => []),
      api.public.reference.lgas({ signal: ctrl.signal }).catch(() => []),
      api.public.reference.mdas({ signal: ctrl.signal }).catch(() => []),
      api.public.forms.current({ signal: ctrl.signal }).catch(() => null),
    ]).then(([secs, lgaList, mdaList, form]) => {
      if (ctrl.signal.aborted) return;
      if (Array.isArray(secs) && secs.length) setSectors(secs);
      if (Array.isArray(lgaList) && lgaList.length) setLgas(lgaList);
      if (Array.isArray(mdaList) && mdaList.length) setMdas(mdaList);
      setActiveForm(form);
      setRefLoading(false);
    }).catch(() => {
      if (!ctrl.signal.aborted) setRefLoading(false);
    });

    return () => ctrl.abort();
  }, [open]);

  // Focus management
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      setTimeout(() => {
        const el = dialogRef.current?.querySelector('input, select, textarea');
        el?.focus();
      }, 20);
    } else {
      setTimeout(() => {
        setStep(1); setDone(false); setBusy(false); setRole('citizen');
        setFile(null); setErrs({}); setF(INIT); setCopied(false);
      }, 300);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus trap
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const els = [
        ...dialogRef.current.querySelectorAll(
          'button:not([disabled]),[href],input:not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])'
        ),
      ].filter(x => x.offsetParent !== null);
      if (!els.length) return;
      if (e.shiftKey && document.activeElement === els[0]) {
        e.preventDefault(); els[els.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === els[els.length - 1]) {
        e.preventDefault(); els[0].focus();
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open]);

  const handleClose = () => {
    onClose();
    setTimeout(() => triggerRef.current?.focus(), 50);
  };

  // ---- validation

  const validate1 = () => {
    const e = {};
    if (!f.title.trim())    e.title    = 'Give your idea a short title.';
    if (!f.category)        e.category = 'Choose a sector.';
    if (ideaLen < IDEA_MIN) e.idea     = `Describe the idea in at least ${IDEA_MIN} characters.`;
    return e;
  };

  const validate2 = () => {
    const e = {};
    if (!f.first.trim())                                e.first    = 'Enter your first name.';
    if (!f.last.trim())                                 e.last     = 'Enter your last name.';
    if (f.phone.replace(/\D/g, '').length < 11)        e.phone    = 'Enter an 11-digit phone number.';
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(f.email))        e.email    = 'Enter a valid email address.';
    if (!f.dob)                                         e.dob      = 'Enter your date of birth.';
    if (!f.gender)                                      e.gender   = 'Choose an option.';
    if (!f.lga)                                         e.lga      = 'Choose your LGA.';
    if (role === 'ps') {
      if (!f.mda)                                       e.mda          = 'Choose the MDA you work in.';
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(f.officer_email))
                                                        e.officer_email = "Enter your account officer’s email.";
      if (!f.designation.trim())                        e.designation  = 'Enter your designation.';
      if (!f.grade)                                     e.grade        = 'Choose your grade level.';
    }
    if (!file)                                          e.idFile   = 'Upload a photo or scan of your ID document.';
    if (f.password.length < 8)                         e.password = 'Use at least 8 characters.';
    if (f.password !== f.password2)                    e.password2 = "Passwords don't match.";
    return e;
  };

  // ---- step handlers

  const goStep2 = () => {
    const e = validate1();
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({});
    setStep(2);
    setTimeout(() => {
      dialogRef.current?.querySelector('.ia-acc input, .ia-acc select')?.focus();
    }, 20);
  };

  const goStep1 = () => {
    setErrs({});
    setStep(1);
    setTimeout(() => dialogRef.current?.querySelector('.ia-idea input')?.focus(), 20);
  };

  const handleSubmit = async () => {
    if (busy) return;
    const e = validate2();
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({});
    setBusy(true);

    try {
      const lgaObj = lgas.find(l => l.name === f.lga);
      const mdaObj = mdas.find(m => m.name === f.mda);

      const baseReg = {
        first_name: f.first,
        last_name: f.last,
        phone: f.phone.replace(/\D/g, ''),
        email: f.email,
        date_of_birth: f.dob,
        gender: f.gender === 'Female' ? 'female' : f.gender === 'Male' ? 'male' : 'other',
        lga_id: lgaObj?.id ?? 1,
        means_of_id_type: 'national_id',
        means_of_id: file,
        password: f.password,
        password_confirmation: f.password2,
      };

      let authResult;
      if (role === 'ps') {
        authResult = await api.public.auth.registerCivilServant({
          ...baseReg,
          mda_id: mdaObj?.id ?? 1,
          account_officer_email: f.officer_email,
          account_officer_role: f.designation,
          designation: f.designation,
          grade_level: parseInt(f.grade, 10),
        });
      } else {
        authResult = await api.public.auth.registerCitizen(baseReg);
      }

      // The register response may include the current active form
      let form = authResult?.form ?? activeForm;
      if (!form) form = await api.public.forms.current();

      if (!form) {
        // Registration succeeded but no active submission form
        setRefCode('REG-' + Date.now().toString(36).toUpperCase());
        setDone(true);
        return;
      }

      // Map the UI's static fields to whatever dynamic fields the form has.
      // Matching strategy: sector field by template_key, then first short_text
      // = title, first long_text = description.
      const answers = [];
      const usedCodes = new Set();

      for (const fld of (form.fields || [])) {
        if (usedCodes.has(fld.code)) continue;

        if (fld.template_key === 'sector') {
          const match = sectors.find(s => s.name === f.category);
          const other = sectors.find(s => s.is_others);
          const target = match || other;
          if (target) {
            answers.push({ field_code: fld.code, answer: target.code });
            usedCodes.add(fld.code);
          }
        } else if (fld.field_type === 'short_text' && !usedCodes.has('__title')) {
          answers.push({ field_code: fld.code, answer: f.title });
          usedCodes.add(fld.code);
          usedCodes.add('__title');
        } else if (fld.field_type === 'long_text' && !usedCodes.has('__desc')) {
          answers.push({ field_code: fld.code, answer: f.idea });
          usedCodes.add(fld.code);
          usedCodes.add('__desc');
        }
      }

      // If we fell back to the "Others" sector, pass the original category name
      const usedOtherSector = answers.some(a => {
        const s = sectors.find(x => x.code === a.answer);
        return s?.is_others;
      });

      const result = await api.public.forms.submit(form.code, {
        answers,
        sector_other: usedOtherSector ? f.category : null,
      });

      setRefCode(result?.code || 'OTCI-' + Math.random().toString(36).slice(2, 8).toUpperCase());
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isValidation) {
          const ev = err.errors || {};
          const mapped = {};
          if (ev.first_name)    mapped.first          = ev.first_name[0];
          if (ev.last_name)     mapped.last           = ev.last_name[0];
          if (ev.email)         mapped.email          = ev.email[0];
          if (ev.phone)         mapped.phone          = ev.phone[0];
          if (ev.password)      mapped.password       = ev.password[0];
          if (ev.lga_id)        mapped.lga            = ev.lga_id[0];
          if (ev.mda_id)        mapped.mda            = ev.mda_id[0];
          if (ev.date_of_birth) mapped.dob            = ev.date_of_birth[0];
          if (ev.account_officer_email) mapped.officer_email = ev.account_officer_email[0];
          setErrs(Object.keys(mapped).length ? mapped : { _api: err.message });
        } else {
          setErrs({ _api: err.message });
        }
      } else if (err?.name !== 'AbortError') {
        setErrs({ _api: 'Network error. Please check your connection and try again.' });
      }
    } finally {
      setBusy(false);
    }
  };

  const copyRef = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800); };
    try { navigator.clipboard.writeText(refCode).then(done, done); } catch (_) { done(); }
  };

  // Category chips: use live sectors from API; fall back to hardcoded list while loading
  const categoryItems = sectors.length > 0
    ? sectors.filter(s => !s.is_others)
    : FALLBACK_SECTORS.map(name => ({ name }));

  // LGA options: use live list; fall back to empty (user sees "Loading…")
  const lgaOptions = lgas.length > 0 ? lgas : [];

  // MDA options
  const mdaOptions = mdas.length > 0 ? mdas : [];

  if (!open) return null;

  return (
    <div
      className="modal open"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="dlg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="idea-modal-title"
        ref={dialogRef}
      >
        <button className="x" type="button" aria-label="Close" onClick={handleClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>

        <div className="dlg-body">

        {/* ---- header ---- */}
        <div className="mh">
          <span className="mh-ic" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>
            </svg>
          </span>
          <div className="mh-tx">
            <p className="mh-k">C&amp;I · Ideas Day</p>
            <h3 id="idea-modal-title">Ideas Day Innovation Competition</h3>
            <p className="mh-s">
              Tell us your idea first. Next, you'll add your details so we can reach you.
            </p>
          </div>
        </div>

        {/* ---- step indicator ---- */}
        {!done && (
          <ol className="ia-steps" aria-label="Progress">
            <li
              className={step === 1 ? 'on' : 'done'}
              aria-current={step === 1 ? 'step' : undefined}
            >
              <b>1</b>Your idea
            </li>
            <li
              className={step === 2 ? 'on' : ''}
              aria-current={step === 2 ? 'step' : undefined}
            >
              <b>2</b>Your details
            </li>
          </ol>
        )}

        {/* ---- step 1: idea ---- */}
        {!done && step === 1 && (
          <form
            className="form mform ia-idea"
            noValidate
            onSubmit={e => { e.preventDefault(); goStep2(); }}
          >
            <Fld id="ia-title" label="Give your idea a title" error={errs.title}>
              <input
                id="ia-title" name="title"
                value={f.title} onChange={field('title')}
                required placeholder="For example, one form for every permit"
                aria-describedby="ia-title-e"
              />
            </Fld>

            <div className={`fld${errs.category ? ' invalid' : ''}`}>
              <span className="lab" id="ia-cat-l">Which sector does it address?</span>
              <div
                role="radiogroup" aria-labelledby="ia-cat-l" aria-describedby="ia-cat-e"
                style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
              >
                {refLoading && !categoryItems.length
                  ? <span className="hint">Loading sectors…</span>
                  : categoryItems.map(item => (
                    <label key={item.name} className="chip">
                      <input
                        type="radio" name="category" value={item.name}
                        checked={f.category === item.name}
                        onChange={field('category')}
                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                      />
                      {item.name}
                    </label>
                  ))
                }
              </div>
              <ErrSpan id="ia-cat-e" msg={errs.category} />
            </div>

            <div className={`fld${errs.idea ? ' invalid' : ''}`}>
              <span className="lab">Describe the idea</span>
              <textarea
                id="ia-desc" name="idea" rows="5"
                value={f.idea} onChange={field('idea')}
                required placeholder="The problem, your idea and who it helps"
                aria-describedby="ia-desc-h ia-desc-e"
              />
              <span
                className={`hint cnt${ideaLen >= IDEA_MIN ? ' ok' : ''}`}
                id="ia-desc-h"
                aria-live="polite"
              >
                {ideaLen >= IDEA_MIN ? `${ideaLen} characters` : `${ideaLen} / ${IDEA_MIN}`}
              </span>
              <ErrSpan id="ia-desc-e" msg={errs.idea} />
            </div>

            <div className="mact mact-b sticky">
              <div className="mact-b">
                <button type="submit" className="mbtn">
                  <span className="mb-t">Continue</span>
                </button>
                <button type="button" className="mbtn ghost" onClick={handleClose}>
                  Cancel
                </button>
              </div>
              <span className="mb-live sr" role="status" aria-live="polite">
                Next, add your details. It takes about two minutes.
              </span>
            </div>
          </form>
        )}

        {/* ---- step 2: details ---- */}
        {!done && step === 2 && (
          <form
            className={`form mform ia-acc${busy ? ' busy' : ''}`}
            noValidate
            onSubmit={e => { e.preventDefault(); handleSubmit(); }}
          >
            {/* role toggle */}
            <div className="fld">
              <span className="lab" id="ia-role-l">I'm entering as</span>
              <div
                className={`ia-seg${role === 'ps' ? ' r2' : ''}`}
                role="radiogroup" aria-labelledby="ia-role-l"
              >
                <span className="ia-thumb" aria-hidden="true" />
                <label>
                  <input
                    type="radio" name="role" value="citizen"
                    checked={role === 'citizen'} onChange={() => setRole('citizen')}
                  />
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                       aria-hidden="true">
                    <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>
                  </svg>
                  <span>Citizen</span>
                </label>
                <label>
                  <input
                    type="radio" name="role" value="ps"
                    checked={role === 'ps'} onChange={() => setRole('ps')}
                  />
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                       strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="7" width="18" height="13" rx="2"/>
                    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M9 7v13M15 7v13"/>
                  </svg>
                  <span>Public servant</span>
                </label>
              </div>
            </div>

            {/* name */}
            <div className="two">
              <Fld id="ia-first" label="First name" error={errs.first}>
                <input
                  id="ia-first" name="first"
                  value={f.first} onChange={field('first')}
                  required placeholder="Ada" autoComplete="given-name"
                  aria-describedby="ia-first-e"
                />
              </Fld>
              <Fld id="ia-last" label="Last name" error={errs.last}>
                <input
                  id="ia-last" name="last"
                  value={f.last} onChange={field('last')}
                  required placeholder="Okafor" autoComplete="family-name"
                  aria-describedby="ia-last-e"
                />
              </Fld>
            </div>

            {/* contact */}
            <div className="two">
              <Fld id="ia-phone" label="Phone number" error={errs.phone}>
                <input
                  id="ia-phone" name="phone" type="tel"
                  value={f.phone} onChange={field('phone')}
                  required placeholder="0801 234 5678"
                  inputMode="tel" autoComplete="tel"
                  aria-describedby="ia-phone-e"
                />
              </Fld>
              <Fld id="ia-email" label="Email address" error={errs.email}>
                <input
                  id="ia-email" name="email" type="email"
                  value={f.email} onChange={field('email')}
                  required placeholder="ada@example.com" autoComplete="email"
                  aria-describedby="ia-email-e"
                />
              </Fld>
            </div>

            {/* dob + gender */}
            <div className="two">
              <Fld id="ia-dob" label="Date of birth" error={errs.dob}>
                <input
                  id="ia-dob" name="dob" type="date"
                  value={f.dob} onChange={field('dob')}
                  required max={new Date().toISOString().split('T')[0]}
                  aria-describedby="ia-dob-e"
                />
              </Fld>
              <Fld id="ia-gender" label="Gender" error={errs.gender}>
                <div className="sel">
                  <select
                    id="ia-gender" value={f.gender} onChange={field('gender')}
                    required aria-describedby="ia-gender-e"
                  >
                    <option value="">Choose one</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </Fld>
            </div>

            {/* LGA */}
            <Fld id="ia-lga" label="Local Government Area" error={errs.lga}>
              <div className="sel">
                <select
                  id="ia-lga" value={f.lga} onChange={field('lga')}
                  required aria-describedby="ia-lga-e"
                >
                  <option value="">{refLoading ? 'Loading…' : 'Choose your LGA'}</option>
                  {lgaOptions.map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>
            </Fld>

            {/* public servant section */}
            {role === 'ps' && (
              <div className="ia-ps">
                <p className="ia-gl">Service details</p>
                <Fld id="ia-mda" label="MDA" error={errs.mda}>
                  <div className="sel">
                    <select
                      id="ia-mda" value={f.mda} onChange={field('mda')}
                      required aria-describedby="ia-mda-e"
                    >
                      <option value="">{refLoading ? 'Loading…' : 'Choose your MDA'}</option>
                      {mdaOptions.map(m => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </Fld>
                <div className="ia-three">
                  <Fld id="ia-ofemail" label="Account officer email" error={errs.officer_email}>
                    <input
                      id="ia-ofemail" name="officer_email" type="email"
                      value={f.officer_email} onChange={field('officer_email')}
                      required placeholder="officer@lagosstate.gov.ng"
                      aria-describedby="ia-ofemail-e"
                    />
                  </Fld>
                  <Fld id="ia-desig" label="Designation" error={errs.designation}>
                    <input
                      id="ia-desig" name="designation"
                      value={f.designation} onChange={field('designation')}
                      required placeholder="Director of Finance"
                      aria-describedby="ia-desig-e"
                    />
                  </Fld>
                  <Fld id="ia-grade" label="Grade level" error={errs.grade}>
                    <div className="sel">
                      <select
                        id="ia-grade" value={f.grade} onChange={field('grade')}
                        required aria-describedby="ia-grade-e"
                      >
                        <option value="">GL</option>
                        {GRADE_LEVELS.map(g => (
                          <option key={g} value={String(g)}>
                            GL {String(g).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Fld>
                </div>
              </div>
            )}

            {/* identity */}
            <p className="ia-gl">Identity</p>

            {/* file upload */}
            <div className={`fld${errs.idFile ? ' invalid' : ''}`}>
              <span className="lab" id="ia-file-l">Upload ID document</span>
              <label className={`fb-drop ia-drop${file ? ' has' : ''}`}>
                <input
                  type="file" name="idFile"
                  required accept="image/jpeg,image/png,.pdf"
                  onChange={e => setFile(e.target.files[0] || null)}
                  aria-labelledby="ia-file-l"
                  aria-describedby="ia-file-h ia-file-e"
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
                <span className="ia-ic" aria-hidden="true">
                  <svg className="up" width="20" height="20" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                       strokeLinejoin="round">
                    <path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>
                  </svg>
                  <svg className="ok" width="20" height="20" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                       strokeLinejoin="round">
                    <path d="m5 12 5 5 9-10"/>
                  </svg>
                </span>
                <span className="ia-tx">
                  <span className="ia-fn">
                    {file ? file.name : "National ID, passport, driver’s licence or voter’s card"}
                  </span>
                  <small id="ia-file-h">JPG, PNG or PDF · up to 10 MB</small>
                </span>
                <span className="ia-br" aria-hidden="true">Browse</span>
              </label>
              <ErrSpan id="ia-file-e" msg={errs.idFile} />
            </div>

            {/* passwords */}
            <div className="two">
              <Fld id="ia-pw" label="Password" error={errs.password}>
                <PwField
                  id="ia-pw" name="password"
                  value={f.password} onChange={field('password')}
                />
              </Fld>
              <Fld id="ia-pw2" label="Confirm password" error={errs.password2}>
                <PwField
                  id="ia-pw2" name="password2"
                  value={f.password2} onChange={field('password2')}
                />
              </Fld>
            </div>

            {/* API-level error */}
            {errs._api && (
              <p className="err" role="alert" style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
                     aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.2h.01"/>
                </svg>
                {errs._api}
              </p>
            )}

            {/* actions */}
            <div className="mact mact-b sticky">
              <div className="mact-b">
                <button type="submit" className="mbtn" disabled={busy}>
                  <span className="mb-sp" aria-hidden="true" />
                  <span className="mb-t">{busy ? 'Submitting…' : 'Submit idea'}</span>
                </button>
                <button
                  type="button" className="mbtn ghost"
                  onClick={goStep1} disabled={busy}
                >
                  Back
                </button>
              </div>
              <span className="mb-live sr" role="status" aria-live="polite">
                {busy ? 'Sending your idea…' : 'We only use these details for Ideas Day.'}
              </span>
            </div>
          </form>
        )}

        {/* ---- success ---- */}
        {done && (
          <div className="msucc show" tabIndex={-1}>
            <svg className="ok-ic" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="18"/>
              <path d="M14 22l5.5 5.5 11-11"/>
            </svg>
            <h3>Idea submitted</h3>
            <p>Thank you. We'll email you when the C&amp;I team has reviewed it.</p>
            <div className="ref-row">
              <span className="ref-l">Reference</span>
              <code className="ref">{refCode}</code>
              <button
                type="button"
                className={`mbtn ghost${copied ? ' ok' : ''}`}
                onClick={copyRef}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="mact mact-b sticky">
              <div className="mact-b">
                <button type="button" className="mbtn" onClick={handleClose}>Done</button>
              </div>
            </div>
          </div>
        )}

        </div>{/* dlg-body */}
      </div>
    </div>
  );
}
