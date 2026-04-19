# Implementation Verification Checklist

## 📋 Pre-Deployment Verification

Use this checklist to verify the implementation is working correctly before deploying.

---

## ✅ File Creation Check

- [ ] `lib/auth-utils.ts` exists with:
  - [ ] `getAuthState()` function
  - [ ] `getRedirectIntent()` function  
  - [ ] `createLoginRedirectUrl()` function

- [ ] `components/LoginCTA.tsx` exists with:
  - [ ] Client component marked with `"use client"`
  - [ ] Takes `redirectTo`, `message`, `buttonText` props
  - [ ] Calls `createLoginRedirectUrl()` on button click
  - [ ] Shows Spanish localized text

- [ ] `components/AuthGuard.tsx` exists with:
  - [ ] Client component marked with `"use client"`
  - [ ] Takes `isAuthenticated`, `children`, `fallback`, `redirectTo` props
  - [ ] Falls back to LoginCTA if not authenticated

- [ ] Documentation files exist:
  - [ ] `AUTH_IMPLEMENTATION.md`
  - [ ] `AUTH_QUICK_REFERENCE.md`
  - [ ] `AUTH_VISUAL_GUIDE.md`
  - [ ] `IMPLEMENTATION_SUMMARY.md`

---

## ✅ File Modification Check

- [ ] `app/login/page.tsx`
  - [ ] Imports `useSearchParams`
  - [ ] Imports `getRedirectIntent`
  - [ ] Uses `searchParams` to read `redirectTo`
  - [ ] Calls `getRedirectIntent()` before redirecting
  - [ ] Does NOT hardcode `/listings` redirect

- [ ] `app/register/page.tsx`
  - [ ] Imports `useSearchParams`
  - [ ] Imports `getRedirectIntent`
  - [ ] Includes redirectTo in redirect to login
  - [ ] Chains: register → login?redirectTo → original path

- [ ] `app/sell/page.tsx`
  - [ ] Is a **server component** (no `"use client"`)
  - [ ] Imports `getUserIdFromCookie`
  - [ ] Checks `if (!userId)` and redirects
  - [ ] Redirect includes `redirectTo=/sell`
  - [ ] Async function with `await`

- [ ] `app/me/page.tsx`
  - [ ] Has `useState` for `isAuthenticated`
  - [ ] Has `useEffect` that calls `/api/me`
  - [ ] Shows LoginCTA when not authenticated
  - [ ] Shows loading state while checking auth

- [ ] `app/listings/[id]/page.tsx`
  - [ ] Does NOT import `DEV_USER`
  - [ ] Gets `userId` directly: `await getUserIdFromCookie()`
  - [ ] Allows `userId` to be null
  - [ ] Checks: `currentUserId !== null && currentUserId === listing.user.id`
  - [ ] `loadNegotiationState()` accepts `string | null` userId

- [ ] `components/listing/ListingActions.tsx`
  - [ ] Imports `usePathname`
  - [ ] Imports `createLoginRedirectUrl`
  - [ ] Redirects with intent: `createLoginRedirectUrl(pathname)`
  - [ ] Does NOT hardcode `/login` redirect

- [ ] `app/negotiations/[id]/page.tsx`
  - [ ] Does NOT import `DEV_USER`
  - [ ] Has state for `userId: string | null`
  - [ ] Has `isLoadingAuth` state
  - [ ] Fetches `/api/me` to check auth
  - [ ] Shows LoginCTA for unauthenticated users
  - [ ] Only loads negotiation if authenticated

- [ ] `app/api/upload/route.ts`
  - [ ] Does NOT have `|| "dev-user-1"` fallback
  - [ ] Properly returns 401 if `!userId`

---

## ✅ Imports Check

**Required new imports should exist in:**

- [ ] Login page:
  ```tsx
  import { useSearchParams } from "next/navigation";
  import { getRedirectIntent } from "@/lib/auth-utils";
  ```

- [ ] Register page:
  ```tsx
  import { useSearchParams } from "next/navigation";
  import { getRedirectIntent } from "@/lib/auth-utils";
  ```

- [ ] Sell page:
  ```tsx
  import { redirect } from "next/navigation";
  import { getUserIdFromCookie } from "@/lib/getUser";
  ```

- [ ] Me page:
  ```tsx
  import { LoginCTA } from "@/components/LoginCTA";
  ```

- [ ] Listing Detail page:
  ```tsx
  // Should NOT have: import { DEV_USER } from "@/lib/devUser";
  ```

- [ ] ListingActions:
  ```tsx
  import { usePathname } from "next/navigation";
  import { createLoginRedirectUrl } from "@/lib/auth-utils";
  ```

- [ ] Negotiations page:
  ```tsx
  import { LoginCTA } from "@/components/LoginCTA";
  // Should NOT have: import { DEV_USER } from "@/lib/devUser";
  ```

---

## ✅ Runtime Behavior Check

### Test 1: Guest Browse Listings
- [ ] Open incognito/private window
- [ ] Navigate to `http://localhost:3000/listings`
- [ ] Page loads without auth errors
- [ ] Can see listings

### Test 2: Guest View Listing Detail
- [ ] Still in guest mode
- [ ] Click on a listing → goes to `/listings/[id]`
- [ ] Page loads without errors
- [ ] Can see listing details, seller card, images

### Test 3: Guest Try to Offer
- [ ] Still in guest mode, on `/listings/[id]`
- [ ] Look for offer button/form
- [ ] Button should show `LoginCTA` (not an error)
- [ ] Button text should say "Iniciar sesión para continuar"

### Test 4: LoginCTA Redirect with Intent
- [ ] Click LoginCTA button on listing
- [ ] Redirected to `/login?redirectTo=/listings/123` (or similar)
- [ ] URL shows the `?redirectTo=` parameter

### Test 5: Login and Return to Context
- [ ] On login page with `?redirectTo=` in URL
- [ ] Enter valid credentials and submit
- [ ] Should redirect back to `/listings/123` (the listing)
- [ ] NOT to `/listings` or homepage

### Test 6: Authenticated User Can Offer
- [ ] Still authenticated from Test 5
- [ ] Back on `/listings/[id]` page
- [ ] Offer button should work (create negotiation)
- [ ] Should redirect to `/negotiations/[id]`

### Test 7: Guest Access /sell
- [ ] Open new incognito window (new guest)
- [ ] Navigate to `http://localhost:3000/sell`
- [ ] Should redirect to `/login?redirectTo=/sell`
- [ ] NOT show the sell form

### Test 8: Sell After Login
- [ ] On login page (from Test 7)
- [ ] Log in with valid credentials
- [ ] Should redirect to `/sell` (not `/listings`)
- [ ] SellForm should render

### Test 9: Guest Access /me
- [ ] Open new incognito window (new guest)  
- [ ] Navigate to `http://localhost:3000/me`
- [ ] Should NOT redirect immediately  
- [ ] Should show LoginCTA component
- [ ] Button should redirect with `?redirectTo=/me`

### Test 10: My Account After Login
- [ ] On `/me` with LoginCTA showing
- [ ] Click LoginCTA button
- [ ] Log in
- [ ] Should return to `/me` (not `/listings`)
- [ ] Should show MyListings/MyNegotiations tabs

---

## ✅ Code Quality Check

- [ ] No `DEV_USER` fallbacks in auth-critical code
- [ ] No hardcoded `/listings` redirects after login
- [ ] All `userId` checks properly handle null
- [ ] No throw/error on missing userId (except in API)
- [ ] LoginCTA component is reusable (used in multiple places)
- [ ] All auth utilities have JSDoc comments
- [ ] TypeScript types are correct (no `any`)

---

## ✅ API Endpoint Check

Test with curl or Postman:

### GET /api/listings
```bash
curl http://localhost:3000/api/listings
```
- [ ] Response: 200 OK (even without auth)
- [ ] Returns: Array of listings

### POST /api/listings (without auth)
```bash
curl -X POST http://localhost:3000/api/listings
```
- [ ] Response: 401 Unauthorized (no JWT cookie)
- [ ] Does NOT show server error

### GET /api/me (without auth)
```bash
curl http://localhost:3000/api/me
```
- [ ] Response: 401 Unauthorized

### POST /api/login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```
- [ ] Response: 200 OK (or 401 for invalid creds)
- [ ] Sets `auth_token` cookie (check headers)

---

## ✅ Error Handling Check

- [ ] No console errors when visiting `/listings` as guest
- [ ] No console errors when viewing `/listings/[id]` as guest
- [ ] No console errors on LoginCTA components
- [ ] AuthGuard properly shows fallback/children
- [ ] Invalid redirectTo URLs default to `/`

---

## ✅ TypeScript Check

Run:
```bash
npm run build
# or
npx tsc --noEmit
```

- [ ] No TypeScript errors in modified auth files
- [ ] Pre-existing errors in tests are OK
- [ ] Pre-existing errors in admin page are OK
- [ ] Build completes successfully

---

## ✅ Mobile/Responsive Check

- [ ] LoginCTA displays on mobile
- [ ] Login page responsive
- [ ] Listing page responsive
- [ ] Offer button visible on mobile
- [ ] All text readable on small screens

---

## 🚨 Common Issues & Fixes

### Issue: "Cannot find module '@/lib/auth-utils'"
**Fix:** Ensure `lib/auth-utils.ts` exists and path is correct in tsconfig.json

### Issue: LoginCTA not appearing
**Fix:** Check:
- [ ] `isAuthenticated` is false
- [ ] Component is being imported correctly
- [ ] Variable names match (check for typos)

### Issue: Redirects hardcoded to `/listings`
**Fix:** Search and fix these:
```tsx
// ❌ WRONG:
router.push("/listings");

// ✅ RIGHT:
const redirectTo = getRedirectIntent(Object.fromEntries(searchParams));
router.push(redirectTo || "/");
```

### Issue: userId is always null for authenticated users
**Fix:** Check:
- [ ] Cookies are being set (check DevTools → Application → Cookies)
- [ ] JWT_SECRET environment variable is set
- [ ] `getUserIdFromCookie()` is reading correct cookie name: `auth_token`

### Issue: 500 error instead of 401 on API
**Fix:** Ensure:
- [ ] API routes return `jsonError()` not throw errors
- [ ] Auth check happens before DB operations
- [ ] `if (!userId) return jsonError("Unauthorized", 401)`

---

## ✅ Final Checklist

Before marking as COMPLETE:

- [ ] All file modifications verified
- [ ] All new components work
- [ ] Guest can browse
- [ ] Guest sees LoginCTA on actions
- [ ] Redirects preserve intent
- [ ] After login, user returns to original page
- [ ] Authenticated users unaffected
- [ ] Admin routes still protected
- [ ] API endpoints return proper 401s
- [ ] No console errors
- [ ] TypeScript builds
- [ ] Documentation is clear
- [ ] No DEV_USER fallbacks in auth code

---

## 🎉 Sign-Off

When all checks pass, implementation is verified:

```
Date: _________________
Verified By: ___________
Status: ✅ PRODUCTION READY
```

---

## 📊 Metrics After Verification

| Metric | Value |
|--------|-------|
| Guest Browsing | ✅ Works |
| Intent Preservation | ✅ Works |
| LoginCTA Display | ✅ Works |
| Auth State Handling | ✅ Works |
| Admin Protection | ✅ Works |
| Type Safety | ✅ Works |
| Console Errors | ❌ None |
| Regressions | ❌ None |

**Status: ✅ VERIFIED**
