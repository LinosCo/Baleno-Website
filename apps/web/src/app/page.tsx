import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Shield, CreditCard } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-primary border-b border-primary">
        <div className="container mx-auto max-w-6xl px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/BALENO-LOGO-BIANCO.png"
              alt="Baleno Sanzeno"
              width={140}
              height={45}
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex gap-3">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              <Link href="/login">Accedi</Link>
            </Button>
            <Button asChild className="bg-accent text-primary hover:bg-accent/90">
              <Link href="/register">Registrati</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Baleno Sanzeno
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Sistema completo di gestione e prenotazione spazi per la tua comunità
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg">
                <Link href="/bookings">Prenota Ora</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/calendar">Vedi Calendario</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Funzionalità Principali
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Calendar className="h-10 w-10" />}
              title="Prenotazioni Facili"
              description="Sistema di prenotazione intuitivo con calendario in tempo reale"
            />
            <FeatureCard
              icon={<CreditCard className="h-10 w-10" />}
              title="Pagamenti Sicuri"
              description="Integrazione Stripe per pagamenti sicuri e ricevute automatiche"
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10" />}
              title="Gestione Avanzata"
              description="Dashboard completa per admin e community manager"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="Calendario Pubblico"
              description="Visualizza tutte le prenotazioni approvate in tempo reale"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Baleno Sanzeno. Tutti i diritti riservati.</p>
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
    <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
      <div className="text-primary">{icon}</div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
