// Get current pricing tier based on total sales
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
    // Get total verified payments count
    const allPaymentIds = await kv.zrange('payments:all', 0, -1);
    let verifiedCount = 0;

    for (const paymentId of allPaymentIds) {
      const payment = await kv.get(`payment:${paymentId}`);
      if (payment && payment.verified) {
        verifiedCount++;
      }
    }

    // Define pricing tiers (NEW FINAL PRICES: ฿99/199/399)
    const tiers = [
      {
        name: 'Tier 1: LAUNCH SPECIAL',
        discount: 80,
        minSales: 0,
        maxSales: 29,
        prices: {
          basic: 20,
          premium: 40,
          ultimate: 80
        },
        label: '🔥 LAUNCH WEEK - 80% OFF',
        urgency: 'EXTREME'
      },
      {
        name: 'Tier 2: EARLY BIRD',
        discount: 70,
        minSales: 30,
        maxSales: 79,
        prices: {
          basic: 30,
          premium: 60,
          ultimate: 120
        },
        label: '⚡ EARLY BIRD - 70% OFF',
        urgency: 'HIGH'
      },
      {
        name: 'Tier 3: HALF PRICE',
        discount: 50,
        minSales: 80,
        maxSales: 129,
        prices: {
          basic: 50,
          premium: 100,
          ultimate: 200
        },
        label: '💎 HALF PRICE - 50% OFF',
        urgency: 'MEDIUM'
      },
      {
        name: 'Tier 4: SPECIAL OFFER',
        discount: 30,
        minSales: 130,
        maxSales: 199,
        prices: {
          basic: 70,
          premium: 140,
          ultimate: 280
        },
        label: '🌟 SPECIAL - 30% OFF',
        urgency: 'LOW'
      },
      {
        name: 'Tier 5: FINAL DISCOUNT',
        discount: 15,
        minSales: 200,
        maxSales: 299,
        prices: {
          basic: 85,
          premium: 170,
          ultimate: 340
        },
        label: '✨ FINAL DISCOUNT - 15% OFF',
        urgency: 'LOW'
      },
      {
        name: 'Tier 6: FULL PRICE',
        discount: 0,
        minSales: 300,
        maxSales: 999999,
        prices: {
          basic: 99,
          premium: 199,
          ultimate: 399
        },
        label: '👑 PREMIUM SERVICE',
        urgency: 'NONE'
      }
    ];

    // Find current tier
    const currentTier = tiers.find(
      tier => verifiedCount >= tier.minSales && verifiedCount <= tier.maxSales
    ) || tiers[tiers.length - 1];

    // Calculate spots remaining in current tier
    const spotsRemaining = currentTier.maxSales - verifiedCount + 1;
    const tierCapacity = currentTier.maxSales - currentTier.minSales + 1;
    const tierProgress = verifiedCount - currentTier.minSales;

    // Find next tier
    const currentTierIndex = tiers.indexOf(currentTier);
    const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

    return res.status(200).json({
      success: true,
      totalSales: verifiedCount,
      currentTier: {
        ...currentTier,
        spotsRemaining,
        tierCapacity,
        tierProgress
      },
      nextTier: nextTier ? {
        name: nextTier.name,
        prices: nextTier.prices,
        discount: nextTier.discount
      } : null,
      allTiers: tiers
    });

  } catch (error) {
    console.error('Error getting pricing:', error);
    return res.status(500).json({
      error: 'Failed to get pricing',
      details: error.message
    });
  }
}
