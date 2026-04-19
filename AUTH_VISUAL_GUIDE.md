# Auth Flow Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GUEST MODE + AUTH FLOW               │
└─────────────────────────────────────────────────────────┘

                   ┌──────────────────┐
                   │   Anonymous User │
                   └────────┬─────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        ┌──────────────┐      ┌──────────────────┐
        │   Browse     │      │  Login Required? │
        │  Listings    │      │  (Sell, Me, etc) │
        │  (Public)    │      └────────┬─────────┘
        └──────┬───────┘               │
               │                       ▼
               │          ┌──────────────────────┐
               │          │  Redirect to Login   │
               │          │  with redirectTo     │
               │          │  param               │
               │          └──────────┬───────────┘
               │                     │
               │          ┌──────────▼───────────┐
               │          │  User logs in        │
               │          │  (API validates JWT) │
               │          └──────────┬───────────┘
               │                     │
               │          ┌──────────▼───────────┐
               │          │  Redirect back to    │
               │          │  original path       │
               │          │  (redirectTo param)  │
               │          └──────────┬───────────┘
               │                     │
               ▼                     ▼
        ┌──────────────┐      ┌──────────────────┐
        │   Try to     │      │  Authenticated   │
        │   Perform    │      │  User Access     │
        │   Action     │      │  Protected Page  │
        └──────┬───────┘      └──────────────────┘
               │
        ┌──────▼───────────┐
        │  Not auth?       │
        │  Show LoginCTA   │
        │  (component)     │
        └──────┬───────────┘
               │
        ┌──────▼───────────┐
        │  Click button    │
        │  → Redirect with │
        │    intent        │
        └──────┬───────────┘
               │
               └──────────────┐
                              │
                    ┌─────────▼──────────┐
                    │  (Back to login)   │
                    └────────────────────┘
```

---

## Component Relationship Map

```
┌─────────────────────────────────────────────────────────────┐
│                     Page/Component Layer                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐             │
│  │   /listings      │      │  /listings/[id]  │             │
│  │  (Public Page)   │      │  (Public Page)   │             │
│  └────────┬─────────┘      └────────┬─────────┘             │
│           │ Get userId                │ Get userId          │
│           │ (may be null)             │ (may be null)       │
│           │ ✅ Allow guests           │ ✅ Allow guests     │
│           │                           │                      │
│           │                    ┌──────▼──────────┐           │
│           │                    │ ListingActions  │           │
│           │                    │  (Client Comp)  │           │
│           │                    └────────┬────────┘           │
│           │                            │                     │
│           │                    ┌───────▼────────┐            │
│           │                    │  is guest?     │            │
│           │                    │  → Show        │            │
│           │                    │    LoginCTA    │            │
│           │                    └────────────────┘            │
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐             │
│  │    /sell         │      │     /me          │             │
│  │  (Protected)     │      │  (Protected)     │             │
│  └────────┬─────────┘      └────────┬─────────┘             │
│   (Server✓           (Client✓                                │
│    check)             check)                                 │
│           │                     │                            │
│   not auth?             not auth?                            │
│   ↓                     ↓                                    │
│  Redirect             LoginCTA                              │
│  /login?              component                             │
│  redirectTo=/sell     component                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
        │                              │
        │ Pass props                   │ Read state
        │ (isAuthenticated)            │ (fetch /api/me)
        ▼                              ▼
┌──────────────────────────────────────────────────────────┐
│               Utility & Helper Layer                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Functions (lib/auth-utils.ts):                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │ • getAuthState()         → { userId, isAuth }     │ │
│  │ • getRedirectIntent()    → string (path)          │ │
│  │ • createLoginRedirectUrl → string (URL)           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  Components (lib/auth-*.ts):                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │ • LoginCTA        → Guest auth gate button         │ │
│  │ • AuthGuard       → Conditional wrapper            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
└──────────────────────────────────────────────────────────┘
        │                              │
        │ Call                         │ Read cookies
        │                              │
        ▼                              ▼
┌──────────────────────────────────────────────────────────┐
│             Core Auth Layer                             │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Functions:                                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ • getUserIdFromCookie()    → string | null        │ │
│  │ • hasPassword()            → boolean              │ │
│  │ • signToken()              → string (JWT)         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ※ userId = null means guest/unauthenticated ✓         │
│                                                           │
└──────────────────────────────────────────────────────────┘
        │
        │ HTTP Cookies
        │ (auth_token)
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│              API/Database Layer                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  POST /api/login:    Validate email/password → JWT      │
│  POST /api/register: Create user → Redirect to login    │
│  GET  /api/listings: No auth required ✅                │
│  POST /api/listings: Requires auth ✅                   │
│  POST /api/negotiate: Requires auth ✅                  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Request Flow Sequence Diagram

```
GUEST TRYING TO MAKE OFFER

Guest                    Browser              Server
  │                        │                    │
  ├─ Click offer button ──→ │                    │
  │                        │ GET /listings/123  │
  │                        ├──────────────────→ │
  │                        │ (no cookie)        │
  │                        │ ✅ Allow (guest)   │
  │                        │ ← React component  │
  │                        │  loads             │
  │                        │                    │
  │                        │ ListingActions     │
  │                        │ .startNegotiation()│
  │  ← LoginCTA rendered   │ (checks auth)      │
  │    (not authenticated) │                    │
  │                        │                    │
  ├─ Click login button ──→ │ router.push()      │
  │                        │ (/login?redirect...)
  │                        │                    │
  │  ← Login form renders  │                    │
  │    (email/password)    │                    │
  │                        │                    │
  ├─ Submit credentials ──→ │ POST /api/login    │
  │                        ├──────────────────→ │
  │                        │ Validate + JWT     │
  │                        │ Set auth_token     │
  │  ← Success message     │ cookie ←           │
  │                        │                    │
  │                        │ Read redirectTo    │
  │  ← Redirected to       │ from searchParams  │
  │    /listings/123       │ router.push()      │
  │                        │ ← Re-load page     │
  │                        │ (cookie present)   │
  │                        │                    │
  ├─ Click offer again ───→ │ startNegotiation()│
  │                        │ (now auth=true)   │
  │                        │ POST /api/listings│
  │                        │ /123/negotiations  │
  │                        ├──────────────────→ │
  │                        │ (cookie with JWT) │
  │                        │ ✅ Create negotiation
  │  ← Negotiation page    │ Redirect to /nego │
  │    loads               │ /[id] ←            │
  │                        │                    │
```

---

## Decision Tree: Auth Flow

```
User visits page
    │
    ├─ Is it a public page?
    │  ├─ YES: /listings, /listings/[id]
    │  │   └─ Continue (no auth check)
    │  │       ├─ User can browse ✅
    │  │       ├─ If tries action (offer) → LoginCTA
    │  │       └─ LoginCTA redirects with intent
    │  │
    │  └─ NO: /sell, /me, /admin
    │      ├─ Is it /admin?
    │      │  └─ YES: Requires SUPER_ADMIN
    │      │      ├─ Check role in DB
    │      │      └─ Reject non-admins
    │      │
    │      └─ Other protected routes
    │         ├─ Server side (/sell)?
    │         │  └─ Redirect /login?redirectTo=/sell
    │         │
    │         └─ Client side (/me)?
    │            ├─ Fetch /api/me
    │            ├─ 401? Show LoginCTA
    │            └─ 200? Show content
```

---

## Auth State Values

```
THREE POSSIBLE STATES:

┌──────────────────────────────────────────────┐
│ userId = null                                │
│ isAuthenticated = false                      │
├──────────────────────────────────────────────┤
│ • No JWT in cookies                          │
│ • JWT invalid/expired                        │
│                                              │
│ Actions: Can see/browse, but not act         │
│ Result: Show LoginCTA for protected actions  │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ userId = "user-123"                          │
│ isAuthenticated = true                       │
├──────────────────────────────────────────────┤
│ • Valid JWT in cookie                        │
│ • Verified server-side                       │
│ • Not banned                                 │
│                                              │
│ Actions: Can do everything (except admin)    │
│ Result: Full feature access                  │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ userId = "user-123" + role = "SUPER_ADMIN"   │
│ isAuthenticated = true + isAdmin = true      │
├──────────────────────────────────────────────┤
│ • Valid JWT in cookie                        │
│ • role field = SUPER_ADMIN                   │
│ • Verified in DB                             │
│                                              │
│ Actions: Admin routes + everything           │
│ Result: /admin/* + full feature access       │
└──────────────────────────────────────────────┘
```

---

## Redirect Intent Visualization

```
WITHOUT INTENT PRESERVATION (❌ OLD):

User at /listings/123
    ↓ (tries to offer)
Redirect /login
    ↓ (logs in)
Redirect /listings  ❌ Lost original context!

---

WITH INTENT PRESERVATION (✅ NEW):

User at /listings/123
    ↓ (tries to offer)
Redirect /login?redirectTo=/listings/123
    ↓ (logs in)
    ✓ Server reads redirectTo param
Redirect /listings/123  ✅ Back to original context!


CHAIN EXAMPLE: Registration → Login → Original Page

User at /sell (guest)
    ↓ (server checks auth)
Redirect /login?redirectTo=/sell
    ↓ (no account)
Click "Register"
    ↓ (register page reads redirectTo param)
Redirect /login?redirectTo=/sell  (still there!)
    ↓ (register new account)
Auto-login: jwt set
Redirect /sell  ✅ Complete circle!
```

---

## Key Takeaway

```
┌─────────────────────────────────────────────┐
│ GUESTS = USERS WITHOUT A JWT TOKEN          │
│                                              │
│ ✅ Can view public pages                    │
│ ❌ Cannot perform actions                   │
│ ✅ See LoginCTA when trying to act          │
│ ✅ Redirected with intent                   │
│                                              │
│ NO SPECIAL "GUEST MODE" - Just no auth!    │
└─────────────────────────────────────────────┘
```
