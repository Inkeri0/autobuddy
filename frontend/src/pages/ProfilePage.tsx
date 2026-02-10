import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { OpeningHours } from '@/types/database';
import { SPECIALIZATIONS, CAR_BRANDS, PROVINCES, WEEKDAYS } from '@/lib/constants';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Building2, MapPin, Phone, Globe, Clock, Camera, Loader2, Upload, X, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { garage, refreshGarage } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: garage?.name || '',
    description: garage?.description || '',
    address: garage?.address || '',
    city: garage?.city || '',
    province: garage?.province || '',
    postal_code: garage?.postal_code || '',
    phone: garage?.phone || '',
    email: garage?.email || '',
    website: garage?.website || '',
    specializations: garage?.specializations || [],
    brands_serviced: garage?.brands_serviced || [],
    is_ev_specialist: garage?.is_ev_specialist || false,
    opening_hours: garage?.opening_hours || getDefaultOpeningHours(),
  });

  function getDefaultOpeningHours(): OpeningHours {
    return {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '14:00', closed: false },
      sunday: { open: '09:00', close: '14:00', closed: true },
    };
  }

  const handleSave = async () => {
    if (!garage) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('garages')
        .update({
          name: formData.name,
          description: formData.description || null,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postal_code,
          phone: formData.phone,
          email: formData.email || null,
          website: formData.website || null,
          specializations: formData.specializations,
          brands_serviced: formData.brands_serviced,
          is_ev_specialist: formData.is_ev_specialist,
          opening_hours: formData.opening_hours,
          updated_at: new Date().toISOString(),
        })
        .eq('id', garage.id);

      if (error) throw error;

      await refreshGarage();
      toast({
        title: 'Profiel opgeslagen',
        description: 'Uw wijzigingen zijn succesvol opgeslagen.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Kon profiel niet opslaan.',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateOpeningHour = (
    day: keyof OpeningHours,
    field: 'open' | 'close' | 'closed',
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value,
        },
      },
    }));
  };

  const toggleSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const toggleBrand = (brand: string) => {
    setFormData((prev) => ({
      ...prev,
      brands_serviced: prev.brands_serviced.includes(brand)
        ? prev.brands_serviced.filter((b) => b !== brand)
        : [...prev.brands_serviced, brand],
    }));
  };

  if (!garage) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Garage Profiel</h1>
            <p className="text-muted-foreground">Beheer uw bedrijfsgegevens</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opslaan...
              </>
            ) : (
              'Wijzigingen opslaan'
            )}
          </Button>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-0">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{garage.average_rating?.toFixed(1) || '-'}</p>
                  <p className="text-xs text-muted-foreground">Beoordeling</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-0">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{garage.total_reviews || 0}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="general">Algemeen</TabsTrigger>
            <TabsTrigger value="specializations">Specialisaties</TabsTrigger>
            <TabsTrigger value="hours">Openingstijden</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          {/* General Information */}
          <TabsContent value="general">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Bedrijfsgegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Bedrijfsnaam</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Beschrijving</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Vertel iets over uw garage..."
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4" />
                    Adresgegevens
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Straat en huisnummer</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">Postcode</Label>
                      <Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Plaats</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Provincie</Label>
                      <Select
                        value={formData.province}
                        onValueChange={(v) => setFormData({ ...formData, province: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer provincie" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVINCES.map((prov) => (
                            <SelectItem key={prov} value={prov}>
                              {prov}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-4">
                    <Phone className="h-4 w-4" />
                    Contactgegevens
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefoonnummer</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mailadres</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specializations */}
          <TabsContent value="specializations">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Specialisaties & Merken</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Specialisaties</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {SPECIALIZATIONS.map((spec) => (
                      <label
                        key={spec}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                          formData.specializations.includes(spec)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted'
                        )}
                      >
                        <Checkbox
                          checked={formData.specializations.includes(spec)}
                          onCheckedChange={() => toggleSpecialization(spec)}
                        />
                        <span className="text-sm">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Merken die u bedient</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {CAR_BRANDS.map((brand) => (
                      <label
                        key={brand}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                          formData.brands_serviced.includes(brand)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted'
                        )}
                      >
                        <Checkbox
                          checked={formData.brands_serviced.includes(brand)}
                          onCheckedChange={() => toggleBrand(brand)}
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Switch
                    id="ev-specialist"
                    checked={formData.is_ev_specialist}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_ev_specialist: checked })
                    }
                  />
                  <Label htmlFor="ev-specialist" className="cursor-pointer">
                    <span className="font-medium">EV Specialist</span>
                    <p className="text-sm text-muted-foreground">
                      Markeer als specialist voor elektrische voertuigen
                    </p>
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Opening Hours */}
          <TabsContent value="hours">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Openingstijden
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {WEEKDAYS.map(({ key, label }) => {
                    const dayKey = key as keyof OpeningHours;
                    const hours = formData.opening_hours[dayKey];

                    return (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="w-32">
                          <span className="font-medium">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`closed-${key}`}
                            checked={hours.closed}
                            onCheckedChange={(checked) =>
                              updateOpeningHour(dayKey, 'closed', !!checked)
                            }
                          />
                          <Label htmlFor={`closed-${key}`} className="text-sm">
                            Gesloten
                          </Label>
                        </div>
                        {!hours.closed && (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={hours.open}
                              onChange={(e) =>
                                updateOpeningHour(dayKey, 'open', e.target.value)
                              }
                              className="w-32"
                            />
                            <span className="text-muted-foreground">tot</span>
                            <Input
                              type="time"
                              value={hours.close}
                              onChange={(e) =>
                                updateOpeningHour(dayKey, 'close', e.target.value)
                              }
                              className="w-32"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media */}
          <TabsContent value="media">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Logo & Foto's
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Logo</h4>
                  <div className="flex items-center gap-4">
                    {garage.logo_url ? (
                      <div className="relative">
                        <img
                          src={garage.logo_url}
                          alt="Garage logo"
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <Button variant="outline" onClick={() => logoInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Logo uploaden
                    </Button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Foto's van uw garage</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {garage.photos?.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Garage foto ${index + 1}`}
                          className="h-32 w-full rounded-lg object-cover"
                        />
                        <button className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="h-32 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Foto toevoegen</span>
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload foto's van uw werkplaats, wachtruimte en apparatuur
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
