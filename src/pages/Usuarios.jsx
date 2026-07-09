import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Plus, X, Edit2, Trash2, Users } from 'lucide-react';

const ROLES_DISPONIBLES = [
  { id: 'admin', nombre: 'Administrador', descripcion: 'Control total del sistema' },
  { id: 'cobrador', nombre: 'Cobrador', descripcion: 'Registra ingresos y egresos' },
  { id: 'consulta', nombre: 'Consulta', descripcion: 'Solo lectura de reportes' },
  { id: 'auditor', nombre: 'Auditor', descripcion: 'Revisa y audita movimientos' },
];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    rol: 'consulta',
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });
      setUsuarios(data || []);
    } catch (error) {
      console.error('Error loading usuarios:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('usuarios')
          .update({ rol: formData.rol })
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        // Para crear usuario, se debe hacer vía Auth de Supabase
        alert('Los usuarios se crean a través del sistema de autenticación');
      }

      setFormData({ email: '', rol: 'consulta' });
      setShowModal(false);
      loadUsuarios();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    try {
      await supabase.from('usuarios').delete().eq('id', id);
      loadUsuarios();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (usuario) => {
    setFormData({
      email: usuario.email,
      rol: usuario.rol,
    });
    setEditingId(usuario.id);
    setShowModal(true);
  };

  const getRoleColor = (rol) => {
    const colores = {
      admin: 'bg-red-100 text-red-800',
      cobrador: 'bg-blue-100 text-blue-800',
      consulta: 'bg-gray-100 text-gray-800',
      auditor: 'bg-purple-100 text-purple-800',
    };
    return colores[rol] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-navy">Gestionar Usuarios</h1>
        <button
          onClick={() => alert('Para crear nuevos usuarios, ve a Autenticación en Supabase')}
          className="btn-primary flex items-center gap-2"
          disabled
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* Información sobre Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES_DISPONIBLES.map((role) => (
          <div key={role.id} className="card">
            <h3 className="font-bold text-navy mb-2">{role.nombre}</h3>
            <p className="text-sm text-gray-600">{role.descripcion}</p>
          </div>
        ))}
      </div>

      {/* Modal para editar rol */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="bg-navy text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Cambiar Rol</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-navy-dark rounded"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="input-field bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Rol</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  className="input-field"
                >
                  {ROLES_DISPONIBLES.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nombre}
                    </option>
                  ))}
                </select>
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

      {/* Tabla de usuarios */}
      <div className="card">
        <h2 className="text-xl font-bold text-navy mb-4">Usuarios del Sistema</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Creado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{usuario.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(usuario.rol)}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(usuario.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} className="text-navy" />
                      </button>
                      <button
                        onClick={() => handleDelete(usuario.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-accent-red" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-navy mb-3">Para agregar nuevos usuarios:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Ve al panel de Supabase</li>
          <li>En Authentication, crea un nuevo usuario con correo y contraseña</li>
          <li>El usuario aparecerá automáticamente en esta lista con rol "consulta"</li>
          <li>Puedes editar su rol desde aquí</li>
        </ol>
      </div>
    </div>
  );
}
