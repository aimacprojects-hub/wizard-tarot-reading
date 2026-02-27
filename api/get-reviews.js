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
    const { limit = 10, minRating = 0, mode = 'recent' } = req.query;

    // Get total count and stats
    const totalCount = await kv.get('reviews:count') || 0;
    const ratingSum = await kv.get('reviews:rating_sum') || 0;
    const averageRating = totalCount > 0 ? (ratingSum / totalCount).toFixed(1) : 0;

    // Get review IDs (sorted by timestamp, newest first)
    const reviewIds = await kv.zrange('reviews:all', 0, -1, {
      rev: true // Reverse order (newest first)
    });

    // Fetch actual review data
    const reviews = [];
    const limitNum = parseInt(limit);

    for (let i = 0; i < Math.min(reviewIds.length, limitNum * 2); i++) {
      const reviewId = reviewIds[i];
      const review = await kv.get(`review:${reviewId}`);

      if (review && review.rating >= parseInt(minRating)) {
        reviews.push(review);

        if (reviews.length >= limitNum) {
          break;
        }
      }
    }

    // Mode: 'recent' = newest, 'top' = highest rated first
    if (mode === 'top') {
      reviews.sort((a, b) => b.rating - a.rating);
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalReviews: totalCount,
        averageRating: parseFloat(averageRating)
      },
      reviews: reviews
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      error: 'Failed to fetch reviews',
      details: error.message
    });
  }
}
