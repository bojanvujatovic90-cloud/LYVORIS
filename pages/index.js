import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export default function Home() {
  const [agreed, setAgreed] = useState(false);
  const [activeTab, setActiveTab] = useState('exchange');
  const [status, setStatus] = useState(null);

  // Stock / Equity Trading Engine State
  const [ticker, setTicker] = useState('VWCE');
  const [shares, setShares] = useState(1);
  const [limitPrice, setLimitPrice] = useState('115.50');
  const [orderType, setOrderType] = useState('BUY');
  const [userEmail, setUserEmail] = useState('');
  
  // Market Depth & Order Book
  const [orders, setOrders] = useState([]);

  // Asset Marketplace State
  const [listings, setListings] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchListings();
  }, [ticker]);

  async function fetchOrders() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('ticker', ticker)
      .eq('status', 'OPEN')
      .order('price', { ascending: orderType === 'BUY' });
    if (!error && data) setOrders(data);
  }

  async function fetchListings() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    if (!error && data) setListings(data);
  }

  async function handleStockOrder(e) {
    e.preventDefault();
    if (!agreed) return alert("Acknowledge legal and financial liability terms first.");
    
    const supabase = getSupabase();
    if (!supabase) return alert("Supabase credentials missing.");

    setStatus('Routing order to global order book...');

    // 1. Provera da li u knjizi naloga već postoji odgovarajući suprotni nalog
    const counterType = orderType === 'BUY' ? 'SELL' : 'BUY';
    const matchQuery = supabase
      .from('orders')
      .select('*')
      .eq('ticker', ticker)
      .eq('order_type', counterType)
      .eq('status', 'OPEN');

    const { data: matchingOrders } = orderType === 'BUY' 
      ? await matchQuery.lte('price', parseFloat(limitPrice)).order('price', { ascending: true })
      : await matchQuery.gte('price', parseFloat(limitPrice)).order('price', { ascending: false });

    if (matchingOrders && matchingOrders.length > 0) {
      // Automatsko spajanje kupca i prodavca
      const matchedOrder = matchingOrders[0];
      const matchPrice = matchedOrder.price;
      const tradeVolume = Math.min(parseFloat(shares), parseFloat(matchedOrder.shares));

      await supabase.from('orders').update({ status: 'FILLED' }).eq('id', matchedOrder.id);
      
      await supabase.from('trades').insert([{
        ticker,
        price: matchPrice,
        shares: tradeVolume,
        buyer_email: orderType === 'BUY' ? userEmail : matchedOrder.user_email,
        seller_email: orderType === 'SELL' ? userEmail : matchedOrder.user_email,
        platform_fee: (matchPrice * tradeVolume * 0.01).toFixed(2)
      }]);

      setStatus(`ORDER MATCHED & EXECUTED! Traded ${tradeVolume} shares of ${ticker} at $${matchPrice}. Platform Routing Fee: 1%.`);
      fetchOrders();
    } else {
      // Upis novog otvorenog naloga u knjigu naloga (Order Book)
      const { error } = await supabase.from('orders').insert([{
        ticker,
        order_type: orderType,
        shares: parseFloat(shares),
        price: parseFloat(limitPrice),
        user_email: userEmail,
        status: 'OPEN'
      }]);

      if (!error) {
        setStatus(`LIMIT ${orderType} ORDER PLACED! Listed in global order book for ${ticker} at $${limitPrice}.`);
        fetchOrders();
      } else {
        setStatus(`Error placing order: ${error.message}`);
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'sans-serif', padding: '20px' }}>
      <header style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#2563eb', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>L</div>
          <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '1.5px' }}>LYVORIS</span>
          <span style={{ fontSize: '10px', background: '#059669', color: '#ecfdf5', padding: '4px 8px', borderRadius: '12px', border: '1px solid #10b981' }}>LIVE STOCK EXCHANGE</span>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '40px auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '44px', fontWeight: '900', color: '#38bdf8' }}>Autonomous Stock & Asset Exchange</h1>
        <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '30px' }}>Order book matching engine for Equities, ETFs, and Digital Assets.</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
          <button onClick={() => setActiveTab('exchange')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: activeTab === 'exchange' ? '#10b981' : '#1e293b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Stock & ETF Exchange</button>
          <button onClick={() => setActiveTab('market')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: activeTab === 'market' ? '#2563eb' : '#1e293b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Asset Marketplace</button>
        </div>

        <div style={{ background: '#0f172a', padding: '15px', borderRadius: '10px', maxWidth: '750px', margin: '0 auto 30px auto', border: '1px solid #1e293b' }}>
          <label style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left' }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span><strong>Global Risk Disclosure:</strong> Stock and equity trading carries financial risk. Orders route autonomously into the peer-to-peer order book. Users acknowledge 100% legal, financial, and tax responsibility for all executed trades.</span>
          </label>
        </div>

        {activeTab === 'exchange' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{ background: '#0f172a', border: '1px solid #059669', borderRadius: '16px', padding: '30px' }}>
              <h3 style={{ marginTop: 0, color: '#10b981' }}>Order Entry (Limit Order)</h3>
              <form onSubmit={handleStockOrder}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>TICKER (e.g., VWCE, VUAA, CSPX, AAPL)</label>
                  <input type="text" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} required style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }} />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>LIMIT PRICE ($ USD)</label>
                  <input type="number" step="0.01" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>QUANTITY (SHARES)</label>
                  <input type="number" step="0.01" value={shares} onChange={(e) => setShares(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>TRADER PAYPAL / ACCOUNT EMAIL</label>
                  <input type="email" placeholder="trader@domain.com" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button type="button" onClick={() => setOrderType('BUY')} style={{ flex: 1, padding: '12px', background: orderType === 'BUY' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>BUY</button>
                  <button type="button" onClick={() => setOrderType('SELL')} style={{ flex: 1, padding: '12px', background: orderType === 'SELL' ? '#ef4444' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>SELL</button>
                </div>
                <button type="submit" style={{ width: '100%', padding: '14px', background: orderType === 'BUY' ? '#10b981' : '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                  Place Limit {orderType} Order
                </button>
              </form>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '30px' }}>
              <h3 style={{ marginTop: 0, color: '#38bdf8' }}>Order Book — {ticker}</h3>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '15px' }}>Live BID / ASK Liquidity Depth</div>
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#64748b' }}>
                      <th style={{ padding: '8px' }}>Type</th>
                      <th style={{ padding: '8px' }}>Price ($)</th>
                      <th style={{ padding: '8px' }}>Shares</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan="3" style={{ padding: '20px 0', textAlign: 'center', color: '#64748b' }}>No open orders for {ticker}. Be the market maker!</td></tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} style={{ borderBottom: '1px solid #1e293b', color: o.order_type === 'BUY' ? '#10b981' : '#ef4444' }}>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>{o.order_type}</td>
                          <td style={{ padding: '8px' }}>${o.price}</td>
                          <td style={{ padding: '8px', color: '#fff' }}>{o.shares}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {status && <div style={{ marginTop: '20px', padding: '12px', background: '#0284c720', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '8px', fontSize: '13px', maxWidth: '750px', margin: '20px auto 0 auto' }}>{status}</div>}
      </main>
    </div>
  );
}
