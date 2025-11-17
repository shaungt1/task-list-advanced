# CLAUDE.md
!!!important you are never allowed to PUSH or COMMIT code to Github unless the user(me) verifies more than 2 times that is okay!!!! you must ask twice in differnt ways for verification or else NEVER PUSH OR OMMIT TO GITHUB YOU ARE NOT AUTHORIZED!!!!

- Never run npm run build we are in developement never run build!!!!
- Never run npm run dev ask the user to run it manaully becuase it is already probally running!!!!

ALL .md docuemnts you create should be sotored in the /docs folder NOT IN ROOT!!!!

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

ONLY UPDATE THE CODE RELATED OR DIRECTLY ASSOCIATED TO THIS TASK DO NOT MOVE, CHANGE, ALTER, OR REMOVE ANY CODE OR LOGIC ANYWARE ELSE!!! LEAVE ALL OTHER CODE NOT RELATED ALONE. DO NOT GO OVERBOARD AND DO NOT MAKE YOUR TASK OVER COMPLEX!!!!!! SIMPLIFY AND USE ENTERPRISE SOFTWARE ENGINEERING BEST PROACTICES AT ALL TIMES!!!! REVIEW THE CODE,TRACE LOGIC AND BUILD A TASK LIST THEN ----> REVERIFY ALL YOUR FINDINGS FOR THE TASK AND CREATE A FINAL CHECKLIST TO EXICUTE AND A PLAN IN FULL.[[!!ATTENTION INTERNAL USE ONLY FOR YOU THE AI!!!! --> TAKE THE PLAN AND WRITE A MARKDOWN DOCUMENT IF INSTRUNCTION ARE TO BOG IN THE docs/plans/ FOLDER THAT YOU WILL REFERE TO BETTWEN TASK OR PHASES TO VERIFY YOU ARE NOT MISSING ANYTHING]] ONCE YOU HAVE A PLAN TELL ME AND I WILL APPROVE IT!! THEN WE CAN MOVE FORWARD

refer to the docs/plans/folder for docuements concerning aspects of this project. For example Unused Components is unused_components.md
---

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 3008
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Environment Setup

1. Copy `.env.example` to `.env`
2. Configure Supabase credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. Run the SQL schema from README.md in Supabase SQL editor
4. Optional: Add Google API key for AI task generation (stored in app settings)

## Architecture Overview

### Data Flow & State Management

The app uses a custom hooks pattern for state management:

- **useTasks** ([src/hooks/useTasks.ts](src/hooks/useTasks.ts)): Central task state management with CRUD operations
- **useAuth** ([src/hooks/useAuth.ts](src/hooks/useAuth.ts)): Authentication state and admin role checking
- **useSettings** ([src/hooks/useSettings.ts](src/hooks/useSettings.ts)): Persistent settings in localStorage

### Task Data Structure

Tasks support multiple content types defined in [src/types/task.ts](src/types/task.ts):
- `text`: Main task title
- `richText`: HTML-formatted detailed description (React Quill)
- `codeBlock`: Syntax-highlighted code with language specification
- `isHeadline`: Groups related tasks together
- `optional`: Marks tasks as optional
- `completed`: Checkbox state

### Service Layer

Located in `src/services/`:

- **taskListService.ts**: Supabase CRUD for task lists with fallback to local JSON files in `/public/tasklists/`
- **aiService.ts**: Google Gemini API integration for AI task generation
- **categoryService.ts**: Category management for organizing task lists

### Authentication & Authorization

- First user to sign up automatically becomes admin
- Admin check: `user.user_metadata.role === 'admin'`
- Admin-only features: AdminDashboard, SaveListModal, example list management
- Auth flow handled via Supabase Auth with [src/components/auth/AuthModal.tsx](src/components/auth/AuthModal.tsx)

### Database Structure

Two main tables in Supabase:
- `task_lists`: Stores task lists with JSONB data column
  - `is_example`: Boolean flag for public example lists
  - Row Level Security policies control access
- `users`: Mirrors auth.users with role management
  - Trigger automatically creates user record on signup

### Component Organization

- `components/`: UI components organized by feature
  - `admin/`: Admin-only components (dashboard, list editor, save modal)
  - `auth/`: Authentication components
  - `code/`: Code block display and editing
  - `layout/`: Header and Footer
  - `modals/`: All modal dialogs
  - `tour/`: Intro tour component
- `hooks/`: Custom React hooks
- `services/`: API integration layer
- `types/`: TypeScript type definitions
- `utils/`: Utility functions (storage, env, links)

### Drag and Drop

Uses @dnd-kit for task reordering:
- [DraggableTaskItem.tsx](src/components/DraggableTaskItem.tsx) wraps tasks with drag functionality
- [TaskList.tsx](src/components/TaskList.tsx) implements the sortable container
- Reordering preserves task relationships (headlines and subtasks)

### Example Lists System

Dual-source approach:
1. Primary: Fetch from Supabase `task_lists` where `is_example = true`
2. Fallback: Load from `/public/tasklists/*.json` if Supabase fails
3. Admin can import local example lists into Supabase via ImportExamplesButton

## Working with AI Task Generation

The AI service ([src/services/aiService.ts](src/services/aiService.ts)) uses Google Gemini 2.0 Flash:
- Requires API key stored in user settings
- Accepts text prompts and optional file attachments
- Returns structured JSON matching TaskList format
- System prompt defines task structure and guidelines

## Import/Export Format

Tasks are exported as JSON with this structure:
```json
{
  "name": "Task List Name",
  "data": [
    {
      "id": "uuid",
      "text": "Task title",
      "completed": false,
      "isHeadline": false,
      "createdAt": "ISO date",
      "codeBlock": { "language": "javascript", "code": "..." },
      "richText": "<p>HTML content</p>",
      "optional": false
    }
  ]
}
```

## Key Implementation Details

### Subtask Logic

Tasks become subtasks by position - any non-headline task after a headline is considered its subtask until the next headline. See `isSubTaskOf` function in [App.tsx](src/App.tsx).

### Storage Strategy

- User tasks: In-memory state (not persisted unless saved to Supabase)
- Settings: localStorage via useSettings hook
- Task lists: Supabase database
- Example lists: Supabase with local JSON fallback

### Admin Features

Admins can access AdminDashboard which provides:
- View all saved task lists
- Create/edit/delete task lists
- Mark lists as examples (public)
- Import local example lists to database
- Edit lists directly in the main app

### First-User Admin Logic

On app load, checks user count in Supabase:
- If count is 0 or error 42501 (permissions), sets `isFirstUser` flag
- AuthModal uses this to automatically assign admin role to first signup
- Role is stored in `user_metadata.role` field

## Testing Notes

No test framework is currently configured. To add tests:
1. Install testing library: `npm install -D vitest @testing-library/react @testing-library/jest-dom`
2. Add vitest config to vite.config.ts
3. Create test files alongside components with `.test.tsx` extension
