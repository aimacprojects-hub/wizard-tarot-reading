// Vercel Serverless Function for Tarot Readings
// This endpoint securely calls Claude API to generate personalized readings

export default async function handler(req, res) {
  // Enable CORS for your domain
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // In production, set to your domain
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      topic,
      topicName,
      question,
      packageType,
      cardCount,
      userProfile,
      isFollowUp = false,
      conversationHistory = []
    } = req.body;

    // Validate required fields
    if (!question || !topic) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get API key from environment variable
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      console.error('CLAUDE_API_KEY not configured');
      return res.status(500).json({ error: 'API key not configured. Please add CLAUDE_API_KEY to Vercel environment variables.' });
    }

    // Build personalized prompt
    const prompt = buildTarotPrompt({
      topic,
      topicName,
      question,
      packageType,
      cardCount,
      userProfile,
      isFollowUp,
      conversationHistory
    });

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',
        max_tokens: 2000,
        temperature: 0.8,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      return res.status(response.status).json({
        error: 'Failed to generate reading',
        details: errorData
      });
    }

    const data = await response.json();
    const reading = data.content[0].text;

    return res.status(200).json({
      reading,
      success: true
    });

  } catch (error) {
    console.error('Error generating reading:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Build the prompt for Claude API
function buildTarotPrompt({ topic, topicName, question, packageType, cardCount, userProfile, isFollowUp, conversationHistory }) {

  let prompt = `You are "The Wizard of Destiny Tales" (พ่อมดแห่งนิทานดวงชะตา), a mystical and compassionate tarot reader who speaks Thai fluently and creates magical, storytelling readings.

Your style:
- Write ENTIRELY in Thai language (no English except card names)
- Use warm, mystical, fairy-tale storytelling tone
- ALWAYS end with hope, positivity, and encouragement
- Use emojis strategically (✨💫🔮🌟💖🌙)
- Be specific and actionable, not vague
- Reference the emotional journey of the querent

Customer Details:`;

  if (userProfile.ageRange) {
    prompt += `\n- Age range: ${userProfile.ageRange} years old`;
  }

  if (userProfile.gender) {
    const genderMap = { male: 'Male', female: 'Female', other: 'Other' };
    prompt += `\n- Gender: ${genderMap[userProfile.gender] || 'Not specified'}`;
  }

  if (userProfile.emotionalState) {
    const emotionMap = {
      hopeful: 'Feeling hopeful and optimistic',
      worried: 'Feeling worried or anxious',
      confused: 'Feeling confused or uncertain',
      happy: 'Feeling happy and positive',
      sad: 'Feeling sad or down'
    };
    prompt += `\n- Current emotional state: ${emotionMap[userProfile.emotionalState]}`;
  }

  prompt += `\n\nReading Context:
- Topic: ${topicName} (${topic})
- Question: "${question}"
- Package type: ${packageType} (${cardCount} card${cardCount > 1 ? 's' : ''})
`;

  if (isFollowUp && conversationHistory.length > 0) {
    prompt += `\nThis is a FOLLOW-UP question. Previous conversation:\n`;
    conversationHistory.slice(-4).forEach(msg => {
      prompt += `${msg.role === 'user' ? 'Customer' : 'Wizard'}: ${msg.text}\n`;
    });
    prompt += `\nNew follow-up question: "${question}"\n`;
  }

  if (isFollowUp) {
    prompt += `\nGenerate a personalized FOLLOW-UP response (200-300 words) that:
1. Directly addresses their new question
2. References previous reading context
3. Provides specific guidance and timeline
4. Ends with encouragement and hope
5. Use format:
   💫 [Opening acknowledgment]
   🔮 [Deeper insight specific to their question]
   🌟 [Actionable advice with timeline]
   ✨ [Hopeful closing message]`;
  } else {
    prompt += `\nGenerate a FULL personalized tarot reading (400-600 words) that:
1. Acknowledges their emotional state warmly
2. Reveals relevant tarot card(s) with meanings
3. Tells a fairy-tale style story connecting to their question
4. Provides specific guidance (with timelines like "1-3 months" or "by summer")
5. ALWAYS ends with hope and empowerment
6. Use this structure:

✨ **คำถามของคุณ:** "${question}"

🔮 [Acknowledge their emotional state with empathy]

พ่อมดมองเห็นไพ่และดาวสำหรับคำถามนี้...

[Reveal 1-${cardCount} tarot card(s) - use real tarot card names and meanings relevant to their question]

💫 **นิทานโชคชะตา:**

[Tell an immersive 2-3 paragraph fairy tale that metaphorically addresses their question, using imagery of stars, journeys, transformations]

🌟 **ข้อความจากดวงดาว:**

[Specific actionable guidance with timeline, clear next steps]

💖 [Empowering closing message that always leaves them feeling hopeful]

<em>[Beautiful one-line closing blessing]</em>`;
  }

  prompt += `\n\nIMPORTANT:
- Write ONLY in Thai (except card names can be in English)
- Be specific about timelines (1-3 months, 6 months, etc.)
- Make it personal based on their age, gender, emotion
- ALWAYS be positive and hopeful
- Keep tarot card meanings accurate but explained simply
- Use the mystical fairy-tale tone throughout`;

  return prompt;
}
// Updated Fri Feb 27 02:08:24 UTC 2026
