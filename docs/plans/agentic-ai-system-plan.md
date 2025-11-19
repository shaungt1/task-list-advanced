# Agentic AI System Implementation Plan

**Created:** 2025-01-17
**Status:** Planning
**Phases:** 2 (Phase 1: Add Providers, Phase 2: LangGraph Agents)

---

## Executive Summary

Transform the task list application from a single-purpose AI task generator into a multi-agent system capable of handling diverse user intents through intelligent routing and specialized agents. This creates a "Jarvis-like" experience with voice-aware responses.

---

## Current Architecture

### Data Flow
```
User Input (textarea)
  ↓
AITaskGenerator.tsx
  ↓
generateTasks (openaiService.ts or aiService.ts)
  ↓
Task List Output
```

### Supported Providers
- ✅ Google Gemini
- ✅ OpenAI

---

## PHASE 1: Add Claude & Grok Support

### Overview
Add two more AI providers to the dropdown: Claude (Anthropic) and Grok (X.AI)

### Implementation Strategy

#### 1.1 Add Claude Service
**File:** `src/services/claudeService.ts` (NEW)

**API Details:**
- **Endpoint:** Anthropic Messages API
- **SDK:** `@anthropic-ai/sdk` OR use native fetch
- **Model:** `claude-3-5-sonnet-20241022` (latest)
- **Authentication:** `x-api-key` header

**Native Fetch Implementation:**
```typescript
POST https://api.anthropic.com/v1/messages
Headers:
  - x-api-key: sk-ant-...
  - anthropic-version: 2023-06-01
  - content-type: application/json
Body:
  - model: "claude-3-5-sonnet-20241022"
  - messages: [{role: "user", content: "..."}]
  - system: "system prompt"
  - max_tokens: 4096
Response:
  - content[0].text
```

**Note:** Will use native fetch to avoid adding SDK dependency initially.

#### 1.2 Add Grok Service
**File:** `src/services/grokService.ts` (NEW)

**API Details:**
- **Endpoint:** OpenAI-compatible
- **Base URL:** `https://api.x.ai/v1`
- **Model:** `grok-beta` or `grok-4.1`
- **Authentication:** Bearer token (same as OpenAI)

**Implementation:**
```typescript
// Uses same structure as openaiService.ts
// Just change baseURL to https://api.x.ai/v1
POST https://api.x.ai/v1/chat/completions
Headers:
  - Authorization: Bearer xai-...
  - Content-Type: application/json
Body:
  - model: "grok-beta"
  - messages: [...]
  - response_format: {type: "json_object"}
Response:
  - choices[0].message.content
```

**Note:** 99% identical to OpenAI service, just different URL and model name.

#### 1.3 Update Settings Schema
**File:** `src/hooks/useSettings.ts`

**Add:**
```typescript
const DEFAULT_SETTINGS = {
  // ... existing
  claudeApiKey: '',
  grokApiKey: ''
};
```

#### 1.4 Update Settings Modal
**File:** `src/components/SettingsModal.tsx`

**Update Dropdown:**
```typescript
<select value={settings.aiProvider}>
  <option value="gemini">Google Gemini</option>
  <option value="openai">OpenAI</option>
  <option value="claude">Anthropic Claude</option>
  <option value="grok">xAI Grok</option>
</select>
```

**Add Conditional Inputs:**
- Show Claude API key input when `aiProvider === 'claude'`
- Show Grok API key input when `aiProvider === 'grok'`
- Link to API key pages

#### 1.5 Update AITaskGenerator
**File:** `src/components/AITaskGenerator.tsx`

**Add Imports:**
```typescript
import { generateTasks as generateClaudeTasks } from '../services/claudeService';
import { generateTasks as generateGrokTasks } from '../services/grokService';
```

**Update Routing Logic:**
```typescript
const apiKey =
  settings.aiProvider === 'openai' ? settings.openaiApiKey :
  settings.aiProvider === 'claude' ? settings.claudeApiKey :
  settings.aiProvider === 'grok' ? settings.grokApiKey :
  settings.googleApiKey;

const data =
  settings.aiProvider === 'openai' ? await generateOpenAITasks(...) :
  settings.aiProvider === 'claude' ? await generateClaudeTasks(...) :
  settings.aiProvider === 'grok' ? await generateGrokTasks(...) :
  await generateGeminiTasks(...);

const generatedText =
  settings.aiProvider === 'claude' ? data.content?.[0]?.text :
  (settings.aiProvider === 'openai' || settings.aiProvider === 'grok') ? data.choices?.[0]?.message?.content :
  data.candidates?.[0]?.content?.parts?.[0]?.text;
```

#### 1.6 Update Related Files
- **TaskListSection.tsx** - Add claudeApiKey, grokApiKey to settings interface
- **App.tsx** - Pass new API keys in settings object
- **.env.example** - Document Claude and Grok API keys

### Phase 1 Summary

**Files to Modify:** 5 files
**Files to Create:** 2 files (claudeService.ts, grokService.ts)
**Dependencies:** None (using native fetch)
**Risk:** Low (same pattern as OpenAI/Gemini)
**Estimated Time:** 1-2 hours

---

## PHASE 2: LangGraph Agentic System

### Overview
Build a multi-agent system using LangGraph that intelligently routes user input to specialized agents based on intent.

### Architecture

```
User Input
  ↓
Master Agent (Router)
  ↓
  ├─→ Task List Agent (existing functionality)
  ├─→ Daily Notes Agent (console output)
  ├─→ Calendar Events Agent (console output)
  └─→ Function Call Agent (mute/unmute - console output)
```

### 2.1 Install Dependencies

**Required Packages:**
```bash
npm install @langchain/core @langchain/openai @langchain/anthropic langchain langgraph
```

**Packages:**
- `@langchain/core` - Core abstractions
- `@langchain/openai` - OpenAI/Grok models
- `@langchain/anthropic` - Claude models
- `langchain` - Main library
- `langgraph` - Agent workflow orchestration

### 2.2 Create Agent Types

**File:** `src/types/agent.ts` (NEW)

```typescript
export type AgentType =
  | 'task_list'
  | 'daily_notes'
  | 'calendar_events'
  | 'function_call';

export interface AgentOutput {
  agentType: AgentType;
  data: any;
  voiceResponse: boolean; // Should AI speak this response?
  responseText?: string; // What AI should say (if voiceResponse=true)
}

export interface TaskListOutput {
  name: string;
  data: Task[];
}

export interface DailyNoteOutput {
  note: string;
  timestamp: Date;
  tags: string[];
}

export interface CalendarEventOutput {
  title: string;
  date: Date;
  duration: number; // minutes
  description?: string;
}

export interface FunctionCallOutput {
  function: 'mute' | 'unmute';
  reason: string;
}
```

### 2.3 Create Master Agent (Router)

**File:** `src/agents/masterAgent.ts` (NEW)

**Purpose:** Analyzes user input and routes to appropriate specialist agent

**Logic:**
```typescript
export async function routeToAgent(userInput: string): Promise<AgentType> {
  // Use LLM to classify intent
  const prompt = `Classify this user input into one of these categories:

  1. task_list - User wants to create a task list, todo list, checklist, or project plan
  2. daily_notes - User wants to take a note, remember something, or jot down thoughts
  3. calendar_events - User wants to schedule something, set a reminder, or create an event
  4. function_call - User is asking for voice control (mute, unmute, be quiet, speak up)

  User input: "${userInput}"

  Respond with ONLY the category name.`;

  // Call LLM to determine intent
  const agentType = await classifyIntent(prompt);

  return agentType;
}
```

### 2.4 Create Specialized Agents

#### 2.4.1 Task List Agent
**File:** `src/agents/taskListAgent.ts` (NEW)

**Purpose:** Generate structured task lists (existing functionality)

**Implementation:**
```typescript
export async function generateTaskList(
  userInput: string,
  provider: string,
  apiKey: string
): Promise<AgentOutput> {
  // Use existing services (openaiService, claudeService, etc.)
  const taskList = await generateTasks(apiKey, userInput);

  return {
    agentType: 'task_list',
    data: taskList,
    voiceResponse: false, // Don't speak, just show tasks
  };
}
```

#### 2.4.2 Daily Notes Agent
**File:** `src/agents/dailyNotesAgent.ts` (NEW)

**Purpose:** Capture user notes and thoughts

**Implementation:**
```typescript
export async function createDailyNote(
  userInput: string,
  provider: string,
  apiKey: string
): Promise<AgentOutput> {
  // Parse note from user input
  const note = {
    note: userInput,
    timestamp: new Date(),
    tags: extractTags(userInput), // Extract #hashtags
  };

  console.log('[DAILY NOTE]', note);

  return {
    agentType: 'daily_notes',
    data: note,
    voiceResponse: true,
    responseText: 'Note saved.', // Short confirmation
  };
}
```

#### 2.4.3 Calendar Events Agent
**File:** `src/agents/calendarEventsAgent.ts` (NEW)

**Purpose:** Schedule calendar events

**Implementation:**
```typescript
export async function createCalendarEvent(
  userInput: string,
  provider: string,
  apiKey: string
): Promise<AgentOutput> {
  // Use LLM to extract event details
  const event = await extractEventDetails(userInput, provider, apiKey);

  console.log('[CALENDAR EVENT]', event);

  return {
    agentType: 'calendar_events',
    data: event,
    voiceResponse: true,
    responseText: `Event scheduled: ${event.title} on ${event.date}.`,
  };
}
```

#### 2.4.4 Function Call Agent
**File:** `src/agents/functionCallAgent.ts` (NEW)

**Purpose:** Handle voice control commands (mute/unmute)

**Implementation:**
```typescript
export async function handleFunctionCall(
  userInput: string
): Promise<AgentOutput> {
  // Determine if user wants to mute or unmute
  const isMute = /mute|quiet|silent|stop talking/i.test(userInput);

  const action = isMute ? 'mute' : 'unmute';

  console.log(`[FUNCTION CALL] ${action.toUpperCase()}`);

  return {
    agentType: 'function_call',
    data: { function: action, reason: userInput },
    voiceResponse: !isMute, // Only speak if unmuting
    responseText: isMute ? undefined : 'Voice enabled.',
  };
}
```

### 2.5 Create LangGraph Workflow

**File:** `src/agents/workflow.ts` (NEW)

**Purpose:** Orchestrate agent execution using LangGraph

**Structure:**
```typescript
import { StateGraph } from "langgraph";

// Define workflow state
interface WorkflowState {
  userInput: string;
  agentType: AgentType | null;
  result: AgentOutput | null;
  error: string | null;
}

// Create workflow graph
export function createAgentWorkflow() {
  const workflow = new StateGraph<WorkflowState>({
    channels: {
      userInput: { value: "" },
      agentType: { value: null },
      result: { value: null },
      error: { value: null },
    },
  });

  // Node 1: Route to agent
  workflow.addNode("router", async (state) => {
    const agentType = await routeToAgent(state.userInput);
    return { ...state, agentType };
  });

  // Node 2: Execute agent
  workflow.addNode("execute", async (state) => {
    const result = await executeAgent(state.agentType, state.userInput);
    return { ...state, result };
  });

  // Define edges
  workflow.addEdge("router", "execute");
  workflow.setEntryPoint("router");
  workflow.setFinishPoint("execute");

  return workflow.compile();
}
```

### 2.6 Integrate with AITaskGenerator

**File:** `src/components/AITaskGenerator.tsx`

**Update handleSubmit:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!chatInput.trim()) return;

  setLoading(true);

  try {
    // Create workflow
    const workflow = createAgentWorkflow();

    // Execute workflow
    const result = await workflow.invoke({
      userInput: chatInput,
      provider: settings.aiProvider,
      apiKey: getApiKey(settings),
    });

    // Handle result based on agent type
    if (result.agentType === 'task_list') {
      onTasksGenerated(result.data);
    } else if (result.agentType === 'daily_notes') {
      console.log('Note saved:', result.data);
      if (result.voiceResponse) {
        alert(result.responseText); // Temp: will be TTS later
      }
    } else if (result.agentType === 'calendar_events') {
      console.log('Event scheduled:', result.data);
      if (result.voiceResponse) {
        alert(result.responseText); // Temp: will be TTS later
      }
    } else if (result.agentType === 'function_call') {
      console.log('Function call:', result.data);
      if (result.voiceResponse) {
        alert(result.responseText); // Temp: will be TTS later
      }
    }

    setChatInput('');
  } catch (error: any) {
    console.error('Agent error:', error);
    onError(error.message || 'Failed to process request');
  } finally {
    setLoading(false);
  }
};
```

### 2.7 "Jarvis-like" Voice Experience

**Rules for Voice Response:**
1. **Task Lists:** Silent (just show UI)
2. **Daily Notes:** Short confirmation ("Note saved")
3. **Calendar Events:** Brief confirmation ("Event scheduled")
4. **Function Calls:** Only speak when unmuting
5. **Follow-up Questions:** If agent needs clarification, speak briefly
6. **Detailed Summaries:** Only if user explicitly asks

**Implementation:**
```typescript
// In each agent, set voiceResponse flag
voiceResponse: false // Silent by default

// Only set to true for:
// - Short confirmations (1-2 words)
// - Follow-up questions
// - User explicitly requests summary
```

### 2.8 Future Enhancements (Not in Scope)

The following will be added later:
- ❌ Actual TTS (Text-to-Speech) integration
- ❌ STT (Speech-to-Text) for voice input
- ❌ Calendly/Google Calendar integration
- ❌ Persistent daily notes storage
- ❌ Advanced agent reasoning
- ❌ Multi-step agent workflows
- ❌ Agent memory/context

---

## Implementation Order

### Phase 1: Add Providers (Simple)
1. Create claudeService.ts
2. Create grokService.ts
3. Update useSettings.ts
4. Update SettingsModal.tsx
5. Update AITaskGenerator.tsx
6. Update TaskListSection.tsx
7. Update App.tsx
8. Update .env.example
9. Test all providers

**Estimated Time:** 1-2 hours

### Phase 2: Agentic System (Complex)
1. Install LangChain dependencies
2. Create agent types (src/types/agent.ts)
3. Create master agent router
4. Create task list agent (wrapper around existing)
5. Create daily notes agent
6. Create calendar events agent
7. Create function call agent
8. Create LangGraph workflow
9. Integrate with AITaskGenerator
10. Test all agents
11. Test voice response logic

**Estimated Time:** 4-6 hours

---

## File Structure

```
src/
├── agents/                    (NEW)
│   ├── masterAgent.ts         - Router agent
│   ├── taskListAgent.ts       - Task generation
│   ├── dailyNotesAgent.ts     - Note taking
│   ├── calendarEventsAgent.ts - Event scheduling
│   ├── functionCallAgent.ts   - Voice control
│   └── workflow.ts            - LangGraph orchestration
├── services/
│   ├── aiService.ts           - Gemini (existing)
│   ├── openaiService.ts       - OpenAI (existing)
│   ├── claudeService.ts       - Claude (NEW)
│   └── grokService.ts         - Grok (NEW)
├── types/
│   ├── task.ts                - Task types (existing)
│   └── agent.ts               - Agent types (NEW)
└── components/
    ├── AITaskGenerator.tsx    - Updated with agent routing
    └── SettingsModal.tsx      - Updated with new providers
```

---

## Testing Checklist

### Phase 1: Providers
- [ ] Claude generates task lists correctly
- [ ] Grok generates task lists correctly
- [ ] All 4 providers work (Gemini, OpenAI, Claude, Grok)
- [ ] Settings dropdown shows all providers
- [ ] API keys save correctly
- [ ] Error handling works for each provider

### Phase 2: Agents
- [ ] Master agent routes to correct agent
- [ ] Task list agent generates tasks (existing functionality)
- [ ] Daily notes agent logs to console
- [ ] Calendar events agent logs to console
- [ ] Function call agent logs mute/unmute
- [ ] Voice response logic works correctly
- [ ] Only speaks when voiceResponse=true
- [ ] Task lists are silent
- [ ] Confirmations are brief

### Integration Tests
- [ ] "Create a task list for..." → Task list agent
- [ ] "Remind me to..." → Calendar events agent
- [ ] "Note: ..." → Daily notes agent
- [ ] "Mute" → Function call agent (mute)
- [ ] "You can speak" → Function call agent (unmute)

---

## Dependencies

### Phase 1: None
Uses native fetch for all providers

### Phase 2: LangChain
```json
{
  "@langchain/core": "latest",
  "@langchain/openai": "latest",
  "@langchain/anthropic": "latest",
  "langchain": "latest",
  "langgraph": "latest"
}
```

**Estimated Bundle Size:** +500KB

---

## Risk Assessment

### Phase 1: Low Risk
- Same pattern as existing OpenAI integration
- No breaking changes
- Isolated to new files

### Phase 2: Medium Risk
- New architecture pattern
- Multiple new dependencies
- More complex error handling
- Requires careful testing

**Mitigation:**
- Keep existing task list flow intact
- Agent system is additive, not replacing
- Graceful fallback if agent routing fails
- Console logging for debugging

---

## Success Criteria

### Phase 1
- [x] 4 AI providers working (Gemini, OpenAI, Claude, Grok)
- [x] User can switch between providers
- [x] All generate task lists correctly

### Phase 2
- [x] Master agent routes correctly
- [x] Task lists work (existing functionality)
- [x] Daily notes logged to console
- [x] Calendar events logged to console
- [x] Function calls logged to console
- [x] Voice responses only when appropriate
- [x] "Jarvis-like" silent mode working

---

## Next Steps After Approval

1. **Phase 1:** Add Claude and Grok providers
2. **Test Phase 1:** Verify all 4 providers work
3. **Get approval for Phase 2**
4. **Phase 2:** Install LangChain dependencies
5. **Phase 2:** Build agent system
6. **Test Phase 2:** Verify all agents work
7. **Polish:** Refine voice response logic
8. **Documentation:** Update README with new features

---

## Questions for User

Before proceeding, please confirm:

1. **Phase 1:** Should we add Claude and Grok first, then Phase 2?
2. **Dependencies:** OK to add ~500KB of LangChain packages?
3. **Voice Logic:** Console logs + alerts OK for Phase 2? (Real TTS later)
4. **Daily Notes:** Console output sufficient for now?
5. **Calendar Events:** Console output sufficient for now?

---

**Status:** Awaiting user approval to proceed 🎯
