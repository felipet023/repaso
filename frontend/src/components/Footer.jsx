import { Link } from 'react-router-dom';
import { Bike } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Bike size={22} />
          <strong>TUKI <span>BIKES</span></strong>
          <p>Tu tienda de ciclismo: bicicletas, accesorios y servicio técnico.</p>
        </div>
        <div className="footer-col">
          <h4>Tienda</h4>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/taller">Taller</Link>
          <Link to="/contacto">Contacto</Link>
          <Link to="/nosotros">Nosotros</Link>
        </div>
        <div className="footer-col">
          <h4>Cuenta</h4>
          <Link to="/mi-cuenta">Mi cuenta</Link>
          <Link to="/mis-pedidos">Mis pedidos</Link>
          <Link to="/carrito">Carrito</Link>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <Link to="/terminos">Términos y Condiciones</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 TUKI BIKES — Proyecto académico. Pagos y usuarios simulados.</p>
      </div>
    </footer>
  );
}
