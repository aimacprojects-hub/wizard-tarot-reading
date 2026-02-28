// Delete payment API endpoint
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://wizard-interactive-v2.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Missing paymentId' });
    }

    // Get payment record first
    const payment = await kv.get(`payment:${paymentId}`);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Delete from KV
    await kv.del(`payment:${paymentId}`);

    // Remove from sorted set
    await kv.zrem('payments:all', paymentId);

    // Delete reference if exists
    if (payment.reference) {
      await kv.del(`payment_ref:${payment.reference}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting payment:', error);
    return res.status(500).json({
      error: 'Failed to delete payment',
      details: error.message
    });
  }
}
