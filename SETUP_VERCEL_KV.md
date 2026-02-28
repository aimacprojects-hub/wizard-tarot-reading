# Setting Up Vercel KV Database for Reviews

## Quick Setup (5 minutes)

### Step 1: Create Vercel KV Database

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on the **Storage** tab in the top menu
3. Click **Create Database**
4. Select **KV (Redis)**
5. Give it a name: `tarot-reviews` (or any name you like)
6. Select region: Choose closest to your users (e.g., Singapore for Thai users)
7. Click **Create**

### Step 2: Connect Database to Your Project

1. After creating the database, you'll see a connection screen
2. Click **Connect to Project**
3. Select your project: `wizard-interactive-v2`
4. Click **Connect**

**That's it!** Vercel automatically:
- Installs the `@vercel/kv` package
- Adds environment variables (KV_REST_API_URL, KV_REST_API_TOKEN, etc.)
- Makes the database available to your API routes

### Step 3: Redeploy (Automatic)

1. Go to your project dashboard
2. The site will automatically redeploy with the new environment variables
3. Wait 10-20 seconds for deployment to complete

---

## Testing the Review System

### Test Submission:

1. Go to https://wizard-interactive-v2.vercel.app
2. Complete a tarot reading
3. Click **⭐ แสดงความคิดเห็น** button
4. Fill out the review form:
   - Select star rating (1-5)
   - Optional: Add feedback text
   - Check boxes if applicable
5. Click **ส่งความคิดเห็น**
6. Should see: ✅ ขอบคุณสำหรับความคิดเห็นของคุณครับ! 🙏

### View Admin Dashboard:

Go to: https://wizard-interactive-v2.vercel.app/admin-reviews.html

You'll see:
- **Total reviews count**
- **Average rating**
- **5-star count**
- **Recommendation rate**
- **All reviews** with filters

---

## Pricing

**Vercel KV Free Tier:**
- ✅ 256 MB storage (~100,000 reviews)
- ✅ 30,000 commands/month (~10,000 reviews)
- ✅ **Completely FREE until you scale**

You only pay if you exceed these limits (which means your site is very successful! 🎉)

---

## Troubleshooting

### Error: "KV_REST_API_URL is not defined"

**Solution:** Database not connected to project
1. Go to Vercel Dashboard → Storage → tarot-reviews
2. Click **Connect to Project**
3. Select `wizard-interactive-v2`
4. Redeploy

### Error: "Failed to submit review"

**Solution:** Check browser console for details
- Open DevTools (F12)
- Go to Console tab
- Look for error messages
- Common causes:
  - CORS issue (check API allows your domain)
  - Network connectivity
  - Invalid data format

### Reviews not showing in admin dashboard

**Solution:** Check API endpoint
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try loading admin dashboard
4. Look for `/api/get-reviews` request
5. Check response status and data

---

## API Endpoints

### Submit Review
```
POST /api/submit-review

Body:
{
  "rating": 5,
  "feedback": "พ่อมดอ่านได้แม่นมาก!",
  "package": "Love Expert",
  "topic": "ความรัก",
  "helpful": true,
  "wouldRecommend": true
}

Response:
{
  "success": true,
  "reviewId": "rev_1234567890_abc123",
  "message": "ขอบคุณสำหรับความคิดเห็นของคุณครับ! 🙏"
}
```

### Get Reviews
```
GET /api/get-reviews?limit=10&minRating=0&mode=recent

Response:
{
  "success": true,
  "stats": {
    "totalReviews": 47,
    "averageRating": 4.7
  },
  "reviews": [...]
}
```

---

## Future Enhancements

Once you have 50+ reviews, you can:

1. **Display testimonials on homepage**
   - Show average rating
   - Display 5-star reviews
   - "⭐ 4.8/5 from 347 customers"

2. **Automated alerts**
   - Get notified when rating < 3 stars
   - Daily/weekly summary emails

3. **Sentiment analysis**
   - Auto-categorize feedback by topic
   - Identify trends and patterns

4. **A/B testing**
   - Track if prompt changes improve ratings
   - Compare package satisfaction

Let me know if you want help implementing any of these! 🚀
