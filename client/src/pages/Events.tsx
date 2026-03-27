import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventsApi, Evenement } from '@/lib/api';
import { EventCard } from '@/components/EventCard';
import { PageLoader } from '@/components/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar, SelectRangeEventHandler, DateRange } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { isAuthenticated, token } = useAuth();

  // Tous les événements publics
  const { data: allEvents, isLoading: isLoadingAll } = useQuery<Evenement[]>({
    queryKey: ['events-public'],
    queryFn: eventsApi.getAllPublic,
  });

  // Événements filtrés par date si dateRange est défini
  const { data: filteredEvents, isLoading: isLoadingFiltered } = useQuery<Evenement[]>({
    queryKey: ['events-filtered', dateRange],
    queryFn: () => {
      if (!dateRange?.from || !dateRange?.to) return [];
      const start = format(dateRange.from, 'yyyy-MM-dd');
      const end = format(dateRange.to, 'yyyy-MM-dd');
      console.log("Dates envoyées au backend :", start, end);
      return eventsApi.getFilteredPublic(start, end);
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  // Événements à afficher
  const eventsToDisplay = filteredEvents && filteredEvents.length > 0 ? filteredEvents : allEvents || [];

  // Filtre par recherche texte
  const filteredAndSearchedEvents = eventsToDisplay.filter(event =>
    event.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetFilter = () => setDateRange(undefined);

  return (
    <div className="min-h-screen bg-background">
      {/* En-tête et recherche */}
      <div className="gradient-hero border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Explorer les événements</h1>
          <p className="text-muted-foreground mb-6">Trouvez des événements qui correspondent à vos intérêts</p>

          {/* Recherche texte */}
          <div className="relative max-w-xl mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>

          {/* Filtre de date */}
          <div className="flex items-center gap-4">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {dateRange?.from && dateRange?.to ? (
                    <>
                      {format(dateRange.from, 'dd MMM')} - {format(dateRange.to, 'dd MMM')}
                      <X
                        className="w-4 h-4 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetFilter();
                        }}
                      />
                    </>
                  ) : 'Filtrer par date'}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange as SelectRangeEventHandler}
                  numberOfMonths={2}
                  className="rounded-md border"
                />
                <div className="p-4 border-t border-border">
                  <Button
                    className="w-full"
                    onClick={() => setIsFilterOpen(false)}
                    disabled={!dateRange?.from || !dateRange?.to}
                  >
                    Appliquer le filtre
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Affichage des événements */}
      <div className="container mx-auto px-4 py-12">
        {(isLoadingAll || isLoadingFiltered) ? (
          <PageLoader />
        ) : filteredAndSearchedEvents.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredAndSearchedEvents.length}</span> événement{filteredAndSearchedEvents.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSearchedEvents.map((event, index) => (
                <div key={event.evenement_id} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'Aucun résultat' : 'Aucun événement disponible'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? `Aucun événement ne correspond à "${searchQuery}"`
                : 'Revenez bientôt pour découvrir de nouveaux événements !'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
