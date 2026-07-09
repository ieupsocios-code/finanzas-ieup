import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import Sidebar from '../components/Sidebar';
import DashboardHome from './DashboardHome';
import Ingresos from './Ingresos';
import Egresos from './Egresos';
import Finanzas from './Finanzas';
import Reportes from './Reportes';
import Templos from './Templos';
import Cajas from './Cajas';
import Usuarios from './Usuarios';
import Auditoria from './Auditoria';
import Configuracion from './Configuracion';

export default function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [stats, setStats] = useState({
    totalIngresos: 0,
    totalEgresos: 0,
    saldo: 0
  });

  const handleNavigate = (page) => {
    setActivePage(page);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardHome stats={stats} />;
      case 'ingresos':
        return <Ingresos />;
      case 'egresos':
        return <Egresos />;
      case 'finanzas':
        return <Finanzas />;
      case 'reportes':
        return <Reportes />;
      case 'templos':
        return <Templos />;
      case 'cajas':
        return <Cajas />;
      case 'usuarios':
        return <Usuarios />;
      case 'auditoria':
        return <Auditoria />;
      case 'configuracion':
        return <Configuracion />;
      default:
        return <DashboardHome stats={stats} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
