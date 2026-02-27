# 🔮 The Wizard of Destiny Tales - Tarot Reading Website

Interactive Thai tarot reading website powered by Claude AI.

## 🚀 Quick Start

### 1. Get Claude API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **Settings → API Keys**
4. Click **Create Key**
5. Copy your API key (starts with `sk-ant-...`)

### 2. Add API Key to Vercel

1. Go to your Vercel dashboard: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project: **wizard-interactive-v2**
3. Go to **Settings → Environment Variables**
4. Add new variable:
   - **Name:** `CLAUDE_API_KEY`
   - **Value:** Your API key from step 1
   - **Environment:** Select all (Production, Preview, Development)
5. Click **Save**

### 3. Redeploy

After adding the environment variable:

**Option A - Via Dashboard:**
1. Go to **Deployments** tab
2. Click the three dots (**...**) on the latest deployment
3. Click **Redeploy**

**Option B - Automatic (if you have auto-deploy):**
- Just push any small change to trigger redeploy
- Or wait for next deployment

### 4. Test It!

Visit your website and try:
1. Select a topic (Love, Career, Money, etc.)
2. Ask a question
3. Fill in optional personalization fields
4. Choose a package
5. Draw cards
6. Get your AI-generated reading!

## 📁 Project Structure

```
wizard-interactive-v2/
├── index.html              # Main website (frontend)
├── api/
│   └── tarot-reading.js   # Serverless function (backend)
├── vercel.json            # Vercel configuration
├── .env.example           # Example environment variables
└── README.md              # This file
```

## 🔧 How It Works

1. **Frontend (index.html):**
   - Customer selects topic and asks question
   - Fills optional personalization (age, gender, emotion)
   - Chooses package (฿199, ฿399, or ฿799)
   - Frontend calls `/api/tarot-reading`

2. **Backend (api/tarot-reading.js):**
   - Receives request with all customer data
   - Builds personalized prompt for Claude
   - Calls Claude API securely (API key never exposed)
   - Returns AI-generated reading

3. **Claude AI:**
   - Generates unique, personalized readings in Thai
   - Uses fairy-tale storytelling style
   - Always positive and hopeful
   - Specific timelines and actionable advice

## 💰 Costs

**Claude API Pricing:**
- Input: ~$3 per 1M tokens
- Output: ~$15 per 1M tokens

**Per Reading Cost:**
- Initial reading: ~500 input + ~800 output tokens = ~$0.015 (฿0.45)
- Follow-up: ~300 input + ~400 output tokens = ~$0.008 (฿0.24)

**Profit Margins:**
- ฿199 package: ~฿198 profit (99% margin)
- ฿399 package: ~฿397 profit (99.5% margin)
- ฿799 package: ~฿796 profit (99.6% margin)

**Monthly Estimates:**
- 100 readings: ฿45 cost
- 500 readings: ฿225 cost
- 1,000 readings: ฿450 cost

## 🛠️ Making Changes

All code is editable! You can:

### Update Prompts (Change reading style)
Edit: `api/tarot-reading.js` → `buildTarotPrompt()` function

### Change Pricing
Edit: `index.html` → Package cards section (search for "฿199", "฿399", "฿799")

### Modify UI/Design
Edit: `index.html` → `<style>` section at the top

### Add New Topics
Edit: `index.html` → `.topics-grid` section and `suggestions` object

### Adjust AI Model
Edit: `api/tarot-reading.js` → Change `model:` value:
- `claude-3-5-sonnet-20241022` (current - best quality)
- `claude-3-haiku-20240307` (faster, cheaper)
- `claude-3-opus-20240229` (highest quality, more expensive)

## 🔒 Security Notes

✅ **Good:**
- API key stored securely in Vercel environment variables
- Never exposed to browser/frontend
- Each request goes through your serverless function

❌ **Don't:**
- Never commit `.env` files with real keys to git
- Don't share your API key publicly
- Don't hardcode the key in `index.html`

## 📊 Monitoring Usage

**Check Claude API Usage:**
1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Navigate to **Usage**
3. See daily/monthly token usage and costs

**Check Vercel Function Calls:**
1. Go to Vercel dashboard
2. Click project → **Analytics**
3. See function invocations and bandwidth

## 🆘 Troubleshooting

### "API key not configured" error
- Make sure you added `CLAUDE_API_KEY` to Vercel environment variables
- Redeploy after adding the key

### Readings not working
1. Check browser console (F12) for errors
2. Check Vercel function logs in dashboard
3. Verify API key is valid in Anthropic console

### Slow responses
- Normal: Claude API takes 3-8 seconds for quality readings
- Consider using `claude-3-haiku` model for faster responses

### API quota exceeded
- Check usage in Anthropic console
- Add payment method or upgrade plan

## 📝 Future Enhancements

Ideas for later:
- [ ] PDF download of readings
- [ ] Email delivery
- [ ] Payment integration (Thai bank transfer + slip verification)
- [ ] Save reading history
- [ ] Line/Facebook integration
- [ ] Multi-language support

## 📞 Support

Need help? The Bot can assist with:
- Changing code
- Debugging issues
- Adding features
- Updating design

---

Built with ✨ by Bot
Powered by Claude AI (Anthropic)
