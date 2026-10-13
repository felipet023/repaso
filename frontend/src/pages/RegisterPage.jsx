import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, UserPlus } from 'lucide-react';
import ErrorBox from '../components/ErrorBox';
import { isEmail, passwordErrors, required } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { register, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmarPassword: '' });
  const [errores, setErrores] = useState({});
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  function change(event) {
    const { name, value } = event.target;
    setForm((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: '' }));
  }

  function validar() {
    const e = {};
    if (!required(form.nombre)) e.nombre = 'El nombre es obligatorio';
    if (!isEmail(form.email)) e.email = 'El correo electrónico es inválido';
    const passErrors = passwordErrors(form.password);
    if (passErrors.length) e.password = `Debe tener: ${passErrors.join(', ')}`;
    if (form.password !== form.confirmarPassword) e.confirmarPassword = 'Las contraseñas no coinciden';
    if (!aceptoTerminos) e.terminos = 'Debes aceptar los términos y condiciones';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!validar()) return;
    setEnviando(true);
    try {
      // El backend devuelve token: el registro deja la sesión iniciada
      await register({
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        confirmarPassword: form.confirmarPassword
      });
      navigate(isAdmin ? '/admin' : '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (isAuthenticated) return null;

  const pistaPassword = passwordErrors(form.password);

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>TUKI <span>BIKES</span></h1>
        <h2>Crear cuenta</h2>

        {error && <ErrorBox message={error} />}

        <div className="field field-plain">
          <input name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={change} autoComplete="name" required />
          {errores.nombre && <span className="field-error">{errores.nombre}</span>}
        </div>
        <div className="field field-plain">
          <input name="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={change} autoComplete="email" required />
          {errores.email && <span className="field-error">{errores.email}</span>}
        </div>
        <div className="field">
          <Lock size={16} />
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={form.password}
            onChange={change}
            autoComplete="new-password"
            className="has-toggle"
            required
          />
          <button type="button" className="toggle-visibility" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <ul className="password-hints">
          <li className={pistaPassword.length === 0 || form.password.length >= 8 ? 'ok' : ''}>8+ caracteres</li>
          <li className={/[a-z]/.test(form.password) ? 'ok' : ''}>minúscula</li>
          <li className={/[A-Z]/.test(form.password) ? 'ok' : ''}>mayúscula</li>
          <li className={/\d/.test(form.password) ? 'ok' : ''}>número</li>
          <li className={/[^A-Za-z0-9]/.test(form.password) ? 'ok' : ''}>carácter especial</li>
        </ul>
        {errores.password && <span className="field-error">{errores.password}</span>}

        <div className="field">
          <Lock size={16} />
          <input name="confirmarPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirmar contraseña" value={form.confirmarPassword} onChange={change} autoComplete="new-password" required />
        </div>
        {errores.confirmarPassword && <span className="field-error">{errores.confirmarPassword}</span>}

        <label className="terms-check">
          <input
            type="checkbox"
            name="aceptoTerminos"
            checked={aceptoTerminos}
            onChange={(event) => {
              setAceptoTerminos(event.target.checked);
              setErrores((actual) => ({ ...actual, terminos: '' }));
            }}
          />
          <span>
            Acepto los <Link to="/terminos" target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>Términos y Condiciones</Link> de la página web
          </span>
        </label>
        {errores.terminos && <span className="field-error">{errores.terminos}</span>}

        <button type="submit" className="btn-primary" disabled={enviando}>
          <UserPlus size={16} /> {enviando ? 'Creando cuenta…' : 'Registrarme'}
        </button>

        <p className="auth-links">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
        <small className="footer-note">Laboratorio de aprendizaje — datos simulados</small>
      </form>
    </main>
  );
}
