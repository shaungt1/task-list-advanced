import { AgentOutput, TaskListOutput } from '../types/agent';
import { generateTasks as generateGeminiTasks } from '../services/aiService';
import { generateTasks as generateOpenAITasks } from '../services/openaiService';
import { generateTasks as generateClaudeTasks } from '../services/claudeService';
import { generateTasks as generateGrokTasks } from '../services/grokService';

/**
 * Task List Agent
 * Generates structured task lists using existing AI services
 */
export async function generateTaskList(
  userInput: string,
  provider: string,
  apiKey: string,
  fileContent?: string
): Promise<AgentOutput> {
  console.log('[TASK LIST AGENT] Generating task list...');

  try {
    // Call appropriate service based on provider
    const data =
      provider === 'openai' ? await generateOpenAITasks(apiKey, userInput, fileContent) :
      provider === 'claude' ? await generateClaudeTasks(apiKey, userInput, fileContent) :
      provider === 'grok' ? await generateGrokTasks(apiKey, userInput, fileContent) :
      await generateGeminiTasks(apiKey, userInput, fileContent);

    // Handle different response formats
    const generatedText =
      provider === 'claude' ? data.content?.[0]?.text :
      (provider === 'openai' || provider === 'grok') ? data.choices?.[0]?.message?.content :
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Invalid AI response format');
    }

    // Parse JSON from response
    const jsonMatch = generatedText.match(/```json\n?(.*?)\n?```/s) || [null, generatedText];
    const jsonText = jsonMatch[1].trim();
    const parsedData = JSON.parse(jsonText);

    if (!parsedData?.data) {
      throw new Error('Invalid task list format');
    }

    // Transform tasks with proper dates and IDs
    const taskList: TaskListOutput = {
      name: parsedData.name || 'Task List',
      data: parsedData.data.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt || new Date()),
        id: task.id || crypto.randomUUID()
      }))
    };

    console.log(`[TASK LIST AGENT] Generated ${taskList.data.length} tasks`);

    return {
      agentType: 'task_list',
      data: taskList,
      voiceResponse: false, // Silent - just show UI
    };

  } catch (error: any) {
    console.error('[TASK LIST AGENT] Error:', error);
    throw error;
  }
}
