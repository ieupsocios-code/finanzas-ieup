import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Download, Plus, Settings } from 'lucide-react';
import Papa from 'papaparse';

export default function Egresos() {
  const [egresos, setEgresos] = useState([]);
  const [conceptos, setConceptos] = useState([]);
  const [centrosCostos, setCentrosCostos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newConcept, setNewConcept] = useState('');
  const [formData, setFormData] = useState({
    monto: '',
    concepto: '',
    centro_costos: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: egr } = await supabase.from('movimientos').select('*').eq('tipo', 'egreso');
    setEgresos(egr || []);

    const { data: conceptosData } = await supabase.from('conceptos').select('*').eq('tipo', 'egreso');
    setConceptos(conceptosData || []);

    const { data: centers } = await supabase.from('centro_costos').select('*');
    setCentrosCostos(centers || []);
  };

  const handleExportCSV = () => {
    const data = egresos.map(e => ({
      Fecha: new Date(e.fecha).toLocaleDateString('es-ES'),
      Concepto: e.concepto,
      Monto: e.monto,
      CentroCostos: e.centro_costos || '—'
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `egresos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleAddConcept = async () => {
    if (!newConcept) return;
    
    await supabase.from('conceptos').insert({
      nombre: newConcept,
      tipo: 'egreso'
    });
    
    setNewConcept('');
    loadData();
  };

  const handleAddEgreso = async (e) => {
    e.preventDefault();
    
    await supabase.from('movimientos').insert({
      monto: parseFloat(formData.monto),
      concepto: formData.concepto,
      centro_costos: formData.centro_costos,
      tipo: 'egreso',
      fecha: formData.fecha
    });
    
    setFormData({ monto: '', concepto: '', centro_costos: '', fecha: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-navy mb-2">Egresos</h1>
          <p className="text-gray-600">Registro y gestión de egresos</p>
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
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Egreso
          </button>
        </div>
      </div>

      {/* Panel de configuración de conceptos */}
      {showSettings && (
        <div className="card bg-red-50 border-l-4 border-red-500">
          <h2 className="text-xl font-bold text-navy mb-4">Administrar Conceptos de Egresos</h2>
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
              {conceptos.filter(c => c.tipo === 'egreso').map((c) => (
                <span key={c.id} className="bg-red-200 text-red-800 px-3 py-1 rounded">
                  {c.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Formulario para nuevo egreso */}
      {showForm && (
        <form onSubmit={handleAddEgreso} className="card bg-red-50 border-l-4 border-red-500">
          <h2 className="text-xl font-bold text-navy mb-4">Registrar Nuevo Egreso</h2>
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
              {conceptos.filter(c => c.tipo === 'egreso').map((c) => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
            <select
              value={formData.centro_costos}
              onChange={(e) => setFormData({...formData, centro_costos: e.target.value})}
              className="input-field"
            >
              <option value="">Selecciona centro de costos</option>
              {centrosCostos.map((c) => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary mt-4">Guardar Egreso</button>
        </form>
      )}

      {/* Tabla de egresos */}
      <div className="card">
        <h2 className="text-xl font-bold text-navy mb-4">Últimos Egresos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gold">
                <th className="text-left p-3 text-navy font-bold">Fecha</th>
                <th className="text-left p-3 text-navy font-bold">Concepto</th>
                <th className="text-left p-3 text-navy font-bold">Monto</th>
                <th className="text-left p-3 text-navy font-bold">Centro de Costos</th>
              </tr>
            </thead>
            <tbody>
              {egresos.length > 0 ? (
                egresos.slice(0, 20).map((egr, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(egr.fecha).toLocaleDateString('es-ES')}</td>
                    <td className="p-3 font-medium">{egr.concepto}</td>
                    <td className="p-3 font-bold text-red-600">${egr.monto?.toLocaleString()}</td>
                    <td className="p-3">{egr.centro_costos || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    No hay egresos registrados
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
