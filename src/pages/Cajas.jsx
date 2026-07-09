import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Plus, X, Edit2, Trash2, Wallet } from 'lucide-react';

const TIPOS_CAJA = ['Jóvenes', 'Dorcas', 'General', 'Niños', 'Ministerios', 'Especial'];

export default function Cajas() {
  const [cajas, setCajas] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'General',
    responsable: '',
    descripcion: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCajas();
  }, []);

  const loadCajas = async () => {
    try {
      const { data } = await supabase.from('cajas').select('*');
      setCajas(data || []);
    } catch (error) {
      console.error('Error loading cajas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('cajas')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase.from('cajas').insert([formData]);
        if (error) throw error;
      }

      setFormData({ nombre: '', tipo: 'General', responsable: '', descripcion: '' });
      setShowModal(false);
      loadCajas();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro?')) return;
    try {
      await supabase.from('cajas').delete().eq('id', id);
      loadCajas();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (caja) => {
    setFormData({
      nombre: caja.nombre,
      tipo: caja.tipo,
      responsable: caja.responsable,
      descripcion: caja.descripcion,
    });
    setEditingId(caja.id);
    setShowModal(true);
  };

  const getColorPorTipo = (tipo) => {
    const colores = {
      'Jóvenes': 'bg-blue-100 border-blue-300',
      'Dorcas': 'bg-pink-100 border-pink-300',
      'General': 'bg-gray-100 border-gray-300',
      'Niños': 'bg-purple-100 border-purple-300',
      'Ministerios': 'bg-green-100 border-green-300',
      'Especial': 'bg-yellow-100 border-yellow-300',
    };
    return colores[tipo] || 'bg-gray-100 border-gray-300';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-navy">Gestionar Cajas</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ nombre: '', tipo: 'General', responsable: '', descripcion: '' });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Caja
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="bg-navy text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingId ? 'Editar Caja' : 'Nueva Caja'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-navy-dark rounded"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Caja de Jóvenes"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="input-field"
                >
                  {TIPOS_CAJA.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Responsable</label>
                <input
                  type="text"
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  className="input-field"
                  placeholder="Nombre del responsable"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="input-field"
                  placeholder="Notas adicionales..."
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cajas.map((caja) => (
          <div
            key={caja.id}
            className={`card border-2 ${getColorPorTipo(caja.tipo)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Wallet size={24} className="text-navy" />
                <div>
                  <h3 className="text-lg font-bold text-navy">{caja.nombre}</h3>
                  <p className="text-xs text-gray-600">{caja.tipo}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(caja)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <Edit2 size={18} className="text-navy" />
                </button>
                <button
                  onClick={() => handleDelete(caja.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 size={18} className="text-accent-red" />
                </button>
              </div>
            </div>

            {caja.responsable && (
              <p className="text-sm text-gray-700 mb-3">
                <span className="font-semibold">Responsable:</span> {caja.responsable}
              </p>
            )}

            {caja.descripcion && (
              <p className="text-sm text-gray-600">{caja.descripcion}</p>
            )}
          </div>
        ))}
      </div>

      {cajas.length === 0 && (
        <div className="text-center py-12">
          <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">No hay cajas registradas</p>
        </div>
      )}
    </div>
  );
}
