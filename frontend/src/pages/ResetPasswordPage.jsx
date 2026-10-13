import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Lock } from 'lucide-react';
import * as authService from '../services/auth.service';
import ErrorBox from '../components/ErrorBox';
import { passwordErrors, required } from '../utils/validators';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenInicial = searchParams.get('token') || '';

  const [form, setForm] = useState({ token: tokenInicial, password: '', confirmarPassword: '' });
  const [errores, setErrores] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  function change(event) {
    const { name, value } = event.target;
    setForm((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: '' }));
  }

  function validar() {
    const e = {};
    if (!required(form.token)) e.token = 'El token es obligatorio';
    const passErrors = passwordErrors(form.password);
    if (passErrors.length) e.password = `Debe tener: ${passErrors.join(', ')}`;
    if (form.password !== form.confirmarPassword) e.confirmarPassword = 'Las contraseñas no coinciden';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setExito('');
    if (!validar()) return;
    setEnviando(true);
    try {
      const res = await authService.resetPassword({ token: form.token, password: form.password });
      setExito(res.message);
      setForm({ token: '', password: '', confirmarPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <div className="auth-logo"><KeyRound size={26} /></div>
        <h1>TUKI <span>BIKES</span></h1>
        <h2>Restablecer contraseña</h2>

        {error && <ErrorBox message={error} />}
        {exito && (
          <>
            <p className="success-box">{exito}</p>
            <Link to="/login" className="btn-primary">Iniciar sesión</Link>
          </>
        )}

        <div className="field field-plain">
          <input name="token" placeholder="Token de recuperación" value={form.token} onChange={change} disabled={Boolean(exito)} />
          {errores.token && <span className="field-error">{errores.token}</span>}
        </div>

        <div className="field">
          <Lock size={16} />
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Nueva contraseña"
            value={form.password}
            onChange={change}
            autoComplete="new-password"
            className="has-toggle"
            disabled={Boolean(exito)}
          />
          <button type="button" className="toggle-visibility" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errores.password && <span className="field-error">{errores.password}</span>}

        <div className="field">
          <Lock size={16} />
          <input name="confirmarPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirmar nueva contraseña" value={form.confirmarPassword} onChange={change} autoComplete="new-password" disabled={Boolean(exito)} />
        </div>
        {errores.confirmarPassword && <span className="field-error">{errores.confirmarPassword}</span>}

        {!exito && (
          <button type="submit" className="btn-primary" disabled={enviando}>
            {enviando ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        )}

        <p className="auth-links"><Link to="/login">Volver a iniciar sesión</Link></p>
      </form>
    </main>
  );
}
