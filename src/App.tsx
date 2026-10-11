import { useState } from 'react';
import { evaluateEligibility, type EligibilityResult } from './rules/policyEngine';

type Details = { name: string; age: string; mobile: string; pincode: string; companyType: string; monthlySalary: string; existingEmis: number; hasEmis: boolean; requestedAmount: string; tenure: string };
const initial: Details = { name: '', age: '', mobile: '', pincode: '', companyType: 'MNC', monthlySalary: '', existingEmis: 0, hasEmis: false, requestedAmount: '', tenure: '' };
const storageKey = 'dhanbazaar-v1';
const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
function load(): Details {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!saved || typeof saved !== 'object') return initial;
    const result = { ...initial };
    for (const key of ['name', 'age', 'mobile', 'pincode', 'companyType', 'monthlySalary', 'requestedAmount', 'tenure'] as const) if (typeof saved[key] === 'string') result[key] = saved[key];
    result.hasEmis = saved.hasEmis === true;
    result.existingEmis = result.hasEmis && typeof saved.existingEmis === 'number' && Number.isFinite(saved.existingEmis) && saved.existingEmis >= 0 ? saved.existingEmis : 0;
    return result;
  } catch { return initial; }
}
export default function App() {
  const [details, setDetails] = useState(load);
  const [step, setStep] = useState(1);
  const [emiText, setEmiText] = useState(() => String(details.existingEmis));
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [storageNotice, setStorageNotice] = useState('');
  function update(patch: Partial<Details>) {
    const next = { ...details, ...patch };
    setDetails(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setStorageNotice(''); } catch { setStorageNotice('Browser storage is unavailable. You can still complete this check.'); }
  }
  function reset() { setDetails(initial); setEmiText('0'); setResult(null); setStep(1); try { localStorage.removeItem(storageKey); } catch { /* State can still reset without storage. */ } }
  const integer = (key: 'age' | 'mobile' | 'pincode' | 'requestedAmount' | 'tenure', max: number) => (event: React.ChangeEvent<HTMLInputElement>) => update({ [key]: event.target.value.replace(/\D/g, '').slice(0, max) });
  const decimal = (value: string) => /^\d*(\.\d{0,2})?$/.test(value);
  return <div className="app-shell">
    <header><a className="brand" href="./" aria-label="DhanBazaar home"><span className="brand-mark">D<span>↗</span></span>DhanBazaar<span className="brand-dot">.</span></a><span className="header-tag"><span/> YOUR NEXT CHAPTER STARTS HERE</span></header>
    <main>
      <section className="intro"><div className="eyebrow">A LITTLE CLARITY. A BIG STEP FORWARD.</div><h1>Your plans deserve<br/><em>a head start.</em></h1><p>Find out how much you could borrow.<br/>A simple loan check, made for you.</p><div className="intro-benefits"><span>✓ No paperwork</span><span>✓ No bureau enquiry</span><span>✓ Free to check</span></div><div className="illustration" aria-hidden="true"><div className="orbit"/><div className="coin coin-one">₹</div><div className="coin coin-two">₹</div><div className="growth-card"><span>ROOM TO GROW</span><strong>Your next<br/>possibility ↗</strong><div className="bars"><i/><i/><i/><i/><i/></div></div><div className="mini-card">✦<span>Small steps.<br/><b>Bigger possibilities.</b></span></div></div><p className="simulation-note">Phase 1 preview · Illustrative eligibility only.<br/>Your credit score is simulated, not fetched.</p></section>
      <section className="form-card" aria-label="Loan eligibility checker">
        <nav className="steps" aria-label="Progress">{['Basic details', 'Income & loan', 'Your result'].map((label, index) => <div key={label} className={step >= index + 1 ? 'active' : ''} aria-current={step === index + 1 ? 'step' : undefined}><span>{step > index + 1 ? '✓' : `0${index + 1}`}</span><small>{label}</small></div>)}</nav>
        {step < 3 ? <form onSubmit={event => { event.preventDefault(); if (step === 1) setStep(2); else { setResult(evaluateEligibility({ age: Number(details.age), monthlySalary: Number(details.monthlySalary), existingEmis: details.hasEmis ? details.existingEmis : 0, requestedAmount: Number(details.requestedAmount), tenure: Number(details.tenure) })); setStep(3); } }}>
          <div className="section-label">STEP 0{step} / 03</div><h2>{step === 1 ? 'Let’s get to know you.' : 'Make room for your plans.'}</h2><p className="card-subtitle">{step === 1 ? 'A few basics to get your eligibility check started.' : 'Tell us about your income and the loan you have in mind.'}</p>
          {step === 1 ? <div className="fields">
            <label className="full">Full name<input required autoComplete="name" placeholder="Enter your full name" value={details.name} onChange={e => update({ name: e.target.value.replace(/[^a-zA-Z ]/g, '') })} pattern="[A-Za-z]+( +[A-Za-z]+)*" maxLength={100}/></label>
            <label>Age<input required inputMode="numeric" placeholder="e.g. 28" value={details.age} onChange={integer('age', 2)} pattern="[1-9][0-9]?" maxLength={2}/></label>
            <label>Mobile number<input required inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number" value={details.mobile} onChange={integer('mobile', 10)} pattern="[1-9][0-9]{9}" maxLength={10}/></label>
            <label>Pincode<input required inputMode="numeric" autoComplete="postal-code" placeholder="6-digit pincode" value={details.pincode} onChange={integer('pincode', 6)} pattern="[1-9][0-9]{5}" maxLength={6}/></label>
            <label>Employment type <span className="phase-label">PHASE 1</span><select disabled value="Salaried"><option>Salaried</option></select></label>
            <label className="full">Company type<select value={details.companyType} onChange={e => update({ companyType: e.target.value })}><option>MNC</option><option>Pvt Ltd</option><option>Govt</option></select></label>
          </div> : <div className="fields">
            <label className="full">Monthly net salary (₹)<input required inputMode="decimal" placeholder="e.g. 50,000" value={details.monthlySalary} onChange={e => { if (decimal(e.target.value)) update({ monthlySalary: e.target.value }); }} pattern="[0-9]+(\.[0-9]{1,2})?"/></label>
            <label className="checkbox full"><input type="checkbox" checked={details.hasEmis} onChange={e => { if (!e.target.checked) setEmiText('0'); update({ hasEmis: e.target.checked, existingEmis: e.target.checked ? details.existingEmis : 0 }); }}/>I have existing loans / EMIs</label>
            {details.hasEmis && <label className="full">Existing monthly EMIs (₹)<input required type="number" min="0" step="0.01" value={emiText} onChange={e => { if (decimal(e.target.value)) { setEmiText(e.target.value); update({ existingEmis: Number(e.target.value) }); } }}/><small className="field-note">Enter your total monthly EMI payments. This is self-declared.</small></label>}
            <label>Loan amount required (₹)<input required inputMode="numeric" placeholder="e.g. 300000" value={details.requestedAmount} onChange={integer('requestedAmount', 12)} pattern="[1-9][0-9]*"/></label>
            <label>Tenure (months)<input required inputMode="numeric" placeholder="e.g. 36" value={details.tenure} onChange={integer('tenure', 2)} maxLength={2} pattern="[1-9][0-9]?"/></label>
          </div>}
          <div className="actions">{step === 2 && <button type="button" className="back" onClick={() => setStep(1)}>← Back</button>}<button className="primary" type="submit">{step === 1 ? 'Continue to income details' : 'Check my eligibility'}<span>→</span></button></div><p className="privacy">♧ Your details stay in this browser. No data is sent to a server.</p>
        </form> : result && <div className="result" aria-live="polite"><div className="section-label">YOUR PERSONAL SNAPSHOT</div><div className={`result-icon ${result.status === 'Hard Reject' ? 'rejected' : ''}`}>{result.status === 'Eligible' ? '✓' : '!'}</div><h2>{result.status === 'Eligible' ? 'A possibility worth exploring.' : 'Not eligible at this time.'}</h2><span className={`status ${result.status === 'Hard Reject' ? 'rejected' : ''}`}>{result.status}</span><p className="card-subtitle">{result.reason}</p><div className="amount"><span>MAX ELIGIBLE AMOUNT</span><strong>{money(result.maxEligibleAmount)}</strong></div><div className="result-grid"><div><span>Simulated bureau score</span><strong>{result.bureauScore}<small> / 900</small></strong></div><div><span>Requested loan</span><strong>{money(Number(details.requestedAmount))}</strong></div><div><span>Available monthly EMI</span><strong>{money(Math.max(0, result.availableEmi))}</strong></div><div><span>Tenure</span><strong>{details.tenure} months</strong></div></div><p className="result-disclaimer">This is an illustrative estimate using a randomly generated score (300–900). It is not a credit bureau report or a loan offer. Actual lender eligibility may differ.</p><button className="primary" onClick={() => setStep(2)}>Edit income & loan details <span>↗</span></button><button className="reset" onClick={reset}>Start a new check</button></div>}
        {storageNotice && <p role="status" className="storage-notice">{storageNotice}</p>}
      </section>
    </main><footer><span>© {new Date().getFullYear()} DhanBazaar</span><span>Built by : Pravesh Dhavale</span><span>Clarity before commitment.</span></footer>
  </div>;
}
