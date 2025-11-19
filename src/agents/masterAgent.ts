import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { AgentType } from '../types/agent';

/**
 * Master Agent (Router)
 * Analyzes user input and routes to the appropriate specialist agent
 */
export async function routeToAgent(
  userInput: string,
  provider: string,
  apiKey: string
): Promise<AgentType> {
  const systemPrompt = `You are a routing agent that classifies user input into categories.

Analyze the user's input and respond with ONLY ONE of these categories:

1. task_list - User wants to create a task list, todo list, checklist, project plan, or steps to accomplish something
2. daily_notes - User wants to take a note, remember something, jot down thoughts, or save information for later
3. calendar_events - User wants to schedule something, set a reminder, create an event, or plan a meeting
4. function_call - User is asking for voice control commands like mute, unmute, be quiet, speak up, or silence

Examples:
- "Create a task list for building a website" → task_list
- "Note: Remember to buy milk tomorrow" → daily_notes
- "Schedule a meeting with John on Friday at 3pm" → calendar_events
- "Mute" → function_call
- "Plan a wedding checklist" → task_list
- "Remind me to call mom" → calendar_events
- "Jot this down: API key is xyz123" → daily_notes

Respond with ONLY the category name (task_list, daily_notes, calendar_events, or function_call). No explanation.`;

  try {
    let model;

    // Create appropriate model based on provider
    if (provider === 'openai' || provider === 'grok') {
      const baseURL = provider === 'grok' ? 'https://api.x.ai/v1' : undefined;
      model = new ChatOpenAI({
        apiKey,
        modelName: provider === 'grok' ? 'grok-beta' : 'gpt-4o-mini',
        temperature: 0,
        configuration: baseURL ? { baseURL } : undefined
      });
    } else if (provider === 'claude') {
      model = new ChatAnthropic({
        apiKey,
        modelName: 'claude-3-5-sonnet-20241022',
        temperature: 0
      });
    } else {
      // Default to OpenAI for Gemini (we'll use OpenAI for routing)
      // This is a fallback - in production you might want to use Gemini's native API
      console.warn('Gemini provider selected, defaulting to basic classification');
      return classifyWithoutLLM(userInput);
    }

    const response = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput }
    ]);

    const classification = response.content.toString().trim().toLowerCase();

    // Validate and return classification
    if (['task_list', 'daily_notes', 'calendar_events', 'function_call'].includes(classification)) {
      console.log(`[MASTER AGENT] Routed to: ${classification}`);
      return classification as AgentType;
    }

    // Default to task_list if classification is unclear
    console.log('[MASTER AGENT] Classification unclear, defaulting to task_list');
    return 'task_list';

  } catch (error) {
    console.error('[MASTER AGENT] Error routing:', error);
    // Fallback to basic classification
    return classifyWithoutLLM(userInput);
  }
}

/**
 * Fallback classification without LLM
 * Uses simple keyword matching
 */
function classifyWithoutLLM(userInput: string): AgentType {
  const input = userInput.toLowerCase();

  // Function call keywords
  if (/\b(mute|unmute|quiet|silent|speak|voice|stop talking)\b/i.test(input)) {
    return 'function_call';
  }

  // Daily notes keywords
  if (/\b(note|remember|jot|write down|save this|reminder)\b/i.test(input)) {
    return 'daily_notes';
  }

  // Calendar event keywords
  if (/\b(schedule|meeting|appointment|event|calendar|remind me|set a reminder)\b/i.test(input)) {
    return 'calendar_events';
  }

  // Default to task list
  return 'task_list';
}
