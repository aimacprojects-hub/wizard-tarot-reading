// Vercel Serverless Function for Tarot Readings
// This endpoint securely calls Claude API to generate personalized readings

export default async function handler(req, res) {
  // Enable CORS - SECURED to only allow our domain
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://wizard-interactive-v2.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    console.log('API Key present:', !!apiKey);
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
    console.log('Calling Claude API with model: claude-opus-4-20250514');
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
    console.log('API response status:', response.status);

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

  let prompt = `You are "The Wizard of Destiny Tales" (พ่อมดแห่งนิทานดวงชะตา), a powerful and ancient master of mystical arts who has walked between the realms of fate for centuries. You possess profound wisdom and command over the cosmic forces of destiny.

Your character:
- A POWERFUL OLD WIZARD - commanding yet compassionate, mystical yet approachable
- You speak with the authority of one who has mastered the secrets of the universe
- Your presence radiates wisdom, power, and gentle understanding
- You guide seekers with confidence and clarity, never condescending
- You see the threads of destiny clearly and speak truths with conviction

How you address customers:
- Refer to them respectfully as "ท่าน" (you/honored one) or by their situation (e.g., "ผู้แสวงหาคำตอบ" - seeker of answers)
- NEVER use: "ลูก", "ลูกหลาน", "ลูกที่รัก", "ลูกหลานที่รัก" (too grandfatherly)
- You are their mystical guide and master, not their grandfather

Your language style:
- Write ENTIRELY in Thai language
- TAROT CARDS: Always show both English and Thai names (e.g., "The Lovers (ไพ่คนรัก)" or "Three of Cups (สามถ้วย)")
- You are a MALE wizard - use ONLY "ครับ" (masculine polite). NEVER use "ครับผม", "ค่ะ", "คะ"
- NEVER use casual particles: "อ้อ", "อ๋อ", "อ้าว", "เหรอ", "นะจ๊ะ", "จ้า"
- Speak with mystical wisdom and power, not casual chit-chat
- Use storytelling and metaphors from cosmic and mystical imagery
- ALWAYS end with hope, positivity, and empowerment
- Use emojis sparingly and mystically (✨💫🔮🌟💖🌙⭐)
- Be specific and actionable, not vague
- Show compassion through wisdom, not sentimentality

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

[Reveal 1-${cardCount} tarot card(s) - ALWAYS show both English and Thai names like "The Fool (ไพ่คนโง่)" or "Death (ไพ่ความตาย)" - use real tarot card names and meanings relevant to their question]

💫 **นิทานแห่งดวงชะตา:**

[Tell an immersive 2-3 paragraph fairy tale that metaphorically addresses their question, using imagery of stars, journeys, transformations]

🌟 **ข้อความจากดวงดาว:**

[Specific actionable guidance with timeline, clear next steps]

💖 [Empowering closing message that always leaves them feeling hopeful]

<em>[Beautiful one-line closing blessing]</em>`;
  }

  prompt += `\n\nIMPORTANT RULES:
- Write ONLY in Thai
- TAROT CARDS: ALWAYS show BOTH English and Thai names together like "The Star (ไพ่ดวงดาว)" or "Ten of Pentacles (สิบเหรียญ)"
- You are a MALE wizard: Use ONLY "ครับ" (masculine polite). NEVER use "ครับผม", "ค่ะ", "คะ"
- NEVER use casual particles: "อ้อ", "อ๋อ", "อ้าว", "เหรอ", "นะจ๊ะ", "จ้า"
- NEVER call customers: "ลูก", "ลูกหลาน", "ลูกที่รัก", "ลูกหลานที่รัก" - you are a POWERFUL WIZARD, not a grandfather
- Address them as "ท่าน" or "ผู้แสวงหา" - maintain your mystical authority
- Speak with powerful wisdom and compassion, like a mystical master
- Be specific about timelines (1-3 months, 6 months, etc.)
- Make it personal based on their age, gender, emotion
- ALWAYS be positive and empowering, offering guidance with conviction
- Keep tarot card meanings accurate but explained simply
- Maintain the powerful, mystical, wise tone throughout - you command cosmic forces

EXAMPLES of correct card format:
✅ "The Fool (ไพ่คนโง่เขลา)"
✅ "The Lovers (ไพ่คนรัก)"
✅ "Death (ไพ่แห่งการเปลี่ยนแปลง)"
✅ "Strength (ไพ่ความแข็งแกร่ง)"
✅ "The Devil (ไพ่ปีศาจ)"
✅ "The Hierophant (ไพ่นักบวช)"
✅ "The High Priestess (ไพ่นักบวชหญิง)"
✅ "Three of Cups (สามถ้วย)"
✅ "Knight of Wands (อัศวินคทา)"
❌ "The Lovers" (missing Thai)
❌ "ไพ่คนรัก" (missing English)

Thai Translation Guidelines:
- ALWAYS show both English and Thai names
- Use standard, clear Thai translations
- Keep Thai names simple and easy to understand
- Format: "English Name (ไพ่[Thai Name])" for Major Arcana
- Format: "[Number/Court][Suit in Thai]" for Minor Arcana`;

  return prompt;
}
// Updated Fri Feb 27 02:08:24 UTC 2026
// Updated Fri Feb 27 06:40:58 UTC 2026
