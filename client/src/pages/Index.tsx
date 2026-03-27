import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/EventCard';
import { PageLoader } from '@/components/LoadingSpinner';
import { eventsApi, Evenement } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Calendar, Users, Sparkles, Search } from 'lucide-react';

const Index = () => {
  const { data: events, isLoading } = useQuery<Evenement[]>({
    queryKey: ['events-public'],
    queryFn: eventsApi.getAllPublic,
  });

  const featuredEvents = events?.slice(0, 3) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-up">
              <Sparkles className="w-4 h-4" />
              Découvrez des événements exceptionnels
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Trouvez votre prochain{' '}
              <span className="text-gradient">événement</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Explorez des centaines d'événements près de chez vous.
              Conférences, ateliers, concerts et bien plus encore.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/events">
                <Button size="xl" className="w-full sm:w-auto">
                  <Search className="w-5 h-5 mr-2" />
                  Explorer les événements
                </Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Créer un compte
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Calendar, value: '500+', label: 'Événements' },
              { icon: Users, value: '10k+', label: 'Participants' },
              { icon: Sparkles, value: '50+', label: 'Catégories' },
              { icon: Calendar, value: '100+', label: 'Organisateurs' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Événements à venir
              </h2>
              <p className="text-muted-foreground">
                Découvrez les événements les plus populaires
              </p>
            </div>
            <Link to="/events">
              <Button variant="outline">
                Voir tout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <PageLoader />
          ) : featuredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event, index) => (
                <div
                  key={event.evenement_id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucun événement pour le moment
              </h3>
              <p className="text-muted-foreground mb-6">
                Soyez le premier à créer un événement !
              </p>
              <Link to="/auth?mode=register">
                <Button>Devenir organisateur</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center gradient-primary rounded-3xl p-10 md:p-16 shadow-primary">
            <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-4">
              Prêt à organiser votre événement ?
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">
              Rejoignez notre communauté et créez des événements mémorables.
            </p>
            <Link to="/auth?mode=register">
              <Button variant="secondary" size="xl">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Evnto</span>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2024 Evnto. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;



