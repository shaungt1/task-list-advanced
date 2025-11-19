# Next.js 15 Migration Plan: Task List Advanced

**Document Version:** 1.0
**Date:** 2025-11-17
**Status:** Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Target Architecture](#target-architecture)
4. [Component Reorganization Strategy](#component-reorganization-strategy)
5. [Next.js 15 App Router Structure](#nextjs-15-app-router-structure)
6. [Authentication Migration Plan](#authentication-migration-plan)
7. [AI Service Extension Plan](#ai-service-extension-plan)
8. [Migration Phases](#migration-phases)
9. [File-by-File Migration Checklist](#file-by-file-migration-checklist)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Considerations](#deployment-considerations)

---

## Executive Summary

This document outlines the comprehensive migration plan for **Task List Advanced** from a Vite/React application to a **Next.js 15 App Router** application. The migration includes:

- **Framework Migration**: Vite → Next.js 15 with App Router
- **Authentication**: Keep Supabase Auth (with optional NextAuth.js integration later)
- **AI Enhancement**: Extend from Google Gemini to multi-LLM support including **OpenAI Realtime API**
- **Component Isolation**: Reorganize into modular, reusable components in `src/app/components/`
- **State Management**: Maintain React hooks pattern with server/client boundary optimization

### Key Goals

1. ✅ Preserve all existing functionality (task management, rich text, code blocks, drag-drop)
2. ✅ Enable multi-LLM AI integration (OpenAI Realtime, Gemini, others)
3. ✅ Improve component organization and reusability
4. ✅ Optimize for Next.js App Router patterns (Server Components, Server Actions)
5. ✅ Maintain deep linking and URL sharing capabilities
6. ✅ Keep Supabase integration with improved security

---

## Current State Analysis

### Technology Stack (Current)

```
Vite 6.3.5
├─ React 18.3.1 + TypeScript 5.5.3
├─ React Router DOM 7.6.1 (client-side routing)
├─ Supabase JS 2.39.3 (database + auth)
├─ @dnd-kit/* (drag & drop)
├─ React Quill 2.0.0 (rich text editor)
├─ Prism.js 1.29.0 (code highlighting)
├─ Tailwind CSS 3.4.1
└─ Google Gemini 2.0 Flash Exp (AI generation)
```

### Current Directory Structure

```
task-list-advanced/
├─ public/
│  ├─ tasklists/          # Example task list JSONs
│  └─ _redirects          # Netlify routing config
├─ src/
│  ├─ main.tsx            # Entry point with React Router
│  ├─ App.tsx             # Main orchestrator (routes, modals)
│  ├─ index.css           # Tailwind imports
│  ├─ components/         # 35+ UI components (flat + some subfolders)
│  │  ├─ admin/          # 5 admin components
│  │  ├─ auth/           # 2 auth components
│  │  ├─ code/           # 2 code components
│  │  ├─ intro/          # 5 image components
│  │  └─ tour/           # 1 tour component
│  ├─ hooks/             # 3 custom hooks
│  │  ├─ useAuth.ts
│  │  ├─ useTasks.ts
│  │  └─ useSettings.ts
│  ├─ services/          # 3 service files
│  │  ├─ aiService.ts
│  │  ├─ taskListService.ts
│  │  └─ categoryService.ts
│  ├─ types/             # 2 type definition files
│  │  ├─ task.ts
│  │  └─ chat.ts
│  ├─ lib/
│  │  └─ supabase.ts     # Supabase client
│  └─ utils/             # 4 utility files
│     ├─ storage.ts
│     ├─ markdownExport.ts
│     ├─ links.ts
│     └─ env.ts
├─ vite.config.ts
├─ tsconfig.json
└─ package.json
```

### Critical Dependencies

**Must Migrate:**
- `react-router-dom` → Next.js App Router (file-based)
- `import.meta.env.*` → `process.env.NEXT_PUBLIC_*`
- Vite build system → Next.js build

**Compatible (No Changes):**
- React 18, TypeScript, Tailwind CSS
- @dnd-kit, react-quill, prismjs, lucide-react
- @supabase/supabase-js

### Current Routes

```
/                        → Main app (task list view)
/list/:listName          → Load specific task list by name
/admin                   → Admin dashboard
/admin/list/:listName    → Edit specific list (admin only)
```

### Key Features to Preserve

1. **Task Management**: Create, edit, delete, reorder, duplicate, toggle completion
2. **Rich Content**: Code blocks (with syntax highlighting), rich text descriptions, headlines
3. **AI Generation**: Google Gemini API integration for task generation
4. **Deep Linking**: URL-based list sharing with normalization (`/list/my-task-list`)
5. **Admin System**: Dashboard, list management, example list publishing
6. **Authentication**: Supabase Auth with role-based access (admin/user)
7. **Import/Export**: JSON and Markdown export, JSON import
8. **Drag & Drop**: Task reordering with @dnd-kit
9. **Local Fallback**: Example lists from `/public/tasklists/*.json`

---

## Target Architecture

### Technology Stack (Target)

```
Next.js 15 (App Router)
├─ React 18.3.1 + TypeScript 5.5.3
├─ Next.js App Router (file-based routing)
├─ Supabase JS 2.39.3 (database + auth) [keep]
├─ Optional: NextAuth.js (future enhancement)
├─ @dnd-kit/* (drag & drop) [keep]
├─ React Quill 2.0.0 [keep]
├─ Prism.js 1.29.0 [keep]
├─ Tailwind CSS 3.4.1 [keep]
└─ AI Services (multi-LLM):
   ├─ Google Gemini API [keep]
   ├─ OpenAI Realtime API [NEW]
   ├─ OpenAI GPT-4 API [NEW]
   └─ Anthropic Claude API [FUTURE]
```

### Target Directory Structure

```
my-nextjs-project/
├─ public/
│  └─ tasklists/          # Example task lists (migrated)
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx       # Root layout
│  │  ├─ page.tsx         # Homepage (/)
│  │  ├─ globals.css      # Tailwind imports
│  │  ├─ list/
│  │  │  └─ [listName]/
│  │  │     └─ page.tsx   # Task list detail page
│  │  ├─ admin/
│  │  │  ├─ layout.tsx    # Admin layout with auth guard
│  │  │  ├─ page.tsx      # Admin dashboard
│  │  │  └─ list/
│  │  │     └─ [listName]/
│  │  │        └─ page.tsx  # List editor page
│  │  ├─ api/             # API routes / Server Actions
│  │  │  ├─ ai/
│  │  │  │  ├─ gemini/route.ts
│  │  │  │  ├─ openai/route.ts
│  │  │  │  └─ realtime/route.ts
│  │  │  └─ tasks/
│  │  │     ├─ route.ts   # Task list CRUD
│  │  │     └─ [id]/route.ts
│  │  └─ components/      # Organized by feature
│  │     ├─ tasklist/     # Task list feature
│  │     ├─ code/         # Code block feature
│  │     ├─ editor/       # Rich text editor
│  │     ├─ ai/           # AI generation
│  │     ├─ auth/         # Authentication
│  │     ├─ admin/        # Admin features
│  │     ├─ modals/       # All modal components
│  │     ├─ layout/       # Layout components
│  │     ├─ tour/         # Onboarding
│  │     └─ ui/           # Reusable UI primitives
│  ├─ lib/
│  │  ├─ supabase/
│  │  │  ├─ client.ts     # Client-side Supabase
│  │  │  └─ server.ts     # Server-side Supabase [NEW]
│  │  ├─ ai/              # AI service abstraction [NEW]
│  │  │  ├─ providers/
│  │  │  ├─ factory.ts
│  │  │  └─ types.ts
│  │  └─ utils/
│  ├─ hooks/
│  │  ├─ useAuth.ts
│  │  ├─ useTasks.ts
│  │  ├─ useSettings.ts
│  │  └─ useAI.ts         # [NEW]
│  ├─ services/
│  │  ├─ taskListService.ts
│  │  └─ categoryService.ts
│  ├─ types/
│  │  ├─ task.ts
│  │  ├─ chat.ts
│  │  └─ ai.ts            # [NEW]
│  └─ actions/            # Server Actions [NEW]
├─ next.config.js
├─ tsconfig.json
└─ .env.local
```

---

## Component Reorganization Strategy

### Proposed Organization (By Feature)

```
src/app/components/
├─ tasklist/          # Task List Feature Module
│  ├─ TaskList.tsx
│  ├─ TaskItem.tsx
│  ├─ TaskDisplay.tsx
│  ├─ TaskEditForm.tsx
│  ├─ TaskInput.tsx
│  ├─ TaskText.tsx
│  ├─ TaskListSection.tsx
│  ├─ TaskListSelector.tsx
│  └─ DraggableTaskItem.tsx
│
├─ code/              # Code Block Feature Module
│  ├─ CodeBlock.tsx
│  └─ CodeBlockEditor.tsx
│
├─ editor/            # Rich Text Editor Module
│  └─ RichTextEditor.tsx
│
├─ ai/                # AI Features Module
│  ├─ AITaskGenerator.tsx
│  ├─ AIProviderSelector.tsx    # [NEW]
│  ├─ ChatHistory.tsx
│  ├─ RealtimeVoice.tsx         # [NEW]
│  └─ AIConfigPanel.tsx         # [NEW]
│
├─ auth/              # Authentication Module
│  ├─ AuthModal.tsx
│  ├─ LoginButton.tsx
│  └─ AuthProvider.tsx          # [NEW]
│
├─ admin/             # Admin Features Module
│  ├─ AdminDashboard.tsx
│  ├─ ListEditor.tsx
│  ├─ SaveListButton.tsx
│  ├─ CategoryManager.tsx
│  └─ SaveImportModal.tsx
│
├─ modals/            # Modal Components Module
│  ├─ ConfirmationModal.tsx
│  ├─ SettingsModal.tsx
│  ├─ HelpModal.tsx
│  ├─ ExportModal.tsx
│  ├─ SaveModal.tsx
│  ├─ IntroModal.tsx
│  └─ DescriptionModal.tsx
│
├─ layout/            # Layout Components Module
│  ├─ Header.tsx
│  ├─ Footer.tsx
│  └─ ErrorNotification.tsx
│
├─ tour/              # Onboarding Module
│  └─ Tour.tsx
│
└─ ui/                # Reusable UI Primitives
   └─ intro/
      ├─ WelcomeImage.tsx
      ├─ TaskCreationImage.tsx
      ├─ RichContentImage.tsx
      ├─ AIGenerationImage.tsx
      └─ ImportExportImage.tsx
```

### Benefits

1. **Clear Boundaries**: Each feature has its own directory
2. **Easy Testing**: Mock entire feature modules
3. **Code Splitting**: Next.js can optimize imports per feature
4. **Reusability**: Copy entire feature directories to other projects
5. **Scalability**: Add new features without polluting existing structure

---

## Next.js 15 App Router Structure

### Route File Structure

```
src/app/
├─ layout.tsx                    # Root layout (Server Component)
├─ page.tsx                      # Homepage (Client Component)
├─ globals.css                   # Tailwind imports
├─ list/
│  └─ [listName]/
│     └─ page.tsx                # Dynamic list page
├─ admin/
│  ├─ layout.tsx                 # Admin layout with auth guard
│  ├─ page.tsx                   # Admin dashboard
│  └─ list/
│     └─ [listName]/
│        └─ page.tsx             # List editor
└─ api/
   ├─ ai/
   │  ├─ gemini/route.ts
   │  ├─ openai/route.ts
   │  └─ realtime/route.ts
   └─ tasks/
      ├─ route.ts
      └─ [id]/route.ts
```

### Key Implementation Files

#### 1. Root Layout (`src/app/layout.tsx`)

```typescript
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/app/components/auth/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Task List Advanced',
  description: 'Modern task management with AI integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

#### 2. Homepage (`src/app/page.tsx`)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useSettings } from '@/hooks/useSettings';
import Header from '@/app/components/layout/Header';
import TaskInput from '@/app/components/tasklist/TaskInput';
import TaskListSection from '@/app/components/tasklist/TaskListSection';
import Footer from '@/app/components/layout/Footer';
// ... other imports

export default function HomePage() {
  // Migrate logic from current App.tsx
  const { user, loading, isAdmin, signOut } = useAuth();
  const { tasks, addTask, editTask, deleteTask, /* ... */ } = useTasks([]);
  const { settings, saveSettings } = useSettings();

  // Modal states
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  // ... other modal states

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSettingsClick={() => setShowSettings(true)}
        tasks={tasks}
        isAdmin={isAdmin}
      />
      <main className="container mx-auto px-4 py-8">
        <TaskInput onAddTask={addTask} />
        <TaskListSection
          tasks={tasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
          {...otherProps}
        />
      </main>
      <Footer />
      {/* Render modals */}
    </div>
  );
}
```

#### 3. List Detail Page (`src/app/list/[listName]/page.tsx`)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getTaskLists, getExampleLists } from '@/services/taskListService';
import { normalizeForMatching } from '@/lib/utils/urlNormalization';
// ... imports

export default function ListPage() {
  const params = useParams();
  const listName = params.listName as string;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadList() {
      const normalized = normalizeForMatching(
        decodeURIComponent(listName.replace(/-/g, ' '))
      );

      // Try to load from Supabase
      const allLists = await getTaskLists();
      const found = allLists.find(
        list => normalizeForMatching(list.name) === normalized
      );

      if (found) {
        setTasks(found.data);
      } else {
        // Fallback to example lists
        const examples = await getExampleLists();
        const exampleFound = examples.find(
          list => normalizeForMatching(list.name) === normalized
        );
        if (exampleFound) {
          setTasks(exampleFound.data);
        }
      }
      setLoading(false);
    }
    loadList();
  }, [listName]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Render task list UI */}
    </div>
  );
}
```

#### 4. Admin Auth Guard (`src/app/admin/layout.tsx`)

```typescript
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  const isAdmin = session?.user?.user_metadata?.role === 'admin';

  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
```

#### 5. Middleware for Route Protection (`middleware.ts`)

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (req.nextUrl.pathname.startsWith('/admin')) {
    const isAdmin = session?.user?.user_metadata?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

---

## Authentication Migration Plan

### Option 1: Keep Supabase Auth (RECOMMENDED)

**Why Keep:**
- Already integrated and working
- RLS provides database-level security
- Zero migration effort
- Admin role management works perfectly

**Next.js Adaptations:**

```typescript
// src/lib/supabase/client.ts (Client-side)
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

// src/lib/supabase/server.ts (Server-side)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies });
};
```

**Migration Steps:**
1. Install `@supabase/auth-helpers-nextjs`
2. Create client/server Supabase helpers
3. Update `useAuth` hook to use client helper
4. Add middleware for route protection
5. Update environment variables

---

## AI Service Extension Plan

### Current: Single LLM (Google Gemini)

**Limitations:**
- Hardcoded to one provider
- No voice capabilities
- API key exposed client-side
- No model selection

### Target: Multi-LLM Provider System

#### Architecture Pattern: Provider Factory

```typescript
// src/lib/ai/types.ts
export interface AIProvider {
  name: string;
  models: string[];
  generateTasks(prompt: string, options: AIOptions): Promise<TaskList>;
  supportsRealtime?: boolean;
  supportsVision?: boolean;
}

export interface AIOptions {
  model?: string;
  temperature?: number;
  fileContent?: string;
  maxTokens?: number;
}

export type AIProviderType = 'gemini' | 'openai' | 'openai-realtime';
```

#### Base Provider

```typescript
// src/lib/ai/providers/base.ts
export abstract class BaseAIProvider implements AIProvider {
  abstract name: string;
  abstract models: string[];
  protected apiKey: string;
  protected systemPrompt = `You are a task list generator...`;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  abstract generateTasks(prompt: string, options: AIOptions): Promise<TaskList>;

  protected parseResponse(response: string): TaskList {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(cleaned);
  }
}
```

#### Google Gemini Provider

```typescript
// src/lib/ai/providers/gemini.ts
export class GeminiProvider extends BaseAIProvider {
  name = 'Google Gemini';
  models = ['gemini-2.0-flash-exp', 'gemini-pro'];

  async generateTasks(prompt: string, options: AIOptions): Promise<TaskList> {
    const response = await fetch(`/api/ai/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: this.apiKey,
        prompt,
        model: options.model || this.models[0],
        fileContent: options.fileContent,
      }),
    });

    const data = await response.json();
    return data;
  }
}
```

#### OpenAI GPT Provider

```typescript
// src/lib/ai/providers/openai.ts
export class OpenAIProvider extends BaseAIProvider {
  name = 'OpenAI';
  models = ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'];

  async generateTasks(prompt: string, options: AIOptions): Promise<TaskList> {
    const response = await fetch(`/api/ai/openai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: this.apiKey,
        prompt,
        model: options.model || 'gpt-4-turbo',
        temperature: options.temperature || 0.7,
      }),
    });

    const data = await response.json();
    return this.parseResponse(data.content);
  }
}
```

#### OpenAI Realtime Provider (Voice)

```typescript
// src/lib/ai/providers/openai-realtime.ts
export class OpenAIRealtimeProvider extends BaseAIProvider {
  name = 'OpenAI Realtime';
  models = ['gpt-4o-realtime-preview'];
  supportsRealtime = true;

  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;

  async connect(): Promise<void> {
    const response = await fetch('/api/ai/realtime/session', {
      method: 'POST',
      body: JSON.stringify({ apiKey: this.apiKey }),
    });
    const { sessionToken } = await response.json();

    this.ws = new WebSocket(
      `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`,
      { headers: { Authorization: `Bearer ${sessionToken}` } }
    );
  }

  async startVoiceInput(): Promise<void> {
    this.audioContext = new AudioContext();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Process and send audio chunks to WebSocket
  }

  async generateTasks(prompt: string, options: AIOptions): Promise<TaskList> {
    if (!this.ws) await this.connect();

    return new Promise((resolve) => {
      this.ws!.send(JSON.stringify({
        type: 'prompt',
        content: prompt,
      }));

      this.onResponse = (content: string) => {
        resolve(this.parseResponse(content));
      };
    });
  }

  onTranscript?: (text: string) => void;
  onResponse?: (content: string) => void;
}
```

#### Provider Factory

```typescript
// src/lib/ai/factory.ts
export class AIProviderFactory {
  static create(type: AIProviderType, apiKey: string): AIProvider {
    switch (type) {
      case 'gemini':
        return new GeminiProvider(apiKey);
      case 'openai':
        return new OpenAIProvider(apiKey);
      case 'openai-realtime':
        return new OpenAIRealtimeProvider(apiKey);
      default:
        throw new Error(`Unknown provider: ${type}`);
    }
  }
}
```

#### Custom Hook

```typescript
// src/hooks/useAI.ts
'use client';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTasks = useCallback(
    async (
      providerType: AIProviderType,
      apiKey: string,
      prompt: string,
      options?: AIOptions
    ): Promise<TaskList | null> => {
      setLoading(true);
      try {
        const provider = AIProviderFactory.create(providerType, apiKey);
        return await provider.generateTasks(prompt, options || {});
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { generateTasks, loading, error };
}
```

### API Routes (Server-Side)

```typescript
// src/app/api/ai/openai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  const { apiKey, prompt, model } = await request.json();
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  });

  return NextResponse.json({
    content: response.choices[0].message.content,
  });
}
```

---

## Migration Phases

### Phase 1: Initial Setup (Week 1)

**Tasks:**
1. Create Next.js 15 project:
   ```bash
   npx create-next-app@latest my-nextjs-project --typescript --tailwind --app
   ```

2. Install dependencies:
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   npm install react-quill prismjs lucide-react openai
   ```

3. Configure environment (`.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

4. Set up `next.config.js`
5. Create initial `src/app/` structure

**Deliverable:** Blank Next.js project with dependencies

---

### Phase 2: Types, Utils, Services (Week 1-2)

**Tasks:**
1. **Types** - Copy as-is:
   - `src/types/task.ts`
   - `src/types/chat.ts`
   - CREATE: `src/types/ai.ts`

2. **Utils** - Migrate:
   - `src/lib/utils/storage.ts`
   - `src/lib/utils/markdownExport.ts`
   - `src/lib/utils/links.ts`
   - CREATE: `src/lib/utils/urlNormalization.ts`

3. **Supabase** - Refactor:
   - Split into `client.ts` and `server.ts`
   - Update `import.meta.env` → `process.env.NEXT_PUBLIC_*`

4. **Services** - Update:
   - `taskListService.ts` - Update env vars
   - `categoryService.ts` - Update env vars

5. **AI Services** - New architecture:
   - CREATE provider system (base, gemini, openai, openai-realtime)
   - CREATE factory pattern

**Deliverable:** All non-UI code migrated

---

### Phase 3: Hooks Migration (Week 2)

**Tasks:**
1. `useAuth` - Add `'use client'`, update imports
2. `useTasks` - Add `'use client'`
3. `useSettings` - Add `'use client'`, extend for multi-provider
4. CREATE: `useAI` - New AI hook

**Deliverable:** All hooks migrated

---

### Phase 4-6: Component Migration (Week 2-4)

**Tasks:**
1. **Phase 4** - Layout, code, editor components
2. **Phase 5** - Task list, modals, auth components
3. **Phase 6** - Admin, AI components, new features

All components get:
- `'use client'` directive
- Updated imports (use `@/` aliases)
- Router updates (useNavigate → useRouter)

**Deliverable:** All components migrated

---

### Phase 7: App Router Pages (Week 4-5)

**Tasks:**
1. CREATE: `app/layout.tsx` (root)
2. CREATE: `app/page.tsx` (homepage from App.tsx)
3. CREATE: `app/list/[listName]/page.tsx`
4. CREATE: `app/admin/layout.tsx` (auth guard)
5. CREATE: `app/admin/page.tsx`
6. CREATE: `app/admin/list/[listName]/page.tsx`
7. CREATE: `middleware.ts` (route protection)

**Deliverable:** All routes functional

---

### Phase 8: API Routes (Week 5)

**Tasks:**
1. CREATE: `app/api/ai/gemini/route.ts`
2. CREATE: `app/api/ai/openai/route.ts`
3. CREATE: `app/api/ai/realtime/session/route.ts`
4. Optional: Task CRUD API routes

**Deliverable:** API routes functional, secured

---

### Phase 9: Testing (Week 5-6)

**Tasks:**
1. Functional testing (all features)
2. AI testing (all providers)
3. Auth testing
4. Deep linking testing
5. Import/export testing
6. Responsive testing
7. Performance testing

**Deliverable:** Production-ready app

---

### Phase 10: Deployment (Week 6)

**Tasks:**
1. Deploy to Vercel/Netlify
2. Configure environment
3. Update documentation
4. Create migration guide

**Deliverable:** Live deployment

---

## File-by-File Migration Checklist

### Configuration Files
- [ ] `package.json` - Create new
- [ ] `next.config.js` - Create
- [ ] `tsconfig.json` - Update for Next.js
- [ ] `tailwind.config.js` - Copy, update paths
- [ ] `.env.local` - Create
- [ ] `middleware.ts` - Create

### Types
- [ ] `src/types/task.ts` → Copy
- [ ] `src/types/chat.ts` → Copy
- [ ] CREATE: `src/types/ai.ts`

### Utilities
- [ ] `src/utils/storage.ts` → `src/lib/utils/storage.ts`
- [ ] `src/utils/markdownExport.ts` → `src/lib/utils/markdownExport.ts`
- [ ] `src/utils/links.ts` → `src/lib/utils/links.ts`
- [ ] CREATE: `src/lib/utils/urlNormalization.ts`

### Library
- [ ] `src/lib/supabase.ts` → Split to `client.ts` + `server.ts`
- [ ] CREATE: AI provider system (5+ files)

### Services
- [ ] `src/services/taskListService.ts` → Update
- [ ] `src/services/categoryService.ts` → Update

### Hooks
- [ ] `src/hooks/useAuth.ts` → Add 'use client'
- [ ] `src/hooks/useTasks.ts` → Add 'use client'
- [ ] `src/hooks/useSettings.ts` → Add 'use client'
- [ ] CREATE: `src/hooks/useAI.ts`

### Components (35+ files)
- [ ] Layout: Header, Footer, ErrorNotification
- [ ] Task List: 8 components
- [ ] Code: 2 components
- [ ] Editor: 1 component
- [ ] Modals: 7 components
- [ ] Auth: 2 components + AuthProvider
- [ ] Admin: 5 components
- [ ] AI: 2 existing + 3 new components
- [ ] Tour + UI: 7 components

### App Router
- [ ] CREATE: `app/layout.tsx`
- [ ] CREATE: `app/page.tsx`
- [ ] CREATE: `app/globals.css`
- [ ] CREATE: `app/list/[listName]/page.tsx`
- [ ] CREATE: `app/admin/layout.tsx`
- [ ] CREATE: `app/admin/page.tsx`
- [ ] CREATE: `app/admin/list/[listName]/page.tsx`

### API Routes
- [ ] CREATE: `app/api/ai/gemini/route.ts`
- [ ] CREATE: `app/api/ai/openai/route.ts`
- [ ] CREATE: `app/api/ai/realtime/session/route.ts`

### Static Assets
- [ ] Copy `public/tasklists/*.json` (7 files)
- [ ] Copy logos, favicons

### Delete
- [ ] `src/main.tsx`
- [ ] `src/App.tsx` (logic moves to page.tsx)
- [ ] `vite.config.ts`
- [ ] `index.html`

---

## Testing Strategy

### Unit Testing
- Hooks: useAuth, useTasks, useSettings, useAI
- Utils: storage, markdown, normalization, links
- Services: taskList, category
- Providers: Gemini, OpenAI, Realtime

### Integration Testing
- Task management flow
- AI generation (all providers)
- Authentication
- Deep linking
- Import/export

### E2E Testing
- Complete user journey
- Admin workflow
- Multi-provider AI switching

### Performance
- FCP < 1.5s
- TTI < 3s
- LCP < 2.5s
- Bundle < 300KB

---

## Deployment Considerations

### Recommended: Vercel
- Zero-config Next.js deployment
- Edge Functions
- Automatic HTTPS
- Preview deployments

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Database
- Use existing Supabase project
- No schema changes needed
- Verify RLS policies

### Monitoring
- Vercel Analytics
- Sentry (errors)
- LogRocket (sessions)

---

## Summary

### Timeline: 6 Weeks

- **Weeks 1-2:** Setup + Core migration
- **Weeks 2-4:** Components + AI enhancement
- **Weeks 4-5:** Routing + API
- **Weeks 5-6:** Testing + Deployment

### Key Deliverables

1. ✅ Next.js 15 App Router with Server Components
2. ✅ Multi-LLM support (Gemini, OpenAI, Realtime)
3. ✅ Voice input via OpenAI Realtime API
4. ✅ Organized component structure
5. ✅ Server-side API security
6. ✅ Full feature parity

### Next Steps

1. Review plan with stakeholders
2. Set up Next.js project
3. Begin Phase 1 migration
4. Follow file-by-file checklist
5. Test and deploy

---

**Status:** ✅ Ready for Implementation
**Last Updated:** 2025-11-17
