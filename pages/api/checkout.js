import paypal from '@paypal/checkout-server-sdk';

const MAX_COMMISSION_RATE = 0.05; // 5% provizije za platformu

function environment() {
  let clientId = process.env.PAYPAL_CLIENT_ID;
  let clientSecret = process.env.PAYPAL_SECRET_KEY;

  return new paypal.core.LiveEnvironment(clientId, clientSecret);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { amount, sellerPaypalEmail, isP2P } = req.body;
  const rate = isP2P ? 0.01 : MAX_COMMISSION_RATE;
  
  const totalAmount = parseFloat(amount);
  const fee = (totalAmount * rate).toFixed(2);
  const sellerPayout = (totalAmount - fee).toFixed(2);

  try {
    // Ovde se kreira transakcija i priprema Payout za prodavca
    res.status(200).json({
      success: true,
      fee: fee,
      sellerPayout: sellerPayout,
      message: "Transakcija pripremljena za obradu"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
