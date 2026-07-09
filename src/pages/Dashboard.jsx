import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import Ingresos from './Ingresos';
import Egresos from './Egresos';
import Finanzas from './Finanzas';
import Reportes from './Reportes';
import Auditoria from './Auditoria';
import Templos from './Templos';
import Cajas from './Cajas';
import Usuarios from './Usuarios';
import DashboardHome from './DashboardHome';
import Configuracion from './Configuracion';

export default function Dashboard({ userRole, isOnline }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [stats, setStats] = useState({ totalIngresos: 0, totalEgresos: 0, saldo: 0 });

  useEffect(() => {
    document.addEventListener('navigate', (e) => {
      setCurrentPage(e.detail);
    });

    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: ingresos } = await supabase
        .from('movimientos')
        .select('monto')
        .eq('tipo', 'ingreso');

      const { data: egresos } = await supabase
        .from('movimientos')
        .select('monto')
        .eq('tipo', 'egreso');

      const totalIngresos = ingresos?.reduce((sum, m) => sum + (m.monto || 0), 0) || 0;
      const totalEgresos = egresos?.reduce((sum, m) => sum + (m.monto || 0), 0) || 0;

      setStats({
        totalIngresos,
        totalEgresos,
        saldo: totalIngresos - totalEgresos,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome stats={stats} />;
      case 'ingresos':
        return <Ingresos onSuccess={loadStats} />;
      case 'egresos':
        return <Egresos onSuccess={loadStats} />;
      case 'finanzas':
        return <Finanzas />;
      case 'reportes':
        return <Reportes stats={stats} />;
      case 'auditoria':
        return <Auditoria />;
      case 'configuracion':
        return <Configuracion />;
      case 'templos':
        return <Templos />;
      case 'cajas':
        return <Cajas />;
      case 'usuarios':
        return <Usuarios />;
      default:
        return <DashboardHome stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-marfil p-4 md:p-8 pt-20 md:pt-8">
      <div className="max-w-7xl mx-auto">
        {renderPage()}
      </div>
    </div>
  );
}
