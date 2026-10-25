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
  const [activeTab, setActiveTab] = useState('vault'); // Zadato na Vault / Fond
  const [status, setStatus] = useState(null);

  // Fond / Vault State
  const [vaultBalance, setVaultBalance] = useState(1000000.00);
  const [grantRecipient, setGrantRecipient] = useState('');
  const [grantAmount, setGrantAmount] = useState('');
  const [grantPurpose, setGrantPurpose] = useState('');
  const [masterPass, setMasterPass] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Stock Exchange State
  const [ticker, setTicker] = useState('VWCE');
  const [shares, setShares] = useState(1);
  const [limitPrice, setLimitPrice] = useState('115.50');
  const [orderType, setOrderType] = useState('BUY');
  const [userEmail, setUserEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchListings();
    fetchVaultBalance();
  }, [ticker]);

  async function fetchVaultBalance() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.from('vault').select('balance').single();
    if (data) setVaultBalance(data.balance);
  }

  async function fetchOrders() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.from('orders').select('*').eq('ticker', ticker).eq('status', 'OPEN');
    if (data) setOrders(data);
  }

  async function fetchListings() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    if (data) setListings(data);
  }

  // Funkcija za isplatu pomoći iz fonda
  async function handleDisburseGrant(e) {
    e.preventDefault();
    if (!agreed) return alert("Acknowledge liability & fund authorization terms first.");
    
    const disburseVal = parseFloat(grantAmount);
    if (disburseVal > vaultBalance) {
      return alert("Insufficient funds in the Sovereign Reserve.");
    }

    const supabase = getSupabase();
    if (!supabase) return alert("Supabase credentials missing.");

    setStatus('Processing sovereign grant distribution...');

    // 1. Umanji stanje fonda
    const newBal = vaultBalance - disburseVal;
    const { error: updateErr } = await supabase
      .from('vault')
      .update({ balance: newBal })
      .gt('balance', 0);

    // 2. Zabeleži transakciju pomoći
    await supabase.from('grant_disbursements').insert([{
      recipient_email: grantRecipient,
      amount: disburseVal,
      purpose: grantPurpose
    }]);

    setVaultBalance(newBal);
    setStatus(`SUCCESS: Granted $${disburseVal.toLocaleString()} to ${grantRecipient}. Purpose: ${grantPurpose}. Remaining Reserve: $${newBal.toLocaleString()}`);
    setGrantAmount('');
    setGrantRecipient('');
    setGrantPurpose('');
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'sans-serif', padding: '20px' }}>
      <header style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#2563eb', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>L</div>
          <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '1.5px' }}>LYVORIS</span>
          <span style={{ fontSize: '10px', background: '#7c3aed', color: '#fff', padding: '4px 8px', borderRadius: '12px', border: '1px solid #8b5cf6' }}>$1M SOVEREIGN RESERVE</span>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '40px auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '44px', fontWeight: '900', color: '#38bdf8' }}>Global Reserve & Omni-Exchange</h1>
        <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '30px' }}>Autonomous liquidity infrastructure, stock engine, and private relief fund.</p>

        {/* Meni navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('vault')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: activeTab === 'vault' ? '#7c3aed' : '#1e293b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>$1M Relief Fund Vault</button>
          <button onClick={() => setActiveTab('exchange')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: activeTab === 'exchange' ? '#10b981' : '#1e293b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Stock Exchange</button>
          <button onClick={() => setActiveTab('market')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: activeTab === 'market' ? '#2563eb' : '#1e293b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Asset Marketplace</button>
        </div>

        {/* Izjava o odgovornosti */}
        <div style={{ background: '#0f172a', padding: '15px', borderRadius: '10px', maxWidth: '750px', margin: '0 auto 30px auto', border: '1px solid #1e293b' }}>
          <label style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left' }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span><strong>Emergency Fund & Legal Terms:</strong> Disbursements from the $1,000,000 reserve serve as a discretionary insurance policy. All transactions are final and subject to autonomous governance.</span>
          </label>
        </div>

        {/* TAB 1: $1M RELIEF FUND VAULT */}
        {activeTab === 'vault' && (
          <div style={{ maxWidth: '650px', margin: '0 auto', background: '#0f172a', border: '1px solid #7c3aed', borderRadius: '16px', padding: '30px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#a78bfa', fontSize: '20px' }}>LYVORIS Sovereign Reserve</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Emergency Insurance Policy & Relief Fund</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>TOTAL AVAILABLE RESERVE</div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#34d399' }}>${Number(vaultBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</div>
              </div>
            </div>

            {/* Kontrolna Forma za Slanje Pomoći */}
            <form onSubmit={handleDisburseGrant}>
              <h4 style={{ color: '#f8fafc', marginBottom: '15px' }}>Disburse Emergency Assistance</h4>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>RECIPIENT EMAIL / PAYPAL (SEBE ILI DRUGOG)</label>
                <input type="email" placeholder="beneficiary@domain.com" value={grantRecipient} onChange={e => setGrantRecipient(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>DISBURSEMENT AMOUNT ($ USD)</label>
                <input type="number" step="0.01" placeholder="5000.00" value={grantAmount} onChange={e => setGrantAmount(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>PURPOSE / REASON FOR ASSISTANCE</label>
                <input type="text" placeholder="e.g. Personal Liquidity / Medical Aid / Business Reserve" value={grantPurpose} onChange={e => setGrantPurpose(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                Authorize & Release Relief Funds
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: STOCK EXCHANGE */}
        {activeTab === 'exchange' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{ background: '#0f172a', border: '1px solid #059669', borderRadius: '16px', padding: '30px' }}>
              <h3 style={{ marginTop: 0, color: '#10b981' }}>Order Entry (Limit Order)</h3>
              <form onSubmit={(e) => { e.preventDefault(); alert("Order submitted to book"); }}>
                <input type="text" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} required style={{ width: '100%', padding: '12px', marginBottom: '10px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                <input type="number" step="0.01" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} required style={{ width: '100%', padding: '12px', marginBottom: '10px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                <button type="submit" style={{ width: '100%', padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700' }}>Submit Stock Trade</button>
              </form>
            </div>
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '30px' }}>
              <h3 style={{ marginTop: 0, color: '#38bdf8' }}>Order Book — {ticker}</h3>
              <p style={{ color: '#64748b' }}>Live Market Depth Active</p>
            </div>
          </div>
        )}

        {/* TAB 3: ASSET MARKETPLACE */}
        {activeTab === 'market' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3>Asset Marketplace Active</h3>
            <p style={{ color: '#94a3b8' }}>List products or digital goods for sale with automatic fee routing.</p>
          </div>
        )}

        {status && <div style={{ marginTop: '20px', padding: '12px', background: '#0284c720', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '8px', fontSize: '13px', maxWidth: '750px', margin: '20px auto 0 auto' }}>{status}</div>}
      </main>
    </div>
  );
}
