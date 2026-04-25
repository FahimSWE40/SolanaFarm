<![CDATA[# ⚡ Solana Seeker

> **Quest. Earn. Rise.** — A Solana-native gamified engagement platform where users complete tasks, earn XP, climb leaderboards, and qualify for future rewards.

![Solana](https://img.shields.io/badge/Solana-black?style=for-the-badge&logo=solana&logoColor=14F195)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Implementation Plan](#-implementation-plan)
  - [Phase 1: Backend Setup + Auth + Dashboard](#phase-1-backend-setup--auth--dashboard)
  - [Phase 2: Task System + XP Engine](#phase-2-task-system--xp-engine)
  - [Phase 3: Leaderboard + Streaks + Referrals](#phase-3-leaderboard--streaks--referrals)
  - [Phase 4: Wallet + Rewards + Badges](#phase-4-wallet--rewards--badges)
  - [Phase 5: Premium + Notifications + Admin](#phase-5-premium--notifications--admin)
  - [Phase 6: Anti-Fraud + Polish](#phase-6-anti-fraud--polish)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Backend Modules](#-backend-modules)
- [Mobile App Screens](#-mobile-app-screens)
- [XP & Level System](#-xp--level-system)
- [Reward Tiers](#-reward-tiers)
- [Security](#-security)
- [Task Tracker](#-task-tracker)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Open Questions](#-open-questions)

---

## 🌟 Overview

**Solana Seeker** is a cross-platform mobile application that incentivizes users to engage with the Solana ecosystem through:

- 🎯 **Daily & Weekly Missions** — Complete tasks to earn XP
- 🔥 **Streak System** — Maintain daily streaks for bonus XP multipliers (up to +35%)
- 🏆 **Competitive Leaderboard** — Rank globally with daily/weekly/monthly/all-time views
- 💎 **Reward Eligibility** — Qualify for future airdrops via a multi-factor scoring system (Diamond → Bronze tiers)
- 🧠 **Learn-to-Earn** — Complete quizzes about Web3 and Solana to earn XP
- 👥 **Referral Program** — Invite friends and earn XP when they complete tasks
- ⭐ **Premium Subscriptions** — Boost XP with 1.25x–1.5x multipliers and exclusive tasks
- 🛡️ **Anti-Fraud Protection** — Multi-factor fraud detection with device fingerprinting

**Design Language:** Futuristic dark mode with Solana-inspired neon accents (purple, green, cyan), glassmorphism cards, and glowing progress bars.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React Native, Expo, TypeScript, Zustand, TanStack Query |
| **Backend** | Node.js, NestJS, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **Caching** | Redis, ioredis |
| **Jobs** | BullMQ, @nestjs/schedule (cron) |
| **Auth** | JWT (access + refresh tokens), Solana wallet signature (tweetnacl) |
| **Blockchain** | Solana Web3.js, Helius/QuickNode RPC |
| **Notifications** | Firebase Cloud Messaging |
| **Admin Panel** | Next.js, Tailwind CSS *(planned)* |

---

## 📁 Project Structure

```
solana-seeker/
├── package.json                 # Monorepo root (npm workspaces)
├── tsconfig.base.json           # Shared TypeScript config
├── .gitignore
│
├── packages/
│   └── shared/                  # Shared types, enums, level system
│       └── src/index.ts
│
├── apps/
│   ├── backend/                 # NestJS API Server
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # 16 models, full relations & indexes
│   │   │   └── seed.ts         # Admin, badges, tasks, quiz seed data
│   │   ├── .env.example
│   │   ├── nest-cli.json
│   │   └── src/
│   │       ├── main.ts         # Entry (helmet, CORS, validation)
│   │       ├── app.module.ts   # Root module (15 feature modules)
│   │       ├── prisma/         # Global Prisma service
│   │       ├── redis/          # Global Redis service
│   │       ├── common/         # Guards, decorators (@CurrentUser, @Public)
│   │       └── modules/
│   │           ├── auth/       # Wallet-based authentication
│   │           ├── user/       # Profile CRUD
│   │           ├── task/       # Task management
│   │           ├── xp/         # XP engine (single source of truth)
│   │           ├── streak/     # Daily check-in & streaks
│   │           ├── leaderboard/# Redis-cached rankings
│   │           ├── reward/     # Eligibility scoring
│   │           ├── wallet/     # Solana RPC integration
│   │           ├── referral/   # Referral tracking
│   │           ├── premium/    # Subscription management
│   │           ├── quiz/       # Learn-to-earn quizzes
│   │           ├── badge/      # Achievement system
│   │           ├── notification/# Push notifications
│   │           ├── fraud/      # Anti-fraud detection
│   │           └── admin/      # Admin management
│   │
│   └── mobile/                  # React Native Expo App
│       ├── App.tsx              # Entry (QueryClient, auth flow, tabs)
│       └── src/
│           ├── theme/           # Design system (colors, typography, spacing)
│           ├── api/             # Axios client with auto token refresh
│           ├── store/           # Zustand stores (auth, XP, UI)
│           ├── components/ui/   # GlassCard, ProgressBar, TaskCard, etc.
│           └── screens/         # Onboarding, Home, Leaderboard, Rewards, Profile
```

---

## 📋 Implementation Plan

### Phase 1: Backend Setup + Auth + Dashboard

**Backend:**
- Initialize npm workspace monorepo with shared TypeScript config
- Set up NestJS with Prisma ORM, Redis, JWT, rate limiting, Helmet
- Create complete Prisma schema (16 models with relations and indexes)
- Implement wallet-based auth flow:
  1. `POST /auth/nonce` — Generate signing nonce (stored in Redis, 5min TTL)
  2. `POST /auth/verify-wallet` — Verify signature via `tweetnacl`, create/find user, issue JWT
  3. `POST /auth/refresh` — Refresh access token using refresh token
  4. `POST /auth/logout` — Invalidate refresh token
- Build User module with profile CRUD and username availability check

**Mobile:**
- Initialize Expo app with TypeScript
- Create design system (dark mode, neon accents, Space Grotesk + Inter fonts)
- Build API client with automatic token refresh interceptor
- Set up Zustand stores (auth, XP, UI animation state)
- Build Onboarding screen with Phantom wallet deep linking
- Build Home Dashboard (XP card, streak tracker, daily missions, quick actions)
- Create custom bottom tab navigation

---

### Phase 2: Task System + XP Engine

**Backend:**
- Task module with listing, completion, and XP claim flow
- Frequency-based duplicate prevention (daily/weekly/once)
- Task validation types: Automatic, Blockchain, Social, Quiz, Manual

**XP Engine (server-side only):**
```typescript
calculateXP(baseXP, streakCount, premiumStatus, campaignMultiplier) {
  let multiplier = 1.0;
  // Streak: +5% (3d), +10% (7d), +20% (14d), +35% (30d)
  // Premium: +25% (Premium), +50% (Premium Pro)
  // Campaign: variable bonus
  return Math.floor(baseXP * multiplier);
}
```
- Rate limiting: max 20 XP actions per hour per user
- Every XP change logged in `XPLog` table
- Automatic level calculation and Redis leaderboard sync

**Mobile:**
- TaskCard component with status indicators
- Task completion and XP claim flow

---

### Phase 3: Leaderboard + Streaks + Referrals

**Streak Module:**
- Daily check-in processing with consecutive-day tracking
- Milestone XP bonuses: 3 days (+15 XP), 7 days (+50), 14 days (+100), 30 days (+250)
- Streak-at-risk detection for push notifications

**Leaderboard Module:**
- Redis sorted sets for real-time rankings
- Time-based periods: daily, weekly, monthly, all-time
- User rank lookup with percentile calculation
- Hourly cron job for leaderboard recalculation

**Referral Module:**
- Unique referral code generation (`SS-XXXXXX`)
- Anti-abuse: prevent self-referrals, detect same-device referrals
- Deferred reward: referrer earns XP only after referred user completes 2+ tasks

**Mobile:**
- Leaderboard screen with period tabs and rank card
- Medal emojis for top 3 (🥇🥈🥉)

---

### Phase 4: Wallet + Rewards + Badges

**Wallet Activity Module:**
- Solana RPC integration (transaction count, SPL token holdings, wallet age)
- Reputation score calculation (0–1 scale)

**Reward Eligibility Module:**
- Multi-factor scoring system:

| Factor | Weight | Max Points |
|--------|--------|-----------|
| XP Total | 30% | 30 |
| Rank | 20% | 20 |
| Wallet Reputation | 15% | 15 |
| Streak | 10% | 10 |
| Referrals | 10% | 10 |
| Task Completion | 10% | 10 |
| Anti-Fraud | 5% | 5 |

**Badge Module:**
- Condition-based auto-award (streak milestones, XP thresholds, referral counts, level)
- 5 rarity tiers: Common, Uncommon, Rare, Epic, Legendary

**Mobile:**
- Rewards screen with tier card, score breakdown, and tier list
- Profile screen with stats grid, badges, referral info, wallet score

---

### Phase 5: Premium + Notifications + Admin

**Premium Module:**
- Monthly ($9.99, 1.25x XP) and Yearly ($79.99, 1.5x XP) plans
- Premium-only tasks and advanced stats

**Notification Module:**
- FCM token registration and notification CRUD
- Notification settings (enable/disable, reminder time)

**Quiz Module:**
- Server-side answer verification (correct answers never sent to client)
- Perfect score bonus (1.5x XP)

**Admin Module:**
- User search and management
- Task CRUD with audit logging
- Fraud flag review
- XP adjustment with admin audit trail
- Analytics dashboard (total users, active today, XP awarded, premium users)

**Admin Panel (Next.js)** — *Planned:*
- Role-based access: Super Admin, Campaign Manager, Support Admin
- Dashboard, user management, task editor, fraud review, leaderboard export

---

### Phase 6: Anti-Fraud + Polish

**Anti-Fraud System:**
- Multi-factor detection rules:
  - Rapid XP farming (>15 XP actions/hour)
  - Suspicious referral clusters (>10 referrals/day)
  - Multiple accounts per device fingerprint
  - Bot-like task completion (<5 seconds)
- Status levels: Normal → Suspicious → Blocked
- Nightly cron scan for all users

**UI Polish** *(Remaining):*
- Smooth animations (React Native Reanimated)
- XP claim confetti/particle effects
- Haptic feedback on claims
- Loading skeletons and empty states

---

## 🗄 Database Schema

**16 Models** with full relations and performance indexes:

| Model | Purpose |
|-------|---------|
| `User` | Core user profile with XP, level, streak, premium status |
| `Task` | Task definitions (type, difficulty, frequency, XP reward) |
| `UserTask` | User-task progress tracking with status |
| `XPLog` | Immutable log of all XP changes |
| `LeaderboardSnapshot` | Periodic leaderboard snapshots |
| `WalletScore` | On-chain wallet reputation data |
| `Referral` | Referral tracking between users |
| `Badge` | Badge definitions with conditions |
| `UserBadge` | Earned badges per user |
| `Subscription` | Premium subscription records |
| `Notification` | In-app notification records |
| `FraudScore` | Per-user fraud analysis results |
| `Campaign` | Time-limited campaign definitions |
| `QuizModule` | Quiz content with questions/answers |
| `AdminUser` | Admin accounts with roles |
| `AdminAuditLog` | Admin action audit trail |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/nonce` | Public | Generate signing nonce |
| POST | `/api/auth/verify-wallet` | Public | Verify wallet & get tokens |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| POST | `/api/auth/logout` | JWT | Invalidate refresh token |

### User
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/me` | JWT | Get current profile |
| PATCH | `/api/user/me` | JWT | Update profile |
| GET | `/api/user/profile/:username` | JWT | Get public profile |
| GET | `/api/user/check-username` | JWT | Check username availability |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tasks` | JWT | List available tasks |
| GET | `/api/tasks/daily` | JWT | Today's daily tasks |
| GET | `/api/tasks/weekly` | JWT | This week's weekly tasks |
| POST | `/api/tasks/:id/complete` | JWT | Complete a task |
| POST | `/api/tasks/:id/claim` | JWT | Claim XP for completed task |

### XP
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/xp/summary` | JWT | XP dashboard summary |
| GET | `/api/xp/logs` | JWT | Paginated XP history |

### Leaderboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/leaderboard/daily` | JWT | Daily rankings |
| GET | `/api/leaderboard/weekly` | JWT | Weekly rankings |
| GET | `/api/leaderboard/monthly` | JWT | Monthly rankings |
| GET | `/api/leaderboard/all-time` | JWT | All-time rankings |
| GET | `/api/leaderboard/me` | JWT | Current user's rank |

### Rewards & Wallet
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/rewards/eligibility` | JWT | Reward eligibility score |
| GET | `/api/rewards/tiers` | Public | Tier definitions |
| GET | `/api/wallet/score` | JWT | Wallet reputation |
| POST | `/api/wallet/sync` | JWT | Sync wallet data |

### Referral, Premium, Quiz, Badges, Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/referral/code` | JWT | Get referral code |
| GET | `/api/referral/stats` | JWT | Referral statistics |
| POST | `/api/referral/apply` | JWT | Apply referral code |
| GET | `/api/premium/plans` | Public | Subscription plans |
| POST | `/api/premium/subscribe` | JWT | Subscribe to plan |
| GET | `/api/quiz` | JWT | Active quizzes |
| POST | `/api/quiz/:id/submit` | JWT | Submit quiz answers |
| GET | `/api/badges` | JWT | Earned & locked badges |
| GET | `/api/notifications` | JWT | Notification list |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/admin/login` | Public | Admin login |
| GET | `/api/admin/users` | JWT | User management |
| POST | `/api/admin/tasks` | JWT | Create task |
| GET | `/api/admin/fraud` | JWT | Fraud flags |
| POST | `/api/admin/xp-adjust` | JWT | Adjust user XP |
| GET | `/api/admin/analytics` | JWT | Dashboard analytics |

---

## 🧩 Backend Modules

| # | Module | Key Features |
|---|--------|-------------|
| 1 | **Auth** | Solana wallet verification (tweetnacl), JWT + refresh tokens, referral on signup |
| 2 | **User** | Profile CRUD, public profiles, username validation |
| 3 | **Task** | Task listing, completion, XP claim, frequency duplicate prevention |
| 4 | **XP** | Single source of truth for XP, rate limiting, level system, Redis sync |
| 5 | **Streak** | Daily check-in, milestone bonuses, streak-at-risk detection |
| 6 | **Leaderboard** | Redis-cached rankings, time periods, hourly cron recalculation |
| 7 | **Reward** | Multi-factor eligibility scoring, 5-tier system |
| 8 | **Wallet** | Solana RPC (txn count, tokens, age), reputation score |
| 9 | **Referral** | Code generation, anti-abuse, deferred reward |
| 10 | **Premium** | Plan definitions, subscribe/cancel |
| 11 | **Quiz** | Server-side grading, perfect score bonus |
| 12 | **Badge** | Condition-based auto-award |
| 13 | **Notification** | FCM tokens, notification CRUD |
| 14 | **Fraud** | Multi-factor detection, nightly cron scan |
| 15 | **Admin** | User mgmt, task CRUD, fraud review, XP adjust, analytics |

---

## 📱 Mobile App Screens

| Screen | Features |
|--------|----------|
| **Onboarding** | Phantom wallet deep link, feature highlights, futuristic branding with glow effects |
| **Home Dashboard** | XP overview card (total, level progress, multiplier), streak tracker, daily missions, quick actions |
| **Leaderboard** | Period tabs (Today/Week/Month/All-Time), rank card with percentile, ranked list with medals |
| **Rewards** | Current tier card with score breakdown, progress to next tier, tier definitions with benefits |
| **Profile** | Stats grid (XP, Level, Streak, Tasks), badge collection, referral code & stats, wallet reputation |

---

## 📊 XP & Level System

### Level Thresholds

| Level | XP Required | Level | XP Required |
|-------|------------|-------|------------|
| 1 | 0 | 6 | 3,000 |
| 2 | 100 | 7 | 5,000 |
| 3 | 300 | 8 | 8,000 |
| 4 | 700 | 9 | 12,000 |
| 5 | 1,500 | 10 | 20,000 |

> Levels 10+: `100 × (level ^ 1.8)` formula

### Streak Bonuses

| Streak Days | XP Bonus | Milestone Reward |
|-------------|----------|-----------------|
| 3 days | +5% | +15 XP |
| 7 days | +10% | +50 XP |
| 14 days | +20% | +100 XP |
| 30 days | +35% | +250 XP |

### Premium Multipliers

| Tier | Monthly | XP Multiplier |
|------|---------|--------------|
| Free | $0 | 1.0x |
| Premium | $9.99/mo | 1.25x |
| Premium Pro | $79.99/yr | 1.5x |

---

## 💎 Reward Tiers

| Tier | Percentile | Min Score | Color |
|------|-----------|-----------|-------|
| 💎 Diamond | Top 1% | 90 | `#B9F2FF` |
| 🏆 Platinum | Top 5% | 75 | `#E5E4E2` |
| 🥇 Gold | Top 10% | 60 | `#FFD700` |
| 🥈 Silver | Top 25% | 40 | `#C0C0C0` |
| 🥉 Bronze | Active | 0 | `#CD7F32` |

---

## 🔐 Security

- ✅ **Wallet signature verification** — tweetnacl with one-time nonces
- ✅ **JWT with refresh token rotation** — Redis-backed, 15min access / 7d refresh
- ✅ **Server-side XP calculation only** — Clients never determine XP amounts
- ✅ **Rate limiting** — 60 req/min global, 20 XP actions/hr per user
- ✅ **Input validation** — class-validator with whitelist/forbidNonWhitelisted
- ✅ **Anti-fraud detection** — Multi-factor scoring with nightly cron scans
- ✅ **Helmet security headers** — Applied globally
- ✅ **Task frequency enforcement** — Duplicate prevention per period
- ✅ **Admin audit logging** — All admin actions tracked
- ✅ **No private keys stored** — Wallet verification only

---

## ✅ Task Tracker

### Phase 1: Backend Setup + Auth + Dashboard
- [x] Monorepo setup (root package.json, tsconfig, .gitignore)
- [x] Shared types package (packages/shared)
- [x] NestJS backend initialization
- [x] Prisma schema (16 models, indexes, relations)
- [x] Prisma service + module (global)
- [x] Redis service + module (global)
- [x] Auth module (nonce, verify-wallet, JWT, refresh tokens)
- [x] JWT strategy + auth guard + decorators
- [x] User module (profile CRUD, username check)
- [x] Expo mobile app initialization
- [x] Design system / theme constants
- [x] API client (axios with token refresh)
- [x] Zustand stores (auth, XP, UI)
- [x] Onboarding / Connect Wallet screen
- [x] Home Dashboard screen
- [x] Bottom navigation
- [ ] Install dependencies (`npm install`)
- [ ] Database migration (`prisma migrate`)
- [ ] Database seed

### Phase 2: Task System + XP Engine
- [x] Task module (listing, complete, claim flow)
- [x] XP engine (server-side calculation, rate limiting, level system)
- [x] Daily/Weekly task endpoints
- [x] Task cards UI component
- [ ] Task Detail modal
- [ ] Claim XP animation

### Phase 3: Leaderboard + Streaks + Referrals
- [x] Streak module (check-in, milestones, bonuses)
- [x] Leaderboard module (Redis cache, cron recalculation)
- [x] Referral module (code generation, apply, reward)
- [x] Leaderboard screen (period tabs, rank card)
- [ ] Referral share screen

### Phase 4: Wallet + Rewards + Badges
- [x] Wallet activity module (Solana RPC integration)
- [x] Reward eligibility module (multi-factor scoring)
- [x] Badge module (auto-award conditions)
- [x] Rewards screen (tier card, breakdown, tier list)
- [x] Profile screen (stats, badges, referral, wallet score)

### Phase 5: Premium + Notifications + Admin
- [x] Premium module (plans, subscribe, cancel)
- [x] Notification module (FCM token, CRUD)
- [x] Admin module (user mgmt, task CRUD, fraud, analytics)
- [x] Quiz module (server-side grading, XP award)
- [ ] Admin panel (Next.js)
- [ ] Push notification integration (Firebase)

### Phase 6: Anti-Fraud + Polish
- [x] Anti-fraud system (multi-factor detection, nightly cron)
- [x] Database seed (admin, badges, tasks, quiz)
- [x] Environment config (.env.example)
- [ ] UI animations (React Native Reanimated)
- [ ] Production build + deployment
- [ ] E2E testing

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.0.0
- **PostgreSQL** — Running instance
- **Redis** — Running instance
- **Expo CLI** — `npm install -g expo-cli`

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd solana-seeker

# 2. Install all dependencies
npm install

# 3. Set up environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your database URL, Redis config, and JWT secret

# 4. Run database migration
cd apps/backend
npx prisma migrate dev --name init

# 5. Seed the database
npx prisma db seed

# 6. Start the backend
cd ../..
npm run backend:dev

# 7. Start the mobile app (in another terminal)
npm run mobile:start
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run backend:dev` | Start NestJS in watch mode |
| `npm run mobile:start` | Start Expo dev server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Generate Prisma client |

---

## ⚙️ Environment Variables

Create `apps/backend/.env` from the example:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/solana_seeker` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret | *(change in production)* |
| `JWT_ACCESS_EXPIRY` | Access token TTL | `15m` |
| `SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.mainnet-beta.solana.com` |
| `PORT` | API server port | `3000` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:8081` |

---

## ❓ Open Questions

| Question | Options | Status |
|----------|---------|--------|
| Payment integration for Premium | Stripe, RevenueCat, In-App Purchases | ⏳ Pending |
| Solana RPC provider | Helius (default), QuickNode | ⏳ Pending |
| Deployment target | Railway, Render, AWS | ⏳ Pending |
| Backpack wallet support | Depends on SDK availability | ⏳ Pending |

---

## 📄 License

This project is private and proprietary.

---

<p align="center">
  <strong>⚡ Built with Solana Seeker — Quest. Earn. Rise. ⚡</strong>
</p>
]]>
