# VideoBate Session 10 Transcript — February 24, 2026
## Remove Demo Banner & Site Reframe

### Context
Part of a larger session (Session 4) that also covered BodSpas press page and domain strategy. VideoBate work began when discussing marketing strategy and the owenshroyer.com domain opportunity — the site needed to look like a real product before driving any traffic to it.

### Key Decisions

**Problem identified**: VideoBate homepage had "🚧 Demo / Pre-Launch Preview" banner, "Join the Waitlist" as primary CTA, and "⚠️ This is a demo/concept site" in footer. Not suitable for any promotional traffic.

**Solution**: Reframe around what's actually working — Fallacy Spotter game (48 fallacies with ASCII art), Quiz system, Leaderboard, Login/Auth. Position video debates as "Coming Soon" rather than the broken promise the site apologizes for.

### Changes Made

**index.html — Full reframe:**
- Hero: Demo badge → "🎯 Fallacy Spotter & Quiz — Play Free Now"
- CTAs: Waitlist → "Play Fallacy Spotter" / "Take the Quiz"  
- Stats: "50+ Debate Topics" → "25+ Fallacies to Learn / Free / Live Leaderboards"
- Nav: Removed "How It Works" and "Topics". Added Leaderboard. "Join Waitlist" → "Play Now"
- Features grid: Reordered with 3 LIVE items first (green badges), 5 COMING SOON items dimmed
- Removed "How It Works" section (3-step debate flow — unreleased)
- Removed "Topics" section (debate topic cards — unreleased)
- CTA: "Ready to Debate?" → "Ready to Sharpen Your Thinking?"
- Waitlist section reframed as "Coming Soon: Live Video Debates"
- Footer: Removed "demo/concept site" disclaimer. Updated links.

**fallacies.html — Truthopedia cleanup:**
- Removed 📺 Truthopedia button from hero (linked to Wireless Philosophy YouTube playlist — not our content)
- Removed 📺 Watch Truthopedia from bottom CTA
- Removed #Truthopedia from footer
- Bottom CTA: "Join waitlist" → "Take the Quiz" / "View Leaderboard"

**PROGRESS_LOG.md:**
- Added IP ownership statement at top

**AIUNITES infrastructure:**
- Created SESSION_CHECKLIST.md — standardized session workflow
- Updated CLAUDE.md — Development Workflow section rewritten

### Discussion Topics

**Video debate technology plan**: WebRTC for P2P video (Tier 1 MVP), structured debate system with timers/moderation (Tier 2), SFU for scale (Tier 3). Recommendation: build audience with Fallacy Spotter first, add text-based debates, then video when demand justifies cost.

**Legal considerations**: Section 230 protects platform from user speech. Need proper ToS/Privacy Policy for video content. Expensive legal (COPPA, GDPR, content moderation) is a scale problem, not a launch problem. Current Fallacy Spotter game has near-zero legal risk.

**IP ownership**: PROGRESS_LOG already documented that Tom created the original concept (Facebook post with 17 fallacy hashtags), Claude expanded to 48 with ASCII art and built all pages. Added formal IP statement. No "Built with AI" disclosure needed on public site — copyright notice sufficient.

**Session workflow standardization**: Created SESSION_CHECKLIST.md with 7-step closing checklist and 5-step opening checklist. Updated CLAUDE.md to reference it. User can say "run the session checklist" at end of any session.

### Files Modified
- videobate-site/index.html
- videobate-site/fallacies.html  
- videobate-site/PROGRESS_LOG.md
- videobate-site/UATEST_PLAN.md
- CLAUDE.md (AIUNITES root)

### Files Created
- SESSION_CHECKLIST.md (AIUNITES root)
- videobate-site/transcripts/ (directory)
- videobate-site/transcripts/2026-02-24-remove-demo-reframe.md (this file)

### Pending (for Tom)
- `git add . && git commit -m "v1.3.0: Remove demo banner, reframe around live features" && git push` for videobate-site
- `git add . && git commit -m "Add SESSION_CHECKLIST.md, update CLAUDE.md workflow" && git push` for any root-level changes
