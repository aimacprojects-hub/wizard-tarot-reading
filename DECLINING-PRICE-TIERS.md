# Declining Price Tier Strategy

**Purpose:** Gradual price increases as customer count grows - creates urgency and rewards early adopters

**Total Structure:** 6 Tiers (30 → 50 → 50 → 70 → 100 → Unlimited)

---

## 📊 COMPLETE PRICING TIERS

### **TIER 1: First 30 Customers (80% OFF) - LAUNCH SPECIAL** 🔥
**Customers:** 1-30
**Duration:** Launch Week (3-7 days)
**Pricing:**
- Basic (1 card + 1 follow-up): ฿99 → **฿20**
- Premium (3 cards + 2 follow-ups): ฿249 → **฿50**
- Ultimate (10 cards + 3 follow-ups): ฿399 → **฿80**

**Banner Message:** "ลด 80% สำหรับลูกค้า 30 คนแรก!"
**Goal:** Initial buzz, first reviews, test system

---

### **TIER 2: Next 50 Customers (70% OFF) - EARLY BIRD** ⚡
**Customers:** 31-80
**Duration:** 1-2 weeks
**Pricing:**
- Basic: ฿99 → **฿30**
- Premium: ฿249 → **฿75**
- Ultimate: ฿399 → **฿120**

**Banner Message:** "ลด 70% สำหรับลูกค้า 50 คนถัดไป!"
**Goal:** Build momentum, more reviews

---

### **TIER 3: Next 50 Customers (50% OFF) - HALF PRICE** 💎
**Customers:** 81-130
**Duration:** 2-3 weeks
**Pricing:**
- Basic: ฿99 → **฿50**
- Premium: ฿249 → **฿125**
- Ultimate: ฿399 → **฿200**

**Banner Message:** "ลด 50% ราคาครึ่งเดียว!"
**Goal:** "Half price" psychological appeal

---

### **TIER 4: Next 70 Customers (30% OFF) - SPECIAL DISCOUNT** 🌟
**Customers:** 131-200
**Duration:** 3-4 weeks
**Pricing:**
- Basic: ฿99 → **฿70**
- Premium: ฿249 → **฿175**
- Ultimate: ฿399 → **฿280**

**Banner Message:** "ลด 30% ส่วนลดพิเศษ!"
**Goal:** Still attractive discount, building toward full price

---

### **TIER 5: Next 100 Customers (15% OFF) - FINAL DISCOUNT** ✨
**Customers:** 201-300
**Duration:** 1-2 months
**Pricing:**
- Basic: ฿99 → **฿85**
- Premium: ฿249 → **฿212**
- Ultimate: ฿399 → **฿340**

**Banner Message:** "ส่วนลดสุดท้าย 15%!"
**Goal:** Last chance discount before full price

---

### **TIER 6: Permanent Pricing (FULL PRICE)** 👑
**Customers:** 301+
**Duration:** Permanent
**Pricing:**
- Basic: **฿99**
- Premium: **฿249**
- Ultimate: **฿399**

**Banner Message:** Remove promotion banner entirely
**Goal:** Sustainable long-term pricing

---

## 🔄 HOW TO UPDATE TIERS

### After Each Customer Payment:

**Step 1: Update CUSTOMER-COUNT.md**
- Increment total customer count
- Check which tier you're now in
- Update current tier status

**Step 2: Update Prices in index.html**

**CRITICAL LOCATIONS TO UPDATE:**

1. **Pricing Page Package Cards (Lines ~1007-1046)**
   ```html
   <!-- Basic Package -->
   <span style="...">฿99</span>  <!-- Original price -->
   <span style="...">฿20</span>  <!-- Current tier price -->

   <!-- Premium Package -->
   <span style="...">฿249</span>  <!-- Original price -->
   <span style="...">฿50</span>   <!-- Current tier price -->

   <!-- Ultimate Package -->
   <span style="...">฿399</span>  <!-- Original price -->
   <span style="...">฿80</span>   <!-- Current tier price -->
   ```

2. **selectPackageWithPrice() function calls**
   ```html
   onclick="selectPackageWithPrice('quick', 1, 1, 'basic', 20)"
   onclick="selectPackageWithPrice('deep', 3, 2, 'premium', 50)"
   onclick="selectPackageWithPrice('complete', 10, 3, 'ultimate', 80)"
   ```
   Update the last parameter (current tier price)

3. **Promotion Banner (Lines ~1003 and ~1147)**
   Update discount percentage and message based on tier

**Step 3: Commit and Deploy**
```bash
cd /workspace/group/wizard-interactive-v2
git add -A
git commit -m "Update to Tier X pricing (Y customers)"
git push origin master
```

---

## 📋 TIER TRANSITION CHECKLIST

### When hitting 30 customers (Tier 1 → Tier 2):
- [ ] Update all prices: ฿20→฿30, ฿50→฿75, ฿80→฿120
- [ ] Update banner: "ลด 70% สำหรับลูกค้า 50 คนถัดไป!"
- [ ] Update function calls with new prices
- [ ] Test checkout flow with new prices
- [ ] Announce tier change on Facebook

### When hitting 80 customers (Tier 2 → Tier 3):
- [ ] Update all prices: ฿30→฿50, ฿75→฿125, ฿120→฿200
- [ ] Update banner: "ลด 50% ราคาครึ่งเดียว!"
- [ ] Update function calls
- [ ] Announce "Half Price" milestone

### When hitting 130 customers (Tier 3 → Tier 4):
- [ ] Update all prices: ฿50→฿70, ฿125→฿175, ฿200→฿280
- [ ] Update banner: "ลด 30% ส่วนลดพิเศษ!"
- [ ] Update function calls

### When hitting 200 customers (Tier 4 → Tier 5):
- [ ] Update all prices: ฿70→฿85, ฿175→฿212, ฿280→฿340
- [ ] Update banner: "ส่วนลดสุดท้าย 15%!"
- [ ] Announce "Final Discount" urgency

### When hitting 300 customers (Tier 5 → Tier 6):
- [ ] Update all prices: ฿85→฿99, ฿212→฿249, ฿340→฿399
- [ ] **REMOVE** promotion banner entirely
- [ ] Update to show normal pricing only
- [ ] Announce transition to full price

---

## 💡 MARKETING STRATEGY PER TIER

### Tier 1 (80% OFF):
- "Launch Special - Get in Early!"
- Focus on initial reviews and testimonials
- Heavy promotion on Facebook

### Tier 2 (70% OFF):
- "Early Bird Pricing - Still Amazing Deal!"
- Use initial success stories
- Build social proof

### Tier 3 (50% OFF):
- "Half Price Week - Don't Miss Out!"
- Psychological appeal of 50%
- Create urgency for last major discount

### Tier 4 (30% OFF):
- "Final Chance for Big Discount"
- Moving toward full price
- Emphasize value vs discount

### Tier 5 (15% OFF):
- "Last 100 Customers Get 15% Off!"
- Very clear end point
- Serious urgency

### Tier 6 (Full Price):
- Focus on value, not discount
- Emphasize quality and results
- Use customer success stories

---

## 🎯 REVENUE PROJECTION BY TIER

| Tier | Customers | Avg Price | Revenue | Cumulative |
|------|-----------|-----------|---------|------------|
| 1 | 30 | ฿50 | ฿1,500 | ฿1,500 |
| 2 | 50 | ฿75 | ฿3,750 | ฿5,250 |
| 3 | 50 | ฿125 | ฿6,250 | ฿11,500 |
| 4 | 70 | ฿175 | ฿12,250 | ฿23,750 |
| 5 | 100 | ฿212 | ฿21,200 | ฿44,950 |
| 6 | 50 | ฿249 | ฿12,450 | ฿57,400 |

**After 350 customers:** ~฿57,400 revenue (+฿11,400 vs old pricing)

---

## 🚨 CRITICAL REMINDERS

1. **NEVER skip tiers** - must go through each one sequentially
2. **Update ALL locations** - pricing page, payment page, function calls
3. **Test before announcing** - verify new prices work correctly
4. **Announce tier changes** - create urgency on Facebook
5. **Track precisely** - use CUSTOMER-COUNT.md religiously
6. **Commit changes** - git history tracks all tier transitions

---

**Current Status:** TIER 1 (0/30 customers)
**Next Milestone:** 30 customers → Switch to TIER 2 (70% off)
**Last Updated:** March 2, 2026

**This is CRITICAL for revenue growth! Don't lose this file!** 🎯
