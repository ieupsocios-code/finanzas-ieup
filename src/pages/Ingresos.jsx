import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Download, Plus, Settings } from 'lucide-react';
import Papa from 'papaparse';

export default function Ingresos() {
  const [ingresos, setIngresos] = useState([]);
  const [conceptos, setConceptos] = useState([]);
  const [templos, setTemplos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newConcept, setNewConcept] = useState('');
  const [formData, setFormData] = useState({
    monto: '',
    concepto: '',
    templo: '',
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

  const handleImportGoogleSheet = async () => {
    const sheetUrl = prompt('Pega la URL del CSV de tu Google Sheet:\n(File > Export > CSV)');
    if (!sheetUrl) return;

    try {
      const response = await fetch(sheetUrl);
      const csv = await response.text();
      
      Papa.parse(csv, {
        header: true,
        complete: async (results) => {
          for (const row of results.data) {
            if (row.monto && row.concepto) {
              await supabase.from('movimientos').insert({
                monto: parseFloat(row.monto),
                concepto: row.concepto,
                templo_id: row.templo_id,
                tipo: 'ingreso',
                fecha: row.fecha || new Date().toISOString()
              });
            }
          }
          alert('✅ Movimientos importados correctamente');
          loadData();
        }
      });
    } catch (error) {
      alert('❌ Error importando: ' + error.message);
    }
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
    
    await supabase.from('movimientos').insert({
      monto: parseFloat(formData.monto),
      concepto: formData.concepto,
      templo_id: formData.templo,
      tipo: 'ingreso',
      fecha: formData.fecha
    });
    
    setFormData({ monto: '', concepto: '', templo: '', fecha: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    loadData();
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
            onClick={handleImportGoogleSheet}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={20} />
            Importar Google Sheet
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings size={20} />
            Conceptos
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Ingreso
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
          <h2 className="text-xl font-bold text-navy mb-4">Registrar Nuevo Ingreso</h2>
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
              <option value="">Selecciona templo</option>
              {templos.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary mt-4">Guardar Ingreso</button>
        </form>
      )}

      {/* Tabla de ingresos */}
      <div className="card">
        <h2 className="text-xl font-bold text-navy mb-4">Últimos Ingresos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gold">
                <th className="text-left p-3 text-navy font-bold">Fecha</th>
                <th className="text-left p-3 text-navy font-bold">Concepto</th>
                <th className="text-left p-3 text-navy font-bold">Monto</th>
                <th className="text-left p-3 text-navy font-bold">Templo</th>
              </tr>
            </thead>
            <tbody>
              {ingresos.length > 0 ? (
                ingresos.slice(0, 20).map((ing, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(ing.fecha).toLocaleDateString('es-ES')}</td>
                    <td className="p-3 font-medium">{ing.concepto}</td>
                    <td className="p-3 font-bold text-green-600">${ing.monto?.toLocaleString()}</td>
                    <td className="p-3">{ing.templo_id || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
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
