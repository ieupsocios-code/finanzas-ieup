import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function Configuracion() {
  const [centrosCostos, setCentrosCostos] = useState([]);
  const [conceptos, setConceptos] = useState([]);
  const [tiposIngresos, setTiposIngresos] = useState([]);
  const [templos, setTemplos] = useState([]);
  const [cajas, setCajas] = useState([]);
  
  const [newCenter, setNewCenter] = useState('');
  const [newConcept, setNewConcept] = useState('');
  const [newType, setNewType] = useState('');
  const [newTemplo, setNewTemplo] = useState('');
  const [newCaja, setNewCaja] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadConfigData();
  }, []);

  const loadConfigData = async () => {
    const { data: centers } = await supabase.from('centro_costos').select('*');
    setCentrosCostos(centers || []);

    const { data: conceptosData } = await supabase.from('conceptos').select('*');
    setConceptos(conceptosData || []);

    const { data: types } = await supabase.from('tipos_ingresos').select('*');
    setTiposIngresos(types || []);

    const { data: templosData } = await supabase.from('templos').select('*');
    setTemplos(templosData || []);

    const { data: cajasData } = await supabase.from('cajas').select('*');
    setCajas(cajasData || []);
  };

  // Centro de Costos
  const handleAddCenter = async () => {
    if (!newCenter.trim()) return;
    if (editingId) {
      await supabase.from('centro_costos').update({ nombre: newCenter }).eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('centro_costos').insert({ nombre: newCenter });
    }
    setNewCenter('');
    loadConfigData();
  };

  const handleDeleteCenter = async (id) => {
    if (confirm('¿Eliminar centro de costos?')) {
      await supabase.from('centro_costos').delete().eq('id', id);
      loadConfigData();
    }
  };

  // Conceptos
  const handleAddConcept = async () => {
    if (!newConcept.trim()) return;
    await supabase.from('conceptos').insert({ nombre: newConcept, tipo: 'ingreso' });
    setNewConcept('');
    loadConfigData();
  };

  const handleDeleteConcept = async (id) => {
    if (confirm('¿Eliminar concepto?')) {
      await supabase.from('conceptos').delete().eq('id', id);
      loadConfigData();
    }
  };

  // Tipos de Ingresos
  const handleAddType = async () => {
    if (!newType.trim()) return;
    await supabase.from('tipos_ingresos').insert({ nombre: newType });
    setNewType('');
    loadConfigData();
  };

  const handleDeleteType = async (id) => {
    if (confirm('¿Eliminar tipo de ingreso?')) {
      await supabase.from('tipos_ingresos').delete().eq('id', id);
      loadConfigData();
    }
  };

  // Templos
  const handleAddTemplo = async () => {
    if (!newTemplo.trim()) return;
    await supabase.from('templos').insert({ nombre: newTemplo, ubicacion: '' });
    setNewTemplo('');
    loadConfigData();
  };

  const handleDeleteTemplo = async (id) => {
    if (confirm('¿Eliminar templo?')) {
      await supabase.from('templos').delete().eq('id', id);
      loadConfigData();
    }
  };

  // Cajas
  const handleAddCaja = async () => {
    if (!newCaja.trim()) return;
    await supabase.from('cajas').insert({ nombre: newCaja });
    setNewCaja('');
    loadConfigData();
  };

  const handleDeleteCaja = async (id) => {
    if (confirm('¿Eliminar caja?')) {
      await supabase.from('cajas').delete().eq('id', id);
      loadConfigData();
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-navy">Configuración del Sistema</h1>

      {/* Centro de Costos */}
      <div className="card border-l-4 border-navy">
        <h2 className="text-2xl font-bold text-navy mb-4">Centro de Costos</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Nuevo centro de costos"
            value={newCenter}
            onChange={(e) => setNewCenter(e.target.value)}
            className="input-field flex-1"
          />
          <button onClick={handleAddCenter} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            {editingId ? 'Actualizar' : 'Agregar'}
          </button>
          {editingId && (
            <button onClick={() => { setEditingId(null); setNewCenter(''); }} className="btn-secondary">
              Cancelar
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {centrosCostos.map((center) => (
            <div key={center.id} className="bg-navy/10 p-4 rounded flex justify-between items-center">
              <span className="font-medium">{center.nombre}</span>
              <div className="flex gap-2">
                <button onClick={() => { setNewCenter(center.nombre); setEditingId(center.id); }} className="text-blue-600">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDeleteCenter(center.id)} className="text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conceptos */}
      <div className="card border-l-4 border-green-600">
        <h2 className="text-2xl font-bold text-navy mb-4">Conceptos de Movimientos</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Nuevo concepto"
            value={newConcept}
            onChange={(e) => setNewConcept(e.target.value)}
            className="input-field flex-1"
          />
          <button onClick={handleAddConcept} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Agregar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {conceptos.map((concept) => (
            <div key={concept.id} className="bg-green-50 p-4 rounded flex justify-between items-center">
              <span className="font-medium">{concept.nombre}</span>
              <button onClick={() => handleDeleteConcept(concept.id)} className="text-red-600">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tipos de Ingresos */}
      <div className="card border-l-4 border-oro">
        <h2 className="text-2xl font-bold text-navy mb-4">Tipos de Ingresos</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Nuevo tipo de ingreso"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="input-field flex-1"
          />
          <button onClick={handleAddType} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Agregar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tiposIngresos.map((type) => (
            <div key={type.id} className="bg-oro/10 p-4 rounded flex justify-between items-center">
              <span className="font-medium">{type.nombre}</span>
              <button onClick={() => handleDeleteType(type.id)} className="text-red-600">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Templos */}
      <div className="card border-l-4 border-purple-600">
        <h2 className="text-2xl font-bold text-navy mb-4">Templos</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Nuevo templo"
            value={newTemplo}
            onChange={(e) => setNewTemplo(e.target.value)}
            className="input-field flex-1"
          />
          <button onClick={handleAddTemplo} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Agregar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templos.map((templo) => (
            <div key={templo.id} className="bg-purple-50 p-4 rounded flex justify-between items-center">
              <span className="font-medium">{templo.nombre}</span>
              <button onClick={() => handleDeleteTemplo(templo.id)} className="text-red-600">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cajas */}
      <div className="card border-l-4 border-blue-600">
        <h2 className="text-2xl font-bold text-navy mb-4">Cajas</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Nueva caja"
            value={newCaja}
            onChange={(e) => setNewCaja(e.target.value)}
            className="input-field flex-1"
          />
          <button onClick={handleAddCaja} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Agregar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cajas.map((caja) => (
            <div key={caja.id} className="bg-blue-50 p-4 rounded flex justify-between items-center">
              <span className="font-medium">{caja.nombre}</span>
              <button onClick={() => handleDeleteCaja(caja.id)} className="text-red-600">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
