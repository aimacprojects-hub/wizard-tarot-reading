// Get payments API endpoint
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://wizard-interactive-v2.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = 25, status = 'all', sort = 'recent' } = req.query;

    // Get payment IDs (sorted by timestamp, newest first)
    const paymentIds = await kv.zrange('payments:all', 0, -1, {
      rev: true // Reverse order (newest first)
    });

    // Fetch actual payment data
    const payments = [];
    const limitNum = parseInt(limit);

    for (let i = 0; i < Math.min(paymentIds.length, limitNum * 2); i++) {
      const paymentId = paymentIds[i];
      const payment = await kv.get(`payment:${paymentId}`);

      if (!payment) continue;

      // Filter by status
      if (status === 'verified' && !payment.verified) continue;
      if (status === 'pending' && payment.verified) continue;

      payments.push(payment);

      if (payments.length >= limitNum) {
        break;
      }
    }

    // Sort payments
    if (sort === 'amount') {
      payments.sort((a, b) => b.amount - a.amount);
    }

    // Calculate stats
    const allPaymentIds = await kv.zrange('payments:all', 0, -1);
    let totalCount = 0;
    let verifiedCount = 0;
    let totalRevenue = 0;
    let todayRevenue = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const paymentId of allPaymentIds) {
      const payment = await kv.get(`payment:${paymentId}`);
      if (payment) {
        totalCount++;
        if (payment.verified) {
          verifiedCount++;
          totalRevenue += payment.amount;

          const paymentDate = new Date(payment.timestamp);
          paymentDate.setHours(0, 0, 0, 0);
          if (paymentDate.getTime() === today.getTime()) {
            todayRevenue += payment.amount;
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      stats: {
        total: totalCount,
        verified: verifiedCount,
        totalRevenue: totalRevenue,
        todayRevenue: todayRevenue
      },
      payments: payments
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({
      error: 'Failed to fetch payments',
      details: error.message
    });
  }
}
