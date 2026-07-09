import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setError('Verifica tu correo para confirmar tu cuenta');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        await onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-dark to-navy-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <img 
              src="/logo-gold.png" 
              alt="IEUP" 
              className="w-24 h-24 mx-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-gold mb-2">Finanzas IEUP</h1>
          <p className="text-cream text-sm">Iglesia Evangélica Unión Pentecostal</p>
        </div>

        {/* Formulario */}
        <div className="card bg-white">
          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className={`p-3 rounded-lg text-sm ${
                error.includes('Verifica') 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                <Mail className="inline mr-2" size={18} />
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="tu@correo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                <Lock className="inline mr-2" size={18} />
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
            </button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-4 text-sm text-navy hover:text-gold font-semibold transition-colors"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        <p className="text-center text-cream text-xs mt-6">
          Acceso seguro con Supabase & Autenticación
        </p>
      </div>
    </div>
  );
}
