---
id: 7
title: Fix Create Todo Flow to Prevent Login Redirect
stage: general
date_iso: 2026-01-15
surface: agent
model: Qwen Code
feature: none
branch: main
user: qwen-agent
command: fix-create-todo-flow
labels:
  - auth
  - tasks
  - api
  - error-handling
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - /mnt/e/Hackathon/Phase 2/frontend_new/src/lib/api.ts
  - /mnt/e/Hackathon/Phase 2/frontend_new/src/hooks/useTasks.ts
  - /mnt/e/Hackathon/Phase 2/frontend_new/src/components/TaskForm.tsx
  - /mnt/e/Hackathon/Phase 2/frontend_new/src/app/dashboard/page.tsx
tests_yaml:
  - Test create task flow without redirecting to login
  - Verify error handling for 422 and 400 responses
  - Check success message display
---

# Fix Create Todo Flow to Prevent Login Redirect

## Summary
Fixed the Create Todo flow so that creating a task does not redirect the user to the login page. The implementation now follows the exact backend schema and handles errors locally without triggering logout.

## Changes Made

### 1. Updated API Client (`src/lib/api.ts`)
- Changed createTask endpoint from `/users/{userId}/tasks` to `/todos/` with trailing slash
- Mapped frontend taskData properties to match backend schema:
  - `dueDate` → `due_date`
  - Maintained `title`, `description`, and `priority` fields

### 2. Updated useTasks Hook (`src/hooks/useTasks.ts`)
- Enhanced error handling in createTask function to catch specific HTTP status codes:
  - 422 → Shows form error message
  - 400 → Shows validation error message
  - 401 → Shows unauthorized message without redirecting
- Added comprehensive error handling without triggering logout or redirect
- Prevented interceptor from handling Create Todo errors by catching them locally

### 3. Updated TaskForm Component (`src/components/TaskForm.tsx`)
- Modified onSubmit prop to accept a Promise return type
- Added success message display (green notification) on successful task creation
- Updated handleSubmit to await the onSubmit function and handle the result
- Added error handling for submission failures

### 4. Updated Dashboard Page (`src/app/dashboard/page.tsx`)
- Modified handleCreateTask to properly handle the promise returned by createTask
- Return result to the form component for proper feedback
- Maintain user on the dashboard after task creation

## Technical Details
- POST request now uses exact backend route: `POST /api/v1/todos/`
- Request body matches backend schema exactly:
  ```json
  {
    "title": string,
    "description": string (optional),
    "due_date": string (YYYY-MM-DD, optional),
    "priority": "low" | "medium" | "high" (optional)
  }
  ```
- Local error handling prevents interceptor from triggering logout
- Success flow updates task list state without page redirect
- Form clears after successful submission (for create, not edit)

## Verification
- Create task flow no longer redirects to login page
- Error responses (422, 400) are handled locally with appropriate messages
- Success messages are displayed to the user
- Task list updates after successful creation
- All existing functionality preserved