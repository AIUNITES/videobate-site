# VideoBate Development Progress Log

## Project Overview
VideoBate - Live Video Debate Platform with integrated critical thinking tools.

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
