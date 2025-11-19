import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { AgentOutput, CalendarEventOutput } from '../types/agent';

/**
 * Calendar Events Agent
 * Extracts event details from user input and schedules events
 */
export async function createCalendarEvent(
  userInput: string,
  provider: string,
  apiKey: string
): Promise<AgentOutput> {
  console.log('[CALENDAR EVENTS AGENT] Extracting event details...');

  try {
    const eventDetails = await extractEventDetails(userInput, provider, apiKey);

    // Log to console (temporary - will integrate with calendar API later)
    console.log('[CALENDAR EVENT]', {
      title: eventDetails.title,
      date: eventDetails.date,
      duration: eventDetails.duration,
      description: eventDetails.description || 'none'
    });

    return {
      agentType: 'calendar_events',
      data: eventDetails,
      voiceResponse: true,
      responseText: `Event scheduled: ${eventDetails.title} on ${eventDetails.date}.`,
    };

  } catch (error: any) {
    console.error('[CALENDAR EVENTS AGENT] Error:', error);
    throw error;
  }
}

/**
 * Extract event details from user input using LLM
 */
async function extractEventDetails(
  userInput: string,
  provider: string,
  apiKey: string
): Promise<CalendarEventOutput> {
  const systemPrompt = `Extract calendar event details from the user's input.

Return ONLY a JSON object with this structure:
{
  "title": "Event title",
  "date": "2025-01-20T15:00:00",
  "duration": 60,
  "description": "Event description (optional)"
}

If the user doesn't specify a time, use 9:00 AM.
If the user doesn't specify a duration, use 60 minutes.
Use ISO 8601 format for dates.`;

  try {
    let model;

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
      // Fallback for Gemini
      return fallbackEventExtraction(userInput);
    }

    const response = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput }
    ]);

    const content = response.content.toString();
    const jsonMatch = content.match(/```json\n?(.*?)\n?```/s) || [null, content];
    const jsonText = jsonMatch[1].trim();
    const eventData = JSON.parse(jsonText);

    return eventData;

  } catch (error) {
    console.error('[CALENDAR EVENTS AGENT] LLM extraction failed, using fallback');
    return fallbackEventExtraction(userInput);
  }
}

/**
 * Fallback event extraction without LLM
 */
function fallbackEventExtraction(userInput: string): CalendarEventOutput {
  // Simple extraction - just use the input as title
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  return {
    title: userInput,
    date: tomorrow.toISOString(),
    duration: 60,
    description: undefined
  };
}
