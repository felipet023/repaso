import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock } from 'lucide-react';
import * as workshopService from '../services/workshop.service';
import Spinner from '../components/Spinner';
import ErrorBox from '../components/ErrorBox';
import { formatCurrency } from '../utils/format';

export default function WorkshopPage() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    workshopService
      .getWorkshopServices()
      .then((res) => setServicios(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page workshop-page">
      <header className="page-header">
        <h1>Taller</h1>
        <p>Servicio técnico profesional para tu bicicleta. Agenda en línea y rodarás seguro.</p>
      </header>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Spinner label="Cargando servicios…" />
      ) : (
        <div className="services-grid">
          {servicios.map((servicio) => (
            <article className="service-card" key={servicio.id}>
              <h3>{servicio.nombre}</h3>
              <p>{servicio.descripcion}</p>
              <div className="service-meta">
                <span><Clock size={14} /> {servicio.duracion_minutos} min</span>
                <span className="price">desde {formatCurrency(servicio.precio_desde)}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="workshop-cta">
        <h2>¿Listo para rodar seguro?</h2>
        <p>Reserva tu cita en menos de un minuto. Te contactaremos para confirmar el horario.</p>
        <Link to="/taller/agendar" className="btn-primary btn-lg">
          <CalendarCheck size={18} /> Agendar cita
        </Link>
      </section>
    </main>
  );
}
