// Delete review API endpoint
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
    const { reviewId } = req.body;

    if (!reviewId) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    // Get the review first to get its rating (for stats update)
    const review = await kv.get(`review:${reviewId}`);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Delete the review
    await kv.del(`review:${reviewId}`);

    // Remove from sorted set
    await kv.zrem('reviews:all', reviewId);

    // Update stats counter
    await kv.decr('reviews:count');

    // Update rating sum
    await kv.decrby('reviews:rating_sum', review.rating);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      error: 'Failed to delete review',
      details: error.message
    });
  }
}
