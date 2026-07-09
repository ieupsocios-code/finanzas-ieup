import { useState, useEffect } from 'react';
import { supabase, offlineQueue } from '../services/supabaseClient';
import { Plus, X, Banknote } from 'lucide-react';

const MONEDAS = ['ARS', 'USD', 'CLP', 'PLAZO FIJO', 'BILLETERA ELECTRÓNICA'];
const CONCEPTOS_INGRESO = ['Ofrenda', 'Aporte', 'Transferencia', 'Venta', 'Deposito', 'Diezmo'];
const BILLETES = [10, 20, 50, 100, 200, 500, 1000, 2000, 10000, 20000];

export default function Ingresos({ onSuccess }) {
  const [formData, setFormData] = useState({
    tipo: 'ingreso',
    concepto: 'Ofrenda',
    moneda: 'ARS',
    centro_costo: '',
    caja: '',
    monto_manual: '',
    observaciones: '',
  });

  const [billetes, setBilletes] = useState({});
  const [ingresos, setIngresos] = useState([]);
  const [templos, setTemplos] = useState([]);
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isOfrenda, setIsOfrenda] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templosRes, cajasRes, ingresosRes] = await Promise.all([
        supabase.from('templos').select('*'),
        supabase.from('cajas').select('*'),
        supabase.from('movimientos').select('*').eq('tipo', 'ingreso'),
      ]);

      setTemplos(templosRes.data || []);
      setCajas(cajasRes.data || []);
      setIngresos(ingresosRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleBilleteChange = (valor, cantidad) => {
    setBilletes({ ...billetes, [valor]: parseInt(cantidad) || 0 });
  };

  const calcularTotalOfrenda = () => {
    return Object.entries(billetes).reduce((sum, [valor, cantidad]) => {
      return sum + parseInt(valor) * (cantidad || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const monto = isOfrenda
        ? calcularTotalOfrenda()
        : parseFloat(formData.monto_manual) || 0;

      if (monto <= 0) {
        alert('Ingresa un monto válido');
        setLoading(false);
        return;
      }

      const newIngreso = {
        tipo: 'ingreso',
        concepto: formData.concepto,
        moneda: formData.moneda,
        monto,
        centro_costo: formData.centro_costo,
        caja: formData.caja,
        observaciones: formData.observaciones,
        detalle_billetes: isOfrenda ? JSON.stringify(billetes) : null,
        fecha: new Date().toISOString(),
        usuario_id: (await supabase.auth.getUser()).data.user?.id,
      };

      if (navigator.onLine) {
        const { error } = await supabase.from('movimientos').insert([newIngreso]);
        if (error) throw error;
      } else {
        offlineQueue.add({
          type: 'insert',
          table: 'movimientos',
          data: newIngreso,
        });
      }

      // Reset formulario
      setFormData({
        tipo: 'ingreso',
        concepto: 'Ofrenda',
        moneda: 'ARS',
        centro_costo: '',
        caja: '',
        monto_manual: '',
        observaciones: '',
      });
      setBilletes({});
      setShowModal(false);
      loadData();
      onSuccess?.();
    } catch (error) {
      alert('Error al registrar ingreso: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-navy">Registrar Ingresos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Ingreso
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-navy text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Nuevo Ingreso</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-navy-dark rounded"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Tipo de Ingreso */}
              <div>
                <label className="block text-sm font-semibold text-navy mb-3">
                  Tipo de Ingreso
                </label>
                <div className="flex gap-4">
                  {CONCEPTOS_INGRESO.map((concepto) => (
                    <label key={concepto} className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={formData.concepto === concepto}
                        onChange={() => {
                          setFormData({ ...formData, concepto });
                          setIsOfrenda(concepto === 'Ofrenda');
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{concepto}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Moneda */}
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Moneda</label>
                <select
                  value={formData.moneda}
                  onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                  className="input-field"
                >
                  {MONEDAS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Templo y Caja */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Templo</label>
                  <select
                    value={formData.centro_costo}
                    onChange={(e) => setFormData({ ...formData, centro_costo: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Seleccionar...</option>
                    {templos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Caja</label>
                  <select
                    value={formData.caja}
                    onChange={(e) => setFormData({ ...formData, caja: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Seleccionar...</option>
                    {cajas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Desglose de Billetes (solo para Ofrenda) */}
              {isOfrenda && (
                <div>
                  <label className="block text-sm font-semibold text-navy mb-3">
                    <Banknote className="inline mr-2" size={18} />
                    Desglose de Billetes
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {BILLETES.map((valor) => (
                      <div key={valor}>
                        <label className="text-xs font-medium text-navy mb-1 block">
                          ${valor}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={billetes[valor] || ''}
                          onChange={(e) => handleBilleteChange(valor, e.target.value)}
                          placeholder="0"
                          className="input-field text-sm text-center"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-gold bg-opacity-20 rounded-lg">
                    <p className="text-sm text-navy">
                      <span className="font-semibold">Total Ofrenda:</span> $
                      {calcularTotalOfrenda().toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              )}

              {/* Monto Manual */}
              {!isOfrenda && (
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Monto</label>
                  <input
                    type="number"
                    value={formData.monto_manual}
                    onChange={(e) => setFormData({ ...formData, monto_manual: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    className="input-field"
                    required
                  />
                </div>
              )}

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Observaciones (Opcional)
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Notas adicionales..."
                  rows="3"
                  className="input-field"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Registrar Ingreso'}
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

      {/* Lista de Ingresos */}
      <div className="card">
        <h2 className="text-xl font-bold text-navy mb-4">Últimos Ingresos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Concepto</th>
                <th className="px-4 py-3 text-left">Moneda</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-left">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {ingresos.slice(-10).reverse().map((ingreso) => (
                <tr key={ingreso.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {new Date(ingreso.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{ingreso.concepto}</td>
                  <td className="px-4 py-3 text-sm">{ingreso.moneda}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                    ${ingreso.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {ingreso.observaciones}
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
