import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Download, Plus, Settings, Edit2, Trash2, X } from 'lucide-react';
import Papa from 'papaparse';

export default function Ingresos() {
  const [ingresos, setIngresos] = useState([]);
  const [conceptos, setConceptos] = useState([]);
  const [templos, setTemplos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newConcept, setNewConcept] = useState('');
  const [formData, setFormData] = useState({
    monto: '',
    concepto: '',
    templo: '',
    tipo: 'efectivo',
    detalle: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: ing } = await supabase.from('movimientos').select('*').eq('tipo', 'ingreso');
    setIngresos(ing || []);

    const { data: temp } = await supabase.from('templos').select('*');
    setTemplos(temp || []);

    const { data: conceptosData } = await supabase.from('conceptos').select('*');
    setConceptos(conceptosData || []);
  };

  const handleAddConcept = async () => {
    if (!newConcept) return;
    
    await supabase.from('conceptos').insert({
      nombre: newConcept,
      tipo: 'ingreso'
    });
    
    setNewConcept('');
    loadData();
  };

  const handleAddIngreso = async (e) => {
    e.preventDefault();
    
    if (editingId) {
      await supabase.from('movimientos').update({
        monto: parseFloat(formData.monto),
        concepto: formData.concepto,
        templo_id: formData.templo,
        tipo_ingreso: formData.tipo,
        detalle: formData.detalle,
        fecha: formData.fecha
      }).eq('id', editingId);
      
      setEditingId(null);
    } else {
      await supabase.from('movimientos').insert({
        monto: parseFloat(formData.monto),
        concepto: formData.concepto,
        templo_id: formData.templo,
        tipo_ingreso: formData.tipo,
        detalle: formData.detalle,
        tipo: 'ingreso',
        fecha: formData.fecha
      });
    }
    
    setFormData({ monto: '', concepto: '', templo: '', tipo: 'efectivo', detalle: '', fecha: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    loadData();
  };

  const handleEditIngreso = (ingreso) => {
    setFormData({
      monto: ingreso.monto,
      concepto: ingreso.concepto,
      templo: ingreso.templo_id || '',
      tipo: ingreso.tipo_ingreso || 'efectivo',
      detalle: ingreso.detalle || '',
      fecha: ingreso.fecha.split('T')[0]
    });
    setEditingId(ingreso.id);
    setShowForm(true);
  };

  const handleDeleteIngreso = async (id) => {
    if (confirm('¿Eliminar este ingreso? La acción quedará registrada en auditoría.')) {
      await supabase.from('movimientos').delete().eq('id', id);
      loadData();
    }
  };

  const handleExportCSV = () => {
    const data = ingresos.map(ing => ({
      Fecha: new Date(ing.fecha).toLocaleDateString('es-ES'),
      Concepto: ing.concepto,
      Monto: ing.monto,
      Tipo: ing.tipo_ingreso === 'efectivo' ? 'Efectivo' : ing.tipo_ingreso === 'deposito' ? 'Depósito' : 'Extracción',
      Detalle: ing.detalle || '—',
      Templo: ing.templo_id || '—'
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ingresos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-navy mb-2">Ingresos</h1>
          <p className="text-gray-600">Registro y gestión de ingresos</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={20} />
            Exportar CSV
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings size={20} />
            Conceptos
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) setEditingId(null);
              setFormData({ monto: '', concepto: '', templo: '', tipo: 'efectivo', detalle: '', fecha: new Date().toISOString().split('T')[0] });
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            {editingId ? 'Cancelar' : 'Nuevo Ingreso'}
          </button>
        </div>
      </div>

      {/* Panel de configuración de conceptos */}
      {showSettings && (
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <h2 className="text-xl font-bold text-navy mb-4">Administrar Conceptos de Ingresos</h2>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nuevo concepto"
                value={newConcept}
                onChange={(e) => setNewConcept(e.target.value)}
                className="input-field flex-1"
              />
              <button onClick={handleAddConcept} className="btn-primary">
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {conceptos.filter(c => c.tipo === 'ingreso').map((c) => (
                <span key={c.id} className="bg-blue-200 text-blue-800 px-3 py-1 rounded">
                  {c.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Formulario para nuevo ingreso */}
      {showForm && (
        <form onSubmit={handleAddIngreso} className="card bg-green-50 border-l-4 border-green-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-navy">{editingId ? 'Editar Ingreso' : 'Registrar Nuevo Ingreso'}</h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Monto"
              value={formData.monto}
              onChange={(e) => setFormData({...formData, monto: e.target.value})}
              className="input-field"
              required
            />
            <select
              value={formData.concepto}
              onChange={(e) => setFormData({...formData, concepto: e.target.value})}
              className="input-field"
              required
            >
              <option value="">Selecciona concepto</option>
              {conceptos.filter(c => c.tipo === 'ingreso').map((c) => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
            <select
              value={formData.templo}
              onChange={(e) => setFormData({...formData, templo: e.target.value})}
              className="input-field"
            >
              <option value="">Selecciona templo (opcional)</option>
              {templos.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              className="input-field"
              required
            >
              <option value="efectivo">💵 Efectivo</option>
              <option value="deposito">🏦 Depósito Bancario</option>
              <option value="extraccion">💸 Extracción Bancaria</option>
            </select>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Detalle/Observación (opcional)"
              value={formData.detalle}
              onChange={(e) => setFormData({...formData, detalle: e.target.value})}
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary mt-4">
            {editingId ? 'Actualizar Ingreso' : 'Guardar Ingreso'}
          </button>
        </form>
      )}

      {/* Tabla de ingresos */}
      <div className="card">
        <h2 className="text-xl font-bold text-navy mb-4">Últimos Ingresos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gold">
                <th className="text-left p-3 text-navy font-bold text-sm">Fecha</th>
                <th className="text-left p-3 text-navy font-bold text-sm">Concepto</th>
                <th className="text-left p-3 text-navy font-bold text-sm">Monto</th>
                <th className="text-left p-3 text-navy font-bold text-sm">Tipo</th>
                <th className="text-left p-3 text-navy font-bold text-sm">Detalle</th>
                <th className="text-left p-3 text-navy font-bold text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ingresos.length > 0 ? (
                ingresos.slice(0, 50).map((ing, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">{new Date(ing.fecha).toLocaleDateString('es-ES')}</td>
                    <td className="p-3 font-medium text-sm">{ing.concepto}</td>
                    <td className="p-3 font-bold text-green-600">${ing.monto?.toLocaleString()}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        ing.tipo_ingreso === 'efectivo' ? 'bg-green-100 text-green-800' :
                        ing.tipo_ingreso === 'deposito' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ing.tipo_ingreso === 'efectivo' ? '💵 Efectivo' :
                         ing.tipo_ingreso === 'deposito' ? '🏦 Depósito' :
                         '💸 Extracción'}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{ing.detalle || '—'}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleEditIngreso(ing)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteIngreso(ing.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No hay ingresos registrados
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
