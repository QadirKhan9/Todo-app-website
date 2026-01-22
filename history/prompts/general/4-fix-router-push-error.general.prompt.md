---
id: 4
title: Fix Router Push During Render Error
stage: general
date_iso: 2026-01-15
surface: agent
model: Qwen Code
feature: none
branch: main
user: qwen-agent
command: fix-router-push-error
labels:
  - react
  - routing
  - dashboard
  - error-fix
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - /mnt/e/Hackathon/Phase 2/frontend_new/src/app/dashboard/page.tsx
tests_yaml:
  - Verification of no console errors during rendering
  - Test of redirect functionality
  - Check of auth state handling
---

# Fix Router Push During Render Error

## Summary
Fixed the React error "Cannot update a component while rendering a different component" that occurred when calling router.push() during the render phase in the dashboard page.

## Changes Made

### 1. Updated Dashboard Page (`src/app/dashboard/page.tsx`)
- Removed direct `router.push('/login')` call from the render function
- Changed the redirect logic to show a loading state instead of calling router.push directly
- Maintained the useEffect hook that handles the actual redirect when user is not authenticated

## Technical Details
- The error occurred because `router.push()` was being called directly during the render phase
- React doesn't allow state updates (like navigation) during render
- Fixed by showing a temporary loading state and letting the useEffect handle the redirect
- The useEffect hook already existed and properly handles the redirect after the component mounts

## Error Resolution
- Removed the direct `router.push('/login')` call from the conditional render
- Now showing a "Redirecting to login..." message while the useEffect performs the redirect
- This eliminates the React rendering error while maintaining the same functionality