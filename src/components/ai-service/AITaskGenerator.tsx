import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { runAgent } from '../../agents/workflow';
import { ChatMessage } from '../../types/chat';
import { TaskListOutput } from '../../types/agent';

interface AITaskGeneratorProps {
  settings: {
    aiProvider: string;
    googleApiKey: string;
    openaiApiKey: string;
    claudeApiKey: string;
    grokApiKey: string;
  };
  onTasksGenerated: (tasks: any[]) => void;
  onError: (error: string) => void;
}

export function AITaskGenerator({ settings, onTasksGenerated, onError }: AITaskGeneratorProps) {
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setSelectedFileName(event.target.files[0].name);
    } else {
      setSelectedFile(null);
      setSelectedFileName(null);
    }
  };

  const addToChatHistory = (message: ChatMessage) => {
    const history = JSON.parse(localStorage.getItem('aiChatHistory') || '[]');
    history.push(message);
    localStorage.setItem('aiChatHistory', JSON.stringify(history));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setLoading(true);

    // Add user message to history
    addToChatHistory({
      role: 'user',
      content: chatInput,
      timestamp: Date.now(),
      attachments: selectedFile ? [selectedFile.name] : undefined
    });

    try {
      let fileContent = '';
      if (selectedFile) {
        fileContent = await selectedFile.text();
      }

      // Execute agent workflow
      const result = await runAgent(chatInput, settings, fileContent);

      // Log response for chat history
      const responseContent = result.responseText || JSON.stringify(result.data);
      addToChatHistory({
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now()
      });

      // Handle result based on agent type
      if (result.agentType === 'task_list') {
        // Task list agent - display tasks in UI
        const taskList = result.data as TaskListOutput;
        onTasksGenerated(taskList.data);
        setChatInput('');
        setSelectedFile(null);
        setSelectedFileName(null);

      } else if (result.agentType === 'daily_notes') {
        // Daily notes agent - show confirmation
        if (result.voiceResponse && result.responseText) {
          alert(result.responseText); // Temporary - will be TTS later
        }
        setChatInput('');

      } else if (result.agentType === 'calendar_events') {
        // Calendar events agent - show confirmation
        if (result.voiceResponse && result.responseText) {
          alert(result.responseText); // Temporary - will be TTS later
        }
        setChatInput('');

      } else if (result.agentType === 'function_call') {
        // Function call agent - show confirmation if not muted
        if (result.voiceResponse && result.responseText) {
          alert(result.responseText); // Temporary - will be TTS later
        }
        setChatInput('');

      } else {
        throw new Error(`Unknown agent type: ${result.agentType}`);
      }

    } catch (error: any) {
      console.error('Agent error:', error);
      onError(error.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-generator-section">
      <form onSubmit={handleSubmit} className="flex flex-col items-start mt-4">
        <div className="flex w-full">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Enter a prompt to generate a task list..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 resize-none mr-2"
            rows={8}
          />
          <button
            type="submit"
            className="px-3 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            {loading ? 'Loading...' : <Send size={18} />}
          </button>
        </div>
        <label htmlFor="fileInput" className="cursor-pointer mt-2 flex items-center gap-1">
          <Paperclip size={18} className="text-gray-400 hover:text-gray-600" />
          {selectedFileName && <span className="text-sm text-gray-500">{selectedFileName}</span>}
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="fileInput"
        />
      </form>
    </div>
  );
} 