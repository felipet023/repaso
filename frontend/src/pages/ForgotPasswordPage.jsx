import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound } from 'lucide-react';
import * as authService from '../services/auth.service';
import ErrorBox from '../components/ErrorBox';
import { isEmail } from '../utils/validators';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [token, setToken] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setExito('');
    setToken('');
    if (!isEmail(email)) {
      setError('Ingresa un correo electrónico válido');
      return;
    }
    setEnviando(true);
    try {
      // En una app real el token llega por email; aquí se devuelve para la demo
      const res = await authService.forgotPassword(email);
      setExito(res.message);
      if (res.token) setToken(res.token);
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
        <h2>Recuperar contraseña</h2>

        {error && <ErrorBox message={error} />}
        {exito && <p className="success-box">{exito}</p>}

        <div className="field">
          <Mail size={16} />
          <input type="email" placeholder="Correo electrónico" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        </div>

        <button type="submit" className="btn-primary" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar enlace de recuperación'}
        </button>

        {token && (
          <div className="token-box">
            <p>Token de recuperación (demo — en producción llega por correo):</p>
            <code>{token}</code>
            <Link to={`/restablecer-contrasena?token=${encodeURIComponent(token)}`} className="btn-secondary btn-sm">
              Restablecer ahora
            </Link>
          </div>
        )}

        <p className="auth-links"><Link to="/login">Volver a iniciar sesión</Link></p>
      </form>
    </main>
  );
}
