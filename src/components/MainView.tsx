import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../utils/ThemeContext';
import { Header } from './layout/Header';
import { SidebarV2 } from './layout/SidebarV2';
import { HeaderNav } from './layout/HeaderNav';
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
  // Sidebar and navigation state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpenHistory, setSidebarOpenHistory] = useState(false);
  const [selectedNav, setSelectedNav] = useState<'dashboard' | 'history' | 'settings'>('dashboard');
  // Category/list state (stubbed for now)
  const [categories, setCategories] = useState([]); // TODO: Wire to real data
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [days, setDays] = useState([]); // TODO: Wire to real data
  const today = new Date().toISOString().slice(0, 10);

  // Keyboard shortcut for sidebar collapse (Ctrl/Cmd+B)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
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

    // Main layout with SidebarV2 and HeaderNav
  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-900 text-zinc-50' : 'bg-zinc-50 text-zinc-900'}`}>
      <div className="flex flex-1 min-h-0">
        {/* Sidebar - always visible on desktop, hamburger on mobile */}
        <div className="hidden md:flex h-full">
          <SidebarV2
            categories={categories}
            onAddCategory={(name) => {}}
            onSelectCategory={setSelectedCategoryId}
            selectedCategoryId={selectedCategoryId}
            days={days}
            onSelectList={() => {}}
            collapsed={sidebarCollapsed}
            onCollapse={() => setSidebarCollapsed((prev) => !prev)}
            onOpenHistory={() => setSelectedNav('history')}
            today={today}
          />
        </div>
        {/* Hamburger for mobile */}
        <div className="md:hidden">
          {/* Optionally render hamburger button here for mobile */}
        </div>
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-0">
          <HeaderNav
            onSidebarToggle={() => setSidebarCollapsed((prev) => !prev)}
            navLinks={[
              { label: 'Dashboard', key: 'dashboard', active: selectedNav === 'dashboard', onClick: () => setSelectedNav('dashboard') },
              { label: 'History', key: 'history', active: selectedNav === 'history', onClick: () => setSelectedNav('history') },
              { label: 'Settings', key: 'settings', active: selectedNav === 'settings', onClick: () => setSelectedNav('settings') },
            ]}
          />
        {/* Content switching based on selectedNav */}
        <div className="flex-grow flex flex-col">
          {selectedNav === 'dashboard' && (
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
          )}
          {selectedNav === 'history' && (
            <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow">
              {/* TODO: Render history view here */}
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-4 sm:p-6 mb-8 transition-colors">
                <h2 className="text-lg font-semibold mb-4">History</h2>
                {/* Placeholder for history drawer or content */}
              </div>
            </div>
          )}
          {selectedNav === 'settings' && (
            <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow">
              {/* TODO: Render settings view here */}
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-4 sm:p-6 mb-8 transition-colors">
                <h2 className="text-lg font-semibold mb-4">Settings</h2>
                {/* Placeholder for settings modal or content */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    {error && <ErrorNotification message={error} onClose={() => setError(null)} />}
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
