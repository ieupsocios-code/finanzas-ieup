import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Download, Share2, FileText } from 'lucide-react';
import Papa from 'papaparse';

export default function Reportes({ stats }) {
  const [movimientos, setMovimientos] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('mes');

  useEffect(() => {
    loadMovimientos();
  }, [filtroFecha, filtroTipo]);

  const loadMovimientos = async () => {
    try {
      let query = supabase.from('movimientos').select('*');

      if (filtroTipo !== 'todos') {
        query = query.eq('tipo', filtroTipo);
      }

      const { data } = await query.order('fecha', { ascending: false });
      setMovimientos(data || []);
    } catch (error) {
      console.error('Error loading movimientos:', error);
    }
  };

  const exportarCSV = () => {
    const csv = Papa.unparse(movimientos.map((m) => ({
      Fecha: new Date(m.fecha).toLocaleDateString('es-ES'),
      Tipo: m.tipo,
      Concepto: m.concepto,
      Moneda: m.moneda,
      Monto: m.monto,
      Centro: m.centro_costo,
      Caja: m.caja,
      Observaciones: m.observaciones,
    })));

    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = `reporte-finanzas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportarAGoogleSheets = async () => {
    const csv = Papa.unparse(movimientos.map((m) => ({
      Fecha: new Date(m.fecha).toLocaleDateString('es-ES'),
      Tipo: m.tipo,
      Concepto: m.concepto,
      Moneda: m.moneda,
      Monto: m.monto,
      Centro: m.centro_costo,
      Caja: m.caja,
    })));

    // Instrucciones para Google Sheets
    const mensaje = `
1. Ve a: https://sheets.new
2. Importa datos (Archivo > Importar)
3. Sube el archivo CSV descargado
4. ¡Listo para analizar en Google Sheets!

Datos listos para copiar:
${csv}
    `;

    alert(mensaje);
    exportarCSV();
  };

  const exportarPDF = () => {
    const contenido = `
REPORTE DE FINANZAS - IGLESIA EVANGÉLICA UNIÓN PENTECOSTAL
Fecha: ${new Date().toLocaleDateString('es-ES')}

RESUMEN GENERAL:
- Ingresos Totales: $${stats.totalIngresos.toLocaleString('es-ES')}
- Egresos Totales: $${stats.totalEgresos.toLocaleString('es-ES')}
- Saldo: $${stats.saldo.toLocaleString('es-ES')}

MOVIMIENTOS:
${movimientos
  .map(
    (m) => `
${new Date(m.fecha).toLocaleDateString('es-ES')} | ${m.tipo.toUpperCase()} | ${m.concepto} | $${m.monto}
  Centro: ${m.centro_costo} | Observaciones: ${m.observaciones || 'N/A'}
    `
  )
  .join('\n')}
    `;

    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(contenido);
    link.download = `reporte-finanzas-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  const totalIngresos = movimientos
    .filter((m) => m.tipo === 'ingreso')
    .reduce((sum, m) => sum + m.monto, 0);
  const totalEgresos = movimientos
    .filter((m) => m.tipo === 'egreso')
    .reduce((sum, m) => sum + m.monto, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-navy">Reportes</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportarCSV}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={18} />
            Descargar CSV
          </button>
          <button
            onClick={exportarAGoogleSheets}
            className="btn-secondary flex items-center gap-2"
          >
            <Share2 size={18} />
            Enviar a Google Sheets
          </button>
          <button
            onClick={exportarPDF}
            className="btn-secondary flex items-center gap-2"
          >
            <FileText size={18} />
            Exportar Texto
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="input-field"
            >
              <option value="todos">Todos</option>
              <option value="ingreso">Ingresos</option>
              <option value="egreso">Egresos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Período</label>
            <select
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="input-field"
            >
              <option value="semana">Últimos 7 días</option>
              <option value="mes">Último mes</option>
              <option value="trimestre">Último trimestre</option>
              <option value="anio">Último año</option>
              <option value="todos">Todos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-100 text-green-800 rounded-lg p-6">
          <p className="text-sm font-medium opacity-75">Ingresos</p>
          <p className="text-3xl font-bold mt-2">
            ${totalIngresos.toLocaleString('es-ES')}
          </p>
        </div>
        <div className="bg-red-100 text-red-800 rounded-lg p-6">
          <p className="text-sm font-medium opacity-75">Egresos</p>
          <p className="text-3xl font-bold mt-2">
            ${totalEgresos.toLocaleString('es-ES')}
          </p>
        </div>
        <div className="bg-gold bg-opacity-20 text-oro rounded-lg p-6">
          <p className="text-sm font-medium opacity-75">Saldo</p>
          <p className="text-3xl font-bold mt-2">
            ${(totalIngresos - totalEgresos).toLocaleString('es-ES')}
          </p>
        </div>
      </div>

      {/* Tabla de Movimientos */}
      <div className="card">
        <h2 className="text-xl font-bold text-navy mb-4">Movimientos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Concepto</th>
                <th className="px-4 py-3 text-left">Moneda</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-left">Centro</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.slice(0, 50).map((mov) => (
                <tr key={mov.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {new Date(mov.fecha).toLocaleDateString('es-ES')}
                  </td>
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
                  <td className="px-4 py-3 text-sm">{mov.moneda}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    ${mov.monto.toLocaleString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{mov.centro_costo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
