import { AgentOutput, FunctionCallOutput } from '../types/agent';

/**
 * Function Call Agent
 * Handles voice control commands (mute/unmute)
 */
export async function handleFunctionCall(
  userInput: string
): Promise<AgentOutput> {
  console.log('[FUNCTION CALL AGENT] Processing voice command...');

  // Determine if user wants to mute or unmute
  const isMute = /\b(mute|quiet|silent|stop talking|be quiet|shut up)\b/i.test(userInput);
  const isUnmute = /\b(unmute|speak|talk|voice on|speak up|turn on voice)\b/i.test(userInput);

  const action = isMute ? 'mute' : 'unmute';

  const functionCall: FunctionCallOutput = {
    function: action,
    reason: userInput
  };

  // Log to console (temporary - will integrate with TTS later)
  console.log(`[FUNCTION CALL] ${action.toUpperCase()}`, {
    command: action,
    reason: userInput
  });

  return {
    agentType: 'function_call',
    data: functionCall,
    voiceResponse: !isMute, // Only speak if unmuting
    responseText: isMute ? undefined : 'Voice enabled.',
  };
}
