import { AgentOutput, DailyNoteOutput } from '../types/agent';

/**
 * Daily Notes Agent
 * Captures user notes and thoughts
 */
export async function createDailyNote(
  userInput: string
): Promise<AgentOutput> {
  console.log('[DAILY NOTES AGENT] Creating note...');

  // Extract hashtags from input
  const tags = extractTags(userInput);

  const note: DailyNoteOutput = {
    note: userInput,
    timestamp: new Date(),
    tags
  };

  // Log to console (temporary - will be stored later)
  console.log('[DAILY NOTE]', {
    note: note.note,
    timestamp: note.timestamp.toISOString(),
    tags: note.tags.length > 0 ? note.tags : 'none'
  });

  return {
    agentType: 'daily_notes',
    data: note,
    voiceResponse: true,
    responseText: 'Note saved.', // Short confirmation
  };
}

/**
 * Extract hashtags from text
 */
function extractTags(text: string): string[] {
  const tagRegex = /#(\w+)/g;
  const matches = text.match(tagRegex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
}
