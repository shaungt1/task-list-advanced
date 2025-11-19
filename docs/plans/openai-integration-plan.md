# OpenAI Integration Plan - Phase 1

**Created:** 2025-01-17
**Status:** Planning
**Phase:** 1 of 2 (Phase 2: LangChain + Claude + Grok)

## Overview

Add OpenAI as an alternative AI provider alongside the existing Gemini integration. Users will be able to select their preferred AI provider from a dropdown in settings and enter the corresponding API key.

## Current Code Flow Analysis

### 1. Settings Management
- **File:** `src/hooks/useSettings.ts`
- **Current Structure:**
  ```typescript
  {
    service: 'Google',
    model: 'gemini-2.0-flash-exp',
    googleApiKey: ''
  }
  ```
- **Storage:** localStorage key `'settings'`

### 2. Settings UI
- **File:** `src/components/SettingsModal.tsx`
- **Current:** Single Google API Key input field
- **Needs:** AI provider dropdown + OpenAI API key field

### 3. Data Flow
```
App.tsx (gets settings)
  ↓ passes googleApiKey
TaskListSection.tsx
  ↓ passes apiKey
AITaskGenerator.tsx
  ↓ calls generateTasks(apiKey, prompt, fileContent)
aiService.ts (Gemini API)
```

### 4. AI Service
- **File:** `src/services/aiService.ts`
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`
- **Response Format:** `data.candidates[0].content.parts[0].text`
- **Prompt:** Code-centric (needs to be more general)

## Changes Required

### Files to Modify (7 files)
1. `src/hooks/useSettings.ts` - Add aiProvider and openaiApiKey
2. `src/components/SettingsModal.tsx` - Add AI provider dropdown
3. `src/services/aiService.ts` - Update prompt to be general-purpose
4. `src/components/AITaskGenerator.tsx` - Support both providers
5. `src/components/TaskListSection.tsx` - Pass full settings
6. `src/App.tsx` - Pass full settings
7. `.env.example` - Document OpenAI key

### Files to Create (1 file)
1. `src/services/openaiService.ts` - OpenAI API integration

---

## Detailed Implementation Plan

### 1. Update Settings Schema
**File:** `src/hooks/useSettings.ts`

**Changes:**
```typescript
const DEFAULT_SETTINGS = {
  service: 'Google',
  model: 'gemini-2.0-flash-exp',
  googleApiKey: '',
  aiProvider: 'gemini',  // NEW: 'gemini' | 'openai'
  openaiApiKey: ''       // NEW
};
```

**Notes:**
- Default to 'gemini' to maintain backward compatibility
- Both API keys stored separately for user convenience

---

### 2. Create OpenAI Service
**File:** `src/services/openaiService.ts` (NEW)

**API Details:**
- **Endpoint:** `https://api.openai.com/v1/chat/completions`
- **Authentication:** Bearer token in header
- **Model:** Use `gpt-4o-mini` (cost-effective) or `gpt-4o` (higher quality)

**Request Structure:**
```typescript
{
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' }
  }
}
```

**Response Structure:**
```typescript
{
  choices: [
    {
      message: {
        content: "JSON string here"
      }
    }
  ]
}
```

---

### 3. Update System Prompt (Both Services)
**Files:** `src/services/aiService.ts` AND `src/services/openaiService.ts`

**Current Issues:**
- Too code-centric
- Assumes all tasks need code
- No examples of everyday tasks

**Updated Prompt:**
```typescript
const systemPrompt = `You are a task list generator that creates structured, actionable task lists for any purpose.

Generate tasks in this JSON structure:
{
  "name": "Task List Name",
  "data": [
    {
      "id": "unique-uuid",
      "text": "Task title or description",
      "completed": false,
      "isHeadline": false,
      "createdAt": "2024-03-20T12:00:00.000Z",
      "codeBlock": {
        "language": "javascript",
        "code": "console.log('Example');"
      },
      "richText": "<p>Detailed description</p>",
      "optional": false
    }
  ]
}

Guidelines:
- Create clear, actionable tasks for ANY purpose (work, personal, coding, learning, etc.)
- Use headlines (isHeadline: true) to group related tasks
- Add code examples ONLY when relevant to the task
- Use rich text for complex explanations or step-by-step instructions
- Mark optional tasks appropriately
- Ensure logical task ordering
- Break down complex tasks into subtasks

Examples of task lists you might generate:
- Programming projects (with code examples)
- Home improvement projects (step-by-step)
- Learning paths (resources + practice)
- Event planning (timeline + checklist)
- Daily routines (habits + goals)
- Recipe preparation (ingredients + steps)
- Travel planning (bookings + packing)`;
```

---

## Testing Checklist

### Implementation Steps
- [ ] Update useSettings.ts
- [ ] Create openaiService.ts
- [ ] Update system prompt in aiService.ts
- [ ] Update SettingsModal.tsx
- [ ] Update AITaskGenerator.tsx
- [ ] Update TaskListSection.tsx
- [ ] Update App.tsx
- [ ] Update .env.example

### Functionality Tests
- [ ] Settings modal shows AI provider dropdown
- [ ] Dropdown switches between Gemini and OpenAI
- [ ] Correct API key input shows based on selection
- [ ] OpenAI API key saves to localStorage
- [ ] Gemini still works (backward compatibility)
- [ ] OpenAI generates tasks successfully
- [ ] Response parsing works for both providers
- [ ] Prompt generates general-purpose tasks
- [ ] File upload works with OpenAI

---

## OpenAI API Reference

**Endpoint:** `https://api.openai.com/v1/chat/completions`

**Headers:**
- `Authorization: Bearer sk-...`
- `Content-Type: application/json`

**Recommended Models:**
- `gpt-4o-mini` - Fast, cost-effective
- `gpt-4o` - Higher quality

**Request:**
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "response_format": {"type": "json_object"}
}
```

**Response:**
```json
{
  "choices": [
    {
      "message": {
        "content": "{...json...}"
      }
    }
  ]
}
```

---

## Summary

**Total Changes:**
- 7 files modified
- 1 file created
- ~150 lines of code
- Zero breaking changes
- Full backward compatibility

**Risk Level:** Low
