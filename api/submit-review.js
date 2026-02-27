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
    const { rating, feedback, package: pkg, topic, helpful, wouldRecommend } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating' });
    }

    if (feedback && feedback.length > 1000) {
      return res.status(400).json({ error: 'Feedback too long' });
    }

    // Generate unique ID
    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create review object
    const review = {
      id: reviewId,
      timestamp: new Date().toISOString(),
      rating: parseInt(rating),
      feedback: feedback || '',
      package: pkg || 'Unknown',
      topic: topic || 'Unknown',
      helpful: helpful === true || helpful === 'true',
      wouldRecommend: wouldRecommend === true || wouldRecommend === 'true'
    };

    // Store in Vercel KV
    // 1. Store individual review
    await kv.set(`review:${reviewId}`, review);

    // 2. Add to reviews list (for retrieval)
    await kv.zadd('reviews:all', {
      score: Date.now(),
      member: reviewId
    });

    // 3. Update stats counter
    await kv.incr('reviews:count');

    // 4. Update rating sum (for average calculation)
    await kv.incrby('reviews:rating_sum', rating);

    return res.status(200).json({
      success: true,
      reviewId: reviewId,
      message: 'ขอบคุณสำหรับความคิดเห็นของคุณครับ! 🙏'
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500).json({
      error: 'Failed to submit review',
      details: error.message
    });
  }
}
