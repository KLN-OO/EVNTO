import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, eventsApi, Evenement } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Plus,
  Calendar,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect } from 'react';

export default function Dashboard() {
  const { isAuthenticated, isOrganisateur, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isOrganisateur)) {
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, isOrganisateur, navigate]);

  const { data: events, isLoading } = useQuery<Evenement[]>({
    queryKey: ['my-events'],
    queryFn: userApi.getMyEvents,
    enabled: isAuthenticated && isOrganisateur,
  });

  const deleteMutation = useMutation({
    mutationFn: eventsApi.delete,
    onSuccess: () => {
      toast({ title: 'Événement supprimé' });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
    },
  });

  const publishMutation = useMutation({
    mutationFn: eventsApi.publish,
    onSuccess: () => {
      toast({ title: 'Événement publié !' });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de publier', variant: 'destructive' });
    },
  });

  if (authLoading || isLoading) return <PageLoader />;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Mes événements
              </h1>
              <p className="text-muted-foreground">
                Gérez et suivez vos événements
              </p>
            </div>
            <Link to="/events/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer un événement
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {events && events.length > 0 ? (
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
              <div className="col-span-4">Événement</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Catégorie</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {events.map((event) => (
                <div
                  key={event.evenement_id}
                  className="grid md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors"
                >
                  {/* Event Info */}
                  <div className="md:col-span-4">
                    <Link
                      to={`/events/${event.evenement_id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {event.titre}
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {event.description}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="md:col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary md:hidden" />
                    <span>{formatDate(event.date_debut)}</span>
                  </div>

                  {/* Category */}
                  <div className="md:col-span-2">
                    <span className="inline-block px-2 py-1 bg-secondary rounded text-xs font-medium text-secondary-foreground">
                      Cat. {event.categorie_id}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    {event.est_publie ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        <Eye className="w-3 h-3" />
                        Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                        <EyeOff className="w-3 h-3" />
                        Brouillon
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/events/${event.evenement_id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/events/${event.evenement_id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        {!event.est_publie && (
                          <DropdownMenuItem
                            onClick={() => publishMutation.mutate(event.evenement_id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Publier
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(event.evenement_id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Aucun événement créé
            </h3>
            <p className="text-muted-foreground mb-6">
              Créez votre premier événement dès maintenant !
            </p>
            <Link to="/events/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer un événement
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
