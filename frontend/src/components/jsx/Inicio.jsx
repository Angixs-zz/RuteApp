import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/styles.css';
import logoImg from '../../assets/react.svg';
import heroImg from '../../assets/hero.png';

export default function Inicio() {
  useEffect(() => {
    document.body.classList.add('public');
    return () => {
      document.body.classList.remove('public');
    };
  }, []);

  return (
    <>
      {/* Header Público */}
      <header className="public-nav">
        <div className="container">
          <Link className="brand" to="/">
            <img src={logoImg} alt="RuteApp" style={{ width: '140px' }} />
          </Link>
          <nav className="public-links">
            <a href="#beneficios">Beneficios</a>
            <a href="#como-funciona">Cómo funciona</a>
          </nav>
          <div className="nav-actions">
            <Link to="/login">Iniciar sesión</Link>
            <Link className="button primary" to="/registro">
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">ORGANIZA VIAJES EN EQUIPO</span>
            <h1>
              Todo tu viaje, <span>en un solo lugar.</span>
            </h1>
            <p>
              Coordina participantes, itinerarios, gastos y recordatorios sin perder información entre chats, notas y hojas de cálculo.
            </p>
            <div className="hero-actions">
              <Link className="button primary" to="/registro">
                Comenzar ahora
              </Link>
              <Link className="button ghost" to="/login">
                Ya tengo cuenta
              </Link>
            </div>
            <div className="hero-trust">
              <div className="mini-avatars">
                <span>YA</span>
                <span>MA</span>
                <span>JP</span>
                <span>+4</span>
              </div>
              <span>Organiza con tu grupo desde cualquier dispositivo.</span>
            </div>
          </div>
          <img src={heroImg} alt="Ilustración de viaje colaborativo" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      </section>

      {/* Sección Beneficios */}
      <section className="feature-section" id="beneficios">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">UNA PLATAFORMA, TODO EL VIAJE</span>
            <h2>Menos mensajes perdidos. Más tiempo para disfrutar.</h2>
          </div>
          <div className="cards-3">
            <article className="card feature-card">
              <div className="feature-icon">🗓️</div>
              <h3>Itinerario compartido</h3>
              <p className="muted">Actividades, horarios, responsables y ubicaciones organizados por día.</p>
            </article>
            <article className="card feature-card">
              <div className="feature-icon">👥</div>
              <h3>Participantes confirmados</h3>
              <p className="muted">Invita al grupo y consulta quién aceptó, rechazó o sigue pendiente.</p>
            </article>
            <article className="card feature-card">
              <div className="feature-icon">💳</div>
              <h3>Gastos transparentes</h3>
              <p className="muted">Registra pagos, divide cantidades y conoce quién tiene saldos pendientes.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Sección Cómo Funciona */}
      <section className="feature-section" id="como-funciona" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">CÓMO FUNCIONA</span>
            <h2>Planea una experiencia en tres pasos</h2>
          </div>
          <div className="cards-3">
            <article className="card feature-card">
              <div className="feature-icon">1</div>
              <h3>Crea el viaje</h3>
              <p className="muted">Define destino, fechas, presupuesto y transporte.</p>
            </article>
            <article className="card feature-card">
              <div className="feature-icon">2</div>
              <h3>Invita a tu grupo</h3>
              <p className="muted">Envía invitaciones por correo, SMS o WhatsApp.</p>
            </article>
            <article className="card feature-card">
              <div className="feature-icon">3</div>
              <h3>Organicen juntos</h3>
              <p className="muted">Construyan el itinerario y distribuyan los gastos.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand">
              <img src={logoImg} alt="RuteApp" style={{ width: '130px', filter: 'brightness(0) invert(1)' }} />
            </div>
            <p>Organización colaborativa para viajes grupales.</p>
          </div>
          <div>
            <strong>Proyecto académico</strong>
            <p>Spring Boot · React · MySQL · Figma · GitHub</p>
          </div>
        </div>
      </footer>
    </>
  );
}
