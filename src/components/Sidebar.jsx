import { useState } from 'react';
import {
  Menu,
  X,
  Home,
  DollarSign,
  BarChart3,
  Users,
  Settings,
  LogOut,
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle,
} from 'lucide-react';

export default function Sidebar({ userRole, onLogout }) {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'cobrador', 'consulta'] },
    { id: 'ingresos', label: 'Registrar Ingresos', icon: TrendingUp, roles: ['admin', 'cobrador'] },
    { id: 'egresos', label: 'Registrar Egresos', icon: TrendingDown, roles: ['admin', 'cobrador'] },
    { id: 'finanzas', label: 'Finanzas', icon: DollarSign, roles: ['admin', 'cobrador', 'consulta'] },
    { id: 'reportes', label: 'Reportes', icon: BarChart3, roles: ['admin', 'consulta'] },
    { id: 'templos', label: 'Gestionar Templos', icon: Settings, roles: ['admin'] },
    { id: 'cajas', label: 'Gestionar Cajas', icon: Settings, roles: ['admin'] },
    { id: 'auditoria', label: 'Auditoría', icon: CheckCircle, roles: ['auditor', 'admin'] },
    { id: 'usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Botón hamburguesa móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-navy p-2 rounded-lg text-gold"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 w-64 h-screen bg-gradient-to-b from-navy to-navy-dark text-cream flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gold border-opacity-20">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="/logo-white.png" 
              alt="IEUP" 
              className="w-10 h-10"
            />
            <div>
              <h1 className="text-lg font-bold text-gold">Finanzas</h1>
              <p className="text-xs text-cream opacity-75">IEUP</p>
            </div>
          </div>
        </div>

        {/* Menú */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setIsOpen(false);
                document.dispatchEvent(new CustomEvent('navigate', { detail: item.id }));
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors text-left font-medium"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Usuario y logout */}
        <div className="p-4 border-t border-gold border-opacity-20">
          <div className="mb-4 p-3 bg-gold bg-opacity-10 rounded-lg">
            <p className="text-xs text-cream opacity-75">Rol</p>
            <p className="text-sm font-semibold text-gold capitalize">{userRole}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 bg-accent-red rounded-lg hover:bg-red-700 transition-colors text-white font-medium"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
