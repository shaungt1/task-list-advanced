import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../utils/ThemeContext';
import { Header } from './layout/Header';
import { TaskInput } from './task/TaskInput';
import { TaskListSection } from './task/TaskListSection';
import { Footer } from './layout/Footer';
import { ConfirmationModal } from './modals/ConfirmationModal';
import { SettingsModal } from './modals/SettingsModal';
import { HelpModal } from './modals/HelpModal';
import { ErrorNotification } from './notifications/ErrorNotification';
import { Tour } from './tour/Tour';
import { AuthModal } from './auth/AuthModal';
import { supabase } from '../lib/supabase';
import { Task } from '../types/task';

export function MainView() {
  const [settings, setSettings] = useSettings();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const {
    tasks,
    setTasks,
    addTask,
    duplicateTask,
    toggleTask,
    deleteTask,
    editTask,
    reorderTasks
  } = useTasks();
  const { theme, toggleTheme } = useTheme();

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(() => {
    const hasSeenTour = sessionStorage.getItem('hasSeenTour');
    return !hasSeenTour && !settings.googleApiKey;
  });
  const [isFirstUser, setIsFirstUser] = useState(false);


  // Sticky footer layout: flex column min-h-screen
  // Dark mode: toggle class on root div

  // Check if this is the first user
  React.useEffect(() => {
    const checkFirstUser = async () => {
      try {
        const { count, error: countError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        if (countError) {
          if (countError.code === '42501') {
            setIsFirstUser(true);
          } else {
            console.error('Error checking user count:', countError);
          }
        } else {
          setIsFirstUser(!count || count === 0);
        }
      } catch (error) {
        console.error('Error checking first user:', error);
      }
    };
    if (!authLoading) {
      checkFirstUser();
    }
  }, [authLoading]);

  const handleLogoClick = () => {
    if (tasks.length > 0) {
      setShowConfirmationModal(true);
    } else {
      window.location.reload();
    }
  };

  const handleConfirmReload = () => {
    window.location.reload();
  };

  const handleSettingsSave = (newSettings: typeof settings) => {
    setSettings(newSettings);
    setShowSettingsModal(false);
  };

  const handleTourComplete = () => {
    sessionStorage.setItem('hasSeenTour', 'true');
    setShowTour(false);
  };

  const checkAllSubTasks = (headlineId: string) => {
    setTasks((prevTasks) => {
      const isAllCompleted = prevTasks.every(task => 
        task.isHeadline || task.completed || !isSubTaskOf(task, headlineId, prevTasks)
      );
      return prevTasks.map(task => {
        if (task.id === headlineId || isSubTaskOf(task, headlineId, prevTasks)) {
          return { ...task, completed: !isAllCompleted };
        }
        return task;
      });
    });
  };

  const isSubTaskOf = (task: Task, headlineId: string, tasks: Task[]) => {
    if (task.isHeadline) return false;
    const taskIndex = tasks.findIndex(t => t.id === task.id);
    for (let i = taskIndex; i >= 0; i--) {
      if (tasks[i].isHeadline) {
        return tasks[i].id === headlineId;
      }
    }
    return false;
  };

  // --- Remove old dark mode toggle logic ---

  // NavBar with dark mode toggle
  return (
    <div className={`flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors duration-300`}>
      <nav className="w-full flex items-center justify-between px-4 py-3 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wide text-lg">Task List</span>
          <span className="beta-badge ml-2">ASTRO</span>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="theme-toggle" className="text-sm mr-2">Dark Mode</label>
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="p-2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>
      {error && <ErrorNotification message={error} onClose={() => setError(null)} />}
      <div className="flex-grow flex flex-col">
        <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow">
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-4 sm:p-6 mb-8 transition-colors">
            <Header
              onLogoClick={handleLogoClick}
              onSettingsClick={() => setShowSettingsModal(true)}
              onAdminClick={() => {}}
              tasks={tasks}
              onImport={setTasks}
              isAdmin={isAdmin}
            />
            <TaskInput onAddTask={addTask} />
          </div>
          <TaskListSection
            tasks={tasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
            onDuplicate={duplicateTask}
            onReorder={reorderTasks}
            onCheckAllSubTasks={checkAllSubTasks}
            onImportTaskList={setTasks}
            googleApiKey={settings.googleApiKey}
            onError={setError}
            isAdmin={isAdmin}
          />
        </div>
      </div>
      <Footer />
      <button
        onClick={() => setShowHelpModal(true)}
        className="fixed bottom-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
        title="Help"
      >
        <HelpCircle size={24} />
      </button>
      {showConfirmationModal && (
        <ConfirmationModal
          onConfirm={handleConfirmReload}
          onCancel={() => setShowConfirmationModal(false)}
          tasks={tasks}
        />
      )}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          onSave={handleSettingsSave}
          initialSettings={settings}
          isAdmin={isAdmin}
          user={user}
          onShowAuth={() => setShowAuthModal(true)}
        />
      )}
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
      {showTour && (
        <Tour onComplete={handleTourComplete} />
      )}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          isFirstUser={isFirstUser}
        />
      )}
    </div>
  );
}
