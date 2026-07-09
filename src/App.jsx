import { useState, useEffect } from 'react';
import { supabase, offlineQueue } from './services/supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import { Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      offlineQueue.syncQueue();
    }
  }, [isOnline]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', session.user.id)
          .single();
        
        setUserRole(userData?.rol || 'consulta');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gold text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onSuccess={checkUser} />;
  }

  return (
    <div className="flex h-screen bg-marfil">
      <Sidebar userRole={userRole} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Indicador de conexión */}
        <div className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 ${
          isOnline 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isOnline ? (
            <>
              <Wifi size={16} />
              En línea - Todos los cambios se sincronizan automáticamente
            </>
          ) : (
            <>
              <WifiOff size={16} />
              Sin conexión - Los cambios se guardarán localmente
            </>
          )}
        </div>

        <main className="flex-1 overflow-auto">
          <Dashboard userRole={userRole} isOnline={isOnline} />
        </main>
      </div>
    </div>
  );
}
