import { Link } from 'react-router-dom';
import { Award, Bike, Shield, Wrench } from 'lucide-react';

const VALORES = [
  {
    icono: Bike,
    titulo: 'Selección experta',
    texto: 'Cada bicicleta del catálogo es elegida y probada por ciclistas de nuestro equipo antes de llegar a ti.'
  },
  {
    icono: Wrench,
    titulo: 'Taller certificado',
    texto: 'Mecánicos con años de experiencia en carretera, montaña y e-bikes. Agenda tu cita en línea.'
  },
  {
    icono: Shield,
    titulo: 'Garantía real',
    texto: 'Todos los productos cuentan con garantía del fabricante y soporte postventa en español.'
  },
  {
    icono: Award,
    titulo: 'Comunidad',
    texto: 'Organizamos rodadas semanales para todos los niveles. Porque andar en bici es mejor en grupo.'
  }
];

export default function AboutPage() {
  return (
    <main className="page about-page">
      <header className="page-header hero-mini">
        <h1>Nosotros</h1>
        <p>TUKI BIKES — de un garaje de ciclistas a tu próxima aventura.</p>
      </header>

      <section className="section">
        <div className="about-story">
          <p>
            Todo empezó en 2019, cuando un grupo de amigos arreglaba bicicletas en un garaje del
            barrio. Lo que comenzó como ajustar frenos los fines de semana se convirtió en TUKI BIKES:
            una tienda donde el ciclismo se vive con pasión, respeto por el terrain y cero pretenciosidad.
          </p>
          <p>
            Hoy distribuimos marcas como Cannondale, Specialized, Trek, Canyon y Rad Power, y nuestro
            taller atiende desde un ajuste de urgencia hasta el servicio completo de tu e-bike.
          </p>
          <Link to="/catalogo" className="btn-primary">Explorar el catálogo</Link>
        </div>
      </section>

      <section className="section section-alt">
        <div className="values-grid">
          {VALORES.map((valor) => (
            <div className="value-card" key={valor.titulo}>
              <valor.icono size={28} />
              <h3>{valor.titulo}</h3>
              <p>{valor.texto}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
