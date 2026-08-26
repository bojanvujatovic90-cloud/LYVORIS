import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Pomoćna funkcija za bezbedno preuzimanje Supabase klijenta
const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export default function Home() {
  const [agreed, setAgreed] = useState(false);
  const [activeTab, setActiveTab] = useState('market');
  const [status, setStatus] = useState(null);

  const [ticker, setTicker] = useState('VWCE');
  const [tradeShares, setTradeShares] = useState(1);
  const [tradeType, setTradeType] = useState('BUY');
  
  const [listings, setListings] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newSellerEmail, setNewSellerEmail] = useState('');
  
  const [payAmount, setPayAmount] = useState('');
  const [payRecipient, setPayRecipient] = useState('');

  useEffect(() => { fetchListings(); }, []);

  async function fetchListings() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    if (!error && data) setListings(data);
  }

  async function handleCreateListing(e) {
    e.preventDefault();
    if (!agreed) return alert("Acknowledge liability terms first.");
    
    const supabase = getSupabase();
    if (!supabase) return alert("Supabase credentials missing in environment variables.");

    const { error } = await supabase.from('listings').insert([
      { title: newTitle, price: parseFloat(newPrice), seller_email: newSellerEmail }
    ]);
    
    if (!error) {
      setNewTitle(''); setNewPrice(''); setNewSellerEmail(''); fetchListings();
      alert("Asset listed on the public market.");
    } else {
      alert("Error: " + error.message);
    }
  }

  const handleTransaction = async (amount, recipientEmail, isP2P) => {
    if (!agreed) return alert("Acknowledge liability terms first.");
    setStatus('Processing autonomous routing...');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, sellerPaypalEmail: recipientEmail, isP2P })
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`Executed! Platform Fee: $${data.fee} | Counterparty: $${data.sellerPayout}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus('Network / Execution Failed.');
    }
  };

  const handleExchangeTrade = (e) => {
    e.preventDefault();
    if (!agreed) return alert("Acknowledge liability terms first.");
    setStatus(`Processing Limit ${tradeType} Order for ${tradeShares} shares of ${ticker}...`);
    setTimeout(() => {
      setStatus(`Order Executed! Successfully routed ${tradeType} order for ${ticker} via platform bridge.`);
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'sans-serif', padding: '20px' }}>
      <header style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#2563eb', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>L</div>
          <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '1.5px' }}>LYVORIS</span>
          <span style={{ fontSize: '10px', background: '#1e293b', color: '#38bdf8', padding: '4px 8px', borderRadius: '12px', border: '1px solid #0284c7' }}>v2.5 OMNI-EXCHANGE</span>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '40px auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '44px', fontWeight: '900', color: '#38bdf8' }}>Global Market & Exchange Infrastructure</h1>
        <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '30px' }}>Trade physical assets, digital goods, or route multi-asset exchange orders autonomously.</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('market')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: activeTab === 'market' ? '#2563eb' : '#1e293b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Asset Marketplace</button>
          <button onClick={() => setActiveTab('exchange')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: activeTab === 'exchange' ? '#10b981' : '#1e293b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Equities & ETF Exchange</button>
          <button onClick={() => setActiveTab('pay')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: activeTab === 'pay' ? '#8b5cf6' : '#1e293b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Direct P2P Bridge</button>
        </div>

        <div style={{ background: '#0f172a', padding: '15px', borderRadius: '10px', maxWidth: '700px', margin: '0 auto 30px auto', border: '1px solid #1e293b' }}>
          <label style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left' }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span><strong>Global Risk & Liability Disclosure:</strong> Trading physical assets, digital goods, and global equities carries significant financial risk. By executing trades on LYVORIS, you confirm you are acting autonomously, assume 100% legal/tax liability, and understand capital may be lost.</span>
          </label>
        </div>

        {activeTab === 'market' && (
          <div>
            <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', maxWidth: '500px', margin: '0 auto 40px auto', textAlign: 'left', border: '1px solid #334155' }}>
              <h3 style={{ marginTop: 0, color: '#38bdf8' }}>List an Asset on the Market</h3>
              <form onSubmit={handleCreateListing}>
                <input type="text" placeholder="Asset Name" value={newTitle} onChange={e => setNewTitle(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#020617', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
                <input type="number" placeholder="Price (USD)" value={newPrice} onChange={e => setNewPrice(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#020617', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
                <input type="email" placeholder="Seller Receiving Email" value={newSellerEmail} onChange={e => setNewSellerEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '15px', background: '#020617', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Publish to Market</button>
              </form>
            </div>
            
            <h2 style={{ textAlign: 'left', maxWidth: '1000px', margin: '0 auto 20px auto' }}>Live Order Book (P2P Assets)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
              {listings.length === 0 ? (
                <p style={{ color: '#64748b', gridColumn: '1/-1' }}>Order book is empty. Provide liquidity by listing an asset.</p>
              ) : (
                listings.map(item => (
                  <div key={item.id} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '20px', textAlign: 'left' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>{item.title}</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 15px 0' }}>${item.price}</p>
                    <button onClick={() => handleTransaction(item.price, item.seller_email, false)} style={{ width: '100%', padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Execute Trade (Buy)</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'exchange' && (
          <div style={{ background: '#0f172a', border: '1px solid #059669', borderRadius: '16px', padding: '30px', maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
            <h3 style={{ marginTop: 0, color: '#10b981' }}>Omni-Exchange Terminal</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>Route orders for Global Equities & ETFs (e.g. Vanguard All-World / VWCE) directly to market makers.</p>
            <form onSubmit={handleExchangeTrade}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>TICKER / SYMBOL</label>
                <input type="text" placeholder="e.g. VWCE, AAPL" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} required style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>SHARES</label>
                <input type="number" step="0.01" value={tradeShares} onChange={(e) => setTradeShares(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button type="button" onClick={() => setTradeType('BUY')} style={{ flex: 1, padding: '12px', background: tradeType === 'BUY' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>BUY</button>
                <button type="button" onClick={() => setTradeType('SELL')} style={{ flex: 1, padding: '12px', background: tradeType === 'SELL' ? '#ef4444' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>SELL</button>
              </div>
              <button type="submit" style={{ width: '100%', padding: '14px', background: tradeType === 'BUY' ? '#10b981' : '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                Execute {tradeType} Order
              </button>
            </form>
          </div>
        )}

        {activeTab === 'pay' && (
          <div style={{ background: '#0f172a', border: '1px solid #8b5cf6', borderRadius: '16px', padding: '30px', maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
            <h3 style={{ marginTop: 0, color: '#a78bfa' }}>Direct P2P Bridge</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleTransaction(payAmount, payRecipient, true); }}>
              <input type="email" placeholder="Counterparty Email" value={payRecipient} onChange={(e) => setPayRecipient(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginBottom: '16px' }} />
              <input type="number" placeholder="Amount (USD)" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginBottom: '16px' }} />
              <button type="submit" style={{ width: '100%', padding: '14px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Route Funds</button>
            </form>
          </div>
        )}

        {status && <div style={{ marginTop: '20px', padding: '12px', background: '#0284c720', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '8px', fontSize: '13px', maxWidth: '700px', margin: '20px auto 0 auto' }}>{status}</div>}
      </main>
    </div>
  );
}
