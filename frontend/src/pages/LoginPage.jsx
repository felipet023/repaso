import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LayoutGrid, Lock, LogIn, Mail } from 'lucide-react';
import * as authService from '../services/auth.service';
import ErrorBox from '../components/ErrorBox';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login, isAuthenticated, isAdmin, loadingSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from || (isAdmin ? '/admin' : '/');

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Si ya hay sesión, redirige según el rol
  useEffect(() => {
    if (!loadingSession && isAuthenticated) navigate(destino, { replace: true });
  }, [loadingSession, isAuthenticated, navigate, destino]);

  function change(event) {
    setForm((actual) => ({ ...actual, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Ingresa tu correo y contraseña');
      return;
    }
    setEnviando(true);
    try {
      await login(form);
      navigate(isAdmin ? '/admin' : '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (isAuthenticated) return null;

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <div className="auth-logo"><LayoutGrid size={26} /></div>
        <h1>TUKI <span>BIKES</span></h1>
        <h2>Inicia sesión para continuar</h2>

        {error && <ErrorBox message={error} />}

        <div className="field">
          <Mail size={16} />
          <input name="email" type="email" placeholder="Correo" value={form.email} onChange={change} autoComplete="username" required />
        </div>
        <div className="field">
          <Lock size={16} />
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={form.password}
            onChange={change}
            autoComplete="current-password"
            className="has-toggle"
            required
          />
          <button type="button" className="toggle-visibility" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <button type="submit" className="btn-primary" disabled={enviando}>
          <LogIn size={16} /> {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>

        <p className="auth-links">
          ¿No tienes cuenta? <Link to="/registro">Registrarte</Link> · <Link to="/recuperar-contrasena">Olvidé mi contraseña</Link>
        </p>
        <small className="footer-note">Laboratorio de aprendizaje — usuarios y pagos simulados</small>
      </form>
    </main>
  );
}
