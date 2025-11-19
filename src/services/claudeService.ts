export async function generateTasks(apiKey: string, prompt: string, fileContent?: string) {
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
        "code": "console.log('Example code');"
      },
      "richText": "<p>Detailed description with <strong>formatting</strong> and <ul><li>bullet points</li></ul></p>",
      "optional": false
    }
  ]
}

Guidelines:
- Create clear, actionable tasks for ANY purpose (work, personal, coding, learning, etc.)
- Use headlines (isHeadline: true) to group related tasks
- Add code examples ONLY when relevant to the task (e.g., programming tasks)
- Use rich text for complex explanations, step-by-step instructions, or additional context
- Mark optional tasks appropriately
- Ensure logical task ordering
- Include all necessary steps
- Break down complex tasks into subtasks

Examples of task lists you might generate:
- Programming projects (with code examples)
- Home improvement projects (step-by-step)
- Learning paths (resources + practice)
- Event planning (timeline + checklist)
- Daily routines (habits + goals)
- Recipe preparation (ingredients + steps)
- Travel planning (bookings + packing)
- Any other structured task list

Respond ONLY with valid JSON matching the structure above. Do not include any markdown formatting or additional text.`;

  const userPrompt = `Create a task list for: ${prompt}${fileContent ? `\n\nUse this additional context:\n${fileContent}` : ''}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to generate content: ${response.statusText} - ${errorData.error?.message || 'No details provided'}`);
  }

  const data = await response.json();

  // Transform Claude response to match expected format
  return {
    content: [{
      text: data.content[0].text
    }]
  };
}
