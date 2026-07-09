import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Wallet } from 'lucide-react';

export default function Finanzas() {
  const [saldos, setSaldos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState('ARS');
  const [filtroFecha, setFiltroFecha] = useState('mes');

  useEffect(() => {
    loadFinanzas();
  }, [filtroFecha]);

  const loadFinanzas = async () => {
    try {
      const { data: movs } = await supabase
        .from('movimientos')
        .select('*')
        .order('fecha', { ascending: false });

      setMovimientos(movs || []);
      calcularSaldos(movs || []);
    } catch (error) {
      console.error('Error loading finanzas:', error);
    }
  };

  const calcularSaldos = (movs) => {
    const saldosPorMoneda = {};

    movs.forEach((mov) => {
      if (!saldosPorMoneda[mov.moneda]) {
        saldosPorMoneda[mov.moneda] = {
          moneda: mov.moneda,
          ingresos: 0,
          egresos: 0,
        };
      }

      if (mov.tipo === 'ingreso') {
        saldosPorMoneda[mov.moneda].ingresos += mov.monto;
      } else {
        saldosPorMoneda[mov.moneda].egresos += mov.monto;
      }
    });

    setSaldos(
      Object.values(saldosPorMoneda).map((s) => ({
        ...s,
        saldo: s.ingresos - s.egresos,
      }))
    );
  };

  const monedaSeleccionadaData = movimientos.filter((m) => m.moneda === monedaSeleccionada);

  // Gráfico por día
  const chartData = {};
  monedaSeleccionadaData.forEach((mov) => {
    const fecha = mov.fecha.split('T')[0];
    if (!chartData[fecha]) {
      chartData[fecha] = { fecha, ingresos: 0, egresos: 0 };
    }
    if (mov.tipo === 'ingreso') {
      chartData[fecha].ingresos += mov.monto;
    } else {
      chartData[fecha].egresos += mov.monto;
    }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-3xl font-bold text-navy">Finanzas</h1>

      {/* Saldos por Moneda */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {saldos.map((saldo) => (
          <div
            key={saldo.moneda}
            className={`card cursor-pointer transition-all ${
              monedaSeleccionada === saldo.moneda
                ? 'ring-2 ring-gold'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setMonedaSeleccionada(saldo.moneda)}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  <Wallet className="inline mr-2" size={16} />
                  {saldo.moneda}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600">Ingresos</p>
                <p className="text-lg font-bold text-green-600">
                  ${saldo.ingresos.toLocaleString('es-ES')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Egresos</p>
                <p className="text-lg font-bold text-red-600">
                  ${saldo.egresos.toLocaleString('es-ES')}
                </p>
              </div>
              <div className="border-t pt-2 mt-2">
                <p className="text-xs text-gray-600">Saldo</p>
                <p className={`text-2xl font-bold ${saldo.saldo >= 0 ? 'text-gold' : 'text-red-600'}`}>
                  ${saldo.saldo.toLocaleString('es-ES')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="card">
        <h2 className="text-xl font-bold text-navy mb-4">
          Movimientos - {monedaSeleccionada}
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={Object.values(chartData)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <Legend />
            <Bar dataKey="ingresos" fill="#22c55e" radius={[8, 8, 0, 0]} />
            <Bar dataKey="egresos" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detalle de Movimientos */}
      <div className="card">
        <h2 className="text-xl font-bold text-navy mb-4">
          Movimientos Detallados - {monedaSeleccionada}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Concepto</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-left">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {monedaSeleccionadaData.slice(0, 20).map((mov) => (
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
                      {mov.tipo === 'ingreso' ? '+' : '-'} {mov.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{mov.concepto}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    ${mov.monto.toLocaleString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{mov.observaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
