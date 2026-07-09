import { useState, useEffect } from 'react';
import { supabase, offlineQueue } from '../services/supabaseClient';
import { Plus, X, TrendingDown } from 'lucide-react';

const CONCEPTOS_EGRESO = [
  'Servicios',
  'Salarios',
  'Alquiler',
  'Mantenimiento',
  'Compras',
  'Transporte',
  'Otros',
];

const CENTROS_COSTO = [
  'Administración',
  'Mantenimiento',
  'Personal',
  'Ministerios',
  'Proyectos',
];

export default function Egresos({ onSuccess }) {
  const [formData, setFormData] = useState({
    concepto: 'Servicios',
    monto: '',
    centro_costo: 'Administración',
    comprobante: '',
    beneficiario: '',
    observaciones: '',
  });

  const [egresos, setEgresos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analisisVisible, setAnalisisVisible] = useState(false);

  useEffect(() => {
    loadEgresos();
  }, []);

  const loadEgresos = async () => {
    try {
      const { data } = await supabase
        .from('movimientos')
        .select('*')
        .eq('tipo', 'egreso');
      setEgresos(data || []);
    } catch (error) {
      console.error('Error loading egresos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const monto = parseFloat(formData.monto) || 0;
      if (monto <= 0) {
        alert('Ingresa un monto válido');
        setLoading(false);
        return;
      }

      const newEgreso = {
        tipo: 'egreso',
        concepto: formData.concepto,
        monto,
        centro_costo: formData.centro_costo,
        comprobante: formData.comprobante,
        beneficiario: formData.beneficiario,
        observaciones: formData.observaciones,
        fecha: new Date().toISOString(),
        usuario_id: (await supabase.auth.getUser()).data.user?.id,
      };

      if (navigator.onLine) {
        const { error } = await supabase.from('movimientos').insert([newEgreso]);
        if (error) throw error;
      } else {
        offlineQueue.add({
          type: 'insert',
          table: 'movimientos',
          data: newEgreso,
        });
      }

      setFormData({
        concepto: 'Servicios',
        monto: '',
        centro_costo: 'Administración',
        comprobante: '',
        beneficiario: '',
        observaciones: '',
      });
      setShowModal(false);
      loadEgresos();
      onSuccess?.();
    } catch (error) {
      alert('Error al registrar egreso: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Análisis de costos
  const analisisPorConcepto = {};
  egresos.forEach((egreso) => {
    if (!analisisPorConcepto[egreso.concepto]) {
      analisisPorConcepto[egreso.concepto] = { total: 0, cantidad: 0 };
    }
    analisisPorConcepto[egreso.concepto].total += egreso.monto;
    analisisPorConcepto[egreso.concepto].cantidad += 1;
  });

  const analisisPorCentro = {};
  egresos.forEach((egreso) => {
    if (!analisisPorCentro[egreso.centro_costo]) {
      analisisPorCentro[egreso.centro_costo] = { total: 0, cantidad: 0 };
    }
    analisisPorCentro[egreso.centro_costo].total += egreso.monto;
    analisisPorCentro[egreso.centro_costo].cantidad += 1;
  });

  const totalEgresos = egresos.reduce((sum, e) => sum + e.monto, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-navy">Registrar Egresos</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setAnalisisVisible(!analisisVisible)}
            className="btn-secondary flex items-center gap-2"
          >
            <TrendingDown size={20} />
            Análisis de Costos
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Egreso
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-navy text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Nuevo Egreso</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-navy-dark rounded"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Concepto</label>
                <select
                  value={formData.concepto}
                  onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                  className="input-field"
                >
                  {CONCEPTOS_EGRESO.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Monto</label>
                <input
                  type="number"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Centro de Costo
                </label>
                <select
                  value={formData.centro_costo}
                  onChange={(e) => setFormData({ ...formData, centro_costo: e.target.value })}
                  className="input-field"
                >
                  {CENTROS_COSTO.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Comprobante
                  </label>
                  <input
                    type="text"
                    value={formData.comprobante}
                    onChange={(e) => setFormData({ ...formData, comprobante: e.target.value })}
                    placeholder="Nº Comprobante"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Beneficiario
                  </label>
                  <input
                    type="text"
                    value={formData.beneficiario}
                    onChange={(e) => setFormData({ ...formData, beneficiario: e.target.value })}
                    placeholder="Nombre"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Notas..."
                  rows="3"
                  className="input-field"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Registrar Egreso'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Análisis de Costos */}
      {analisisVisible && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold text-navy mb-4">Análisis por Concepto</h2>
            <div className="space-y-3">
              {Object.entries(analisisPorConcepto)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([concepto, { total, cantidad }]) => (
                  <div key={concepto} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-semibold text-navy">{concepto}</p>
                      <p className="text-xs text-gray-600">{cantidad} registro(s)</p>
                    </div>
                    <p className="font-bold text-accent-red">
                      ${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-navy mb-4">Análisis por Centro de Costo</h2>
            <div className="space-y-3">
              {Object.entries(analisisPorCentro)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([centro, { total, cantidad }]) => (
                  <div key={centro} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-semibold text-navy">{centro}</p>
                      <p className="text-xs text-gray-600">{cantidad} registro(s)</p>
                    </div>
                    <p className="font-bold text-accent-red">
                      ${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              <div className="pt-3 border-t-2 border-gold">
                <div className="flex justify-between">
                  <p className="font-bold text-navy">TOTAL EGRESOS</p>
                  <p className="font-bold text-2xl text-accent-red">
                    ${totalEgresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Egresos */}
      <div className="card">
        <h2 className="text-xl font-bold text-navy mb-4">Últimos Egresos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Concepto</th>
                <th className="px-4 py-3 text-left">Centro de Costo</th>
                <th className="px-4 py-3 text-left">Beneficiario</th>
                <th className="px-4 py-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {egresos.slice(-10).reverse().map((egreso) => (
                <tr key={egreso.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {new Date(egreso.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{egreso.concepto}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{egreso.centro_costo}</td>
                  <td className="px-4 py-3 text-sm">{egreso.beneficiario || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                    -${egreso.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
