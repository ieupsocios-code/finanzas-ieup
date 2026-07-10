import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
} from 'lucide-react';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const COLORS = ['#FFD700', '#C41E3A', '#001f3f', '#D4AF37', '#22c55e', '#3b82f6', '#a855f7', '#f97316'];
const SYMBOLS = { ARS: '$', USD: 'U$S', CLP: 'CLP $' };

export default function DashboardHome() {
  const [movimientos, setMovimientos] = useState([]);
  const [moneda, setMoneda] = useState('ARS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await supabase
        .from('movimientos')
        .select('*')
        .order('fecha', { ascending: true });
      setMovimientos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Monedas presentes en los datos (para mostrar solo los botones necesarios)
  const monedasDisponibles = useMemo(() => {
    const set = new Set(movimientos.map(m => m.moneda || 'ARS'));
    return ['ARS', 'USD', 'CLP'].filter(m => set.has(m));
  }, [movimientos]);

  // Movimientos filtrados por moneda seleccionada
  const movsFiltrados = useMemo(
    () => movimientos.filter(m => (m.moneda || 'ARS') === moneda),
    [movimientos, moneda]
  );

  // Totales del año actual en la moneda seleccionada
  const stats = useMemo(() => {
    const añoActual = new Date().getFullYear();
    let totalIngresos = 0;
    let totalEgresos = 0;
    movsFiltrados.forEach(m => {
      const añoMov = new Date(m.fecha).getFullYear();
      if (añoMov !== añoActual) return;
      if (m.tipo === 'ingreso') totalIngresos += m.monto || 0;
      else totalEgresos += m.monto || 0;
    });
    return { totalIngresos, totalEgresos, saldo: totalIngresos - totalEgresos };
  }, [movsFiltrados]);

  // Últimos 30 días REALES (desde hoy hacia atrás)
  const chartData30Dias = useMemo(() => {
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);
    const grouped = {};
    movsFiltrados.forEach(m => {
      const fechaMov = new Date(m.fecha);
      if (fechaMov < hace30) return;
      const date = m.fecha.split('T')[0];
      if (!grouped[date]) grouped[date] = { date: date.slice(5), ingresos: 0, egresos: 0 };
      if (m.tipo === 'ingreso') grouped[date].ingresos += m.monto || 0;
      else grouped[date].egresos += m.monto || 0;
    });
    return Object.keys(grouped).sort().map(k => grouped[k]);
  }, [movsFiltrados]);

  // Distribución de ingresos por concepto (año actual, top 7 + Otros)
  const distribucionData = useMemo(() => {
    const añoActual = new Date().getFullYear();
    const porConcepto = {};
    movsFiltrados.forEach(m => {
      if (m.tipo !== 'ingreso') return;
      if (new Date(m.fecha).getFullYear() !== añoActual) return;
      const c = m.concepto || 'Sin concepto';
      porConcepto[c] = (porConcepto[c] || 0) + (m.monto || 0);
    });
    const ordenado = Object.entries(porConcepto)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    if (ordenado.length > 7) {
      const top = ordenado.slice(0, 7);
      const resto = ordenado.slice(7).reduce((s, x) => s + x.value, 0);
      top.push({ name: 'Otros', value: resto });
      return top;
    }
    return ordenado;
  }, [movsFiltrados]);

  // Resumen mensual REAL (agrupado por mes del año actual)
  const resumenMensual = useMemo(() => {
    const añoActual = new Date().getFullYear();
    const meses = MESES.map((mes) => ({ mes, ingresos: 0, egresos: 0 }));
    movsFiltrados.forEach(m => {
      const f = new Date(m.fecha);
      if (f.getFullYear() !== añoActual) return;
      const idx = f.getMonth();
      if (m.tipo === 'ingreso') meses[idx].ingresos += m.monto || 0;
      else meses[idx].egresos += m.monto || 0;
    });
    // Mostrar solo hasta el mes actual
    return meses.slice(0, new Date().getMonth() + 1);
  }, [movsFiltrados]);

  // Formateo de números estilo argentino
  const fmt = (n) =>
    `${SYMBOLS[moneda] || '$'} ${(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Formato compacto para ejes (150.000 → 150k)
  const fmtCompacto = (n) => {
    if (Math.abs(n) >= 1000000) return `${(n / 1000000).toLocaleString('es-AR', { maximumFractionDigits: 1 })}M`;
    if (Math.abs(n) >= 1000) return `${(n / 1000).toLocaleString('es-AR', { maximumFractionDigits: 0 })}k`;
    return n.toString();
  };

  const tooltipFmt = (value) => fmt(value);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo-navy.png" alt="IEUP" className="w-16 h-16" />
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Dashboard Finanzas</h1>
            <p className="text-gray-600">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Selector de moneda (solo si hay más de una) */}
        {monedasDisponibles.length > 1 && (
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            {monedasDisponibles.map((m) => (
              <button
                key={m}
                onClick={() => setMoneda(m)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition ${
                  moneda === m ? 'bg-navy text-white shadow' : 'text-navy hover:bg-gray-200'
                }`}
              >
                {m === 'ARS' && '🇦🇷 ARS'}
                {m === 'USD' && '🇺🇸 USD'}
                {m === 'CLP' && '🇨🇱 CLP'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label={`Ingresos ${new Date().getFullYear()}`} amount={fmt(stats.totalIngresos)} color="bg-green-100" textColor="text-green-800" />
        <StatCard icon={TrendingDown} label={`Egresos ${new Date().getFullYear()}`} amount={fmt(stats.totalEgresos)} color="bg-red-100" textColor="text-red-800" />
        <StatCard icon={Wallet} label="Saldo Actual" amount={fmt(stats.saldo)} color="bg-gold bg-opacity-20" textColor="text-oro" />
        <StatCard icon={Calendar} label="Año" amount={new Date().getFullYear()} color="bg-navy bg-opacity-20" textColor="text-navy" />
      </div>

      {loading ? (
        <div className="card text-center text-gray-500 py-12">Cargando datos...</div>
      ) : movsFiltrados.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">
          No hay movimientos registrados en {moneda}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-bold text-navy mb-4">Movimientos (Últimos 30 días)</h2>
              {chartData30Dias.length === 0 ? (
                <p className="text-gray-500 text-center py-12">Sin movimientos en los últimos 30 días</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData30Dias} margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#666" tickFormatter={fmtCompacto} tick={{ fontSize: 12 }} width={55} />
                    <Tooltip formatter={tooltipFmt} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="ingresos" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
                    <Line type="monotone" dataKey="egresos" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-navy mb-4">Distribución de Ingresos por Concepto</h2>
              {distribucionData.length === 0 ? (
                <p className="text-gray-500 text-center py-12">Sin ingresos este año</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distribucionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ strokeWidth: 1 }}
                    >
                      {distribucionData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={tooltipFmt} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-navy mb-4">
              Resumen Mensual {new Date().getFullYear()}
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={resumenMensual} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" stroke="#666" tick={{ fontSize: 12 }} />
                <YAxis stroke="#666" tickFormatter={fmtCompacto} tick={{ fontSize: 12 }} width={55} />
                <Tooltip formatter={tooltipFmt} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }} />
                <Legend />
                <Bar dataKey="ingresos" fill="#22c55e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="egresos" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, amount, color, textColor }) {
  return (
    <div className={`${color} rounded-lg p-6 ${textColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-2xl font-bold mt-2">{amount}</p>
        </div>
        <Icon size={32} className="opacity-50" />
      </div>
    </div>
  );
}
