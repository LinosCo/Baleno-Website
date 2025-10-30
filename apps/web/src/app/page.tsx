import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Users, Shield, CreditCard } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-vh-100">
      {/* Navbar Bootstrap Italia */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow">
        <div className="container">
          <Link href="/" className="navbar-brand">
            <Image
              src="/BALENO-LOGO-BIANCO.png"
              alt="Baleno Sanzeno"
              width={140}
              height={45}
              className="d-inline-block align-top"
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>
          <div className="d-flex gap-2">
            <Link href="/login" className="btn btn-outline-light">
              Accedi
            </Link>
            <Link href="/register" className="btn btn-secondary">
              Registrati
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-5 bg-light" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <h1 className="display-3 fw-bold mb-4 text-baleno-primary">
                Baleno Sanzeno
              </h1>
              <p className="lead fs-3 text-secondary mb-5">
                Sistema completo di gestione e prenotazione spazi per la Casa di Quartiere
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/bookings" className="btn btn-primary btn-lg">
                  Prenota Ora
                </Link>
                <Link href="/calendar" className="btn btn-outline-primary btn-lg">
                  Vedi Calendario
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center display-5 fw-bold mb-5 text-baleno-primary">
            Funzionalità Principali
          </h2>
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <FeatureCard
                icon={<Calendar className="text-primary" size={48} />}
                title="Prenotazioni Facili"
                description="Sistema di prenotazione intuitivo con calendario in tempo reale"
              />
            </div>
            <div className="col-md-6 col-lg-3">
              <FeatureCard
                icon={<CreditCard className="text-primary" size={48} />}
                title="Pagamenti Sicuri"
                description="Integrazione Stripe per pagamenti sicuri e ricevute automatiche"
              />
            </div>
            <div className="col-md-6 col-lg-3">
              <FeatureCard
                icon={<Shield className="text-primary" size={48} />}
                title="Gestione Avanzata"
                description="Dashboard completa per admin e community manager"
              />
            </div>
            <div className="col-md-6 col-lg-3">
              <FeatureCard
                icon={<Users className="text-primary" size={48} />}
                title="Calendario Pubblico"
                description="Visualizza tutte le prenotazioni approvate in tempo reale"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 border-top mt-5">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <p className="text-muted mb-0">
                &copy; 2025 Baleno Sanzeno - Casa di Quartiere. Tutti i diritti riservati.
              </p>
              <p className="text-muted small mt-2">
                Sviluppato da <a href="https://linosco.com" className="text-baleno-primary text-decoration-none">Lino's & Co</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body text-center d-flex flex-column">
        <div className="mb-3">{icon}</div>
        <h3 className="card-title h5 fw-semibold mb-3">{title}</h3>
        <p className="card-text text-muted">{description}</p>
      </div>
    </div>
  );
}
