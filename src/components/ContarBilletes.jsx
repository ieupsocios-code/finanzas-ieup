import { useMemo, useState, useEffect } from 'react';
import { Calculator, X, Check } from 'lucide-react';

// Denominaciones argentinas: billetes de mayor a menor + monedas
const DENOMINACIONES = [
  { valor: 20000, tipo: 'billete' },
  { valor: 10000, tipo: 'billete' },
  { valor:  2000, tipo: 'billete' },
  { valor:  1000, tipo: 'billete' },
  { valor:   500, tipo: 'billete' },
  { valor:   200, tipo: 'billete' },
  { valor:   100, tipo: 'billete' },
  { valor:    50, tipo: 'billete' },
  { valor:    20, tipo: 'billete' },
  { valor:    10, tipo: 'moneda' },
  { valor:     5, tipo: 'moneda' },
  { valor:     2, tipo: 'moneda' },
  { valor:     1, tipo: 'moneda' },
];

const fmtValor = (v) => v >= 1000 ? `$${(v / 1000).toLocaleString('es-AR')}k` : `$${v}`;
const fmtMonto = (n) => `$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Modal de arqueo. Al confirmar, llama a onConfirmar(total, descripcion).
 * cantidadesIniciales es un objeto opcional {20000: 3, 1000: 5, ...}
 */
export default function ContarBilletes({ abierto, cantidadesIniciales = {}, onConfirmar, onCerrar }) {
  const [cantidades, setCantidades] = useState({});

  useEffect(() => {
    if (abierto) setCantidades(cantidadesIniciales || {});
  }, [abierto]);

  const setCant = (valor, c) => {
    const n = Math.max(0, parseInt(c || '0', 10) || 0);
    setCantidades((prev) => ({ ...prev, [valor]: n }));
  };

  const filas = useMemo(() => DENOMINACIONES.map(d => ({
    ...d,
    cantidad: cantidades[d.valor] || 0,
    subtotal: d.valor * (cantidades[d.valor] || 0),
  })), [cantidades]);

  const total = useMemo(() => filas.reduce((s, f) => s + f.subtotal, 0), [filas]);

  // Descripción para guardar en el detalle: "5×$20k + 12×$10k = $220.000"
  const descripcion = useMemo(() => {
    const parts = filas
      .filter(f => f.cantidad > 0)
      .map(f => `${f.cantidad}×${fmtValor(f.valor)}`);
    if (parts.length === 0) return '';
    return `Billetes: ${parts.join(' + ')} = ${fmtMonto(total)}`;
  }, [filas, total]);

  const confirmar = () => {
    if (total <= 0) return;
    onConfirmar(total, descripcion);
    onCerrar();
  };

  const limpiar = () => setCantidades({});

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-navy text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator size={22} />
            <h2 className="text-lg font-bold">Contar billetes y monedas</h2>
          </div>
          <button onClick={onCerrar} className="p-1 hover:bg-navy-dark rounded" aria-label="Cerrar">
            <X size={22} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3">
          <p className="text-xs text-gray-600">
            Cargá la cantidad de cada denominación. El total aparece abajo y se pega en el campo Monto al confirmar.
          </p>

          <div className="grid grid-cols-1 gap-2">
            {filas.map((f) => (
              <div
                key={f.valor}
                className={`flex items-center gap-3 p-2 rounded border ${
                  f.cantidad > 0 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="w-20 text-right">
                  <span className={`font-bold ${f.tipo === 'moneda' ? 'text-gray-600 text-sm' : 'text-navy'}`}>
                    {fmtValor(f.valor)}
                  </span>
                  <span className="block text-[10px] uppercase text-gray-400">{f.tipo}</span>
                </div>
                <span className="text-gray-400">×</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={f.cantidad || ''}
                  onChange={(e) => setCant(f.valor, e.target.value)}
                  placeholder="0"
                  className="input-field w-24 text-center"
                />
                <span className="text-gray-400">=</span>
                <span className="flex-1 text-right font-mono text-sm">
                  {f.subtotal > 0 ? fmtMonto(f.subtotal) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total y acciones */}
        <div className="border-t bg-gray-50 p-4 space-y-3">
          <div className="flex items-center justify-between text-lg">
            <span className="font-bold text-navy">TOTAL</span>
            <span className={`font-bold ${total > 0 ? 'text-green-700' : 'text-gray-400'}`}>
              {fmtMonto(total)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={confirmar}
              disabled={total <= 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Check size={18} /> Usar {total > 0 ? fmtMonto(total) : 'este total'}
            </button>
            <button onClick={limpiar} className="btn-secondary">Limpiar</button>
            <button onClick={onCerrar} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
