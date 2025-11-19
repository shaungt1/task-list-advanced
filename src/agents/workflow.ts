import { AgentOutput, AgentType } from '../types/agent';
import { routeToAgent } from './masterAgent';
import { generateTaskList } from './taskListAgent';
import { createDailyNote } from './dailyNotesAgent';
import { createCalendarEvent } from './calendarEventsAgent';
import { handleFunctionCall } from './functionCallAgent';

/**
 * Workflow State
 */
interface WorkflowState {
  userInput: string;
  provider: string;
  apiKey: string;
  fileContent?: string;
  agentType: AgentType | null;
  result: AgentOutput | null;
  error: string | null;
}

/**
 * Execute Agent Workflow
 * Routes user input to the appropriate agent and returns the result
 */
export async function executeAgentWorkflow(
  userInput: string,
  provider: string,
  apiKey: string,
  fileContent?: string
): Promise<AgentOutput> {
  console.log('[WORKFLOW] Starting agent workflow...');
  console.log('[WORKFLOW] Input:', userInput);
  console.log('[WORKFLOW] Provider:', provider);

  try {
    // Step 1: Route to appropriate agent
    const agentType = await routeToAgent(userInput, provider, apiKey);
    console.log('[WORKFLOW] Routed to agent:', agentType);

    // Step 2: Execute the selected agent
    let result: AgentOutput;

    switch (agentType) {
      case 'task_list':
        result = await generateTaskList(userInput, provider, apiKey, fileContent);
        break;

      case 'daily_notes':
        result = await createDailyNote(userInput);
        break;

      case 'calendar_events':
        result = await createCalendarEvent(userInput, provider, apiKey);
        break;

      case 'function_call':
        result = await handleFunctionCall(userInput);
        break;

      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }

    console.log('[WORKFLOW] Agent execution complete');
    console.log('[WORKFLOW] Voice Response:', result.voiceResponse ? 'YES' : 'NO');
    if (result.voiceResponse && result.responseText) {
      console.log('[WORKFLOW] Response Text:', result.responseText);
    }

    return result;

  } catch (error: any) {
    console.error('[WORKFLOW] Error:', error);
    throw new Error(`Workflow failed: ${error.message}`);
  }
}

/**
 * Simplified workflow execution for direct use
 */
export async function runAgent(
  userInput: string,
  settings: {
    aiProvider: string;
    googleApiKey: string;
    openaiApiKey: string;
    claudeApiKey: string;
    grokApiKey: string;
  },
  fileContent?: string
): Promise<AgentOutput> {
  // Get the appropriate API key
  const apiKey =
    settings.aiProvider === 'openai' ? settings.openaiApiKey :
    settings.aiProvider === 'claude' ? settings.claudeApiKey :
    settings.aiProvider === 'grok' ? settings.grokApiKey :
    settings.googleApiKey;

  if (!apiKey) {
    throw new Error('No API key configured for selected provider');
  }

  return await executeAgentWorkflow(
    userInput,
    settings.aiProvider,
    apiKey,
    fileContent
  );
}
