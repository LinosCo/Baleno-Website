'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Users, Shield, CreditCard, MapPin, Mail, Phone, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ backgroundColor: '#2B548E' }}>
        <div className="container">
          <Link href="/" className="navbar-brand d-flex align-items-center">
            <Image
              src="/BALENO-LOGO-BIANCO.png"
              alt="Baleno San Zeno"
              width={200}
              height={65}
              className="d-inline-block"
              style={{ height: '65px', width: 'auto' }}
              priority
            />
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNavbar">
            <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
              <Link href="/resources" className="nav-link text-white">Spazi</Link>
              <Link href="/calendar" className="nav-link text-white">Calendario</Link>
              <div className="d-flex gap-2 mt-3 mt-lg-0">
                <Link href="/login" className="btn btn-outline-light btn-sm px-3">
                  Accedi
                </Link>
                <Link href="/register" className="btn btn-warning text-dark btn-sm px-3 fw-semibold" style={{ backgroundColor: '#EDBB00' }}>
                  Registrati
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Light Version */}
      <section className={`hero-light position-relative ${mounted ? 'fade-in' : 'opacity-0'}`}>
        <div className="hero-pattern-light"></div>
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center" style={{ minHeight: '70vh' }}>
            <div className="col-lg-10">
              <h1 className={`display-2 fw-bold mb-4 ${mounted ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s', color: '#2B548E' }}>
                Casa di Quartiere<br />
                <span style={{ color: '#EDBB00' }}>Baleno San Zeno</span>
              </h1>
              <p className={`lead fs-4 mb-5 ${mounted ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s', maxWidth: '700px', color: '#495057' }}>
                Uno spazio condiviso di 330mq nel cuore di San Zeno di Cassola, dedicato alla community, alla cultura e all'aggregazione sociale.
              </p>
              <div className={`d-flex gap-3 flex-wrap ${mounted ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                <Link href="/bookings/new" className="btn btn-lg px-5 py-3 fw-semibold cta-primary">
                  Prenota lo Spazio
                  <ArrowRight className="ms-2" size={20} />
                </Link>
                <Link href="/resources" className="btn btn-outline-primary btn-lg px-5 py-3 fw-semibold">
                  Scopri gli Spazi
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row g-4 text-center">
            <div className={`col-6 col-lg-3 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <div className="stat-item">
                <h3 className="display-4 fw-bold mb-2" style={{ color: '#2B548E' }}>330</h3>
                <p className="text-muted mb-0">Metri Quadrati</p>
              </div>
            </div>
            <div className={`col-6 col-lg-3 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              <div className="stat-item">
                <h3 className="display-4 fw-bold mb-2" style={{ color: '#EDBB00' }}>24/7</h3>
                <p className="text-muted mb-0">Disponibilità</p>
              </div>
            </div>
            <div className={`col-6 col-lg-3 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <div className="stat-item">
                <h3 className="display-4 fw-bold mb-2" style={{ color: '#2B548E' }}>100+</h3>
                <p className="text-muted mb-0">Eventi all'Anno</p>
              </div>
            </div>
            <div className={`col-6 col-lg-3 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
              <div className="stat-item">
                <h3 className="display-4 fw-bold mb-2" style={{ color: '#EDBB00' }}>1000+</h3>
                <p className="text-muted mb-0">Partecipanti</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spaces Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className={`display-4 fw-bold mb-3 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ color: '#2B548E', animationDelay: '0.1s' }}>
              I Nostri Spazi
            </h2>
            <p className={`lead text-muted ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              Ambienti versatili per ogni tipo di attività
            </p>
          </div>

          <div className="row g-4">
            <div className={`col-lg-4 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              <div className="space-card">
                <div className="space-card-image">
                  <div className="placeholder-image d-flex align-items-center justify-content-center">
                    <Calendar size={48} style={{ color: '#2B548E' }} />
                  </div>
                </div>
                <div className="space-card-body">
                  <h3 className="h4 fw-bold mb-3" style={{ color: '#2B548E' }}>Sala Principale</h3>
                  <p className="text-muted mb-3">
                    Spazio polivalente di 200mq ideale per eventi, workshop, conferenze e attività di gruppo.
                  </p>
                  <Link href="/resources" className="btn btn-sm btn-outline-primary">
                    Vedi Dettagli →
                  </Link>
                </div>
              </div>
            </div>

            <div className={`col-lg-4 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <div className="space-card">
                <div className="space-card-image">
                  <div className="placeholder-image d-flex align-items-center justify-content-center">
                    <Users size={48} style={{ color: '#2B548E' }} />
                  </div>
                </div>
                <div className="space-card-body">
                  <h3 className="h4 fw-bold mb-3" style={{ color: '#2B548E' }}>Sala Riunioni</h3>
                  <p className="text-muted mb-3">
                    Ambiente raccolto per meeting, corsi e attività che richiedono maggiore concentrazione.
                  </p>
                  <Link href="/resources" className="btn btn-sm btn-outline-primary">
                    Vedi Dettagli →
                  </Link>
                </div>
              </div>
            </div>

            <div className={`col-lg-4 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
              <div className="space-card">
                <div className="space-card-image">
                  <div className="placeholder-image d-flex align-items-center justify-content-center">
                    <Shield size={48} style={{ color: '#2B548E' }} />
                  </div>
                </div>
                <div className="space-card-body">
                  <h3 className="h4 fw-bold mb-3" style={{ color: '#2B548E' }}>Spazio Completo</h3>
                  <p className="text-muted mb-3">
                    Intera struttura di 330mq per eventi di grande portata e manifestazioni speciali.
                  </p>
                  <Link href="/resources" className="btn btn-sm btn-outline-primary">
                    Vedi Dettagli →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className={`display-4 fw-bold mb-3 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ color: '#2B548E', animationDelay: '0.1s' }}>
              Perché Scegliere Baleno
            </h2>
          </div>

          <div className="row g-4">
            <div className={`col-md-6 col-lg-3 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <FeatureCard
                icon={<Calendar style={{ color: '#2B548E' }} size={40} />}
                title="Prenotazione Semplice"
                description="Sistema intuitivo per prenotare gli spazi in pochi click"
              />
            </div>
            <div className={`col-md-6 col-lg-3 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              <FeatureCard
                icon={<CreditCard style={{ color: '#2B548E' }} size={40} />}
                title="Pagamenti Sicuri"
                description="Bonifico bancario o carta di credito, scegli tu"
              />
            </div>
            <div className={`col-md-6 col-lg-3 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <FeatureCard
                icon={<Shield style={{ color: '#2B548E' }} size={40} />}
                title="Gestione Trasparente"
                description="Calendario pubblico e comunicazioni sempre chiare"
              />
            </div>
            <div className={`col-md-6 col-lg-3 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
              <FeatureCard
                icon={<Users style={{ color: '#2B548E' }} size={40} />}
                title="Community Attiva"
                description="Entra a far parte di una rete di associazioni e cittadini"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Light Version */}
      <section className="py-5 position-relative overflow-hidden" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="card border-0 shadow-lg p-5" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)' }}>
            <div className="row align-items-center">
              <div className="col-lg-8 mb-4 mb-lg-0">
                <h2 className="display-5 fw-bold mb-3" style={{ color: '#2B548E' }}>Pronto a Prenotare?</h2>
                <p className="lead mb-0 text-muted">
                  Prenota ora il tuo spazio e inizia a realizzare i tuoi progetti nella nostra Casa di Quartiere.
                </p>
              </div>
              <div className="col-lg-4 text-lg-end">
                <Link href="/bookings/new" className="btn btn-lg px-5 py-3 fw-semibold cta-primary">
                  Prenota Ora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Light Version */}
      <footer className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <h5 className="fw-bold mb-3" style={{ color: '#2B548E' }}>Baleno San Zeno</h5>
              <p className="text-muted mb-0">
                Casa di Quartiere dedicata alla community e alla cultura
              </p>
            </div>

            <div className="col-lg-4 mb-4 mb-lg-0">
              <h5 className="fw-bold mb-3" style={{ color: '#2B548E' }}>Link Utili</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link href="/resources" className="text-muted text-decoration-none hover-link">
                    Esplora Spazi
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/calendar" className="text-muted text-decoration-none hover-link">
                    Calendario Pubblico
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/bookings/new" className="text-muted text-decoration-none hover-link">
                    Prenota Ora
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-lg-4">
              <h5 className="fw-bold mb-3" style={{ color: '#2B548E' }}>Contatti</h5>
              <div className="d-flex align-items-start mb-2">
                <MapPin size={18} className="me-2 mt-1" style={{ color: '#2B548E' }} />
                <span className="text-muted">Via Don Giuseppe Andreoli, 37<br />San Zeno di Cassola (VI)</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <Mail size={18} className="me-2" style={{ color: '#2B548E' }} />
                <a href="mailto:info@balenosanzeno.it" className="text-muted text-decoration-none hover-link">
                  info@balenosanzeno.it
                </a>
              </div>
              <div className="d-flex align-items-center">
                <Phone size={18} className="me-2" style={{ color: '#2B548E' }} />
                <span className="text-muted">+39 XXX XXX XXXX</span>
              </div>
            </div>
          </div>

          <hr className="my-4" style={{ borderColor: '#dee2e6' }} />

          <div className="row">
            <div className="col-12 text-center text-muted small">
              <p className="mb-0">© 2025 Baleno San Zeno - Casa di Quartiere. Tutti i diritti riservati.</p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        .slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }

        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .opacity-0 {
          opacity: 0;
        }

        /* Hero Light */
        .hero-light {
          min-height: 70vh;
          background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 50%, #ffffff 100%);
          position: relative;
          display: flex;
          align-items: center;
          padding: 3rem 0;
        }

        .hero-pattern-light {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            radial-gradient(circle at 15% 20%, rgba(43, 84, 142, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 85% 80%, rgba(237, 187, 0, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(43, 84, 142, 0.02) 0%, transparent 60%);
          z-index: 1;
        }

        /* CTA Buttons */
        .cta-primary {
          background: linear-gradient(135deg, #EDBB00 0%, #f5c91a 100%);
          border: none;
          color: #2B548E;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }

        .cta-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(237, 187, 0, 0.4);
          background: linear-gradient(135deg, #f5c91a 0%, #EDBB00 100%);
          color: #2B548E;
        }

        /* Stats */
        .stat-item {
          padding: 2rem 1rem;
          transition: transform 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-5px);
        }

        /* Space Cards */
        .space-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .space-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 40px rgba(43, 84, 142, 0.2);
        }

        .space-card-image {
          height: 220px;
          overflow: hidden;
          background: linear-gradient(135deg, #e8ecf1 0%, #f5f7fa 100%);
        }

        .placeholder-image {
          height: 100%;
          background: linear-gradient(135deg, #f0f4f8 0%, #e8ecf1 100%);
        }

        .space-card-body {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .space-card-body p {
          flex: 1;
        }

        /* Feature Cards */
        .feature-card {
          background: white;
          border-radius: 8px;
          padding: 2rem 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
          height: 100%;
          border: 1px solid rgba(0,0,0,0.06);
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(43, 84, 142, 0.15);
          border-color: rgba(43, 84, 142, 0.2);
        }

        /* Footer Links */
        .hover-link {
          transition: color 0.2s ease;
        }

        .hover-link:hover {
          color: #2B548E !important;
        }

        /* Navbar */
        .navbar {
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
      `}</style>
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
    <div className="feature-card">
      <div className="mb-3">{icon}</div>
      <h3 className="h5 fw-semibold mb-3" style={{ color: '#2B548E' }}>{title}</h3>
      <p className="text-muted mb-0 small">{description}</p>
    </div>
  );
}
