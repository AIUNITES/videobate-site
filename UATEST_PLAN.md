# VideoBate - UA Test Plan

## Site Information
| Field | Value |
|-------|-------|
| **Site Name** | VideoBate |
| **Repository** | videobate-site |
| **Live URL** | https://aiunites.github.io/videobate-site/ |
| **Local Path** | C:/Users/Tom/Documents/GitHub/videobate-site |
| **Last Updated** | January 25, 2026 |
| **Version** | 1.1.0 |

---

## Pages Inventory

| Page | File | Description | Status |
|------|------|-------------|--------|
| Landing/Home | index.html | Main landing page with hero, features | ✅ Active |
| Login | login.html | User authentication (login/signup) | ✅ Active |
| Quiz | quiz.html | Interactive fallacy quiz game | ✅ Active |
| Profile | profile.html | User dashboard with stats, badges | ✅ Active |
| Admin Panel | admin.html | Full admin dashboard (separate page) | ✅ Active |
| Leaderboard | leaderboard.html | Global rankings | ✅ Active |
| Fallacies Library | fallacies.html | 48 fallacy types reference | ✅ Active |
| Settings | settings.html | User settings (separate page) | ✅ Active |
| Reset Password | reset-password.html | Password reset info page | ✅ Active |

---

## Feature Checklist

### 🔐 Authentication System
| Feature | Location | Status | Notes |
|---------|----------|--------|-------|
| User Registration | login.html | ✅ | Creates account in localStorage |
| User Login | login.html | ✅ | Validates credentials |
| Demo Mode Login | login.html | ✅ | Quick login buttons (admin, demo users) |
| Logout | All pages | ✅ | Clears session |
| Password Change | settings.html | ✅ | Via settings page |
| Password Reset Info | reset-password.html | ✅ | Explains localStorage limitations |
| First User = Admin | login.html | ✅ | Auto-assigns admin role |
| Auto-create Demo Users | login.html | ✅ | 5 demo users on first load |

### 👤 User Profile (profile.html)
| Feature | Location | Status | Notes |
|---------|----------|--------|-------|
| Profile Header | profile.html | ✅ | Avatar, name, username, member since |
| Stats Grid | profile.html | ✅ | Score, games, correct, wrong, accuracy, streak |
| Badges Display | profile.html | ✅ | 12 badge types (earned/locked) |
| Leaderboard Preview | profile.html | ✅ | Top 3 + your rank |
| Recent Games | profile.html | ✅ | Last 5 games |
| Quick Actions | profile.html | ✅ | Play, Study, Leaderboard, Settings, Admin |
| **User Dropdown Menu** | profile.html | ✅ | NEW - Click avatar for dropdown |
| **Settings Modal** | profile.html | ✅ | NEW - Edit name/email |
| **Backup & Restore** | profile.html | ✅ | NEW - Download/upload JSON |
| **View Cache Modal** | profile.html | ✅ | NEW - Summary, Items, Raw tabs |
| **Admin Panel Modal** | profile.html | ✅ | NEW - System Settings, Users, Stats, Changelog |
| **Legal Modal** | profile.html | ✅ | NEW - Terms, Privacy |
| **Toast Notifications** | profile.html | ✅ | NEW - Success/error messages |

### 🎮 Quiz Game (quiz.html)
| Feature | Location | Status | Notes |
|---------|----------|--------|-------|
| Practice Mode | quiz.html | ✅ | No time limit |
| Timed Mode | quiz.html | ✅ | 30 seconds per question |
| Survival Mode | quiz.html | ✅ | 3 lives |
| Scenario Questions | quiz.html | ✅ | 20+ questions |
| Difficulty Levels | quiz.html | ✅ | Easy, Medium, Hard |
| Real-time Scoring | quiz.html | ✅ | Points + streak bonus |
| ASCII Art Explanations | quiz.html | ✅ | After each answer |
| Badge Earning | quiz.html | ✅ | Auto-awards on achievement |
| Score Saving | quiz.html | ✅ | Saves to user stats |
| Game History | quiz.html | ✅ | Stores in localStorage |
| Share Score | quiz.html | ✅ | Social sharing |

### 🛠️ Admin Panel (admin.html - Full Page)
| Feature | Location | Status | Notes |
|---------|----------|--------|-------|
| Sidebar Navigation | admin.html | ✅ | Dashboard, SQL Database, Users, Settings |
| Dashboard Stats | admin.html | ✅ | Total Users, Site Users, DB Status |
| **GitHub Sync Settings** | admin.html | ✅ | Token input, save/clear buttons |
| **Token Status Display** | admin.html | ✅ | Shows if token configured |
| Quick Links | admin.html | ✅ | Fallacy Spotter, Quiz, Homepage, Login Debug |
| Recent Users Table | admin.html | ✅ | With role badges |
| Top Players Table | admin.html | ✅ | Score, accuracy, games |
| User Management | admin.html | ✅ | View all users from all sites |
| Password Reset (Admin) | admin.html | ✅ | Reset any user's password |
| Question Bank | admin.html | ✅ | View/manage questions |
| Fallacy Database | admin.html | ✅ | View all 48 fallacies |
| Reports Tab | admin.html | ✅ | Analytics overview |
| **SQL Database Tab** | admin.html | ✅ | Full SQL workspace |
| **Database Location Cards** | admin.html | ✅ | Browser (Active) + GitHub Sync |
| **GitHub Sync Card Click** | admin.html | ✅ | Navigates to token settings |
| **Save to GitHub Button** | admin.html | ✅ | Pushes database to GitHub |
| **Load from GitHub Button** | admin.html | ✅ | Fetches latest database |
| **Save to File Button** | admin.html | ✅ | Downloads .db file |
| **Load .db File** | admin.html | ✅ | Upload database file |
| **New Database Button** | admin.html | ✅ | Create fresh database |
| **SQL Query Panel** | admin.html | ✅ | Run queries, view results |
| **Tables List** | admin.html | ✅ | Click to SELECT * |
| Settings Tab | admin.html | ✅ | Registration, Game settings |
| Danger Zone | admin.html | ✅ | Clear cache, Reset all data |
| Global Leaderboard Link | admin.html | ✅ | External leaderboard |

### 🏆 Leaderboard (leaderboard.html)
| Feature | Location | Status | Notes |
|---------|----------|--------|-------|
| Animated Podium | leaderboard.html | ✅ | Top 3 with medals |
| Full Ranked List | leaderboard.html | ✅ | All users |
| Sort Options | leaderboard.html | ✅ | Score, Accuracy, Games |
| Current User Highlight | leaderboard.html | ✅ | Your row highlighted |
| Guest View | leaderboard.html | ✅ | Works without login |
| Live Data Fetch | leaderboard.html | ✅ | From Apps Script API |
| CSV Upload Fallback | leaderboard.html | ✅ | Manual data import |

### 📚 Fallacies Library (fallacies.html)
| Feature | Location | Status | Notes |
|---------|----------|--------|-------|
| 48 Fallacy Types | fallacies.html | ✅ | Full database |
| 6 Categories | fallacies.html | ✅ | Color-coded |
| ASCII Art | fallacies.html | ✅ | Visual illustrations |
| Search/Filter | fallacies.html | ✅ | Find fallacies |
| Expandable Cards | fallacies.html | ✅ | Click for details |

### ☁️ Cloud Integration
| Feature | Location | Status | Notes |
|---------|----------|--------|-------|
| CloudDB Module | js/cloud-database.js | ✅ | Reusable module |
| Google Form Submission | Multiple | ✅ | USER, SCORE, WAITLIST, etc. |
| Apps Script API | External | ✅ | Fetch users/scores |
| Online/Offline Toggle | admin.html | ✅ | Via Settings tab |
| Packed Data Format | Multiple | ✅ | TYPE|field1|field2|... |

### 🎨 UI/UX Features
| Feature | Location | Status | Notes |
|---------|----------|--------|-------|
| Dark Theme | All pages | ✅ | Consistent styling |
| Responsive Design | All pages | ✅ | Mobile-friendly |
| Loading States | Multiple | ✅ | Spinners, messages |
| Error Handling | Multiple | ✅ | User-friendly errors |
| AIUNITES Webring | index.html | ✅ | Top navigation bar |

---

## Badge System (12 Badges)

| Badge | Emoji | Requirement | Status |
|-------|-------|-------------|--------|
| Perfect Score | 🏆 | 100% on a quiz | ✅ |
| Hot Streak | 🔥 | 5+ correct in a row | ✅ |
| On Fire | ⚡ | 10+ correct in a row | ✅ |
| Regular Player | 🎮 | Play 10 games | ✅ |
| Dedicated | 🎯 | Play 50 games | ✅ |
| Diamond | 💎 | Earn 1000 points | ✅ |
| Champion | 👑 | Earn 5000 points | ✅ |
| Sharp Eye | 🎯 | 80%+ accuracy | ✅ |
| Quiz Master | 🧠 | Master all categories | ✅ |
| Speedster | ⏱️ | Win 5 timed games | ✅ |
| Survivor | 💀 | 100+ in survival | ✅ |
| Teacher | 👨‍🏫 | Share score 5 times | ✅ |

---

## localStorage Keys

| Key | Purpose | Used By |
|-----|---------|---------|
| `fallacySpotter_users` | All user accounts | All pages |
| `fallacySpotter_currentUser` | Logged in user | All pages |
| `fallacySpotter_games_[id]` | Game history per user | quiz, profile |
| `fallacySpotter_prefs_[id]` | User preferences | settings |
| `fallacySpotter_liveDataUrl` | Apps Script API URL | admin, leaderboard |
| `cloudDB_enabled` | Cloud sync toggle | admin |
| `cloudDB_apiUrl` | Cloud API URL | admin |

---

## External Dependencies

| Dependency | URL | Purpose |
|------------|-----|---------|
| Google Form | docs.google.com/forms/... | Data collection |
| Apps Script API | script.google.com/macros/... | Data retrieval |
| Google Fonts | fonts.googleapis.com | Typography |

---

## Test Scenarios

### Authentication Tests
- [ ] New user can register
- [ ] Existing user can login
- [ ] Demo login buttons work
- [ ] First user gets admin role
- [ ] Logout clears session
- [ ] Protected pages redirect to login

### Quiz Tests
- [ ] Practice mode works without timer
- [ ] Timed mode has 30s countdown
- [ ] Survival mode has 3 lives
- [ ] Correct answers add points
- [ ] Streak bonus applies
- [ ] Game saves to history
- [ ] Badges award correctly

### Profile Tests
- [ ] Stats display correctly
- [ ] Badges show earned/locked
- [ ] Recent games list populates
- [ ] User dropdown opens/closes
- [ ] Settings modal opens
- [ ] Backup downloads JSON
- [ ] Restore imports data
- [ ] Cache viewer shows data
- [ ] Admin panel (admin only)

### Admin Tests
- [ ] Dashboard shows correct counts
- [ ] User list loads
- [ ] Can edit user
- [ ] Can delete user (non-system)
- [ ] Can reset user password
- [ ] Cloud sync toggle works
- [ ] Export all data works

### SQL Database Tests (Admin Panel)
- [ ] SQL Database tab loads correctly
- [ ] Database Location cards display (Browser active, GitHub Sync)
- [ ] New Database creates empty db
- [ ] Load .db file works
- [ ] Save to File downloads .db
- [ ] Tables list shows after data loads
- [ ] Click table runs SELECT *
- [ ] Run custom SQL query
- [ ] Query results display in table
- [ ] Query time displays

### GitHub Sync Tests (Admin Panel)
- [ ] GitHub Sync Settings card displays in Dashboard
- [ ] Token input and save/clear buttons work
- [ ] Token status shows ✅ or ⚠️ correctly
- [ ] GitHub Sync card in Database Location is clickable
- [ ] Clicking GitHub Sync card navigates to Dashboard token settings
- [ ] Save to GitHub button prompts for token if not saved
- [ ] Save to GitHub pushes to AIUNITES/AIUNITES-database-sync
- [ ] Load from GitHub fetches shared database
- [ ] Auto-load from GitHub works on live site
- [ ] Login Debug quick link works (?debug=1 param)

### Leaderboard Tests
- [ ] Top 3 podium displays
- [ ] Full list loads
- [ ] Sort options work
- [ ] Current user highlighted
- [ ] Live data fetch works

---

## UA Test Results

### Test Session: January 24, 2026 (7:45 PM)

#### Test 1: Login Button Shows Dashboard Instead of Login Page
| Field | Value |
|-------|-------|
| **Issue** | Clicking "Login" from index.html goes to dashboard/profile instead of login page |
| **Expected** | If logged out: show login.html. If logged in: show profile/admin |
| **Actual** | **WORKING AS EXPECTED** - Navigation correctly detects login state |
| **Details** | When logged in as admin, nav shows "AU Admin" with initials badge, links to admin.html |
| **Status** | ✅ PASS |

#### Test 2: admin/admin123 Shows "Invalid Password"
| Field | Value |
|-------|-------|
| **Issue** | User entered admin/Admin123 and got "Invalid email/username or password" |
| **Root Cause** | **Case sensitivity** - password stored as "admin123" (lowercase), user entered "Admin123" (capital A) |
| **Resolution** | Passwords are correctly case-sensitive for security. Entering lowercase "admin123" works |
| **Test Result** | Logged in successfully with admin/admin123, redirected to admin.html |
| **Status** | ✅ PASS (user error, not bug) |

#### Test 3: Navigation Login State Detection
| Field | Value |
|-------|-------|
| **Test** | Verify navigation updates based on login state |
| **Logged Out** | Shows "🔐 Login" link pointing to login.html |
| **Logged In (User)** | Shows initials badge + first name, links to profile.html |
| **Logged In (Admin)** | Shows "AU Admin" badge + name, links to admin.html |
| **Implementation** | JavaScript checks `fallacySpotter_currentUser` in localStorage |
| **Status** | ✅ PASS |

#### localStorage State at Test Time
```json
{
  "userCount": 4,
  "users": [
    { "username": "admin", "password": "admin123", "email": "admin@videobate.com" },
    { "username": "sarahlogic", "password": "password123", "email": "sarah@example.com" },
    { "username": "mikereason", "password": "password123", "email": "mike@example.com" },
    { "username": "cloudtest2026", "password": "password123", "email": "cloudtest@videobate.com" }
  ]
}
```

#### Pages with Login State Detection
| Page | Has Detection | Status |
|------|---------------|--------|
| index.html | ✅ Yes | Shows user name/initials when logged in |
| fallacies.html | ✅ Yes | Shows user name/initials when logged in |
| leaderboard.html | ✅ Yes | Updates auth button |
| login.html | ✅ Yes | Auto-redirects if already logged in |
| quiz.html | ❌ No nav | Header only, no login link |
| profile.html | ✅ Yes | Protected page, requires login |
| admin.html | ✅ Yes | Protected page, requires admin |

---

## Known Issues / TODO

| Issue | Priority | Status |
|-------|----------|--------|
| Add user dropdown to quiz.html | Medium | 🔲 TODO |
| Add user dropdown to fallacies.html | Medium | 🔲 TODO |
| Add modals to other pages | Medium | 🔲 TODO |
| Cloud sync error handling | Low | 🔲 TODO |

---

## Legal Compliance Tests
- [ ] Single footer displayed (no duplicates)
- [ ] Footer disclaimer text visible
- [ ] Footer copyright with AIUNITES link
- [ ] Privacy Policy link → aiunites-site/legal.html#privacy
- [ ] Terms of Service link → aiunites-site/legal.html#terms

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | Feb 15, 2026 | Legal compliance: centralized legal.html, removed dup footer, updated all legal links |
| 1.0.0 | Jan 24, 2026 | Initial release with all features |
| 1.0.1 | Jan 24, 2026 | Added Settings/Admin modals to profile.html |
| 1.1.0 | Jan 25, 2026 | Added GitHub Sync for shared AIUNITES database, admin panel improvements, login debug access |

---

*Last tested: February 15, 2026*
*Tested by: Claude AI Assistant*
