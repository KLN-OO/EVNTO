import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inscriptionsApi, Inscription } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, X, ExternalLink, Ticket } from 'lucide-react';

export default function MyInscriptions() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Récupère les inscriptions de l'utilisateur connecté (avec les événements associés)
  const { data: inscriptions, isLoading } = useQuery<Inscription[]>({
    queryKey: ['my-inscriptions'],
    queryFn: inscriptionsApi.getMine,
    enabled: isAuthenticated,
  });

  const cancelMutation = useMutation({
    mutationFn: inscriptionsApi.cancel,
    onSuccess: () => {
      toast({ title: 'Inscription annulée', description: 'Votre inscription a été annulée avec succès.' });
      queryClient.invalidateQueries({ queryKey: ['my-inscriptions'] });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'annuler l\'inscription',
        variant: 'destructive',
      });
    },
  });

  if (authLoading || isLoading) return <PageLoader />;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE d MMMM yyyy', { locale: fr });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: fr });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Mes inscriptions
          </h1>
          <p className="text-muted-foreground">
            Retrouvez tous les événements auxquels vous êtes inscrit
          </p>
        </div>
      </div>
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Si aucune inscription */}
        {!inscriptions || inscriptions.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Aucune inscription pour le moment
            </h3>
            <p className="text-muted-foreground mb-6">
              Explorez les événements disponibles et inscrivez-vous !
            </p>
            <Link to="/events">
              <Button>
                <ExternalLink className="w-4 h-4 mr-2" />
                Explorer les événements
              </Button>
            </Link>
          </div>
        ) : (
          // Liste des inscriptions
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inscriptions.map((inscription) => (
              <div key={inscription.inscription_id} className="bg-card rounded-xl shadow-card p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Ticket className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {inscription.evenement?.titre || 'Événement inconnu'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Inscrit le {formatDate(inscription.date_inscription)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      {inscription.evenement ? formatDate(inscription.evenement.date_debut) : 'Date inconnue'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {inscription.evenement ? `${formatTime(inscription.evenement.date_debut)} - ${formatTime(inscription.evenement.date_fin)}` : 'Horaire inconnu'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {inscription.evenement && (
                    <Link to={`/events/${inscription.evenement.evenement_id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/5"
                    onClick={() => cancelMutation.mutate(inscription.inscription_id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
