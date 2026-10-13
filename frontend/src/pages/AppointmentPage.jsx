import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';
import * as workshopService from '../services/workshop.service';
import ErrorBox from '../components/ErrorBox';
import { isEmail, required } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';

const TIPOS_BICICLETA = ['Carretera', 'Montaña', 'E-bike', 'Urbana', 'Plegable'];
const HORAS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AppointmentPage() {
  const { user } = useAuth();
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState({
    id_servicio: '',
    tipo_bicicleta: '',
    telefono: '',
    fecha: hoyISO(),
    hora: '',
    nombre: user?.nombre || '',
    email: user?.email || '',
    descripcion: ''
  });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [cita, setCita] = useState(null);

  useEffect(() => {
    workshopService.getWorkshopServices().then((res) => setServicios(res.data)).catch(() => {});
  }, []);

  function change(event) {
    const { name, value } = event.target;
    setForm((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: '' }));
  }

  function validar() {
    const e = {};
    if (!form.id_servicio) e.id_servicio = 'Selecciona un servicio';
    if (!form.tipo_bicicleta) e.tipo_bicicleta = 'Selecciona el tipo de bicicleta';
    if (!required(form.telefono)) e.telefono = 'El teléfono es obligatorio';
    if (!form.fecha || form.fecha < hoyISO()) e.fecha = 'La fecha no puede ser anterior a hoy';
    if (!form.hora) e.hora = 'Selecciona una hora';
    if (!required(form.nombre)) e.nombre = 'El nombre es obligatorio';
    if (!isEmail(form.email)) e.email = 'El correo electrónico es inválido';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!validar()) return;
    setEnviando(true);
    try {
      const res = await workshopService.createAppointment(form);
      setCita(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (cita) {
    return (
      <main className="page narrow-page">
        <div className="card success-card">
          <CalendarCheck size={44} className="success-icon" />
          <h1>Cita registrada</h1>
          <p>Gracias, <strong>{cita.nombre}</strong>. Tu solicitud quedó así:</p>
          <dl className="cita-resumen">
            <div><dt>Servicio</dt><dd>{cita.servicio}</dd></div>
            <div><dt>Fecha</dt><dd>{cita.fecha} · {cita.hora}</dd></div>
            <div><dt>Bicicleta</dt><dd>{cita.tipo_bicicleta}</dd></div>
            <div><dt>Estado</dt><dd><span className="badge-pending">{cita.estado}</span></dd></div>
          </dl>
          <p className="muted">Te contactaremos por teléfono para confirmar. Recuerda que puedes consultar tus citas en la sección Taller.</p>
          <Link to="/taller" className="btn-primary">Volver al taller</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page narrow-page">
      <header className="page-header">
        <h1>Agendar cita de taller</h1>
        <p>Elige servicio, fecha y hora. Horario de atención: 08:00 a 18:00.</p>
      </header>

      {error && <ErrorBox message={error} />}

      <form onSubmit={submit} className="card form-grid" noValidate>
        <div className="field">
          <label htmlFor="id_servicio">Servicio *</label>
          <select id="id_servicio" name="id_servicio" value={form.id_servicio} onChange={change}>
            <option value="">Selecciona un servicio</option>
            {servicios.map((servicio) => (
              <option key={servicio.id} value={servicio.id}>
                {servicio.nombre} — {servicio.duracion_minutos} min — desde {formatCurrency(servicio.precio_desde)}
              </option>
            ))}
          </select>
          {errores.id_servicio && <span className="field-error">{errores.id_servicio}</span>}
        </div>

        <div className="field">
          <label htmlFor="tipo_bicicleta">Tipo de bicicleta *</label>
          <select id="tipo_bicicleta" name="tipo_bicicleta" value={form.tipo_bicicleta} onChange={change}>
            <option value="">Selecciona</option>
            {TIPOS_BICICLETA.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
          {errores.tipo_bicicleta && <span className="field-error">{errores.tipo_bicicleta}</span>}
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="telefono">Teléfono *</label>
            <input id="telefono" name="telefono" value={form.telefono} onChange={change} placeholder="+57 300 123 4567" />
            {errores.telefono && <span className="field-error">{errores.telefono}</span>}
          </div>
          <div className="field">
            <label htmlFor="fecha">Fecha *</label>
            <input id="fecha" name="fecha" type="date" min={hoyISO()} value={form.fecha} onChange={change} />
            {errores.fecha && <span className="field-error">{errores.fecha}</span>}
          </div>
        </div>

        <div className="field">
          <label htmlFor="hora">Hora *</label>
          <select id="hora" name="hora" value={form.hora} onChange={change}>
            <option value="">Selecciona una hora</option>
            {HORAS.map((hora) => <option key={hora} value={hora}>{hora}</option>)}
          </select>
          {errores.hora && <span className="field-error">{errores.hora}</span>}
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="nombre">Nombre *</label>
            <input id="nombre" name="nombre" value={form.nombre} onChange={change} />
            {errores.nombre && <span className="field-error">{errores.nombre}</span>}
          </div>
          <div className="field">
            <label htmlFor="email">Correo *</label>
            <input id="email" name="email" type="email" value={form.email} onChange={change} />
            {errores.email && <span className="field-error">{errores.email}</span>}
          </div>
        </div>

        <div className="field">
          <label htmlFor="descripcion">Descripción del problema</label>
          <textarea id="descripcion" name="descripcion" rows={3} maxLength={500} value={form.descripcion} onChange={change} placeholder="Ej.: la cadena salta al cambiar de piñón…" />
        </div>

        <div className="actions">
          <button type="submit" className="btn-primary" disabled={enviando}>
            <CalendarCheck size={16} /> {enviando ? 'Reservando…' : 'Reservar cita'}
          </button>
        </div>
      </form>
    </main>
  );
}
