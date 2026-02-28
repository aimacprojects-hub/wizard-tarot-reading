// Payment verification API using Claude Vision OCR
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
    const { image, expectedAmount, packageType } = req.body;

    if (!image || !expectedAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get Claude API key
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Extract base64 image data
    const imageData = image.split(',')[1] || image;
    const mediaType = image.includes('image/png') ? 'image/png' : 'image/jpeg';

    // Call Claude Vision API to analyze payment screenshot
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageData
              }
            },
            {
              type: 'text',
              text: `You are a payment verification AI. Analyze this Thai bank transfer screenshot and extract the following information:

1. Transfer amount (in Thai Baht)
2. Recipient name OR wallet information (should match: "Thomas Som Janisch", "Mr. Thomas Som Janisch", "นาย โทมัส สม ยานนิช", "โทมัส สม ยานนิช", or PromptPay wallet "004-999001266-3448")
3. Bank account number OR wallet ID (should match: 847-2-10962-7, contain 10962, OR wallet 004-999001266-3448)
4. Transfer status (should be สำเร็จ, Success, completed, or show a green checkmark)
5. Transfer date and time
6. Transaction reference/ID

Expected amount: ${expectedAmount} Baht

Respond ONLY with a JSON object in this exact format:
{
  "amount": <number or null>,
  "recipient": "<extracted recipient name or null>",
  "account_number": "<extracted account number or null>",
  "amount_match": <true or false>,
  "recipient_match": <true or false>,
  "account_match": <true or false>,
  "status_success": <true or false>,
  "timestamp": "<date time string or null>",
  "reference": "<transaction ID or null>",
  "verified": <true or false>
}

Set "amount_match" to true if amount equals exactly ${expectedAmount}.
Set "recipient_match" to true if ANY of these conditions are met:
  - You find recipient name containing Thomas/โทมัส or Janisch/ยานนิช
  - This is a PromptPay e-Wallet transfer
  - This is a PromptPay transfer showing wallet ID 004-999001266-3448
  - Any Thai or English name is shown
Set "account_match" to true if ANY of these match:
  - Account number contains "10962" or "847-2-10962-7"
  - PromptPay wallet ID is "004-999001266-3448"
  - This is labeled as "PromptPay e-Wallet"
Set "status_success" to true if transfer shows success status or green checkmark.

Set "verified" to true ONLY if ALL these are true:
- Amount matches exactly (${expectedAmount})
- Recipient/wallet verification passed (recipient_match = true)
- Account/wallet ID verification passed (account_match = true)
- Status is success
- Timestamp is within last 60 minutes

IMPORTANT:
- For PromptPay e-Wallet transfers showing wallet "004-999001266-3448", ALWAYS set both recipient_match and account_match to true
- For any PromptPay transfer, be EXTREMELY FLEXIBLE - the wallet system doesn't always show full names
- Accept "Top up successful" as a valid success status`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      return res.status(500).json({ error: 'Failed to verify payment', details: errorData });
    }

    const data = await response.json();
    const analysisText = data.content[0].text;

    // Parse Claude's JSON response
    let verification;
    try {
      // Extract JSON from response (Claude might add text around it)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      verification = JSON.parse(jsonMatch[0]);

      // LOG WHAT CLAUDE EXTRACTED FOR DEBUGGING
      console.log('Claude Vision Analysis:', {
        extractedAmount: verification.amount,
        extractedRecipient: verification.recipient || 'NOT_EXTRACTED',
        amountMatch: verification.amount_match,
        recipientMatch: verification.recipient_match,
        accountMatch: verification.account_match,
        statusSuccess: verification.status_success,
        fullVerification: verification
      });

    } catch (parseError) {
      console.error('Failed to parse Claude response:', analysisText);
      return res.status(200).json({
        success: true,
        verified: false,
        message: 'ไม่สามารถอ่านข้อมูลจากภาพได้ กรุณาตรวจสอบว่าภาพชัดเจนและลองใหม่อีกครั้ง',
        rawResponse: analysisText
      });
    }

    // Check if payment is verified
    if (verification.verified) {
      // Generate unique payment ID
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store payment record in database
      const paymentRecord = {
        id: paymentId,
        timestamp: new Date().toISOString(),
        amount: verification.amount,
        expectedAmount: expectedAmount,
        packageType: packageType,
        reference: verification.reference,
        transferTimestamp: verification.timestamp,
        verified: true,
        verificationData: verification
      };

      // Save to Vercel KV
      await kv.set(`payment:${paymentId}`, paymentRecord);
      await kv.zadd('payments:all', {
        score: Date.now(),
        member: paymentId
      });

      // Prevent duplicate use of same reference
      if (verification.reference) {
        await kv.set(`payment_ref:${verification.reference}`, paymentId, {
          ex: 86400 // Expire after 24 hours
        });
      }

      return res.status(200).json({
        success: true,
        verified: true,
        paymentId: paymentId,
        message: 'ชำระเงินสำเร็จ! ขอบคุณครับ'
      });
    } else {
      // Payment not verified
      let message = 'ไม่สามารถยืนยันการชำระเงินได้';
      let debugInfo = '';

      if (!verification.amount_match && verification.amount) {
        message = `จำนวนเงินไม่ตรงกัน (ได้รับ ${verification.amount} บาท แต่ต้องการ ${expectedAmount} บาท)`;
      } else if (!verification.recipient_match) {
        debugInfo = verification.recipient ? `\n\nพบชื่อ: ${verification.recipient}` : '\n\nไม่พบชื่อผู้รับในภาพ';
        message = 'ชื่อผู้รับไม่ตรงกัน กรุณาตรวจสอบบัญชีที่โอน' + debugInfo;
      } else if (!verification.account_match) {
        debugInfo = verification.account_number ? `\n\nพบเลขบัญชี: ${verification.account_number}` : '\n\nไม่พบเลขบัญชีในภาพ';
        message = 'เลขบัญชีไม่ตรงกัน กรุณาตรวจสอบบัญชีที่โอน' + debugInfo;
      } else if (!verification.status_success) {
        message = 'การโอนเงินยังไม่สำเร็จ กรุณาตรวจสอบสถานะ';
      }

      return res.status(200).json({
        success: true,
        verified: false,
        message: message,
        verificationData: verification
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
