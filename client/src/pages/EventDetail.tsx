import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, inscriptionsApi, Evenement, Inscription } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Users,
  Share2,
  Heart,
  CheckCircle,
} from 'lucide-react';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading, error } = useQuery<Evenement>({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(Number(id)),
    enabled: !!id,
  });

  const { data: myInscriptions } = useQuery<Inscription[]>({
    queryKey: ['inscriptions', 'mine'],
    queryFn: inscriptionsApi.getMine,
    enabled: isAuthenticated,
  });

  const isAlreadyRegistered = myInscriptions?.some(
    (inscription) => inscription.evenement_id === Number(id)
  );

  const inscriptionMutation = useMutation({
    mutationFn: () => inscriptionsApi.create(Number(id)),
    onSuccess: () => {
      toast({
        title: 'Inscription réussie !',
        description: 'Vous êtes inscrit à cet événement.',
      });
      queryClient.invalidateQueries({ queryKey: ['inscriptions'] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de s\'inscrire',
        variant: 'destructive',
      });
    },
  });

  const handleInscription = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    inscriptionMutation.mutate();
  };

  if (isLoading) return <PageLoader />;
  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Événement non trouvé</h2>
          <p className="text-muted-foreground mb-4">Cet événement n'existe pas ou n'est plus disponible.</p>
          <Link to="/events">
            <Button>Retour aux événements</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE d MMMM yyyy', { locale: fr });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: fr });
  };

  const gradients = [
    'from-blue-500 to-purple-600',
    'from-orange-500 to-pink-600',
    'from-green-500 to-teal-600',
    'from-indigo-500 to-blue-600',
    'from-rose-500 to-orange-500',
  ];
  const gradient = gradients[event.evenement_id % gradients.length];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className={`h-64 md:h-80 bg-gradient-to-br ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 h-full relative">
          <Link
            to="/events"
            className="absolute top-6 left-4 inline-flex items-center gap-2 px-4 py-2 bg-card/90 backdrop-blur-sm rounded-lg text-sm font-medium text-foreground hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-4 -mt-20 relative z-10 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
              {/* Category Badge */}
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                Catégorie {event.categorie_id}
              </span>
              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {event.titre}
              </h1>
              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="capitalize">{formatDate(event.date_debut)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{formatTime(event.date_debut)} - {formatTime(event.date_fin)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Lieu #{event.lieu_id}</span>
                </div>
              </div>
              {/* Description */}
              <div className="prose prose-gray max-w-none">
                <h2 className="text-lg font-semibold text-foreground mb-3">À propos de cet événement</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl shadow-card p-6 sticky top-24">
              {/* Actions */}
              <div className="flex gap-2 mb-6">
                <Button variant="outline" size="icon" className="flex-1">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" className="flex-1">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
              {/* CTA */}
              <Button
                className="w-full mb-4"
                size="lg"
                onClick={handleInscription}
                disabled={inscriptionMutation.isPending || isAlreadyRegistered}
              >
                {isAlreadyRegistered ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Déjà inscrit
                  </>
                ) : inscriptionMutation.isPending ? (
                  'Inscription...'
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    S'inscrire
                  </>
                )}
              </Button>
              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground text-center">
                  <Link to="/auth" className="text-primary hover:underline">
                    Connectez-vous
                  </Link>{' '}
                  pour vous inscrire
                </p>
              )}
              {/* Event Info Summary */}
              <div className="mt-6 pt-6 border-t border-border space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Date</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {formatDate(event.date_debut)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Horaires</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.date_debut)} - {formatTime(event.date_fin)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Lieu</p>
                    <p className="text-sm text-muted-foreground">
                      Lieu #{event.lieu_id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
