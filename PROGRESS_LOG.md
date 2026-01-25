# VideoBate Development Progress Log

## Project Overview
VideoBate - Live Video Debate Platform with integrated critical thinking tools.

---

## Session 9: Admin Panel & Navigation Bug Fixes (January 25, 2026)

### Created: `admin.html`

Full admin panel with:
- **Dashboard**: Stats display, quick links
- **SQL Database**: Database selector, query interface, GitHub sync
- **Users**: User management table with role badges
- **Settings**: Registration settings, game settings, danger zone
- Sidebar navigation with icons
- Admin-only access check
- User dropdown menu

### Updated Navigation

- **index.html**: Added user dropdown with Admin Panel link
- **fallacies.html**: Added user dropdown with Admin Panel link

### Bug Fix: Login Not Saving User

**Problem**: After logging in, profile.html showed "Guest" and "Loading..." instead of the admin user data.

**Root Cause**: `SQLDatabase.authenticateUser()` is an `async` function but was being called without `await` in login.html. This caused a Promise object to be saved to localStorage instead of the actual user data.

**Fix**: Changed line in login.html from:
```javascript
user = SQLDatabase.authenticateUser(emailOrUsername, password);
```
To:
```javascript
user = await SQLDatabase.authenticateUser(emailOrUsername, password);
```

### Files Modified

| File | Changes |
|------|--------|
| `admin.html` | **NEW** - Complete admin panel |
| `index.html` | Added user dropdown menu with Admin link |
| `fallacies.html` | Added user dropdown menu with Admin link |
| `login.html` | Fixed async/await bug in SQL authentication |

---

## Session 8: Reusable Cloud Database Module (January 24, 2026)

### Created: `js/cloud-database.js`

A reusable module that can be added to ANY AIUNITES site to enable cloud sync.

**Features:**
- Toggle between Online/Offline mode
- Submit data to shared Google Form
- Fetch data from Apps Script API
- Auto-render admin settings panel
- Support for multiple data types (USER, SCORE, WAITLIST, CONTACT, FEEDBACK)

**Usage in any site:**
```html
<script src="js/cloud-database.js"></script>
<script>
  CloudDB.init({ siteName: 'MySiteName' });
  
  // Submit data
  CloudDB.submit('WAITLIST', { email: 'user@example.com', name: 'John' });
  
  // Fetch data
  const result = await CloudDB.fetch('users');
  
  // Render admin panel
  CloudDB.renderAdminPanel('containerId');
</script>
```

### Admin Panel Updates

- Added **⚙️ Settings** tab to sidebar
- Settings tab includes:
  - Cloud Database toggle (Online/Offline)
  - Apps Script API URL configuration  
  - Site name configuration
  - Data export (JSON backup)
  - Clear all local data

### Users Tab Improvements

- Now shows **merged view** of Local + Cloud users
- Visual indicators:
  - 💾 Local (purple badge)
  - ☁️ Cloud (cyan badge, cyan/green avatar)
- 🔄 Sync Cloud button to refresh
- Cloud users shown as read-only (no edit/delete)

### Files Created/Modified

| File | Changes |
|------|---------|
| `js/cloud-database.js` | **NEW** - Reusable cloud DB module |
| `js/apps-script-code.js` | **NEW** - Enhanced Apps Script with all data types |
| `admin.html` | Added Settings tab, merged Users view, CloudDB integration |
| `index.html` | Added Login link to navigation |

### How to Add Cloud DB to Other Sites

1. **Copy `js/cloud-database.js`** to the site's js folder
2. **Add script tag** in HTML: `<script src="js/cloud-database.js"></script>`
3. **Initialize in your code:**
   ```javascript
   CloudDB.init({ siteName: 'YourSiteName' });
   ```
4. **For admin pages**, add a container and render the panel:
   ```html
   <div id="cloudSettings"></div>
   <script>CloudDB.renderAdminPanel('cloudSettings');</script>
   ```
5. **Users configure** the API URL in their browser (stored in localStorage)

---

## Session 7: Unified Cloud Database via Single Google Form (January 24, 2026)

### Key Innovation: Packed Data Format

Instead of creating separate forms for users and scores, we pack all data into the **existing Help/Feedback form's message field** using a delimiter format:

```
TYPE|field1|field2|field3|...
```

**User Registration:**
```
USER|username|email|password|firstName|lastName|role|createdAt
```

**Quiz Score:**
```
SCORE|username|displayName|score|correct|wrong|streak|mode|timestamp
```

### Form Configuration (Hardcoded)

| Entry ID | Field | Usage |
|----------|-------|-------|
| `entry.904300305` | Email | User's email |
| `entry.2053726945` | Source | Identifies origin (e.g., "FallacySpotter-Registration") |
| `entry.1759393763` | Message | **Packed data goes here** |

**Form URL:** `https://docs.google.com/forms/d/e/1FAIpQLSeQUi49AdTBRjetz5MDFQgMIkm9-vOMb_ARKwYEz41j_Nfiwg/formResponse`

### Apps Script (Parses Packed Data)

```javascript
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().toLowerCase().trim());
  
  // Find the message column (contains packed data)
  const msgIdx = headers.findIndex(h => h.includes('message') || h.includes('feedback'));
  
  const users = [];
  const scores = [];
  
  data.slice(1).forEach(row => {
    const message = msgIdx >= 0 ? row[msgIdx] : '';
    if (!message || typeof message !== 'string') return;
    
    const parts = message.split('|');
    const type = parts[0];
    
    if (type === 'USER' && parts.length >= 8) {
      users.push({
        username: parts[1],
        email: parts[2],
        password: parts[3],
        firstName: parts[4],
        lastName: parts[5],
        role: parts[6] || 'user',
        createdAt: parts[7]
      });
    } else if (type === 'SCORE' && parts.length >= 9) {
      scores.push({
        username: parts[1],
        displayName: parts[2],
        score: parseInt(parts[3]) || 0,
        correct: parseInt(parts[4]) || 0,
        wrong: parseInt(parts[5]) || 0,
        streak: parseInt(parts[6]) || 0,
        mode: parts[7],
        timestamp: parts[8]
      });
    }
  });
  
  // Return based on ?type= parameter
  const requestType = e?.parameter?.type || 'users';
  const result = requestType === 'scores' ? scores : users;
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**API Endpoints:**
- `?type=users` → Returns user accounts
- `?type=scores` → Returns quiz scores

### Files Modified

| File | Changes |
|------|--------|
| **login.html** | Hardcoded form constants, submits USER data to message field |
| **quiz.html** | Hardcoded form constants, submits SCORE data to message field |
| **admin.html** | Simplified User Database tab, added Cloud Scores table, new Apps Script code |
| **leaderboard.html** | Updated to use `?type=scores` endpoint |

### Setup (Just 3 Steps!)

1. **Open your Google Sheet** (linked to Help/Feedback form)
2. **Add Apps Script**: Extensions → Apps Script → paste code → Deploy as Web App
3. **Paste URL in Admin Panel** → User Database tab → Save

### Benefits

✅ **Single form** for everything (users, scores, feedback)  
✅ **No new forms** to create  
✅ **One API** serves both users and scores  
✅ **Backwards compatible** with existing Help/Feedback submissions  
✅ **3-step setup** instead of complex multi-form configuration

---

## Session 6: Global Leaderboard via Google Forms (January 23, 2026)

### Architecture: Fully Automatic with Live Data

```
┌─────────────┐     ┌───────────────┐     ┌─────────────────┐
│   PLAYER    │ ───▶ │  GOOGLE FORM  │ ───▶ │  GOOGLE SHEET   │
│  Completes  │     │  (collects    │     │  (stores data)  │
│    Quiz     │     │   responses)  │     │                 │
└─────────────┘     └───────────────┘     └────────┬────────┘
                                                   │
                                                   ▼
                                            ┌─────────────────┐
                                            │  APPS SCRIPT    │
                                            │  (Web App API)  │
                                            └────────┬────────┘
                                                   │
                                                   ▼
┌───────────────────────────────────────────────────┐
│              LEADERBOARD PAGE                     │
│  🟢 LIVE - Fetches data automatically on load    │
└───────────────────────────────────────────────────┘
```

**No manual admin work needed!** Data flows automatically.

### New Features

#### admin.html - Live Data URL Configuration
- **New green-highlighted card** for Apps Script Web App URL
- Save URL button
- Test Connection button (verifies API works)
- Full setup instructions with copyable Apps Script code

#### leaderboard.html - Live Fetching
- Automatically fetches from Apps Script URL if configured
- Shows "🟢 LIVE" indicator with game/player count
- Loading state while fetching
- Error handling with fallback to cached data
- Falls back to CSV-uploaded data if no live URL

### Apps Script Code (included in admin panel)

```javascript
function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().toLowerCase().trim());
  
  const results = data.slice(1).map(row => {
    return {
      timestamp: row[headers.indexOf('timestamp')] || new Date().toISOString(),
      username: row[headers.indexOf('username')] || 'unknown',
      displayName: row[headers.indexOf('display name')] || 'Unknown',
      score: parseInt(row[headers.indexOf('score')]) || 0,
      correct: parseInt(row[headers.indexOf('correct')]) || 0,
      wrong: parseInt(row[headers.indexOf('wrong')]) || 0,
      streak: parseInt(row[headers.indexOf('streak')]) || 0,
      mode: row[headers.indexOf('mode')] || 'practice'
    };
  }).filter(r => r.username !== 'unknown');
  
  return ContentService
    .createTextOutput(JSON.stringify(results))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Data Flow Options

| Method | Manual Work | Realtime |
|--------|------------|----------|
| ✅ Live URL (Apps Script) | None! | Yes |
| CSV Upload | Download CSV, upload | No |

### localStorage Keys Added
| Key | Purpose |
|-----|--------|
| `fallacySpotter_liveDataUrl` | Apps Script Web App URL |

---

## Session 5: Password Reset & User Settings (January 23, 2026)

### New Files Created

#### reset-password.html - Info Page (No Central Database)
- Explains localStorage limitations
- Directs users to contact admin for password reset
- Options: Admin reset, Clear browser data, Create new account
- Links back to login page

**Why no self-service password reset?**
> Without a central database/server, there's no email verification possible.
> All data is in the user's browser only. "Multi-user" = multiple accounts in same browser.

#### settings.html - User Settings Dashboard
- **5 Settings Tabs:**
  - 👤 Profile - Edit name, username, email
  - 🔒 Security - Change password, view sessions
  - 🎨 Preferences - Game settings, display options
  - 💾 Data - Export data, reset stats
  - ⚠️ Danger Zone - Delete account

- **Profile Section:**
  - Avatar preview (auto-generated from initials)
  - Edit first/last name, username, email
  - View account type and member since date

- **Security Section:**
  - Change password form with validation
  - Active sessions view

- **Preferences Section:**
  - Sound effects toggle
  - Animations toggle
  - Show explanations toggle
  - Auto-advance questions toggle
  - Default game mode selector

- **Data Section:**
  - Stats summary (score, games, correct, wrong, streak)
  - Export data as JSON file
  - Copy data to clipboard
  - Reset all stats button

- **Danger Zone:**
  - Delete account (with triple confirmation)
  - Log out everywhere

### Updated Files
- **login.html** - "Forgot password?" now links to reset-password.html
- **profile.html** - Added "⚙️ Settings" button to quick actions
- **admin.html** - Added 🔑 password reset button for each user in Users table
  - Admin can reset any user's password via prompt
  - Shows username and confirms new password

### localStorage Architecture (Demo Limitations)

**How "Multi-User" Works Without a Server:**
```
┌─────────────────────────────────────────────────────┐
│  Browser A (Tom's Computer)                         │
│  ┌─────────────────────────────────────────────┐   │
│  │ localStorage                                │   │
│  │  • fallacySpotter_users = [admin, sarah...] │   │
│  │  • fallacySpotter_currentUser = admin       │   │
│  │  • fallacySpotter_games_123 = [...]         │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Browser B (Different Computer)                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ localStorage                                │   │
│  │  • fallacySpotter_users = [different data!] │   │
│  │  • (Completely separate from Browser A)     │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Implications:**
- Each browser has its own isolated user database
- "Leaderboard" only shows users from YOUR browser
- Clearing browser data = losing ALL accounts
- No cross-device sync possible
- Password reset requires admin on SAME browser

### localStorage Keys Used
| Key | Purpose |
|-----|--------|
| `fallacySpotter_users` | All user accounts |
| `fallacySpotter_currentUser` | Logged in user |
| `fallacySpotter_games_[id]` | Game history per user |
| `fallacySpotter_prefs_[id]` | User preferences |

---

## Session 4: User Login & Admin Panel (January 23, 2026)

### New Files Created

#### login.html - User Authentication
- Sign In / Create Account tabs
- **Demo Mode Banner** at top of page
- **Quick Demo Login** buttons for instant access:
  - Admin: `admin` / `admin123`
  - Sarah Logic: `sarahlogic` / `password123`
  - Mike Reason: `mikereason` / `password123`
- **Browser Storage Info** section showing what's saved
- **Clear All Data** button to reset everything
- **Changelog** with version history
- Form validation & password toggle
- "Continue as Guest" option
- First user automatically becomes admin
- Auto-creates 5 demo users on first load

#### profile.html - User Dashboard
- Profile header with avatar & badges
- Stats grid: Score, Games, Accuracy, Streak
- All badges (earned + locked)
- Leaderboard preview
- Recent games history
- Quick actions (Play, Study, Admin)

#### admin.html - Admin Panel
- Sidebar navigation
- Dashboard with stats overview
- User management (CRUD)
- Question bank management
- Fallacy database overview
- Reports & analytics
- Add User / Add Question modals

#### leaderboard.html - Global Rankings
- Animated podium for top 3
- Full ranked list
- Sort by: Score, Accuracy, Games
- Current user highlighted
- Guest-friendly view

### Updated Files
- **quiz.html** - Integrated with user system
  - Saves scores to user profile
  - Tracks game history
  - Auto-awards badges
  - Works in guest mode too

### User System Features
- LocalStorage-based authentication
- Role-based access (user/admin)
- Persistent stats tracking
- Badge earning system
- Game history
- Profile customization

### Badge System (12 badges)
| Badge | Requirement |
|-------|-------------|
| 🏆 Perfect Score | 100% on a quiz |
| 🔥 Hot Streak | 5+ correct in a row |
| ⚡ On Fire | 10+ correct in a row |
| 🎮 Regular Player | Play 10 games |
| 🎯 Dedicated | Play 50 games |
| 💎 Diamond | Earn 1000 points |
| 👑 Champion | Earn 5000 points |
| 🎯 Sharp Eye | 80%+ accuracy |
| 🧠 Quiz Master | Master all categories |
| ⏱️ Speedster | Win 5 timed games |
| 💀 Survivor | 100+ in survival |
| 👨‍🏫 Teacher | Share score 5 times |

---

## Session 3: Interactive Quiz + More Fallacies (January 23, 2026)

### New Files Created
- **quiz.html** - Interactive fallacy quiz game with:
  - 3 game modes: Practice, Timed (30s), Survival
  - 20+ scenario-based questions across Easy/Medium/Hard
  - Real-time scoring with streak bonuses
  - ASCII art explanations after each answer
  - Badges and achievements
  - Progress tracking

### New Fallacy Categories Added

#### ⚔️ Advanced Debate Tactics (6 new)
| Code | Name | Description |
|------|------|-------------|
| GISH | Gish Gallop | Overwhelming with too many claims |
| SEAL | Sea Lioning | "Just asking questions" harassment |
| DARV | DARVO | Deny, Attack, Reverse Victim/Offender |
| TONE | Tone Policing | Dismissing based on delivery |
| NIRV | Nirvana Fallacy | Rejecting imperfect solutions |
| CLIC | Thought-Terminating Cliché | Phrases that end discussion |

#### ⚡ Causation Errors (6 new)
| Code | Name | Description |
|------|------|-------------|
| POST | Post Hoc | "After = because of" error |
| TEXA | Texas Sharpshooter | Drawing target after shooting |
| SING | Single Cause Fallacy | Ignoring multiple factors |
| NATU | Appeal to Nature | Natural = good fallacy |
| NOVL | Appeal to Novelty | New = better fallacy |
| SUNK | Sunk Cost Fallacy | Continuing due to past investment |

### Total Fallacy Count: 48 types

### UI Updates
- Added "🧠 Take the Quiz" button to hero section
- Updated stats bar to show "48 Fallacy Types"
- Added quiz link to CTA section

---

## Session 2: Expanded Fallacy Library with ASCII Art (January 23, 2026)

### Changes Made
- Expanded from 12 to **36 fallacy types** across 6 categories
- Added **ASCII art illustrations** for every fallacy
- Organized into color-coded categories:
  - 👤 Attack the Person (red)
  - 🐟 Misdirection (orange)
  - 🎓 False Authority (purple)
  - 🧠 Logic Errors (cyan)
  - 🎭 Manipulation (pink)
  - 🗳️ Political Tactics (green)

### Complete Fallacy List (36 types)

#### Attack the Person (Ad Hominem)
| Code | Name | Description |
|------|------|-------------|
| CHAR | Character Assassination | Attacking character to discredit argument |
| SHTM | Shooting the Messenger | Dismissing info based on who delivers it |
| WELL | Poisoning the Well | Preemptive discrediting before argument |
| MOTV | Appeal to Motive | Dismissing based on assumed motives |
| ASSOC | Association Fallacy | Guilt/credit by association |
| CRED | Credibility Attack | Undermining credibility on unrelated matters |

#### Misdirection (Red Herring)
| Code | Name | Description |
|------|------|-------------|
| RHER | Red Herring | Introducing irrelevant topic |
| STRW | Straw Man | Misrepresenting argument to attack |
| WHAT | Whataboutism | Deflecting with "what about..." |
| GOAL | Moving Goalposts | Changing criteria after met |
| DISC | Discrediting Tactic | Undermining without engaging |
| FAIR | Fair Game Fallacy | "They deserve it" justification |

#### False Authority
| Code | Name | Description |
|------|------|-------------|
| AUTH | Appeal to Authority | Citing unqualified authority |
| POPUL | Appeal to Popularity | "Everyone believes it" |
| CHRY | Cherry Picking | Selective evidence |
| ANEC | Anecdotal Evidence | Personal stories as proof |
| HOST | Hostile Witness | Treating opposition as bad faith |
| TRAD | Appeal to Tradition | "Always done this way" |

#### Logic Errors
| Code | Name | Description |
|------|------|-------------|
| COMP | Comparing Inequivalents | False equivalence |
| FLSD | False Dilemma | Only 2 options presented |
| SLIP | Slippery Slope | Extreme consequences claimed |
| CIRC | Circular Reasoning | Conclusion as premise |
| LOAD | Loaded Question | Built-in assumption trap |
| IGNR | Argument from Ignorance | "Can't prove it false" |

#### Manipulation
| Code | Name | Description |
|------|------|-------------|
| GASL | Gaslighting | Making someone doubt reality |
| FEAR | Appeal to Fear | Using fear to persuade |
| EMOT | Appeal to Emotion | Emotional manipulation |
| GAMB | Gambler's Fallacy | Past affects future random events |
| PROJ | Projection | Accusing others of your behavior |
| BAND | Bandwagon Effect | "Everyone's doing it" |

#### Political Tactics
| Code | Name | Description |
|------|------|-------------|
| NEGC | Negative Campaigning | Only attacking, no positions |
| CARD | Playing a Card | Identity to deflect criticism |
| REPU | Reputation Attack | Damaging reputation vs arguing |
| SPCT | Appeal to Spectacle | Drama over substance |
| SILC | Silencing Tactic | Preventing speech vs rebutting |
| VIRT | Virtue Signaling | Positions for approval, not belief |

---

## Session 1: Fallacies Game Feature Spec (January 23, 2026)

### Background
User had a Facebook post about a "Fallacies Game" that was banned as spam. The concept involves identifying logical fallacies in arguments using hashtags. VideoBate was identified as the ideal platform for this feature due to its debate-focused nature.

### Original Concept (from Facebook post)
```
Fallacies Game, Is the argument?
Post #Fallacy and One of these:
#AppealToAuthority, #AppealToMotive, #AssociationFallacy, 
#CharacterAssassination, #Credibility, #DiscreditingTactic, 
#FairGame, #Gaslighting, #HostileWitness, #NegativeCampaigning, 
#PoisoningTheWell, #RaceCard, #RedHerring, #Reputation, 
#ShootingTheMessenger, #StrawMan, #ComparingInequivalents
```

---

## FALLACIES GAME - FEATURE SPECIFICATION

### 1. Feature Overview

**Name:** Fallacy Spotter / Critical Thinking Game  
**Tagline:** "Spot the Fallacy, Sharpen Your Mind"  
**Integration:** Core feature of VideoBate platform

### 2. Game Modes

#### Mode A: Live Debate Tagging
- Viewers watch live debates
- Tag fallacies in real-time as debaters speak
- Timestamp + fallacy type logged
- Points awarded for correct identifications (verified by AI + community consensus)
- Leaderboard for top fallacy spotters

#### Mode B: Training Mode (Solo)
- Watch curated video clips of arguments
- Identify the fallacy being used
- Multiple choice or free selection
- Difficulty levels: Beginner → Expert
- Explanations provided after each answer

#### Mode C: Challenge Mode (Multiplayer)
- Two players watch same clip
- First to correctly identify fallacy wins points
- Tournament brackets
- Weekly/monthly competitions

#### Mode D: Create & Share
- Users submit video clips containing fallacies
- Community votes on best examples
- Curated into training library
- Creator gets credit/points

### 3. Fallacy Categories

#### Attack the Person (Ad Hominem Family)
| Fallacy | Code | Description |
|---------|------|-------------|
| Character Assassination | `CHAR` | Attacking character instead of argument |
| Shooting the Messenger | `SHTM` | Dismissing info because of who delivers it |
| Poisoning the Well | `WELL` | Preemptive attack on credibility |
| Appeal to Motive | `MOTV` | Dismissing argument based on assumed motive |
| Association Fallacy | `ASSOC` | Guilt/credit by association |

#### Misdirection (Red Herring Family)
| Fallacy | Code | Description |
|---------|------|-------------|
| Red Herring | `RHER` | Introducing irrelevant topic |
| Straw Man | `STRW` | Misrepresenting opponent's argument |
| Whataboutism | `WHAT` | Deflecting with "what about X?" |
| Moving the Goalposts | `GOAL` | Changing criteria after argument made |

#### False Authority & Evidence
| Fallacy | Code | Description |
|---------|------|-------------|
| Appeal to Authority | `AUTH` | Citing unqualified authority |
| Appeal to Popularity | `POPUL` | "Everyone believes it" |
| Cherry Picking | `CHRY` | Selective evidence |
| Anecdotal Evidence | `ANEC` | Personal story as proof |

#### Logic Errors
| Fallacy | Code | Description |
|---------|------|-------------|
| False Dilemma | `FLSD` | Only 2 options when more exist |
| Slippery Slope | `SLIP` | Extreme consequence without justification |
| Circular Reasoning | `CIRC` | Conclusion assumes premise |
| Comparing Inequivalents | `COMP` | False equivalence |

#### Manipulation Tactics
| Fallacy | Code | Description |
|---------|------|-------------|
| Gaslighting | `GASL` | Making someone doubt their reality |
| Appeal to Emotion | `EMOT` | Using emotion instead of logic |
| Appeal to Fear | `FEAR` | Using fear to persuade |
| Loaded Question | `LOAD` | Question with built-in assumption |

### 4. Scoring System

```
Points per correct identification:
- Easy fallacy (obvious):        +10 pts
- Medium fallacy (subtle):       +25 pts
- Hard fallacy (nuanced):        +50 pts
- First to spot (live mode):     +10 bonus
- Streak bonus (3+ in a row):    x1.5 multiplier
- Perfect round:                 +100 bonus

Penalties:
- Wrong identification:          -5 pts
- Spam tagging:                  -20 pts + timeout
```

### 5. Badges & Achievements

| Badge | Requirement |
|-------|-------------|
| 🔍 Novice Spotter | Identify 10 fallacies |
| 🎯 Sharp Eye | 25 correct in a row |
| 🏆 Fallacy Hunter | 500 lifetime identifications |
| 👨‍🏫 Teacher | Submit 10 approved examples |
| ⚡ Quick Draw | First to spot 50 times |
| 🧠 Critical Thinker | Master all fallacy types |
| 🌟 Truthseeker | Top 10 leaderboard |

### 6. UI Components

#### A. Fallacy Tagging Panel (During Debates)
```
┌─────────────────────────────────────┐
│ 🎯 SPOT A FALLACY                   │
├─────────────────────────────────────┤
│ [🔴 Red Herring]  [🎭 Straw Man]    │
│ [👤 Ad Hominem]   [📊 False Data]   │
│ [⚖️ False Equiv]  [😱 Fear Appeal]  │
│ [+ More...]                         │
├─────────────────────────────────────┤
│ Recent Tags:                        │
│ • 2:34 - StrawMan (You +25)         │
│ • 1:12 - RedHerring (Pending...)    │
└─────────────────────────────────────┘
```

#### B. Training Mode Interface
```
┌─────────────────────────────────────┐
│ 📺 [VIDEO CLIP PLAYING]             │
│                                     │
│ "Studies show 90% of doctors..."    │
├─────────────────────────────────────┤
│ What fallacy is this?               │
│                                     │
│ ○ Appeal to Authority               │
│ ○ Appeal to Popularity              │
│ ○ Cherry Picking                    │
│ ○ Anecdotal Evidence                │
│                                     │
│        [SUBMIT ANSWER]              │
└─────────────────────────────────────┘
```

#### C. Leaderboard
```
┌─────────────────────────────────────┐
│ 🏆 TOP FALLACY SPOTTERS - This Week │
├─────────────────────────────────────┤
│ 1. 🥇 CriticalMind42    2,450 pts   │
│ 2. 🥈 TruthSeeker       2,180 pts   │
│ 3. 🥉 LogicLord         1,920 pts   │
│ ...                                 │
│ 47. You (TomSans)         340 pts   │
└─────────────────────────────────────┘
```

### 7. AI Integration

- **Fallacy Detection AI**: Analyzes debate transcripts in real-time
- **Consensus Verification**: AI + 3 user agreement = confirmed fallacy
- **Difficulty Rating**: AI rates clip difficulty based on subtlety
- **Explanation Generator**: AI provides educational explanations
- **Anti-Gaming**: Detects spam/gaming behavior

### 8. Educational Component

#### Fallacy Library (Truthopedia)
- Definition of each fallacy
- Video examples (curated)
- Historical examples (famous debates, political speeches)
- Practice exercises
- Quizzes per fallacy type

#### Integration with External Content
- YouTube playlist integration (user's existing playlist)
- News clip analysis
- Political debate archives
- Movie/TV show examples

### 9. Social Features

- Share your score/badges
- Challenge friends
- Team competitions
- School/organization leaderboards
- Debate clubs can create private leagues

### 10. Monetization Ideas

- **Free Tier**: Training mode, limited live tags
- **Pro Tier**: Unlimited live tags, advanced analytics, no ads
- **Education Tier**: Classroom tools, bulk accounts, progress tracking
- **Tournament Entry**: Premium competitions with prizes

### 11. Development Phases

#### Phase 1: MVP (4-6 weeks)
- [ ] Training mode with 50 curated clips
- [ ] Basic fallacy library (15 types)
- [ ] Simple scoring system
- [ ] User accounts & basic leaderboard

#### Phase 2: Live Integration (6-8 weeks)
- [ ] Real-time tagging during debates
- [ ] AI fallacy detection assistance
- [ ] Consensus verification system
- [ ] Enhanced leaderboards

#### Phase 3: Social & Gamification (4-6 weeks)
- [ ] Achievements & badges
- [ ] Challenge mode (multiplayer)
- [ ] User-submitted clips
- [ ] Social sharing

#### Phase 4: Education & Enterprise (ongoing)
- [ ] Classroom tools
- [ ] API for third-party integration
- [ ] White-label options
- [ ] Mobile app

### 12. Technical Requirements

```
Frontend:
- React/Next.js for web app
- Video.js or similar for clip playback
- WebSocket for real-time tagging
- PWA for mobile

Backend:
- Node.js/Express or Python/FastAPI
- PostgreSQL for user data
- Redis for real-time leaderboards
- S3/Cloudflare for video storage

AI/ML:
- OpenAI API for fallacy detection
- Custom fine-tuned model for accuracy
- Whisper for transcription
```

### 13. Content Sources for Training

1. **User's YouTube Playlist** (already exists):
   https://www.youtube.com/playlist?list=PLtKNX4SfKpzX_bhh4LOEWEGy3pkLmFDmk

2. **Political Debate Archives**:
   - Presidential debates
   - Congressional hearings
   - News panel discussions

3. **Educational Content**:
   - TED talks on logic
   - Philosophy lectures
   - Debate team footage

4. **Entertainment**:
   - Movie courtroom scenes
   - TV debate shows
   - Podcast arguments

---

## Next Steps

1. [ ] Create wireframes for Training Mode UI
2. [ ] Build fallacy library content (definitions + examples)
3. [ ] Curate initial 50 video clips from YouTube playlist
4. [ ] Design database schema for scoring system
5. [ ] Create landing page section for Fallacies Game feature
6. [ ] Add "Coming Soon: Fallacy Spotter" to VideoBate homepage

---

## Related Links

- **Truthopedia Playlist**: https://www.youtube.com/playlist?list=PLtKNX4SfKpzX_bhh4LOEWEGy3pkLmFDmk
- **VideoBate Site**: https://aiunites.github.io/videobate-site/
- **AIUNITES Portfolio**: https://aiunites.github.io/aiunites-site/

---

*Feature Spec by Claude (Anthropic) - January 23, 2026*
*VideoBate © 2026 AIUNITES. All Rights Reserved.*
