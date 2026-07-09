import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function Auditoria() {
  const [movimientos, setMovimientos] = useState([]);
  const [auditoria, setAuditoria] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    loadAuditoria();
  }, [filtro]);

  const loadAuditoria = async () => {
    try {
      const { data: movs } = await supabase
        .from('movimientos')
        .select('*')
        .order('fecha', { ascending: false });

      setMovimientos(movs || []);

      // Análisis de auditoría
      const analisis = {
        totalRegistros: movs?.length || 0,
        totalIngresos: movs?.filter((m) => m.tipo === 'ingreso').length || 0,
        totalEgresos: movs?.filter((m) => m.tipo === 'egreso').length || 0,
        montoTotalIngresos: movs
          ?.filter((m) => m.tipo === 'ingreso')
          .reduce((sum, m) => sum + m.monto, 0) || 0,
        montoTotalEgresos: movs
          ?.filter((m) => m.tipo === 'egreso')
          .reduce((sum, m) => sum + m.monto, 0) || 0,
        registrosSinComprobante: movs?.filter((m) => m.tipo === 'egreso' && !m.comprobante)
          .length || 0,
        registrosSinObservaciones: movs?.filter((m) => !m.observaciones).length || 0,
      };

      setAuditoria(analisis);
    } catch (error) {
      console.error('Error loading auditoria:', error);
    }
  };

  const issues = [];
  if (auditoria.registrosSinComprobante > 0) {
    issues.push({
      tipo: 'warning',
      mensaje: `${auditoria.registrosSinComprobante} egresos sin comprobante registrado`,
    });
  }
  if (auditoria.registrosSinObservaciones > 0) {
    issues.push({
      tipo: 'info',
      mensaje: `${auditoria.registrosSinObservaciones} movimientos sin observaciones`,
    });
  }

  const discrepancias = movimientos.filter((m) => {
    if (m.tipo === 'egreso' && !m.comprobante && !m.beneficiario) return true;
    return false;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-3xl font-bold text-navy">Auditoría de Cuenta</h1>

      {/* Alertas */}
      {issues.length > 0 && (
        <div className="space-y-3">
          {issues.map((issue, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-4 rounded-lg ${
                issue.tipo === 'warning'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              <AlertCircle size={20} />
              <span>{issue.mensaje}</span>
            </div>
          ))}
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Total Registros" value={auditoria.totalRegistros} color="bg-blue-100 text-blue-800" />
        <StatBox label="Total Ingresos" value={auditoria.totalIngresos} color="bg-green-100 text-green-800" />
        <StatBox label="Total Egresos" value={auditoria.totalEgresos} color="bg-red-100 text-red-800" />
        <StatBox label="Saldo" value={`$${(auditoria.montoTotalIngresos - auditoria.montoTotalEgresos).toLocaleString('es-ES')}`} color="bg-gold bg-opacity-20 text-oro" />
      </div>

      {/* Resumen de Montos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold text-navy mb-4">Ingresos Totales</h3>
          <p className="text-4xl font-bold text-green-600">
            ${auditoria.montoTotalIngresos.toLocaleString('es-ES')}
          </p>
          <p className="text-sm text-gray-600 mt-2">{auditoria.totalIngresos} registros</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-bold text-navy mb-4">Egresos Totales</h3>
          <p className="text-4xl font-bold text-red-600">
            ${auditoria.montoTotalEgresos.toLocaleString('es-ES')}
          </p>
          <p className="text-sm text-gray-600 mt-2">{auditoria.totalEgresos} registros</p>
        </div>
      </div>

      {/* Discrepancias */}
      {discrepancias.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-navy mb-4">Discrepancias Detectadas</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Concepto</th>
                  <th className="px-4 py-3 text-left">Monto</th>
                  <th className="px-4 py-3 text-left">Problemas</th>
                </tr>
              </thead>
              <tbody>
                {discrepancias.map((mov) => (
                  <tr key={mov.id} className="border-b bg-yellow-50">
                    <td className="px-4 py-3 text-sm">
                      {new Date(mov.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{mov.concepto}</td>
                    <td className="px-4 py-3 text-sm">${mov.monto}</td>
                    <td className="px-4 py-3 text-sm text-red-600 font-semibold">
                      Sin comprobante ni beneficiario
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Certificación */}
      <div className="card border-2 border-green-500">
        <div className="flex items-center gap-4">
          <CheckCircle size={40} className="text-green-600" />
          <div>
            <h3 className="text-lg font-bold text-navy">Estado de Auditoría</h3>
            <p className="text-sm text-gray-600">
              Revisado: {new Date().toLocaleDateString('es-ES')} a las{' '}
              {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Última auditoría detallada */}
      <div className="card">
        <h2 className="text-xl font-bold text-navy mb-4">Últimos Movimientos Auditados</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Concepto</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-left">Validación</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.slice(0, 20).map((mov) => {
                let validacion = '✓ Válido';
                let clase = 'text-green-600';

                if (mov.tipo === 'egreso' && !mov.comprobante) {
                  validacion = '⚠ Sin comprobante';
                  clase = 'text-yellow-600';
                }
                if (!mov.observaciones) {
                  validacion = 'ℹ Sin observaciones';
                  clase = 'text-blue-600';
                }

                return (
                  <tr key={mov.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {new Date(mov.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">Sistema</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                          mov.tipo === 'ingreso' ? 'bg-green-600' : 'bg-red-600'
                        }`}
                      >
                        {mov.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{mov.concepto}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      ${mov.monto.toLocaleString('es-ES')}
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${clase}`}>
                      {validacion}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className={`${color} rounded-lg p-6`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
