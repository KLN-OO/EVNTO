import { Link } from 'react-router-dom';
import { Evenement } from '@/lib/api';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventCardProps {
  event: Evenement;
}

export function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: fr });
  };

  // Generate a gradient based on event ID for variety
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-orange-500 to-pink-600',
    'from-green-500 to-teal-600',
    'from-indigo-500 to-blue-600',
    'from-rose-500 to-orange-500',
  ];
  const gradient = gradients[event.evenement_id % gradients.length];

  return (
    <Link to={`/events/${event.evenement_id}`}>
      <article className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
        {/* Image placeholder with gradient */}
        <div className={`h-40 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground">
              Catégorie {event.categorie_id}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {event.titre}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {event.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{formatDate(event.date_debut)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>{formatTime(event.date_debut)} - {formatTime(event.date_fin)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Lieu #{event.lieu_id}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
