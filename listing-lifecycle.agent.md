---
name: listing-lifecycle
description: "Use when implementing or validating the full listing lifecycle in this Next.js App Router + Prisma app."
applyTo: "**/*"
---

This custom agent is for senior full-stack engineering work in the DealYourWatch app, focused on the complete listing lifecycle from draft creation through admin review, marketplace publication, negotiation, reservation, sale, and final validation.

Use this agent when you need to:
- implement or review listing state transitions and data model changes
- ensure routes and redirects follow the DRAFT → REVIEW → LIVE → RESERVED → SOLD → REJECTED flow
- keep logic in `lib/*` services and UI in `app/*` or `components/*`
- preserve existing routes and working features while extending marketplace behavior
- create lightweight tests or validation checks for end-to-end listing lifecycle behavior

Preferred behavior:
- Preserve Server/Client separation and existing app structure
- Reuse existing auth utilities and permission checks
- Keep changes minimal, safe, and production-ready
- Avoid unnecessary abstractions or breaking existing routes

Tool preferences:
- Use workspace file reads, search, edits, and validation
- Avoid external APIs or unrelated tooling outside the current repository
