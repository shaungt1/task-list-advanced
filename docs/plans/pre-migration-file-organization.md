# Pre-Migration File Organization Strategy

**Document Version:** 1.0
**Date:** 2025-11-17
**Purpose:** Reorganize current Vite project files for clean Next.js migration

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Component Analysis](#component-analysis)
3. [Recommended Organization Strategy](#recommended-organization-strategy)
4. [Pre-Migration Reorganization Steps](#pre-migration-reorganization-steps)
5. [Next.js Target Structure](#nextjs-target-structure)
6. [Migration Mapping](#migration-mapping)
7. [Testing Strategy](#testing-strategy)

---

## Problem Statement

### Current Situation

You have:
- **Current Vite Project**: `task-list-advanced` with 35+ components in `src/components/`
- **Target Next.js Project**: Already has a `src/app/components/` folder
- **Concern**: Namespace collisions and unclear file organization during migration

### Key Questions

1. **Should we rename the components folder?**
   → Yes, use feature-based namespacing (`task-list`, `admin`, `shared`)

2. **Where should task list components go?**
   → In Next.js: `src/app/components/task-list/` (feature-isolated)

3. **What about globally-used components (auth, admin)?**
   → Separate them: `src/app/components/shared/` for auth, `src/app/components/admin/` for admin

4. **How to organize before migration?**
   → Pre-organize in current Vite project, then migrate organized structure

---

## Component Analysis

### Component Classification

I've analyzed all 35+ components and classified them by usage scope:

#### Category 1: Task List Feature-Specific (Core Feature)

**These components are ONLY used for the task list feature:**

```
TaskList.tsx                 # Task list container
TaskItem.tsx                 # Individual task wrapper
TaskDisplay.tsx              # Task display mode
TaskEditForm.tsx             # Task editing mode
TaskInput.tsx                # New task input form
TaskText.tsx                 # Task text display
TaskListSection.tsx          # Task list section container
TaskListSelector.tsx         # Task list selector UI
DraggableTaskItem.tsx        # Drag-and-drop wrapper
AITaskGenerator.tsx          # AI task generation (task-list specific)
ChatHistory.tsx              # AI chat history (for task generation)
code/CodeBlock.tsx           # Code block display (for tasks)
code/CodeBlockEditor.tsx     # Code block editor (for tasks)
RichTextEditor.tsx           # Rich text editor (for tasks)
ConfirmationModal.tsx        # Confirmation (task-list navigation)
IntroModal.tsx               # Task list intro
HelpModal.tsx                # Task list help
ExportModal.tsx              # Export task lists
SaveModal.tsx                # Save task list
DescriptionModal.tsx         # Task description modal
tour/Tour.tsx                # Task list onboarding tour
intro/WelcomeImage.tsx       # Task list intro images
intro/TaskCreationImage.tsx
intro/RichContentImage.tsx
intro/AIGenerationImage.tsx
intro/ImportExportImage.tsx
```

**Total: 26 components** - These should all move to `task-list/` folder

---

#### Category 2: Globally Reusable Components (Shared)

**These components can be used across ANY feature in your Next.js app:**

```
auth/AuthModal.tsx           # Authentication modal (global)
auth/LoginButton.tsx         # Login button (global)
ErrorNotification.tsx        # Error toast (global)
Footer.tsx                   # App footer (global)
```

**Total: 4 components** - These should move to `shared/` or root `components/`

---

#### Category 3: Admin Feature-Specific

**These components are ONLY used for admin features:**

```
admin/AdminDashboard.tsx     # Admin dashboard
admin/ListEditor.tsx         # Admin list editor
admin/SaveListButton.tsx     # Save list button
admin/CategoryManager.tsx    # Category management
admin/SaveImportModal.tsx    # Admin import modal
CategorySelector.tsx         # Category selector (admin-related)
```

**Total: 6 components** - Keep in `admin/` folder

---

#### Category 4: Hybrid Components (Needs Decision)

**These components are used in multiple contexts:**

```
Header.tsx                   # App header (used globally OR task-list specific?)
SettingsModal.tsx            # Settings (includes AI config for tasks, but also global auth)
```

**Decision needed:**
- **Header.tsx**: If used app-wide → `shared/`, if only for task list → `task-list/`
- **SettingsModal.tsx**: Currently task-list specific (AI settings), but could be global

**Recommendation:**
- Move **Header.tsx** to `shared/` (likely used app-wide)
- Move **SettingsModal.tsx** to `task-list/` (mostly task/AI settings)

---

## Recommended Organization Strategy

### Strategy: Feature-Based Modules with Namespace Isolation

**Goal:** Organize all task-list components into a single `task-list` module that can be:
1. Easily migrated to Next.js without conflicts
2. Reused in other projects as a complete feature
3. Isolated from global/shared components

### Folder Structure (Current Vite Project)

**Before Migration - Reorganize Current Project:**

```
src/
├─ components/
│  ├─ task-list/              # NEW: Task List Feature Module
│  │  ├─ core/                # Core task components
│  │  │  ├─ TaskList.tsx
│  │  │  ├─ TaskItem.tsx
│  │  │  ├─ TaskDisplay.tsx
│  │  │  ├─ TaskEditForm.tsx
│  │  │  ├─ TaskInput.tsx
│  │  │  ├─ TaskText.tsx
│  │  │  ├─ TaskListSection.tsx
│  │  │  ├─ TaskListSelector.tsx
│  │  │  └─ DraggableTaskItem.tsx
│  │  ├─ code/                # Code block components
│  │  │  ├─ CodeBlock.tsx
│  │  │  └─ CodeBlockEditor.tsx
│  │  ├─ editor/              # Rich text editor
│  │  │  └─ RichTextEditor.tsx
│  │  ├─ ai/                  # AI task generation
│  │  │  ├─ AITaskGenerator.tsx
│  │  │  └─ ChatHistory.tsx
│  │  ├─ modals/              # Task-list modals
│  │  │  ├─ ConfirmationModal.tsx
│  │  │  ├─ IntroModal.tsx
│  │  │  ├─ HelpModal.tsx
│  │  │  ├─ ExportModal.tsx
│  │  │  ├─ SaveModal.tsx
│  │  │  ├─ DescriptionModal.tsx
│  │  │  └─ SettingsModal.tsx
│  │  ├─ tour/                # Onboarding
│  │  │  └─ Tour.tsx
│  │  └─ intro/               # Intro images
│  │     ├─ WelcomeImage.tsx
│  │     ├─ TaskCreationImage.tsx
│  │     ├─ RichContentImage.tsx
│  │     ├─ AIGenerationImage.tsx
│  │     └─ ImportExportImage.tsx
│  │
│  ├─ shared/                 # NEW: Globally reusable components
│  │  ├─ Header.tsx
│  │  ├─ Footer.tsx
│  │  └─ ErrorNotification.tsx
│  │
│  ├─ auth/                   # Authentication (already exists)
│  │  ├─ AuthModal.tsx
│  │  └─ LoginButton.tsx
│  │
│  └─ admin/                  # Admin features (already exists)
│     ├─ AdminDashboard.tsx
│     ├─ ListEditor.tsx
│     ├─ SaveListButton.tsx
│     ├─ CategoryManager.tsx
│     ├─ SaveImportModal.tsx
│     └─ CategorySelector.tsx  # Move from root to admin
│
├─ hooks/
├─ services/
├─ types/
├─ lib/
└─ utils/
```

**Key Changes:**
1. Create `components/task-list/` with sub-folders
2. Create `components/shared/` for global components
3. Move `CategorySelector.tsx` into `admin/`
4. Keep `auth/` and `admin/` as-is (already well organized)

---

## Pre-Migration Reorganization Steps

### Phase 1: Create New Folder Structure (10 minutes)

```bash
# In your current Vite project root
cd src/components

# Create new directories
mkdir -p task-list/core
mkdir -p task-list/code
mkdir -p task-list/editor
mkdir -p task-list/ai
mkdir -p task-list/modals
mkdir -p task-list/tour
mkdir -p task-list/intro
mkdir -p shared
```

### Phase 2: Move Task List Core Components (15 minutes)

**Move these files to `components/task-list/core/`:**

```bash
mv TaskList.tsx task-list/core/
mv TaskItem.tsx task-list/core/
mv TaskDisplay.tsx task-list/core/
mv TaskEditForm.tsx task-list/core/
mv TaskInput.tsx task-list/core/
mv TaskText.tsx task-list/core/
mv TaskListSection.tsx task-list/core/
mv TaskListSelector.tsx task-list/core/
mv DraggableTaskItem.tsx task-list/core/
```

### Phase 3: Move Code & Editor Components (5 minutes)

**Code components already in subfolder - move entire folder:**

```bash
# If code/ is already a folder:
mv code task-list/

# Move rich text editor:
mv RichTextEditor.tsx task-list/editor/
```

### Phase 4: Move AI Components (5 minutes)

```bash
mv AITaskGenerator.tsx task-list/ai/
mv ChatHistory.tsx task-list/ai/
```

### Phase 5: Move Modals (10 minutes)

```bash
mv ConfirmationModal.tsx task-list/modals/
mv IntroModal.tsx task-list/modals/
mv HelpModal.tsx task-list/modals/
mv ExportModal.tsx task-list/modals/
mv SaveModal.tsx task-list/modals/
mv DescriptionModal.tsx task-list/modals/
mv SettingsModal.tsx task-list/modals/
```

### Phase 6: Move Tour & Intro Components (5 minutes)

```bash
# If tour/ is already a folder:
mv tour task-list/

# If intro/ is already a folder:
mv intro task-list/
```

### Phase 7: Move Shared Components (5 minutes)

```bash
mv Header.tsx shared/
mv Footer.tsx shared/
mv ErrorNotification.tsx shared/
```

### Phase 8: Move CategorySelector to Admin (2 minutes)

```bash
mv CategorySelector.tsx admin/
```

### Phase 9: Update All Import Paths (30-45 minutes)

**This is the critical step!** You need to update all import statements.

#### Example: Update `App.tsx` imports

**Before:**
```typescript
import { Header } from './components/Header';
import { TaskInput } from './components/TaskInput';
import { TaskListSection } from './components/TaskListSection';
import { Footer } from './components/Footer';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { ErrorNotification } from './components/ErrorNotification';
import { IntroModal } from './components/IntroModal';
import { Tour } from './components/tour/Tour';
import { AuthModal } from './components/auth/AuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
```

**After:**
```typescript
import { Header } from './components/shared/Header';
import { TaskInput } from './components/task-list/core/TaskInput';
import { TaskListSection } from './components/task-list/core/TaskListSection';
import { Footer } from './components/shared/Footer';
import { ConfirmationModal } from './components/task-list/modals/ConfirmationModal';
import { SettingsModal } from './components/task-list/modals/SettingsModal';
import { HelpModal } from './components/task-list/modals/HelpModal';
import { ErrorNotification } from './components/shared/ErrorNotification';
import { IntroModal } from './components/task-list/modals/IntroModal';
import { Tour } from './components/task-list/tour/Tour';
import { AuthModal } from './components/auth/AuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
```

#### Files That Need Import Updates

You'll need to update imports in these files:

**Core files:**
- `src/App.tsx` (main orchestrator)

**Task list components that import each other:**
- `TaskListSection.tsx` (imports TaskList, TaskListSelector, AITaskGenerator)
- `TaskList.tsx` (imports DraggableTaskItem)
- `DraggableTaskItem.tsx` (imports TaskItem)
- `TaskItem.tsx` (imports TaskDisplay, TaskEditForm)
- `TaskDisplay.tsx` (imports CodeBlock, TaskText, DescriptionModal)
- `TaskEditForm.tsx` (imports CodeBlockEditor, RichTextEditor)
- `TaskInput.tsx` (imports RichTextEditor, CodeBlockEditor)
- `AITaskGenerator.tsx` (no internal component imports, should be fine)

**Shared components:**
- `Header.tsx` (imports ExportModal, SaveModal if any)
- `SettingsModal.tsx` (imports ChatHistory, ImportExamplesButton)

**Admin components:**
- `AdminDashboard.tsx` (imports ListEditor, CategorySelector, modals)
- `ListEditor.tsx` (imports TaskInput, TaskList)

### Phase 10: Test Everything (15 minutes)

```bash
# Run dev server
npm run dev

# Test all functionality:
# - Create tasks
# - Edit tasks
# - Delete tasks
# - Drag & drop
# - AI generation
# - Import/export
# - Admin dashboard
# - Authentication
```

**If you see import errors:**
- Check the file path is correct
- Check the file was moved to the right location
- Check for typos in folder names

---

## Next.js Target Structure

### After Migration to Next.js

When you're ready to migrate to Next.js, the structure will be:

```
my-nextjs-project/
├─ src/
│  └─ app/
│     ├─ components/
│     │  ├─ task-list/              # Your entire task list feature
│     │  │  ├─ core/
│     │  │  ├─ code/
│     │  │  ├─ editor/
│     │  │  ├─ ai/
│     │  │  ├─ modals/
│     │  │  ├─ tour/
│     │  │  └─ intro/
│     │  ├─ shared/                 # Globally reusable
│     │  │  ├─ Header.tsx
│     │  │  ├─ Footer.tsx
│     │  │  └─ ErrorNotification.tsx
│     │  ├─ auth/                   # Global auth
│     │  │  ├─ AuthModal.tsx
│     │  │  ├─ LoginButton.tsx
│     │  │  └─ AuthProvider.tsx    # NEW in Next.js
│     │  └─ admin/                  # Admin feature
│     │     └─ ... (all admin files)
│     │
│     ├─ task-list/                 # Task list pages
│     │  ├─ page.tsx               # /task-list route
│     │  └─ [listName]/
│     │     └─ page.tsx            # /task-list/:listName
│     │
│     ├─ admin/
│     │  └─ ... (admin pages)
│     │
│     └─ (other existing Next.js pages)
```

**Benefits of This Structure:**

1. **No Conflicts**: Your task-list components are namespaced under `task-list/`
2. **Easy to Find**: All related components grouped together
3. **Reusable**: Can copy entire `task-list/` folder to other projects
4. **Clean Separation**: Global vs feature-specific is clear
5. **Scalable**: Easy to add more features (e.g., `calendar/`, `notes/`)

---

## Migration Mapping

### From Current Vite to Next.js

**Organized Vite Structure → Next.js Structure:**

```
Vite: src/components/task-list/
  → Next.js: src/app/components/task-list/
  (Copy entire folder as-is)

Vite: src/components/shared/
  → Next.js: src/app/components/shared/
  (Copy entire folder as-is)

Vite: src/components/auth/
  → Next.js: src/app/components/auth/
  (Copy, add AuthProvider.tsx)

Vite: src/components/admin/
  → Next.js: src/app/components/admin/
  (Copy entire folder as-is)

Vite: src/App.tsx
  → Next.js: src/app/task-list/page.tsx
  (Refactor from route logic to page component)

Vite: src/hooks/
  → Next.js: src/hooks/
  (Copy, add 'use client' directives)

Vite: src/services/
  → Next.js: src/services/
  (Copy, update env vars)

Vite: src/types/
  → Next.js: src/types/
  (Copy as-is)

Vite: src/lib/
  → Next.js: src/lib/
  (Copy, split supabase.ts into client/server)

Vite: src/utils/
  → Next.js: src/lib/utils/
  (Copy to lib/utils/)
```

### Import Path Updates for Next.js

**In Next.js, use path aliases:**

```typescript
// tsconfig.json paths configuration
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/app/components/*"],
      "@/task-list/*": ["./src/app/components/task-list/*"],
      "@/shared/*": ["./src/app/components/shared/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

**Import examples in Next.js:**

```typescript
// Task list components
import { TaskList } from '@/task-list/core/TaskList';
import { AITaskGenerator } from '@/task-list/ai/AITaskGenerator';
import { CodeBlock } from '@/task-list/code/CodeBlock';

// Shared components
import { Header } from '@/shared/Header';
import { ErrorNotification } from '@/shared/ErrorNotification';

// Auth components
import { AuthModal } from '@/components/auth/AuthModal';

// Hooks
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';

// Services
import { getTaskLists } from '@/services/taskListService';

// Types
import type { Task } from '@/types/task';
```

---

## Testing Strategy

### Before Reorganization

```bash
# 1. Commit current state
git add .
git commit -m "Pre-reorganization checkpoint"

# 2. Create a branch for reorganization
git checkout -b feature/reorganize-components
```

### During Reorganization

**After each phase, test:**

```bash
# Run dev server
npm run dev

# Check for errors in console
# Test basic functionality
```

### After Reorganization

**Full regression testing:**

1. **Task Management:**
   - [ ] Create task
   - [ ] Edit task
   - [ ] Delete task
   - [ ] Toggle completion
   - [ ] Drag & drop reorder
   - [ ] Add code block
   - [ ] Add rich text
   - [ ] Create headline

2. **AI Features:**
   - [ ] Generate tasks with Gemini
   - [ ] Upload file for context
   - [ ] View chat history

3. **Admin:**
   - [ ] View admin dashboard
   - [ ] Edit list
   - [ ] Delete list
   - [ ] Create example list
   - [ ] Manage categories

4. **Import/Export:**
   - [ ] Import JSON
   - [ ] Export JSON
   - [ ] Export Markdown

5. **Authentication:**
   - [ ] Sign up
   - [ ] Sign in
   - [ ] Sign out

6. **Deep Linking:**
   - [ ] Load list from URL
   - [ ] Share list URL

**If all tests pass:**

```bash
# Merge reorganization
git add .
git commit -m "Reorganize components into feature-based structure"
git checkout main
git merge feature/reorganize-components
```

---

## Summary & Recommendations

### Recommended Approach

1. ✅ **Pre-organize in Vite project FIRST** before migrating to Next.js
2. ✅ **Use feature-based folder structure** (`task-list/`, `shared/`, `admin/`)
3. ✅ **Keep auth as global** (used across entire app)
4. ✅ **Isolate task list components** in `task-list/` module
5. ✅ **Test thoroughly** after reorganization

### Timeline

- **Phase 1-8**: 1 hour (move files)
- **Phase 9**: 30-45 minutes (update imports)
- **Phase 10**: 15 minutes (testing)
- **Total**: ~2 hours for complete reorganization

### Benefits

1. **Clean Migration**: No namespace conflicts with existing Next.js components
2. **Modular**: Entire task-list feature is self-contained
3. **Reusable**: Can extract `task-list/` folder for other projects
4. **Maintainable**: Clear separation of concerns
5. **Scalable**: Easy to add more features

### Next Steps

1. **Review this plan** and adjust folder names if needed
2. **Create feature branch** for reorganization
3. **Follow Phase 1-10** step by step
4. **Test thoroughly** after each phase
5. **Commit reorganized structure**
6. **Begin Next.js migration** using the organized structure

---

## Quick Reference Commands

```bash
# Create all directories at once
cd src/components
mkdir -p task-list/{core,code,editor,ai,modals,tour,intro} shared

# Move all core task components
mv TaskList.tsx TaskItem.tsx TaskDisplay.tsx TaskEditForm.tsx TaskInput.tsx TaskText.tsx TaskListSection.tsx TaskListSelector.tsx DraggableTaskItem.tsx task-list/core/

# Move modals
mv ConfirmationModal.tsx IntroModal.tsx HelpModal.tsx ExportModal.tsx SaveModal.tsx DescriptionModal.tsx SettingsModal.tsx task-list/modals/

# Move shared
mv Header.tsx Footer.tsx ErrorNotification.tsx shared/

# Move AI
mv AITaskGenerator.tsx ChatHistory.tsx task-list/ai/

# Move editor
mv RichTextEditor.tsx task-list/editor/

# Move folders (if not already subfolders)
mv code task-list/ 2>/dev/null || echo "code already in subfolder"
mv tour task-list/ 2>/dev/null || echo "tour already in subfolder"
mv intro task-list/ 2>/dev/null || echo "intro already in subfolder"

# Move CategorySelector to admin
mv CategorySelector.tsx admin/
```

---

**Document Status:** ✅ Ready to Execute
**Last Updated:** 2025-11-17
**Estimated Time:** 2 hours for complete reorganization
