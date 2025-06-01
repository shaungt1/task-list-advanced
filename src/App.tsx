import { useState, useEffect } from 'react';
import { ThemeProvider } from './utils/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MainView } from './components/MainView';
import { Task } from './types/task';
import { supabase } from './lib/supabase';

export default function App() {
  const { isAdmin, user, loading: authLoading } = useAuth();
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if this is the first user
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

  if (showAdminDashboard && isAdmin) {
    return (
      <ThemeProvider>
        <AdminDashboard
          onClose={() => setShowAdminDashboard(false)}
          onError={setError}
          onEditList={(list: { data: Task[] }) => {
            setShowAdminDashboard(false);
          }}
        />
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider>
      <MainView />
    </ThemeProvider>
  );
}