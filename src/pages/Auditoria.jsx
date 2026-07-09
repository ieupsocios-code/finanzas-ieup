import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertCircle, Activity } from 'lucide-react';

export default function Auditoria() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({
    totalMovimientos: 0,
    usuariosActivos: 0,
    cambiosHoy: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadAuditData();
  }, []);

  const loadAuditData = async () => {
    try {
      const { data: logs } = await supabase
        .from('auditoria')
        .select('*')
        .order('fecha', { ascending: false })
        .limit(50);

      setAuditLogs(logs || []);

      const { data: movimientos } = await supabase.from('movimientos').select('*');
      const { data: usuarios } = await supabase.from('usuarios').select('*');

      setStats({
        totalMovimientos: movimientos?.length || 0,
        usuariosActivos: usuarios?.length || 0,
        cambiosHoy: logs?.filter(l => new Date(l.fecha).toDateString() === new Date().toDateString()).length || 0
      });

      const groupedByUser = {};
      logs?.forEach(log => {
        groupedByUser[log.usuario] = (groupedByUser[log.usuario] || 0) + 1;
      });

      setChartData(Object.entries(groupedByUser).map(([usuario, count]) => ({ usuario, acciones: count })));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-navy mb-2">Auditoría del Sistema</h1>
        <p className="text-gray-600">Registro de todas las actividades</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-4">
            <Activity className="text-blue-600" size={40} />
            <div>
              <p className="text-sm text-gray-600">Total de Movimientos</p>
              <p className="text-3xl font-bold text-navy">{stats.totalMovimientos}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-4">
            <CheckCircle className="text-green-600" size={40} />
            <div>
              <p className="text-sm text-gray-600">Usuarios Activos</p>
              <p className="text-3xl font-bold text-navy">{stats.usuariosActivos}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-oro/20 to-gold/20">
          <div className="flex items-center gap-4">
            <AlertCircle className="text-oro" size={40} />
            <div>
              <p className="text-sm text-gray-600">Cambios Hoy</p>
              <p className="text-3xl font-bold text-navy">{stats.cambiosHoy}</p>
            </div>
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-navy mb-4">Actividades por Usuario</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="usuario" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }} />
              <Bar dataKey="acciones" fill="#FFD700" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold text-navy mb-4">Registro de Cambios</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gold">
                <th className="text-left p-3 text-navy font-bold">Fecha</th>
                <th className="text-left p-3 text-navy font-bold">Usuario</th>
                <th className="text-left p-3 text-navy font-bold">Acción</th>
                <th className="text-left p-3 text-navy font-bold">Tabla</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length > 0 ? (
                auditLogs.map((log, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">{new Date(log.fecha).toLocaleString('es-ES')}</td>
                    <td className="p-3 text-sm font-medium">{log.usuario}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded text-white text-xs font-bold ${
                        log.accion === 'INSERT' ? 'bg-green-500' : log.accion === 'UPDATE' ? 'bg-blue-500' : 'bg-red-500'
                      }`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{log.tabla}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    No hay registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
