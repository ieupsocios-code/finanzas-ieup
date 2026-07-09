import { useState, useEffect } from 'react';
import { supabase, offlineQueue } from '../services/supabaseClient';
import { Plus, X, Edit2, Trash2, MapPin } from 'lucide-react';

export default function Templos() {
  const [templos, setTemplos] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', ubicacion: '', telefono: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplos();
  }, []);

  const loadTemplos = async () => {
    try {
      const { data } = await supabase.from('templos').select('*');
      setTemplos(data || []);
    } catch (error) {
      console.error('Error loading templos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('templos')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase.from('templos').insert([formData]);
        if (error) throw error;
      }

      setFormData({ nombre: '', ubicacion: '', telefono: '' });
      setShowModal(false);
      loadTemplos();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro?')) return;
    try {
      await supabase.from('templos').delete().eq('id', id);
      loadTemplos();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (templo) => {
    setFormData({
      nombre: templo.nombre,
      ubicacion: templo.ubicacion,
      telefono: templo.telefono,
    });
    setEditingId(templo.id);
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-navy">Gestionar Templos</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ nombre: '', ubicacion: '', telefono: '' });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Templo
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="bg-navy text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingId ? 'Editar Templo' : 'Nuevo Templo'}
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
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  <MapPin className="inline mr-2" size={18} />
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="input-field"
                  placeholder="Dirección"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="input-field"
                  placeholder="+54 2984..."
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
        {templos.map((templo) => (
          <div key={templo.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-navy">{templo.nombre}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(templo)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 size={18} className="text-navy" />
                </button>
                <button
                  onClick={() => handleDelete(templo.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 size={18} className="text-accent-red" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              {templo.ubicacion && (
                <p>
                  <MapPin className="inline mr-2" size={16} />
                  {templo.ubicacion}
                </p>
              )}
              {templo.telefono && <p>📱 {templo.telefono}</p>}
            </div>
          </div>
        ))}
      </div>

      {templos.length === 0 && (
        <div className="text-center py-12">
          <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">No hay templos registrados</p>
        </div>
      )}
    </div>
  );
}
