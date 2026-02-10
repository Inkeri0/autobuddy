import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { GarageService, ServiceCategory } from '@/types/database';
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORIES } from '@/lib/constants';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Trash2, Loader2, Wrench, Clock, Euro } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceFormData {
  category: ServiceCategory;
  name: string;
  description: string;
  price_from: number;
  price_to: number;
  duration_minutes: number;
  is_available: boolean;
}

const initialFormData: ServiceFormData = {
  category: 'other',
  name: '',
  description: '',
  price_from: 0,
  price_to: 0,
  duration_minutes: 60,
  is_available: true,
};

export default function ServicesPage() {
  const { garage } = useAuth();
  const { toast } = useToast();

  const [services, setServices] = useState<GarageService[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<GarageService | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (garage) {
      fetchServices();
    }
  }, [garage]);

  const fetchServices = async () => {
    if (!garage) return;

    try {
      const { data, error } = await supabase
        .from('garage_services')
        .select('*')
        .eq('garage_id', garage.id)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Kon services niet laden.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (service?: GarageService) => {
    if (service) {
      setEditingService(service);
      setFormData({
        category: service.category,
        name: service.name,
        description: service.description || '',
        price_from: service.price_from,
        price_to: service.price_to,
        duration_minutes: service.duration_minutes,
        is_available: service.is_available,
      });
    } else {
      setEditingService(null);
      setFormData(initialFormData);
    }
    setDialogOpen(true);
  };

  const handleSaveService = async () => {
    if (!garage) return;
    setSaving(true);

    try {
      if (editingService) {
        const { error } = await supabase
          .from('garage_services')
          .update({
            category: formData.category,
            name: formData.name,
            description: formData.description || null,
            price_from: formData.price_from,
            price_to: formData.price_to,
            duration_minutes: formData.duration_minutes,
            is_available: formData.is_available,
          })
          .eq('id', editingService.id);

        if (error) throw error;

        toast({
          title: 'Service bijgewerkt',
          description: `${formData.name} is succesvol bijgewerkt.`,
        });
      } else {
        const { error } = await supabase.from('garage_services').insert({
          garage_id: garage.id,
          category: formData.category,
          name: formData.name,
          description: formData.description || null,
          price_from: formData.price_from,
          price_to: formData.price_to,
          duration_minutes: formData.duration_minutes,
          is_available: formData.is_available,
        });

        if (error) throw error;

        toast({
          title: 'Service toegevoegd',
          description: `${formData.name} is succesvol toegevoegd.`,
        });
      }

      setDialogOpen(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Kon service niet opslaan.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('garage_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: 'Service verwijderd',
        description: 'De service is succesvol verwijderd.',
      });

      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Kon service niet verwijderen.',
      });
    }
  };

  const handleToggleAvailability = async (service: GarageService) => {
    try {
      const { error } = await supabase
        .from('garage_services')
        .update({ is_available: !service.is_available })
        .eq('id', service.id);

      if (error) throw error;

      setServices(services.map((s) =>
        s.id === service.id ? { ...s, is_available: !s.is_available } : s
      ));
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Kon beschikbaarheid niet wijzigen.',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Services</h1>
            <p className="text-muted-foreground">Beheer de diensten die u aanbiedt</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Nieuwe service
          </Button>
        </div>

        {/* Services Table */}
        <Card className="dashboard-card">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="mb-4">U heeft nog geen services toegevoegd</p>
                <Button onClick={() => handleOpenDialog()} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Voeg uw eerste service toe
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Categorie</TableHead>
                      <TableHead>Prijs</TableHead>
                      <TableHead>Duur</TableHead>
                      <TableHead>Beschikbaar</TableHead>
                      <TableHead className="w-[100px]">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            {service.description && (
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {service.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="status-badge bg-secondary text-secondary-foreground">
                            {SERVICE_CATEGORY_LABELS[service.category]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Euro className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {service.price_from === service.price_to
                                ? `${service.price_from}`
                                : `${service.price_from} - ${service.price_to}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{service.duration_minutes} min</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={service.is_available}
                            onCheckedChange={() => handleToggleAvailability(service)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(service)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Service verwijderen?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Weet u zeker dat u "{service.name}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteService(service.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Verwijderen
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Service Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Service bewerken' : 'Nieuwe service'}
              </DialogTitle>
              <DialogDescription>
                {editingService
                  ? 'Pas de details van deze service aan'
                  : 'Voeg een nieuwe service toe aan uw aanbod'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="category">Categorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v as ServiceCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {SERVICE_CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="name">Naam</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Bijv. Grote beurt incl. remmen"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Beschrijving (optioneel)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Beschrijf wat deze service inhoudt..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="price_from">Prijs vanaf (€)</Label>
                  <Input
                    id="price_from"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_from}
                    onChange={(e) => setFormData({ ...formData, price_from: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="price_to">Prijs tot (€)</Label>
                  <Input
                    id="price_to"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_to}
                    onChange={(e) => setFormData({ ...formData, price_to: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duur (minuten)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    id="available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                  <Label htmlFor="available">Beschikbaar</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuleren
              </Button>
              <Button
                onClick={handleSaveService}
                disabled={saving || !formData.name}
                className="bg-primary hover:bg-primary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  'Opslaan'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
