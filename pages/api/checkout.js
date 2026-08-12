import paypal from '@paypal/checkout-server-sdk';

const MAX_COMMISSION_RATE = 0.05; // Hard-capped at 5%
const P2P_COMMISSION_RATE = 0.01; // 1% for P2P transfers

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { amount, sellerPaypalEmail, isP2P } = req.body;
    const total = parseFloat(amount);
    const rate = isP2P ? P2P_COMMISSION_RATE : MAX_COMMISSION_RATE;
    const fee = (total * rate).toFixed(2);
    const netPayout = (total - fee).toFixed(2);

    return res.status(200).json({
      success: true,
      amount: total.toFixed(2),
      fee: fee,
      sellerPayout: netPayout,
      currency: 'USD',
      status: 'AUTONOMOUS_ROUTING_AUTHORIZED'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
