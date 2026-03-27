import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { eventsApi, CreateEventData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PageLoader } from '@/components/LoadingSpinner';
import { ArrowLeft, Calendar, MapPin, Tag } from 'lucide-react';
import { z } from 'zod';

const eventSchema = z.object({
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(100),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(2000),
  date_debut: z.string().min(1, 'La date de début est requise'),
  date_fin: z.string().min(1, 'La date de fin est requise'),
  categorie_id: z.number().min(1, 'La catégorie est requise'),
  lieu_id: z.number().min(1, 'Le lieu est requis'),
});

export default function CreateEvent() {
  const { isAuthenticated, isOrganisateur, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateEventData>({
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    categorie_id: 1,
    lieu_id: 1,
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isOrganisateur)) {
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, isOrganisateur, navigate]);

  const createMutation = useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      toast({
        title: 'Événement créé !',
        description: 'Votre événement a été créé avec succès.',
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer l\'événement',
        variant: 'destructive',
      });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'categorie_id' || name === 'lieu_id' ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = eventSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Validate dates
    const debut = new Date(formData.date_debut);
    const fin = new Date(formData.date_fin);
    if (fin <= debut) {
      setErrors({ date_fin: 'La date de fin doit être après la date de début' });
      return;
    }

    createMutation.mutate(formData);
  };

  if (authLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Créer un événement
          </h1>
          <p className="text-muted-foreground mt-2">
            Remplissez les informations de votre événement
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="titre">Titre de l'événement *</Label>
                <Input
                  id="titre"
                  name="titre"
                  placeholder="Ex: Conférence Tech 2024"
                  value={formData.titre}
                  onChange={handleChange}
                />
                {errors.titre && (
                  <p className="text-sm text-destructive">{errors.titre}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Décrivez votre événement..."
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_debut">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date et heure de début *
                  </Label>
                  <Input
                    id="date_debut"
                    name="date_debut"
                    type="datetime-local"
                    value={formData.date_debut}
                    onChange={handleChange}
                  />
                  {errors.date_debut && (
                    <p className="text-sm text-destructive">{errors.date_debut}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_fin">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date et heure de fin *
                  </Label>
                  <Input
                    id="date_fin"
                    name="date_fin"
                    type="datetime-local"
                    value={formData.date_fin}
                    onChange={handleChange}
                  />
                  {errors.date_fin && (
                    <p className="text-sm text-destructive">{errors.date_fin}</p>
                  )}
                </div>
              </div>

              {/* Category & Location */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categorie_id">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Catégorie *
                  </Label>
                  <select
                    id="categorie_id"
                    name="categorie_id"
                    value={formData.categorie_id}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-lg border-2 border-input bg-card px-4 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value={1}>Conférence</option>
                    <option value={2}>Atelier</option>
                    <option value={3}>Cours</option>
                    <option value={4}>Networking</option>
                    <option value={5}>Sport</option>
                  </select>
                  {errors.categorie_id && (
                    <p className="text-sm text-destructive">{errors.categorie_id}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lieu_id">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Lieu *
                  </Label>
                  <select
                    id="lieu_id"
                    name="lieu_id"
                    value={formData.lieu_id}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-lg border-2 border-input bg-card px-4 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value={1}>Salle de conférence A</option>
                    <option value={2}>Salle 302</option>
                    <option value={3}>Stade municipal</option>
                    <option value={4}>Piscine extérieure</option>
                    <option value={5}>Amphithéâtre central</option>
                    <option value={6}>Salle polyvalente</option>
                    <option value={7}>Gymnase</option>

                  </select>
                  {errors.lieu_id && (
                    <p className="text-sm text-destructive">{errors.lieu_id}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Création...' : 'Créer l\'événement'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
