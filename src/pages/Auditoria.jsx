import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertCircle, Activity, Plus, Trash2, Edit2, FileText } from 'lucide-react';

export default function Auditoria() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [revisores, setRevisores] = useState([]);
  const [stats, setStats] = useState({
    totalMovimientos: 0,
    usuariosActivos: 0,
    cambiosHoy: 0,
    discrepancias: 0
  });
  const [chartData, setChartData] = useState([]);
  const [showFormRevisor, setShowFormRevisor] = useState(false);
  const [newRevisor, setNewRevisor] = useState({ nombre: '', email: '', fecha_revision: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    loadAuditData();
  }, []);

  const loadAuditData = async () => {
    try {
      // Logs de auditoría
      const { data: logs } = await supabase
        .from('auditoria')
        .select('*')
        .order('fecha', { ascending: false })
        .limit(50);

      setAuditLogs(logs || []);

      // Revisores de cuenta
      const { data: revisoresData } = await supabase
        .from('revisores_cuenta')
        .select('*')
        .order('fecha_revision', { ascending: false });

      setRevisores(revisoresData || []);

      // Estadísticas
      const { data: movimientos } = await supabase
        .from('movimientos')
        .select('*');

      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('*');

      setStats({
        totalMovimientos: movimientos?.length || 0,
        usuariosActivos: usuarios?.length || 0,
        cambiosHoy: logs?.filter(l => new Date(l.fecha).toDateString() === new Date().toDateString()).length || 0,
        discrepancias: revisoresData?.filter(r => r.discrepancias_encontradas).length || 0
      });

      // Gráfico por usuario
      const groupedByUser = {};
      logs?.forEach(log => {
        if (!groupedByUser[log.usuario]) {
          groupedByUser[log.usuario] = 0;
        }
        groupedByUser[log.usuario]++;
      });

      setChartData(
        Object.entries(groupedByUser).map(([usuario, count]) => ({
          usuario,
          acciones: count
        }))
      );
    } catch (error) {
      console.error('Error loading audit data:', error);
    }
  };

  const handleAddRevisor = async (e) => {
    e.preventDefault();
    
    await supabase.from('revisores_cuenta').insert({
      nombre: newRevisor.nombre,
      email: newRevisor.email,
      fecha_revision: newRevisor.fecha_revision,
      discrepancias_encontradas: false,
      observaciones: ''
    });

    setNewRevisor({ nombre: '', email: '', fecha_revision: new Date().toISOString().split('T')[0] });
    setShowFormRevisor(false);
    loadAuditData();
  };

  const handleDeleteRevisor = async (id) => {
    if (confirm('¿Eliminar revisor?')) {
      await supabase.from('revisores_cuenta').delete().eq('id', id);
      loadAuditData();
    }
  };

  const handleMarkDiscrepancia = async (id, hasDiscrepancia) => {
    await supabase
      .from('revisores_cuenta')
      .update({ discrepancias_encontradas: !hasDiscrepancia })
      .eq('id', id);
    
    loadAuditData();
  };

  const exportarReportAuditoria = () => {
    const data = auditLogs.map(log => ({
      Fecha: new Date(log.fecha).toLocaleString('es-ES'),
      Usuario: log.usuario,
      Acción: log.accion,
      Tabla: log.tabla,
      Detalles: log.detalles || '—'
    }));

    const csv = require('papaparse').unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-navy mb-2">Auditoría del Sistema</h1>
        <p className="text-gray-600">Registro de actividades y herramientas de revisión de cuentas</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-4">
            <Activity className="text-blue-600" size={40} />
            <div>
              <p className="text-sm text-gray-600">Total Movimientos</p>
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

        <div className="card bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center gap-4">
            <AlertCircle className="text-red-600" size={40} />
            <div>
              <p className="text-sm text-gray-600">Discrepancias</p>
              <p className="text-3xl font-bold text-navy">{stats.discrepancias}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de actividades */}
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

      {/* Revisores de Cuenta */}
      <div className="card border-l-4 border-purple-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-navy">Revisores de Cuentas</h2>
          <div className="flex gap-2">
            <button
              onClick={exportarReportAuditoria}
              className="btn-secondary flex items-center gap-2"
            >
              <FileText size={20} />
              Exportar Reporte
            </button>
            <button
              onClick={() => setShowFormRevisor(!showFormRevisor)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Nuevo Revisor
            </button>
          </div>
        </div>

        {showFormRevisor && (
          <form onSubmit={handleAddRevisor} className="bg-purple-50 p-4 rounded mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nombre del revisor"
                value={newRevisor.nombre}
                onChange={(e) => setNewRevisor({...newRevisor, nombre: e.target.value})}
                className="input-field"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newRevisor.email}
                onChange={(e) => setNewRevisor({...newRevisor, email: e.target.value})}
                className="input-field"
                required
              />
              <input
                type="date"
                value={newRevisor.fecha_revision}
                onChange={(e) => setNewRevisor({...newRevisor, fecha_revision: e.target.value})}
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary mt-3">Agregar Revisor</button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gold">
                <th className="text-left p-3 text-navy font-bold">Revisor</th>
                <th className="text-left p-3 text-navy font-bold">Email</th>
                <th className="text-left p-3 text-navy font-bold">Fecha Revisión</th>
                <th className="text-left p-3 text-navy font-bold">Discrepancias</th>
                <th className="text-left p-3 text-navy font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {revisores.length > 0 ? (
                revisores.map((revisor) => (
                  <tr key={revisor.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{revisor.nombre}</td>
                    <td className="p-3 text-sm">{revisor.email}</td>
                    <td className="p-3 text-sm">{new Date(revisor.fecha_revision).toLocaleDateString('es-ES')}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleMarkDiscrepancia(revisor.id, revisor.discrepancias_encontradas)}
                        className={`px-3 py-1 rounded text-white text-xs font-bold ${
                          revisor.discrepancias_encontradas ? 'bg-red-500' : 'bg-green-500'
                        }`}
                      >
                        {revisor.discrepancias_encontradas ? 'SÍ' : 'NO'}
                      </button>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleDeleteRevisor(revisor.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No hay revisores registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registro de cambios */}
      <div className="card">
        <h2 className="text-xl font-bold text-navy mb-4">Registro de Cambios Recientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gold">
                <th className="text-left p-3 text-navy font-bold">Fecha</th>
                <th className="text-left p-3 text-navy font-bold">Usuario</th>
                <th className="text-left p-3 text-navy font-bold">Acción</th>
                <th className="text-left p-3 text-navy font-bold">Tabla</th>
                <th className="text-left p-3 text-navy font-bold">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length > 0 ? (
                auditLogs.map((log, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      {new Date(log.fecha).toLocaleString('es-ES')}
                    </td>
                    <td className="p-3 text-sm font-medium">{log.usuario}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded text-white text-xs font-bold ${
                        log.accion === 'INSERT' ? 'bg-green-500' :
                        log.accion === 'UPDATE' ? 'bg-blue-500' :
                        'bg-red-500'
                      }`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{log.tabla}</td>
                    <td className="p-3 text-sm text-gray-600">{log.detalles || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No hay registros de auditoría disponibles
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
