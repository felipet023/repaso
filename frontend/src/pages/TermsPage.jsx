import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="page terms-page">
      <header className="page-header">
        <h1>Términos y Condiciones</h1>
        <p className="muted">
          Última actualización: 2026. Al crear una cuenta y usar TUKI BIKES aceptas las condiciones descritas a continuación.
        </p>
      </header>

      <article className="card terms-content">
        <section>
          <h2><FileText size={18} /> 1. Naturaleza del proyecto</h2>
          <p>
            TUKI BIKES es un proyecto académico y de aprendizaje. La tienda, el taller y el panel de
            administración funcionan con <strong>datos y pagos simulados</strong>: ninguna compra genera
            un cobro real ni movimientos de dinero.
          </p>
        </section>

        <section>
          <h2>2. Uso de la cuenta</h2>
          <p>
            Al registrarte te comprometes a proporcionar información veraz. Eres responsable de mantener
            la confidencialidad de tu contraseña y de toda actividad realizada con tu cuenta. El registro
            está pensado para mayores de edad o para uso con supervisión de un adulto.
          </p>
        </section>

        <section>
          <h2>3. Pagos simulados</h2>
          <p>
            El proceso de pago es una simulación con fines demostrativos. <strong>Nunca debes ingresar
            datos reales de tarjetas</strong>; los formularios de pago de este sitio no procesan ni
            almacenan información financiera real.
          </p>
        </section>

        <section>
          <h2>4. Datos personales</h2>
          <p>
            La información que registras (nombre, correo, teléfono y dirección cuando aplica) se usa
            únicamente para operar la demostración: gestionar tu cuenta, tus pedidos y tus citas de
            taller. No se comparte con terceros ni se utiliza con fines comerciales.
          </p>
        </section>

        <section>
          <h2>5. Catálogo, precios y disponibilidad</h2>
          <p>
            Productos, precios, imágenes y existencias son de referencia y pueden cambiar sin previo
            aviso. Las imágenes de los productos pueden ser ilustrativas.
          </p>
        </section>

        <section>
          <h2>6. Citas de taller y contacto</h2>
          <p>
            Agendar una cita o enviar un mensaje por el formulario de contacto no constituye un contrato
            de servicio. Los horarios y la disponibilidad se validan al momento de la solicitud.
          </p>
        </section>

        <section>
          <h2>7. Cambios en los términos</h2>
          <p>
            Podemos actualizar estos términos para mejorar la experiencia del proyecto. La versión vigente
            será siempre la publicada en esta página.
          </p>
        </section>

        <div className="terms-actions">
          <Link to="/registro" className="btn-primary">Volver al registro</Link>
          <Link to="/" className="btn-secondary">Ir al inicio</Link>
        </div>
      </article>
    </main>
  );
}
