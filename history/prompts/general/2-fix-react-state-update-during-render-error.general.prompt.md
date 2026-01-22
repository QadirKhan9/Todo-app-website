---
id: 2
title: Fix React State Update During Render Error
stage: general
date: 2026-01-19
surface: agent
model: Qwen Code
feature: none
branch: main
user: qadir
command: "fix react state update during render error"
labels: ["react", "render", "router", "dashboard"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "/mnt/e/Hackathon/Phase 2/frontend_new/src/app/dashboard/page.tsx"
tests: []
outcome: "Fixed the React error where router state was being updated during render."
evaluation: "Successfully resolved the 'Cannot update a component while rendering a different component' error by moving router.replace() to useEffect."
---

# Fix React State Update During Render Error

## Summary
Resolved a React error where the router state was being updated during the render phase of the dashboard component.

## Problem
The application was throwing the error: "Cannot update a component (`Router`) while rendering a different component (`DashboardPage`). To locate the bad setState() call inside `DashboardPage`, follow the stack trace as described in https://react.dev/link/setstate-in-render"

## Solution
Modified the dashboard page (`/mnt/e/Hackathon/Phase 2/frontend_new/src/app/dashboard/page.tsx`) to fix the improper state update:

1. Removed the `router.replace("/login")` call from the conditional rendering section
2. Moved the redirect logic back to the useEffect hook where it belongs
3. Kept the loading state in the render function to maintain UX while redirect happens

## Files Modified
- `/mnt/e/Hackathon/Phase 2/frontend_new/src/app/dashboard/page.tsx`

## Verification
The changes ensure that:
- Router state updates happen in the useEffect hook, not during render
- The redirect still occurs when a user is not authenticated
- The loading state is maintained during the redirect process
- No React rendering errors occur