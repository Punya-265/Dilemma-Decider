import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function OptionCard({ option, type }) {
  return <section className={`option-card ${type}`}>
    <div className="option-heading"><span>{type === 'option-a' ? 'A' : 'B'}</span><h2>{option.name}</h2></div>
    <div className="lists">
      <div><h3>Pros</h3><ul>{option.pros.map((x,i)=><li key={i}>{x}</li>)}</ul></div>
      <div><h3>Cons</h3><ul>{option.cons.map((x,i)=><li key={i}>{x}</li>)}</ul></div>
    </div>
  </section>;
}

function App() {
  const [dilemma,setDilemma]=useState('');
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  async function analyze() {
    if (!dilemma.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const r=await fetch(`${API_URL}/api/analyze`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({raw_dilemma:dilemma})});
      const contentType=r.headers.get('content-type') || '';
      const d=contentType.includes('application/json') ? await r.json() : {error:`Server returned an unexpected response (${r.status}). Make sure the backend is running on port 5000.`};
      if(!r.ok) throw Error(d.error || 'AI analysis failed.');
      setResult(d);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function reset() { setDilemma(''); setResult(null); setError(''); window.scrollTo({top:0,behavior:'smooth'}); }

  return <main>
    <nav><div className="brand">Dilemma<span>Decider</span></div><div className="nav-actions"><button className="nav-button" onClick={reset}>New decision</button></div></nav>
    <div className="container">
      <header><p className="eyebrow">THINK CLEARLY</p><h1>Put the dilemma down.<br/><em>See it clearly.</em></h1><p className="subtitle">Describe your situation exactly as it is — messy, emotional, incomplete. DilemmaDecider turns it into a structured comparison without pretending to know what you don't.</p></header>
      <section className="input-card"><label>What's the decision?</label><textarea value={dilemma} onChange={e=>setDilemma(e.target.value)} placeholder="I have two job offers. One pays more, but the other is closer to home and I'd probably learn more there..." maxLength={10000}/><div className="input-footer"><span>{dilemma.length}/10,000</span><button onClick={analyze} disabled={loading||!dilemma.trim()}>{loading?'Thinking…':'Analyze dilemma →'}</button></div></section>
      {error&&<div className="error">{error}</div>}
      {result&&<div className="results">
        <section className="summary-card"><p className="label">CORE SUMMARY</p><p className="summary">{result.coreSummary}</p></section>
        <div className="options"><OptionCard option={result.optionA} type="option-a"/><OptionCard option={result.optionB} type="option-b"/></div>
        <section className="insight-grid"><div className="blind"><p className="label">BLIND SPOT</p><p>{result.blindSpot}</p></div><div className="recommendation"><p className="label">OBJECTIVE RECOMMENDATION</p><p>{result.objectiveRecommendation}</p></div></section>
        <div className="result-actions"><button onClick={reset}>Analyze another dilemma</button></div>
        <p className="disclaimer">Decision support, not professional advice. For high-stakes medical, legal, financial, or safety decisions, consult a qualified professional.</p>
      </div>}
    </div>
  </main>;
}

createRoot(document.getElementById('root')).render(<App/>);
