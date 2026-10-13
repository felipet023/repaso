import { useState } from 'react';
import { Send } from 'lucide-react';
import * as contactService from '../services/contact.service';
import ErrorBox from '../components/ErrorBox';
import { isEmail, required } from '../utils/validators';

export default function ContactPage() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [errores, setErrores] = useState({});
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
    if (!required(form.nombre)) e.nombre = 'El nombre es obligatorio';
    if (!isEmail(form.email)) e.email = 'El correo electrónico es inválido';
    if (form.mensaje.trim().length < 10) e.mensaje = 'El mensaje debe tener al menos 10 caracteres';
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
      await contactService.sendMessage(form);
      setExito('Mensaje enviado correctamente. Te contactaremos pronto.');
      setForm({ nombre: '', email: '', mensaje: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="page narrow-page">
      <header className="page-header">
        <h1>Contacto</h1>
        <p>¿Dudas, garantías o sugerencias? Escríbenos y respondemos en menos de 24 horas.</p>
      </header>

      {error && <ErrorBox message={error} />}
      {exito && <p className="success-box">{exito}</p>}

      <form onSubmit={submit} className="card form-grid" noValidate>
        <div className="field">
          <label htmlFor="nombre">Nombre *</label>
          <input id="nombre" name="nombre" value={form.nombre} onChange={change} maxLength={100} />
          {errores.nombre && <span className="field-error">{errores.nombre}</span>}
        </div>
        <div className="field">
          <label htmlFor="email">Correo *</label>
          <input id="email" name="email" type="email" value={form.email} onChange={change} />
          {errores.email && <span className="field-error">{errores.email}</span>}
        </div>
        <div className="field">
          <label htmlFor="mensaje">Mensaje *</label>
          <textarea id="mensaje" name="mensaje" rows={5} maxLength={1000} value={form.mensaje} onChange={change} />
          {errores.mensaje && <span className="field-error">{errores.mensaje}</span>}
        </div>
        <div className="actions">
          <button type="submit" className="btn-primary" disabled={enviando}>
            <Send size={16} /> {enviando ? 'Enviando…' : 'Enviar mensaje'}
          </button>
        </div>
      </form>
    </main>
  );
}
