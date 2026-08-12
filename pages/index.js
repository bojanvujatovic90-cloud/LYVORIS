import { useState } from 'react';
import { ShieldCheck, Zap, Globe, Lock } from 'lucide-react';

export default function Home() {
  const [agreed, setAgreed] = useState(false);
  const [activeTab, setActiveTab] = useState('pay');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState(null);

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!agreed) {
      alert("You must acknowledge user liability terms before proceeding.");
      return;
    }
    
    setStatus('Processing autonomous routing...');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          sellerPaypalEmail: recipient,
          isP2P: activeTab === 'pay'
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`Authorized! Platform Fee: $${data.fee} | Net Payout: $${data.sellerPayout}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus('Autonomous processing failed. Check network parameters.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'sans-serif', padding: '20px' }}>
      <header style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#2563eb', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>L</div>
          <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '1.5px' }}>LYVORIS</span>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '40px auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#38bdf8' }}>Autonomous Global Financial Ecosystem</h1>
        <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '40px' }}>
          Instantly transfer funds and trade globally with automated 0% to 5% capped fee routing.
        </p>

        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '30px', maxWidth: '520px', margin: '0 auto', textAlign: 'left' }}>
          <form onSubmit={handleTransaction}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>RECIPIENT PAYPAL / ACCOUNT</label>
              <input type="email" placeholder="user@domain.com" value={recipient} onChange={(e) => setRecipient(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>AMOUNT (USD)</label>
              <input type="number" placeholder="100.00" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
            </div>

            <div style={{ background: '#020617', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '20px' }}>
              <label style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#cbd5e1', cursor: 'pointer' }}>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span><strong>Full Liability Declaration:</strong> You acknowledge that you bear 100% legal and tax liability for your business operations on LYVORIS.</span>
              </label>
            </div>

            <button type="submit" style={{ width: '100%', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700' }}>
              Execute Autonomous Routing
            </button>
          </form>

          {status && <div style={{ marginTop: '16px', padding: '12px', background: '#0284c720', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '8px', fontSize: '12px' }}>{status}</div>}
        </div>
      </main>
    </div>
  );
}
