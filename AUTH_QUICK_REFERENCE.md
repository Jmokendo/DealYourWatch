# Global Auth Flow - Quick Reference

## What Was Changed

### 🎯 Core Principle
**Guests are a valid user state.** The app no longer assumes every visitor is authenticated.

---

## New Components

### LoginCTA - Guest Auth Gate
```tsx
import { LoginCTA } from "@/components/LoginCTA";

// Usage: Show this when guest tries to perform an action
<LoginCTA 
  redirectTo={currentPath}  // Where to return after login
  message="Log in to offer"   // Custom message
/>
```

### AuthGuard - Conditional Wrapper
```tsx
import { AuthGuard } from "@/components/AuthGuard";

// Usage: Wrap protected content
<AuthGuard isAuthenticated={isAuth}>
  <ProtectedForm /> {/* Only for authenticated */}
</AuthGuard>
```

---

## New Utilities

### getAuthState() - Safe Auth Check
```tsx
import { getAuthState } from "@/lib/auth-utils";

// Server component
const { userId, isAuthenticated } = await getAuthState();
```

### getRedirectIntent() - Read Redirect Param
```tsx
import { getRedirectIntent } from "@/lib/auth-utils";

// Read redirectTo from /login?redirectTo=/path
const target = getRedirectIntent(searchParams);
```

### createLoginRedirectUrl() - Build Login URL with Intent
```tsx
import { createLoginRedirectUrl } from "@/lib/auth-utils";

// Create: /login?redirectTo=/listings/123
const url = createLoginRedirectUrl("/listings/123");
router.push(url);
```

---

## Pages That Changed

| Page | Change | Notes |
|------|--------|-------|
| `/listings` | ✅ Works for guests | No auth required |
| `/listings/[id]` | ✅ Works for guests | Offer button redirects to login with intent |
| `/login` | ✅ Redirects back to original path | Reads `?redirectTo=` param |
| `/register` | ✅ Chains through login with intent | register → login?redirectTo=X → X |
| `/sell` | 🔐 Server-side auth check | Guests redirected to login with intent |
| `/me` | 🔐 Client-side auth check | Guests shown LoginCTA |
| `/negotiations/[id]` | 🔐 Client-side auth check | Guests shown LoginCTA |

---

## API Endpoints

| Route | Guests | Notes |
|-------|--------|-------|
| GET `/api/listings` | ✅ Access | Browse listings |
| POST `/api/listings` | ❌ 401 | Create listing requires auth |
| GET `/api/listings/[id]` | ✅ Access | View listing details |
| POST `/api/listings/[id]/negotiations` | ❌ 401 | Requires authentication |
| GET `/api/me` | ❌ 401 | Used to check auth state |
| POST `/api/upload` | ❌ 401 | Requires authentication |

---

## User Flows

### 1️⃣ Browse as Guest
```
Open /listings
  ↓ (no auth needed)
See listings
  ↓ Click listing
Open /listings/[id]
  ↓ Click offer button
See LoginCTA → "Iniciar sesión para continuar"
  ↓ Click button
Redirected to /login?redirectTo=/listings/[id]
  ↓ Log in
Redirected back to /listings/[id] ✅
```

### 2️⃣ Create Listing as Guest
```
Open /sell (unauthenticated)
  ↓ (server checks auth)
Redirected to /login?redirectTo=/sell
  ↓ Log in
Redirected back to /sell ✅
  ↓
SellForm loads
```

### 3️⃣ View My Account
```
Open /me (unauthenticated)
  ↓ (client checks /api/me)
Show LoginCTA with redirectTo=/me
  ↓ Click button
Redirected to /login?redirectTo=/me
  ↓ Log in
Redirected back to /me ✅
```

---

## Key Code Patterns

### Pattern 1: Check Auth in Server Component
```tsx
// app/sell/page.tsx
export default async function SellPage() {
  const userId = await getUserIdFromCookie();
  
  if (!userId) {
    redirect(`/login?${new URLSearchParams({ redirectTo: "/sell" })}`);
  }
  
  return <SellForm />;
}
```

### Pattern 2: Use LoginCTA for Actions
```tsx
// components/listing/ListingActions.tsx
function startNegotiation() {
  if (!isAuthenticated) {
    router.push(createLoginRedirectUrl(pathname));
    return;
  }
  // ... create negotiation
}
```

### Pattern 3: Check Auth in Client Component
```tsx
// app/me/page.tsx
const [isAuth, setIsAuth] = useState(null);

useEffect(() => {
  fetch('/api/me')
    .then(r => setIsAuth(r.ok))
    .catch(() => setIsAuth(false));
}, []);

if (isAuth === false) {
  return <LoginCTA redirectTo="/me" />;
}
```

---

## Testing the Implementation

### Test 1: Guest Browse
- Open incognito window
- Visit `/listings` ✅ Should work
- Click "Make offer" → Should redirect to `/login?redirectTo=/listings/[id]`
- Log in → Should return to listing

### Test 2: Guest Sell
- Open incognito window  
- Visit `/sell` → Should redirect to `/login?redirectTo=/sell`
- Log in → Should return to `/sell`

### Test 3: Guest Me Page
- Open incognito window
- Visit `/me` → Should show LoginCTA
- Click button → Should redirect with intent
- Log in → Should return to `/me`

---

## Migration Checklist

- ✅ Removed all `DEV_USER` fallbacks from auth-critical code
- ✅ Replaced hardcoded `/listings` redirects with intent preservation
- ✅ Added LoginCTA to action buttons
- ✅ Updated `/sell` and `/me` to gate with auth checks
- ✅ Fixed API endpoints to return 401 for guests
- ✅ Added utilities for auth state and redirect intent
- ✅ Created AuthGuard component for conditional rendering

---

## Common Errors & Fixes

### Error: "Unauthorized" when trying to create offer
**Expected behavior** - Guest not logged in. Should see LoginCTA, not error.
- Check: Is ListingActions showing LoginCTA?
- Fix: Ensure `isAuthenticated` prop is properly passed

### Error: Login redirects to `/listings` instead of original page
**Wrong** - Hardcoded redirect
**Right** - Use `getRedirectIntent()` from searchParams
- Check: Is login page reading `?redirectTo=` param?
- Fix: Verify `useSearchParams()` and `getRedirectIntent()` implementation

### Error: Cannot access `/sell` when not logged in
**Expected behavior** - Should redirect to login with intent
- Check: Is `/sell/page.tsx` a server component?
- Fix: Convert to server component and add auth check

---

## Files Affected Summary

**Created:**
- `lib/auth-utils.ts` - Auth utilities
- `components/LoginCTA.tsx` - Guest gate component
- `components/AuthGuard.tsx` - Conditional wrapper
- `AUTH_IMPLEMENTATION.md` - Full documentation

**Modified:**
- `app/login/page.tsx` - Add redirect intent support
- `app/register/page.tsx` - Chain register → login with intent
- `app/listings/[id]/page.tsx` - Allow null userId
- `app/listings/[id]/components/*.tsx` - Use intent-preserving redirects
- `app/sell/page.tsx` - Add server-side auth check
- `app/me/page.tsx` - Add client-side auth check
- `app/negotiations/[id]/page.tsx` - Allow null userId gracefully
- `app/api/upload/route.ts` - Fix auth checking

---

## Production Notes

1. **No Architecture Changes** - Existing services, components, and APIs unchanged
2. **Backward Compatible** - Authenticated users experience unchanged
3. **SEO Friendly** - Public listing pages accessible to search engines
4. **Security** - Admin routes still require SUPER_ADMIN role
5. **Scalable** - Pattern easily applied to new features

---

## Next Steps (Optional Enhancements)

- [ ] Add "Continue as guest" button to some flows
- [ ] Implement persistent "return here after login" state
- [ ] Add analytics to track guest → user conversions
- [ ] Create guest-specific messaging/CTAs
- [ ] Add demo/trial listing access patterns

